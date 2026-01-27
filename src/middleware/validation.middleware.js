const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).send({ error: 'Validation Error', details: err.errors });
    }
    next(err);
  }
};

const createTodoSchema = z.object({
  text: z.string().min(1, 'Content cannot be empty'),
});

const updateTodoSchema = z.object({
  content: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().or(z.date()).nullable().optional()
});

module.exports = { validate, createTodoSchema, updateTodoSchema };
