import {randomUUID} from 'node:crypto';
import type {Repository} from './repository';
import {TrackingError,text,type Project,type Photo} from './model';
import {MAX_PHOTOS,uuid,objectKey,photoIn,photoChange} from './photos';
import {sanitizePhoto} from './photo-image';
export interface PhotoStorage {put(key:string,data:Uint8Array):Promise<void>;remove(key:string):Promise<void>;get(key:string):Promise<Blob>;}
export class PhotoService {
 constructor(private repo:Repository,private store:PhotoStorage){}
 async project(actor:string,id:string,version?:number){const p=await this.repo.get(uuid(id),actor);if(!p)throw new TrackingError(404,'Suivi absent.');if(version!==undefined&&(p.closed||p.version!==version))throw new TrackingError(409,'Ce suivi a changé. Rechargez-le.');return p;}
 async upload(actor:string,id:string,eventId:string,version:number,bytes:Uint8Array,mime:string,caption:string){
  if(!Number.isInteger(version))throw new TrackingError(400,'Version invalide.');
  const p=await this.project(actor,id,version),event=p.events.find(e=>e.id===uuid(eventId));
  if(!event)throw new TrackingError(404,'Étape absente.');if((event.photos??[]).length>=MAX_PHOTOS)throw new TrackingError(409,'Six photos maximum par étape.');
  const cleanCaption=text(caption,240),image=await sanitizePhoto(bytes,mime),photo:Photo={id:randomUUID(),objectKey:'',caption:cleanCaption,published:false,width:image.width,height:image.height,bytes:image.data.length,mime:image.mime};
  photo.objectKey=objectKey(p.id,event.id,photo.id);
  try{await this.store.put(photo.objectKey,image.data);}finally{image.data.fill(0);}
  const next=structuredClone(p);next.events.find(e=>e.id===event.id)!.photos=[...(event.photos??[]),photo];next.version++;next.updatedAt=new Date().toISOString();
  try{await this.repo.save(next,p.version,actor,'Ajout d’une photo interne');}catch(error){
   try{await this.store.remove(photo.objectKey);}catch{throw new TrackingError(503,'Dépôt incomplet : vérification du stockage nécessaire.');}
   throw error;
  }
  return next;
 }
 async update(actor:string,raw:unknown){const v=photoChange(raw),p=await this.project(actor,v.projectId,v.version);photoIn(p,v.eventId,v.photoId);
  const next=structuredClone(p),photo=photoIn(next,v.eventId,v.photoId);photo.caption=v.caption;photo.published=v.published;next.version++;next.updatedAt=new Date().toISOString();
  await this.repo.save(next,p.version,actor,v.published?'Photo publiée au client':'Photo conservée en interne');return next;
 }
 async download(p:Project,eventId:string,photoId:string,client=false){const photo=photoIn(p,eventId,photoId,client);return this.store.get(photo.objectKey);}
 async remove(actor:string,raw:unknown){const v=photoChange(raw);if(v.published)throw new TrackingError(400,'Retirez la publication avant suppression.');const p=await this.project(actor,v.projectId,v.version),photo=photoIn(p,v.eventId,v.photoId);
  if(photo.published)throw new TrackingError(409,'Retirez la publication avant suppression.');
  // Delete the private object first. A concurrent edit may leave a missing internal image,
  // never a publicly readable orphan. Retrying removal is idempotent at Storage level.
  await this.store.remove(photo.objectKey);const next=structuredClone(p),event=next.events.find(e=>e.id===v.eventId)!;event.photos=event.photos?.filter(x=>x.id!==v.photoId);next.version++;next.updatedAt=new Date().toISOString();
  await this.repo.save(next,p.version,actor,'Suppression d’une photo interne');return next;
 }
}
