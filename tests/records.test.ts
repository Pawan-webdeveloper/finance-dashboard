import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Records Module', () => {
  let adminToken: string;
  let viewerToken: string;
  let recordId: string;

  beforeAll(async () => {
    // Register admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Records Admin',
        email: 'records-admin@example.com',
        password: 'password123',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.token;

    // Register viewer
    const viewerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Records Viewer',
        email: 'records-viewer@example.com',
        password: 'password123',
        role: 'VIEWER',
      });
    viewerToken = viewerRes.body.data.token;
  });

  describe('POST /api/records (Admin only)', () => {
    it('should create a record as admin', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: 5000.50,
          type: 'INCOME',
          category: 'Salary',
          date: '2025-01-15',
          notes: 'Monthly salary',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.category).toBe('Salary');
      recordId = res.body.data.id;
    });

    it('should reject record creation by viewer', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 100,
          type: 'EXPENSE',
          category: 'Office',
          date: '2025-01-15',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid amount', async () => {
      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100,
          type: 'INCOME',
          category: 'Test',
          date: '2025-01-15',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/records', () => {
    it('should list records for any authenticated user', async () => {
      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/records?type=INCOME')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((r: any) => r.type === 'INCOME')).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/records');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/records/:id', () => {
    it('should get a specific record', async () => {
      const res = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(recordId);
    });

    it('should return 404 for non-existent record', async () => {
      const res = await request(app)
        .get('/api/records/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/records/:id (Admin only)', () => {
    it('should update a record as admin', async () => {
      const res = await request(app)
        .patch(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Updated notes' });

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toBe('Updated notes');
    });

    it('should reject update by viewer', async () => {
      const res = await request(app)
        .patch(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ notes: 'Hacked notes' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/records/:id (Admin only, soft delete)', () => {
    it('should soft delete a record as admin', async () => {
      const res = await request(app)
        .delete(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isDeleted).toBe(true);
    });

    it('should not find soft-deleted record', async () => {
      const res = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
