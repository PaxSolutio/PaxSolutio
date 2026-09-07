import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

const ALLOWED_STATUSES = [
    "qualification",
    "sourcing",
    "quotation",
    "sample",
    "compliance",
    "logistics",
    "commercial_ready",
    "launched",
    "cancelled",
];

const ALLOWED_PRIORITIES = [
    "low",
    "medium",
    "high",
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

function toNullableNumber(
    value: unknown
): number | null | undefined {
    if (
        value === undefined
    ) {
        return undefined;
    }

    if (
        value === null ||
        value === ""
    ) {
        return null;
    }

    const parsed =
        Number(value);

    if (
        Number.isNaN(parsed)
    ) {
        return undefined;
    }

    return parsed;
}

function toNullableString(
    value: unknown
): string | null | undefined {
    if (
        value === undefined
    ) {
        return undefined;
    }

    if (
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

export async function PATCH(
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

        const updatePayload: Record<
            string,
            unknown
        > = {
            updated_at:
                new Date().toISOString(),
        };

        if (
            body.status !== undefined
        ) {
            if (
                !ALLOWED_STATUSES.includes(
                    body.status
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Statut invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updatePayload.status =
                body.status;
        }

        if (
            body.priority !== undefined
        ) {
            if (
                !ALLOWED_PRIORITIES.includes(
                    body.priority
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Priorité invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updatePayload.priority =
                body.priority;
        }

        const targetMarket =
            toNullableString(
                body.target_market
            );

        if (
            targetMarket !== undefined
        ) {
            updatePayload.target_market =
                targetMarket;
        }

        const targetCountry =
            toNullableString(
                body.target_country
            );

        if (
            targetCountry !== undefined
        ) {
            updatePayload.target_country =
                targetCountry;
        }

        const currency =
            toNullableString(
                body.currency
            );

        if (
            currency !== undefined
        ) {
            updatePayload.currency =
                currency ?? "EUR";
        }

        const targetPurchasePrice =
            toNullableNumber(
                body.target_purchase_price
            );

        if (
            targetPurchasePrice !==
            undefined
        ) {
            updatePayload.target_purchase_price =
                targetPurchasePrice;
        }

        const targetLandedCost =
            toNullableNumber(
                body.target_landed_cost
            );

        if (
            targetLandedCost !==
            undefined
        ) {
            updatePayload.target_landed_cost =
                targetLandedCost;
        }

        const targetSalePrice =
            toNullableNumber(
                body.target_sale_price
            );

        if (
            targetSalePrice !==
            undefined
        ) {
            updatePayload.target_sale_price =
                targetSalePrice;
        }

        const supplierNotes =
            toNullableString(
                body.supplier_notes
            );

        if (
            supplierNotes !== undefined
        ) {
            updatePayload.supplier_notes =
                supplierNotes;
        }

        const complianceNotes =
            toNullableString(
                body.compliance_notes
            );

        if (
            complianceNotes !== undefined
        ) {
            updatePayload.compliance_notes =
                complianceNotes;
        }

        const logisticsNotes =
            toNullableString(
                body.logistics_notes
            );

        if (
            logisticsNotes !== undefined
        ) {
            updatePayload.logistics_notes =
                logisticsNotes;
        }

        const commercialNotes =
            toNullableString(
                body.commercial_notes
            );

        if (
            commercialNotes !== undefined
        ) {
            updatePayload.commercial_notes =
                commercialNotes;
        }

        const internalNotes =
            toNullableString(
                body.internal_notes
            );

        if (
            internalNotes !== undefined
        ) {
            updatePayload.internal_notes =
                internalNotes;
        }

        const {
            data: project,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .update(
                updatePayload
            )
            .eq("id", id)
            .select("*")
            .maybeSingle();

        if (error) {
            throw error;
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

        return NextResponse.json({
            success: true,
            project,
        });
    } catch (error) {
        console.error(
            "Erreur mise à jour projet d'exécution :",
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