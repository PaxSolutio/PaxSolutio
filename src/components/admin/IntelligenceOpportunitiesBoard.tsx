"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { IntelligenceOpportunity } from "@/app/admin/intelligence/opportunites/page";

type Props = {
    initialOpportunities: IntelligenceOpportunity[];
};

type OpportunityStatus =
    | "to_review"
    | "analyzing"
    | "validated"
    | "rejected"
    | "converted";

const columns: {
    status: OpportunityStatus;
    title: string;
    description: string;
}[] = [
        {
            status: "to_review",
            title: "À étudier",
            description: "Nouveaux dossiers",
        },
        {
            status: "analyzing",
            title: "En analyse",
            description: "Étude en cours",
        },
        {
            status: "validated",
            title: "Validées",
            description: "Opportunités retenues",
        },
        {
            status: "converted",
            title: "Converties",
            description: "Passées à l'action",
        },
        {
            status: "rejected",
            title: "Rejetées",
            description: "Non retenues",
        },
    ];

function getKindLabel(kind: string) {
    if (kind === "product") {
        return "Produit";
    }

    return "Stratégique";
}

function OpportunityCard({
    opportunity,
}: {
    opportunity: IntelligenceOpportunity;
}) {
    const sourceCount =
        opportunity.source_item_ids?.length ?? 0;

    return (
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/20">
            <div className="flex items-start justify-between gap-3">
                <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${opportunity.opportunity_kind === "product"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-blue-500/10 text-blue-300"
                        }`}
                >
                    {getKindLabel(
                        opportunity.opportunity_kind
                    )}
                </span>

                {opportunity.priority_score !== null && (
                    <span className="shrink-0 text-xs font-medium text-slate-400">
                        {opportunity.priority_score}/100
                    </span>
                )}
            </div>

            <h3 className="mt-4 text-sm font-semibold leading-6 text-white">
                {opportunity.product_name ||
                    opportunity.title}
            </h3>

            {opportunity.summary && (
                <p className="mt-2 line-clamp-4 text-xs leading-5 text-slate-400">
                    {opportunity.summary}
                </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                {opportunity.confidence_score !== null && (
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-slate-400">
                        Confiance{" "}
                        {opportunity.confidence_score}%
                    </span>
                )}

                {sourceCount > 0 && (
                    <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-[11px] text-blue-300">
                        {sourceCount} signal
                        {sourceCount > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            <div className="mt-4 border-t border-white/[0.06] pt-4">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-600">
                        {new Date(
                            opportunity.created_at
                        ).toLocaleDateString(
                            "fr-FR"
                        )}
                    </span>

                    <Link
                        href={`/admin/intelligence/opportunites/${opportunity.id}`}
                        className="text-xs font-medium text-blue-300 transition hover:text-blue-200"
                    >
                        Ouvrir →
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function IntelligenceOpportunitiesBoard({
    initialOpportunities,
}: Props) {
    const [opportunities] =
        useState<IntelligenceOpportunity[]>(
            initialOpportunities
        );

    const total =
        opportunities.length;

    const highPriority =
        opportunities.filter(
            (opportunity) =>
                (opportunity.priority_score ?? 0) >= 85
        ).length;

    const productCount =
        opportunities.filter(
            (opportunity) =>
                opportunity.opportunity_kind ===
                "product"
        ).length;

    const validatedCount =
        opportunities.filter(
            (opportunity) =>
                opportunity.status ===
                "validated" ||
                opportunity.status ===
                "converted"
        ).length;

    const opportunitiesByStatus =
        useMemo(() => {
            return columns.reduce(
                (result, column) => {
                    result[column.status] =
                        opportunities.filter(
                            (opportunity) =>
                                opportunity.status ===
                                column.status
                        );

                    return result;
                },
                {} as Record<
                    OpportunityStatus,
                    IntelligenceOpportunity[]
                >
            );
        }, [opportunities]);

    return (
        <main className="min-h-screen bg-[#06111f] text-white">
            <div className="mx-auto max-w-[1800px] px-6 py-8 lg:px-8">
                <header className="flex flex-col gap-6 border-b border-white/10 pb-8 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                            PaxSolutio Intelligence
                        </div>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                            Dossiers Intelligence
                        </h1>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            Pipeline privé de qualification
                            des opportunités détectées par
                            PaxSolutio Intelligence.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/intelligence"
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                        >
                            ← Intelligence
                        </Link>

                        <Link
                            href="/admin/nouveautes"
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                        >
                            CMS Nouveautés
                        </Link>
                    </div>
                </header>

                <section className="grid gap-4 py-8 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Dossiers
                        </div>

                        <div className="mt-2 text-3xl font-semibold">
                            {total}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Priorité haute
                        </div>

                        <div className="mt-2 text-3xl font-semibold text-amber-300">
                            {highPriority}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Opportunités produits
                        </div>

                        <div className="mt-2 text-3xl font-semibold text-emerald-300">
                            {productCount}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            Retenues
                        </div>

                        <div className="mt-2 text-3xl font-semibold text-blue-300">
                            {validatedCount}
                        </div>
                    </div>
                </section>

                {opportunities.length === 0 ? (
                    <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
                        <div className="text-lg font-semibold text-white">
                            Aucun dossier
                        </div>

                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            Utilise « Étudier cette
                            opportunité » depuis un Brief
                            Intelligence pour créer ton
                            premier dossier.
                        </p>
                    </section>
                ) : (
                    <section className="overflow-x-auto pb-10">
                        <div className="grid min-w-[1500px] grid-cols-5 gap-4">
                            {columns.map((column) => {
                                const columnItems =
                                    opportunitiesByStatus[
                                    column.status
                                    ] ?? [];

                                return (
                                    <div
                                        key={column.status}
                                        className="rounded-3xl border border-white/[0.07] bg-black/10 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3 px-2 pb-4 pt-2">
                                            <div>
                                                <h2 className="text-sm font-semibold text-white">
                                                    {
                                                        column.title
                                                    }
                                                </h2>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    {
                                                        column.description
                                                    }
                                                </div>
                                            </div>

                                            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                                {
                                                    columnItems.length
                                                }
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {columnItems.length ===
                                                0 ? (
                                                <div className="rounded-2xl border border-dashed border-white/[0.07] px-4 py-10 text-center text-xs text-slate-600">
                                                    Aucun dossier
                                                </div>
                                            ) : (
                                                columnItems.map(
                                                    (
                                                        opportunity
                                                    ) => (
                                                        <OpportunityCard
                                                            key={
                                                                opportunity.id
                                                            }
                                                            opportunity={
                                                                opportunity
                                                            }
                                                        />
                                                    )
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}