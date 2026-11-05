import 'server-only';
import {createServerSupabaseClient} from '@/lib/supabase/server';
import {TrackingError} from './model';
import {PHOTO_BUCKET,MAX_IMAGE_BYTES,UUID} from './photos';
import type {PhotoStorage} from './photo-service';
export class SupabasePhotoStorage implements PhotoStorage {
 private async bucket(key:string){
  if(process.env.NEXT_PUBLIC_SUPABASE_URL!=='https://nymrbqulweokwlaucrkv.supabase.co'||process.env.PAX_TRACKING_PHOTOS!=='true')throw new TrackingError(503,'Photos non activées.');
  const parts=key.split('/');if(parts.length!==3||!UUID.test(parts[0])||!UUID.test(parts[1])||!parts[2].endsWith('.webp')||!UUID.test(parts[2].slice(0,-5)))throw new TrackingError(404,'Photo indisponible.');
  const client=createServerSupabaseClient(),{data,error}=await client.storage.getBucket(PHOTO_BUCKET);
  if(error||!data||data.public||Number(data.file_size_limit)!==MAX_IMAGE_BYTES||data.allowed_mime_types?.length!==1||data.allowed_mime_types[0]!=='image/webp')throw new TrackingError(503,'Stockage privé indisponible.');
  return client.storage.from(PHOTO_BUCKET);
 }
 async put(key:string,data:Uint8Array){const b=await this.bucket(key);if(data.length>MAX_IMAGE_BYTES)throw new TrackingError(413,'Photo trop volumineuse.');const {error}=await b.upload(key,data,{contentType:'image/webp',cacheControl:'0',upsert:false});if(error)throw new TrackingError(503,'Dépôt de photo indisponible.');}
 async remove(key:string){const b=await this.bucket(key);const {error}=await b.remove([key]);if(error)throw new TrackingError(503,'Nettoyage de photo indisponible.');}
 async get(key:string){const b=await this.bucket(key),{data,error}=await b.download(key);if(error||!data)throw new TrackingError(404,'Photo indisponible.');return data;}
}
