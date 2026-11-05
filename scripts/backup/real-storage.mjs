// Real object backup through existing public HTTPS endpoints; no Storage write.
// All object names/metadata remain encrypted. Restore uses network-none tmpfs.
import fs from 'node:fs';import path from 'node:path';import {randomUUID} from 'node:crypto';import {isDeepStrictEqual} from 'node:util';
import {privateApiSession,clearApiSession,apiClient} from './temporary-api.mjs';
import {REF,PROOF,connect,clear,save,safeCode,decryptPrivate,encryptPrivate,privateRecoveryKey} from './real-common.mjs';
import {sha256} from './archive.mjs';import {validateInventory,downloadPublicObject,downloadPrivateObject,normalizeStorageInventory} from './storage-helpers.mjs';
import {storageCredential} from '../tracking-production/common.mjs';
import {create,inspect,remove,docker} from './real-docker.mjs';
const mode=process.argv[2],run=randomUUID().replaceAll('-','').slice(0,16);
const proof={at:new Date().toISOString(),target:REF,mode,run,status:'preparing',migrationExecuted:false,storageWrites:0};
let s,archive,id,credential;const buffers=[];
const readProof=name=>JSON.parse(fs.readFileSync(path.join(PROOF,name+'.json'),'utf8'));
function checkedDecrypt(item,scope){
 if(!/^[a-z0-9-]+\.pxbak$/.test(item.name)||!/^[a-f0-9]{64}$/.test(item.sha256))throw Error('STORAGE_ARCHIVE_REFERENCE_REFUSED');
 if(sha256(fs.readFileSync(path.join(s.backupDirectory,item.name)))!==item.sha256)throw Error('STORAGE_ARCHIVE_HASH_MISMATCH');
 const a=decryptPrivate(s,item.name,scope);buffers.push(...a.files.map(f=>f.data));return a;
}
try{
 const offline=mode==='restore'&&process.argv[3]==='--key-stdin';
 if(!['backup','restore'].includes(mode)||process.argv.length!==(offline?4:3))throw Error('STORAGE_MODE_REFUSED');
 s=offline?privateRecoveryKey():privateApiSession();const db=readProof('real-backup'),restore=readProof('real-restore');
 if(db.target!==REF||db.status!=='encrypted-backup-created-restore-required'||!db.exportContainerRemoved||restore.status!=='passed'||!restore.containerRemoved||restore.archiveSHA256!==db.archive.sha256)throw Error('DATABASE_RESTORE_GATE_REQUIRED');
 proof.databaseArchiveSHA256=db.archive.sha256;
 if(mode==='backup'){
  archive=checkedDecrypt(db.archive,'database-production');
  const manifest=JSON.parse(archive.files.find(f=>f.name==='manifest.json').data.toString());
  if(manifest.source!==REF)throw Error('STORAGE_SOURCE_REFUSED');
  const inventory=manifest.storage,counts=validateInventory(inventory);proof.inventory=counts;const objects=[];
  for(const f of archive.files)f.data.fill(0);
  proof.stage='https-authenticated-private-and-public-download-encryption';
  if(inventory.objects.some(o=>o.bucket_id==='pax-tracking-media'))credential=await storageCredential();
  proof.privateObjects=inventory.objects.filter(o=>o.bucket_id==='pax-tracking-media').length;
  for(let i=0;i<inventory.objects.length;i++){
   const object=inventory.objects[i];let data;
   try{data=object.bucket_id==='pax-tracking-media'?await downloadPrivateObject(object,credential):await downloadPublicObject(object);const hash=sha256(data),name=`storage-${run}-${String(i+1).padStart(4,'0')}.pxbak`;
    const encrypted=encryptPrivate(s,name,[{name:'object.bin',data}],'storage-object');objects.push({index:i+1,metadata:object,bytes:data.length,sha256:hash,archive:encrypted});
   }finally{data?.fill(0);}
   proof.downloaded=i+1;save('storage-progress',proof);
  }
  // A new SQL snapshot checks that Storage did not change since the database
  // snapshot or during downloads. One ephemeral read-only role, no new grant.
  proof.stage='fresh-tls-snapshot-consistency';
  const rows=await apiClient(s.token)('storageInventory');
  if(!Array.isArray(rows)||rows.length!==1||!rows[0].inventory)throw Error('FRESH_STORAGE_INVENTORY_REFUSED');
  if(!isDeepStrictEqual(normalizeStorageInventory(rows[0].inventory),normalizeStorageInventory(inventory)))throw Error('STORAGE_CHANGED_SINCE_DATABASE_SNAPSHOT');
  proof.sqlSnapshotUnchanged=true;proof.freshInventoryMethod='Single read_only Management API SQL statement over verified HTTPS; no second temporary SQL login';
  const bytes=Buffer.from(JSON.stringify({version:1,source:REF,at:new Date().toISOString(),databaseArchive:db.archive,buckets:inventory.buckets,objects}));
  try{proof.index=encryptPrivate(s,`storage-index-${run}.pxbak`,[{name:'manifest.json',data:bytes}],'storage-index');}finally{bytes.fill(0);}
  proof.status='encrypted-storage-created-restore-required';
 }else{
  const backup=readProof('storage-backup');
  if(backup.status!=='encrypted-storage-created-restore-required'||!backup.sqlSnapshotUnchanged||backup.databaseArchiveSHA256!==db.archive.sha256)throw Error('STORAGE_BACKUP_GATE_REQUIRED');
  archive=checkedDecrypt(backup.index,'storage-index');const index=JSON.parse(archive.files[0].data.toString());
  if(index.source!==REF||index.databaseArchive.sha256!==db.archive.sha256)throw Error('STORAGE_INDEX_MISMATCH');
  validateInventory({buckets:index.buckets,objects:index.objects.map(o=>o.metadata)});
  id=await create(run,'restore');proof.container=id;proof.preStartInspection=true;proof.network='none';proof.publishedPorts=0;proof.restored=0;proof.bytes=0;
  for(let i=0;i<index.objects.length;i++){
   const item=index.objects[i];if(item.index!==i+1)throw Error('STORAGE_INDEX_ORDER_REFUSED');
   const a=checkedDecrypt(item.archive,'storage-object');if(a.files.length!==1||a.files[0].name!=='object.bin')throw Error('STORAGE_ARTIFACT_REFUSED');
   const data=a.files[0].data;if(data.length!==item.bytes||sha256(data)!==item.sha256)throw Error('STORAGE_CONTENT_MISMATCH');
   inspect(id,run,'restore');const dest='/tmp/storage-'+String(i+1).padStart(4,'0')+'.bin';
   docker(['exec','-i',id,'/bin/bash','-c','umask 077; cat > "$1"','storage-restore',dest],data,null);
   const hash=docker(['exec',id,'sha256sum',dest]).trim().split(/\s+/)[0];
   if(hash!==item.sha256)throw Error('STORAGE_RESTORE_CHECKSUM_MISMATCH');
   proof.restored++;proof.bytes+=data.length;data.fill(0);
  }
  proof.keyRecoveredInFreshProcess=true;proof.indexSHA256=backup.index.sha256;proof.metadataRestoredByDatabaseCheck=true;proof.status='passed';
  proof.scope='SQL metadata restored separately; all object bodies materialized and hashed in networkless tmpfs; no live Storage HTTP service started';
 }
 proof.stage='complete';
}catch(e){proof.status='blocked';proof.code=safeCode(e);process.exitCode=1;}
finally{
 for(const b of buffers)b.fill(0);credential='';clearApiSession(s);
 if(id){try{remove(id,run,'restore');proof.containerRemoved=true;}catch{proof.containerRemoved=false;proof.status='cleanup-failed';process.exitCode=1;}}
 proof.finishedAt=new Date().toISOString();save('storage-'+(mode==='restore'?'restore':'backup'),proof);console.log(JSON.stringify(proof));
}
