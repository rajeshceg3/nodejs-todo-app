const { parseTodo } = require('../../utils/todo.parser');

describe('Todo Parser Unit Tests', () => {
  it('should parse simple content', () => {
    const raw = 'Buy milk';
    const result = parseTodo(raw);
    expect(result.content).toBe('Buy milk');
    expect(result.priority).toBe('medium');
    expect(result.tags).toEqual([]);
    expect(result.dueDate).toBeNull();
  });

  it('should parse priority !high', () => {
    const raw = 'Buy milk !high';
    const result = parseTodo(raw);
    expect(result.content).toBe('Buy milk');
    expect(result.priority).toBe('high');
  });

  it('should parse priority !CRITICAL (case insensitive)', () => {
    const raw = 'Buy milk !CRITICAL';
    const result = parseTodo(raw);
    expect(result.content).toBe('Buy milk');
    expect(result.priority).toBe('critical');
  });

  it('should parse tags #home #urgent', () => {
    const raw = 'Buy milk #home #urgent';
    const result = parseTodo(raw);
    expect(result.content).toBe('Buy milk');
    expect(result.tags).toEqual(['home', 'urgent']);
  });

  it('should parse due date @2023-10-27', () => {
    const raw = 'Buy milk @2023-10-27';
    const result = parseTodo(raw);
    expect(result.content).toBe('Buy milk');
    expect(result.dueDate).toEqual(new Date('2023-10-27'));
  });

  it('should parse complex input with all fields', () => {
    const raw = 'Finish report !high #work #urgent @2023-12-31';
    const result = parseTodo(raw);
    expect(result.content).toBe('Finish report');
    expect(result.priority).toBe('high');
    expect(result.tags).toEqual(['work', 'urgent']);
    expect(result.dueDate).toEqual(new Date('2023-12-31'));
  });

  it('should clean up extra spaces', () => {
    const raw = '  Task   !medium   #tag  ';
    const result = parseTodo(raw);
    expect(result.content).toBe('Task');
    expect(result.priority).toBe('medium');
    expect(result.tags).toEqual(['tag']);
  });

  it('should default to medium priority if not specified', () => {
    const raw = 'Task';
    const result = parseTodo(raw);
    expect(result.priority).toBe('medium');
  });

  it('should keep raw content if parsing removes everything', () => {
    const raw = '!high #tag @2023-01-01';
    const result = parseTodo(raw);
    // If only metadata provided, content should be the raw string as per original logic
    expect(result.content).toBe('!high #tag @2023-01-01');
    expect(result.priority).toBe('high');
    expect(result.tags).toEqual(['tag']);
    expect(result.dueDate).toEqual(new Date('2023-01-01'));
  });

  it('should handle mixed order', () => {
    const raw = '#tag1 !low Task @2023-05-05 #tag2';
    const result = parseTodo(raw);
    expect(result.content).toBe('Task');
    expect(result.priority).toBe('low');
    expect(result.tags).toEqual(['tag1', 'tag2']);
    expect(result.dueDate).toEqual(new Date('2023-05-05'));
  });
});
