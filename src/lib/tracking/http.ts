import "server-only";
import {boundedBody} from "@/lib/admin-input";
import {TrackingError} from "./model";
export const trackingHeaders={"Cache-Control":"private, no-store, max-age=0","X-Robots-Tag":"noindex, nofollow, noarchive","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff"};
export function response(value:unknown,status=200){return Response.json(value,{status,headers:trackingHeaders});}
export function failure(error:unknown){return response({error:error instanceof TrackingError?error.message:"Suivi temporairement indisponible."},error instanceof TrackingError?error.status:503);}
export async function body(request:Request){
 if(request.headers.get("origin")!==new URL(request.url).origin||request.headers.get("sec-fetch-site")==="cross-site")throw new TrackingError(403,"Requête refusée.");
 if(!/^application\/json(?:;|$)/i.test(request.headers.get("content-type")||""))throw new TrackingError(415,"Format invalide.");
 const bytes=await boundedBody(request,16000);if(!bytes)throw new TrackingError(413,"Requête trop volumineuse.");
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new TrackingError(400,"Requête invalide.");}
}
