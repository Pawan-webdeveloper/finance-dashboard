import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Users Module', () => {
  let adminToken: string;
  let viewerToken: string;
  let createdUserId: string;

  beforeAll(async () => {
    // Register admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Users Admin',
        email: 'users-admin@example.com',
        password: 'password123',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.token;

    // Register viewer
    const viewerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Users Viewer',
        email: 'users-viewer@example.com',
        password: 'password123',
        role: 'VIEWER',
      });
    viewerToken = viewerRes.body.data.token;
  });

  describe('POST /api/users (Admin only)', () => {
    it('should create a user as admin', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'ANALYST',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('newuser@example.com');
      createdUserId = res.body.data.id;
    });

    it('should reject user creation by non-admin', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users (Admin only)', () => {
    it('should list all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('should reject viewing users by non-admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/:id (Admin only)', () => {
    it('should get a specific user', async () => {
      const res = await request(app)
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdUserId);
    });
  });

  describe('PATCH /api/users/:id (Admin only)', () => {
    it('should update a user', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name', status: 'INACTIVE' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.status).toBe('INACTIVE');
    });
  });

  describe('DELETE /api/users/:id (Admin only)', () => {
    it('should deactivate a user (soft delete)', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('INACTIVE');
    });
  });
});
