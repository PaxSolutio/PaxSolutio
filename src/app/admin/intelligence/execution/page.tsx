import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ExecutionProject = {
    id: string;
    opportunity_id: string;
    study_id: string | null;
    reassessment_id: string | null;
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
    source_decision: string;
    created_at: string;
    updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
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

const PRIORITY_LABELS: Record<string, string> = {
    high: "Haute",
    medium: "Moyenne",
    low: "Basse",
};

const STATUS_PROGRESS: Record<string, number> = {
    qualification: 10,
    sourcing: 25,
    quotation: 40,
    sample: 55,
    compliance: 65,
    logistics: 80,
    commercial_ready: 90,
    launched: 100,
    cancelled: 0,
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

function formatPrice(
    value: number | null,
    currency: string | null
) {
    if (value === null) {
        return "—";
    }

    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currency || "EUR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default async function IntelligenceExecutionPage() {
    const supabase =
        createServerSupabaseClient();

    const {
        data,
        error,
    } = await supabase
        .from("intelligence_execution_projects")
        .select("*")
        .order("updated_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    const projects =
        (data ?? []) as ExecutionProject[];

    const activeProjects =
        projects.filter(
            (project) =>
                project.status !== "launched" &&
                project.status !== "cancelled"
        );

    const qualificationProjects =
        projects.filter(
            (project) =>
                project.status === "qualification"
        );

    const sourcingProjects =
        projects.filter((project) =>
            [
                "sourcing",
                "quotation",
                "sample",
                "compliance",
                "logistics",
                "commercial_ready",
            ].includes(project.status)
        );

    const launchedProjects =
        projects.filter(
            (project) =>
                project.status === "launched"
        );

    return (
        <main className="min-h-screen bg-[#06111f] px-6 py-10 text-white lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                            PaxSolutio Intelligence
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                            Projets d&apos;exécution
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                            Pilotage opérationnel des
                            opportunités ayant franchi
                            l&apos;analyse Intelligence et
                            obtenu une décision GO.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/intelligence/opportunites"
                            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08]"
                        >
                            Opportunités
                        </Link>

                        <Link
                            href="/admin/intelligence/actions"
                            className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                        >
                            Actions Intelligence
                        </Link>
                    </div>
                </div>

                <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Projets actifs"
                        value={activeProjects.length}
                    />

                    <MetricCard
                        label="À qualifier"
                        value={qualificationProjects.length}
                    />

                    <MetricCard
                        label="En exécution"
                        value={sourcingProjects.length}
                    />

                    <MetricCard
                        label="Lancements"
                        value={launchedProjects.length}
                    />
                </section>

                {projects.length === 0 ? (
                    <section className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-xl text-blue-300">
                            →
                        </div>

                        <h2 className="mt-5 text-xl font-semibold">
                            Aucun projet en exécution
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                            Lorsqu&apos;une opportunité
                            Intelligence obtiendra un verdict
                            GO et sera validée pour
                            l&apos;exécution, elle apparaîtra
                            automatiquement ici.
                        </p>

                        <Link
                            href="/admin/intelligence/opportunites"
                            className="mt-6 inline-flex rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                        >
                            Voir les opportunités →
                        </Link>
                    </section>
                ) : (
                    <section className="grid gap-5 xl:grid-cols-2">
                        {projects.map((project) => {
                            const progress =
                                STATUS_PROGRESS[
                                    project.status
                                ] ?? 0;

                            return (
                                <article
                                    key={project.id}
                                    className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.04]"
                                >
                                    <div className="flex items-start justify-between gap-5">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge
                                                    status={
                                                        project.status
                                                    }
                                                />

                                                <PriorityBadge
                                                    priority={
                                                        project.priority
                                                    }
                                                />
                                            </div>

                                            <h2 className="mt-4 text-xl font-semibold">
                                                {
                                                    project.title
                                                }
                                            </h2>

                                            {project.product_name && (
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {
                                                        project.product_name
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right text-xs text-slate-500">
                                            Mis à jour
                                            <div className="mt-1 text-slate-300">
                                                {formatDate(
                                                    project.updated_at
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="mb-2 flex items-center justify-between text-xs">
                                            <span className="text-slate-400">
                                                Progression
                                            </span>

                                            <span className="font-semibold text-slate-200">
                                                {progress} %
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                            <div
                                                className="h-full rounded-full bg-blue-500"
                                                style={{
                                                    width: `${progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        <DataBox
                                            label="Achat cible"
                                            value={formatPrice(
                                                project.target_purchase_price,
                                                project.currency
                                            )}
                                        />

                                        <DataBox
                                            label="Coût rendu"
                                            value={formatPrice(
                                                project.target_landed_cost,
                                                project.currency
                                            )}
                                        />

                                        <DataBox
                                            label="Vente cible"
                                            value={formatPrice(
                                                project.target_sale_price,
                                                project.currency
                                            )}
                                        />
                                    </div>

                                    {(project.target_market ||
                                        project.target_country) && (
                                        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
                                            {project.target_market && (
                                                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
                                                    Marché :{" "}
                                                    {
                                                        project.target_market
                                                    }
                                                </span>
                                            )}

                                            {project.target_country && (
                                                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
                                                    Pays :{" "}
                                                    {
                                                        project.target_country
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-6 border-t border-white/10 pt-5">
                                        <Link
                                            href={`/admin/intelligence/execution/${project.id}`}
                                            className="inline-flex text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                                        >
                                            Ouvrir le projet
                                            d&apos;exécution →
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>
        </main>
    );
}

function MetricCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                {label}
            </div>

            <div className="mt-3 text-3xl font-semibold text-white">
                {value}
            </div>
        </div>
    );
}

function DataBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-white/[0.07] bg-black/10 p-3">
            <div className="text-[11px] uppercase tracking-[0.1em] text-slate-500">
                {label}
            </div>

            <div className="mt-2 text-sm font-semibold text-slate-200">
                {value}
            </div>
        </div>
    );
}

function StatusBadge({
    status,
}: {
    status: string;
}) {
    return (
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-300">
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

function PriorityBadge({
    priority,
}: {
    priority: string;
}) {
    const classes =
        priority === "high"
            ? "border-red-500/20 bg-red-500/10 text-red-300"
            : priority === "low"
              ? "border-slate-500/20 bg-slate-500/10 text-slate-400"
              : "border-amber-500/20 bg-amber-500/10 text-amber-300";

    return (
        <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${classes}`}
        >
            Priorité{" "}
            {PRIORITY_LABELS[priority] ??
                priority}
        </span>
    );
}