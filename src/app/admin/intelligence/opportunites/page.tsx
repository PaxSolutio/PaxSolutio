import { requireAdminPage } from "@/lib/admin-access";
import { redirect } from "next/navigation";

import IntelligenceOpportunitiesBoard from "@/components/admin/IntelligenceOpportunitiesBoard";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export type IntelligenceOpportunity = {
    id: string;

    brief_id: string;
    brief_section: string;
    brief_entry_index: number;

    opportunity_kind: string;

    title: string;
    summary: string | null;
    rationale: string | null;

    product_name: string | null;
    opportunity_type: string | null;

    priority_score: number | null;
    confidence_score: number | null;

    source_item_ids: string[];

    status:
        | "to_review"
        | "analyzing"
        | "validated"
        | "rejected"
        | "converted";

    notes: string | null;

    created_at: string;
    updated_at: string;
};

export default async function IntelligenceOpportunitiesPage() {
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

    const {
        data: admin,
    } = await supabase
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
        .from("intelligence_opportunities")
        .select("*")
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        console.error(
            "Erreur chargement dossiers Intelligence :",
            error
        );
    }

    const opportunities =
        (data ?? []) as IntelligenceOpportunity[];

    return (
        <IntelligenceOpportunitiesBoard
            initialOpportunities={opportunities}
        />
    );
}