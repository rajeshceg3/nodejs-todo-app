const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');
const auditController = require('../controllers/audit.controller');
const { validate, createTodoSchema, updateTodoSchema } = require('../middleware/validation.middleware');

// Todo Routes
router.get('/list', todoController.getTodos);
router.post('/list', validate(createTodoSchema), todoController.createTodo);
router.patch('/list/:id', validate(updateTodoSchema), todoController.updateTodo);
router.delete('/list/:id', todoController.deleteTodo);

// Audit Routes
router.get('/audit-logs', auditController.getAuditLogs);
router.get('/audit-logs/verify', auditController.verifyAuditLogs);

module.exports = router;
