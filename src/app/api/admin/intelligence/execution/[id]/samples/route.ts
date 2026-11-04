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
    "planned",
    "ordered",
    "in_production",
    "shipped",
    "received",
    "testing",
    "validated",
    "corrections_required",
    "rejected",
    "cancelled",
];

const ALLOWED_RESULTS = [
    "pending",
    "approved",
    "corrections_required",
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

function nullableScore(
    value: unknown
): number | null {
    const parsed =
        nullableNumber(value);

    if (parsed === null) {
        return null;
    }

    if (
        parsed < 0 ||
        parsed > 100
    ) {
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

function calculateTotalCost(
    quantity: number,
    unitPrice: number | null,
    shippingCost: number | null,
    otherCosts: number | null
) {
    const productCost =
        unitPrice !== null
            ? quantity * unitPrice
            : 0;

    return (
        productCost +
        (shippingCost ?? 0) +
        (otherCosts ?? 0)
    );
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
            data: samples,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_samples"
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
            samples:
                samples ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture échantillons :",
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
            await request.json();

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
                selected_quote_id
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

        const quantity =
            nullableNumber(
                body.quantity
            ) ?? 1;

        if (quantity <= 0) {
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

        const supplierId =
            nullableString(
                body.supplier_id
            );

        const quoteId =
            nullableString(
                body.quote_id
            ) ??
            project.selected_quote_id ??
            null;

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

        if (quoteId) {
            const {
                data: quote,
                error: quoteError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_quotes"
                )
                .select(
                    "id, supplier_id"
                )
                .eq(
                    "id",
                    quoteId
                )
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
        }

        const unitPrice =
            nullableNumber(
                body.unit_price
            );

        const shippingCost =
            nullableNumber(
                body.shipping_cost
            );

        const otherCosts =
            nullableNumber(
                body.other_costs
            );

        const totalCost =
            calculateTotalCost(
                quantity,
                unitPrice,
                shippingCost,
                otherCosts
            );

        const status =
            typeof body.status ===
                "string" &&
            ALLOWED_STATUSES.includes(
                body.status
            )
                ? body.status
                : "planned";

        const testResult =
            typeof body.test_result ===
                "string" &&
            ALLOWED_RESULTS.includes(
                body.test_result
            )
                ? body.test_result
                : "pending";

        const {
            data: sample,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_samples"
            )
            .insert({
                execution_project_id:
                    id,

                supplier_id:
                    supplierId,

                quote_id:
                    quoteId,

                sample_reference:
                    nullableString(
                        body.sample_reference
                    ),

                quantity,

                unit_price:
                    unitPrice,

                shipping_cost:
                    shippingCost,

                other_costs:
                    otherCosts ?? 0,

                currency:
                    nullableString(
                        body.currency
                    ) ?? "EUR",

                total_cost:
                    totalCost,

                status,

                ordered_at:
                    nullableString(
                        body.ordered_at
                    ),

                expected_ship_date:
                    nullableString(
                        body.expected_ship_date
                    ),

                shipped_at:
                    nullableString(
                        body.shipped_at
                    ),

                expected_delivery_date:
                    nullableString(
                        body.expected_delivery_date
                    ),

                received_at:
                    nullableString(
                        body.received_at
                    ),

                carrier:
                    nullableString(
                        body.carrier
                    ),

                tracking_number:
                    nullableString(
                        body.tracking_number
                    ),

                tracking_url:
                    nullableString(
                        body.tracking_url
                    ),

                quality_score:
                    nullableScore(
                        body.quality_score
                    ),

                conformity_score:
                    nullableScore(
                        body.conformity_score
                    ),

                packaging_score:
                    nullableScore(
                        body.packaging_score
                    ),

                product_score:
                    nullableScore(
                        body.product_score
                    ),

                test_result:
                    testResult,

                quality_notes:
                    nullableString(
                        body.quality_notes
                    ),

                conformity_notes:
                    nullableString(
                        body.conformity_notes
                    ),

                packaging_notes:
                    nullableString(
                        body.packaging_notes
                    ),

                test_notes:
                    nullableString(
                        body.test_notes
                    ),

                corrections_requested:
                    nullableString(
                        body.corrections_requested
                    ),

                decision_notes:
                    nullableString(
                        body.decision_notes
                    ),
            })
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            sample,
        });
    } catch (error) {
        console.error(
            "Erreur création échantillon :",
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

        const sampleId =
            nullableString(
                body.sample_id
            );

        if (!sampleId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "sample_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: existing,
            error: existingError,
        } = await auth.supabase
            .from(
                "intelligence_execution_samples"
            )
            .select("*")
            .eq(
                "id",
                sampleId
            )
            .eq(
                "execution_project_id",
                id
            )
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Échantillon introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        const updatePayload: Record<
            string,
            unknown
        > = {
            updated_at:
                new Date().toISOString(),
        };

        const stringFields = [
            "sample_reference",
            "currency",
            "ordered_at",
            "expected_ship_date",
            "shipped_at",
            "expected_delivery_date",
            "received_at",
            "carrier",
            "tracking_number",
            "tracking_url",
            "quality_notes",
            "conformity_notes",
            "packaging_notes",
            "test_notes",
            "corrections_requested",
            "decision_notes",
        ] as const;

        for (
            const field of stringFields
        ) {
            if (
                body[field] !==
                undefined
            ) {
                updatePayload[field] =
                    nullableString(
                        body[field]
                    );
            }
        }

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
                            "Statut d'échantillon invalide.",
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
            body.test_result !==
            undefined
        ) {
            if (
                !ALLOWED_RESULTS.includes(
                    body.test_result
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Résultat de test invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updatePayload.test_result =
                body.test_result;
        }

        const scoreFields = [
            "quality_score",
            "conformity_score",
            "packaging_score",
            "product_score",
        ] as const;

        for (
            const field of scoreFields
        ) {
            if (
                body[field] !==
                undefined
            ) {
                updatePayload[field] =
                    nullableScore(
                        body[field]
                    );
            }
        }

        const numericFields = [
            "quantity",
            "unit_price",
            "shipping_cost",
            "other_costs",
        ] as const;

        for (
            const field of numericFields
        ) {
            if (
                body[field] !==
                undefined
            ) {
                updatePayload[field] =
                    nullableNumber(
                        body[field]
                    );
            }
        }

        const quantity =
            body.quantity !== undefined
                ? nullableNumber(
                      body.quantity
                  )
                : Number(
                      existing.quantity
                  );

        if (
            quantity === null ||
            quantity <= 0
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

        const unitPrice =
            body.unit_price !== undefined
                ? nullableNumber(
                      body.unit_price
                  )
                : existing.unit_price !==
                  null
                ? Number(
                      existing.unit_price
                  )
                : null;

        const shippingCost =
            body.shipping_cost !== undefined
                ? nullableNumber(
                      body.shipping_cost
                  )
                : existing.shipping_cost !==
                  null
                ? Number(
                      existing.shipping_cost
                  )
                : null;

        const otherCosts =
            body.other_costs !== undefined
                ? nullableNumber(
                      body.other_costs
                  )
                : existing.other_costs !==
                  null
                ? Number(
                      existing.other_costs
                  )
                : null;

        updatePayload.total_cost =
            calculateTotalCost(
                quantity,
                unitPrice,
                shippingCost,
                otherCosts
            );

        const {
            data: sample,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_samples"
            )
            .update(
                updatePayload
            )
            .eq(
                "id",
                sampleId
            )
            .eq(
                "execution_project_id",
                id
            )
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            sample,
        });
    } catch (error) {
        console.error(
            "Erreur modification échantillon :",
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

        const sampleId =
            nullableString(
                body.sample_id
            );

        if (!sampleId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "sample_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const { error } =
            await auth.supabase
                .from(
                    "intelligence_execution_samples"
                )
                .delete()
                .eq(
                    "id",
                    sampleId
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
            "Erreur suppression échantillon :",
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