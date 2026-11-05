// Fixed-project Management API. No generic SQL, credential logging, retries or password reset.
import path from 'node:path';
import {execFileSync} from 'node:child_process';
export const TARGET='nymrbqulweokwlaucrkv';
export const ORGANIZATION='bduopsebxkwcazbynrdm';
export const ROLES_QUERY="SELECT rolname,rolcanlogin,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolvaliduntil::text FROM pg_catalog.pg_roles ORDER BY rolname";
export function privateApiSession(){
 let raw;try{raw=execFileSync('pwsh',['-NoProfile','-File','scripts/backup/read-private-api.ps1'],{encoding:'utf8',stdio:['pipe','pipe','pipe'],maxBuffer:32768});}catch{throw Error('PRIVATE_API_UNAVAILABLE');}
 let s;try{s=JSON.parse(raw);}catch{throw Error('PRIVATE_API_FORMAT_REFUSED');}finally{raw='';}
 if(s.projectRef!==TARGET||!s.tokenScopeConfirmed||!/^sbp_fc[A-Za-z0-9._-]+$/.test(s.token)||s.token.length<20||!s.tokenExpiryStatement||!/^[a-f0-9]{64}$/.test(s.keyHex)||!s.keyRecoveredAt)throw Error('PRIVATE_API_REFUSED');
 if(JSON.stringify(s.permissions)!==JSON.stringify(['project_admin_read','database_pooling_config_read','database_write']))throw Error('TOKEN_PERMISSIONS_REFUSED');
 const expected=path.resolve(process.env.LOCALAPPDATA,'PaxSolutio/private-backups');
 if(path.resolve(s.backupDirectory)!==expected||/onedrive/i.test(expected))throw Error('PRIVATE_STORAGE_REFUSED');
 s.key=Buffer.from(s.keyHex,'hex');s.keyHex='';return s;
}
export function verifyProject(project){
 if(project.id!==TARGET||project.name!=='PaxSolutio'||project.organization_id!==ORGANIZATION||project.region!=='eu-west-1'||project.status!=='ACTIVE_HEALTHY'||project.database?.host!==`db.${TARGET}.supabase.co`)throw Error('PROJECT_IDENTITY_REFUSED');
 return {id:project.id,name:project.name,organization:project.organization_id,region:project.region,status:project.status};
}
export function poolerTarget(rows){
 if(!Array.isArray(rows))throw Error('POOLER_FORMAT_REFUSED');
 const candidates=rows.filter(x=>x.identifier===TARGET&&x.database_type==='PRIMARY'&&((x.db_port===5432&&x.pool_mode==='session')||(x.db_port===6543&&x.pool_mode==='transaction'))&&x.db_name==='postgres'&&x.db_user===`postgres.${TARGET}`&&/^aws-\d+-eu-west-1\.pooler\.supabase\.com$/.test(x.db_host));
 if(candidates.length!==1)throw Error('SESSION_POOLER_NOT_UNAMBIGUOUS');
 // The API reports the configured transaction endpoint. Supavisor officially
 // serves session mode on the same hostname at 5432; never dump through 6543.
 const x=candidates[0];return {host:x.db_host,port:5432,database:'postgres'};
}
export function rolesResult(value){
 if(!Array.isArray(value)||value.some(x=>typeof x.rolname!=='string'||typeof x.rolcanlogin!=='boolean'))throw Error('ROLE_INVENTORY_FORMAT_REFUSED');
 return value;
}
export function assertNoCliRoles(rows){if(rows.some(x=>/cli/i.test(x.rolname)))throw Error('PREEXISTING_CLI_ROLES_REFUSED');}
export function validateCredential(value){
 if(!/^cli_login_[a-z0-9_]+$/.test(value.role)||value.role.length>63||typeof value.password!=='string'||value.password.length<16||/[\0\r\n]/.test(value.password)||!Number.isInteger(value.ttl_seconds)||value.ttl_seconds<180||value.ttl_seconds>86400)throw Error('TEMPORARY_CREDENTIAL_REFUSED');
 return value;
}
export function assertExclusiveCleanup(before,after,role){
 assertNoCliRoles(before);
 if(!/^cli_login_[a-z0-9_]+$/.test(role))throw Error('CLEANUP_ROLE_REFUSED');
 const old=new Map(before.map(x=>[x.rolname,x]));
 for(const row of after){if(row.rolname===role)continue;if(!old.has(row.rolname)||JSON.stringify(row)!==JSON.stringify(old.get(row.rolname)))throw Error('CONCURRENT_ROLE_CHANGE_REFUSED');}
 if(after.filter(x=>/cli/i.test(x.rolname)).some(x=>x.rolname!==role)||before.some(x=>!after.some(y=>y.rolname===x.rolname)))throw Error('NONEXCLUSIVE_CLEANUP_REFUSED');
}
export function apiClient(token,fetcher=fetch){
 if(process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')throw Error('TLS_BYPASS_REFUSED');
 const endpoints={project:['GET',''],pooler:['GET','/config/database/pooler'],roles:['POST','/database/query'],storageInventory:['POST','/database/query'],create:['POST','/cli/login-role'],remove:['DELETE','/cli/login-role'],backups:['GET','/database/backups']};
 return async operation=>{
  if(!Object.hasOwn(endpoints,operation))throw Error('API_OPERATION_REFUSED');
  const [method,suffix]=endpoints[operation];
  const body=operation==='roles'?{query:ROLES_QUERY,read_only:true}:operation==='storageInventory'?{query:"SELECT jsonb_build_object('buckets',(SELECT COALESCE(jsonb_agg(b ORDER BY id),'[]'::jsonb) FROM storage.buckets b),'objects',(SELECT COALESCE(jsonb_agg(o ORDER BY id),'[]'::jsonb) FROM storage.objects o)) AS inventory",read_only:true}:operation==='create'?{read_only:true}:undefined;
  let response;try{response=await fetcher(`https://api.supabase.com/v1/projects/${TARGET}${suffix}`,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(30000)});}catch{throw Error('PRIVATE_API_TRANSPORT_FAILED');}
  if(!response.ok){await response.body?.cancel().catch(()=>{});throw Error(`PRIVATE_API_HTTP_${response.status}`);}
  try{return await response.json();}catch{throw Error('PRIVATE_API_RESPONSE_REFUSED');}
 };
}
export async function withTemporaryRole(s,work,{api=apiClient(s.token),record=()=>{}}={}){
 const proof={target:TARGET,at:new Date().toISOString(),readOnlyRequested:true,passwordReset:false,roleCreated:false,cleanupVerified:false};
 let before,credential,createAttempted=false;
 try{
  proof.identity=verifyProject(await api('project'));
  const endpoint=poolerTarget(await api('pooler'));proof.endpoint=endpoint;
  before=rolesResult(await api('roles'));assertNoCliRoles(before);proof.existingCliRoles=0;
  createAttempted=true;proof.creationAttemptedAt=new Date().toISOString();record(proof);
  const result=await api('create');
  // Preserve the returned role name before validating the remaining response for safe cleanup.
  credential=result;proof.roleCreated=true;proof.role=typeof result.role==='string'&&/^cli_login_[a-z0-9_]+$/.test(result.role)?result.role:null;record(proof);
  validateCredential(credential);proof.ttlSeconds=credential.ttl_seconds;
  assertExclusiveCleanup(before,rolesResult(await api('roles')),credential.role);
  const sql={...endpoint,projectRef:TARGET,user:`${credential.role}.${TARGET}`,expectedRole:credential.role,password:credential.password,key:s.key,keyRecoveredAt:s.keyRecoveredAt,backupDirectory:s.backupDirectory,temporaryRole:true};
  try{return await work(sql,proof);}finally{sql.password='';}
 }finally{
  if(credential){
   try{assertExclusiveCleanup(before,rolesResult(await api('roles')),credential.role);await api('remove');const remaining=rolesResult(await api('roles'));assertNoCliRoles(remaining);proof.cleanupVerified=true;}
   catch{proof.cleanupVerified=false;proof.cleanupNeedsReconciliation=true;}
   credential.password='';
  }else if(createAttempted){proof.creationOutcomeUnknown=true;proof.cleanupNeedsReconciliation=true;}
  proof.finishedAt=new Date().toISOString();record(proof);
  if(proof.cleanupNeedsReconciliation)throw Error('TEMPORARY_ROLE_RECONCILIATION_REQUIRED');
 }
}
export function clearApiSession(s){if(s){s.token='';s.key?.fill(0);}}
