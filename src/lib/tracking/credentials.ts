import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { TrackingError } from "./model";
export function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
export function equal(a: string,b: string): boolean { const x=Buffer.from(a),y=Buffer.from(b); return x.length===y.length&&timingSafeEqual(x,y); }
export function newCredentials() {
  const token=randomBytes(32).toString("base64url"),raw=randomBytes(16).toString("hex").toUpperCase();
  return {token,code:raw.match(/.{4}/g)!.join("-"),tokenHash:digest(token),codeHash:digest(raw)};
}
export function normalizedCode(value: string): string { return value.replaceAll("-","").replaceAll(" ","").toUpperCase(); }
export type Ticket = {accessId:string;projectId:string;expires:number};
function key(): string { const k=process.env.PAX_TRACKING_SESSION_KEY; if(!k||k.length<48)throw new TrackingError(503,"Suivi temporairement indisponible.");return k; }
export function signTicket(ticket: Ticket): string { const data=Buffer.from(JSON.stringify(ticket)).toString("base64url");return data+"."+createHmac("sha256",key()).update(data).digest("base64url"); }
export function verifyTicket(value: string,now=Date.now()): Ticket | null {
  if(value.length>1024)return null;const [data,mac,...rest]=value.split(".");if(rest.length||!data||!mac)return null;
  if(!equal(mac,createHmac("sha256",key()).update(data).digest("base64url")))return null;
  try{const t=JSON.parse(Buffer.from(data,"base64url").toString());if(typeof t.expires!=="number"||t.expires<=now||t.expires>now+4*3600e3||!/^[-0-9a-f]{36}$/.test(t.accessId)||!/^[-0-9a-f]{36}$/.test(t.projectId))return null;return t;}catch{return null;}
}
export function rateKey(value:string):string { const scope=process.env.VERCEL_ENV==='preview'?process.env.PAX_TRACKING_RECIPE_ID??'preview':'';return createHmac("sha256",key()).update(scope+':'+value).digest("hex"); }
