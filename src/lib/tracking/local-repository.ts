import {mkdir, readFile, writeFile, rename, rmdir} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {fixture, TrackingError} from "./model";
import type {Access,Audit,Project} from "./model";
import type {Repository} from "./repository";
type State={projects:Project[];accesses:Access[];audits:Audit[];rates:Record<string,{count:number;until:number}>};
/** Fictitious development only. Never selected in Vercel or Production. */
export class LocalRepository implements Repository {
 constructor(private file=path.resolve(".local/tracking-fictitious.json")){}
 private async transaction<T>(fn:(s:State)=>T):Promise<T>{
  if(process.env.VERCEL||process.env.PAX_TRACKING_MODE!=="local")throw new TrackingError(503,"Stockage local refusé.");
  await mkdir(path.dirname(this.file),{recursive:true});const lock=this.file+".lock";let locked=false;
  for(let n=0;n<100;n++){try{await mkdir(lock);locked=true;break;}catch(e){if((e as NodeJS.ErrnoException).code!=="EEXIST")throw e;await new Promise(r=>setTimeout(r,20));}}
  if(!locked)throw new TrackingError(503,"Stockage occupé.");
  try{
   let s:State;try{s=JSON.parse(await readFile(this.file,"utf8"));}catch(e){if((e as NodeJS.ErrnoException).code!=="ENOENT")throw e;s={projects:[fixture()],accesses:[],audits:[],rates:{}};}
   const result=fn(s);const tmp=this.file+"."+randomUUID()+".tmp";await writeFile(tmp,JSON.stringify(s),{mode:0o600});await rename(tmp,this.file);return structuredClone(result);
  }finally{await rmdir(lock);}
 }
 async list(){return this.transaction(s=>s.projects);}
 async get(id:string){return this.transaction(s=>s.projects.find(p=>p.id===id)??null);}
 async save(p:Project,expected:number,actor:string,action:string){await this.transaction(s=>{
  const old=s.projects.find(x=>x.id===p.id);if((old?.version??0)!==expected)throw new TrackingError(409,"Ce suivi a changé. Rechargez-le avant de modifier.");
  if(s.projects.some(x=>x.id!==p.id&&x.reference===p.reference))throw new TrackingError(409,"Référence déjà utilisée.");
  s.audits.push({id:randomUUID(),projectId:p.id,actor,at:p.updatedAt,action,before:old??null,after:p});s.projects=s.projects.filter(x=>x.id!==p.id).concat(p);
  if(p.closed)for(const a of s.accesses.filter(a=>a.projectId===p.id))a.revoked=true;
 });}
 async history(id:string){return this.transaction(s=>s.audits.filter(a=>a.projectId===id));}
 async rotate(a:Access,actor:string){await this.transaction(s=>{const p=s.projects.find(p=>p.id===a.projectId);if(!p||p.closed)throw new TrackingError(409,"Suivi fermé ou absent.");for(const old of s.accesses.filter(x=>x.projectId===p.id))old.revoked=true;s.accesses.push(a);s.audits.push({id:randomUUID(),projectId:p.id,actor,at:new Date().toISOString(),action:"Accès renouvelé",before:p,after:p});});}
 async revoke(id:string,actor:string){await this.transaction(s=>{const p=s.projects.find(p=>p.id===id);if(!p)throw new TrackingError(404,"Suivi absent.");for(const a of s.accesses.filter(a=>a.projectId===id))a.revoked=true;s.audits.push({id:randomUUID(),projectId:id,actor,at:new Date().toISOString(),action:"Accès révoqué",before:p,after:p});});}
 async access(hash:string,reference:string|null){return this.transaction(s=>s.accesses.find(a=>!a.revoked&&(reference===null?a.tokenHash===hash:a.codeHash===hash&&s.projects.some(p=>p.id===a.projectId&&p.reference===reference)))??null);}
 async active(id:string){return this.transaction(s=>{const access=s.accesses.find(a=>a.id===id&&!a.revoked);const project=s.projects.find(p=>p.id===access?.projectId&&!p.closed);return access&&project?{access,project}:null;});}
 async consume(keys:string[],now:number){return this.transaction(s=>{
  for(const key of Object.keys(s.rates))if(s.rates[key].until<=now)delete s.rates[key];
  let allowed=true;for(const [i,key]of keys.entries()){const r=s.rates[key]??{count:0,until:now+(i===0?60000:900000)};r.count++;s.rates[key]=r;if(r.count>(i===0?100:10)){allowed=false;if(i===0)return false;}}return allowed;
 });}
}
