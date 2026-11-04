export const dynamic = "force-dynamic";
import { requireAdminRequest } from "@/lib/admin-access";
import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createAuthServerClient,
} from "@/lib/supabase/auth-server";

import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

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
    } =
        await authSupabase.auth.getUser();

    if (!user) {
        return null;
    }

    const supabase =
        createServerSupabaseClient();

    const {
        data: admin,
    } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq(
            "user_id",
            user.id
        )
        .maybeSingle();

    if (!admin) {
        return null;
    }

    return {
        user,
        supabase,
    };
}

function nullableString(
    value: unknown
): string | null {
    if (
        value === undefined ||
        value === null
    ) {
        return null;
    }

    const text =
        String(value).trim();

    return text.length > 0
        ? text
        : null;
}

async function recalculateCompliance(
    supabase: ReturnType<
        typeof createServerSupabaseClient
    >,
    complianceId: string
) {
    const {
        data: items,
        error,
    } = await supabase
        .from(
            "intelligence_execution_compliance_items"
        )
        .select(
            `
            id,
            required,
            blocking,
            status
            `
        )
        .eq(
            "compliance_id",
            complianceId
        );

    if (error) {
        throw error;
    }

    const rows =
        items ?? [];

    const applicableRequired =
        rows.filter(
            (item) =>
                item.required &&
                item.status !==
                    "not_applicable"
        );

    const validRequired =
        applicableRequired.filter(
            (item) =>
                item.status ===
                    "valid"
        );

    const missingRequirements =
        applicableRequired.filter(
            (item) =>
                item.status !==
                    "valid"
        ).length;

    const blockerCount =
        rows.filter(
            (item) =>
                item.blocking &&
                item.status !==
                    "valid" &&
                item.status !==
                    "not_applicable"
        ).length;

    const overallScore =
        applicableRequired.length >
        0
            ? (
                  validRequired.length /
                  applicableRequired.length
              ) * 100
            : 0;

    let inferredStatus =
        "in_review";

    if (rows.length === 0) {
        inferredStatus =
            "not_started";
    } else if (
        blockerCount > 0
    ) {
        inferredStatus =
            "blocked";
    } else if (
        missingRequirements === 0 &&
        applicableRequired.length > 0
    ) {
        inferredStatus =
            "ready";
    }

    const {
        data: compliance,
        error: updateError,
    } = await supabase
        .from(
            "intelligence_execution_compliance"
        )
        .update({
            missing_requirements:
                missingRequirements,

            blocker_count:
                blockerCount,

            overall_score:
                Number(
                    overallScore.toFixed(
                        2
                    )
                ),

            status:
                inferredStatus,

            updated_at:
                new Date().toISOString(),
        })
        .eq(
            "id",
            complianceId
        )
        .select("*")
        .single();

    if (updateError) {
        throw updateError;
    }

    return compliance;
}

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
  const accessDenied = await requireAdminRequest(_request);
  if (accessDenied) return accessDenied;

    try {
        const auth =
            await verifyAdmin();

        if (!auth) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Non autorisé.",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            id,
        } =
            await context.params;

        const {
            data: suggestions,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance_suggestions"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .order("created_at", {
                ascending: false,
            });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            suggestions:
                suggestions ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture suggestions conformité :",
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
    request: NextRequest,
    context: RouteContext
) {
  const accessDenied = await requireAdminRequest(request);
  if (accessDenied) return accessDenied;

    try {
        const auth =
            await verifyAdmin();

        if (!auth) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Non autorisé.",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            id,
        } =
            await context.params;

        const body =
            await request.json();

        const action =
            nullableString(
                body.action
            );

        const suggestionId =
            nullableString(
                body.suggestion_id
            );

        if (!action) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "action est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!suggestionId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "suggestion_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: suggestion,
            error:
                suggestionError,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance_suggestions"
            )
            .select("*")
            .eq(
                "id",
                suggestionId
            )
            .eq(
                "execution_project_id",
                id
            )
            .maybeSingle();

        if (suggestionError) {
            throw suggestionError;
        }

        if (!suggestion) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Suggestion introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        if (
            suggestion.review_status !==
            "pending"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Cette suggestion a déjà été examinée.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * ACCEPTER
         */

        if (
            action ===
            "accept"
        ) {
            const {
                data: compliance,
                error:
                    complianceError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance"
                )
                .select("id")
                .eq(
                    "id",
                    suggestion.compliance_id
                )
                .eq(
                    "execution_project_id",
                    id
                )
                .maybeSingle();

            if (
                complianceError
            ) {
                throw complianceError;
            }

            if (!compliance) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Dossier conformité introuvable.",
                    },
                    {
                        status: 404,
                    }
                );
            }

            /*
             * Vérification anti-doublon
             * simple avant création.
             */

            const {
                data:
                    duplicateItem,
                error:
                    duplicateError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance_items"
                )
                .select(
                    "id"
                )
                .eq(
                    "compliance_id",
                    compliance.id
                )
                .eq(
                    "title",
                    suggestion.title
                )
                .maybeSingle();

            if (duplicateError) {
                throw duplicateError;
            }

            if (duplicateItem) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Une exigence portant ce titre existe déjà dans la checklist.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                data: item,
                error:
                    itemError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance_items"
                )
                .insert({
                    compliance_id:
                        compliance.id,

                    requirement_type:
                        suggestion.requirement_type,

                    title:
                        suggestion.title,

                    description:
                        suggestion.description,

                    required:
                        suggestion.suggested_required,

                    blocking:
                        suggestion.suggested_blocking,

                    /*
                     * Important :
                     * accepter une suggestion
                     * ne signifie PAS valider
                     * le document.
                     */
                    status:
                        "missing",

                    verification_notes:
                        [
                            "Exigence ajoutée depuis une suggestion IA.",
                            suggestion
                                .applicability_rationale
                                ? `Justification IA : ${suggestion.applicability_rationale}`
                                : null,
                            suggestion
                                .confidence_score !==
                            null
                                ? `Confiance IA : ${suggestion.confidence_score}/100`
                                : null,
                            Array.isArray(
                                suggestion.source_urls
                            ) &&
                            suggestion
                                .source_urls
                                .length >
                                0
                                ? `Sources IA : ${suggestion.source_urls.join(
                                      " | "
                                  )}`
                                : null,
                        ]
                            .filter(Boolean)
                            .join("\n\n"),
                })
                .select("*")
                .single();

            if (itemError) {
                throw itemError;
            }

            const reviewedAt =
                new Date().toISOString();

            const {
                data:
                    updatedSuggestion,
                error:
                    suggestionUpdateError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance_suggestions"
                )
                .update({
                    review_status:
                        "accepted",

                    accepted_item_id:
                        item.id,

                    reviewed_at:
                        reviewedAt,
                })
                .eq(
                    "id",
                    suggestion.id
                )
                .select("*")
                .single();

            if (
                suggestionUpdateError
            ) {
                throw suggestionUpdateError;
            }

            const recalculatedCompliance =
                await recalculateCompliance(
                    auth.supabase,
                    compliance.id
                );

            return NextResponse.json({
                success: true,

                action:
                    "accepted",

                suggestion:
                    updatedSuggestion,

                item,

                compliance:
                    recalculatedCompliance,
            });
        }

        /*
         * REJETER
         */

        if (
            action ===
            "reject"
        ) {
            const reviewedAt =
                new Date().toISOString();

            const {
                data:
                    updatedSuggestion,
                error,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance_suggestions"
                )
                .update({
                    review_status:
                        "rejected",

                    reviewed_at:
                        reviewedAt,
                })
                .eq(
                    "id",
                    suggestion.id
                )
                .select("*")
                .single();

            if (error) {
                throw error;
            }

            return NextResponse.json({
                success: true,

                action:
                    "rejected",

                suggestion:
                    updatedSuggestion,
            });
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    "Action inconnue. Utilise accept ou reject.",
            },
            {
                status: 400,
            }
        );
    } catch (error) {
        console.error(
            "Erreur revue suggestion conformité :",
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