const request = require('supertest');
const app = require('../app');
const { connectDB, closeDB, getDb } = require('../config/db');

describe('API Endpoints Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Connect to the in-memory database
    await connectDB();
  });

  afterAll(async () => {
    // Clean up and close connection
    await closeDB();
  });

  beforeEach(async () => {
    // Clear the collection before each test to ensure isolation
    const db = getDb();
    await db.collection('list').deleteMany({});
  });

  describe('GET /list', () => {
    it('should return an empty list initially', async () => {
      const res = await request(app).get('/list');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ todos: [] });
    });
  });

  describe('POST /list', () => {
    it('should create a new todo', async () => {
      const res = await request(app)
        .post('/list')
        .send({ text: 'Mission Critical Task' });

      expect(res.statusCode).toBe(201);
      expect(res.body.todo).toHaveProperty('_id');
      expect(res.body.todo.content).toBe('Mission Critical Task');
      expect(res.body.todo.status).toBe('pending');
    });

    it('should fail if text is missing', async () => {
      const res = await request(app)
        .post('/list')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /list/:id', () => {
    it('should update a todo status', async () => {
      // First create one
      const createRes = await request(app)
        .post('/list')
        .send({ text: 'Update Target' });

      const todoId = createRes.body.todo._id;

      // Now update
      const res = await request(app)
        .patch(`/list/${todoId}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.todo.status).toBe('completed');
    });
  });

  describe('DELETE /list/:id', () => {
    it('should delete a todo', async () => {
      // First create one
      const createRes = await request(app)
        .post('/list')
        .send({ text: 'Delete Target' });

      const todoId = createRes.body.todo._id;

      // Now delete
      const res = await request(app)
        .delete(`/list/${todoId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Todo deleted successfully' });

      // Verify it's gone
      const getRes = await request(app).get('/list');
      const found = getRes.body.todos.find(t => t._id === todoId);
      expect(found).toBeUndefined();
    });
  });
});
