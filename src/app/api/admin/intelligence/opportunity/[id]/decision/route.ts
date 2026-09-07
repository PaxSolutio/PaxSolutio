import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

const ALLOWED_DECISIONS = [
    "go",
    "review",
    "no_go",
];

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
    request: NextRequest,
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

        const body =
            await request.json();

        const humanDecision =
            body.human_decision;

        if (
            !ALLOWED_DECISIONS.includes(
                humanDecision
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Décision invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        const decisionNotes =
            typeof body.decision_notes ===
            "string"
                ? body.decision_notes.trim() ||
                  null
                : null;

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
                confidence_score
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
                        "Une étude terminée est nécessaire avant de prendre une décision.",
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

        const aiVerdict =
            latestReassessment?.new_verdict ||
            study.overall_verdict ||
            null;

        const {
            data: decision,
            error: decisionError,
        } = await auth.supabase
            .from(
                "intelligence_decisions"
            )
            .insert({
                opportunity_id:
                    opportunity.id,

                study_id:
                    study.id,

                reassessment_id:
                    latestReassessment?.id ??
                    null,

                ai_verdict:
                    aiVerdict,

                human_decision:
                    humanDecision,

                decision_notes:
                    decisionNotes,

                decided_by:
                    auth.user.id,
            })
            .select("*")
            .single();

        if (decisionError) {
            throw decisionError;
        }

        return NextResponse.json({
            success: true,
            decision,
        });
    } catch (error) {
        console.error(
            "Erreur décision humaine Intelligence :",
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