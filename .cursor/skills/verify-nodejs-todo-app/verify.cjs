#!/usr/bin/env node
/* global document */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const net = require('node:net');
const root = process.cwd();
const out = process.env.VERIFY_EVIDENCE_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'verify-nodejs-todo-app-'));
fs.mkdirSync(out, {recursive:true});
const evidence = {app:'nodejs-todo-app', startedAt:new Date().toISOString(), actions:[]};
const children=[];const sockets=[];
const reserve=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
function launch(cmd,args,env){const log=fs.openSync(path.join(out,`process-${children.length}.log`),'a');const child=spawn(cmd,args,{cwd:root,env:{...process.env,...env},stdio:['ignore',log,log]});fs.closeSync(log);children.push(child);child.on('error',e=>{evidence.processError=e.message;});return child;}
async function request(url, options={}) {const res=await fetch(url,{...options,signal:AbortSignal.timeout(5000)});const text=await res.text(); evidence.actions.push({method:options.method||'GET',url,status:res.status,body:text});return {status:res.status,text,json:()=>JSON.parse(text)};}
async function ready(base,route,child){for(let i=0;i<100;i++){if(evidence.processError)throw Error(evidence.processError);if(child.exitCode!==null)throw Error(`server exited ${child.exitCode}`);try{const r=await fetch(base+route,{signal:AbortSignal.timeout(300)});if(r.ok)return;}catch(e){evidence.lastReadinessError=e.message;} await new Promise(r=>setTimeout(r,100));}throw Error('readiness timeout');}
(async()=>{
  if(process.env.MONGODB_URI)throw Error('Refusing external MONGODB_URI; unset it for isolated verification');
  const port=await reserve();const base=`http://127.0.0.1:${port}`;
  const child=launch(process.execPath,['src/server.js'],{PORT:String(port),DB_NAME:'verify_'+Date.now(),MONGODB_URI:''});await ready(base,'/list',child);
  assert.equal((await request(base+'/list')).json().todos.length,0);
  const created=await request(base+'/list',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:'Verify lifecycle !high #verification @2030-01-01'})});assert.equal(created.status,201);const todo=created.json().todo;assert.equal(todo.priority,'high');assert(todo.tags.includes('verification'));
  assert((await request(base+'/list')).json().todos.some(t=>t._id===todo._id));
  const patched=await request(base+'/list/'+todo._id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status:'completed'})});assert.equal(patched.status,200);assert.equal(patched.json().todo.status,'completed');
  assert.equal((await request(base+'/list',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,400);
  assert.equal((await request(base+'/list/'+todo._id,{method:'DELETE'})).status,200);assert.equal((await request(base+'/list')).json().todos.length,0);
  const audit=(await request(base+'/audit-logs')).json();assert(audit.logs.length>=3);assert.equal((await request(base+'/audit-logs/verify')).json().status,'INTEGRITY_VERIFIED');
  evidence.boundary='Real HTTP/API and disposable MongoMemoryServer. Browser UI is separate, not inferred from API success.';
  if(process.env.VERIFY_BROWSER==='1') {
    const {chromium}=require('@playwright/test');
    const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
    try {const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base);const input=page.getByPlaceholder('Add a new mission...');await input.waitFor();await input.fill('Browser verification');await input.press('Enter');const item=page.locator('app-todo-item').filter({hasText:'Browser verification'});await item.waitFor({state:'visible'});await input.waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('app-todo-item')?.getBoundingClientRect().top>=0);await page.locator('.spinner').waitFor({state:'hidden'});await item.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'todo-created.png'),fullPage:true,animations:'disabled'});await item.locator('.custom-checkbox').click();await page.waitForFunction(()=>document.querySelector('app-todo-item .todo-content')?.classList.contains('completed'));await page.screenshot({path:path.join(out,'todo-completed.png'),fullPage:true});await page.setViewportSize({width:1280,height:900});await item.hover();await item.getByRole('button',{name:'Delete task'}).click();await item.waitFor({state:'detached'});await page.screenshot({path:path.join(out,'todo-deleted.png'),fullPage:true});assert.equal((await request(base+'/list')).json().todos.length,0);
      fs.writeFileSync(path.join(out,'final-page.txt'),await page.locator('body').innerText());
      assert.deepEqual(errors,[]);evidence.actions.push({browser:'user journey passed',initialViewport:'390x844',finalViewport:page.viewportSize(),errors});
    } finally {await browser.close();}
  }
  evidence.result='passed';
})().catch(e=>{evidence.result='failed';evidence.error=e.stack;process.exitCode=1;}).finally(async()=>{
  for(const s of sockets)s.close();
  for(const c of children.reverse()){if(c.exitCode===null){c.kill('SIGTERM');await Promise.race([new Promise(r=>c.once('exit',r)),new Promise(r=>setTimeout(r,2000))]);if(c.exitCode===null)c.kill('SIGKILL');}}
  evidence.cleaned=children.every(c=>c.exitCode!==null||c.signalCode!==null);
  fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify(evidence,null,2));
  assert(fs.existsSync(path.join(out,'evidence.json')));console.log(JSON.stringify({result:evidence.result,evidence:out,cleaned:evidence.cleaned}));
});
