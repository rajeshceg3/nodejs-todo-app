const {legacyIssues}=require('../../middleware/legacy-validation-errors');
const {validate,createTodoSchema,updateTodoSchema}=require('../../middleware/validation.middleware');
const {z}=require('zod');
describe('Zod4 public validation compatibility',()=>{
  test.each([{},null,[],{text:0},{text:''}])('create returns detailed400 for %j',(body)=>{
    const res={status:jest.fn().mockReturnThis(),send:jest.fn()};validate(createTodoSchema)({body},res,jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);expect(res.send.mock.calls[0][0].details.length).toBeGreaterThan(0);
  });
  test.each([{tags:[null,2]},{tags:5},{status:'bad'},{priority:'bad'},{dueDate:3}])('update detailed400 for %j',(body)=>{
    const res={status:jest.fn().mockReturnThis(),send:jest.fn()};validate(updateTodoSchema)({body},res,jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);expect(res.send.mock.calls[0][0].details.length).toBeGreaterThan(0);
  });
  test('valid values keep proceeding',()=>{
    const next=jest.fn();validate(updateTodoSchema)({body:{tags:['one'],dueDate:null}},{},next);expect(next).toHaveBeenCalledTimes(1);
  });
  test('fallback and absent paths retained',()=>{expect(legacyIssues([{code:'custom',message:'custom'}],{})).toEqual([{code:'custom',message:'custom',path:[]}]);});
  test('nonZod failures propagate',()=>{const next=jest.fn(),error=new Error('bad');validate({parse(){throw error;}})({body:{}},{},next);expect(next).toHaveBeenCalledWith(error);});
  test('union and enum preserve old field names',()=>{const r=updateTodoSchema.safeParse({dueDate:2,status:'bad'});const issues=legacyIssues(r.error.issues,{dueDate:2,status:'bad'});expect(issues.find(x=>x.code==='invalid_union').unionErrors[0].name).toBe('ZodError');expect(issues.find(x=>x.code==='invalid_enum_value').received).toBe('bad');});
  test('root undefined gives Required',()=>{const r=z.string().safeParse(undefined);expect(legacyIssues(r.error.issues,undefined)[0].message).toBe('Required');});
});
