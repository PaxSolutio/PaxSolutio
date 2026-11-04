import { requireAdminPage } from "@/lib/admin-access";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

type Recommendation = {
    action?: string;
    priority?: "low" | "medium" | "high";
    rationale?: string;
};

type RiskItem = {
    risk?: string;
    severity?: "low" | "medium" | "high";
    mitigation?: string;
};

function verdictLabel(verdict: string | null) {
    switch (verdict) {
        case "go":
            return "GO";
        case "no_go":
            return "NO-GO";
        case "review":
            return "À approfondir";
        default:
            return "À analyser";
    }
}

function verdictClasses(verdict: string | null) {
    switch (verdict) {
        case "go":
            return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
        case "no_go":
            return "border-red-500/25 bg-red-500/10 text-red-300";
        default:
            return "border-amber-500/25 bg-amber-500/10 text-amber-300";
    }
}

function ScoreCard({
    label,
    value,
    inverse = false,
}: {
    label: string;
    value: number | null;
    inverse?: boolean;
}) {
    let interpretation = "Donnée insuffisante";

    if (value !== null) {
        if (inverse) {
            interpretation =
                value >= 70
                    ? "Risque élevé"
                    : value >= 40
                      ? "Risque modéré"
                      : "Risque faible";
        } else {
            interpretation =
                value >= 75
                    ? "Très favorable"
                    : value >= 55
                      ? "À approfondir"
                      : "Faible / incertain";
        }
    }

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {label}
            </div>

            <div className="mt-2 text-2xl font-semibold text-white">
                {value ?? "—"}
                {value !== null && (
                    <span className="text-sm text-slate-500">
                        /100
                    </span>
                )}
            </div>

            <div className="mt-1 text-xs text-slate-500">
                {interpretation}
            </div>
        </div>
    );
}

function TextList({
    items,
}: {
    items?: string[];
}) {
    if (!Array.isArray(items) || items.length === 0) {
        return (
            <div className="text-sm text-slate-500">
                Aucune donnée vérifiée disponible.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div
                    key={`${item}-${index}`}
                    className="flex gap-3 text-sm leading-6 text-slate-300"
                >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    <span>{item}</span>
                </div>
            ))}
        </div>
    );
}

