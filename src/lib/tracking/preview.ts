const ROUTES=new Map<string,string[]>([
 ['/api/admin/suivi',['GET','POST']],['/api/admin/suivi/photos',['GET','POST','PUT','DELETE']],
 ['/api/suivi',['GET','POST']],['/api/suivi/photos',['GET']]
]);
export function trackingPreviewAllowed(method:string,pathname:string){
 return process.env.VERCEL_ENV==='preview'&&process.env.PAX_TRACKING_MODE==='supabase'&&process.env.PAX_TRACKING_ACTIVATED==='true'&&process.env.PAX_TRACKING_PREVIEW_MUTATIONS==='true'&&process.env.NEXT_PUBLIC_SUPABASE_URL==='https://nymrbqulweokwlaucrkv.supabase.co'&&(ROUTES.get(pathname)?.includes(method.toUpperCase())??false);
}
