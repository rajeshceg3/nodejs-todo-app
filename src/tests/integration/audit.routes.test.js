const request = require('supertest');
const app = require('../../app');
const { connectDB, closeDB, getDb } = require('../../config/db');
const { createAuditLog } = require('../../models/audit.model');

describe('Audit Routes Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    const db = getDb();
    await db.collection('audit_log').deleteMany({});
  });

  describe('GET /audit-logs', () => {
    it('should return empty list initially', async () => {
      const res = await request(app).get('/audit-logs');
      expect(res.statusCode).toBe(200);
      expect(res.body.logs).toEqual([]);
    });

    it('should return logs after creation', async () => {
      await createAuditLog('TEST_ACTION', '123', { data: 'test' });

      const res = await request(app).get('/audit-logs');
      expect(res.statusCode).toBe(200);
      expect(res.body.logs.length).toBe(1);
      expect(res.body.logs[0].action).toBe('TEST_ACTION');
    });
  });

  describe('GET /audit-logs/verify', () => {
    it('should verify integrity successfully', async () => {
      await createAuditLog('TEST_ACTION', '123', { data: 'test' });

      const res = await request(app).get('/audit-logs/verify');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('INTEGRITY_VERIFIED');
      expect(res.body.count).toBe(1);
    });
  });
});