export default async function ProductStudyPage({
    params,
}: PageProps) {
  await requireAdminPage();

    const { id } = await params;

    const authSupabase =
        await createAuthServerClient();

    const {
        data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    const supabase =
        createServerSupabaseClient();

    const { data: admin } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!admin) {
        redirect("/admin/login");
    }

    const {
        data: opportunity,
        error: opportunityError,
    } = await supabase
        .from("intelligence_opportunities")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (opportunityError) {
        console.error(
            "Erreur opportunité étude :",
            opportunityError
        );
    }

    if (!opportunity) {
        notFound();
    }

    const {
        data: study,
        error: studyError,
    } = await supabase
        .from("intelligence_product_studies")
        .select("*")
        .eq("opportunity_id", id)
        .maybeSingle();

    if (studyError) {
        console.error(
            "Erreur chargement étude produit :",
            studyError
        );
    }

    if (!study || study.status !== "completed") {
        notFound();
    }

    const market =
        study.market_analysis ?? {};

    const demand =
        study.demand_analysis ?? {};

    const pricing =
        study.pricing_analysis ?? {};

    const competition =
        study.competition_analysis ?? {};

    const suppliers =
        study.supplier_analysis ?? {};

    const regulation =
        study.regulatory_analysis ?? {};

    const logistics =
        study.logistics_analysis ?? {};

    const risk =
        study.risk_analysis ?? {};

    const commercial =
        study.commercial_analysis ?? {};

    const recommendations =
        Array.isArray(study.recommendations)
            ? (study.recommendations as Recommendation[])
            : [];

    const actionPlan =
        Array.isArray(study.action_plan)
            ? (study.action_plan as Recommendation[])
            : [];

    const risks =
        Array.isArray(risk.risks)
            ? (risk.risks as RiskItem[])
            : [];

    const sourceUrls =
        Array.isArray(study.source_urls)
            ? (study.source_urls as string[])
            : [];

    return (
        <main className="min-h-screen bg-[#06111f] text-white">
            <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-8">
                <header className="border-b border-white/10 pb-8">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                                PaxSolutio Product Intelligence
                            </div>

                            <h1 className="mt-3 max-w-5xl text-3xl font-semibold tracking-tight">
                                {study.product_name ||
                                    opportunity.product_name ||
                                    opportunity.title}
                            </h1>

                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                                Étude privée de marché,
                                sourcing, importation et
                                potentiel commercial.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <span
                                    className={`rounded-xl border px-3 py-2 text-xs font-bold ${verdictClasses(
                                        study.overall_verdict
                                    )}`}
                                >
                                    {verdictLabel(
                                        study.overall_verdict
                                    )}
                                </span>

                                <span className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300">
                                    Score global{" "}
                                    {study.overall_score ??
                                        "—"}
                                    /100
                                </span>

                                <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                                    Confiance{" "}
                                    {study.confidence_score ??
                                        "—"}
                                    %
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/admin/intelligence/opportunites/${id}`}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                ← Dossier
                            </Link>

                            <Link
                                href="/admin/intelligence/opportunites"
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                            >
                                Tous les dossiers
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="py-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                        <ScoreCard
                            label="Marché"
                            value={study.market_score}
                        />

                        <ScoreCard
                            label="Prix"
                            value={study.pricing_score}
                        />

                        <ScoreCard
                            label="Sourcing"
                            value={study.sourcing_score}
                        />

                        <ScoreCard
                            label="Réglementation"
                            value={
                                study.regulation_score
                            }
                        />

                        <ScoreCard
                            label="Logistique"
                            value={study.logistics_score}
                        />

                        <ScoreCard
                            label="Demande"
                            value={study.demand_score}
                        />

                        <ScoreCard
                            label="Rentabilité"
                            value={study.profit_score}
                        />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <ScoreCard
                            label="Concurrence"
                            value={
                                study.competition_score
                            }
                        />

                        <ScoreCard
                            label="Faisabilité"
                            value={
                                study.feasibility_score
                            }
                        />

                        <ScoreCard
                            label="Potentiel commercial"
                            value={
                                study.commercial_score
                            }
                        />

                        <ScoreCard
                            label="Risque"
                            value={study.risk_score}
                            inverse
                        />
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-blue-500/15 bg-blue-500/[0.035] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                                Synthèse
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Résumé exécutif
                            </h2>

                            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {study.executive_summary}
                            </p>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Marché
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Analyse du marché
                            </h2>

                            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {market.overview ||
                                    "Données insuffisantes."}
                            </p>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-white">
                                        Marchés cibles
                                    </h3>

                                    <TextList
                                        items={
                                            market.target_markets
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-white">
                                        Tendances
                                    </h3>

                                    <TextList
                                        items={
                                            market.trends
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Demande
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Clients et cas d’usage
                            </h2>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Clients cibles
                                    </h3>

                                    <TextList
                                        items={
                                            demand.target_customers
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Signaux de demande
                                    </h3>

                                    <TextList
                                        items={
                                            demand.demand_signals
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Prix
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Prix observés et économie
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                {pricing.pricing_summary ||
                                    "Aucune synthèse prix disponible."}
                            </p>

                            {Array.isArray(
                                pricing.observed_prices
                            ) &&
                                pricing.observed_prices
                                    .length > 0 && (
                                    <div className="mt-6 overflow-x-auto">
                                        <table className="w-full min-w-[650px] text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-500">
                                                    <th className="pb-3 pr-4">
                                                        Marché
                                                    </th>
                                                    <th className="pb-3 pr-4">
                                                        Prix
                                                    </th>
                                                    <th className="pb-3">
                                                        Contexte
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {pricing.observed_prices.map(
                                                    (
                                                        item: {
                                                            market?: string;
                                                            price?: string;
                                                            context?: string;
                                                        },
                                                        index: number
                                                    ) => (
                                                        <tr
                                                            key={
                                                                index
                                                            }
                                                            className="border-b border-white/[0.06]"
                                                        >
                                                            <td className="py-4 pr-4 text-slate-300">
                                                                {
                                                                    item.market
                                                                }
                                                            </td>

                                                            <td className="py-4 pr-4 font-semibold text-white">
                                                                {
                                                                    item.price
                                                                }
                                                            </td>

                                                            <td className="py-4 text-slate-400">
                                                                {
                                                                    item.context
                                                                }
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/10 p-5">
                                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                                    Marge / rentabilité
                                </div>

                                <p className="mt-3 text-sm leading-6 text-slate-300">
                                    {pricing.margin_comment ||
                                        "La marge ne peut pas être calculée avec suffisamment de fiabilité."}
                                </p>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Concurrence
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Acteurs et alternatives
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                {competition.competition_summary ||
                                    "Données concurrentielles insuffisantes."}
                            </p>

                            {Array.isArray(
                                competition.competitors
                            ) &&
                                competition.competitors
                                    .length > 0 && (
                                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                                        {competition.competitors.map(
                                            (
                                                item: {
                                                    name?: string;
                                                    product?: string;
                                                    positioning?: string;
                                                    observed_price?: string;
                                                },
                                                index: number
                                            ) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="rounded-2xl border border-white/[0.08] bg-black/10 p-5"
                                                >
                                                    <div className="font-semibold text-white">
                                                        {
                                                            item.name
                                                        }
                                                    </div>

                                                    <div className="mt-1 text-xs text-blue-300">
                                                        {
                                                            item.product
                                                        }
                                                    </div>

                                                    <p className="mt-3 text-sm leading-6 text-slate-400">
                                                        {
                                                            item.positioning
                                                        }
                                                    </p>

                                                    {item.observed_price && (
                                                        <div className="mt-3 text-xs text-slate-300">
                                                            Prix
                                                            observé :{" "}
                                                            {
                                                                item.observed_price
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                                Sourcing
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Fournisseurs et fabricants
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                {suppliers.sourcing_summary ||
                                    "Aucune conclusion fournisseur disponible."}
                            </p>

                            {Array.isArray(
                                suppliers.companies
                            ) &&
                                suppliers.companies
                                    .length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        {suppliers.companies.map(
                                            (
                                                company: {
                                                    name?: string;
                                                    role?: string;
                                                    country?: string;
                                                    verification_needed?: boolean;
                                                },
                                                index: number
                                            ) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-black/10 p-5 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-white">
                                                            {
                                                                company.name
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-xs text-slate-400">
                                                            {
                                                                company.role
                                                            }{" "}
                                                            ·{" "}
                                                            {
                                                                company.country
                                                            }
                                                        </div>
                                                    </div>

                                                    {company.verification_needed && (
                                                        <span className="rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300">
                                                            À
                                                            vérifier
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Réglementation
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Export, import et conformité
                            </h2>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Export
                                    </h3>

                                    <TextList
                                        items={
                                            regulation.export_requirements
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Import
                                    </h3>

                                    <TextList
                                        items={
                                            regulation.import_requirements
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Conformité
                                    </h3>

                                    <TextList
                                        items={
                                            regulation.compliance_points
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold text-amber-300">
                                        À vérifier
                                    </h3>

                                    <TextList
                                        items={
                                            regulation.unknowns
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Logistique
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Transport et contraintes
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                {logistics.logistics_summary ||
                                    "Pas de synthèse logistique."}
                            </p>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Options de transport
                                    </h3>

                                    <TextList
                                        items={
                                            logistics.transport_options
                                        }
                                    />
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        Contraintes
                                    </h3>

                                    <TextList
                                        items={
                                            logistics.constraints
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-red-500/10 bg-red-500/[0.025] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
                                Risques
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Points de vigilance
                            </h2>

                            <p className="mt-5 text-sm leading-7 text-slate-300">
                                {risk.summary ||
                                    "Aucune synthèse risque disponible."}
                            </p>

                            <div className="mt-6 space-y-3">
                                {risks.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-white/[0.08] bg-black/10 p-5"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="font-semibold">
                                                    {
                                                        item.risk
                                                    }
                                                </div>

                                                <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs uppercase text-slate-400">
                                                    {
                                                        item.severity
                                                    }
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                                Mesure :{" "}
                                                {
                                                    item.mitigation
                                                }
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Commercial
                            </div>

                            <h2 className="mt-2 text-xl font-semibold">
                                Potentiel pour PaxSolutio
                            </h2>

                            <div className="mt-6 space-y-5 text-sm leading-7 text-slate-300">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                        Potentiel commercial
                                    </div>

                                    <p className="mt-2">
                                        {commercial.commercial_potential ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                        Rentabilité
                                    </div>

                                    <p className="mt-2">
                                        {commercial.margin_assessment ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                        Adéquation PaxSolutio
                                    </div>

                                    <p className="mt-2">
                                        {commercial.paxsolutio_fit ||
                                            "—"}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.045] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                                Décision
                            </div>

                            <h2 className="mt-2 text-lg font-semibold">
                                Recommandation PaxSolutio
                            </h2>

                            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {study.paxsolutio_recommendation ||
                                    "Aucune recommandation disponible."}
                            </p>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                                Plan d'action
                            </div>

                            <h2 className="mt-2 text-lg font-semibold">
                                Prochaines étapes
                            </h2>

                            <div className="mt-5 space-y-3">
                                {actionPlan.length > 0
                                    ? actionPlan.map(
                                          (
                                              item,
                                              index
                                          ) => (
                                              <div
                                                  key={
                                                      index
                                                  }
                                                  className="rounded-2xl border border-white/[0.08] bg-black/10 p-4"
                                              >
                                                  <div className="flex items-start gap-3">
                                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">
                                                          {index +
                                                              1}
                                                      </div>

                                                      <div>
                                                          <div className="text-sm font-semibold text-white">
                                                              {
                                                                  item.action
                                                              }
                                                          </div>

                                                          <p className="mt-2 text-xs leading-5 text-slate-400">
                                                              {
                                                                  item.rationale
                                                              }
                                                          </p>
                                                      </div>
                                                  </div>
                                              </div>
                                          )
                                      )
                                    : recommendations.map(
                                          (
                                              item,
                                              index
                                          ) => (
                                              <div
                                                  key={
                                                      index
                                                  }
                                                  className="rounded-2xl border border-white/[0.08] bg-black/10 p-4"
                                              >
                                                  <div className="text-sm font-semibold">
                                                      {
                                                          item.action
                                                      }
                                                  </div>

                                                  <p className="mt-2 text-xs leading-5 text-slate-400">
                                                      {
                                                          item.rationale
                                                      }
                                                  </p>
                                              </div>
                                          )
                                      )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Sources
                            </div>

                            <h2 className="mt-2 text-lg font-semibold">
                                Sources utilisées
                            </h2>

                            <div className="mt-5 space-y-2">
                                {sourceUrls.length === 0 ? (
                                    <div className="text-sm text-slate-500">
                                        Aucune URL enregistrée.
                                    </div>
                                ) : (
                                    sourceUrls.map(
                                        (
                                            url,
                                            index
                                        ) => (
                                            <a
                                                key={
                                                    index
                                                }
                                                href={
                                                    url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block break-all rounded-xl border border-white/[0.07] bg-black/10 px-3 py-3 text-xs leading-5 text-blue-300 transition hover:border-blue-500/20 hover:bg-blue-500/[0.05]"
                                            >
                                                {
                                                    url
                                                }
                                            </a>
                                        )
                                    )
                                )}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                Étude
                            </div>

                            <div className="mt-4 space-y-3 text-xs text-slate-400">
                                <div>
                                    Modèle :{" "}
                                    {study.model ||
                                        "—"}
                                </div>

                                {study.completed_at && (
                                    <div>
                                        Terminée le :{" "}
                                        {new Date(
                                            study.completed_at
                                        ).toLocaleString(
                                            "fr-FR"
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}