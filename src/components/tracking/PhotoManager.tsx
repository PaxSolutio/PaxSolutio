/* eslint-disable @next/next/no-img-element */
'use client';
import {useEffect,useState,type FormEvent} from 'react';
import type {Photo,Project} from '@/lib/tracking/model';
import {MAX_PHOTOS,MAX_IMAGE_BYTES} from '@/lib/tracking/photos';
import s from './Tracking.module.css';
function PhotoCard({photo,src,busy,onSave,onDelete}:{photo:Photo;src:string;busy:boolean;onDelete:()=>Promise<void>;onSave:(caption:string,published:boolean,reviewed:boolean)=>Promise<void>}){
 const [caption,setCaption]=useState(photo.caption),[published,setPublished]=useState(photo.published),[reviewed,setReviewed]=useState(false);
 useEffect(()=>{setCaption(photo.caption);setPublished(photo.published);setReviewed(false);},[photo.caption,photo.published]);
 return <form className={s.photoEditor} onSubmit={e=>{e.preventDefault();void onSave(caption,published,reviewed);}}>
 <a href={src} target="_blank" rel="noreferrer"><img src={src} alt={photo.caption||'Photo interne à vérifier'} width={photo.width} height={photo.height}/></a>
 <span className={s.photoTag}>{photo.published?'Visible au client si l’étape est publiée':'Interne · non publiée'}</span>
 <label>Légende facultative<input value={caption} maxLength={240} onChange={e=>setCaption(e.target.value)}/></label>
 <label className={s.check}><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/>Visible au client</label>
 {published&&<label className={s.check}><input type="checkbox" required checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>J’ai vérifié l’absence de données sensibles dans l’image et sa légende.</label>}
 <button className={s.secondary} disabled={busy}>{published?'Enregistrer la publication':'Conserver en interne'}</button>
 {photo.published&&<button type="button" className={s.danger} disabled={busy} onClick={()=>void onSave(caption,false,false)}>Retirer de la vue client</button>}
 {!photo.published&&<button type="button" className={s.danger} disabled={busy} onClick={()=>{if(window.confirm("Supprimer définitivement cette photo interne ?"))void onDelete();}}>Supprimer la photo interne</button>}
 </form>;
}
export default function PhotoManager({project,onProject,enabled}:{project:Project;onProject:(p:Project)=>Promise<void>;enabled:boolean}){
 const [eventId,setEventId]=useState(project.events.at(-1)?.id??''),[files,setFiles]=useState<File[]>([]),[urls,setUrls]=useState<string[]>([]),[caption,setCaption]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{const out=files.map(f=>URL.createObjectURL(f));setUrls(out);return()=>out.forEach(u=>URL.revokeObjectURL(u));},[files]);
 useEffect(()=>{if(!project.events.some(e=>e.id===eventId))setEventId(project.events.at(-1)?.id??'');},[project.events,eventId]);
 const event=project.events.find(e=>e.id===eventId);
 async function update(photo:Photo,text:string,published:boolean,reviewed:boolean,remove=false){setBusy(true);setError('');try{
  const r=await fetch('/api/admin/suivi/photos',{method:remove?'DELETE':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId:project.id,eventId,photoId:photo.id,version:project.version,caption:text,published,reviewed})});const d=await r.json();if(!r.ok)throw Error(d.error);await onProject(d.project);setMessage(remove?'Photo supprimée.':published?'Photo publiée.':'Photo conservée en interne ; les prochaines lectures client la refusent.');
 }catch(e){setError(e instanceof Error?e.message:'Modification impossible.');}finally{setBusy(false);}}
 async function upload(e:FormEvent){e.preventDefault();if(!event)return;setBusy(true);setError('');setMessage('');let p=project,done=0;
 try{if(!files.length||files.length+(event.photos?.length??0)>MAX_PHOTOS)throw Error('Six photos maximum par étape.');
  for(const file of files){const data=new FormData();data.set('projectId',p.id);data.set('eventId',event.id);data.set('version',String(p.version));data.set('caption',caption);data.set('file',file);
   const r=await fetch('/api/admin/suivi/photos',{method:'POST',body:data});const d=await r.json();if(!r.ok)throw Error(d.error);p=d.project;done++;await onProject(p);
  }setMessage(`${done} photo(s) enregistrée(s) en interne. Vérifiez leur contenu avant de les publier.`);
 }catch(e){setError(`${done?done+' dépôt(s) effectué(s). ':''}${e instanceof Error?e.message:'Dépôt impossible.'}`);}finally{setFiles(old=>old.slice(done));setBusy(false);}}
 return <section className={s.card}><h2>Photos d’avancement</h2><p className={s.muted}>Jusqu’à six photos ou captures par étape. Les nouveaux fichiers restent internes jusqu’à votre publication explicite. Les métadonnées GPS/EXIF sont retirées ; vérifiez aussi les visages, adresses, documents et numéros visibles dans les pixels.</p>
 {!enabled?<p className={s.notice}>Les photos nécessitent le stockage privé activé. Aucun dépôt simulé ne sera présenté comme enregistré.</p>:!project.events.length?<p className={s.notice}>Ajoutez d’abord une étape pour y associer vos photos.</p>:<div className={s.form}>
 <label>Étape des photos<select value={eventId} disabled={busy} onChange={e=>{setEventId(e.target.value);setFiles([]);}}>{project.events.map(e=><option key={e.id} value={e.id}>{e.date} · {e.title}{e.published?'':' · interne'}</option>)}</select></label>
 {!event?.published&&<p className={s.notice}>Cette étape est interne : aucune de ses photos n’apparaîtra au client.</p>}
 <form className={s.form} onSubmit={upload}><label>Photos ou captures d’écran<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy||project.closed} onChange={e=>{setError('');const picked=Array.from(e.target.files??[]);if(picked.some(f=>f.size>MAX_IMAGE_BYTES||!['image/jpeg','image/png','image/webp'].includes(f.type))){setError('JPEG, PNG ou WebP de 2 Mio maximum par fichier.');setFiles([]);}else if(picked.length+(event?.photos?.length??0)>MAX_PHOTOS){setError('Six photos maximum par étape.');setFiles([]);}else setFiles(picked);e.target.value='';}}/><small>2 Mio par fichier. Les images animées et documents PDF/SVG sont refusés.</small></label>
 {files.length>0&&<><div className={s.photoGrid}>{urls.map((url,i)=><figure key={url} className={s.photoFigure}><img src={url} alt={`Prévisualisation du fichier ${i+1}`}/><button type="button" className={s.secondary} disabled={busy} onClick={()=>setFiles(old=>old.filter((_,n)=>n!==i))}>Retirer le fichier {i+1}</button></figure>)}</div><label>Légende initiale facultative<input maxLength={240} value={caption} onChange={e=>setCaption(e.target.value)}/></label><button className={s.button} disabled={busy||project.closed}>{busy?'Enregistrement…':'Enregistrer les photos en interne'}</button></>}
 </form>
 <div className={s.photoGrid}>{event?.photos?.map(photo=><PhotoCard key={photo.id} photo={photo} src={`/api/admin/suivi/photos?projectId=${project.id}&eventId=${event.id}&photoId=${photo.id}`} busy={busy||project.closed} onSave={(a,b,c)=>update(photo,a,b,c)} onDelete={()=>update(photo,photo.caption,false,false,true)}/>)}</div>
 </div>}{error&&<p className={s.error} role="alert">{error}</p>}{message&&<p className={s.success} role="status">{message}</p>}</section>;
}
