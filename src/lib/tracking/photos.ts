import {TrackingError,text,record,type Project,type Photo} from './model';
export const PHOTO_BUCKET='pax-tracking-media';
export const MAX_PHOTOS=6,MAX_IMAGE_BYTES=2*1024*1024;
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function uuid(value:unknown):string{if(typeof value!=='string'||!UUID.test(value))throw new TrackingError(400,'Identifiant invalide.');return value;}
export function objectKey(project:string,event:string,photo:string){return `${uuid(project)}/${uuid(event)}/${uuid(photo)}.webp`;}
export function photoIn(project:Project,eventId:string,photoId:string,client=false):Photo{
 const event=project.events.find(e=>e.id===uuid(eventId));const photo=event?.photos?.find(p=>p.id===uuid(photoId));
 if(!event||!photo||client&&(!event.published||!photo.published)||photo.objectKey!==objectKey(project.id,event.id,photo.id))throw new TrackingError(404,'Photo indisponible.');
 return photo;
}
export function photoChange(raw:unknown){const v=record(raw,['projectId','eventId','photoId','version','caption','published','reviewed']);
 if(!Number.isInteger(v.version)||typeof v.published!=='boolean'||v.published&&v.reviewed!==true)throw new TrackingError(400,'Confirmez la vérification du contenu avant publication.');
 return {projectId:uuid(v.projectId),eventId:uuid(v.eventId),photoId:uuid(v.photoId),version:v.version as number,caption:text(v.caption,240),published:v.published};
}
