import { NextRequest, NextResponse } from "next/server";

import { runIntelligenceQuery } from "@/lib/intelligence/run-intelligence-query";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

type DueMission = {
  id: string;
  name: string;
  radar: string;
  frequency: "3h" | "12h" | "daily" | "weekly";
  priority: number;
  next_run_at: string | null;
};

type MissionExecutionResult = {
  id: string;
  name: string;
  radar: string;
  success: boolean;
  found?: number;
  inserted?: number;
  error?: string;
};

const MAX_MISSIONS_PER_RUN = 3;

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET manquant.");

    return false;
  }

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  const startedAt = new Date();

  try {
    // =========================================================
    // 1. SÉCURITÉ
    // =========================================================

    if (!isAuthorized(request)) {
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

    const supabase = createServerSupabaseClient();

    // =========================================================
    // 2. MISSIONS ARRIVÉES À ÉCHÉANCE
    // =========================================================

    const now = new Date();

    /*
     * On récupère :
     *
     * - les missions actives dont next_run_at est dépassé ;
     * - puis, si certaines missions n'ont jamais été exécutées,
     *   elles seront récupérées séparément.
     *
     * On limite volontairement le nombre de missions exécutées
     * à chaque passage pour contrôler :
     *
     * - les coûts OpenAI ;
     * - la durée du cron ;
     * - la charge Supabase ;
     * - les recherches web.
     */

    const { data: overdueData, error: overdueError } =
      await supabase
        .from("intelligence_queries")
        .select(
          `
            id,
            name,
            radar,
            frequency,
            priority,
            next_run_at
          `
        )
        .eq("active", true)
        .not("next_run_at", "is", null)
        .lte("next_run_at", now.toISOString())
        .order("priority", {
          ascending: false,
        })
        .order("next_run_at", {
          ascending: true,
        })
        .limit(MAX_MISSIONS_PER_RUN);

    if (overdueError) {
      console.error(
        "Erreur récupération missions échues :",
        overdueError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de récupérer les missions Intelligence.",
        },
        {
          status: 500,
        }
      );
    }

    let missions =
      (overdueData ?? []) as unknown as DueMission[];

    // =========================================================
    // 3. MISSIONS JAMAIS EXÉCUTÉES
    // =========================================================

    if (missions.length < MAX_MISSIONS_PER_RUN) {
      const remainingSlots =
        MAX_MISSIONS_PER_RUN - missions.length;

      const selectedIds = missions.map(
        (mission) => mission.id
      );

      const { data: neverRunData, error: neverRunError } =
        await supabase
          .from("intelligence_queries")
          .select(
            `
              id,
              name,
              radar,
              frequency,
              priority,
              next_run_at
            `
          )
          .eq("active", true)
          .is("last_run_at", null)
          .order("priority", {
            ascending: false,
          })
          .limit(MAX_MISSIONS_PER_RUN);

      if (neverRunError) {
        console.error(
          "Erreur récupération missions jamais exécutées :",
          neverRunError
        );
      } else {
        const neverRunMissions =
          (neverRunData ?? []) as unknown as DueMission[];

        for (const mission of neverRunMissions) {
          if (missions.length >= MAX_MISSIONS_PER_RUN) {
            break;
          }

          if (selectedIds.includes(mission.id)) {
            continue;
          }

          missions.push(mission);
          selectedIds.push(mission.id);
        }

        missions = missions.slice(
          0,
          MAX_MISSIONS_PER_RUN
        );

        if (remainingSlots <= 0) {
          missions = missions.slice(
            0,
            MAX_MISSIONS_PER_RUN
          );
        }
      }
    }

    // =========================================================
    // 4. RIEN À EXÉCUTER
    // =========================================================

    if (missions.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "Aucune mission Intelligence arrivée à échéance.",
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        missionsExecuted: 0,
        results: [],
      });
    }

    // =========================================================
    // 5. EXÉCUTION SÉQUENTIELLE
    // =========================================================

    /*
     * Important :
     *
     * on exécute volontairement les missions UNE PAR UNE.
     *
     * On évite Promise.all() pour ne pas lancer plusieurs
     * recherches OpenAI + web search simultanément.
     */

    const results: MissionExecutionResult[] = [];

    for (const mission of missions) {
      try {
        console.log(
          `[PaxSolutio Intelligence] Exécution : ${mission.name}`
        );

        const result =
          await runIntelligenceQuery(mission.id);

        results.push({
          id: mission.id,
          name: mission.name,
          radar: mission.radar,
          success: true,
          found: result.found,
          inserted: result.inserted,
        });

        console.log(
          `[PaxSolutio Intelligence] Terminée : ${mission.name} — ${result.inserted}/${result.found} nouveaux items`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur inconnue.";

        console.error(
          `[PaxSolutio Intelligence] Échec : ${mission.name}`,
          error
        );

        results.push({
          id: mission.id,
          name: mission.name,
          radar: mission.radar,
          success: false,
          error: errorMessage,
        });

        /*
         * On continue les autres missions.
         *
         * Une mission en erreur ne doit pas empêcher tout
         * le système Intelligence de fonctionner.
         */
      }
    }

    // =========================================================
    // 6. RÉSUMÉ
    // =========================================================

    const successful =
      results.filter(
        (result) => result.success
      ).length;

    const failed =
      results.length - successful;

    const totalFound =
      results.reduce(
        (total, result) =>
          total + (result.found ?? 0),
        0
      );

    const totalInserted =
      results.reduce(
        (total, result) =>
          total + (result.inserted ?? 0),
        0
      );

    const finishedAt = new Date();

    return NextResponse.json({
      success: failed === 0,

      startedAt:
        startedAt.toISOString(),

      finishedAt:
        finishedAt.toISOString(),

      durationMs:
        finishedAt.getTime() -
        startedAt.getTime(),

      missionsExecuted:
        results.length,

      successful,

      failed,

      totalFound,

      totalInserted,

      results,
    });
  } catch (error) {
    console.error(
      "Erreur Cron PaxSolutio Intelligence :",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Erreur Cron Intelligence inconnue.",
      },
      {
        status: 500,
      }
    );
  }
}