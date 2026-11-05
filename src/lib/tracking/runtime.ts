import "server-only";
import {FixtureRepository, type Repository} from "./repository";
import {LocalRepository} from "./local-repository";
import {SupabaseRepository} from "./supabase-repository";
import {TrackingError} from "./model";
export function mode():"fixture"|"local"|"supabase"|"disabled" {
 const m=process.env.PAX_TRACKING_MODE;
 if(m==="fixture"&&process.env.VERCEL_ENV==="preview")return "fixture";
 if(m==="local"&&!process.env.VERCEL&&process.env.PAX_TRACKING_LOCAL_ONLY==="true")return "local";
 if(m==="supabase"&&process.env.PAX_TRACKING_ACTIVATED==="true")return "supabase";
 return "disabled";
}
export function repository(): Repository {
 switch(mode()){case "fixture":return new FixtureRepository();case "local":return new LocalRepository();case "supabase":return new SupabaseRepository();default:throw new TrackingError(503,"Le suivi client n’est pas encore activé.");}
}
