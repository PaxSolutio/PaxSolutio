"use client";
import {useEffect,useState} from "react";
import styles from "./InformationBanner.module.css";

// General information approved by the merchant; independent of product Pay Later eligibility.
export const informationMessages = [
  "Paiement en plusieurs fois disponible via PayPal · Selon éligibilité et modalités PayPal",
  "Sourcing direct en Chine",
  "Sourcing et importation automobile",
  "Transport et logistique internationale",
  "Étude personnalisée de votre projet",
];
export default function InformationBanner(){
  const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[reduced,setReduced]=useState(false);
  useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReduced(media.matches);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update);},[]);
  useEffect(()=>{if(paused||hovered||focused||reduced)return;const timer=setInterval(()=>setIndex(x=>(x+1)%informationMessages.length),6000);return()=>clearInterval(timer);},[paused,hovered,focused,reduced]);
  return <div className={styles.banner} role="region" aria-label="Informations PaxSolutio" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}}>
    <span className={styles.label} aria-hidden="true">FRANCE ↔ CHINE</span>
    <span key={index} className={styles.message} aria-live="off">{informationMessages[index]}</span>
    <button type="button" className={styles.pause} onClick={()=>setPaused(x=>!x)} aria-pressed={paused} aria-label={paused?"Reprendre le défilement des informations":"Mettre en pause le défilement des informations"} disabled={reduced}><span aria-hidden="true">{paused||reduced?"▷":"Ⅱ"}</span></button>
  </div>;
}
