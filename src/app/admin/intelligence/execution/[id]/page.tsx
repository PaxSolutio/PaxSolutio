import IntelligenceExecutionCommercial from "@/components/admin/IntelligenceExecutionCommercial";
import IntelligenceExecutionLogistics from "@/components/admin/IntelligenceExecutionLogistics";
import IntelligenceExecutionCompliance from "@/components/admin/IntelligenceExecutionCompliance";
import IntelligenceExecutionSuppliers from "@/components/admin/IntelligenceExecutionSuppliers";
import IntelligenceExecutionQuotes from "@/components/admin/IntelligenceExecutionQuotes";
import IntelligenceExecutionQuoteComparator from "@/components/admin/IntelligenceExecutionQuoteComparator";
import IntelligenceExecutionSamples from "@/components/admin/IntelligenceExecutionSamples";
import Link from "next/link";
import { notFound } from "next/navigation";

import IntelligenceExecutionEditor from "@/components/admin/IntelligenceExecutionEditor";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

const PIPELINE = [
    {
        key: "qualification",
        label: "Qualification",
    },
    {
        key: "sourcing",
        label: "Sourcing",
    },
    {
        key: "quotation",
        label: "Cotations",
    },
    {
        key: "sample",
        label: "Échantillon",
    },
    {
        key: "compliance",
        label: "Conformité",
    },
    {
        key: "logistics",
        label: "Logistique",
    },
    {
        key: "commercial_ready",
        label: "Prêt commercialement",
    },
    {
        key: "launched",
        label: "Lancé",
    },
];

function formatDate(value: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatPrice(
    value: number | null,
    currency: string | null
) {
    if (value === null) {
        return "Non défini";
    }

    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currency || "EUR",
        maximumFractionDigits: 2,
    }).format(value);
}

