import { isReadOnlyPreview, previewRequestAllowed } from "@/lib/preview-safety";
import {trackingPreviewAllowed} from '@/lib/tracking/preview';
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (isReadOnlyPreview()) {
    const localTracking = process.env.PAX_TRACKING_MODE === "local" && process.env.PAX_TRACKING_LOCAL_ONLY === "true" && !process.env.VERCEL && /^(127\.0\.0\.1|localhost):\d+$/.test(request.headers.get("host") || "") && ["/api/suivi", "/api/admin/suivi"].includes(request.nextUrl.pathname);
    const response = localTracking || trackingPreviewAllowed(request.method,request.nextUrl.pathname) || previewRequestAllowed(request.method, request.nextUrl.pathname, process.env.PAX_PREVIEW_ADMIN_READS === "true")
      ? NextResponse.next({ request })
      : new NextResponse("Preview de validation : action indisponible.", { status: 423 });
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Important : permet à Supabase de rafraîchir la session.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
