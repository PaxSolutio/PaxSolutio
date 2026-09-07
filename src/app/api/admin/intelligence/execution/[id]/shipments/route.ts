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

const ALLOWED_STATUSES = [
    "planning",
    "booked",
    "pickup",
    "in_transit",
    "customs",
    "delivered",
    "cancelled",
];

const ALLOWED_TRANSPORT_MODES = [
    "sea_fcl",
    "sea_lcl",
    "roro",
    "air",
    "rail",
    "road",
    "express",
    "multimodal",
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

function calculateLogisticsTotal(
    body: Record<
        string,
        unknown
    >
) {
    const freightCost =
        nullableNumber(
            body.freight_cost
        ) ?? 0;

    const insuranceCost =
        nullableNumber(
            body.insurance_cost
        ) ?? 0;

    const originCharges =
        nullableNumber(
            body.origin_charges
        ) ?? 0;

    const destinationCharges =
        nullableNumber(
            body.destination_charges
        ) ?? 0;

    const customsClearanceCost =
        nullableNumber(
            body.customs_clearance_cost
        ) ?? 0;

    const customsDuties =
        nullableNumber(
            body.customs_duties
        ) ?? 0;

    const importVat =
        nullableNumber(
            body.import_vat
        ) ?? 0;

    const otherCosts =
        nullableNumber(
            body.other_costs
        ) ?? 0;

    return (
        freightCost +
        insuranceCost +
        originCharges +
        destinationCharges +
        customsClearanceCost +
        customsDuties +
        importVat +
        otherCosts
    );
}

export async function GET(
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
            data: shipments,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipments"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            );

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            shipments:
                shipments ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture expéditions :",
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

        const {
            data: project,
            error:
                projectError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .select(
                `
                id,
                target_country,
                target_market
                `
            )
            .eq(
                "id",
                id
            )
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

        const status =
            typeof body.status ===
                "string" &&
            ALLOWED_STATUSES.includes(
                body.status
            )
                ? body.status
                : "planning";

        const transportMode =
            typeof body.transport_mode ===
                "string" &&
            ALLOWED_TRANSPORT_MODES.includes(
                body.transport_mode
            )
                ? body.transport_mode
                : null;

        const {
            data: shipment,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipments"
            )
            .insert({
                execution_project_id:
                    id,

                reference:
                    nullableString(
                        body.reference
                    ),

                status,

                transport_mode:
                    transportMode,

                incoterm:
                    nullableString(
                        body.incoterm
                    ),

                forwarder_name:
                    nullableString(
                        body.forwarder_name
                    ),

                carrier_name:
                    nullableString(
                        body.carrier_name
                    ),

                origin_country:
                    nullableString(
                        body.origin_country
                    ),

                origin_city:
                    nullableString(
                        body.origin_city
                    ),

                origin_port:
                    nullableString(
                        body.origin_port
                    ),

                destination_country:
                    nullableString(
                        body.destination_country
                    ) ??
                    project.target_country ??
                    null,

                destination_city:
                    nullableString(
                        body.destination_city
                    ),

                destination_port:
                    nullableString(
                        body.destination_port
                    ),

                pickup_date:
                    nullableString(
                        body.pickup_date
                    ),

                etd:
                    nullableString(
                        body.etd
                    ),

                eta:
                    nullableString(
                        body.eta
                    ),

                delivered_at:
                    nullableString(
                        body.delivered_at
                    ),

                booking_reference:
                    nullableString(
                        body.booking_reference
                    ),

                tracking_number:
                    nullableString(
                        body.tracking_number
                    ),

                bl_number:
                    nullableString(
                        body.bl_number
                    ),

                awb_number:
                    nullableString(
                        body.awb_number
                    ),

                container_number:
                    nullableString(
                        body.container_number
                    ),

                seal_number:
                    nullableString(
                        body.seal_number
                    ),

                container_type:
                    nullableString(
                        body.container_type
                    ),

                quantity:
                    nullableNumber(
                        body.quantity
                    ),

                gross_weight_kg:
                    nullableNumber(
                        body.gross_weight_kg
                    ),

                volume_cbm:
                    nullableNumber(
                        body.volume_cbm
                    ),

                freight_cost:
                    nullableNumber(
                        body.freight_cost
                    ),

                insurance_cost:
                    nullableNumber(
                        body.insurance_cost
                    ),

                origin_charges:
                    nullableNumber(
                        body.origin_charges
                    ),

                destination_charges:
                    nullableNumber(
                        body.destination_charges
                    ),

                customs_clearance_cost:
                    nullableNumber(
                        body.customs_clearance_cost
                    ),

                customs_duties:
                    nullableNumber(
                        body.customs_duties
                    ),

                import_vat:
                    nullableNumber(
                        body.import_vat
                    ),

                other_costs:
                    nullableNumber(
                        body.other_costs
                    ),

                currency:
                    nullableString(
                        body.currency
                    ) ?? "EUR",

                logistics_notes:
                    nullableString(
                        body.logistics_notes
                    ),

                customs_notes:
                    nullableString(
                        body.customs_notes
                    ),

                internal_notes:
                    nullableString(
                        body.internal_notes
                    ),
            })
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,

            shipment,

            calculated_logistics_total:
                calculateLogisticsTotal(
                    body
                ),
        });
    } catch (error) {
        console.error(
            "Erreur création expédition :",
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

        const shipmentId =
            nullableString(
                body.shipment_id
            );

        if (!shipmentId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "shipment_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: existing,
            error:
                existingError,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipments"
            )
            .select("*")
            .eq(
                "id",
                shipmentId
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
                        "Expédition introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        const updatePayload:
            Record<
                string,
                unknown
            > = {
                updated_at:
                    new Date().toISOString(),
            };

        const stringFields = [
            "reference",
            "incoterm",
            "forwarder_name",
            "carrier_name",

            "origin_country",
            "origin_city",
            "origin_port",

            "destination_country",
            "destination_city",
            "destination_port",

            "pickup_date",
            "etd",
            "eta",
            "delivered_at",

            "booking_reference",
            "tracking_number",

            "bl_number",
            "awb_number",
            "container_number",
            "seal_number",
            "container_type",

            "currency",

            "logistics_notes",
            "customs_notes",
            "internal_notes",
        ] as const;

        for (
            const field
            of stringFields
        ) {
            if (
                body[field] !==
                undefined
            ) {
                updatePayload[
                    field
                ] =
                    nullableString(
                        body[field]
                    );
            }
        }

        const numericFields = [
            "quantity",
            "gross_weight_kg",
            "volume_cbm",

            "freight_cost",
            "insurance_cost",
            "origin_charges",
            "destination_charges",
            "customs_clearance_cost",
            "customs_duties",
            "import_vat",
            "other_costs",
        ] as const;

        for (
            const field
            of numericFields
        ) {
            if (
                body[field] !==
                undefined
            ) {
                updatePayload[
                    field
                ] =
                    nullableNumber(
                        body[field]
                    );
            }
        }

        if (
            body.status !==
            undefined
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
                            "Statut logistique invalide.",
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
            body.transport_mode !==
            undefined
        ) {
            if (
                body.transport_mode ===
                "" ||
                body.transport_mode ===
                null
            ) {
                updatePayload.transport_mode =
                    null;
            } else if (
                ALLOWED_TRANSPORT_MODES.includes(
                    body.transport_mode
                )
            ) {
                updatePayload.transport_mode =
                    body.transport_mode;
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Mode de transport invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        const {
            data: shipment,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipments"
            )
            .update(
                updatePayload
            )
            .eq(
                "id",
                shipmentId
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
            shipment,
        });
    } catch (error) {
        console.error(
            "Erreur modification expédition :",
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

        const shipmentId =
            nullableString(
                body.shipment_id
            );

        if (!shipmentId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "shipment_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipments"
            )
            .delete()
            .eq(
                "id",
                shipmentId
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
            "Erreur suppression expédition :",
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