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

const ALLOWED_COMPLIANCE_STATUSES = [
    "not_started",
    "in_review",
    "blocked",
    "ready",
    "approved",
    "rejected",
];

const ALLOWED_RISK_LEVELS = [
    "low",
    "medium",
    "high",
    "critical",
];

const ALLOWED_REQUIREMENT_TYPES = [
    "ce_marking",
    "declaration_of_conformity",
    "certificate",
    "test_report",
    "coc",
    "labeling",
    "manual",
    "packaging",
    "reach",
    "rohs",
    "battery",
    "emc",
    "lvd",
    "red",
    "machinery",
    "weee",
    "epr",
    "customs_document",
    "other",
];

const ALLOWED_ITEM_STATUSES = [
    "missing",
    "requested",
    "received",
    "under_review",
    "valid",
    "invalid",
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

function nullableBoolean(
    value: unknown
): boolean | null {
    if (
        value === undefined ||
        value === null
    ) {
        return null;
    }

    return Boolean(value);
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

async function projectExists(
    supabase: ReturnType<
        typeof createServerSupabaseClient
    >,
    projectId: string
) {
    const {
        data,
        error,
    } = await supabase
        .from(
            "intelligence_execution_projects"
        )
        .select("id")
        .eq(
            "id",
            projectId
        )
        .maybeSingle();

    if (error) {
        throw error;
    }

    return Boolean(data);
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

    const validRequired =
        applicableRequired.filter(
            (item) =>
                item.status ===
                    "valid"
        ).length;

    const overallScore =
        applicableRequired.length >
        0
            ? (
                  validRequired /
                  applicableRequired.length
              ) * 100
            : 0;

    let inferredStatus =
        "in_review";

    if (
        rows.length === 0
    ) {
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
            data: compliance,
            error: complianceError,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance"
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
            )
            .limit(1)
            .maybeSingle();

        if (
            complianceError
        ) {
            throw complianceError;
        }

        if (!compliance) {
            return NextResponse.json({
                success: true,
                compliance: null,
                items: [],
            });
        }

        const {
            data: items,
            error: itemsError,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance_items"
            )
            .select("*")
            .eq(
                "compliance_id",
                compliance.id
            )
            .order(
                "created_at",
                {
                    ascending: true,
                }
            );

        if (itemsError) {
            throw itemsError;
        }

        return NextResponse.json({
            success: true,
            compliance,
            items:
                items ?? [],
        });
    } catch (error) {
        console.error(
            "Erreur lecture conformité :",
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

        const action =
            nullableString(
                body.action
            ) ?? "create_compliance";

        const exists =
            await projectExists(
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

        if (
            action ===
            "create_compliance"
        ) {
            const {
                data: existing,
                error:
                    existingError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance"
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
                )
                .limit(1)
                .maybeSingle();

            if (existingError) {
                throw existingError;
            }

            if (existing) {
                return NextResponse.json({
                    success: true,
                    compliance:
                        existing,
                    already_exists:
                        true,
                });
            }

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
                    target_market,
                    target_country,
                    selected_quote_id
                    `
                )
                .eq(
                    "id",
                    id
                )
                .single();

            if (projectError) {
                throw projectError;
            }

            let supplierId:
                | string
                | null = null;

            if (
                project.selected_quote_id
            ) {
                const {
                    data: quote,
                } = await auth.supabase
                    .from(
                        "intelligence_execution_quotes"
                    )
                    .select(
                        "supplier_id"
                    )
                    .eq(
                        "id",
                        project.selected_quote_id
                    )
                    .maybeSingle();

                supplierId =
                    quote?.supplier_id ??
                    null;
            }

            const {
                data: latestSample,
            } = await auth.supabase
                .from(
                    "intelligence_execution_samples"
                )
                .select(
                    "id"
                )
                .eq(
                    "execution_project_id",
                    id
                )
                .eq(
                    "test_result",
                    "approved"
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false,
                    }
                )
                .limit(1)
                .maybeSingle();

            const {
                data: compliance,
                error,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance"
                )
                .insert({
                    execution_project_id:
                        id,

                    sample_id:
                        latestSample?.id ??
                        null,

                    quote_id:
                        project.selected_quote_id ??
                        null,

                    supplier_id:
                        supplierId,

                    target_market:
                        nullableString(
                            body.target_market
                        ) ??
                        project.target_market ??
                        null,

                    target_country:
                        nullableString(
                            body.target_country
                        ) ??
                        project.target_country ??
                        null,

                    status:
                        "not_started",

                    risk_level:
                        "medium",

                    missing_requirements:
                        0,

                    blocker_count:
                        0,

                    regulatory_summary:
                        nullableString(
                            body.regulatory_summary
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
                compliance,
                already_exists:
                    false,
            });
        }

        if (
            action ===
            "add_item"
        ) {
            const complianceId =
                nullableString(
                    body.compliance_id
                );

            const title =
                nullableString(
                    body.title
                );

            if (!complianceId) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "compliance_id est obligatoire.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (!title) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Le titre de l'exigence est obligatoire.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                data: parent,
                error:
                    parentError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance"
                )
                .select("id")
                .eq(
                    "id",
                    complianceId
                )
                .eq(
                    "execution_project_id",
                    id
                )
                .maybeSingle();

            if (parentError) {
                throw parentError;
            }

            if (!parent) {
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

            const requirementType =
                typeof body.requirement_type ===
                    "string" &&
                ALLOWED_REQUIREMENT_TYPES.includes(
                    body.requirement_type
                )
                    ? body.requirement_type
                    : "other";

            const itemStatus =
                typeof body.status ===
                    "string" &&
                ALLOWED_ITEM_STATUSES.includes(
                    body.status
                )
                    ? body.status
                    : "missing";

            const {
                data: item,
                error,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance_items"
                )
                .insert({
                    compliance_id:
                        complianceId,

                    requirement_type:
                        requirementType,

                    title,

                    description:
                        nullableString(
                            body.description
                        ),

                    required:
                        nullableBoolean(
                            body.required
                        ) ??
                        true,

                    blocking:
                        nullableBoolean(
                            body.blocking
                        ) ??
                        false,

                    status:
                        itemStatus,

                    document_reference:
                        nullableString(
                            body.document_reference
                        ),

                    document_url:
                        nullableString(
                            body.document_url
                        ),

                    issuer:
                        nullableString(
                            body.issuer
                        ),

                    issue_date:
                        nullableString(
                            body.issue_date
                        ),

                    expiry_date:
                        nullableString(
                            body.expiry_date
                        ),

                    verification_notes:
                        nullableString(
                            body.verification_notes
                        ),
                })
                .select("*")
                .single();

            if (error) {
                throw error;
            }

            const compliance =
                await recalculateCompliance(
                    auth.supabase,
                    complianceId
                );

            return NextResponse.json({
                success: true,
                item,
                compliance,
            });
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    "Action inconnue.",
            },
            {
                status: 400,
            }
        );
    } catch (error) {
        console.error(
            "Erreur création conformité :",
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

        const action =
            nullableString(
                body.action
            );

        if (
            action ===
            "update_compliance"
        ) {
            const complianceId =
                nullableString(
                    body.compliance_id
                );

            if (!complianceId) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "compliance_id est obligatoire.",
                    },
                    {
                        status: 400,
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
                "target_market",
                "target_country",
                "regulatory_summary",
                "blocking_issues",
                "internal_notes",
                "decision_notes",
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
                body.risk_level !==
                undefined
            ) {
                if (
                    !ALLOWED_RISK_LEVELS.includes(
                        body.risk_level
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            error:
                                "Niveau de risque invalide.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                updatePayload.risk_level =
                    body.risk_level;
            }

            if (
                body.status !==
                undefined
            ) {
                if (
                    !ALLOWED_COMPLIANCE_STATUSES.includes(
                        body.status
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            error:
                                "Statut conformité invalide.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                updatePayload.status =
                    body.status;
            }

            const {
                data: compliance,
                error,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance"
                )
                .update(
                    updatePayload
                )
                .eq(
                    "id",
                    complianceId
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

            return NextResponse.json({
                success: true,
                compliance,
            });
        }

        if (
            action ===
            "update_item"
        ) {
            const itemId =
                nullableString(
                    body.item_id
                );

            if (!itemId) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "item_id est obligatoire.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const {
                data: existingItem,
                error:
                    existingError,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance_items"
                )
                .select(
                    `
                    *,
                    intelligence_execution_compliance!inner (
                        id,
                        execution_project_id
                    )
                    `
                )
                .eq(
                    "id",
                    itemId
                )
                .eq(
                    "intelligence_execution_compliance.execution_project_id",
                    id
                )
                .maybeSingle();

            if (existingError) {
                throw existingError;
            }

            if (!existingItem) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Exigence conformité introuvable.",
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
                "title",
                "description",
                "document_reference",
                "document_url",
                "issuer",
                "issue_date",
                "expiry_date",
                "verification_notes",
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
                body.requirement_type !==
                undefined
            ) {
                if (
                    !ALLOWED_REQUIREMENT_TYPES.includes(
                        body.requirement_type
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            error:
                                "Type d'exigence invalide.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                updatePayload.requirement_type =
                    body.requirement_type;
            }

            if (
                body.status !==
                undefined
            ) {
                if (
                    !ALLOWED_ITEM_STATUSES.includes(
                        body.status
                    )
                ) {
                    return NextResponse.json(
                        {
                            success: false,
                            error:
                                "Statut d'exigence invalide.",
                        },
                        {
                            status: 400,
                        }
                    );
                }

                updatePayload.status =
                    body.status;

                if (
                    body.status ===
                    "valid"
                ) {
                    updatePayload.verified_at =
                        new Date().toISOString();
                }
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
                data: item,
                error,
            } = await auth.supabase
                .from(
                    "intelligence_execution_compliance_items"
                )
                .update(
                    updatePayload
                )
                .eq(
                    "id",
                    itemId
                )
                .select("*")
                .single();

            if (error) {
                throw error;
            }

            const compliance =
                await recalculateCompliance(
                    auth.supabase,
                    existingItem.compliance_id
                );

            return NextResponse.json({
                success: true,
                item,
                compliance,
            });
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    "Action PATCH inconnue.",
            },
            {
                status: 400,
            }
        );
    } catch (error) {
        console.error(
            "Erreur modification conformité :",
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

        const itemId =
            nullableString(
                body.item_id
            );

        if (!itemId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "item_id est obligatoire.",
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
            .select(
                `
                id,
                compliance_id,
                intelligence_execution_compliance!inner (
                    execution_project_id
                )
                `
            )
            .eq(
                "id",
                itemId
            )
            .eq(
                "intelligence_execution_compliance.execution_project_id",
                id
            )
            .maybeSingle();

        if (itemError) {
            throw itemError;
        }

        if (!item) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Exigence introuvable.",
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
                "intelligence_execution_compliance_items"
            )
            .delete()
            .eq(
                "id",
                itemId
            );

        if (error) {
            throw error;
        }

        const compliance =
            await recalculateCompliance(
                auth.supabase,
                item.compliance_id
            );

        return NextResponse.json({
            success: true,
            compliance,
        });
    } catch (error) {
        console.error(
            "Erreur suppression exigence conformité :",
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