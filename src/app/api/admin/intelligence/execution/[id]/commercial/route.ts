import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function numberOrNull(
    value: unknown
): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : null;
}

function calculateCommercialMetrics(
    values: {
        product_cost?: number | null;
        freight_cost?: number | null;
        insurance_cost?: number | null;
        customs_cost?: number | null;
        clearance_cost?: number | null;
        compliance_cost?: number | null;
        packaging_cost?: number | null;
        marketing_cost?: number | null;
        other_costs?: number | null;
        final_sale_price?: number | null;
        target_sale_price?: number | null;
    }
) {
    const costs = [
        values.product_cost,
        values.freight_cost,
        values.insurance_cost,
        values.customs_cost,
        values.clearance_cost,
        values.compliance_cost,
        values.packaging_cost,
        values.marketing_cost,
        values.other_costs,
    ];

    const hasAtLeastOneCost =
        costs.some(
            (value) =>
                value !== null &&
                value !== undefined
        );

    const landedCostTotal =
        hasAtLeastOneCost
            ? costs.reduce<number>(
                  (total, value) =>
                      total +
                      (typeof value === "number"
                          ? value
                          : 0),
                  0
              )
            : null;

    const salePrice =
        values.final_sale_price ??
        values.target_sale_price ??
        null;

    const grossMarginAmount =
        landedCostTotal !== null &&
        salePrice !== null
            ? salePrice -
              landedCostTotal
            : null;

    const grossMarginPercent =
        grossMarginAmount !== null &&
        landedCostTotal !== null &&
        landedCostTotal > 0
            ? (grossMarginAmount /
                  landedCostTotal) *
              100
            : null;

    return {
        landed_cost_total:
            landedCostTotal,
        gross_margin_amount:
            grossMarginAmount,
        gross_margin_percent:
            grossMarginPercent,
    };
}

