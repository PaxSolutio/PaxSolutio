// AES-256-GCM envelope for bounded logical backups. No network or secret storage.
// Node 22 native crypto; authentication is completed BEFORE returning plaintext.
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
const MAGIC=Buffer.from('PAXBK01\n');
export const MAX_BYTES=64*1024*1024;
export const sha256=b=>createHash('sha256').update(b).digest('hex');
function validKey(key){if(!Buffer.isBuffer(key)||key.length!==32)throw Error('A 32-byte random backup key is required');}
function validContext(c){if(!c||typeof c.source!=='string'||!c.source||c.source.length>100||typeof c.scope!=='string'||!c.scope||c.scope.length>100)throw Error('Invalid backup context');}
function checkFiles(files){
 if(!Array.isArray(files)||!files.length||files.length>8)throw Error('Invalid backup artifacts');
 const names=new Set();let total=0;
 for(const f of files){if(!f||!['database.dump','roles.sql','manifest.json','object.bin'].includes(f.name)||names.has(f.name)||!Buffer.isBuffer(f.data))throw Error('Invalid backup artifact');names.add(f.name);total+=f.data.length;}
 if(total>MAX_BYTES/2)throw Error('Backup exceeds bounded in-memory capacity');
}
export function seal(files,key,context){
 validKey(key);validContext(context);checkFiles(files);
 const meta=Buffer.from(JSON.stringify({format:'pax-backup/v1',cipher:'aes-256-gcm',source:context.source,scope:context.scope,createdAt:new Date().toISOString()}));
 const length=Buffer.alloc(4);length.writeUInt32BE(meta.length);
 const iv=randomBytes(12),header=Buffer.concat([MAGIC,length,meta,iv]);
 const plain=Buffer.from(JSON.stringify(files.map(f=>({name:f.name,sha256:sha256(f.data),data:f.data.toString('base64')}))));
 try{const cipher=createCipheriv('aes-256-gcm',key,iv,{authTagLength:16});cipher.setAAD(header);return Buffer.concat([header,cipher.update(plain),cipher.final(),cipher.getAuthTag()]);}finally{plain.fill(0);}
}
export function open(archive,key,expected){
 validKey(key);validContext(expected);
 if(!Buffer.isBuffer(archive)||archive.length<44||archive.length>MAX_BYTES||!archive.subarray(0,8).equals(MAGIC))throw Error('Invalid backup envelope');
 const n=archive.readUInt32BE(8);if(n<2||n>4096||archive.length<12+n+12+16+2)throw Error('Invalid backup header');
 const end=12+n+12,meta=JSON.parse(archive.subarray(12,12+n).toString('utf8'));
 if(meta.format!=='pax-backup/v1'||meta.cipher!=='aes-256-gcm'||meta.source!==expected.source||meta.scope!==expected.scope)throw Error('Backup context does not match the authorised source and scope');
 const decipher=createDecipheriv('aes-256-gcm',key,archive.subarray(12+n,end),{authTagLength:16});
 decipher.setAAD(archive.subarray(0,end));decipher.setAuthTag(archive.subarray(-16));
 let first,plain;
 try{
  first=decipher.update(archive.subarray(end,-16));
  const last=decipher.final(); // MUST succeed before plaintext is parsed or given to a restorer.
  plain=Buffer.concat([first,last]);last.fill(0);
  const raw=JSON.parse(plain.toString('utf8'));
  if(!Array.isArray(raw)||raw.length>8)throw Error('Invalid backup artifacts');
  const files=raw.map(f=>{if(typeof f.data!=='string')throw Error('Invalid artifact encoding');const data=Buffer.from(f.data,'base64');if(data.toString('base64')!==f.data){data.fill(0);throw Error('Noncanonical artifact encoding');}return {name:f.name,data,sha256:f.sha256};});
  try{checkFiles(files);for(const f of files)if(sha256(f.data)!==f.sha256)throw Error('Artifact checksum mismatch');return {metadata:meta,files};}catch(e){for(const f of files)f.data.fill(0);throw e;}
 }catch{throw Error('Backup rejected: authentication, format or content failed');}finally{first?.fill(0);plain?.fill(0);}
}
