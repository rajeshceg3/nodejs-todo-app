const z = require('zod');

const createTodoSchema = z.object({
  text: z.string().min(1, { message: "Content cannot be empty" })
});

const updateTodoSchema = z.object({
  content: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  status: z.enum(['pending', 'completed']).optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  isTemp: z.boolean().optional(),
  rawContent: z.string().optional(),
  createdAt: z.union([z.string(), z.date()]).optional()
});

module.exports = { createTodoSchema, updateTodoSchema };