export async function GET(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const supabase =
            createServerSupabaseClient();

        const {
            data: commercial,
            error,
        } = await supabase
            .from(
                "intelligence_execution_commercial"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .maybeSingle();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            commercial:
                commercial ?? null,
        });
    } catch (error) {
        console.error(
            "Erreur lecture commercialisation :",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible de charger la commercialisation.",
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
    try {
        const { id } =
            await context.params;

        const body =
            await request.json();

        const supabase =
            createServerSupabaseClient();

        const {
            data: project,
            error: projectError,
        } = await supabase
            .from(
                "intelligence_execution_projects"
            )
            .select(
                `
                id,
                currency,
                target_purchase_price,
                target_landed_cost,
                target_sale_price
                `
            )
            .eq("id", id)
            .single();

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
            data: existing,
            error: existingError,
        } = await supabase
            .from(
                "intelligence_execution_commercial"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        if (existing) {
            return NextResponse.json({
                success: true,
                commercial: existing,
                alreadyExists: true,
            });
        }

        const productCost =
            numberOrNull(
                body.product_cost
            ) ??
            numberOrNull(
                project.target_purchase_price
            );

        const targetSalePrice =
            numberOrNull(
                body.target_sale_price
            ) ??
            numberOrNull(
                project.target_sale_price
            );

        const initialValues = {
            product_cost:
                productCost,
            freight_cost:
                numberOrNull(
                    body.freight_cost
                ),
            insurance_cost:
                numberOrNull(
                    body.insurance_cost
                ),
            customs_cost:
                numberOrNull(
                    body.customs_cost
                ),
            clearance_cost:
                numberOrNull(
                    body.clearance_cost
                ),
            compliance_cost:
                numberOrNull(
                    body.compliance_cost
                ),
            packaging_cost:
                numberOrNull(
                    body.packaging_cost
                ),
            marketing_cost:
                numberOrNull(
                    body.marketing_cost
                ),
            other_costs:
                numberOrNull(
                    body.other_costs
                ),
            target_sale_price:
                targetSalePrice,
            final_sale_price:
                numberOrNull(
                    body.final_sale_price
                ),
        };

        const metrics =
            calculateCommercialMetrics(
                initialValues
            );

        const payload = {
            execution_project_id: id,

            status: "preparation",

            currency:
                body.currency ??
                project.currency ??
                "EUR",

            ...initialValues,
            ...metrics,

            landed_cost_unit:
                numberOrNull(
                    body.landed_cost_unit
                ),

            warranty_defined:
                Boolean(
                    body.warranty_defined
                ),

            after_sales_defined:
                Boolean(
                    body.after_sales_defined
                ),

            commercial_offer_ready:
                Boolean(
                    body.commercial_offer_ready
                ),

            product_assets_ready:
                Boolean(
                    body.product_assets_ready
                ),

            pricing_validated:
                Boolean(
                    body.pricing_validated
                ),

            warranty_notes:
                body.warranty_notes ??
                null,

            after_sales_notes:
                body.after_sales_notes ??
                null,

            commercial_notes:
                body.commercial_notes ??
                null,

            internal_notes:
                body.internal_notes ??
                null,
        };

        const {
            data: commercial,
            error,
        } = await supabase
            .from(
                "intelligence_execution_commercial"
            )
            .insert(payload)
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            commercial,
        });
    } catch (error) {
        console.error(
            "Erreur création commercialisation :",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible de créer la commercialisation.",
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
    try {
        const { id } =
            await context.params;

        const body =
            await request.json();

        const supabase =
            createServerSupabaseClient();

        const {
            data: existing,
            error: existingError,
        } = await supabase
            .from(
                "intelligence_execution_commercial"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .single();

        if (existingError) {
            throw existingError;
        }

        const numericFields = [
            "product_cost",
            "freight_cost",
            "insurance_cost",
            "customs_cost",
            "clearance_cost",
            "compliance_cost",
            "packaging_cost",
            "marketing_cost",
            "other_costs",
            "landed_cost_unit",
            "target_sale_price",
            "final_sale_price",
        ] as const;

        const booleanFields = [
            "warranty_defined",
            "after_sales_defined",
            "commercial_offer_ready",
            "product_assets_ready",
            "pricing_validated",
        ] as const;

        const textFields = [
            "currency",
            "warranty_notes",
            "after_sales_notes",
            "commercial_notes",
            "internal_notes",
        ] as const;

        const updatePayload: Record<
            string,
            unknown
        > = {};

        for (
            const field of numericFields
        ) {
            if (field in body) {
                updatePayload[field] =
                    numberOrNull(
                        body[field]
                    );
            }
        }

        for (
            const field of booleanFields
        ) {
            if (field in body) {
                updatePayload[field] =
                    Boolean(
                        body[field]
                    );
            }
        }

        for (
            const field of textFields
        ) {
            if (field in body) {
                updatePayload[field] =
                    body[field] ??
                    null;
            }
        }

        const mergedValues = {
            product_cost:
                "product_cost" in
                updatePayload
                    ? (updatePayload.product_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.product_cost
                      ),

            freight_cost:
                "freight_cost" in
                updatePayload
                    ? (updatePayload.freight_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.freight_cost
                      ),

            insurance_cost:
                "insurance_cost" in
                updatePayload
                    ? (updatePayload.insurance_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.insurance_cost
                      ),

            customs_cost:
                "customs_cost" in
                updatePayload
                    ? (updatePayload.customs_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.customs_cost
                      ),

            clearance_cost:
                "clearance_cost" in
                updatePayload
                    ? (updatePayload.clearance_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.clearance_cost
                      ),

            compliance_cost:
                "compliance_cost" in
                updatePayload
                    ? (updatePayload.compliance_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.compliance_cost
                      ),

            packaging_cost:
                "packaging_cost" in
                updatePayload
                    ? (updatePayload.packaging_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.packaging_cost
                      ),

            marketing_cost:
                "marketing_cost" in
                updatePayload
                    ? (updatePayload.marketing_cost as
                          | number
                          | null)
                    : numberOrNull(
                          existing.marketing_cost
                      ),

            other_costs:
                "other_costs" in
                updatePayload
                    ? (updatePayload.other_costs as
                          | number
                          | null)
                    : numberOrNull(
                          existing.other_costs
                      ),

            target_sale_price:
                "target_sale_price" in
                updatePayload
                    ? (updatePayload.target_sale_price as
                          | number
                          | null)
                    : numberOrNull(
                          existing.target_sale_price
                      ),

            final_sale_price:
                "final_sale_price" in
                updatePayload
                    ? (updatePayload.final_sale_price as
                          | number
                          | null)
                    : numberOrNull(
                          existing.final_sale_price
                      ),
        };

        const metrics =
            calculateCommercialMetrics(
                mergedValues
            );

        Object.assign(
            updatePayload,
            metrics,
            {
                updated_at:
                    new Date().toISOString(),
            }
        );

        const {
            data: commercial,
            error,
        } = await supabase
            .from(
                "intelligence_execution_commercial"
            )
            .update(updatePayload)
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
            commercial,
        });
    } catch (error) {
        console.error(
            "Erreur mise à jour commercialisation :",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible de mettre à jour la commercialisation.",
            },
            {
                status: 500,
            }
        );
    }
}