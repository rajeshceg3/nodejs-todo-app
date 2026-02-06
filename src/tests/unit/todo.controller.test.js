const { createTodo, updateTodo, deleteTodo, getTodos } = require('../../controllers/todo.controller');
const { getDb } = require('../../config/db');
const { createAuditLog } = require('../../models/audit.model');
const logger = require('../../config/logger');
const { ObjectId } = require('mongodb');

// Mock dependencies
jest.mock('../../config/db');
jest.mock('../../models/audit.model');
jest.mock('../../config/logger');

describe('Todo Controller Unit Tests', () => {
  let mockReq, mockRes, mockDb, mockCollection;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    mockCollection = {
      insertOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn()
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    };

    getDb.mockReturnValue(mockDb);
    createAuditLog.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTodo', () => {
    it('should create a todo successfully', async () => {
      mockReq.body = { text: 'Test Mission' };
      const mockInsertId = new ObjectId();
      mockCollection.insertOne.mockResolvedValue({ insertedId: mockInsertId });

      await createTodo(mockReq, mockRes);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Test Mission',
        status: 'pending'
      }));
      expect(createAuditLog).toHaveBeenCalledWith('CREATE_TASK', mockInsertId.toString(), expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({
        todo: expect.objectContaining({ _id: mockInsertId })
      }));
    });

    it('should return 400 for invalid input', async () => {
      mockReq.body = {}; // Missing text

      await createTodo(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      mockReq.body = { text: 'Test Mission' };
      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));

      await createTodo(mockReq, mockRes);

      expect(logger.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo successfully', async () => {
      const id = new ObjectId().toString();
      mockReq.params.id = id;
      mockReq.body = { status: 'completed' };

      mockCollection.findOneAndUpdate.mockResolvedValue({ value: { _id: new ObjectId(id), status: 'completed' } });

      await updateTodo(mockReq, mockRes);

      expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
      expect(createAuditLog).toHaveBeenCalledWith('UPDATE_TASK', id, expect.objectContaining({ status: 'completed' }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid ID', async () => {
      mockReq.params.id = 'invalid-id';
      mockReq.body = { status: 'completed' };

      await updateTodo(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid ID format' }));
    });

    it('should return 404 if todo not found', async () => {
      const id = new ObjectId().toString();
      mockReq.params.id = id;
      mockReq.body = { status: 'completed' };

      mockCollection.findOneAndUpdate.mockResolvedValue({ value: null });

      await updateTodo(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo successfully', async () => {
      const id = new ObjectId().toString();
      mockReq.params.id = id;

      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await deleteTodo(mockReq, mockRes);

      expect(mockCollection.deleteOne).toHaveBeenCalled();
      expect(createAuditLog).toHaveBeenCalledWith('DELETE_TASK', id, { deleted: true });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if todo not found', async () => {
      const id = new ObjectId().toString();
      mockReq.params.id = id;

      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await deleteTodo(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
