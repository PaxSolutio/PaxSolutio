"use client";

import { useState } from "react";

type Verdict =
    | "go"
    | "review"
    | "no_go";

type Reassessment = {
    overall_verdict: Verdict;
    executive_summary: string;

    overall_score: number;
    confidence_score: number;

    market_score: number;
    competition_score: number;
    feasibility_score: number;
    commercial_score: number;
    risk_score: number;

    pricing_score: number;
    sourcing_score: number;
    regulation_score: number;
    logistics_score: number;
    demand_score: number;
    profit_score: number;

    paxsolutio_recommendation: string;
    decision_change: string;

    decisive_evidence: string[];
    remaining_unknowns: string[];

    next_actions: Array<{
        action: string;
        priority:
        | "low"
        | "medium"
        | "high";
        rationale: string;
    }>;
};

type Props = {
    opportunityId: string;

    currentVerdict:
    | string
    | null;

    currentScore:
    | number
    | null;

    currentConfidence:
    | number
    | null;
};

function verdictLabel(
    verdict: string | null
) {
    switch (verdict) {
        case "go":
            return "GO";

        case "no_go":
            return "NO-GO";

        case "review":
            return "À approfondir";

        default:
            return verdict || "Non défini";
    }
}

function verdictClasses(
    verdict: string
) {
    switch (verdict) {
        case "go":
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

        case "no_go":
            return "border-red-500/30 bg-red-500/10 text-red-300";

        default:
            return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    }
}

