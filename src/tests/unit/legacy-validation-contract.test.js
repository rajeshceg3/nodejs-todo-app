const validation = require('../../middleware/validation.middleware');
const cases = require('./legacy-validation-contract.json');
describe('Serialized Zod3 API contract fixtures', () => {
  test.each(cases.map((entry, i) => [i, entry]))('preserves fixture %i', (_i, entry) => {
    let status, payload, next = false;
    const res = {status(s) {status = s; return this;}, send(body) {payload = body; return this;}};
    validation.validate(validation[entry.schema])({body: entry.input}, res, () => {next = true;});
    expect(JSON.parse(JSON.stringify({status, body: payload, next}))).toEqual(entry.expected);
  });
});
