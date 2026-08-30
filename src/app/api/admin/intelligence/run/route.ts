import { NextRequest, NextResponse } from "next/server";

import { runIntelligenceQuery } from "@/lib/intelligence/run-intelligence-query";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // =========================================================
    // 1. Vérification de l'utilisateur connecté
    // =========================================================

    const authSupabase = await createAuthServerClient();

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autorisé.",
        },
        {
          status: 401,
        }
      );
    }

    // =========================================================
    // 2. Vérification du rôle administrateur
    // =========================================================

    const supabase = createServerSupabaseClient();

    const { data: adminUser, error: adminError } =
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

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de vérifier les droits administrateur.",
        },
        {
          status: 500,
        }
      );
    }

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès administrateur requis.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================================================
    // 3. Lecture de la mission Intelligence
    // =========================================================

    let body: {
      queryId?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Corps de requête JSON invalide.",
        },
        {
          status: 400,
        }
      );
    }

    const queryId = body.queryId?.trim();

    if (!queryId) {
      return NextResponse.json(
        {
          success: false,
          error: "queryId manquant.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // 4. Exécution du moteur Intelligence
    // =========================================================

    const result = await runIntelligenceQuery(queryId);

    // =========================================================
    // 5. Réponse
    // =========================================================

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "Erreur moteur PaxSolutio Intelligence :",
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