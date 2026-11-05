import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';import {checkServerIdentity,rootCertificates} from 'node:tls';
import {seal,open,sha256} from './archive.mjs';
export const REF='nymrbqulweokwlaucrkv';
export const SQL_SHA='d633868c1c961d5b338876c7a5a1f525fc1e97bfca742e2036b91d9e498ba097';
// Keep each resumption's real evidence separate from the historical failed runs.
export const PROOF=process.env.PAX_BACKUP_PROOF_DIR??'docs/suivi-production-20261105/preuves';
if(!/^docs\/suivi-production-20261105\/preuves(?:\/runs\/[a-z0-9-]+)?$/.test(PROOF))throw Error('PROOF_DIRECTORY_REFUSED');
export function providerCA(){const ca=fs.readFileSync(new URL('./supabase-prod-ca-2021.crt',import.meta.url));if(sha256(ca)!=='700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7')throw Error('PROVIDER_CA_HASH_REFUSED');return ca;}
let pgModule;
// Offline decryption/restoration needs only Node built-ins, not the SQL client
// installed in the existing laboratory. Load it only for hosted SQL operations.
export const pg={get Client(){return (pgModule??=createRequire('C:/Users/medhy/OneDrive/Documents/ChatGPT/PSBC Page web/lab/next-auth/package.json')('pg')).Client;}};
export function save(name,value){fs.mkdirSync(PROOF,{recursive:true});fs.writeFileSync(path.join(PROOF,name+'.json'),JSON.stringify(value,null,2));}
export function safeCode(e){const s=e?.code??e?.message;return typeof s==='string'&&(/^[A-Z][A-Z0-9_]{3,70}$/.test(s)||/^[0-9A-Z]{5}$/.test(s))?s:'OPERATION_FAILED_DETAILS_WITHHELD';}
export function recoveryKeySession(input){
 if(!Buffer.isBuffer(input)||input.length>66||!/^([a-fA-F0-9]{64})(\r?\n)?$/.test(input.toString()))throw Error('RECOVERY_KEY_FORMAT_REFUSED');
 return {projectRef:REF,key:Buffer.from(input.toString().trim(),'hex'),backupDirectory:path.resolve(process.env.LOCALAPPDATA,'PaxSolutio/private-backups')};
}
export function privateRecoveryKey(){
 const input=Buffer.alloc(67);let n=0;
 try{while(n<input.length){const size=fs.readSync(0,input,n,input.length-n,null);if(!size)break;n+=size;}return recoveryKeySession(input.subarray(0,n));}finally{input.fill(0);}
}
export function privateSession(){
 let raw;try{raw=execFileSync('pwsh',['-NoProfile','-File','scripts/backup/read-private-session.ps1'],{encoding:'utf8',stdio:['pipe','pipe','pipe'],maxBuffer:16384});}catch{throw Error('PRIVATE_SESSION_UNAVAILABLE');}
 const s=JSON.parse(raw);raw='';
 if(s.projectRef!==REF||s.port!==5432||s.database!=='postgres'||typeof s.password!=='string'||!s.password.length||/[\0\r\n]/.test(s.password)||!/^([a-f0-9]{64})$/.test(s.keyHex)||!s.keyRecoveredAt)throw Error('PRIVATE_SESSION_REFUSED');
 const direct=s.host===`db.${REF}.supabase.co`,pool=/^aws-\d+-eu-west-1\.pooler\.supabase\.com$/.test(s.host);
 if(!direct&&!pool||s.user!==(direct?'postgres':`postgres.${REF}`))throw Error('TARGET_REFUSED');
 const expected=path.resolve(process.env.LOCALAPPDATA,'PaxSolutio/private-backups');
 if(path.resolve(s.backupDirectory)!==expected||/onedrive/i.test(expected))throw Error('PRIVATE_STORAGE_REFUSED');
 s.key=Buffer.from(s.keyHex,'hex');s.keyHex='';return s;
}
export async function connect(s,{readOnly=true}={}){
 if(process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')throw Error('TLS_BYPASS_REFUSED');
 const direct=s.host===`db.${REF}.supabase.co`,pool=/^aws-\d+-eu-west-1\.pooler\.supabase\.com$/.test(s.host);
 const expected=s.temporaryRole?s.expectedRole:'postgres';
 if(s.temporaryRole&&(!readOnly||expected!=='cli_login_supabase_read_only_user'))throw Error('TEMPORARY_ROLE_REFUSED');
 if(s.projectRef!==REF||s.port!==5432||s.database!=='postgres'||!direct&&!pool||s.user!==(direct?expected:`${expected}.${REF}`))throw Error('SQL_TARGET_REFUSED');
 const c=new pg.Client({host:s.host,port:s.port,database:'postgres',user:s.user,password:s.password,ssl:{rejectUnauthorized:true,servername:s.host,checkServerIdentity,ca:[...rootCertificates,providerCA().toString()]},application_name:'pax-tracking-controlled-backup',connectionTimeoutMillis:15000,query_timeout:120000});c.on('error',()=>{});
 try{await c.connect();const tls=c.connection.stream;if(!tls.encrypted||!tls.authorized||checkServerIdentity(s.host,tls.getPeerCertificate()))throw Error('TLS_VERIFICATION_FAILED');
 await c.query(readOnly?'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY':'BEGIN');
 // The provider's CLI login is NOINHERIT. Select only its already-granted
 // read-only role, never postgres and never add a grant.
 if(s.temporaryRole)await c.query('SET LOCAL ROLE supabase_read_only_user');
 await c.query("SET LOCAL statement_timeout='90s'; SET LOCAL lock_timeout='5s'; SET LOCAL idle_in_transaction_session_timeout='10min'; SET LOCAL timezone='UTC'");
 const row=(await c.query("SELECT current_user,session_user,current_database() AS db,current_setting('transaction_read_only') AS ro,current_setting('server_version') AS version,(SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()) AS backend_tls")).rows[0];
 if(s.temporaryRole)save('temporary-sql-identity',{at:new Date().toISOString(),target:REF,expectedRole:expected,currentUser:row.current_user,sessionUser:row.session_user,database:row.db,readOnly:row.ro,clientTlsVerified:true,backendTls:row.backend_tls});
 if(row.current_user!==(s.temporaryRole?'supabase_read_only_user':expected)||row.session_user!==expected||row.db!=='postgres'||readOnly&&row.ro!=='on'||!row.backend_tls)throw Error('DATABASE_IDENTITY_OR_TLS_REFUSED');
 return {client:c,identity:{projectRef:REF,version:row.version,user:row.current_user,database:row.db,readOnly,clientTls:true,hostnameVerified:true,backendTls:true,certificateFingerprint:tls.getPeerCertificate().fingerprint256}};
 }catch(e){await c.end().catch(()=>{});throw e;}
}
export function encryptPrivate(s,name,files,scope){
 if(!/^[a-z0-9-]+\.pxbak$/.test(name))throw Error('PRIVATE_FILENAME_REFUSED');
 const bytes=seal(files,s.key,{source:REF,scope}),file=path.join(s.backupDirectory,name);
 fs.writeFileSync(file,bytes,{flag:'wx'});
 const reread=fs.readFileSync(file),verified=open(reread,s.key,{source:REF,scope});
 for(let i=0;i<files.length;i++){if(sha256(verified.files[i].data)!==sha256(files[i].data))throw Error('ARCHIVE_INTEGRITY_FAILED');verified.files[i].data.fill(0);}
 return {name,sha256:sha256(reread),bytes:reread.length,integrityVerified:true};
}
export function decryptPrivate(s,name,scope){if(!/^[a-z0-9-]+\.pxbak$/.test(name))throw Error('PRIVATE_FILENAME_REFUSED');return open(fs.readFileSync(path.join(s.backupDirectory,name)),s.key,{source:REF,scope});}
export function migrationBytes(){const b=fs.readFileSync('database/tracking/20261104_001_tracking.sql');if(sha256(b)!==SQL_SHA)throw Error('MIGRATION_HASH_REFUSED');return b;}
export async function clear(s,c){if(c){await c.query('ROLLBACK').catch(()=>{});await c.end().catch(()=>{});c.password=null;}if(s){s.key?.fill(0);s.password='';}}
