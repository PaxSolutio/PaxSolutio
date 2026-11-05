import fs from 'node:fs';import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';import {execFileSync} from 'node:child_process';
import {connection,teamId,PROJECT,BASE,OLD,assertProject,save,PROOF,hash,deploymentReady} from './common.mjs';
import {privateApiSession,clearApiSession} from '../backup/temporary-api.mjs';import {encryptPrivate,decryptPrivate} from '../backup/real-common.mjs';
const proof={at:new Date().toISOString(),status:'preparing'};let session;
try{assert(!fs.existsSync(PROOF+'/stage-deployment.json'),'Existing candidate must be reconciled');const gate=JSON.parse(fs.readFileSync(PROOF+'/backup-operation.json'));assert.equal(gate.status,'passed');assert(gate.canaryRemoved&&gate.existingArchiveKeyVerified);
const original=JSON.parse(fs.readFileSync('docs/suivi-final-20261105/preuves/preview-deployment.json'));assert.equal(original.files.length,307);
for(const f of original.files)assert.equal(hash(fs.readFileSync(f.file)),f.sha256,'App drift '+f.file);
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.notEqual(commit,BASE);assert.equal(execFileSync('git',['ls-remote','origin','refs/heads/main'],{encoding:'utf8'}).trim().split(/\s/)[0],BASE);
assert.equal(JSON.parse(fs.readFileSync('vercel.json')).git.deploymentEnabled.main,false);
const {api,token}=connection(),p=await api('/v9/projects/'+PROJECT+'?teamId='+teamId);assertProject(p);assert.equal(p.targets.production.id,OLD);
const envs=(await api('/v10/projects/'+PROJECT+'/env?teamId='+teamId)).envs;
const existing=envs.filter(e=>e.target.includes('production')&&e.key.startsWith('PAX_TRACKING_'));
if(existing.length){const prior=JSON.parse(fs.readFileSync(PROOF+'/production-configuration.json'));assert(prior.environmentCreated);assert.deepEqual(existing.map(e=>e.key).sort(),prior.environmentKeys.slice().sort());session=privateApiSession();const recovered=decryptPrivate(session,prior.privateConfigurationArchive.name,'tracking-production-configuration');for(const f of recovered.files)f.data.fill(0);proof.privateConfigurationArchive=prior.privateConfigurationArchive;proof.environmentKeys=prior.environmentKeys;proof.environmentCreated=true;}else{
const values={PAX_TRACKING_MODE:'supabase',PAX_TRACKING_ACTIVATED:'true',PAX_TRACKING_PHOTOS:'true',PAX_TRACKING_SESSION_KEY:randomBytes(48).toString('hex')};
session=privateApiSession();const config=Buffer.from(JSON.stringify({project:PROJECT,environment:'production',values}));try{proof.privateConfigurationArchive=encryptPrivate(session,'tracking-config-'+randomBytes(8).toString('hex')+'.pxbak',[{name:'manifest.json',data:config}],'tracking-production-configuration');}finally{config.fill(0);}
const made=await api('/v10/projects/'+PROJECT+'/env?teamId='+teamId,{method:'POST',body:Object.entries(values).map(([key,value])=>({key,value,type:key.endsWith('SESSION_KEY')?'sensitive':'encrypted',target:['production'],comment:'Authorized tracking release 2026-11-05; server only'}))});
proof.environmentKeys=Object.keys(values);proof.environmentCreated=true;save('production-configuration',proof);values.PAX_TRACKING_SESSION_KEY='';}
// Reuse the exact digests of the existing READY Preview. No source changes and no new file upload.
assert.equal((await api('/v9/projects/'+PROJECT+'?teamId='+teamId)).targets.production.id,OLD);
proof.sourceCommit=commit;proof.artifactSha256=original.artifactHash;proof.fileCount=307;proof.productionBefore=OLD;proof.autoAssignCustomDomains=false;proof.status='creating';
save('stage-deployment',proof);
let d=await api('/v13/deployments?teamId='+teamId,{method:'POST',body:{name:'pax-solutio',project:PROJECT,target:'production',autoAssignCustomDomains:false,files:original.files.map(({file,size,sha})=>({file,size,sha})),projectSettings:{framework:'nextjs',buildCommand:'npm run build -- --webpack',installCommand:'npm ci --ignore-scripts',outputDirectory:null,rootDirectory:null,nodeVersion:p.nodeVersion},meta:{purpose:'approved-client-tracking-release',sourceCommit:commit,sourceBase:BASE,artifact:original.artifactHash}}});
proof.id=d.id;proof.url='https://'+d.url;proof.status='building';save('stage-deployment',proof);
d=await deploymentReady(api,d);assert.equal(d.target,'production');assert.equal(d.projectId,PROJECT);assert(!d.alias?.includes('paxsolutio.com')&&!d.alias?.includes('www.paxsolutio.com'));
const after=await api('/v9/projects/'+PROJECT+'?teamId='+teamId);assertProject(after);assert.equal(after.targets.production.id,OLD);
proof.status='ready-protected-staged';proof.productionUnchanged=true;proof.finishedAt=new Date().toISOString();save('stage-deployment',proof);console.log(JSON.stringify({status:proof.status,id:proof.id,url:proof.url,sourceCommit:commit}));
}catch(e){console.log(JSON.stringify({status:'blocked',code:e.code??e.status??'RELEASE_GATE_REFUSED',stage:proof.status,reason:String(e.message).split('\n')[0].slice(0,100)}));process.exitCode=1;}finally{clearApiSession(session);}
