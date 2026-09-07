"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
    opportunityId: string;
    verdict: string | null;
};

export default function IntelligenceExecutionAction({
    opportunityId,
    verdict,
}: Props) {
    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [projectId, setProjectId] =
        useState<string | null>(null);

    const [alreadyExists, setAlreadyExists] =
        useState(false);

    if (verdict !== "go") {
        return null;
    }

    async function createExecutionProject() {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/execute`,
                {
                    method: "POST",
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                        "Impossible de passer le dossier en exécution."
                );
            }

            setProjectId(
                data.project?.id ?? null
            );

            setAlreadyExists(
                Boolean(
                    data.alreadyExists
                )
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Décision GO
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
                Passage en exécution
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
                Le dossier a atteint un niveau
                suffisant pour passer de
                l&apos;analyse stratégique à
                l&apos;exécution opérationnelle.
            </p>

            {!projectId ? (
                <button
                    type="button"
                    onClick={
                        createExecutionProject
                    }
                    disabled={loading}
                    className="mt-5 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-wait disabled:opacity-50"
                >
                    {loading
                        ? "Création du projet..."
                        : "Passer en exécution →"}
                </button>
            ) : (
                <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-200">
                        {alreadyExists
                            ? "Ce dossier possède déjà un projet d'exécution."
                            : "Projet d'exécution créé avec succès."}
                    </div>

                    <Link
                        href={`/admin/intelligence/execution/${projectId}`}
                        className="block w-full rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-center text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                    >
                        Ouvrir le projet d&apos;exécution →
                    </Link>
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}
        </section>
    );
}