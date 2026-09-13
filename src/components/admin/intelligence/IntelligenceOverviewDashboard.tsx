"use client";

import Link from "next/link";
import IntelligenceAttentionPanel from "@/components/admin/intelligence/IntelligenceAttentionPanel";

// =========================================================
// TYPES
// =========================================================

type IntelligenceMission = {
    id: string;
    name: string;
    radar: string;
    query_text: string;
    frequency: "3h" | "12h" | "daily" | "weekly";
    priority: number;
    active: boolean;
    last_run_at: string | null;
    next_run_at: string | null;
};

type IntelligenceItem = {
    id: string;
    title: string;
    summary: string | null;
    analysis: string | null;
    item_type: string;
    categories: string[];
    countries: string[];
    companies: string[];
    products: string[];
    total_score: number | null;
    confidence_score: number | null;
    urgency_score: number | null;
    risk_score: number | null;
    status: string;
    detected_at: string;
    generated_news_post_id: string | null;
};

type IntelligenceOpportunity = {
    id: string;
    title: string;
    product_name: string | null;
    opportunity_kind: string;
    priority_score: number | null;
    confidence_score: number | null;
    status:
    | "to_review"
    | "analyzing"
    | "validated"
    | "rejected"
    | "converted";
    created_at: string;
};

type IntelligenceExecutionProject = {
    id: string;
    opportunity_id: string;
    title: string;
    product_name: string | null;
    target_market: string | null;
    target_country: string | null;
    status: string;
    priority: string;
    target_purchase_price: number | null;
    target_landed_cost: number | null;
    target_sale_price: number | null;
    currency: string | null;
    updated_at: string;
};

type IntelligenceExecutionSupplier = {
    id: string;
    execution_project_id: string;
    verification_status: string;
};

type IntelligenceExecutionQuote = {
    id: string;
    execution_project_id: string;
    status: string;
    landed_cost: number | null;
    landed_cost_unit: number | null;
    gross_margin: number | null;
    gross_margin_percent: number | null;
};

type IntelligenceExecutionCompliance = {
    id: string;
    execution_project_id: string;
    status: string;
    risk_level: string | null;
    overall_score: number | null;
    missing_requirements: string[] | null;
    blocker_count: number | null;
};

type Props = {
    missions: IntelligenceMission[];
    items: IntelligenceItem[];
    opportunities: IntelligenceOpportunity[];
    executionProjects: IntelligenceExecutionProject[];
    executionSuppliers: IntelligenceExecutionSupplier[];
    executionQuotes: IntelligenceExecutionQuote[];
    executionCompliance: IntelligenceExecutionCompliance[];
};

// =========================================================
// HELPERS
// =========================================================

function formatShortDate(date: Date) {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
    }).format(date);
}

function DashboardCard({
    label,
    value,
    detail,
    accent = "default",
}: {
    label: string;
    value: number | string;
    detail: string;
    accent?: "default" | "blue" | "green" | "amber" | "red";
}) {
    const accentClass = {
        default: "text-white",
        blue: "text-blue-300",
        green: "text-emerald-300",
        amber: "text-amber-300",
        red: "text-red-300",
    }[accent];

    return (
        <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.04]">
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                {label}
            </div>

            <div
                className={`mt-3 text-3xl font-semibold tracking-tight ${accentClass}`}
            >
                {value}
            </div>

            <div className="mt-2 text-xs text-zinc-500">
                {detail}
            </div>
        </div>
    );
}

// =========================================================
// DASHBOARD
// =========================================================

