import {randomUUID} from "node:crypto";
import {clientView,date,etaInput,etaLabel,projectFields,record,text,today,TrackingError} from "./model";
import type {Project,Access} from "./model";
import type {Repository} from "./repository";
import {digest,newCredentials,normalizedCode,signTicket,verifyTicket,rateKey} from "./credentials";
const GENERIC="Accès indisponible. Vérifiez vos informations ou contactez votre gestionnaire.";
export class TrackingService {
 constructor(private repo:Repository,private now=()=>new Date()){}
 async command(actor:string,raw:unknown){
  const v=record(raw,["action","id","version","fields","eta","publishEta","event"]);
  const action=text(v.action,30,true);
  if(action==="create"){
   const fields=projectFields(v.fields);const at=this.now();const p:Project={...fields,id:randomUUID(),eta:etaInput(v.eta,today(at)),events:[],closed:false,version:1,updatedAt:at.toISOString()};await this.repo.save(p,0,actor,"Création du suivi");return {project:p};
  }
  if(typeof v.id!=="string"||!/^[-0-9a-f]{36}$/.test(v.id))throw new TrackingError(400,"Identifiant invalide.");
  const p=await this.repo.get(v.id,actor);if(!p)throw new TrackingError(404,"Suivi absent.");
  if(action==="revoke"){await this.repo.revoke(p.id,actor);return {revoked:true};}
  if(action==="rotate"){
   if(p.closed)throw new TrackingError(409,"Suivi fermé.");
   const c=newCredentials(),a:Access={id:randomUUID(),projectId:p.id,tokenHash:c.tokenHash,codeHash:c.codeHash,revoked:false,expiresAt:new Date(this.now().getTime()+90*86400e3).toISOString()};await this.repo.rotate(a,actor);
   // Plaintext only in this one response. Neither repository nor audit receives it.
   return {credentials:{token:c.token,code:c.code,reference:p.reference,expiresAt:a.expiresAt}};
  }
  if(!Number.isInteger(v.version)||v.version!==p.version)throw new TrackingError(409,"Ce suivi a changé. Rechargez-le.");
  if(p.closed)throw new TrackingError(409,"Le suivi est fermé.");
  const at=this.now();const next=structuredClone(p);next.version++;next.updatedAt=at.toISOString();
  if(action==="update"){
   if(v.fields!==undefined)Object.assign(next,projectFields(v.fields));
   if(v.eta!==undefined){next.eta=etaInput(v.eta,today(at));if(typeof v.publishEta!=="boolean")throw new TrackingError(400,"Précisez la publication du changement d’estimation.");if(v.publishEta){if(next.events.length>=200)throw new TrackingError(409,"Limite de 200 étapes atteinte.");next.events.push({id:randomUUID(),date:today(at),title:"Estimation actualisée",comment:etaLabel(p.eta)+" → "+etaLabel(next.eta),published:true,kind:"eta"});}}
  }else if(action==="event"){
   const e=record(v.event,["date","title","comment","published"]);if(typeof e.published!=="boolean")throw new TrackingError(400,"Visibilité manquante.");const when=date(e.date);if(when>today(at))throw new TrackingError(400,"Une étape accomplie ne peut pas être future.");if(next.events.length>=200)throw new TrackingError(409,"Limite de 200 étapes atteinte.");next.events.push({id:randomUUID(),date:when,title:text(e.title,140,true),comment:text(e.comment,1200),published:e.published,kind:"step"});
  }else if(action==="close"){next.closed=true;}
  else throw new TrackingError(400,"Action inconnue.");
  await this.repo.save(next,p.version,actor,action==="close"?"Clôture et révocation des accès":action==="event"?"Ajout d’une étape":"Mise à jour du suivi");return {project:next};
 }
 async login(raw:unknown,networkIdentity:string){
  const v=record(raw,["reference","code","token"]);const now=this.now().getTime();
  const reference=typeof v.reference==="string"?v.reference.toUpperCase().trim().slice(0,24):"";
  // A secret link has no reference. Its own hash must form the third bucket,
  // otherwise ten visits to any link block all other clients' links.
  const tokenCandidate=typeof v.token==="string"&&/^[A-Za-z0-9_-]{43}$/.test(v.token)&&v.code===undefined&&v.reference===undefined;
  const credentialBucket=tokenCandidate?"token:"+digest(v.token as string):"ref:"+reference;
  if(!await this.repo.consume([rateKey("global"),rateKey("network:"+networkIdentity),rateKey(credentialBucket)],now))throw new TrackingError(429,GENERIC);
  let hash=digest("invalid"),ref:string|null=reference;
  if(typeof v.token==="string"&&/^[A-Za-z0-9_-]{43}$/.test(v.token)&&v.code===undefined&&v.reference===undefined){hash=digest(v.token);ref=null;}
  else if(typeof v.code==="string"&&/^[A-Fa-f0-9 -]{32,48}$/.test(v.code)&&v.token===undefined){hash=digest(normalizedCode(v.code));}
  const access=await this.repo.access(hash,ref);const current=access?await this.repo.active(access.id):null;
  if(!current||Date.parse(current.access.expiresAt)<=this.now().getTime())throw new TrackingError(401,GENERIC);
  return signTicket({accessId:current.access.id,projectId:current.project.id,expires:Math.min(now+4*3600e3,Date.parse(current.access.expiresAt))});
 }
 async current(ticket:string){
  const t=verifyTicket(ticket,this.now().getTime());const current=t?await this.repo.active(t.accessId):null;
  if(!t||!current||current.project.id!==t.projectId||Date.parse(current.access.expiresAt)<=this.now().getTime())throw new TrackingError(401,GENERIC);
  return current.project;
 }
 async read(ticket:string){return clientView(await this.current(ticket));}
}
