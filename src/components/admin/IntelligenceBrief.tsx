"use client";

import CreateIntelligenceOpportunityButton from "@/components/admin/CreateIntelligenceOpportunityButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

export type BriefEntry = {
    title: string;
    summary: string;
    rationale: string;
    priority_score: number;
    confidence_score: number;
    source_item_ids: string[];
};

export type ProductOpportunityEntry =
    BriefEntry & {
        product_name: string;
        opportunity_type:
        | "sourcing"
        | "resale"
        | "sample"
        | "automotive"
        | "industrial"
        | "ecommerce"
        | "market_test"
        | "other";
    };

export type IntelligenceBriefData = {
    id: string;
    title: string;

    period_start: string;
    period_end: string;

    executive_summary: string;

    opportunities: BriefEntry[];
    product_opportunities: ProductOpportunityEntry[];
    risks_regulations: BriefEntry[];
    trends_signals: BriefEntry[];
    competition: BriefEntry[];
    editorial_candidates: BriefEntry[];
    watchlist: BriefEntry[];

    source_item_ids: string[];

    model: string | null;
    status: string;

    created_at: string;
    updated_at: string;
};

type Props = {
    initialBrief: IntelligenceBriefData | null;
    onShowSources?: (ids: string[]) => void;
};

type BriefResponse = {
    success: boolean;
    error?: string;
    brief?: IntelligenceBriefData;
    analyzedItems?: number;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function priorityClass(score: number) {
    if (score >= 85) {
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    }

    if (score >= 70) {
        return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    }

    if (score >= 55) {
        return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    }

    return "border-white/10 bg-white/5 text-slate-300";
}

function opportunityTypeLabel(
    type: ProductOpportunityEntry["opportunity_type"]
) {
    switch (type) {
        case "sourcing":
            return "Sourcing";

        case "resale":
            return "Revente";

        case "sample":
            return "Échantillon";

        case "automotive":
            return "Automobile";

        case "industrial":
            return "Industriel";

        case "ecommerce":
            return "E-commerce";

        case "market_test":
            return "Test marché";

        default:
            return "Autre";
    }
}

function BriefCard({
    entry,
    index,
    onShowSources,
    opportunityAction,
}: {
    entry: BriefEntry;
    index: number;
    onShowSources?: (ids: string[]) => void;
    opportunityAction?: React.ReactNode;
}) {
    return (
        <article className="rounded-2xl border border-white/[0.08] bg-black/10 p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        #{String(index + 1).padStart(2, "0")}
                    </div>

                    <h4 className="font-semibold leading-6 text-white">
                        {entry.title}
                    </h4>
                </div>

                <div
                    className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold ${priorityClass(
                        entry.priority_score
                    )}`}
                >
                    {entry.priority_score}/100
                </div>
            </div>

            <div className="mt-3 text-sm leading-6 text-slate-400">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({ children }) => (
                            <p className="mb-2 last:mb-0">
                                {children}
                            </p>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-semibold text-slate-200">
                                {children}
                            </strong>
                        ),
                    }}
                >
                    {entry.summary}
                </ReactMarkdown>
            </div>

            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Pourquoi c&apos;est important
                </div>

                <div className="mt-2 text-sm leading-6 text-slate-300">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => (
                                <p className="mb-2 last:mb-0">
                                    {children}
                                </p>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-semibold text-white">
                                    {children}
                                </strong>
                            ),
                        }}
                    >
                        {entry.rationale}
                    </ReactMarkdown>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-400">
                    Confiance {entry.confidence_score}%
                </span>

                {entry.source_item_ids.length > 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            onShowSources?.(entry.source_item_ids)
                        }
                        className="rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20 hover:text-blue-200"
                    >
                        Voir {entry.source_item_ids.length} signal
                        {entry.source_item_ids.length > 1 ? "s" : ""} →
                    </button>
                )}
            </div>

            {opportunityAction && (
                <div className="mt-4 border-t border-white/[0.06] pt-4">
                    {opportunityAction}
                </div>
            )}
        </article>
    );
}

function ProductOpportunityCard({
    entry,
    index,
    briefId,
    onShowSources,
}: {
    entry: ProductOpportunityEntry;
    index: number;
    briefId: string;
    onShowSources?: (ids: string[]) => void;
}) {
    return (
        <article className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                            Opportunité produit #{index + 1}
                        </span>

                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                            {opportunityTypeLabel(
                                entry.opportunity_type
                            )}
                        </span>
                    </div>

                    <div className="mt-3 text-lg font-semibold text-white">
                        {entry.product_name}
                    </div>

                    <h4 className="mt-1 text-sm font-medium text-slate-300">
                        {entry.title}
                    </h4>
                </div>

                <div
                    className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold ${priorityClass(
                        entry.priority_score
                    )}`}
                >
                    Priorité {entry.priority_score}
                </div>
            </div>

            <div className="mt-4 text-sm leading-6 text-slate-400">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({ children }) => (
                            <p className="mb-2 last:mb-0">
                                {children}
                            </p>
                        ),
                        strong: ({ children }) => (
                            <strong className="font-semibold text-slate-200">
                                {children}
                            </strong>
                        ),
                    }}
                >
                    {entry.summary}
                </ReactMarkdown>
            </div>

            <div className="mt-4 border-t border-white/[0.07] pt-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Analyse stratégique
                </div>

                <div className="mt-2 text-sm leading-6 text-slate-300">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => (
                                <p className="mb-2 last:mb-0">
                                    {children}
                                </p>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-semibold text-white">
                                    {children}
                                </strong>
                            ),
                        }}
                    >
                        {entry.rationale}
                    </ReactMarkdown>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-400">
                    Confiance {entry.confidence_score}%
                </span>

                {entry.source_item_ids.length > 0 && (
                    <button
                        type="button"
                        onClick={() =>
                            onShowSources?.(
                                entry.source_item_ids
                            )
                        }
                        className="rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20 hover:text-blue-200"
                    >
                        Voir{" "}
                        {entry.source_item_ids.length} signal
                        {entry.source_item_ids.length > 1
                            ? "s"
                            : ""}{" "}
                        →
                    </button>
                )}
                <div className="mt-4 border-t border-emerald-500/10 pt-4">
                    <CreateIntelligenceOpportunityButton
                        briefId={briefId}
                        section="product_opportunities"
                        entryIndex={index}
                        entry={entry}
                    />
                </div>
            </div>
        </article>
    );
}

