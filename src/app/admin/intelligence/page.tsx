import { redirect } from "next/navigation";

import IntelligenceRunner from "@/components/admin/IntelligenceRunner";

import type { IntelligenceBriefData } from "@/components/admin/IntelligenceBrief";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type IntelligenceMission = {
  id: string;
  name: string;
  radar: string;
  query_text: string;
  frequency: "3h" | "12h" | "daily" | "weekly";
  priority: number;
  active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
};

type IntelligenceItem = {
  id: string;
  title: string;
  summary: string | null;
  analysis: string | null;
  item_type: string;
  categories: string[];
  countries: string[];
  companies: string[];
  products: string[];
  total_score: number | null;
  confidence_score: number | null;
  urgency_score: number | null;
  risk_score: number | null;
  status: string;
  detected_at: string;
  generated_news_post_id: string | null;
};

export default async function AdminIntelligencePage() {
  // =========================================================
  // 1. AUTHENTIFICATION
  // =========================================================

  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  // =========================================================
  // 2. VÉRIFICATION ADMINISTRATEUR
  // =========================================================

  const supabase =
    createServerSupabaseClient();

  const { data: admin, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError) {
    console.error(
      "Erreur vérification administrateur :",
      adminError
    );

    redirect("/admin/login");
  }

  if (!admin) {
    redirect("/admin/login");
  }

  // =========================================================
  // 3. MISSIONS DE VEILLE
  // =========================================================

  const {
    data: missionsData,
    error: missionsError,
  } = await supabase
    .from("intelligence_queries")
    .select(
      `
        id,
        name,
        radar,
        query_text,
        frequency,
        priority,
        active,
        last_run_at,
        next_run_at
      `
    )
    .eq("active", true)
    .order("priority", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    });

  if (missionsError) {
    console.error(
      "Erreur récupération missions Intelligence :",
      missionsError
    );
  }

  // =========================================================
  // 4. DERNIÈRES INFORMATIONS
  // =========================================================

  const {
    data: itemsData,
    error: itemsError,
  } = await supabase
    .from("intelligence_items")
    .select(
      `
        id,
        title,
        summary,
        analysis,
        item_type,
        categories,
        countries,
        companies,
        products,
        total_score,
        confidence_score,
        urgency_score,
        risk_score,
        status,
        detected_at,
        generated_news_post_id
      `
    )
    .order("detected_at", {
      ascending: false,
    })
    .limit(30);

  if (itemsError) {
    console.error(
      "Erreur récupération Intelligence Items :",
      itemsError
    );
  }

  // =========================================================
  // 5. DERNIER BRIEF STRATÉGIQUE
  // =========================================================

  const {
    data: briefData,
    error: briefError,
  } = await supabase
    .from("intelligence_briefs")
    .select(
      `
        id,
        title,
        period_start,
        period_end,
        executive_summary,
        opportunities,
        product_opportunities,
        risks_regulations,
        trends_signals,
        competition,
        editorial_candidates,
        watchlist,
        source_item_ids,
        model,
        status,
        created_at,
        updated_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (briefError) {
    console.error(
      "Erreur récupération dernier Brief Intelligence :",
      briefError
    );
  }

  // =========================================================
  // 6. NORMALISATION
  // =========================================================

  const missions =
    (missionsData ?? []) as unknown as IntelligenceMission[];

  const recentItems =
    (itemsData ?? []) as unknown as IntelligenceItem[];

  const latestBrief =
    briefData
      ? (briefData as unknown as IntelligenceBriefData)
      : null;

  // =========================================================
  // 7. INTERFACE
  // =========================================================

  return (
    <IntelligenceRunner
      missions={missions}
      initialItems={recentItems}
      initialBrief={latestBrief}
    />
  );
}