export default async function ExecutionProjectPage({
    params,
}: PageProps) {
    const { id } = await params;

    const supabase =
        createServerSupabaseClient();

    const {
        data: project,
        error: projectError,
    } = await supabase
        .from("intelligence_execution_projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (projectError) {
        throw projectError;
    }

    if (!project) {
        notFound();
    }

    const {
        data: suppliers,
        error: suppliersError,
    } = await supabase
        .from(
            "intelligence_execution_suppliers"
        )
        .select("*")
        .eq(
            "execution_project_id",
            project.id
        )
        .order("created_at", {
            ascending: true,
        });

    if (suppliersError) {
        throw suppliersError;
    }

    const {
        data: quotes,
        error: quotesError,
    } = await supabase
        .from(
            "intelligence_execution_quotes"
        )
        .select("*")
        .eq(
            "execution_project_id",
            project.id
        )
        .order("created_at", {
            ascending: false,
        });

    if (quotesError) {
        throw quotesError;
    }

    const {
        data: samples,
        error: samplesError,
    } = await supabase
        .from(
            "intelligence_execution_samples"
        )
        .select("*")
        .eq(
            "execution_project_id",
            project.id
        )
        .order("created_at", {
            ascending: false,
        });

    if (samplesError) {
        throw samplesError;
    }

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
            project.id
        )
        .order("created_at", {
            ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (complianceError) {
        throw complianceError;
    }

    let complianceItems: any[] =
        [];

    if (compliance) {
        const {
            data,
            error,
        } = await supabase
            .from(
                "intelligence_execution_compliance_items"
            )
            .select("*")
            .eq(
                "compliance_id",
                compliance.id
            )
            .order("created_at", {
                ascending: true,
            });

        if (error) {
            throw error;
        }

        complianceItems =
            data ?? [];
    }

    const {
        data: shipments,
        error: shipmentsError,
    } = await supabase
        .from(
            "intelligence_execution_shipments"
        )
        .select("*")
        .eq(
            "execution_project_id",
            project.id
        )
        .order("created_at", {
            ascending: false,
        });

    if (shipmentsError) {
        throw shipmentsError;
    }

    let shipmentDocuments: any[] =
        [];

    const shipmentIds =
        (shipments ?? []).map(
            (shipment) =>
                shipment.id
        );

    if (shipmentIds.length > 0) {
        const {
            data,
            error,
        } = await supabase
            .from(
                "intelligence_execution_shipment_documents"
            )
            .select("*")
            .in(
                "shipment_id",
                shipmentIds
            )
            .order("created_at", {
                ascending: true,
            });

        if (error) {
            throw error;
        }

        shipmentDocuments =
            data ?? [];
    }

    const {
        data: opportunity,
        error: opportunityError,
    } = await supabase
        .from("intelligence_opportunities")
        .select("*")
        .eq(
            "id",
            project.opportunity_id
        )
        .maybeSingle();

    if (opportunityError) {
        throw opportunityError;
    }

    const {
        data: study,
        error: studyError,
    } = project.study_id
            ? await supabase
                .from(
                    "intelligence_product_studies"
                )
                .select(
                    `
                  id,
                  title,
                  product_name,
                  overall_verdict,
                  overall_score,
                  confidence_score,
                  paxsolutio_recommendation
                  `
                )
                .eq("id", project.study_id)
                .maybeSingle()
            : {
                data: null,
                error: null,
            };

    if (studyError) {
        throw studyError;
    }

    const currentIndex =
        PIPELINE.findIndex(
            (step) =>
                step.key === project.status
        );

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
            project.id
        )
        .maybeSingle();

    if (commercialError) {
        throw commercialError;
    }

    return (
        <main className="min-h-screen bg-[#06111f] px-6 py-10 text-white lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <Link
                        href="/admin/intelligence/execution"
                        className="text-sm font-medium text-blue-300 transition hover:text-blue-200"
                    >
                        ← Projets d&apos;exécution
                    </Link>
                </div>

                <header className="mb-8 rounded-3xl border border-white/10 bg-white/[0.025] p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                                    Décision GO
                                </span>

                                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-300">
                                    {project.status}
                                </span>

                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                    Priorité{" "}
                                    {project.priority}
                                </span>
                            </div>

                            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                                {project.title}
                            </h1>

                            {project.product_name && (
                                <p className="mt-2 text-base text-slate-400">
                                    {
                                        project.product_name
                                    }
                                </p>
                            )}
                        </div>

                        <div className="text-sm text-slate-500">
                            Créé le{" "}
                            <span className="text-slate-300">
                                {formatDate(
                                    project.created_at
                                )}
                            </span>
                        </div>
                    </div>
                </header>

                <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                    <div className="mb-6">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                            Pipeline opérationnel
                        </div>

                        <h2 className="mt-2 text-xl font-semibold">
                            Progression du projet
                        </h2>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
                        {PIPELINE.map(
                            (step, index) => {
                                const completed =
                                    currentIndex >=
                                    index;

                                return (
                                    <div
                                        key={
                                            step.key
                                        }
                                        className={`rounded-xl border p-3 ${completed
                                            ? "border-blue-500/25 bg-blue-500/10"
                                            : "border-white/[0.07] bg-white/[0.02]"
                                            }`}
                                    >
                                        <div
                                            className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${completed
                                                ? "text-blue-300"
                                                : "text-slate-600"
                                                }`}
                                        >
                                            Étape{" "}
                                            {index +
                                                1}
                                        </div>

                                        <div
                                            className={`mt-2 text-xs font-medium ${completed
                                                ? "text-white"
                                                : "text-slate-500"
                                                }`}
                                        >
                                            {
                                                step.label
                                            }
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </section>

                <IntelligenceExecutionEditor
                    project={project}
                />

                <div className="mt-8">
                    <IntelligenceExecutionSuppliers
                        executionProjectId={
                            project.id
                        }
                        initialSuppliers={
                            suppliers ?? []
                        }
                    />
                </div>

                <div className="mt-8">
                    <IntelligenceExecutionQuotes
                        executionProjectId={
                            project.id
                        }
                        suppliers={
                            suppliers ?? []
                        }
                        initialQuotes={
                            quotes ?? []
                        }
                    />
                </div>

                <div className="mt-8">
                    <IntelligenceExecutionQuoteComparator
                        executionProjectId={
                            project.id
                        }
                        suppliers={
                            suppliers ?? []
                        }
                        quotes={
                            quotes ?? []
                        }
                        initialSelectedQuoteId={
                            project.selected_quote_id ??
                            null
                        }
                    />
                </div>

                <div className="mt-8">
                    <IntelligenceExecutionSamples
                        executionProjectId={
                            project.id
                        }
                        suppliers={
                            suppliers ?? []
                        }
                        quotes={
                            quotes ?? []
                        }
                        selectedQuoteId={
                            project.selected_quote_id ??
                            null
                        }
                        initialSamples={
                            samples ?? []
                        }
                    />
                </div>

                <div className="mt-8">
                    <IntelligenceExecutionCompliance
                        executionProjectId={
                            project.id
                        }
                        initialCompliance={
                            compliance
                        }
                        initialItems={
                            complianceItems
                        }
                        targetMarket={
                            project.target_market ??
                            null
                        }
                        targetCountry={
                            project.target_country ??
                            null
                        }
                    />
                </div>

                <div className="mt-8">
                    <IntelligenceExecutionLogistics
                        executionProjectId={
                            project.id
                        }
                        initialShipments={
                            shipments ?? []
                        }
                        initialDocuments={
                            shipmentDocuments
                        }
                        targetCountry={
                            project.target_country ??
                            null
                        }
                    />
                </div>

                <div className="mt-8">
                    <IntelligenceExecutionCommercial
                        executionProjectId={
                            project.id
                        }
                        initialCommercial={
                            commercial
                        }
                    />
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                            <h2 className="text-lg font-semibold">
                                Objectifs commerciaux
                            </h2>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                <DataCard
                                    label="Prix d'achat cible"
                                    value={formatPrice(
                                        project.target_purchase_price,
                                        project.currency
                                    )}
                                />

                                <DataCard
                                    label="Coût rendu cible"
                                    value={formatPrice(
                                        project.target_landed_cost,
                                        project.currency
                                    )}
                                />

                                <DataCard
                                    label="Prix de vente cible"
                                    value={formatPrice(
                                        project.target_sale_price,
                                        project.currency
                                    )}
                                />
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <DataCard
                                    label="Marché cible"
                                    value={
                                        project.target_market ||
                                        "Non défini"
                                    }
                                />

                                <DataCard
                                    label="Pays cible"
                                    value={
                                        project.target_country ||
                                        "Non défini"
                                    }
                                />
                            </div>
                        </section>

                        <NotesSection
                            title="Sourcing & fournisseurs"
                            value={
                                project.supplier_notes
                            }
                        />

                        <NotesSection
                            title="Conformité"
                            value={
                                project.compliance_notes
                            }
                        />

                        <NotesSection
                            title="Logistique"
                            value={
                                project.logistics_notes
                            }
                        />

                        <NotesSection
                            title="Commercialisation"
                            value={
                                project.commercial_notes
                            }
                        />
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                                Origine Intelligence
                            </div>

                            <h2 className="mt-2 text-lg font-semibold">
                                Décision stratégique
                            </h2>

                            {study && (
                                <>
                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <DataCard
                                            label="Score"
                                            value={`${study.overall_score ?? "—"}/100`}
                                        />

                                        <DataCard
                                            label="Confiance"
                                            value={`${study.confidence_score ?? "—"}%`}
                                        />
                                    </div>

                                    {study.paxsolutio_recommendation && (
                                        <p className="mt-5 text-sm leading-6 text-slate-300">
                                            {
                                                study.paxsolutio_recommendation
                                            }
                                        </p>
                                    )}
                                </>
                            )}

                            {opportunity && (
                                <Link
                                    href={`/admin/intelligence/opportunites/${opportunity.id}`}
                                    className="mt-5 inline-flex text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
                                >
                                    Ouvrir le dossier
                                    Intelligence →
                                </Link>
                            )}
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Notes internes
                            </div>

                            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                {project.internal_notes ||
                                    "Aucune note interne."}
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

function DataCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
                {label}
            </div>

            <div className="mt-2 text-sm font-semibold text-slate-200">
                {value}
            </div>
        </div>
    );
}

function NotesSection({
    title,
    value,
}: {
    title: string;
    value: string | null;
}) {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <h2 className="text-lg font-semibold">
                {title}
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                {value ||
                    "Aucune information renseignée pour le moment."}
            </p>
        </section>
    );
}