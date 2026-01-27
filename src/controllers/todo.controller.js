const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');
const { createAuditLog } = require('../models/audit.model');
const logger = require('../config/logger');

const createTodo = async (req, res) => {
  try {
    const rawContent = req.body.text;
    if (!rawContent) {
      return res.status(400).send({ error: 'Content cannot be empty' });
    }

    // Logic extracted from legacy index.js
    const priorityRegex = /!(critical|high|medium|low)/i;
    const tagRegex = /#(\w+)/g;
    const dueDateRegex = /@(\d{4}-\d{2}-\d{2})/;

    let priority = 'medium';
    const priorityMatch = rawContent.match(priorityRegex);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase();
    }

    const tags = [];
    let tagMatch;
    while ((tagMatch = tagRegex.exec(rawContent)) !== null) {
      tags.push(tagMatch[1]);
    }

    let dueDate = null;
    const dateMatch = rawContent.match(dueDateRegex);
    if (dateMatch) {
      dueDate = new Date(dateMatch[1]);
    }

    let content = rawContent
      .replace(priorityRegex, '')
      .replace(tagRegex, '')
      .replace(dueDateRegex, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!content) content = rawContent;

    const newTodo = {
      content,
      rawContent,
      priority,
      tags,
      dueDate,
      status: 'pending',
      createdAt: new Date()
    };

    const db = getDb();
    const result = await db.collection('list').insertOne(newTodo);

    await createAuditLog('CREATE_TASK', result.insertedId.toString(), newTodo);

    res.status(201).send({
      todo: { ...newTodo, _id: result.insertedId },
    });
  } catch (err) {
    logger.error(`Error creating todo: ${err.message}`);
    res.status(500).send({ error: 'Failed to add item to list' });
  }
};

const updateTodo = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }

    delete updates._id;

    const db = getDb();
    const result = await db.collection('list').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).send({ error: 'Todo not found' });
    }

    await createAuditLog('UPDATE_TASK', id, updates);

    res.status(200).send({ todo: result.value });
  } catch (err) {
    logger.error(`Error updating todo: ${err.message}`);
    res.status(500).send({ error: 'Failed to update item' });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid ID format' });
    }

    const db = getDb();
    const result = await db.collection('list').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ error: 'Todo not found' });
    }

    await createAuditLog('DELETE_TASK', id, { deleted: true });

    res.status(200).send({ message: 'Todo deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting todo: ${err.message}`);
    res.status(500).send({ error: 'Failed to delete item' });
  }
};

const getTodos = async (req, res) => {
  try {
    const db = getDb();
    const todos = await db.collection('list').find({}).toArray();
    res.status(200).send({ todos });
  } catch (err) {
    logger.error(`Error fetching todos: ${err.message}`);
    res.status(500).send({ error: 'Failed to fetch list' });
  }
};

module.exports = { createTodo, updateTodo, deleteTodo, getTodos };
