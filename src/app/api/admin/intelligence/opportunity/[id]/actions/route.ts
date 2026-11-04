export const dynamic = "force-dynamic";
import { requireAdminRequest } from "@/lib/admin-access";
import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type StudyAction = {
    action?: string;
    priority?: "low" | "medium" | "high";
    rationale?: string;
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

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
  const accessDenied = await requireAdminRequest(_request);
  if (accessDenied) return accessDenied;

    try {
        const auth = await verifyAdmin();

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

        const { id } = await context.params;

        const { data: actions, error } =
            await auth.supabase
                .from("intelligence_actions")
                .select("*")
                .eq("opportunity_id", id)
                .order("created_at", {
                    ascending: true,
                });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            actions: actions ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur récupération actions Intelligence :",
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

export async function POST(
    _request: NextRequest,
    context: RouteContext
) {
  const accessDenied = await requireAdminRequest(_request);
  if (accessDenied) return accessDenied;

    try {
        const auth = await verifyAdmin();

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

        const { id } = await context.params;

        const body = await _request
            .json()
            .catch(() => ({}));

        const {
            data: opportunity,
            error: opportunityError,
        } = await auth.supabase
            .from("intelligence_opportunities")
            .select("id")
            .eq("id", id)
            .maybeSingle();

        if (opportunityError) {
            throw opportunityError;
        }

        if (!opportunity) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Dossier introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        if (body.mode === "manual") {
            const title =
                typeof body.title === "string"
                    ? body.title.trim()
                    : "";

            if (!title) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Le titre de la tâche est obligatoire.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const allowedPriorities = [
                "low",
                "medium",
                "high",
            ];

            const priority =
                typeof body.priority === "string" &&
                    allowedPriorities.includes(
                        body.priority
                    )
                    ? body.priority
                    : "medium";

            const description =
                typeof body.description === "string"
                    ? body.description.trim() ||
                    null
                    : null;

            const notes =
                typeof body.notes === "string"
                    ? body.notes.trim() || null
                    : null;

            let dueDate: string | null = null;

            if (
                typeof body.due_date === "string" &&
                body.due_date.length > 0
            ) {
                if (
                    !/^\d{4}-\d{2}-\d{2}$/.test(
                        body.due_date
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            error:
                                "Format d'échéance invalide.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                dueDate = body.due_date;
            }

            const {
                data: action,
                error: createError,
            } = await auth.supabase
                .from("intelligence_actions")
                .insert({
                    opportunity_id: id,
                    study_id: null,

                    title,
                    description,

                    priority,
                    status: "todo",

                    due_date: dueDate,

                    source_type: "manual",
                    source_index: null,

                    notes,
                })
                .select("*")
                .single();

            if (createError) {
                throw createError;
            }

            return NextResponse.json({
                success: true,
                mode: "manual",
                action,
            });
        }

        if (body.mode === "reassessment") {
            const reassessmentId =
                typeof body.reassessmentId === "string"
                    ? body.reassessmentId
                    : "";

            if (!reassessmentId) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Réévaluation manquante.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                data: reassessment,
                error: reassessmentError,
            } = await auth.supabase
                .from(
                    "intelligence_reassessments"
                )
                .select(
                    `
            id,
            opportunity_id,
            next_actions
            `
                )
                .eq("id", reassessmentId)
                .eq("opportunity_id", id)
                .maybeSingle();

            if (reassessmentError) {
                throw reassessmentError;
            }

            if (!reassessment) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Réévaluation introuvable.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            type ReassessmentAction = {
                action?: string;
                priority?:
                | "low"
                | "medium"
                | "high";
                rationale?: string;
            };

            const nextActions =
                Array.isArray(
                    reassessment.next_actions
                )
                    ? (reassessment.next_actions as ReassessmentAction[])
                    : [];

            const validActions =
                nextActions
                    .map((item, index) => ({
                        item,
                        index,
                    }))
                    .filter(
                        ({ item }) =>
                            typeof item.action ===
                            "string" &&
                            item.action.trim().length >
                            0
                    );

            if (validActions.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Cette réévaluation ne contient aucune nouvelle action exploitable.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            /*
             * On vérifie les tâches déjà
             * importées pour cette réévaluation.
             *
             * Cela évite les doublons si le
             * bouton est utilisé plusieurs fois.
             */
            const {
                data: existingActions,
                error: existingActionsError,
            } = await auth.supabase
                .from("intelligence_actions")
                .select("source_index")
                .eq(
                    "reassessment_id",
                    reassessment.id
                )
                .eq(
                    "source_type",
                    "reassessment"
                );

            if (existingActionsError) {
                throw existingActionsError;
            }

            const existingIndexes =
                new Set(
                    (existingActions ?? [])
                        .map(
                            (action) =>
                                action.source_index
                        )
                        .filter(
                            (
                                value
                            ): value is number =>
                                typeof value ===
                                "number"
                        )
                );

            const rows = validActions
                .filter(
                    ({ index }) =>
                        !existingIndexes.has(
                            index
                        )
                )
                .map(
                    ({ item, index }) => ({
                        opportunity_id: id,

                        /*
                         * Pour les actions issues
                         * d'une réévaluation,
                         * reassessment_id est la
                         * référence principale.
                         *
                         * study_id reste null afin
                         * de ne pas entrer en conflit
                         * avec l'ancienne contrainte
                         * unique du plan d'étude.
                         */
                        study_id: null,

                        reassessment_id:
                            reassessment.id,

                        title:
                            item.action?.trim() ||
                            "Action de réévaluation",

                        description:
                            item.rationale?.trim() ||
                            null,

                        priority:
                            item.priority ===
                                "high" ||
                                item.priority ===
                                "medium" ||
                                item.priority ===
                                "low"
                                ? item.priority
                                : "medium",

                        status: "todo",

                        due_date: null,

                        source_type:
                            "reassessment",

                        source_index: index,

                        notes: null,
                    })
                );

            let importedActions: unknown[] =
                [];

            if (rows.length > 0) {
                const {
                    data: inserted,
                    error: insertError,
                } = await auth.supabase
                    .from(
                        "intelligence_actions"
                    )
                    .insert(rows)
                    .select("*");

                if (insertError) {
                    throw insertError;
                }

                importedActions =
                    inserted ?? [];
            }

            const {
                data: allActions,
                error: allActionsError,
            } = await auth.supabase
                .from(
                    "intelligence_actions"
                )
                .select("*")
                .eq("opportunity_id", id)
                .order("created_at", {
                    ascending: true,
                });

            if (allActionsError) {
                throw allActionsError;
            }

            return NextResponse.json({
                success: true,

                mode: "reassessment",

                reassessmentId:
                    reassessment.id,

                imported:
                    importedActions.length,

                alreadyExisting:
                    validActions.length -
                    rows.length,

                total:
                    allActions?.length ?? 0,

                actions:
                    allActions ?? [],
            });
        }

        const {
            data: study,
            error: studyError,
        } = await auth.supabase
            .from("intelligence_product_studies")
            .select(
                "id, status, action_plan"
            )
            .eq("opportunity_id", id)
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
                    status: 404,
                }
            );
        }

        const actionPlan =
            Array.isArray(study.action_plan)
                ? (study.action_plan as StudyAction[])
                : [];

        if (actionPlan.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le plan d'action de l'étude est vide.",
                },
                {
                    status: 400,
                }
            );
        }

        const validActions = actionPlan
            .map((item, index) => ({
                item,
                index,
            }))
            .filter(
                ({ item }) =>
                    typeof item.action === "string" &&
                    item.action.trim().length > 0
            );

        if (validActions.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Aucune action exploitable dans l'étude.",
                },
                {
                    status: 400,
                }
            );
        }

        const rows = validActions.map(
            ({ item, index }) => ({
                opportunity_id: id,
                study_id: study.id,

                title:
                    item.action?.trim() ||
                    "Action Intelligence",

                description:
                    item.rationale?.trim() ||
                    null,

                priority:
                    item.priority === "high" ||
                        item.priority === "medium" ||
                        item.priority === "low"
                        ? item.priority
                        : "medium",

                status: "todo",

                source_type:
                    "study_action_plan",

                source_index: index,
            })
        );

        const {
            data: importedActions,
            error: insertError,
        } = await auth.supabase
            .from("intelligence_actions")
            .upsert(rows, {
                onConflict:
                    "study_id,source_type,source_index",

                ignoreDuplicates: true,
            })
            .select();

        if (insertError) {
            throw insertError;
        }

        const {
            data: allActions,
            error: actionsError,
        } = await auth.supabase
            .from("intelligence_actions")
            .select("*")
            .eq("opportunity_id", id)
            .order("created_at", {
                ascending: true,
            });

        if (actionsError) {
            throw actionsError;
        }

        return NextResponse.json({
            success: true,

            imported:
                importedActions?.length ?? 0,

            total:
                allActions?.length ?? 0,

            actions:
                allActions ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur import plan d'action Intelligence :",
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

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
  const accessDenied = await requireAdminRequest(request);
  if (accessDenied) return accessDenied;

    try {
        const auth = await verifyAdmin();

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

        const { id } = await context.params;
        const body = await request.json();

        const actionId =
            typeof body.actionId === "string"
                ? body.actionId
                : "";

        if (!actionId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Action manquante.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: existingAction,
            error: existingActionError,
        } = await auth.supabase
            .from("intelligence_actions")
            .select("*")
            .eq("id", actionId)
            .eq("opportunity_id", id)
            .maybeSingle();

        if (existingActionError) {
            throw existingActionError;
        }

        if (!existingAction) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Action introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof body.status === "string") {
            const allowedStatuses = [
                "todo",
                "in_progress",
                "done",
                "cancelled",
            ];

            if (
                !allowedStatuses.includes(
                    body.status
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Statut invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updateData.status = body.status;

            updateData.completed_at =
                body.status === "done"
                    ? new Date().toISOString()
                    : null;
        }

        if (typeof body.priority === "string") {
            const allowedPriorities = [
                "low",
                "medium",
                "high",
            ];

            if (
                !allowedPriorities.includes(
                    body.priority
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Priorité invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updateData.priority =
                body.priority;
        }

        if (
            typeof body.notes === "string" ||
            body.notes === null
        ) {
            updateData.notes =
                typeof body.notes === "string"
                    ? body.notes.trim() || null
                    : null;
        }

        if (
            typeof body.due_date === "string" ||
            body.due_date === null
        ) {
            if (
                typeof body.due_date ===
                "string" &&
                body.due_date.length > 0 &&
                !/^\d{4}-\d{2}-\d{2}$/.test(
                    body.due_date
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Format d'échéance invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updateData.due_date =
                typeof body.due_date ===
                    "string" &&
                    body.due_date.length > 0
                    ? body.due_date
                    : null;
        }

        const {
            data: action,
            error: updateError,
        } = await auth.supabase
            .from("intelligence_actions")
            .update(updateData)
            .eq("id", actionId)
            .eq("opportunity_id", id)
            .select("*")
            .single();

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            action,
        });
    } catch (error) {
        console.error(
            "Erreur mise à jour action Intelligence :",
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