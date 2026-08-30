"use client";

import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createAuthBrowserClient();

    await supabase.auth.signOut();

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
    >
      Déconnexion
    </button>
  );
}