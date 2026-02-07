const parseTodo = (rawContent) => {
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
  // Reset lastIndex for global regex just in case, though it's a new instance here usually.
  // Actually, tagRegex is defined locally, so it's fine.
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

  // If everything was removed (e.g. only tags were provided), keep original content?
  // The original logic said: if (!content) content = rawContent;
  if (!content) content = rawContent;

  return {
    content,
    priority,
    tags,
    dueDate
  };
};

module.exports = { parseTodo };