function SectionHeader({
    eyebrow,
    title,
    description,
    count,
}: {
    eyebrow: string;
    title: string;
    description: string;
    count: number;
}) {
    return (
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                    {eyebrow}
                </div>

                <h3 className="mt-2 text-xl font-semibold">
                    {title}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>

            <div className="text-sm text-slate-500">
                {count} élément
                {count > 1 ? "s" : ""}
            </div>
        </div>
    );
}

export default function IntelligenceBrief({
    initialBrief,
    onShowSources,
}: Props) {
    const [brief, setBrief] =
        useState<IntelligenceBriefData | null>(
            initialBrief
        );

    const [generating, setGenerating] =
        useState(false);

    const [message, setMessage] =
        useState<{
            type: "success" | "error";
            text: string;
        } | null>(null);

    async function generateBrief() {
        if (generating) {
            return;
        }

        setGenerating(true);
        setMessage(null);

        try {
            const response = await fetch(
                "/api/admin/intelligence/brief",
                {
                    method: "POST",
                }
            );

            const data =
                (await response.json()) as BriefResponse;

            if (
                !response.ok ||
                !data.success ||
                !data.brief
            ) {
                throw new Error(
                    data.error ||
                    "Impossible de générer le Brief Intelligence."
                );
            }

            setBrief(data.brief);

            setMessage({
                type: "success",
                text: `Brief généré à partir de ${data.analyzedItems ?? 0
                    } information(s) Intelligence.`,
            });
        } catch (error) {
            setMessage({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Erreur Brief Intelligence inconnue.",
            });
        } finally {
            setGenerating(false);
        }
    }

    return (
        <section className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-[#071321]">
            {/* =====================================================
          HEADER BRIEF
      ====================================================== */}

            <div className="border-b border-white/10 bg-gradient-to-br from-blue-500/[0.10] via-transparent to-emerald-500/[0.04] p-7 md:p-9">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                    <div className="max-w-3xl">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                            Intelligence Executive Brief
                        </div>

                        <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
                            Brief stratégique
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Synthèse des principaux mouvements
                            détectés par PaxSolutio Intelligence :
                            opportunités, risques, produits,
                            concurrence, tendances et sujets à
                            surveiller.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={generateBrief}
                        disabled={generating}
                        className="inline-flex min-w-48 shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-[#06101f] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {generating
                            ? "Analyse en cours..."
                            : brief
                                ? "Actualiser le brief"
                                : "Générer le brief"}
                    </button>
                </div>

                {message && (
                    <div
                        className={`mt-6 rounded-xl border px-4 py-3 text-sm ${message.type === "success"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-red-500/20 bg-red-500/10 text-red-300"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>

            {/* =====================================================
          AUCUN BRIEF
      ====================================================== */}

            {!brief ? (
                <div className="px-7 py-14 text-center md:px-9">
                    <div className="mx-auto max-w-xl">
                        <div className="text-lg font-semibold">
                            Aucun brief stratégique généré
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Le moteur de veille collecte déjà les
                            informations. Générez maintenant une
                            synthèse transversale afin de faire
                            ressortir les signaux les plus utiles à la
                            prise de décision.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-7 md:p-9">
                    {/* =====================================================
              MÉTADONNÉES
          ====================================================== */}

                    <div className="mb-8 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                            Généré le{" "}
                            {formatDate(brief.created_at)}
                        </span>

                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                            Période :{" "}
                            {formatDate(brief.period_start)} →{" "}
                            {formatDate(brief.period_end)}
                        </span>

                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                            {brief.source_item_ids?.length ?? 0}{" "}
                            informations utilisées
                        </span>

                        {brief.model && (
                            <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                                {brief.model}
                            </span>
                        )}
                    </div>

                    {/* =====================================================
              SYNTHÈSE EXÉCUTIVE
          ====================================================== */}

                    <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.05] p-6 md:p-7">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                            Synthèse exécutive
                        </div>

                        <div className="mt-4 text-sm leading-7 text-slate-300 md:text-[15px]">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    p: ({ children }) => (
                                        <p className="mb-5 last:mb-0">
                                            {children}
                                        </p>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-white">
                                            {children}
                                        </strong>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="my-4 list-disc space-y-2 pl-5">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="my-4 list-decimal space-y-2 pl-5">
                                            {children}
                                        </ol>
                                    ),
                                }}
                            >
                                {brief.executive_summary}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* =====================================================
              OPPORTUNITÉS GÉNÉRALES
          ====================================================== */}

                    <div className="mt-10">
                        <SectionHeader
                            eyebrow="Décision"
                            title="Opportunités prioritaires"
                            description="Mouvements présentant un potentiel commercial ou stratégique pour PaxSolutio."
                            count={
                                brief.opportunities?.length ?? 0
                            }
                        />

                        {brief.opportunities?.length > 0 ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {brief.opportunities.map(
                                    (entry, index) => (
                                        <BriefCard
                                            key={`${entry.title}-${index}`}
                                            entry={entry}
                                            index={index}
                                            onShowSources={onShowSources}
                                            opportunityAction={
                                                <CreateIntelligenceOpportunityButton
                                                    briefId={brief.id}
                                                    section="opportunities"
                                                    entryIndex={index}
                                                    entry={entry}
                                                />
                                            }
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
                                Aucune opportunité prioritaire
                                identifiée sur cette période.
                            </div>
                        )}
                    </div>

                    {/* =====================================================
              OPPORTUNITÉS PRODUITS
          ====================================================== */}

                    <div className="mt-10">
                        <SectionHeader
                            eyebrow="Sourcing"
                            title="Opportunités produits"
                            description="Produits ou catégories méritant une étude fournisseur, marché, prix ou conformité."
                            count={
                                brief.product_opportunities
                                    ?.length ?? 0
                            }
                        />

                        {brief.product_opportunities?.length >
                            0 ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {brief.product_opportunities.map(
                                    (entry, index) => (
                                        <ProductOpportunityCard
                                            key={`${entry.product_name}-${index}`}
                                            entry={entry}
                                            index={index}
                                            briefId={brief.id}
                                            onShowSources={onShowSources}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
                                Aucun produit nécessitant une étude
                                prioritaire.
                            </div>
                        )}
                    </div>

                    {/* =====================================================
              RISQUES
          ====================================================== */}

                    <div className="mt-10">
                        <SectionHeader
                            eyebrow="Risk Intelligence"
                            title="Risques & réglementation"
                            description="Évolutions susceptibles d'affecter les flux, coûts, délais, conformité ou marchés."
                            count={
                                brief.risks_regulations?.length ??
                                0
                            }
                        />

                        {brief.risks_regulations?.length > 0 ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {brief.risks_regulations.map(
                                    (entry, index) => (
                                        <BriefCard
                                            key={`${entry.title}-${index}`}
                                            entry={entry}
                                            index={index}
                                            onShowSources={onShowSources}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
                                Aucun risque majeur détecté.
                            </div>
                        )}
                    </div>

                    {/* =====================================================
              TENDANCES
          ====================================================== */}

                    <div className="mt-10">
                        <SectionHeader
                            eyebrow="Pattern Detection"
                            title="Tendances & signaux faibles"
                            description="Corrélations ou mouvements émergents observés à travers plusieurs événements."
                            count={
                                brief.trends_signals?.length ?? 0
                            }
                        />

                        {brief.trends_signals?.length > 0 ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {brief.trends_signals.map(
                                    (entry, index) => (
                                        <BriefCard
                                            key={`${entry.title}-${index}`}
                                            entry={entry}
                                            index={index}
                                            onShowSources={onShowSources}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
                                Aucun signal faible suffisamment
                                significatif.
                            </div>
                        )}
                    </div>

                    {/* =====================================================
              CONCURRENCE
          ====================================================== */}

                    <div className="mt-10">
                        <SectionHeader
                            eyebrow="Competitive Intelligence"
                            title="Concurrence & entreprises"
                            description="Acteurs, expansions et mouvements pouvant modifier l'environnement concurrentiel."
                            count={
                                brief.competition?.length ?? 0
                            }
                        />

                        {brief.competition?.length > 0 ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {brief.competition.map(
                                    (entry, index) => (
                                        <BriefCard
                                            key={`${entry.title}-${index}`}
                                            entry={entry}
                                            index={index}
                                            onShowSources={onShowSources}
                                        />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
                                Aucun mouvement concurrentiel
                                prioritaire.
                            </div>
                        )}
                    </div>

                    {/* =====================================================
              PUBLICATION + WATCHLIST
          ====================================================== */}

                    <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        <div>
                            <SectionHeader
                                eyebrow="Content Intelligence"
                                title="À publier"
                                description="Sujets présentant un intérêt éditorial pour les prospects et clients."
                                count={
                                    brief.editorial_candidates
                                        ?.length ?? 0
                                }
                            />

                            <div className="space-y-4">
                                {brief.editorial_candidates
                                    ?.length > 0 ? (
                                    brief.editorial_candidates.map(
                                        (entry, index) => (
                                            <BriefCard
                                                key={`${entry.title}-${index}`}
                                                entry={entry}
                                                index={index}
                                                onShowSources={onShowSources}
                                            />
                                        )
                                    )
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
                                        Aucun candidat éditorial
                                        prioritaire.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <SectionHeader
                                eyebrow="Monitoring"
                                title="À surveiller"
                                description="Sujets encore incomplets ou incertains mais pouvant devenir importants."
                                count={
                                    brief.watchlist?.length ?? 0
                                }
                            />

                            <div className="space-y-4">
                                {brief.watchlist?.length > 0 ? (
                                    brief.watchlist.map(
                                        (entry, index) => (
                                            <BriefCard
                                                key={`${entry.title}-${index}`}
                                                entry={entry}
                                                index={index}
                                                onShowSources={onShowSources}
                                            />
                                        )
                                    )
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500">
                                        Aucun sujet particulier à
                                        surveiller.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}