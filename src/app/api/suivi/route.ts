import {cookies} from "next/headers";
import {isIP} from "node:net";
import {mode,repository} from "@/lib/tracking/runtime";
import {TrackingService} from "@/lib/tracking/service";
import {body,failure,response} from "@/lib/tracking/http";
import {TrackingError} from "@/lib/tracking/model";
export const dynamic="force-dynamic";export const runtime="nodejs";
const cookie="__Host-pax_tracking";
const options={httpOnly:true,secure:true,sameSite:"strict" as const,path:"/",maxAge:4*3600};
export async function GET(){try{const ticket=(await cookies()).get(cookie)?.value||"";return response({project:await new TrackingService(repository()).read(ticket)});}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 const raw=await body(request);if(raw?.logout===true&&Object.keys(raw).length===1){(await cookies()).set(cookie,"",{...options,maxAge:0});return response({closed:true});}
 // Vercel overwrites x-forwarded-for. Outside that boundary, fail closed;
 // the local test backend uses a fixed loopback bucket, never user headers.
 const ip=process.env.VERCEL==="1"?request.headers.get("x-forwarded-for")?.trim():mode()==="local"?"127.0.0.1":null;
 if(!ip||!isIP(ip))throw new TrackingError(503,"Suivi temporairement indisponible.");
 const ticket=await new TrackingService(repository()).login(raw,ip);(await cookies()).set(cookie,ticket,options);return response({ok:true});
 }catch(e){return failure(e);}}
