// Fresh process, authenticated decryption, then a networkless disposable PostgreSQL restore.
// No hosted connection is made by this program. No personal rows leave the temporary database.
import fs from 'node:fs';import {randomUUID} from 'node:crypto';import {isDeepStrictEqual} from 'node:util';
import {privateSession,privateRecoveryKey,decryptPrivate,encryptPrivate,save,safeCode,clear,REF,PROOF} from './real-common.mjs';
import {capture,identifier} from './catalog.mjs';import {sha256} from './archive.mjs';
import {create,inspect,remove,docker,localSql,IMAGE} from './real-docker.mjs';
import {privateApiSession,clearApiSession} from './temporary-api.mjs';
const run=randomUUID().replaceAll('-','').slice(0,16),proof={at:new Date().toISOString(),target:REF,run,image:IMAGE,status:'preparing',migrationExecuted:false};
let s,id,archive;
try{
 if(process.argv.slice(2).some(x=>!['--api-key','--key-stdin'].includes(x))||process.argv.length>3)throw Error('RESTORE_ARGUMENT_REFUSED');
 s=process.argv.includes('--key-stdin')?privateRecoveryKey():process.argv.includes('--api-key')?privateApiSession():privateSession();const backup=JSON.parse(fs.readFileSync(PROOF+'/real-backup.json','utf8'));
 if(backup.target!==REF||backup.status!=='encrypted-backup-created-restore-required'||!backup.exportContainerRemoved)throw Error('BACKUP_PROOF_NOT_ACCEPTED');
 const raw=fs.readFileSync(s.backupDirectory+'/'+backup.archive.name);if(sha256(raw)!==backup.archive.sha256)throw Error('BACKUP_CHECKSUM_MISMATCH');
 proof.stage='authenticated-decryption';archive=decryptPrivate(s,backup.archive.name,'database-production');proof.archiveSHA256=backup.archive.sha256;proof.keyRecoveredInFreshProcess=true;
 const byName=new Map(archive.files.map(f=>[f.name,f.data]));const manifest=JSON.parse(byName.get('manifest.json').toString());if(manifest.source!==REF)throw Error('BACKUP_TARGET_MISMATCH');
 proof.stage='isolated-database';id=await create(run,'restore');proof.container=id;proof.preStartInspection=true;proof.network='none';proof.publishedPorts=0;
 docker(['exec','-i',id,'psql','-X','-h','/tmp','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-At','-q'],'CREATE DATABASE restore_check;');
 localSql(id,run,byName.get('roles.sql'));
 // PostgreSQL requires an event-trigger owner to be a superuser. Reproduce
 // ONLY provider roles already marked superuser in the encrypted snapshot,
 // ONLY in the inspected networkless disposable cluster, keeping NOLOGIN.
 const providerSuperusers=manifest.roles.filter(r=>r.rolsuper&&r.rolname!=='postgres');
 inspect(id,run,'restore');
 if(providerSuperusers.length)localSql(id,run,providerSuperusers.map(r=>`ALTER ROLE ${identifier(r.rolname)} SUPERUSER NOLOGIN;`).join('\n'));
 proof.isolatedProviderSuperusersNoLogin=providerSuperusers.length;
 proof.stage='atomic-pg-restore';inspect(id,run,'restore');
 docker(['exec','-i',id,'pg_restore','-h','/tmp','-U','postgres','-d','restore_check','--single-transaction','--exit-on-error'],byName.get('database.dump'),null,stderr=>{
  const detail=Buffer.from(JSON.stringify({operation:'isolated-pg-restore',stderr:Buffer.from(stderr??'').toString('utf8')}));
  try{proof.privateDiagnostic=encryptPrivate(s,'restore-diagnostic-'+run+'.pxbak',[{name:'manifest.json',data:detail}],'isolated-restore-diagnostic');}finally{detail.fill(0);}
 });
 proof.stage='semantic-verification';
 const query=async q=>({rows:JSON.parse(localSql(id,run,`SET timezone='UTC'; SELECT COALESCE(json_agg(result),'[]'::json) FROM (${q}) result;`))});
 const restored=await capture(query);proof.catalogMatches=isDeepStrictEqual(manifest.baseline.catalog,restored.catalog);proof.tableDataAndSequencesMatch=isDeepStrictEqual(manifest.baseline.tables,restored.tables);
 proof.tableAndSequenceCount=restored.tables.length;
 if(!proof.catalogMatches||!proof.tableDataAndSequencesMatch)throw Error('RESTORE_SEMANTIC_MISMATCH');
 proof.status='passed';proof.stage='complete';proof.roleRecreation='NOLOGIN; provider event-trigger owners retain original SUPERUSER only inside network-none disposable restore; memberships preserved';proof.storageBodiesRestored=false;
}catch(e){proof.status='blocked';proof.code=safeCode(e);process.exitCode=1;}
finally{
 for(const f of archive?.files??[])f.data.fill(0);await clear(s);clearApiSession(s);
 if(id){try{remove(id,run,'restore');proof.containerRemoved=true;}catch{proof.containerRemoved=false;proof.status='cleanup-failed';process.exitCode=1;}}
 proof.finishedAt=new Date().toISOString();save('real-restore',proof);console.log(JSON.stringify(proof));
}
