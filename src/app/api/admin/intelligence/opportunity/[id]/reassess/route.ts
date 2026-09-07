import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type IntelligenceAction = {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    due_date: string | null;
    notes: string | null;
    completed_at: string | null;
    updated_at: string;
};

type ReassessmentResult = {
    overall_verdict:
    | "go"
    | "review"
    | "no_go";

    executive_summary: string;

    overall_score: number;
    confidence_score: number;

    market_score: number;
    competition_score: number;
    feasibility_score: number;
    commercial_score: number;
    risk_score: number;

    pricing_score: number;
    sourcing_score: number;
    regulation_score: number;
    logistics_score: number;
    demand_score: number;
    profit_score: number;

    paxsolutio_recommendation: string;

    decision_change: string;

    decisive_evidence: string[];

    remaining_unknowns: string[];

    next_actions: Array<{
        action: string;
        priority:
        | "low"
        | "medium"
        | "high";
        rationale: string;
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

function extractOutputText(
    responseData: unknown
) {
    if (
        !responseData ||
        typeof responseData !== "object"
    ) {
        return "";
    }

    const data = responseData as {
        output?: Array<{
            content?: Array<{
                type?: string;
                text?: string;
            }>;
        }>;
    };

    if (!Array.isArray(data.output)) {
        return "";
    }

    for (const outputItem of data.output) {
        if (
            !Array.isArray(
                outputItem.content
            )
        ) {
            continue;
        }

        for (const contentItem of
            outputItem.content) {
            if (
                contentItem.type ===
                "output_text" &&
                typeof contentItem.text ===
                "string"
            ) {
                return contentItem.text;
            }
        }
    }

    return "";
}

function clampScore(value: unknown) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            100,
            Math.round(numberValue)
        )
    );
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

        const openaiApiKey =
            process.env.OPENAI_API_KEY;

        if (!openaiApiKey) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "OPENAI_API_KEY manquant.",
                },
                {
                    status: 500,
                }
            );
        }

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
            .select("*")
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
                        "Aucune étude produit terminée disponible.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            data: actions,
            error: actionsError,
        } = await auth.supabase
            .from(
                "intelligence_actions"
            )
            .select(
                `
                id,
                title,
                description,
                priority,
                status,
                due_date,
                notes,
                completed_at,
                updated_at
                `
            )
            .eq(
                "opportunity_id",
                opportunity.id
            )
            .order("created_at", {
                ascending: true,
            });

        if (actionsError) {
            throw actionsError;
        }

        const actionRows =
            (actions ??
                []) as IntelligenceAction[];

        if (actionRows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Aucune action disponible pour réévaluer le dossier.",
                },
                {
                    status: 400,
                }
            );
        }

        const usefulActions =
            actionRows.filter(
                (action) =>
                    action.status ===
                    "done" ||
                    action.status ===
                    "in_progress" ||
                    Boolean(
                        action.notes?.trim()
                    )
            );

        if (
            usefulActions.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Aucune nouvelle information exploitable. Termine une action ou ajoute une note avant de réévaluer le dossier.",
                },
                {
                    status: 400,
                }
            );
        }

        const sourceIds = Array.from(
            new Set<string>([
                ...(
                    opportunity.source_item_ids ??
                    []
                ),
                ...(
                    study.source_item_ids ??
                    []
                ),
            ])
        );

        let sourceItems: unknown[] = [];

        if (sourceIds.length > 0) {
            const {
                data: sources,
                error: sourcesError,
            } = await auth.supabase
                .from(
                    "intelligence_items"
                )
                .select(
                    `
                    id,
                    title,
                    summary,
                    analysis,
                    total_score,
                    confidence_score,
                    detected_at
                    `
                )
                .in("id", sourceIds);

            if (sourcesError) {
                throw sourcesError;
            }

            sourceItems =
                sources ?? [];
        }

        const currentStudyContext = {
            product_name:
                study.product_name,

            overall_verdict:
                study.overall_verdict,

            executive_summary:
                study.executive_summary,

            overall_score:
                study.overall_score,

            confidence_score:
                study.confidence_score,

            market_score:
                study.market_score,

            competition_score:
                study.competition_score,

            feasibility_score:
                study.feasibility_score,

            commercial_score:
                study.commercial_score,

            risk_score:
                study.risk_score,

            pricing_score:
                study.pricing_score,

            sourcing_score:
                study.sourcing_score,

            regulation_score:
                study.regulation_score,

            logistics_score:
                study.logistics_score,

            demand_score:
                study.demand_score,

            profit_score:
                study.profit_score,

            paxsolutio_recommendation:
                study.paxsolutio_recommendation,

            market_analysis:
                study.market_analysis,

            pricing_analysis:
                study.pricing_analysis,

            competition_analysis:
                study.competition_analysis,

            supplier_analysis:
                study.supplier_analysis,

            regulatory_analysis:
                study.regulatory_analysis,

            logistics_analysis:
                study.logistics_analysis,

            risk_analysis:
                study.risk_analysis,

            commercial_analysis:
                study.commercial_analysis,
        };

        const prompt = `
Tu es PaxSolutio Intelligence.

Ta mission est de RÉÉVALUER un dossier produit existant après exécution partielle ou totale de son plan d'action.

Tu ne réalises PAS une nouvelle étude complète.
Tu dois déterminer ce que les nouvelles informations opérationnelles changent réellement dans la décision.

DOSSIER :
${JSON.stringify(
            {
                id: opportunity.id,
                title: opportunity.title,
                product_name:
                    opportunity.product_name,
                summary:
                    opportunity.summary,
                rationale:
                    opportunity.rationale,
            },
            null,
            2
        )}

ÉTUDE EXISTANTE :
${JSON.stringify(
            currentStudyContext,
            null,
            2
        )}

SIGNAUX INTELLIGENCE EXISTANTS :
${JSON.stringify(
            sourceItems,
            null,
            2
        )}

ACTIONS ET INFORMATIONS OPÉRATIONNELLES :
${JSON.stringify(
            actionRows,
            null,
            2
        )}

RÈGLES IMPORTANTES :

1. Les notes saisies dans les actions représentent des informations opérationnelles internes.
2. Ne les transforme pas automatiquement en faits certains.
3. Si une note est vague, non sourcée ou contradictoire, réduis son poids dans la décision.
4. Une action marquée "done" ne signifie pas automatiquement que son résultat est positif.
5. Distingue clairement :
   - ce qui est confirmé,
   - ce qui reste incertain,
   - ce qui change réellement la décision.
6. Ne crée aucun prix, marge, réglementation, homologation, fournisseur ou donnée commerciale qui n'est pas présent dans le contexte.
7. Ne modifie un score que si les nouvelles informations le justifient.
8. Le score risque fonctionne ainsi :
   0 = très faible risque
   100 = risque extrêmement élevé.
9. Tous les autres scores :
   0 = très mauvais
   100 = excellent.
10. Le verdict doit être :
   - "go" : éléments suffisamment solides pour avancer concrètement ;
   - "review" : potentiel réel mais informations critiques encore manquantes ;
   - "no_go" : obstacle majeur, risque disproportionné ou potentiel insuffisant.
11. La recommandation PaxSolutio doit expliquer la décision commerciale réelle à prendre.
12. "decision_change" doit expliquer précisément ce qui a changé par rapport à l'étude précédente.
13. "decisive_evidence" contient uniquement les nouvelles informations qui influencent réellement la décision.
14. "remaining_unknowns" contient les inconnues qui empêchent éventuellement de passer à GO.
15. "next_actions" doit contenir uniquement les prochaines actions réellement nécessaires après cette réévaluation.

Retourne uniquement le JSON demandé.
`;

        const schema = {
            type: "object",

            additionalProperties:
                false,

            properties: {
                overall_verdict: {
                    type: "string",
                    enum: [
                        "go",
                        "review",
                        "no_go",
                    ],
                },

                executive_summary: {
                    type: "string",
                },

                overall_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                confidence_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                market_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                competition_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                feasibility_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                commercial_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                risk_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                pricing_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                sourcing_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                regulation_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                logistics_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                demand_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                profit_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                },

                paxsolutio_recommendation: {
                    type: "string",
                },

                decision_change: {
                    type: "string",
                },

                decisive_evidence: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },

                remaining_unknowns: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },

                next_actions: {
                    type: "array",

                    items: {
                        type: "object",

                        additionalProperties:
                            false,

                        properties: {
                            action: {
                                type: "string",
                            },

                            priority: {
                                type: "string",
                                enum: [
                                    "low",
                                    "medium",
                                    "high",
                                ],
                            },

                            rationale: {
                                type: "string",
                            },
                        },

                        required: [
                            "action",
                            "priority",
                            "rationale",
                        ],
                    },
                },
            },

            required: [
                "overall_verdict",
                "executive_summary",
                "overall_score",
                "confidence_score",
                "market_score",
                "competition_score",
                "feasibility_score",
                "commercial_score",
                "risk_score",
                "pricing_score",
                "sourcing_score",
                "regulation_score",
                "logistics_score",
                "demand_score",
                "profit_score",
                "paxsolutio_recommendation",
                "decision_change",
                "decisive_evidence",
                "remaining_unknowns",
                "next_actions",
            ],
        };

        const openaiResponse =
            await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${openaiApiKey}`,
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        model:
                            "gpt-5.6-terra",

                        reasoning: {
                            effort: "medium",
                        },

                        input: prompt,

                        text: {
                            format: {
                                type: "json_schema",
                                name: "paxsolutio_reassessment",
                                strict: true,
                                schema,
                            },
                        },
                    }),
                }
            );

        const responseData =
            await openaiResponse.json();

        if (!openaiResponse.ok) {
            console.error(
                "Erreur OpenAI réévaluation :",
                responseData
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Erreur OpenAI lors de la réévaluation.",
                },
                {
                    status: 500,
                }
            );
        }

        const outputText =
            extractOutputText(
                responseData
            );

        if (!outputText) {
            console.error(
                "Réponse OpenAI sans output_text exploitable :",
                responseData
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Réponse OpenAI vide.",
                },
                {
                    status: 500,
                }
            );
        }

        let reassessment: ReassessmentResult;

        try {
            reassessment =
                JSON.parse(
                    outputText
                ) as ReassessmentResult;
        } catch (parseError) {
            console.error(
                "Erreur parsing réévaluation :",
                parseError,
                outputText
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Impossible de lire la réévaluation générée.",
                },
                {
                    status: 500,
                }
            );
        }

        const previousSnapshot = {
            verdict:
                study.overall_verdict,

            overall_score:
                study.overall_score,

            confidence_score:
                study.confidence_score,

            market_score:
                study.market_score,

            competition_score:
                study.competition_score,

            feasibility_score:
                study.feasibility_score,

            commercial_score:
                study.commercial_score,

            risk_score:
                study.risk_score,

            pricing_score:
                study.pricing_score,

            sourcing_score:
                study.sourcing_score,

            regulation_score:
                study.regulation_score,

            logistics_score:
                study.logistics_score,

            demand_score:
                study.demand_score,

            profit_score:
                study.profit_score,
        };

        const {
            data: reassessmentRow,
            error: reassessmentInsertError,
        } = await auth.supabase
            .from(
                "intelligence_reassessments"
            )
            .insert({
                opportunity_id:
                    opportunity.id,

                study_id:
                    study.id,

                previous_verdict:
                    previousSnapshot.verdict,

                new_verdict:
                    reassessment.overall_verdict,

                previous_overall_score:
                    previousSnapshot.overall_score,

                new_overall_score:
                    clampScore(
                        reassessment.overall_score
                    ),

                previous_confidence_score:
                    previousSnapshot.confidence_score,

                new_confidence_score:
                    clampScore(
                        reassessment.confidence_score
                    ),

                previous_market_score:
                    previousSnapshot.market_score,

                new_market_score:
                    clampScore(
                        reassessment.market_score
                    ),

                previous_competition_score:
                    previousSnapshot.competition_score,

                new_competition_score:
                    clampScore(
                        reassessment.competition_score
                    ),

                previous_feasibility_score:
                    previousSnapshot.feasibility_score,

                new_feasibility_score:
                    clampScore(
                        reassessment.feasibility_score
                    ),

                previous_commercial_score:
                    previousSnapshot.commercial_score,

                new_commercial_score:
                    clampScore(
                        reassessment.commercial_score
                    ),

                previous_risk_score:
                    previousSnapshot.risk_score,

                new_risk_score:
                    clampScore(
                        reassessment.risk_score
                    ),

                previous_pricing_score:
                    previousSnapshot.pricing_score,

                new_pricing_score:
                    clampScore(
                        reassessment.pricing_score
                    ),

                previous_sourcing_score:
                    previousSnapshot.sourcing_score,

                new_sourcing_score:
                    clampScore(
                        reassessment.sourcing_score
                    ),

                previous_regulation_score:
                    previousSnapshot.regulation_score,

                new_regulation_score:
                    clampScore(
                        reassessment.regulation_score
                    ),

                previous_logistics_score:
                    previousSnapshot.logistics_score,

                new_logistics_score:
                    clampScore(
                        reassessment.logistics_score
                    ),

                previous_demand_score:
                    previousSnapshot.demand_score,

                new_demand_score:
                    clampScore(
                        reassessment.demand_score
                    ),

                previous_profit_score:
                    previousSnapshot.profit_score,

                new_profit_score:
                    clampScore(
                        reassessment.profit_score
                    ),

                executive_summary:
                    reassessment.executive_summary,

                decision_change:
                    reassessment.decision_change,

                paxsolutio_recommendation:
                    reassessment.paxsolutio_recommendation,

                decisive_evidence:
                    reassessment.decisive_evidence,

                remaining_unknowns:
                    reassessment.remaining_unknowns,

                next_actions:
                    reassessment.next_actions,

                action_ids:
                    actionRows.map(
                        (action) =>
                            action.id
                    ),

                useful_action_ids:
                    usefulActions.map(
                        (action) =>
                            action.id
                    ),

                model:
                    "gpt-5.6-terra",

                metadata: {
                    action_count:
                        actionRows.length,

                    useful_action_count:
                        usefulActions.length,

                    source_item_count:
                        sourceItems.length,
                },
            })
            .select("id")
            .single();

        if (reassessmentInsertError) {
            throw reassessmentInsertError;
        }

        const now =
            new Date().toISOString();

        const {
            data: updatedStudy,
            error: updateStudyError,
        } = await auth.supabase
            .from(
                "intelligence_product_studies"
            )
            .update({
                overall_verdict:
                    reassessment.overall_verdict,

                executive_summary:
                    reassessment.executive_summary,

                overall_score:
                    clampScore(
                        reassessment.overall_score
                    ),

                confidence_score:
                    clampScore(
                        reassessment.confidence_score
                    ),

                market_score:
                    clampScore(
                        reassessment.market_score
                    ),

                competition_score:
                    clampScore(
                        reassessment.competition_score
                    ),

                feasibility_score:
                    clampScore(
                        reassessment.feasibility_score
                    ),

                commercial_score:
                    clampScore(
                        reassessment.commercial_score
                    ),

                risk_score:
                    clampScore(
                        reassessment.risk_score
                    ),

                pricing_score:
                    clampScore(
                        reassessment.pricing_score
                    ),

                sourcing_score:
                    clampScore(
                        reassessment.sourcing_score
                    ),

                regulation_score:
                    clampScore(
                        reassessment.regulation_score
                    ),

                logistics_score:
                    clampScore(
                        reassessment.logistics_score
                    ),

                demand_score:
                    clampScore(
                        reassessment.demand_score
                    ),

                profit_score:
                    clampScore(
                        reassessment.profit_score
                    ),

                paxsolutio_recommendation:
                    reassessment.paxsolutio_recommendation,

                model:
                    "gpt-5.6-terra",

                updated_at: now,
                completed_at: now,
            })
            .eq("id", study.id)
            .select("*")
            .single();

        if (updateStudyError) {
            throw updateStudyError;
        }

        return NextResponse.json({
            success: true,

            reassessment,

            reassessmentId:
                reassessmentRow.id,

            study: updatedStudy,

            actionsAnalyzed:
                actionRows.length,

            usefulActions:
                usefulActions.length,
        });
    } catch (error) {
        console.error(
            "Erreur réévaluation Intelligence :",
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