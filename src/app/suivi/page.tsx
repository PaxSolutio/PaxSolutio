import type {Metadata} from "next";
import {requireAdminPage} from "@/lib/admin-access";
import {mode} from "@/lib/tracking/runtime";
import {clientView,fixture} from "@/lib/tracking/model";
import ClientPortal from "@/components/tracking/ClientPortal";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Avancement de mon projet | PaxSolutio",robots:{index:false,follow:false},referrer:"no-referrer"};
export default async function TrackingPage({searchParams}:{searchParams:Promise<{demonstration?:string}>}){
 const demo=(await searchParams).demonstration==="1"&&mode()==="fixture";
 if(demo)await requireAdminPage();
 return <ClientPortal preview={process.env.VERCEL_ENV==="preview"} initial={demo?clientView(fixture()):null} demonstration={demo} disabled={mode()==="disabled"||mode()==="fixture"&&!demo}/>;
}
