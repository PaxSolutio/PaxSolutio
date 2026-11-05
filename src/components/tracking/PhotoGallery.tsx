/* eslint-disable @next/next/no-img-element */
import type {ClientPhoto} from '@/lib/tracking/model';
import s from './Tracking.module.css';
export default function PhotoGallery({photos,eventId,base='/api/suivi/photos?'}:{photos:ClientPhoto[];eventId:string;base?:string}){
 if(!photos.length)return null;
 return <div className={s.photoGrid} aria-label="Photos de l’avancement">{photos.map((p,i)=>{
  const url=base+`eventId=${encodeURIComponent(eventId)}&photoId=${encodeURIComponent(p.id)}`;
  return <figure className={s.photoFigure} key={p.id}><a href={url} target="_blank" rel="noreferrer" aria-label={`Agrandir ${p.caption||'la photo '+(i+1)}`}><img src={url} alt={p.caption||`Photo d’avancement ${i+1}`} width={p.width} height={p.height} loading="lazy" referrerPolicy="no-referrer"/></a>{p.caption&&<figcaption>{p.caption}</figcaption>}</figure>;
 })}</div>;
}
