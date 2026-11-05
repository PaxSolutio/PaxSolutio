import type {ClientProject} from "@/lib/tracking/model";
import {etaLabel,formatDate} from "@/lib/tracking/model";
import PhotoGallery from "./PhotoGallery";
import s from "./Tracking.module.css";
export default function ProjectView({project:p,photoBase}:{project:ClientProject;photoBase?:string}){return <div className={s.fade}>
 <div className={s.between}><div><p className={s.reference}>VOTRE PROJET · {p.reference}</p><h1 className={s.projectTitle}>{p.title}</h1></div><span className={s.status}><span className={s.dot}/>{p.closed?"Suivi clôturé":p.status}</span></div>
 <div className={s.grid} style={{marginTop:25}}><section className={s.card} aria-label="Historique du projet"><p className={s.eyebrow}>Les étapes de votre projet</p><h2>Un suivi, à chaque avancée.</h2>
 {p.events.length?<ol className={s.timeline}>{p.events.map(e=><li className={s.event} key={e.id}><time dateTime={e.date}>{formatDate(e.date)}</time><h3>{e.title}</h3><p>{e.comment}</p><PhotoGallery photos={e.photos??[]} eventId={e.id} base={photoBase}/></li>)}</ol>:<p className={s.empty}>Les premières étapes seront publiées ici par votre gestionnaire.</p>}
 <p className={s.footerNote}>Les étapes ci-dessus correspondent aux informations publiées par PaxSolutio. Aucun suivi GPS ni mise à jour automatique du transporteur.</p></section>
 <aside className={s.stack}><section className={s.eta}><p className={s.eyebrow}>Arrivée estimée</p><strong>{etaLabel(p.eta)}</strong>{p.eta.mode==="days"&&<p>{p.eta.days} jours calendaires à compter du {formatDate(p.eta.recordedOn)}.</p>}<p>Cette estimation peut évoluer. Votre gestionnaire vous informe des changements publiés.</p></section>
 <section className={s.card}><h2>Le mot de votre gestionnaire</h2><p className={s.message}>{p.message||"Votre gestionnaire complétera prochainement les informations de suivi."}</p><p className={s.update}>Dernière mise à jour : <time dateTime={p.updatedAt}>{formatDate(p.updatedAt)}</time></p></section></aside></div>
 </div>;}
