export const dynamic = "force-dynamic";
import { requireAdminRequest } from "@/lib/admin-access";
import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type OpportunityEntry = {
  title?: string;
  summary?: string;
  rationale?: string;

  product_name?: string;
  opportunity_type?: string;

  priority_score?: number;
  confidence_score?: number;

  source_item_ids?: string[];
};

type CreateOpportunityBody = {
  briefId?: string;

  section?:
    | "opportunities"
    | "product_opportunities";

  entryIndex?: number;

  entry?: OpportunityEntry;
};

async function checkAdmin() {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false as const,
      status: 401,
      error: "Non autorisé.",
    };
  }

  const supabase =
    createServerSupabaseClient();

  const { data: admin, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError) {
    return {
      success: false as const,
      status: 500,
      error:
        "Impossible de vérifier les droits administrateur.",
    };
  }

  if (!admin) {
    return {
      success: false as const,
      status: 403,
      error:
        "Accès administrateur requis.",
    };
  }

  return {
    success: true as const,
    supabase,
  };
}

export async function POST(
  request: NextRequest
) {
  const accessDenied = await requireAdminRequest(request);
  if (accessDenied) return accessDenied;

  try {
    // =========================================================
    // 1. AUTH
    // =========================================================

    const auth = await checkAdmin();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error,
        },
        {
          status: auth.status,
        }
      );
    }

    const { supabase } = auth;

    // =========================================================
    // 2. BODY
    // =========================================================

    let body: CreateOpportunityBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Corps de requête JSON invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const briefId =
      body.briefId?.trim();

    const section =
      body.section;

    const entryIndex =
      body.entryIndex;

    const entry =
      body.entry;

    if (
      !briefId ||
      !section ||
      typeof entryIndex !== "number" ||
      !entry?.title
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Données opportunité incomplètes.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // 3. VÉRIFICATION DU BRIEF
    // =========================================================

    const {
      data: brief,
      error: briefError,
    } = await supabase
      .from("intelligence_briefs")
      .select("id")
      .eq("id", briefId)
      .maybeSingle();

    if (briefError || !brief) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Brief Intelligence introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    // =========================================================
    // 4. VALIDATION DES SOURCES
    // =========================================================

    const proposedSourceIds =
      Array.isArray(entry.source_item_ids)
        ? entry.source_item_ids
        : [];

    let validSourceIds: string[] = [];

    if (proposedSourceIds.length > 0) {
      const {
        data: sourceItems,
        error: sourceError,
      } = await supabase
        .from("intelligence_items")
        .select("id")
        .in(
          "id",
          proposedSourceIds
        );

      if (sourceError) {
        console.error(
          "Erreur validation sources opportunité :",
          sourceError
        );
      } else {
        validSourceIds =
          (sourceItems ?? []).map(
            (item) => item.id
          );
      }
    }

    // =========================================================
    // 5. CRÉATION / RÉCUPÉRATION DU DOSSIER
    // =========================================================

    const opportunityKind =
      section === "product_opportunities"
        ? "product"
        : "strategic";

    const now =
      new Date().toISOString();

    const {
      data: opportunity,
      error: opportunityError,
    } = await supabase
      .from(
        "intelligence_opportunities"
      )
      .upsert(
        {
          brief_id:
            briefId,

          brief_section:
            section,

          brief_entry_index:
            entryIndex,

          opportunity_kind:
            opportunityKind,

          title:
            entry.title.trim(),

          summary:
            entry.summary?.trim() ||
            null,

          rationale:
            entry.rationale?.trim() ||
            null,

          product_name:
            entry.product_name?.trim() ||
            null,

          opportunity_type:
            entry.opportunity_type ||
            null,

          priority_score:
            typeof entry.priority_score ===
            "number"
              ? entry.priority_score
              : null,

          confidence_score:
            typeof entry.confidence_score ===
            "number"
              ? entry.confidence_score
              : null,

          source_item_ids:
            validSourceIds,

          updated_at:
            now,
        },
        {
          onConflict:
            "brief_id,brief_section,brief_entry_index",
        }
      )
      .select()
      .single();

    if (
      opportunityError ||
      !opportunity
    ) {
      console.error(
        "Erreur création opportunité Intelligence :",
        opportunityError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de créer le dossier d'opportunité.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================================================
    // 6. RÉPONSE
    // =========================================================

    return NextResponse.json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error(
      "Erreur dossier Intelligence :",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Erreur Intelligence inconnue.",
      },
      {
        status: 500,
      }
    );
  }
}