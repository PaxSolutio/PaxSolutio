"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type StudyStatus =
    | "draft"
    | "researching"
    | "completed"
    | "failed";

type ExistingStudy = {
    id: string;
    status: StudyStatus;
    overall_score: number | null;
    confidence_score: number | null;
    completed_at: string | null;
} | null;

type Props = {
    opportunityId: string;
    initialStudy: ExistingStudy;
};

type ApiResponse = {
    success: boolean;

    error?: string;

    study?: {
        id: string;
        status: StudyStatus;
        overall_score: number | null;
        confidence_score: number | null;
        completed_at: string | null;
    };
};

export default function ProductStudyAction({
    opportunityId,
    initialStudy,
}: Props) {
    const router = useRouter();

    const [study, setStudy] =
        useState<ExistingStudy>(
            initialStudy
        );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function generateStudy() {
        if (loading) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/study`,
                {
                    method: "POST",
                }
            );

            const data =
                (await response.json()) as ApiResponse;

            if (
                !response.ok ||
                !data.success ||
                !data.study
            ) {
                throw new Error(
                    data.error ||
                    "Impossible de générer l'étude."
                );
            }

            setStudy(data.study);

            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Erreur inconnue."
            );
        } finally {
            setLoading(false);
        }
    }

    const completed =
        study?.status === "completed";

    return (
        <section className="rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.035] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Étude produit
            </div>

            <h2 className="mt-2 text-lg font-semibold text-white">
                Analyse approfondie
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-400">
                Recherche marché, prix,
                concurrence, sourcing,
                réglementation, logistique et
                potentiel commercial.
            </p>

            {completed ? (
                <div className="mt-5">
                    <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4">
                        <div className="text-xs font-medium text-emerald-300">
                            ✓ Étude terminée
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                                    Score global
                                </div>

                                <div className="mt-1 text-xl font-semibold text-white">
                                    {study.overall_score ??
                                        "—"}
                                    {study.overall_score !==
                                        null && "/100"}
                                </div>
                            </div>

                            <div>
                                <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                                    Confiance
                                </div>

                                <div className="mt-1 text-xl font-semibold text-white">
                                    {study.confidence_score ??
                                        "—"}
                                    {study.confidence_score !==
                                        null && "%"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/admin/intelligence/opportunites/${opportunityId}/etude`}
                        className="mt-3 block w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                        Voir l'étude complète →
                    </Link>

                    <button
                        type="button"
                        onClick={generateStudy}
                        disabled={loading}
                        className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                    >
                        {loading
                            ? "Nouvelle analyse en cours..."
                            : "Relancer l'étude"}
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={generateStudy}
                    disabled={loading}
                    className="mt-5 w-full rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-wait disabled:opacity-60"
                >
                    {loading
                        ? "Recherche et analyse en cours..."
                        : "Lancer l'étude approfondie"}
                </button>
            )}

            {loading && (
                <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/[0.04] px-3 py-3 text-xs leading-5 text-slate-400">
                    Intelligence analyse les
                    signaux existants et effectue
                    des recherches complémentaires.
                    Cela peut prendre plusieurs
                    dizaines de secondes.
                </div>
            )}

            {study?.status === "failed" &&
                !loading && (
                    <div className="mt-4 text-xs text-amber-300">
                        La dernière tentative
                        d'étude a échoué. Tu peux
                        la relancer.
                    </div>
                )}

            {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-xs leading-5 text-red-300">
                    {error}
                </div>
            )}
        </section>
    );
}