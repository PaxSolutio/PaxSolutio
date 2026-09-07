import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

async function verifyAdmin() {
    const authSupabase =
        await createAuthServerClient();

    const {
        data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
        return null;
    }

    const supabase =
        createServerSupabaseClient();

    const { data: admin } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!admin) {
        return null;
    }

    return {
        user,
        supabase,
    };
}

export async function POST(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const auth =
            await verifyAdmin();

        if (!auth) {
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

        const { id } =
            await context.params;

        const {
            data: opportunity,
            error: opportunityError,
        } = await auth.supabase
            .from(
                "intelligence_opportunities"
            )
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (opportunityError) {
            throw opportunityError;
        }

        if (!opportunity) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Dossier Intelligence introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            data: study,
            error: studyError,
        } = await auth.supabase
            .from(
                "intelligence_product_studies"
            )
            .select(
                `
                id,
                status,
                overall_verdict,
                overall_score,
                confidence_score,
                product_name,
                paxsolutio_recommendation
                `
            )
            .eq(
                "opportunity_id",
                opportunity.id
            )
            .maybeSingle();

        if (studyError) {
            throw studyError;
        }

        if (
            !study ||
            study.status !== "completed"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Aucune étude terminée disponible.",
                },
                {
                    status: 400,
                }
            );
        }
        const {
            data: latestHumanDecision,
            error: humanDecisionError,
        } = await auth.supabase
            .from("intelligence_decisions")
            .select(
                `
        id,
        human_decision,
        decision_notes,
        created_at
        `
            )
            .eq(
                "opportunity_id",
                opportunity.id
            )
            .order("created_at", {
                ascending: false,
            })
            .limit(1)
            .maybeSingle();

        if (humanDecisionError) {
            throw humanDecisionError;
        }

        if (
            !latestHumanDecision ||
            latestHumanDecision.human_decision !==
            "go"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le passage en exécution nécessite une décision humaine GO.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: latestReassessment,
            error: reassessmentError,
        } = await auth.supabase
            .from(
                "intelligence_reassessments"
            )
            .select(
                `
                id,
                new_verdict,
                new_overall_score,
                new_confidence_score,
                paxsolutio_recommendation,
                created_at
                `
            )
            .eq(
                "opportunity_id",
                opportunity.id
            )
            .order("created_at", {
                ascending: false,
            })
            .limit(1)
            .maybeSingle();

        if (reassessmentError) {
            throw reassessmentError;
        }

        const {
            data: existingProject,
            error: existingProjectError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .select("*")
            .eq(
                "opportunity_id",
                opportunity.id
            )
            .maybeSingle();

        if (existingProjectError) {
            throw existingProjectError;
        }

        if (existingProject) {
            return NextResponse.json({
                success: true,
                alreadyExists: true,
                project: existingProject,
            });
        }

        const productName =
            study.product_name ||
            opportunity.product_name ||
            opportunity.title;

        const projectTitle =
            productName
                ? `Exécution — ${productName}`
                : `Projet d'exécution Intelligence`;

        const priority =
            typeof opportunity.priority_score ===
                "number" &&
                opportunity.priority_score >= 75
                ? "high"
                : typeof opportunity.priority_score ===
                    "number" &&
                    opportunity.priority_score < 40
                    ? "low"
                    : "medium";

        const sourceRecommendation =
            latestReassessment
                ?.paxsolutio_recommendation ||
            study.paxsolutio_recommendation ||
            null;

        const {
            data: project,
            error: createError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .insert({
                opportunity_id:
                    opportunity.id,

                study_id:
                    study.id,

                reassessment_id:
                    latestReassessment?.id ??
                    null,

                title:
                    projectTitle,

                product_name:
                    productName ?? null,

                status:
                    "qualification",

                priority,

                source_decision:
                    "go",

                internal_notes:
                    sourceRecommendation,
            })
            .select("*")
            .single();

        if (createError) {
            throw createError;
        }

        return NextResponse.json({
            success: true,
            alreadyExists: false,
            project,
        });
    } catch (error) {
        console.error(
            "Erreur création projet d'exécution :",
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Erreur inconnue.",
            },
            {
                status: 500,
            }
        );
    }
}