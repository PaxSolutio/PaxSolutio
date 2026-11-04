import { requireAdminPage } from "@/lib/admin-access";
import Link from "next/link";
import { redirect } from "next/navigation";

import IntelligenceActionsBoard from "@/components/admin/IntelligenceActionsBoard";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type IntelligenceActionRow = {
    id: string;
    opportunity_id: string;
    study_id: string | null;

    title: string;
    description: string | null;

    priority: "low" | "medium" | "high";

    status:
        | "todo"
        | "in_progress"
        | "done"
        | "cancelled";

    due_date: string | null;

    source_type: string;
    source_index: number | null;

    notes: string | null;

    created_at: string;
    updated_at: string;
    completed_at: string | null;

    intelligence_opportunities:
        | {
              id: string;
              title: string;
              product_name: string | null;
              opportunity_kind: string;
              status: string;
              priority_score: number | null;
          }
        | {
              id: string;
              title: string;
              product_name: string | null;
              opportunity_kind: string;
              status: string;
              priority_score: number | null;
          }[]
        | null;
};

export default async function IntelligenceActionsPage() {
  await requireAdminPage();

    const authSupabase =
        await createAuthServerClient();

    const {
        data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    const supabase =
        createServerSupabaseClient();

    const { data: admin } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!admin) {
        redirect("/admin/login");
    }

    const {
        data,
        error,
    } = await supabase
        .from("intelligence_actions")
        .select(
            `
            *,
            intelligence_opportunities (
                id,
                title,
                product_name,
                opportunity_kind,
                status,
                priority_score
            )
            `
        )
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        console.error(
            "Erreur chargement actions Intelligence :",
            error
        );
    }

    const actions =
        ((data ?? []) as IntelligenceActionRow[]).map(
            (action) => ({
                ...action,

                opportunity:
                    Array.isArray(
                        action.intelligence_opportunities
                    )
                        ? action
                              .intelligence_opportunities[0] ??
                          null
                        : action.intelligence_opportunities,
            })
        );

    return (
        <main className="min-h-screen bg-[#06111f] text-white">
            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <header className="border-b border-white/10 pb-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                                PaxSolutio Intelligence
                            </div>

                            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                                Actions Intelligence
                            </h1>

                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                                Vue opérationnelle de toutes
                                les tâches issues des études,
                                dossiers et actions manuelles.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/admin/intelligence"
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                            >
                                ← Intelligence
                            </Link>

                            <Link
                                href="/admin/intelligence/opportunites"
                                className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                            >
                                Dossiers
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="py-8">
                    <IntelligenceActionsBoard
                        initialActions={actions}
                    />
                </div>
            </div>
        </main>
    );
}