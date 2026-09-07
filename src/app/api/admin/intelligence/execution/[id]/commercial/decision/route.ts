import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type CommercialDecision =
    | "commercial_ready"
    | "keep_in_review"
    | "rejected";

export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const body =
            await request.json();

        const decision =
            body.decision as
            | CommercialDecision
            | undefined;

        const decisionNotes =
            typeof body.decision_notes ===
                "string"
                ? body.decision_notes.trim()
                : "";

        if (
            !decision ||
            ![
                "commercial_ready",
                "keep_in_review",
                "rejected",
            ].includes(decision)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Décision commerciale invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            createServerSupabaseClient();

        /*
         * Projet Execution
         */

        const {
            data: project,
            error: projectError,
        } = await supabase
            .from(
                "intelligence_execution_projects"
            )
            .select("*")
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

        /*
         * Dossier commercial
         */

        const {
            data: commercial,
            error: commercialError,
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

        if (commercialError) {
            throw commercialError;
        }

        /*
         * Vérifications de préparation
         */

        const blockingReasons: string[] =
            [];

        const warnings: string[] = [];

        const salePrice =
            commercial.final_sale_price ??
            commercial.target_sale_price ??
            null;

        if (
            salePrice === null ||
            Number(salePrice) <= 0
        ) {
            blockingReasons.push(
                "Aucun prix de vente valide n'est défini."
            );
        }

        if (
            !commercial.pricing_validated
        ) {
            blockingReasons.push(
                "Le prix commercial n'est pas validé."
            );
        }

        if (
            !commercial
                .commercial_offer_ready
        ) {
            blockingReasons.push(
                "L'offre commerciale n'est pas prête."
            );
        }

        /*
         * Conformité
         */

        const {
            data: compliance,
            error: complianceError,
        } = await supabase
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
                    ascending: false,
                }
            )
            .limit(1)
            .maybeSingle();

        if (complianceError) {
            throw complianceError;
        }

        if (compliance) {
            const {
                data: complianceItems,
                error:
                complianceItemsError,
            } = await supabase
                .from(
                    "intelligence_execution_compliance_items"
                )
                .select("*")
                .eq(
                    "compliance_id",
                    compliance.id
                );

            if (
                complianceItemsError
            ) {
                throw complianceItemsError;
            }

            const complianceBlockers =
                (
                    complianceItems ?? []
                ).filter(
                    (item) =>
                        item.required === true &&
                        item.blocking === true &&
                        ![
                            "valid",
                            "validated",
                        ].includes(
                            String(
                                item.status ?? ""
                            ).toLowerCase()
                        )
                );

            if (
                complianceBlockers.length >
                0
            ) {
                blockingReasons.push(
                    `${complianceBlockers.length} blocage(s) de conformité restent à résoudre.`
                );
            }
        }

        /*
         * Documents logistiques
         */

        const {
            data: shipments,
            error: shipmentsError,
        } = await supabase
            .from(
                "intelligence_execution_shipments"
            )
            .select("id")
            .eq(
                "execution_project_id",
                id
            );

        if (shipmentsError) {
            throw shipmentsError;
        }

        const shipmentIds =
            (shipments ?? []).map(
                (shipment) =>
                    shipment.id
            );

        if (
            shipmentIds.length > 0
        ) {
            const {
                data: documents,
                error:
                documentsError,
            } = await supabase
                .from(
                    "intelligence_execution_shipment_documents"
                )
                .select("*")
                .in(
                    "shipment_id",
                    shipmentIds
                );

            if (documentsError) {
                throw documentsError;
            }

            const documentBlockers =
                (
                    documents ?? []
                ).filter(
                    (document) =>
                        document.required ===
                        true &&
                        document.blocking ===
                        true &&
                        document.status !==
                        "verified"
                );

            if (
                documentBlockers.length >
                0
            ) {
                blockingReasons.push(
                    `${documentBlockers.length} document(s) logistique(s) bloquant(s) ne sont pas vérifiés.`
                );
            }
        }

        /*
         * Éléments non bloquants,
         * mais signalés à l'humain
         */

        if (
            !commercial
                .warranty_defined
        ) {
            warnings.push(
                "Garantie non définie."
            );
        }

        if (
            !commercial
                .after_sales_defined
        ) {
            warnings.push(
                "SAV non défini."
            );
        }

        if (
            !commercial
                .product_assets_ready
        ) {
            warnings.push(
                "Visuels produits non finalisés."
            );
        }

        const checklist = [
            Boolean(
                commercial
                    .warranty_defined
            ),
            Boolean(
                commercial
                    .after_sales_defined
            ),
            Boolean(
                commercial
                    .commercial_offer_ready
            ),
            Boolean(
                commercial
                    .product_assets_ready
            ),
            Boolean(
                commercial
                    .pricing_validated
            ),
        ];

        const completed =
            checklist.filter(
                Boolean
            ).length;

        const readinessScore =
            Math.round(
                (completed /
                    checklist.length) *
                100
            );

        /*
         * Commercial Ready :
         * blocages interdits.
         */

        if (
            decision ===
            "commercial_ready" &&
            blockingReasons.length > 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le projet ne peut pas encore passer en Commercial Ready.",
                    blockingReasons,
                    warnings,
                    readinessScore,
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Snapshot de la décision
         */

        const {
            data:
            commercialDecision,
            error: decisionError,
        } = await supabase
            .from(
                "intelligence_execution_commercial_decisions"
            )
            .insert({
                execution_project_id:
                    id,

                commercial_id:
                    commercial.id,

                decision,

                decision_notes:
                    decisionNotes ||
                    null,

                landed_cost_total:
                    commercial
                        .landed_cost_total,

                final_sale_price:
                    salePrice,

                gross_margin_amount:
                    commercial
                        .gross_margin_amount,

                gross_margin_percent:
                    commercial
                        .gross_margin_percent,

                readiness_score:
                    readinessScore,
            })
            .select("*")
            .single();

        if (decisionError) {
            throw decisionError;
        }

        /*
         * Mise à jour du dossier
         * commercial
         */

        let validationStatus =
            "pending";

        let commercialStatus =
            "review";

        let validatedAt:
            | string
            | null = null;

        if (
            decision ===
            "commercial_ready"
        ) {
            validationStatus =
                "approved";

            commercialStatus =
                "ready";

            validatedAt =
                new Date().toISOString();
        }

        if (
            decision ===
            "rejected"
        ) {
            validationStatus =
                "rejected";

            commercialStatus =
                "blocked";
        }

        const {
            data:
            updatedCommercial,
            error:
            updateCommercialError,
        } = await supabase
            .from(
                "intelligence_execution_commercial"
            )
            .update({
                status:
                    commercialStatus,

                human_validation_status:
                    validationStatus,

                human_validation_notes:
                    decisionNotes ||
                    null,

                validated_at:
                    validatedAt,

                updated_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                commercial.id
            )
            .select("*")
            .single();

        if (
            updateCommercialError
        ) {
            throw updateCommercialError;
        }

        /*
         * Le statut Execution ne passe
         * à commercial_ready qu'après
         * validation humaine.
         */

        if (
            decision ===
            "commercial_ready"
        ) {
            const {
                error:
                projectUpdateError,
            } = await supabase
                .from(
                    "intelligence_execution_projects"
                )
                .update({
                    status:
                        "commercial_ready",

                    updated_at:
                        new Date().toISOString(),
                })
                .eq("id", id);

            if (
                projectUpdateError
            ) {
                throw projectUpdateError;
            }
        }

        return NextResponse.json({
            success: true,

            decision:
                commercialDecision,

            commercial:
                updatedCommercial,

            readinessScore,

            blockingReasons,

            warnings,
        });
    } catch (error) {
        console.error(
            "Erreur validation commerciale :",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible d'enregistrer la décision commerciale.",
            },
            {
                status: 500,
            }
        );
    }
}