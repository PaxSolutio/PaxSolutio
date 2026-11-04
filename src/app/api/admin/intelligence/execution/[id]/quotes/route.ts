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

const ALLOWED_STATUSES = [
    "draft",
    "received",
    "under_review",
    "selected",
    "rejected",
];

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

function nullableNumber(
    value: unknown
): number | null {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const parsed =
        Number(value);

    if (
        !Number.isFinite(parsed) ||
        parsed < 0
    ) {
        return null;
    }

    return parsed;
}

function nullableInteger(
    value: unknown
): number | null {
    const parsed =
        nullableNumber(value);

    if (parsed === null) {
        return null;
    }

    if (!Number.isInteger(parsed)) {
        return null;
    }

    return parsed;
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

function calculateQuote(
    body: Record<string, unknown>
) {
    const quantity =
        nullableNumber(
            body.quantity
        );

    const unitPrice =
        nullableNumber(
            body.unit_price
        );

    const explicitProductCost =
        nullableNumber(
            body.product_cost
        );

    const productCost =
        explicitProductCost ??
        (
            quantity !== null &&
                unitPrice !== null
                ? quantity * unitPrice
                : null
        );

    const freightCost =
        nullableNumber(
            body.freight_cost
        ) ?? 0;

    const insuranceCost =
        nullableNumber(
            body.insurance_cost
        ) ?? 0;

    const customsDuties =
        nullableNumber(
            body.customs_duties
        ) ?? 0;

    const customsClearanceCost =
        nullableNumber(
            body.customs_clearance_cost
        ) ?? 0;

    const inlandTransportCost =
        nullableNumber(
            body.inland_transport_cost
        ) ?? 0;

    const otherCosts =
        nullableNumber(
            body.other_costs
        ) ?? 0;

    const landedCost =
        productCost === null
            ? null
            : productCost +
            freightCost +
            insuranceCost +
            customsDuties +
            customsClearanceCost +
            inlandTransportCost +
            otherCosts;

    const landedCostUnit =
        landedCost !== null &&
            quantity !== null &&
            quantity > 0
            ? landedCost /
            quantity
            : null;

    const targetSalePrice =
        nullableNumber(
            body.target_sale_price
        );

    const grossMargin =
        landedCostUnit !== null &&
            targetSalePrice !== null
            ? targetSalePrice -
            landedCostUnit
            : null;

    const grossMarginPercent =
        grossMargin !== null &&
            targetSalePrice !== null &&
            targetSalePrice > 0
            ? (
                grossMargin /
                targetSalePrice
            ) * 100
            : null;

    return {
        quantity,
        unitPrice,
        productCost,
        freightCost,
        insuranceCost,
        customsDuties,
        customsClearanceCost,
        inlandTransportCost,
        otherCosts,
        landedCost,
        landedCostUnit,
        targetSalePrice,
        grossMargin,
        grossMarginPercent,
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
                    error:
                        "Non autorisé.",
                },
                {
                    status: 401,
                }
            );
        }

        const { id } =
            await context.params;

        const {
            data: quotes,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_quotes"
            )
            .select(
                `
                *,
                supplier:intelligence_execution_suppliers (
                    id,
                    name,
                    country
                )
                `
            )
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
            quotes:
                quotes ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture cotations :",
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

        const { id } =
            await context.params;

        const body =
            (await request.json()) as Record<
                string,
                unknown
            >;

        const {
            data: project,
            error: projectError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .select("id")
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

        const supplierId =
            nullableString(
                body.supplier_id
            );

        if (supplierId) {
            const {
                data: supplier,
                error: supplierError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_suppliers"
                )
                .select("id")
                .eq(
                    "id",
                    supplierId
                )
                .eq(
                    "execution_project_id",
                    id
                )
                .maybeSingle();

            if (supplierError) {
                throw supplierError;
            }

            if (!supplier) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Ce fournisseur n'appartient pas à ce projet.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        const calculation =
            calculateQuote(body);

        if (
            calculation.quantity ===
            null ||
            calculation.quantity <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "La quantité doit être supérieure à 0.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            calculation.productCost ===
            null
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le coût produit est nécessaire.",
                },
                {
                    status: 400,
                }
            );
        }

        const status =
            typeof body.status ===
                "string" &&
                ALLOWED_STATUSES.includes(
                    body.status
                )
                ? body.status
                : "draft";

        const {
            data: quote,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_quotes"
            )
            .insert({
                execution_project_id:
                    id,

                supplier_id:
                    supplierId,

                reference:
                    nullableString(
                        body.reference
                    ),

                currency:
                    nullableString(
                        body.currency
                    ) ?? "EUR",

                quantity:
                    calculation.quantity,

                moq:
                    nullableNumber(
                        body.moq
                    ),

                unit_price:
                    calculation.unitPrice,

                incoterm:
                    nullableString(
                        body.incoterm
                    ),

                origin_location:
                    nullableString(
                        body.origin_location
                    ),

                product_cost:
                    calculation.productCost,

                freight_cost:
                    calculation.freightCost,

                insurance_cost:
                    calculation.insuranceCost,

                customs_duties:
                    calculation.customsDuties,

                customs_clearance_cost:
                    calculation.customsClearanceCost,

                inland_transport_cost:
                    calculation.inlandTransportCost,

                other_costs:
                    calculation.otherCosts,

                landed_cost:
                    calculation.landedCost,

                landed_cost_unit:
                    calculation.landedCostUnit,

                target_sale_price:
                    calculation.targetSalePrice,

                gross_margin:
                    calculation.grossMargin,

                gross_margin_percent:
                    calculation.grossMarginPercent,

                payment_terms:
                    nullableString(
                        body.payment_terms
                    ),

                production_lead_time_days:
                    nullableInteger(
                        body.production_lead_time_days
                    ),

                validity_date:
                    nullableString(
                        body.validity_date
                    ),

                status,

                notes:
                    nullableString(
                        body.notes
                    ),
            })
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,

            quote,

            calculation: {
                landed_cost:
                    calculation.landedCost,

                landed_cost_unit:
                    calculation.landedCostUnit,

                gross_margin:
                    calculation.grossMargin,

                gross_margin_percent:
                    calculation.grossMarginPercent,
            },
        });
    } catch (error) {
        console.error(
            "Erreur création cotation :",
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

export async function DELETE(
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

        const { id } =
            await context.params;

        const body =
            await request.json();

        const quoteId =
            nullableString(
                body.quote_id
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

        const { error } =
            await auth.supabase
                .from(
                    "intelligence_execution_quotes"
                )
                .delete()
                .eq(
                    "id",
                    quoteId
                )
                .eq(
                    "execution_project_id",
                    id
                );

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(
            "Erreur suppression cotation :",
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