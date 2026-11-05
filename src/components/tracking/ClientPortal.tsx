"use client";
import {useEffect,useState,type FormEvent} from "react";
import type {ClientProject} from "@/lib/tracking/model";
import ProjectView from "./ProjectView";
import s from "./Tracking.module.css";
export default function ClientPortal({initial,demonstration,disabled,preview=false}:{initial:ClientProject|null;demonstration:boolean;disabled:boolean;preview?:boolean}){
 const [project,setProject]=useState(initial),[reference,setReference]=useState(""),[code,setCode]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function load(){const r=await fetch("/api/suivi",{cache:"no-store",credentials:"same-origin"});const d=await r.json();if(!r.ok)throw Error(d.error||"Accès indisponible.");setProject(d.project);}
 async function login(value:Record<string,string>){setBusy(true);setError("");try{const r=await fetch("/api/suivi",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(value),credentials:"same-origin"});const d=await r.json();if(!r.ok)throw Error(d.error||"Accès indisponible.");setCode("");await load();}catch(e){setError(e instanceof Error?e.message:"Accès indisponible.");}finally{setBusy(false);}}
 useEffect(()=>{
  // Fragment never reaches HTTP logs/referrer. Remove it before any exchange;
  // this route has no analytics, external images, fonts or third-party scripts.
  function consumeFragment(){
   const fragment=location.hash;
   history.replaceState(null,"",location.pathname+location.search);
   if(disabled||demonstration)return false;
   const token=new URLSearchParams(fragment.slice(1)).get("acces");
   if(token){void login({token});return true;}return false;
  }
  if(!consumeFragment()&&!disabled&&!demonstration)void load().catch(()=>{});
  // Pasting a link into an already-open portal can be a same-document
  // navigation. Consume that fragment too, without persisting it anywhere.
  const changed=()=>{if(location.hash)consumeFragment();};
  addEventListener("hashchange",changed);
  return()=>removeEventListener("hashchange",changed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 async function submit(e:FormEvent){e.preventDefault();await login({reference,code});}
 async function logout(){setBusy(true);try{const r=await fetch("/api/suivi",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({logout:true})});if(!r.ok)throw Error("Fermeture indisponible.");setProject(null);setCode("");setReference("");setError("");}catch(e){setError(e instanceof Error?e.message:"Erreur.");}finally{setBusy(false);}}
 return <div className={s.shell}><header className={s.top}><a className={s.brand} href="/">PAX<span>SOLUTIO</span></a><a href="/">← Retour au site</a></header><main className={s.main}>
 {preview&&!demonstration&&!disabled&&<div className={s.notice}><strong>Recette protégée · dossier fictif</strong><br/>Les informations et accès de cette recette sont enregistrés dans Supabase, puis nettoyés après vérification. Aucun client réel.</div>}
 {demonstration&&<div className={s.notice}><strong>Démonstration fictive · PAB001</strong><br/>Aucun client réel. Cet aperçu utilise les mêmes champs et composants que le suivi client, après contrôle administratif.</div>}
 {error&&<p className={s.error} role="alert">{error}</p>}
 {project?<><ProjectView project={project}/><div className={s.rows} style={{marginTop:28}}>{!demonstration&&<><button className={s.secondary} onClick={()=>{void load().catch(e=>{setProject(null);setError(e.message);});}} disabled={busy}>Actualiser le suivi</button><button className={s.secondary} onClick={()=>void logout()} disabled={busy}>Fermer mon accès</button></>}{demonstration&&<a className={s.secondary} href="/admin/suivi-projets">Retour à la démonstration administrative</a>}</div></>:<>
 <div className={s.intro}><p className={s.eyebrow}>Avancement de mon projet</p><h1>Votre projet.<br/>Une vision claire de la suite.</h1><p>Retrouvez les étapes et l’estimation renseignées par votre gestionnaire PaxSolutio, dans votre espace de suivi confidentiel.</p></div>
 <div className={s.grid}><section className={s.card}><h2>Consulter mon avancement</h2>{disabled&&<p className={s.notice}>Le suivi client n’est pas encore ouvert. Cette Preview ne collecte aucune information client.</p>}<form className={s.form} onSubmit={submit}><label>Référence du projet<input name="reference" autoComplete="off" required maxLength={24} value={reference} onChange={e=>setReference(e.target.value.toUpperCase())} placeholder="Votre référence" disabled={disabled}/></label><label>Code d’accès personnel<input name="code" type="password" autoComplete="off" required maxLength={48} value={code} onChange={e=>setCode(e.target.value)} disabled={disabled}/><small>Le code est fourni séparément par votre gestionnaire. La référence seule ne donne aucun accès.</small></label><button className={s.button} disabled={busy||disabled}>{busy?"Vérification…":"Accéder à mon suivi →"}</button></form></section>
 <aside className={s.card}><p className={s.eyebrow}>Un accès personnel</p><h2>Vos informations, simplement.</h2><ul><li>Un statut renseigné manuellement.</li><li>Les étapes publiées de votre projet.</li><li>Une estimation mise à jour par PaxSolutio.</li><li>Aucun compte utilisateur à créer.</li></ul><p className={s.footerNote}>Vous disposez d’un lien personnel ? Ouvrez-le directement. Gardez votre lien et votre code confidentiels ; contactez votre gestionnaire si vous les perdez.</p></aside></div></>}
 <p className={s.footerNote}>Informations renseignées par PaxSolutio. Les dates sont indicatives et peuvent évoluer ; elles ne constituent pas une garantie de livraison.</p></main></div>;
}
