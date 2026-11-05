// Offline only: authenticate the complete current backup set using a stdin key.
import fs from 'node:fs';import path from 'node:path';
import {REF,PROOF,privateRecoveryKey,decryptPrivate,save,safeCode,clear} from './real-common.mjs';import {sha256} from './archive.mjs';
let s;const proof={at:new Date().toISOString(),target:REF,status:'preparing',providerCredentialsRequired:false,networkRequests:0};
try{
 if(process.argv.length!==3||process.argv[2]!=='--key-stdin')throw Error('RECOVERY_ARGUMENT_REFUSED');
 s=privateRecoveryKey();let count=0;const check=(item,scope)=>{
  if(!/^[a-z0-9-]+\.pxbak$/.test(item.name))throw Error('RECOVERY_ARCHIVE_REFUSED');
  if(sha256(fs.readFileSync(path.join(s.backupDirectory,item.name)))!==item.sha256)throw Error('RECOVERY_HASH_MISMATCH');
  const a=decryptPrivate(s,item.name,scope);count++;return a;
 };
 const db=JSON.parse(fs.readFileSync(PROOF+'/real-backup.json'));const storage=JSON.parse(fs.readFileSync(PROOF+'/storage-backup.json'));
 let a=check(db.archive,'database-production');for(const f of a.files)f.data.fill(0);
 a=check(storage.index,'storage-index');let index;try{index=JSON.parse(a.files[0].data.toString());}finally{for(const f of a.files)f.data.fill(0);}
 if(index.source!==REF||index.databaseArchive.sha256!==db.archive.sha256)throw Error('RECOVERY_INDEX_MISMATCH');
 for(const o of index.objects){a=check(o.archive,'storage-object');try{if(a.files.length!==1||a.files[0].data.length!==o.bytes||sha256(a.files[0].data)!==o.sha256)throw Error('RECOVERY_OBJECT_MISMATCH');}finally{for(const f of a.files)f.data.fill(0);}}
 proof.archivesAuthenticated=count;proof.storageObjects=index.objects.length;proof.status='passed';
}catch(e){proof.status='blocked';proof.code=safeCode(e);process.exitCode=1;}
finally{await clear(s);save('offline-key-recovery',proof);console.log(JSON.stringify(proof));}
