import {requireAdminRequest} from "@/lib/admin-access";
import {createAuthServerClient} from "@/lib/supabase/auth-server";
import {repository,mode} from "@/lib/tracking/runtime";
import {TrackingService} from "@/lib/tracking/service";
import {body,failure,response} from "@/lib/tracking/http";
import {clientView,TrackingError} from "@/lib/tracking/model";
export const dynamic="force-dynamic";
export const runtime="nodejs";
async function actor(){const {data,error}=await (await createAuthServerClient()).auth.getUser();if(error||!data.user)throw new TrackingError(401,"Authentification requise.");return data.user.id;}
export async function GET(request:Request){
 const denied=await requireAdminRequest(request);if(denied)return denied;
 try{const user=await actor(),repo=repository(),id=new URL(request.url).searchParams.get("id");
  if(id){if(!/^[-0-9a-f]{36}$/.test(id))throw new TrackingError(400,"Identifiant invalide.");const project=await repo.get(id,user);if(!project)throw new TrackingError(404,"Suivi absent.");return response({project,client:clientView(project),history:await repo.history(id,user),mode:mode()});}
  return response({projects:await repo.list(user),mode:mode()});
 }catch(e){return failure(e);}
}
export async function POST(request:Request){
 const denied=await requireAdminRequest(request);if(denied)return denied;
 try{return response(await new TrackingService(repository()).command(await actor(),await body(request)));}catch(e){return failure(e);}
}
