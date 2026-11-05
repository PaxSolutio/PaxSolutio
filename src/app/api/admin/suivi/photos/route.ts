import {requireAdminRequest} from '@/lib/admin-access';
import {createAuthServerClient} from '@/lib/supabase/auth-server';
import {repository} from '@/lib/tracking/runtime';
import {PhotoService} from '@/lib/tracking/photo-service';
import {SupabasePhotoStorage} from '@/lib/tracking/photo-storage';
import {body,failure,response,trackingHeaders} from '@/lib/tracking/http';
import {TrackingError} from '@/lib/tracking/model';
export const runtime='nodejs';export const dynamic='force-dynamic';
const service=()=>new PhotoService(repository(),new SupabasePhotoStorage());
async function actor(){const {data,error}=await(await createAuthServerClient()).auth.getUser();if(error||!data.user||data.user.is_anonymous)throw new TrackingError(401,'Authentification requise.');return data.user.id;}
export async function GET(request:Request){const denied=await requireAdminRequest(request);if(denied)return denied;
 try{const q=new URL(request.url).searchParams,s=service(),p=await s.project(await actor(),q.get('projectId')??'');return new Response(await s.download(p,q.get('eventId')??'',q.get('photoId')??''),{headers:{...trackingHeaders,'Content-Type':'image/webp','Content-Disposition':'inline; filename="avancement.webp"','Content-Security-Policy':"default-src 'none'; sandbox"}});}catch(e){return failure(e);}}
export async function POST(request:Request){const denied=await requireAdminRequest(request);if(denied)return denied;
 try{const form=await request.formData();if([...form.keys()].some(k=>!['projectId','eventId','version','caption','file'].includes(k))||[...form.keys()].length!==5||new Set(form.keys()).size!==5)throw new TrackingError(400,'Dépôt invalide.');const f=form.get('file');if(!(f instanceof File))throw new TrackingError(400,'Photo requise.');
  const bytes=new Uint8Array(await f.arrayBuffer());try{return response({project:await service().upload(await actor(),String(form.get('projectId')),String(form.get('eventId')),Number(form.get('version')),bytes,f.type,String(form.get('caption')??''))});}finally{bytes.fill(0);}
 }catch(e){return failure(e);}}
export async function PUT(request:Request){const denied=await requireAdminRequest(request);if(denied)return denied;try{return response({project:await service().update(await actor(),await body(request))});}catch(e){return failure(e);}}
export async function DELETE(request:Request){const denied=await requireAdminRequest(request);if(denied)return denied;try{return response({project:await service().remove(await actor(),await body(request))});}catch(e){return failure(e);}}
