import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

const ALLOWED_SUPPLIER_TYPES = [
    "factory",
    "trading_company",
    "distributor",
    "agent",
    "other",
];

const ALLOWED_VERIFICATION_STATUSES = [
    "unverified",
    "in_review",
    "verified",
    "rejected",
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

function nullableInteger(
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
        !Number.isInteger(parsed) ||
        parsed < 0
    ) {
        return null;
    }

    return parsed;
}

async function executionProjectExists(
    supabase: ReturnType<
        typeof createServerSupabaseClient
    >,
    executionProjectId: string
) {
    const { data, error } =
        await supabase
            .from(
                "intelligence_execution_projects"
            )
            .select("id")
            .eq(
                "id",
                executionProjectId
            )
            .maybeSingle();

    if (error) {
        throw error;
    }

    return Boolean(data);
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
            data: suppliers,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_suppliers"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .order("created_at", {
                ascending: true,
            });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            suppliers:
                suppliers ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture fournisseurs :",
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
                    error: "Non autorisé.",
                },
                {
                    status: 401,
                }
            );
        }

        const { id } =
            await context.params;

        const exists =
            await executionProjectExists(
                auth.supabase,
                id
            );

        if (!exists) {
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

        const body =
            await request.json();

        const name =
            nullableString(
                body.name
            );

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le nom du fournisseur est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const supplierType =
            ALLOWED_SUPPLIER_TYPES.includes(
                body.supplier_type
            )
                ? body.supplier_type
                : "factory";

        const verificationStatus =
            ALLOWED_VERIFICATION_STATUSES.includes(
                body.verification_status
            )
                ? body.verification_status
                : "unverified";

        const {
            data: supplier,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_suppliers"
            )
            .insert({
                execution_project_id:
                    id,

                name,

                country:
                    nullableString(
                        body.country
                    ),

                city:
                    nullableString(
                        body.city
                    ),

                contact_name:
                    nullableString(
                        body.contact_name
                    ),

                contact_email:
                    nullableString(
                        body.contact_email
                    ),

                contact_phone:
                    nullableString(
                        body.contact_phone
                    ),

                contact_wechat:
                    nullableString(
                        body.contact_wechat
                    ),

                website:
                    nullableString(
                        body.website
                    ),

                supplier_type:
                    supplierType,

                verification_status:
                    verificationStatus,

                verification_notes:
                    nullableString(
                        body.verification_notes
                    ),

                payment_terms:
                    nullableString(
                        body.payment_terms
                    ),

                production_lead_time_days:
                    nullableInteger(
                        body.production_lead_time_days
                    ),

                sample_available:
                    Boolean(
                        body.sample_available
                    ),

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
            supplier,
        });
    } catch (error) {
        console.error(
            "Erreur création fournisseur :",
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

        const supplierId =
            nullableString(
                body.supplier_id
            );

        if (!supplierId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "supplier_id est obligatoire.",
                },
                {
                    status: 400,
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

        if (
            body.name !== undefined
        ) {
            const name =
                nullableString(
                    body.name
                );

            if (!name) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Le nom du fournisseur est obligatoire.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updatePayload.name =
                name;
        }

        const stringFields = [
            "country",
            "city",
            "contact_name",
            "contact_email",
            "contact_phone",
            "contact_wechat",
            "website",
            "verification_notes",
            "payment_terms",
            "notes",
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
            body.supplier_type !==
            undefined
        ) {
            if (
                !ALLOWED_SUPPLIER_TYPES.includes(
                    body.supplier_type
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Type de fournisseur invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updatePayload.supplier_type =
                body.supplier_type;
        }

        if (
            body.verification_status !==
            undefined
        ) {
            if (
                !ALLOWED_VERIFICATION_STATUSES.includes(
                    body.verification_status
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Statut de vérification invalide.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            updatePayload.verification_status =
                body.verification_status;
        }

        if (
            body.production_lead_time_days !==
            undefined
        ) {
            updatePayload.production_lead_time_days =
                nullableInteger(
                    body.production_lead_time_days
                );
        }

        if (
            body.sample_available !==
            undefined
        ) {
            updatePayload.sample_available =
                Boolean(
                    body.sample_available
                );
        }

        const {
            data: supplier,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_suppliers"
            )
            .update(
                updatePayload
            )
            .eq(
                "id",
                supplierId
            )
            .eq(
                "execution_project_id",
                id
            )
            .select("*")
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!supplier) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Fournisseur introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json({
            success: true,
            supplier,
        });
    } catch (error) {
        console.error(
            "Erreur modification fournisseur :",
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

        const supplierId =
            nullableString(
                body.supplier_id
            );

        if (!supplierId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "supplier_id est obligatoire.",
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
                "intelligence_execution_suppliers"
            )
            .delete()
            .eq(
                "id",
                supplierId
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
            "Erreur suppression fournisseur :",
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