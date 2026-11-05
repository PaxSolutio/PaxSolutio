import sharp from 'sharp';
import {TrackingError} from './model';
import {MAX_IMAGE_BYTES} from './photos';
export async function sanitizePhoto(bytes:Uint8Array,mime:string){
 if(!['image/jpeg','image/png','image/webp'].includes(mime)||!bytes.length||bytes.length>MAX_IMAGE_BYTES)throw new TrackingError(400,'Photo JPEG, PNG ou WebP de 2 Mio maximum attendue.');
 try{
  const image=sharp(bytes,{failOn:'warning',limitInputPixels:20_000_000,animated:false});const meta=await image.metadata();
  if(!['jpeg','png','webp'].includes(meta.format??'')||`image/${meta.format}`!==mime||!meta.width||!meta.height||(meta.pages??1)!==1)throw Error('format');
  // Re-encode pixels: strips EXIF/GPS/ICC/comments; never retain the source.
  const {data,info}=await image.rotate().resize({width:1920,height:1920,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:4}).toBuffer({resolveWithObject:true});
  if(data.length>MAX_IMAGE_BYTES)throw Error('size');
  return {data,width:info.width,height:info.height,mime:'image/webp' as const};
 }catch{throw new TrackingError(400,'Image invalide, animée ou trop volumineuse.');}
}
