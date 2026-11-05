import {createHash} from 'node:crypto';
export const STORAGE_TARGET='nymrbqulweokwlaucrkv';
export const MAX_OBJECT_BYTES=8*1024*1024;
export function normalizeStorageInventory(value){
 const row=r=>{const out={...r};for(const k of ['created_at','updated_at','last_accessed_at'])if(out[k]!=null)out[k]=new Date(out[k]).toISOString();if(out.file_size_limit!=null){const n=Number(out.file_size_limit);if(!Number.isSafeInteger(n)||n<0)throw Error('BUCKET_LIMIT_REFUSED');out.file_size_limit=n;}return out;};
 return {buckets:value.buckets.map(row),objects:value.objects.map(row)};
}
export function publicObjectUrl(bucket,name){
 const valid=s=>typeof s==='string'&&s.length>0&&s.length<=1024&&!/[\x00-\x1f\\]/.test(s)&&s.split('/').every(x=>x&&x!=='.'&&x!=='..');
 if(!valid(bucket)||bucket.includes('/')||!valid(name))throw Error('STORAGE_PATH_REFUSED');
 return `https://${STORAGE_TARGET}.supabase.co/storage/v1/object/public/${encodeURIComponent(bucket)}/${name.split('/').map(encodeURIComponent).join('/')}`;
}
export function validateInventory(inventory){
 if(!Array.isArray(inventory?.buckets)||!Array.isArray(inventory?.objects)||inventory.objects.length>500)throw Error('STORAGE_INVENTORY_REFUSED');
 const buckets=new Map(inventory.buckets.map(b=>[b.id,b]));let total=0;const ids=new Set(),paths=new Set();
 for(const o of inventory.objects){
  if(buckets.get(o.bucket_id)?.public!==true){
   const b=buckets.get(o.bucket_id);
   if(b?.id!=='pax-tracking-media'||b.public!==false||Number(b.file_size_limit)!==2097152||JSON.stringify(b.allowed_mime_types)!==JSON.stringify(['image/webp']))throw Error('PRIVATE_STORAGE_ACCESS_REQUIRED');
   validatePrivatePhoto(o);
  }
  publicObjectUrl(o.bucket_id,o.name);
  const size=Number(o.metadata?.size);
  if(!Number.isSafeInteger(size)||size<0||size>MAX_OBJECT_BYTES)throw Error('STORAGE_OBJECT_SIZE_REFUSED');
  const key=JSON.stringify([o.bucket_id,o.name]);if(!o.id||ids.has(o.id)||paths.has(key))throw Error('STORAGE_DUPLICATE_REFUSED');ids.add(o.id);paths.add(key);total+=size;
 }
 if(total>128*1024*1024)throw Error('STORAGE_TOTAL_LIMIT');return {objects:ids.size,buckets:buckets.size,bytes:total};
}
export async function downloadPublicObject(object,fetcher=fetch){
 if(process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')throw Error('TLS_BYPASS_REFUSED');
 const r=await fetcher(publicObjectUrl(object.bucket_id,object.name),{method:'GET',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(60000)});
 if(!r.ok){await r.body?.cancel().catch(()=>{});throw Error('STORAGE_DOWNLOAD_FAILED');}
 if(Number(r.headers.get('content-length')??0)>MAX_OBJECT_BYTES){await r.body?.cancel();throw Error('STORAGE_OBJECT_SIZE_REFUSED');}
 const chunks=[];let bytes=0,body;
 try{for await(const chunk of r.body){bytes+=chunk.length;if(bytes>MAX_OBJECT_BYTES)throw Error('STORAGE_OBJECT_SIZE_REFUSED');chunks.push(Buffer.from(chunk));}
  body=Buffer.concat(chunks);
  if(bytes!==Number(object.metadata?.size))throw Error('STORAGE_SIZE_MISMATCH');
  const etag=String(object.metadata?.eTag??object.metadata?.etag??'').replaceAll('"','');
  if(/^[a-f0-9]{32}$/i.test(etag)&&createHash('md5').update(body).digest('hex').toLowerCase()!==etag.toLowerCase())throw Error('STORAGE_ETAG_MISMATCH');
  return body;
 }catch(e){body?.fill(0);throw e;}finally{for(const c of chunks)c.fill(0);}
}
export function validatePrivatePhoto(object){
 const uuid='[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';
 if(object.bucket_id!=='pax-tracking-media'||!new RegExp('^'+uuid+'/'+uuid+'/'+uuid+'\\.webp$','i').test(object.name)||object.metadata?.mimetype!=='image/webp'||!Number.isSafeInteger(Number(object.metadata?.size))||Number(object.metadata.size)<12||Number(object.metadata.size)>2097152)throw Error('PRIVATE_PHOTO_REFUSED');
}
export async function downloadPrivateObject(object,credential,fetcher=fetch){
 validatePrivatePhoto(object);
 if(typeof credential!=='string'||credential.length<30)throw Error('STORAGE_CREDENTIAL_REQUIRED');
 const data=await downloadPublicObject(object,(url,options)=>fetcher(url.replace('/object/public/','/object/authenticated/'),{...options,headers:{apikey:credential,Authorization:'Bearer '+credential}}));
 if(data.subarray(0,4).toString()!=='RIFF'||data.subarray(8,12).toString()!=='WEBP'){data.fill(0);throw Error('PRIVATE_PHOTO_CONTENT_REFUSED');}
 return data;
}
