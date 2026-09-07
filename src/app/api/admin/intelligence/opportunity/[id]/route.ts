import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type OpportunityStatus =
    | "to_review"
    | "analyzing"
    | "validated"
    | "rejected"
    | "converted";

type UpdateBody = {
    status?: OpportunityStatus;
    notes?: string;
};

const allowedStatuses: OpportunityStatus[] = [
    "to_review",
    "analyzing",
    "validated",
    "rejected",
    "converted",
];

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        // =====================================================
        // AUTH
        // =====================================================

        const authSupabase =
            await createAuthServerClient();

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

        const supabase =
            createServerSupabaseClient();

        const {
            data: admin,
            error: adminError,
        } = await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (adminError || !admin) {
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

        // =====================================================
        // BODY
        // =====================================================

        let body: UpdateBody;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    error: "Corps JSON invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            body.status !== undefined &&
            !allowedStatuses.includes(body.status)
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

        const updates: {
            status?: OpportunityStatus;
            notes?: string | null;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.status !== undefined) {
            updates.status = body.status;
        }

        if (body.notes !== undefined) {
            updates.notes =
                body.notes.trim() || null;
        }

        // =====================================================
        // UPDATE
        // =====================================================

        const {
            data: opportunity,
            error,
        } = await supabase
            .from("intelligence_opportunities")
            .update(updates)
            .eq("id", id)
            .select()
            .maybeSingle();

        if (error) {
            console.error(
                "Erreur mise à jour dossier Intelligence :",
                error
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Impossible de mettre à jour le dossier.",
                },
                {
                    status: 500,
                }
            );
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

        return NextResponse.json({
            success: true,
            opportunity,
        });
    } catch (error) {
        console.error(
            "Erreur PATCH dossier Intelligence :",
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