export default function IntelligenceOverviewDashboard({
    missions,
    items,
    opportunities,
    executionProjects,
    executionSuppliers,
    executionQuotes,
    executionCompliance,
}: Props) {
    // =========================================================
    // INTELLIGENCE / RADAR
    // =========================================================

    const highPriority = items.filter(
        (item) => (item.total_score ?? 0) >= 85
    );

    const urgentItems = items.filter(
        (item) => (item.urgency_score ?? 0) >= 75
    );

    const riskyItems = items.filter(
        (item) => (item.risk_score ?? 0) >= 70
    );

    // =========================================================
    // ÉVOLUTION DES SIGNAUX SUR 7 JOURS
    // =========================================================

    const today = new Date();

    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);

        date.setHours(0, 0, 0, 0);
        date.setDate(today.getDate() - (6 - index));

        const next = new Date(date);
        next.setDate(date.getDate() + 1);

        const count = items.filter((item) => {
            const detected = new Date(item.detected_at);

            return detected >= date && detected < next;
        }).length;

        return {
            date,
            label: formatShortDate(date),
            count,
        };
    });

    const maxDayCount = Math.max(
        ...days.map((day) => day.count),
        1
    );

    // =========================================================
    // CATÉGORIES
    // =========================================================

    const categoryCounts = new Map<string, number>();

    items.forEach((item) => {
        (item.categories ?? []).forEach((category) => {
            categoryCounts.set(
                category,
                (categoryCounts.get(category) ?? 0) + 1
            );
        });
    });

    const topCategories = [...categoryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxCategoryCount = Math.max(
        ...topCategories.map(([, count]) => count),
        1
    );

    // =========================================================
    // PIPELINE OPPORTUNITÉS
    // =========================================================

    const opportunityPipeline = [
        {
            status: "to_review",
            label: "À étudier",
            count: opportunities.filter(
                (opportunity) =>
                    opportunity.status === "to_review"
            ).length,
        },
        {
            status: "analyzing",
            label: "En analyse",
            count: opportunities.filter(
                (opportunity) =>
                    opportunity.status === "analyzing"
            ).length,
        },
        {
            status: "validated",
            label: "Validées",
            count: opportunities.filter(
                (opportunity) =>
                    opportunity.status === "validated"
            ).length,
        },
        {
            status: "converted",
            label: "Converties",
            count: opportunities.filter(
                (opportunity) =>
                    opportunity.status === "converted"
            ).length,
        },
        {
            status: "rejected",
            label: "Rejetées",
            count: opportunities.filter(
                (opportunity) =>
                    opportunity.status === "rejected"
            ).length,
        },
    ];

    // =========================================================
    // PRIORITÉS
    // =========================================================

    const priorities = [...opportunities]
        .filter(
            (opportunity) =>
                opportunity.status !== "rejected"
        )
        .sort(
            (a, b) =>
                (b.priority_score ?? 0) -
                (a.priority_score ?? 0)
        )
        .slice(0, 5);

    // =========================================================
    // PROJETS
    // =========================================================

    const activeProjects = executionProjects.filter(
        (project) =>
            project.status !== "launched" &&
            project.status !== "cancelled"
    );

    const highPriorityProjects = activeProjects.filter(
        (project) => project.priority === "high"
    );

    const qualificationProjects = activeProjects.filter(
        (project) =>
            project.status === "qualification"
    );

    const sourcingProjects = activeProjects.filter(
        (project) =>
            project.status === "sourcing"
    );

    const quotationProjects = activeProjects.filter(
        (project) =>
            project.status === "quotation"
    );

    const sampleProjects = activeProjects.filter(
        (project) =>
            project.status === "sample"
    );

    const complianceProjects = activeProjects.filter(
        (project) =>
            project.status === "compliance"
    );

    const logisticsProjects = activeProjects.filter(
        (project) =>
            project.status === "logistics"
    );

    const commercialReadyProjects = activeProjects.filter(
        (project) =>
            project.status === "commercial_ready"
    );

    const launchedProjects = executionProjects.filter(
        (project) =>
            project.status === "launched"
    );

    const operationalPipeline = [
        {
            status: "qualification",
            label: "Qualification",
            count: qualificationProjects.length,
        },
        {
            status: "sourcing",
            label: "Sourcing",
            count: sourcingProjects.length,
        },
        {
            status: "quotation",
            label: "Cotations",
            count: quotationProjects.length,
        },
        {
            status: "sample",
            label: "Échantillon",
            count: sampleProjects.length,
        },
        {
            status: "compliance",
            label: "Conformité",
            count: complianceProjects.length,
        },
        {
            status: "logistics",
            label: "Logistique",
            count: logisticsProjects.length,
        },
        {
            status: "commercial_ready",
            label: "Prêt commercialement",
            count: commercialReadyProjects.length,
        },
        {
            status: "launched",
            label: "Lancé",
            count: launchedProjects.length,
        },
    ];

    const projectStatusLabels: Record<string, string> = {
        qualification: "Qualification",
        sourcing: "Sourcing",
        quotation: "Cotations",
        sample: "Échantillon",
        compliance: "Conformité",
        logistics: "Logistique",
        commercial_ready: "Prêt commercialement",
        launched: "Lancé",
        cancelled: "Annulé",
    };

    // =========================================================
    // FOURNISSEURS
    // =========================================================

    const verifiedSuppliers = executionSuppliers.filter(
        (supplier) =>
            supplier.verification_status === "verified"
    ).length;

    const suppliersInReview = executionSuppliers.filter(
        (supplier) =>
            supplier.verification_status === "in_review"
    ).length;

    const rejectedSuppliers = executionSuppliers.filter(
        (supplier) =>
            supplier.verification_status === "rejected"
    ).length;

    // =========================================================
    // COTATIONS
    // =========================================================

    const receivedQuotes = executionQuotes.filter(
        (quote) =>
            quote.status === "received" ||
            quote.status === "under_review" ||
            quote.status === "selected"
    ).length;

    const selectedQuotes = executionQuotes.filter(
        (quote) =>
            quote.status === "selected"
    ).length;

    const quotesUnderReview = executionQuotes.filter(
        (quote) =>
            quote.status === "under_review"
    ).length;

    // =========================================================
    // CONFORMITÉ
    // =========================================================

    const blockedCompliance = executionCompliance.filter(
        (compliance) =>
            compliance.status === "blocked" ||
            (compliance.blocker_count ?? 0) > 0
    ).length;

    const approvedCompliance = executionCompliance.filter(
        (compliance) =>
            compliance.status === "approved" ||
            compliance.status === "ready"
    ).length;

    const highRiskCompliance = executionCompliance.filter(
        (compliance) =>
            compliance.risk_level === "high" ||
            compliance.risk_level === "critical"
    ).length;

    // =========================================================
    // INTERFACE
    // =========================================================

    return (
        <section className="mb-10">
            {/* =====================================================
          INTRODUCTION
      ====================================================== */}

            <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                        Intelligence Command Center
                    </div>

                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                        Vue globale
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                        Situation stratégique, signaux détectés et priorités
                        opérationnelles de PaxSolutio.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Données Intelligence actives
                </div>
            </div>

            <IntelligenceAttentionPanel
                opportunities={opportunities}
                projects={executionProjects}
                suppliers={executionSuppliers}
                quotes={executionQuotes}
                compliance={executionCompliance}
            />

            {/* =====================================================
          KPI
      ====================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <Link
                    href="/admin/intelligence/parametres"
                    className="block"
                >
                    <DashboardCard
                        label="Missions actives"
                        value={missions.length}
                        detail="Missions de veille"
                    />
                </Link>

                <Link
                    href="/admin/intelligence/execution"
                    className="block"
                >
                    <DashboardCard
                        label="Projets actifs"
                        value={activeProjects.length}
                        detail={`${highPriorityProjects.length} haute priorité`}
                        accent="green"
                    />
                </Link>

                <Link
                    href="/admin/intelligence/radar"
                    className="block"
                >
                    <DashboardCard
                        label="Signaux"
                        value={items.length}
                        detail="Informations analysées"
                        accent="blue"
                    />
                </Link>

                <Link
                    href="/admin/intelligence/opportunites"
                    className="block"
                >
                    <DashboardCard
                        label="Opportunités"
                        value={opportunities.length}
                        detail="Détectées par Intelligence"
                        accent="green"
                    />
                </Link>

                <Link
                    href="/admin/intelligence/radar"
                    className="block"
                >
                    <DashboardCard
                        label="Haute priorité"
                        value={highPriority.length}
                        detail="Score ≥ 85 / 100"
                        accent="amber"
                    />
                </Link>

                <Link
                    href="/admin/intelligence/radar"
                    className="block"
                >
                    <DashboardCard
                        label="Alertes"
                        value={
                            urgentItems.length +
                            riskyItems.length
                        }
                        detail={`${urgentItems.length} urgentes · ${riskyItems.length} risques`}
                        accent="red"
                    />
                </Link>
            </div>

            {/* =====================================================
          GRAPHIQUES
      ====================================================== */}

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                {/* SIGNAUX */}

                <Link
                    href="/admin/intelligence/radar"
                    className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Activité Intelligence
                            </div>

                            <h3 className="mt-2 text-lg font-semibold">
                                Signaux détectés
                            </h3>
                        </div>

                        <div className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
                            7 derniers jours
                        </div>
                    </div>

                    <div className="mt-8 flex h-[220px] items-end gap-3">
                        {days.map((day) => {
                            const height =
                                day.count === 0
                                    ? 4
                                    : Math.max(
                                        (day.count /
                                            maxDayCount) *
                                        100,
                                        8
                                    );

                            return (
                                <div
                                    key={day.date.toISOString()}
                                    className="flex h-full flex-1 flex-col justify-end"
                                >
                                    <div className="mb-2 text-center text-xs font-medium text-zinc-400">
                                        {day.count}
                                    </div>

                                    <div className="flex h-[160px] items-end rounded-lg bg-white/[0.02]">
                                        <div
                                            className="w-full rounded-lg bg-blue-500/70 transition-all duration-500"
                                            style={{
                                                height: `${height}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-3 text-center text-[11px] text-zinc-600">
                                        {day.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Link>

                {/* CATÉGORIES */}

                <Link
                    href="/admin/intelligence/analytics"
                    className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Analyse marchés
                        </div>

                        <h3 className="mt-2 text-lg font-semibold">
                            Principaux marchés détectés
                        </h3>
                    </div>

                    <div className="mt-8 space-y-5">
                        {topCategories.length === 0 ? (
                            <div className="py-14 text-center text-sm text-zinc-600">
                                Pas encore assez de données.
                            </div>
                        ) : (
                            topCategories.map(
                                ([category, count]) => {
                                    const width =
                                        (count /
                                            maxCategoryCount) *
                                        100;

                                    return (
                                        <div key={category}>
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <span className="truncate text-sm text-zinc-300">
                                                    {category}
                                                </span>

                                                <span className="text-xs font-medium text-zinc-500">
                                                    {count}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                                                <div
                                                    className="h-full rounded-full bg-blue-500/70"
                                                    style={{
                                                        width: `${width}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        )}
                    </div>
                </Link>
            </div>

            {/* =====================================================
          PIPELINE OPPORTUNITÉS
      ====================================================== */}

            <Link
                href="/admin/intelligence/opportunites"
                className="mt-5 block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Pipeline commercial
                        </div>

                        <h3 className="mt-2 text-lg font-semibold">
                            Pipeline des opportunités
                        </h3>
                    </div>

                    <div className="text-xs text-zinc-600">
                        {opportunities.length} opportunité
                        {opportunities.length > 1
                            ? "s"
                            : ""}
                    </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {opportunityPipeline.map(
                        (stage) => (
                            <div
                                key={stage.status}
                                className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                            >
                                <div className="text-xs text-zinc-500">
                                    {stage.label}
                                </div>

                                <div className="mt-2 text-2xl font-semibold">
                                    {stage.count}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </Link>

            {/* =====================================================
          PIPELINE OPÉRATIONNEL
      ====================================================== */}

            <Link
                href="/admin/intelligence/execution"
                className="mt-5 block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Exécution
                        </div>

                        <h3 className="mt-2 text-lg font-semibold">
                            Pipeline opérationnel
                        </h3>
                    </div>

                    <div className="text-xs text-zinc-600">
                        {activeProjects.length} projet
                        {activeProjects.length > 1
                            ? "s"
                            : ""}{" "}
                        actif
                        {activeProjects.length > 1
                            ? "s"
                            : ""}
                    </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                    {operationalPipeline.map(
                        (stage) => (
                            <div
                                key={stage.status}
                                className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                            >
                                <div className="text-[11px] text-zinc-500">
                                    {stage.label}
                                </div>

                                <div
                                    className={`mt-2 text-2xl font-semibold ${stage.count > 0
                                            ? "text-blue-300"
                                            : "text-zinc-600"
                                        }`}
                                >
                                    {stage.count}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </Link>

            {/* =====================================================
          PROJETS ACTIFS
      ====================================================== */}

            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Exécution
                        </div>

                        <h3 className="mt-2 text-lg font-semibold">
                            Projets actifs
                        </h3>
                    </div>

                    <Link
                        href="/admin/intelligence/execution"
                        className="text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                    >
                        Voir tous →
                    </Link>
                </div>

                {activeProjects.length === 0 ? (
                    <div className="px-6 py-12 text-center text-sm text-zinc-600">
                        Aucun projet actif.
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.06]">
                        {activeProjects
                            .slice(0, 5)
                            .map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/admin/intelligence/execution/${project.id}`}
                                    className="group grid gap-4 px-6 py-5 transition hover:bg-white/[0.025] lg:grid-cols-[minmax(0,1.4fr)_180px_180px_100px]"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-zinc-200 transition group-hover:text-white">
                                            {project.product_name ||
                                                project.title}
                                        </div>

                                        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-zinc-600">
                                            {project.target_market && (
                                                <span>
                                                    {
                                                        project.target_market
                                                    }
                                                </span>
                                            )}

                                            {project.target_country && (
                                                <span>
                                                    {
                                                        project.target_country
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                                            Étape
                                        </div>

                                        <div className="mt-1 text-xs font-medium text-blue-300">
                                            {projectStatusLabels[
                                                project.status
                                            ] ?? project.status}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                                            Priorité
                                        </div>

                                        <div
                                            className={`mt-1 text-xs font-medium ${project.priority ===
                                                    "high"
                                                    ? "text-red-300"
                                                    : project.priority ===
                                                        "medium"
                                                        ? "text-amber-300"
                                                        : "text-zinc-400"
                                                }`}
                                        >
                                            {project.priority ===
                                                "high"
                                                ? "Haute"
                                                : project.priority ===
                                                    "medium"
                                                    ? "Moyenne"
                                                    : "Basse"}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end text-xs font-medium text-zinc-500 transition group-hover:text-blue-300">
                                        Ouvrir →
                                    </div>
                                </Link>
                            ))}
                    </div>
                )}
            </div>

            {/* =====================================================
          OPÉRATIONS
      ====================================================== */}

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                {/* FOURNISSEURS */}

                <Link
                    href="/admin/intelligence/fournisseurs"
                    className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Fournisseurs
                    </div>

                    <h3 className="mt-2 text-lg font-semibold">
                        Sourcing
                    </h3>

                    <div className="mt-6 space-y-4">
                        <OperationRow
                            label="Fournisseurs identifiés"
                            value={executionSuppliers.length}
                        />

                        <OperationRow
                            label="Vérifiés"
                            value={verifiedSuppliers}
                            tone="green"
                        />

                        <OperationRow
                            label="En vérification"
                            value={suppliersInReview}
                            tone="amber"
                        />

                        <OperationRow
                            label="Rejetés"
                            value={rejectedSuppliers}
                            tone="red"
                        />
                    </div>
                </Link>

                {/* COTATIONS */}

                <Link
                    href="/admin/intelligence/cotations"
                    className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Cotations
                    </div>

                    <h3 className="mt-2 text-lg font-semibold">
                        Analyse financière
                    </h3>

                    <div className="mt-6 space-y-4">
                        <OperationRow
                            label="Cotations"
                            value={executionQuotes.length}
                        />

                        <OperationRow
                            label="Reçues / actives"
                            value={receivedQuotes}
                            tone="blue"
                        />

                        <OperationRow
                            label="En analyse"
                            value={quotesUnderReview}
                            tone="amber"
                        />

                        <OperationRow
                            label="Sélectionnées"
                            value={selectedQuotes}
                            tone="green"
                        />
                    </div>
                </Link>

                {/* CONFORMITÉ */}

                <Link
                    href="/admin/intelligence/conformite"
                    className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Conformité
                    </div>

                    <h3 className="mt-2 text-lg font-semibold">
                        Risques réglementaires
                    </h3>

                    <div className="mt-6 space-y-4">
                        <OperationRow
                            label="Dossiers conformité"
                            value={executionCompliance.length}
                        />

                        <OperationRow
                            label="Prêts / approuvés"
                            value={approvedCompliance}
                            tone="green"
                        />

                        <OperationRow
                            label="Bloquants"
                            value={blockedCompliance}
                            tone="red"
                        />

                        <OperationRow
                            label="Risque élevé"
                            value={highRiskCompliance}
                            tone="red"
                        />
                    </div>
                </Link>
            </div>

            {/* =====================================================
          PRIORITÉS + ÉTAT OPÉRATIONNEL
      ====================================================== */}

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
                {/* PRIORITÉS */}

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Intelligence ranking
                            </div>

                            <h3 className="mt-2 text-lg font-semibold">
                                Priorités du jour
                            </h3>
                        </div>

                        <Link
                            href="/admin/intelligence/opportunites"
                            className="text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                        >
                            Voir toutes →
                        </Link>
                    </div>

                    {priorities.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-zinc-600">
                            Aucune priorité actuellement.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/[0.06]">
                            {priorities.map(
                                (item, index) => (
                                    <Link
                                        key={item.id}
                                        href={`/admin/intelligence/opportunites/${item.id}`}
                                        className="flex items-center gap-5 px-6 py-4 transition hover:bg-white/[0.025]"
                                    >
                                        <div className="w-8 text-sm font-semibold text-zinc-600">
                                            {String(
                                                index + 1
                                            ).padStart(2, "0")}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium text-zinc-200">
                                                {item.product_name ||
                                                    item.title}
                                            </div>

                                            <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-zinc-600">
                                                <span>
                                                    {item.opportunity_kind ===
                                                        "product"
                                                        ? "Produit"
                                                        : "Stratégique"}
                                                </span>

                                                <span>
                                                    Confiance{" "}
                                                    {item.confidence_score ??
                                                        "—"}
                                                    %
                                                </span>

                                                <span>
                                                    {item.status ===
                                                        "to_review"
                                                        ? "À étudier"
                                                        : item.status ===
                                                            "analyzing"
                                                            ? "En analyse"
                                                            : item.status ===
                                                                "validated"
                                                                ? "Validée"
                                                                : item.status ===
                                                                    "converted"
                                                                    ? "Convertie"
                                                                    : "Rejetée"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300">
                                            {item.priority_score ??
                                                "—"}
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* ÉTAT SYSTÈME */}

                <Link
                    href="/admin/intelligence/parametres"
                    className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        État système
                    </div>

                    <h3 className="mt-2 text-lg font-semibold">
                        Intelligence Engine
                    </h3>

                    <div className="mt-7 space-y-5">
                        <SystemRow
                            label="Missions"
                            value={missions.length}
                        />

                        <SystemRow
                            label="Haute priorité"
                            value={highPriority.length}
                            tone="amber"
                        />

                        <SystemRow
                            label="Urgences"
                            value={urgentItems.length}
                            tone="red"
                        />

                        <SystemRow
                            label="Risques élevés"
                            value={riskyItems.length}
                            tone="red"
                            last
                        />
                    </div>
                </Link>
            </div>
        </section>
    );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function OperationRow({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: number;
    tone?: "default" | "green" | "blue" | "amber" | "red";
}) {
    const toneClass = {
        default: "text-zinc-200",
        green: "text-emerald-300",
        blue: "text-blue-300",
        amber: "text-amber-300",
        red: "text-red-300",
    }[tone];

    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">
                {label}
            </span>

            <span
                className={`text-sm font-semibold ${toneClass}`}
            >
                {value}
            </span>
        </div>
    );
}

function SystemRow({
    label,
    value,
    tone = "default",
    last = false,
}: {
    label: string;
    value: number;
    tone?: "default" | "amber" | "red";
    last?: boolean;
}) {
    const toneClass = {
        default: "text-zinc-200",
        amber: "text-amber-300",
        red: "text-red-300",
    }[tone];

    return (
        <div
            className={`flex items-center justify-between ${!last
                    ? "border-b border-white/[0.06] pb-4"
                    : ""
                }`}
        >
            <span className="text-sm text-zinc-500">
                {label}
            </span>

            <span
                className={`text-sm font-medium ${toneClass}`}
            >
                {value}
            </span>
        </div>
    );
}