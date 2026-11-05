import {requireAdminPage} from "@/lib/admin-access";
import {createAuthServerClient} from "@/lib/supabase/auth-server";
import {mode,repository} from "@/lib/tracking/runtime";
import AdminTracking from "@/components/tracking/AdminTracking";
export const dynamic="force-dynamic";
export default async function TrackingAdminPage(){
 await requireAdminPage();
 const {data}=await (await createAuthServerClient()).auth.getUser();
 const projects=mode()==="disabled"?[]:await repository().list(data.user!.id);
 return <AdminTracking initial={projects} mode={mode()} preview={process.env.VERCEL_ENV==="preview"} photosEnabled={process.env.PAX_TRACKING_PHOTOS==="true"}/>;
}
