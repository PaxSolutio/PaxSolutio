"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    opportunityId: string;
    aiVerdict: string | null;
};

type HumanDecision =
    | "go"
    | "review"
    | "no_go";

export default function IntelligenceHumanDecision({
    opportunityId,
    aiVerdict,
}: Props) {
    const router = useRouter();

    const [notes, setNotes] =
        useState("");

    const [loadingDecision, setLoadingDecision] =
        useState<HumanDecision | null>(
            null
        );

    const [success, setSuccess] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    async function submitDecision(
        decision: HumanDecision
    ) {
        try {
            setLoadingDecision(
                decision
            );
            setSuccess(null);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/decision`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        human_decision:
                            decision,
                        decision_notes:
                            notes,
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
                        "Impossible d'enregistrer la décision."
                );
            }

            const label =
                decision === "go"
                    ? "GO validé"
                    : decision ===
                        "no_go"
                      ? "NO-GO enregistré"
                      : "Dossier maintenu en analyse";

            setSuccess(label);

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setLoadingDecision(
                null
            );
        }
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                Validation humaine
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
                Décision PaxSolutio
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
                Le verdict IA reste une
                recommandation. La décision
                finale est prise et enregistrée
                séparément.
            </p>

            <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/10 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Verdict IA actuel
                </div>

                <div className="mt-2 text-sm font-semibold text-white">
                    {formatVerdict(
                        aiVerdict
                    )}
                </div>
            </div>

            <label className="mt-5 block">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                    Note de décision
                </div>

                <textarea
                    value={notes}
                    onChange={(event) =>
                        setNotes(
                            event.target
                                .value
                        )
                    }
                    rows={4}
                    placeholder="Pourquoi cette décision est-elle prise ?"
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/40"
                />
            </label>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
                <button
                    type="button"
                    disabled={
                        loadingDecision !==
                        null
                    }
                    onClick={() =>
                        submitDecision(
                            "go"
                        )
                    }
                    className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-wait disabled:opacity-50"
                >
                    {loadingDecision ===
                    "go"
                        ? "Validation..."
                        : "Valider GO"}
                </button>

                <button
                    type="button"
                    disabled={
                        loadingDecision !==
                        null
                    }
                    onClick={() =>
                        submitDecision(
                            "review"
                        )
                    }
                    className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-wait disabled:opacity-50"
                >
                    {loadingDecision ===
                    "review"
                        ? "Enregistrement..."
                        : "Maintenir en analyse"}
                </button>

                <button
                    type="button"
                    disabled={
                        loadingDecision !==
                        null
                    }
                    onClick={() =>
                        submitDecision(
                            "no_go"
                        )
                    }
                    className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-50"
                >
                    {loadingDecision ===
                    "no_go"
                        ? "Classement..."
                        : "Classer NO-GO"}
                </button>
            </div>

            {success && (
                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {success}
                </div>
            )}

            {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}
        </section>
    );
}

function formatVerdict(
    verdict: string | null
) {
    if (verdict === "go") {
        return "GO";
    }

    if (verdict === "no_go") {
        return "NO-GO";
    }

    if (verdict === "review") {
        return "À approfondir";
    }

    return "Non défini";
}