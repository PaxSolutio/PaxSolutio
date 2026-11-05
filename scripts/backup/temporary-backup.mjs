// Only the explicitly authorized temporary access creation/cleanup can write remotely here.
// No tracking migration or commercial mutation exists in this runner.
import fs from 'node:fs';
import {privateApiSession,clearApiSession,apiClient,verifyProject,poolerTarget,rolesResult,assertNoCliRoles,withTemporaryRole} from './temporary-api.mjs';
import {exportDatabase} from './real-backup.mjs';
import {connect,clear,save,safeCode,REF,migrationBytes} from './real-common.mjs';
const mode=process.argv[2];
const proof={at:new Date().toISOString(),target:REF,mode,status:'preparing',migrationExecuted:false,passwordReset:false};
let s;
try{
 if(!['preflight','export'].includes(mode))throw Error('RUN_MODE_REFUSED');
 const plan=JSON.parse(fs.readFileSync('deployment/tracking/backup-authorization.json','utf8').replace(/^\uFEFF/,''));
 if(plan.target!==REF||!plan.authorization||!plan.status.startsWith('authorized'))throw Error('EXPLICIT_AUTHORIZATION_REQUIRED');
 migrationBytes();s=privateApiSession();const api=apiClient(s.token);
 if(mode==='preflight'){
  proof.identity=verifyProject(await api('project'));proof.endpoint=poolerTarget(await api('pooler'));assertNoCliRoles(rolesResult(await api('roles')));
  proof.status='read-only-preflight-passed';proof.remoteWrites=0;proof.existingCliRoles=0;
 }else{
  await withTemporaryRole(s,async(sql,roleProof)=>{
   let c;try{
    let session;
    // Provider CLI also allows short propagation delays. Keep one credential,
    // never remint it during retries and never remove provider network bans.
    proof.connectionAttempts=[];
    for(let attempt=1;attempt<=3;attempt++){
     try{session=await connect(sql);proof.connectionAttempts.push({attempt,connected:true});break;}
     catch(e){proof.connectionAttempts.push({attempt,code:safeCode(e)});save('temporary-backup-progress',proof);if(!['28P01','42704'].includes(e.code)||attempt===3)throw e;await new Promise(resolve=>setTimeout(resolve,attempt===1?5000:15000));}
    }
    c=session.client;proof.identity=session.identity;
    const flags=(await c.query("SELECT rolsuper,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname=current_user")).rows[0];
    const coverage=(await c.query("SELECT count(*)::int AS tables,count(*) FILTER(WHERE NOT has_table_privilege(c.oid,'SELECT'))::int AS unreadable,count(*) FILTER(WHERE row_security_active(c.oid))::int AS policy_filtered,count(*) FILTER(WHERE has_table_privilege(c.oid,'INSERT,UPDATE,DELETE,TRUNCATE'))::int AS writable FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind IN ('r','p') AND n.nspname !~ '^pg_' AND n.nspname<>'information_schema'")).rows[0];
    proof.roleCapabilities={...flags,...coverage};save('temporary-backup-progress',proof);
    if(!flags||flags.rolsuper||flags.rolcreaterole||flags.rolcreatedb||coverage.unreadable||coverage.policy_filtered||coverage.writable)throw Error('READ_ONLY_COMPLETE_COVERAGE_NOT_VERIFIED');
   }finally{await clear(null,c);}
   proof.backup=await exportDatabase(sql);
   if(proof.backup.status!=='encrypted-backup-created-restore-required')throw Error('REAL_EXPORT_FAILED');
  },{api,record:p=>save('temporary-role',p)});
  proof.status='encrypted-database-backup-created-restore-and-storage-pending';
 }
}catch(e){proof.status='blocked';proof.code=safeCode(e);process.exitCode=1;}
finally{clearApiSession(s);proof.finishedAt=new Date().toISOString();save('temporary-backup-'+(mode==='preflight'?'preflight':'export'),proof);console.log(JSON.stringify(proof));}
