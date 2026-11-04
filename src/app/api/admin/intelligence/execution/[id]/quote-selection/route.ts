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

    const { data: admin } =
        await supabase
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
            data: project,
            error: projectError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .select(
                `
                id,
                selected_quote_id,
                selected_quote_at
                `
            )
            .eq("id", id)
            .maybeSingle();

        if (projectError) {
            throw projectError;
        }

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Projet d'exécution introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            data: history,
            error: historyError,
        } = await auth.supabase
            .from(
                "intelligence_execution_quote_selections"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .order("created_at", {
                ascending: false,
            });

        if (historyError) {
            throw historyError;
        }

        return NextResponse.json({
            success: true,
            selected_quote_id:
                project.selected_quote_id,
            selected_quote_at:
                project.selected_quote_at,
            history:
                history ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture sélection cotation :",
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

        const quoteId =
            nullableString(
                body.quote_id
            );

        const decisionNotes =
            nullableString(
                body.decision_notes
            );

        if (!quoteId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "quote_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: project,
            error: projectError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .select(
                "id, selected_quote_id"
            )
            .eq("id", id)
            .maybeSingle();

        if (projectError) {
            throw projectError;
        }

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Projet d'exécution introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            data: quote,
            error: quoteError,
        } = await auth.supabase
            .from(
                "intelligence_execution_quotes"
            )
            .select(
                `
                id,
                supplier_id,
                status
                `
            )
            .eq("id", quoteId)
            .eq(
                "execution_project_id",
                id
            )
            .maybeSingle();

        if (quoteError) {
            throw quoteError;
        }

        if (!quote) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Cette cotation n'appartient pas à ce projet.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            quote.status === "rejected"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Une cotation rejetée ne peut pas être sélectionnée.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Si une autre cotation était déjà
         * sélectionnée, on enregistre d'abord
         * sa désélection dans l'historique.
         */
        if (
            project.selected_quote_id &&
            project.selected_quote_id !==
                quoteId
        ) {
            const {
                data: previousQuote,
            } = await auth.supabase
                .from(
                    "intelligence_execution_quotes"
                )
                .select(
                    "id, supplier_id"
                )
                .eq(
                    "id",
                    project.selected_quote_id
                )
                .maybeSingle();

            const {
                error:
                    deselectionError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_quote_selections"
                )
                .insert({
                    execution_project_id:
                        id,

                    quote_id:
                        project.selected_quote_id,

                    supplier_id:
                        previousQuote?.supplier_id ??
                        null,

                    decision:
                        "deselected",

                    decision_notes:
                        "Remplacée par une nouvelle sélection.",
                });

            if (deselectionError) {
                throw deselectionError;
            }
        }

        const selectedAt =
            new Date().toISOString();

        const {
            error: projectUpdateError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .update({
                selected_quote_id:
                    quoteId,

                selected_quote_at:
                    selectedAt,

                updated_at:
                    selectedAt,
            })
            .eq("id", id);

        if (projectUpdateError) {
            throw projectUpdateError;
        }

        /*
         * La cotation retenue passe
         * automatiquement au statut selected.
         */
        const {
            error: quoteUpdateError,
        } = await auth.supabase
            .from(
                "intelligence_execution_quotes"
            )
            .update({
                status:
                    "selected",

                updated_at:
                    selectedAt,
            })
            .eq("id", quoteId);

        if (quoteUpdateError) {
            throw quoteUpdateError;
        }

        /*
         * Les anciennes cotations sélectionnées
         * redeviennent simplement "under_review".
         */
        if (
            project.selected_quote_id &&
            project.selected_quote_id !==
                quoteId
        ) {
            const {
                error:
                    previousQuoteError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_quotes"
                )
                .update({
                    status:
                        "under_review",

                    updated_at:
                        selectedAt,
                })
                .eq(
                    "id",
                    project.selected_quote_id
                );

            if (previousQuoteError) {
                throw previousQuoteError;
            }
        }

        const {
            data: selection,
            error: selectionError,
        } = await auth.supabase
            .from(
                "intelligence_execution_quote_selections"
            )
            .insert({
                execution_project_id:
                    id,

                quote_id:
                    quoteId,

                supplier_id:
                    quote.supplier_id,

                decision:
                    "selected",

                decision_notes:
                    decisionNotes,
            })
            .select("*")
            .single();

        if (selectionError) {
            throw selectionError;
        }

        return NextResponse.json({
            success: true,

            selected_quote_id:
                quoteId,

            selected_quote_at:
                selectedAt,

            selection,
        });
    } catch (error) {
        console.error(
            "Erreur sélection cotation :",
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