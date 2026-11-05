import {cookies} from 'next/headers';
import {repository} from '@/lib/tracking/runtime';
import {TrackingService} from '@/lib/tracking/service';
import {PhotoService} from '@/lib/tracking/photo-service';
import {SupabasePhotoStorage} from '@/lib/tracking/photo-storage';
import {failure,trackingHeaders} from '@/lib/tracking/http';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const q=new URL(request.url).searchParams,repo=repository(),ticket=(await cookies()).get('__Host-pax_tracking')?.value??'';
 const p=await new TrackingService(repo).current(ticket);
 return new Response(await new PhotoService(repo,new SupabasePhotoStorage()).download(p,q.get('eventId')??'',q.get('photoId')??'',true),{headers:{...trackingHeaders,'Content-Type':'image/webp','Content-Disposition':'inline; filename="avancement.webp"','Content-Security-Policy':"default-src 'none'; sandbox"}});
}catch(e){return failure(e);}}
