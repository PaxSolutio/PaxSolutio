import "server-only";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import type {Access,Audit,Project} from "./model";
import {TrackingError} from "./model";
import type {Repository} from "./repository";
export class SupabaseRepository implements Repository {
 private scoped(p:Project|null){if(p&&process.env.VERCEL_ENV==='preview'&&!['PAB001','RECETTEB001'].includes(p.reference))throw new TrackingError(403,'Cette Preview est réservée aux dossiers fictifs de recette.');return p;}
 private async rpc<T>(op:string,payload:Record<string,unknown>,actor:string|null=null):Promise<T>{
  if(process.env.NEXT_PUBLIC_SUPABASE_URL!=='https://nymrbqulweokwlaucrkv.supabase.co')throw new TrackingError(503,'Cible du suivi indisponible.');
  const {data,error}=await createServerSupabaseClient().rpc("pax_tracking_dispatch",{operation:op,payload,actor_id:actor});
  if(error){if(error.code==="40001"||error.code==="23505")throw new TrackingError(409,"Conflit de version ou de référence.");throw new TrackingError(503,"Suivi temporairement indisponible.");}return data as T;
 }
 async list(actor:string){const rows=await this.rpc<Project[]>("list",{},actor);return process.env.VERCEL_ENV==='preview'?rows.filter(p=>['PAB001','RECETTEB001'].includes(p.reference)):rows;}
 async get(id:string,actor:string){return this.scoped(await this.rpc<Project|null>("get",{id},actor));}
 save(project:Project,expected:number,actor:string,action:string){this.scoped(project);if(process.env.VERCEL_ENV==='preview'&&!project.internalNotes.startsWith('FICTIF'))throw new TrackingError(400,'Commencez les notes internes par FICTIF pour cette recette.');return this.rpc<void>("save",{project,expected,action},actor);}
 history(id:string,actor:string){return this.rpc<Audit[]>("history",{id},actor);}
 rotate(access:Access,actor:string){return this.rpc<void>("rotate",{access},actor);}
 revoke(id:string,actor:string){return this.rpc<void>("revoke",{id},actor);}
 access(hash:string,reference:string|null){return this.rpc<Access|null>("access",{hash,reference});}
 async active(id:string){const result=await this.rpc<{access:Access;project:Project}|null>("active",{id});if(result)this.scoped(result.project);return result;}
 consume(keys:string[]){return this.rpc<boolean>("rate",{keys});}
}