export default function IntelligenceReassessment({
    opportunityId,
    currentVerdict,
    currentScore,
    currentConfidence,
}: Props) {
    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [result, setResult] =
        useState<Reassessment | null>(
            null
        );

    const [reassessmentId, setReassessmentId] =
        useState<string | null>(null);

    const [importingActions, setImportingActions] =
        useState(false);

    const [importMessage, setImportMessage] =
        useState<string | null>(null);

    async function reassess() {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/reassess`,
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
                    "Impossible de réévaluer le dossier."
                );
            }

            setResult(
                data.reassessment
            );
            setReassessmentId(
                data.reassessmentId ?? null
            );

            setImportMessage(null);
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

    async function importReassessmentActions() {
        if (!reassessmentId) {
            setImportMessage(
                "Identifiant de réévaluation indisponible."
            );
            return;
        }

        try {
            setImportingActions(true);
            setImportMessage(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/actions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        mode: "reassessment",
                        reassessmentId,
                    }),
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
                    "Impossible d'ajouter les nouvelles actions."
                );
            }

            if (data.imported > 0) {
                setImportMessage(
                    `${data.imported} nouvelle${data.imported > 1
                        ? "s"
                        : ""
                    } action${data.imported > 1
                        ? "s"
                        : ""
                    } ajoutée${data.imported > 1
                        ? "s"
                        : ""
                    } à Actions Intelligence.`
                );
            } else {
                setImportMessage(
                    "Toutes les actions de cette réévaluation sont déjà présentes."
                );
            }
        } catch (err) {
            setImportMessage(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setImportingActions(false);
        }
    }

    return (
        <section className="rounded-3xl border border-violet-500/20 bg-violet-500/[0.035] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                Intelligence évolutive
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
                Réévaluation du dossier
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
                Réanalyse la décision à partir
                des actions exécutées et des
                nouvelles informations saisies.
            </p>

            {!result && (
                <>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Verdict actuel
                            </div>

                            <div className="mt-2 text-sm font-semibold text-white">
                                {verdictLabel(
                                    currentVerdict
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Score
                            </div>

                            <div className="mt-2 text-sm font-semibold text-white">
                                {currentScore ??
                                    "—"}
                                {currentScore !==
                                    null
                                    ? "/100"
                                    : ""}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Confiance
                            </div>

                            <div className="mt-2 text-sm font-semibold text-white">
                                {currentConfidence ??
                                    "—"}
                                {currentConfidence !==
                                    null
                                    ? "%"
                                    : ""}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={reassess}
                        disabled={loading}
                        className="mt-5 w-full rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-wait disabled:opacity-50"
                    >
                        {loading
                            ? "Réévaluation en cours..."
                            : "Réévaluer avec les nouvelles informations"}
                    </button>
                </>
            )}

            {error && (
                <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-6 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Avant
                            </div>

                            <div className="mt-4 text-lg font-semibold text-white">
                                {verdictLabel(
                                    currentVerdict
                                )}
                            </div>

                            <div className="mt-2 text-sm text-slate-400">
                                Score :{" "}
                                {currentScore ??
                                    "—"}
                                /100
                            </div>

                            <div className="mt-1 text-sm text-slate-400">
                                Confiance :{" "}
                                {currentConfidence ??
                                    "—"}
                                %
                            </div>
                        </div>

                        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                                Après
                            </div>

                            <div className="mt-4">
                                <span
                                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${verdictClasses(
                                        result.overall_verdict
                                    )}`}
                                >
                                    {verdictLabel(
                                        result.overall_verdict
                                    )}
                                </span>
                            </div>

                            <div className="mt-4 text-sm text-slate-300">
                                Score :{" "}
                                <strong>
                                    {
                                        result.overall_score
                                    }
                                    /100
                                </strong>
                            </div>

                            <div className="mt-1 text-sm text-slate-300">
                                Confiance :{" "}
                                <strong>
                                    {
                                        result.confidence_score
                                    }
                                    %
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">
                            Ce qui a changé
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                            {
                                result.decision_change
                            }
                        </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.035] p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                                Éléments décisifs
                            </div>

                            {result
                                .decisive_evidence
                                .length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">
                                    Aucun élément
                                    décisif supplémentaire.
                                </p>
                            ) : (
                                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                                    {result.decisive_evidence.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <li
                                                key={
                                                    index
                                                }
                                                className="flex gap-2"
                                            >
                                                <span className="text-emerald-400">
                                                    •
                                                </span>

                                                <span>
                                                    {
                                                        item
                                                    }
                                                </span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.035] p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
                                Inconnues restantes
                            </div>

                            {result
                                .remaining_unknowns
                                .length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">
                                    Aucune inconnue
                                    critique identifiée.
                                </p>
                            ) : (
                                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                                    {result.remaining_unknowns.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <li
                                                key={
                                                    index
                                                }
                                                className="flex gap-2"
                                            >
                                                <span className="text-amber-400">
                                                    •
                                                </span>

                                                <span>
                                                    {
                                                        item
                                                    }
                                                </span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                            Décision PaxSolutio
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                            {
                                result.paxsolutio_recommendation
                            }
                        </p>
                    </div>

                    {result.next_actions.length >
                        0 && (
                            <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    Prochaines actions
                                </div>

                                <div className="mt-4 space-y-3">
                                    {result.next_actions.map(
                                        (
                                            action,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-xs text-slate-500">
                                                        #
                                                        {index +
                                                            1}
                                                    </span>

                                                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase text-slate-400">
                                                        {
                                                            action.priority
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-2 text-sm font-semibold text-white">
                                                    {
                                                        action.action
                                                    }
                                                </div>

                                                <div className="mt-2 text-xs leading-5 text-slate-400">
                                                    {
                                                        action.rationale
                                                    }
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="mt-5 border-t border-white/10 pt-5">
                                    <button
                                        type="button"
                                        onClick={
                                            importReassessmentActions
                                        }
                                        disabled={
                                            importingActions ||
                                            !reassessmentId
                                        }
                                        className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {importingActions
                                            ? "Ajout en cours..."
                                            : "Ajouter les nouvelles actions →"}
                                    </button>

                                    {importMessage && (
                                        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                            {importMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    <button
                        type="button"
                        onClick={() =>
                            setResult(null)
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
                    >
                        Nouvelle réévaluation
                    </button>
                </div>
            )}
        </section>
    );
}