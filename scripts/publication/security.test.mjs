import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const native=createRequire(import.meta.url);
const id='00000000-0000-4000-8000-000000000001';
function load(file, mocks={}) {
  const source=fs.readFileSync(file,'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const module={exports:{}};
  vm.runInNewContext(code,{module,exports:module.exports,require:(key)=>key in mocks?mocks[key]:key==='server-only'?{}:native(key),console,process,Buffer,Response,Request,Headers,URL,TextDecoder,Uint8Array,File},{filename:file});
  return module.exports;
}
const input=load('src/lib/admin-input.ts');
function accessFor({user={id},authError=null,member={user_id:id},memberError=null}={}) {
  let reads=0;
  const service={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>{reads++;return {data:member,error:memberError};}})})})};
  const guard=load('src/lib/admin-access.ts',{
    '@/lib/supabase/auth-server':{createAuthServerClient:async()=>({auth:{getUser:async()=>({data:{user},error:authError})}})},
    '@/lib/supabase/server':{createServerSupabaseClient:()=>service},
    '@/lib/admin-input':input,
  });
  return {...guard,reads:()=>reads};
}
const request=(body={},options={})=>new Request('https://preview.example/api/admin/offers',{
  method:'POST',headers:{origin:'https://preview.example','content-type':'application/json',...options.headers},body:JSON.stringify(body),...options});
for(const suffix of ['brief',...['actions','execute','reassess','study'].map(x=>`opportunity/${id}/${x}`),`execution/${id}/compliance/generate`]) {
  test('existing empty action remains available: '+suffix, async()=>{
    const url='https://preview.example/api/admin/intelligence/'+suffix;
    assert.equal(await input.validateAdminRequest(new Request(url,{method:'POST',headers:{origin:'https://preview.example'}})),null);
    assert.equal((await input.validateAdminRequest(new Request(url,{method:'POST'}))).status,403);
    assert.equal((await input.validateAdminRequest(new Request(url,{method:'POST',headers:{origin:'https://other.example'}}))).status,403);
    assert.equal((await accessFor({user:null}).requireAdminRequest(new Request(url,{method:'POST',headers:{origin:'https://preview.example'}}))).status,401);
    assert.equal((await accessFor({member:null}).requireAdminRequest(new Request(url,{method:'POST',headers:{origin:'https://preview.example'}}))).status,403);
  });
}
for(const [name,configuration,expected]of [
  ['anonymous',{user:null},401],['expired',{authError:{code:'expired'}},401],
  ['anonymous Supabase identity',{user:{id,is_anonymous:true}},401],
  ['authenticated without admin role',{member:null},403],
  ['forged user metadata',{user:{id,user_metadata:{role:'admin'}},member:null},403],
  ['wrong membership',{member:{user_id:'another'}},403],
  ['membership query failure',{memberError:{}},503],['current admin',{},200],
]) test('server identity/role: '+name,async()=>assert.equal(await accessFor(configuration).adminAccess(),expected));
test('membership is re-read on every operation',async()=>{const access=accessFor();await access.adminAccess();await access.adminAccess();assert.equal(access.reads(),2);});
test('revocation between operations denies next operation',async()=>{assert.equal(await accessFor().adminAccess(),200);assert.equal(await accessFor({member:null}).adminAccess(),403);});

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk('src/app/api/admin').filter(f=>f.endsWith('route.ts'))) {
  const source=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  for(const node of ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&['GET','POST','PATCH','PUT','DELETE'].includes(n.name?.text))) {
    const method=node.name.text;
    test(`${file} ${method}: guard before any business statement`,()=>assert.match(node.body.statements[0].getText(ast),/await requireAdminRequest/));
    // Exercise the actual exported handler. A denial must return before any dependency is used.
    for(const status of [401,403,503]) test(`${file} ${method}: ${status} no side effect`,async()=>{
      const blocked=new Proxy(function(){throw new Error('business dependency reached');},{get(){return blocked;},apply(){throw new Error('business dependency reached');}});
      const mocks={'@/lib/admin-access':{requireAdminRequest:async()=>Response.json({success:false},{status})}};
      for(const match of source.matchAll(/from\s+["']([^"']+)["']/g)) if(!(match[1]in mocks)&&match[1]!=='next/server')mocks[match[1]]=blocked;
      const route=load(file,mocks);
      assert.equal((await route[method](new Request('https://preview.example/api/admin/test'),{params:Promise.resolve({id})})).status,status);
    });
  }
}
for(const [name,req,expected]of [
  ['valid offer',request({title:'FICTIF',price_from:750,featured:false}),null],
  ['cross origin',request({title:'FICTIF'},{headers:{origin:'https://attacker.example','content-type':'application/json'}}),403],
  ['missing origin',request({},{headers:{'content-type':'application/json'}}),403],
  ['invalid JSON',request({}, {body:'{'}),400],
  ['oversized actual body',request({title:'FICTIF',description:'x'.repeat(270000)}),413],
  ['string boolean',request({title:'FICTIF',payment_enabled:'false'}),400],
  ['negative amount',request({title:'FICTIF',price_from:-1}),400],
  ['unsafe URL',request({title:'FICTIF',cta_url:'javascript:alert(1)'}),400],
  ['invalid identifier',request({title:'FICTIF',id:'or 1=1'}),400],
  ['prototype key',request({}, {body:'{"title":"FICTIF","__proto__":{}}'}),400],
])test('input: '+name,async()=>assert.equal((await input.validateAdminRequest(req))?.status??null,expected));
test('disguised HTML rejected as image',()=>assert.equal(input.imageExtension(new TextEncoder().encode('<html><script>alert(1)</script>'),'image/png'),null));
test('PNG canonical extension determined from content',()=>assert.equal(input.imageExtension(new Uint8Array([137,80,78,71,13,10,26,10,...Array(20).fill(0)]),'image/png'),'png'));
test('all privileged server pages guard before reading data',()=>{
  for(const file of walk('src/app/admin').filter(f=>f.endsWith('page.tsx')&&!f.includes(`${path.sep}login${path.sep}`))){
    const source=fs.readFileSync(file,'utf8');
    assert.match(source,/await requireAdminPage\(\)/,file);
  }
});

for(const [name,configuration,status,writes]of [['anonymous',{user:null},401,0],['non-admin',{member:null},403,0],['authorized admin',{},200,1]]) {
  test('actual offers POST + real access guard: '+name,async()=>{
    let count=0;
    const database={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})}),insert:payload=>{count++;return {select:()=>({single:async()=>({data:{id,...payload},error:null})})};}})};
    const route=load('src/app/api/admin/offers/route.ts',{
      '@/lib/admin-access':accessFor(configuration),
      '@/lib/supabase/server':{createServerSupabaseClient:()=>database}
    });
    assert.equal((await route.POST(request({title:'FICTIF ISOLÉ',slug:'fictif-isole',payment_enabled:false}))).status,status);
    assert.equal(count,writes);
  });
}
