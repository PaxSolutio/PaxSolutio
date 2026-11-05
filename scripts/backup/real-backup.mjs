// Real hosted READ ONLY export. This program contains no hosted write or migration path.
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {privateSession,connect,encryptPrivate,save,safeCode,clear,REF,migrationBytes} from './real-common.mjs';
import {capture,identifier} from './catalog.mjs';
import {create,remove,remoteDump,IMAGE} from './real-docker.mjs';
export async function exportDatabase(s){
let c,id,dump,rolesBytes,manifestBytes;const run=randomUUID().replaceAll('-','').slice(0,16);
const proof={at:new Date().toISOString(),target:REF,run,status:'preparing',image:IMAGE,migrationExecuted:false,stage:'private-access'};
try{
 migrationBytes();proof.keyRecoveryVerified=!!s.keyRecoveredAt;
 proof.stage='tls-connection';const connection=await connect(s);c=connection.client;proof.identity=connection.identity;
 // pg_dump must see every row: do not silently accept a policy-filtered export.
 await c.query('SET LOCAL row_security=off');
 const tracking=(await c.query("SELECT count(*)::int AS tables, bool_and(relrowsecurity AND relforcerowsecurity) AS protected FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='pax_tracking' AND c.relkind='r'")).rows[0];
 if(tracking.tables!==5||!tracking.protected)throw Error('INSTALLED_TRACKING_SCHEMA_REFUSED');
 const snapshot=(await c.query('SELECT pg_export_snapshot() AS snapshot')).rows[0].snapshot;
 proof.stage='consistent-catalog-and-fingerprints';const baseline=await capture(q=>c.query(q));
 const roles=(await c.query("SELECT rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls FROM pg_roles WHERE rolname !~ '^pg_' ORDER BY rolname")).rows.filter(r=>!s.temporaryRole||r.rolname!==s.expectedRole);
 const memberships=(await c.query('SELECT pg_get_userbyid(roleid) AS role,pg_get_userbyid(member) AS member,admin_option,inherit_option,set_option FROM pg_auth_members')).rows.filter(m=>!s.temporaryRole||m.role!==s.expectedRole&&m.member!==s.expectedRole);
 const extensions=(await c.query('SELECT extname,extversion,extnamespace::regnamespace::text AS schema,extconfig FROM pg_extension ORDER BY extname')).rows;
 const foreignTables=(await c.query('SELECT foreign_table_schema,foreign_table_name FROM information_schema.foreign_tables')).rows;
 // Object inventory is encrypted and belongs to the same exported SQL snapshot.
 // Never write object keys or owners into the public evidence.
 const storage={buckets:(await c.query('SELECT * FROM storage.buckets ORDER BY id')).rows,objects:(await c.query('SELECT * FROM storage.objects ORDER BY id')).rows};
 // Roles in the isolated restore deliberately have NOLOGIN, no password and no superuser/replication powers.
 rolesBytes=Buffer.from(roles.filter(r=>r.rolname!=='postgres').map(r=>`CREATE ROLE ${identifier(r.rolname)} NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION ${r.rolinherit?'INHERIT':'NOINHERIT'} ${r.rolbypassrls?'BYPASSRLS':'NOBYPASSRLS'};`).join('\n')+'\n'+memberships.map(m=>`GRANT ${identifier(m.role)} TO ${identifier(m.member)} WITH ADMIN ${m.admin_option?'TRUE':'FALSE'}, INHERIT ${m.inherit_option?'TRUE':'FALSE'}, SET ${m.set_option?'TRUE':'FALSE'};`).join('\n'));
 const manifest={version:1,source:REF,at:new Date().toISOString(),identity:connection.identity,snapshot,baseline,roles,memberships,extensions,foreignTables,storage,
  exclusions:['Storage object bodies: SQL metadata only; separate object backup required for full project recovery','Provider settings, SMTP/OAuth configuration, JWT signing keys, Edge Functions and their secrets','PostgreSQL role passwords and provider encryption root keys','Extension-owned contents other than pg_dump extconfig data; inspect extension dependencies','External services and foreign table remote contents'],
  restoreRoleSafety:'Owner role names, memberships and BYPASSRLS preserved; all recreated roles NOLOGIN NOSUPERUSER; original flags inventoried for provider-assisted recovery',transientBackupRoleExcluded:s.temporaryRole?s.expectedRole:null};
 proof.stage='export-container';id=await create(run,'export');proof.exportContainer=id;proof.exportPreStartInspection=true;proof.exportPublishedPorts=0;
 proof.stage='pg-dump-read-only';dump=remoteDump(id,run,s,snapshot);manifestBytes=Buffer.from(JSON.stringify(manifest));
 proof.stage='authenticated-encryption';proof.archive=encryptPrivate(s,'database-'+run+'.pxbak',[{name:'database.dump',data:dump},{name:'roles.sql',data:rolesBytes},{name:'manifest.json',data:manifestBytes}],'database-production');
 proof.tableAndSequenceCount=baseline.tables.length;proof.storageBodyBackup=false;proof.authAndStorageSQL=baseline.tables.some(t=>t.schema==='auth')&&baseline.tables.some(t=>t.schema==='storage');
 proof.status='encrypted-backup-created-restore-required';proof.stage='complete';
}catch(e){proof.status='blocked';proof.code=safeCode(e);}
finally{
 dump?.fill(0);rolesBytes?.fill(0);manifestBytes?.fill(0);await clear(null,c);
 if(id){try{remove(id,run,'export');proof.exportContainerRemoved=true;}catch{proof.exportContainerRemoved=false;proof.status='cleanup-failed';}}
 proof.finishedAt=new Date().toISOString();save('real-backup',proof);
}
return proof;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 let s;try{s=privateSession();const proof=await exportDatabase(s);console.log(JSON.stringify(proof));if(proof.status!=='encrypted-backup-created-restore-required')process.exitCode=1;}catch(e){console.log(JSON.stringify({status:'blocked',code:safeCode(e),migrationExecuted:false}));process.exitCode=1;}finally{await clear(s);}
}
