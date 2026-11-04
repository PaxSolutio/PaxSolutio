import "server-only";

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateAdminRequest } from "@/lib/admin-input";

/** No claim, user_metadata, cookie role or cross-request cache grants authority. */
export async function adminAccess(): Promise<200 | 401 | 403 | 503> {
  try {
    const auth = await createAuthServerClient();
    const { data, error } = await auth.auth.getUser();
    if (error || !data.user || data.user.is_anonymous) return 401;
    const { data: membership, error: membershipError } = await createServerSupabaseClient()
      .from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (membershipError) return 503;
    return membership?.user_id === data.user.id ? 200 : 403;
  } catch {
    return 503;
  }
}

export async function requireAdminRequest(request: Request): Promise<Response | null> {
  const status = await adminAccess();
  if (status !== 200) {
    return NextResponse.json({ success: false, error: status === 401 ? "Authentification requise." : status === 403 ? "Accès administrateur requis." : "Vérification des accès indisponible." },
      { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie, Authorization" } });
  }
  return validateAdminRequest(request);
}

export async function requireAdminPage(): Promise<void> {
  if (await adminAccess() !== 200) redirect("/admin/login");
}
