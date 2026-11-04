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

const ALLOWED_STATUSES = [
    "missing",
    "requested",
    "received",
    "verified",
    "rejected",
    "not_applicable",
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

async function getShipmentForProject(
    supabase: ReturnType<
        typeof createServerSupabaseClient
    >,
    shipmentId: string,
    executionProjectId: string
) {
    const {
        data,
        error,
    } = await supabase
        .from(
            "intelligence_execution_shipments"
        )
        .select("id")
        .eq(
            "id",
            shipmentId
        )
        .eq(
            "execution_project_id",
            executionProjectId
        )
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function GET(
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

        const shipmentId =
            request.nextUrl.searchParams.get(
                "shipment_id"
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

        const shipment =
            await getShipmentForProject(
                auth.supabase,
                shipmentId,
                id
            );

        if (!shipment) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Expédition introuvable pour ce projet.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            data: documents,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipment_documents"
            )
            .select("*")
            .eq(
                "shipment_id",
                shipmentId
            )
            .order(
                "created_at",
                {
                    ascending:
                        true,
                }
            );

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            documents:
                documents ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture documents logistiques :",
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

        const shipmentId =
            nullableString(
                body.shipment_id
            );

        const documentType =
            nullableString(
                body.document_type
            );

        const documentName =
            nullableString(
                body.document_name
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

        if (!documentType) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "document_type est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!documentName) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "document_name est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const shipment =
            await getShipmentForProject(
                auth.supabase,
                shipmentId,
                id
            );

        if (!shipment) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Cette expédition n'appartient pas à ce projet.",
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
                : "missing";

        const {
            data: document,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipment_documents"
            )
            .insert({
                shipment_id:
                    shipmentId,

                document_type:
                    documentType,

                document_name:
                    documentName,

                status,

                document_url:
                    nullableString(
                        body.document_url
                    ),

                reference:
                    nullableString(
                        body.reference
                    ),

                issue_date:
                    nullableString(
                        body.issue_date
                    ),

                expiry_date:
                    nullableString(
                        body.expiry_date
                    ),

                notes:
                    nullableString(
                        body.notes
                    ),

                required:
                    body.required !==
                    undefined
                        ? Boolean(
                              body.required
                          )
                        : true,

                blocking:
                    body.blocking !==
                    undefined
                        ? Boolean(
                              body.blocking
                          )
                        : false,

                issuer:
                    nullableString(
                        body.issuer
                    ),

                verification_notes:
                    nullableString(
                        body.verification_notes
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
            document,
        });
    } catch (error) {
        console.error(
            "Erreur création document logistique :",
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

        const {
            id,
        } =
            await context.params;

        const body =
            await request.json();

        const documentId =
            nullableString(
                body.document_id
            );

        if (!documentId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "document_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: existingDocument,
            error:
                existingError,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipment_documents"
            )
            .select(
                `
                *,
                intelligence_execution_shipments!inner (
                    id,
                    execution_project_id
                )
                `
            )
            .eq(
                "id",
                documentId
            )
            .eq(
                "intelligence_execution_shipments.execution_project_id",
                id
            )
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        if (!existingDocument) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Document logistique introuvable.",
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
            "document_type",
            "document_name",
            "document_url",
            "reference",
            "issue_date",
            "expiry_date",
            "notes",
            "issuer",
            "verification_notes",
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
                            "Statut de document invalide.",
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
            body.required !==
            undefined
        ) {
            updatePayload.required =
                Boolean(
                    body.required
                );
        }

        if (
            body.blocking !==
            undefined
        ) {
            updatePayload.blocking =
                Boolean(
                    body.blocking
                );
        }

        const {
            data: document,
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipment_documents"
            )
            .update(
                updatePayload
            )
            .eq(
                "id",
                documentId
            )
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            document,
        });
    } catch (error) {
        console.error(
            "Erreur modification document logistique :",
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

        const {
            id,
        } =
            await context.params;

        const body =
            await request.json();

        const documentId =
            nullableString(
                body.document_id
            );

        if (!documentId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "document_id est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const {
            data: existingDocument,
            error:
                existingError,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipment_documents"
            )
            .select(
                `
                id,
                intelligence_execution_shipments!inner (
                    execution_project_id
                )
                `
            )
            .eq(
                "id",
                documentId
            )
            .eq(
                "intelligence_execution_shipments.execution_project_id",
                id
            )
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        if (!existingDocument) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Document logistique introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        const {
            error,
        } = await auth.supabase
            .from(
                "intelligence_execution_shipment_documents"
            )
            .delete()
            .eq(
                "id",
                documentId
            );

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(
            "Erreur suppression document logistique :",
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