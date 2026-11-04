// Preserve the existing public validation error shape while migrating Zod.
function legacyIssues(issues, input, prefix = []) {
  const invalidPaths = new Set(issues.filter((issue) => issue.code === 'invalid_type')
    .map((issue) => JSON.stringify(issue.path)));
  return issues.filter((issue) => issue.code === 'invalid_type' ||
    !invalidPaths.has(JSON.stringify(issue.path))).map((issue) => {
    const path = prefix.concat(issue.path || []);
    const value = path.reduce((at, key) => at?.[key], input);
    const received = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    if (issue.code === 'invalid_type') return {
      code: 'invalid_type', expected: issue.expected, received, path,
      message: received === 'undefined' ? 'Required' : `Expected ${issue.expected}, received ${received}`
    };
    if (issue.code === 'invalid_value' && issue.values) {
      const expected = issue.values.map((item) => `'${item}'`).join(' | ');
      if (typeof value !== 'string') return { expected, received, code: 'invalid_type', path,
        message: received === 'undefined' ? 'Required' : `Expected ${expected}, received ${received}` };
      return { received: value, code: 'invalid_enum_value', options: issue.values, path,
        message: `Invalid enum value. Expected ${expected}, received '${value}'` };
    }
    if (issue.code === 'too_small') return {
      code: issue.code, minimum: issue.minimum, type: issue.origin,
      inclusive: issue.inclusive, exact: false, message: issue.message, path
    };
    if (issue.code === 'invalid_union') return {
      code: issue.code, unionErrors: issue.errors.map((branch) => ({
        issues: legacyIssues(branch, input, path), name: 'ZodError'
      })), path, message: issue.message
    };
    return {...issue, path};
  });
}
module.exports = { legacyIssues };
