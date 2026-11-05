export const statuses = ["À l’étude", "Préparation", "En transit", "Arrivée estimée", "Livré", "Suspendu"] as const;
export type Status = typeof statuses[number];
export type ETA = { mode: "days" | "date" | "range" | "unknown"; from: string | null; to: string | null; days: number | null; recordedOn: string };
export type Photo = {id:string;objectKey:string;caption:string;published:boolean;width:number;height:number;bytes:number;mime:'image/webp'};
export type ClientPhoto = Pick<Photo,'id'|'caption'|'width'|'height'>;
export type Event = { id: string; date: string; title: string; comment: string; published: boolean; kind: "step" | "eta"; photos?:Photo[] };
export type Project = { id: string; reference: string; clientName: string; internalNotes: string; title: string; type: string; status: Status; eta: ETA; message: string; events: Event[]; closed: boolean; version: number; updatedAt: string };
export type Audit = { id: string; projectId: string; actor: string; at: string; action: string; before: Project | null; after: Project };
export type Access = { id: string; projectId: string; tokenHash: string; codeHash: string; expiresAt: string; revoked: boolean };
export type ClientProject = Pick<Project, "reference" | "title" | "status" | "eta" | "message" | "updatedAt" | "closed"> & { events: (Pick<Event, "id" | "date" | "title" | "comment" | "kind"> & {photos:ClientPhoto[]})[] };
export class TrackingError extends Error { constructor(public status: number, message: string) { super(message); } }
export function reject(message = "Données invalides."): never { throw new TrackingError(400, message); }
export function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) reject();
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some(k => !keys.includes(k))) reject();
  return result;
}
export function text(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" || value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)) reject();
  const result = value.trim(); if (required && !result) reject(); return result;
}
export function date(value: unknown): string {
  if (typeof value !== "string" || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) reject();
  const d = new Date(value + "T00:00:00Z"); if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10) !== value) reject(); return value;
}
export function today(now = new Date()): string { return new Intl.DateTimeFormat("sv-SE", {timeZone:"Europe/Paris"}).format(now); }
export function etaInput(value: unknown, recordedOn: string): ETA {
  date(recordedOn); const v = record(value, ["mode", "days", "from", "to"]);
  if (v.mode === "unknown") return {mode:"unknown",from:null,to:null,days:null,recordedOn};
  if (v.mode === "days") {
    if (typeof v.days !== "number" || !Number.isInteger(v.days) || v.days < 0 || v.days > 3650) reject();
    const d = new Date(recordedOn + "T00:00:00Z"); d.setUTCDate(d.getUTCDate()+v.days);
    return {mode:"days",from:d.toISOString().slice(0,10),to:null,days:v.days,recordedOn};
  }
  if (v.mode === "date") return {mode:"date",from:date(v.from),to:null,days:null,recordedOn};
  if (v.mode === "range") { const from=date(v.from),to=date(v.to); if(to<from)reject(); return {mode:"range",from,to,days:null,recordedOn}; }
  return reject();
}
export function formatDate(value: string): string { return new Intl.DateTimeFormat("fr-FR",{timeZone:"UTC",day:"numeric",month:"long",year:"numeric"}).format(new Date(value.slice(0,10)+"T12:00:00Z")); }
export function etaLabel(eta: ETA): string {
  if (eta.mode === "unknown" || !eta.from) return "Date à confirmer";
  return eta.mode === "range" && eta.to ? "Du "+formatDate(eta.from)+" au "+formatDate(eta.to) : formatDate(eta.from);
}
export function clientView(p: Project): ClientProject {
  // Explicit allow-list; never spread a stored project into a client response.
  return {reference:p.reference,title:p.title,status:p.status,eta:{mode:p.eta.mode,from:p.eta.from,to:p.eta.to,days:p.eta.days,recordedOn:p.eta.recordedOn},message:p.message,updatedAt:p.updatedAt,closed:p.closed,
    events:p.events.filter(e=>e.published).map(e=>({id:e.id,date:e.date,title:e.title,comment:e.comment,kind:e.kind,photos:(e.photos??[]).filter(photo=>photo.published).map(photo=>({id:photo.id,caption:photo.caption,width:photo.width,height:photo.height}))})).sort((a,b)=>a.date.localeCompare(b.date))};
}
export function projectFields(value: unknown): Pick<Project,"reference"|"clientName"|"internalNotes"|"title"|"type"|"status"|"message"> {
  const v=record(value,["reference","clientName","internalNotes","title","type","status","message"]);
  const reference=text(v.reference,24,true).toUpperCase();if(!/^[A-Z0-9][A-Z0-9-]{2,23}$/.test(reference))reject("Référence : 3 à 24 lettres, chiffres ou tirets.");
  if(!statuses.includes(v.status as Status))reject();
  return {reference,clientName:text(v.clientName,120,true),internalNotes:text(v.internalNotes,2000),title:text(v.title,140,true),type:text(v.type,80,true),status:v.status as Status,message:text(v.message,1200)};
}
export function fixture(): Project { return {
  id:"00000000-0000-4000-8000-000000000001",reference:"PAB001",clientName:"Pablo",internalNotes:"FICTIF — note interne non visible par le client.",title:"Transport WPC",type:"Transport international",status:"En transit",eta:etaInput({mode:"days",days:10},"2026-11-04"),message:"Votre marchandise est en cours d’acheminement.",closed:false,version:1,updatedAt:"2026-11-04T09:00:00.000Z",
  events:[{id:"00000000-0000-4000-8000-000000000002",date:"2026-11-04",title:"Marchandise en transit",comment:"Acheminement en cours. Prochaine information à la mise à jour du gestionnaire.",published:true,kind:"step"}]
}; }
