import request from 'supertest';
import app from '../src/app';
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Dashboard Module', () => {
  let adminToken: string;
  let analystToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    // Register admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dashboard Admin',
        email: 'dash-admin@example.com',
        password: 'password123',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.token;

    // Register analyst
    const analystRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dashboard Analyst',
        email: 'dash-analyst@example.com',
        password: 'password123',
        role: 'ANALYST',
      });
    analystToken = analystRes.body.data.token;

    // Register viewer
    const viewerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dashboard Viewer',
        email: 'dash-viewer@example.com',
        password: 'password123',
        role: 'VIEWER',
      });
    viewerToken = viewerRes.body.data.token;

    // Create some records for aggregation testing
    const records = [
      { amount: 10000, type: 'INCOME', category: 'Salary', date: '2025-01-15' },
      { amount: 5000, type: 'INCOME', category: 'Consulting', date: '2025-02-15' },
      { amount: 2000, type: 'EXPENSE', category: 'Rent', date: '2025-01-20' },
      { amount: 500, type: 'EXPENSE', category: 'Utilities', date: '2025-02-20' },
    ];

    for (const record of records) {
      await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(record);
    }
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return summary for any authenticated user', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('totalExpense');
      expect(res.body.data).toHaveProperty('netBalance');
      expect(res.body.data).toHaveProperty('totalRecords');
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/by-category', () => {
    it('should return category data for analyst', async () => {
      const res = await request(app)
        .get('/api/dashboard/by-category')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return category data for admin', async () => {
      const res = await request(app)
        .get('/api/dashboard/by-category')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should reject viewer access', async () => {
      const res = await request(app)
        .get('/api/dashboard/by-category')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/trends', () => {
    it('should return monthly trends for analyst', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support weekly granularity', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends?granularity=weekly')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject viewer access', async () => {
      const res = await request(app)
        .get('/api/dashboard/trends')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/recent', () => {
    it('should return recent records for any authenticated user', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent?limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });
  });
});
