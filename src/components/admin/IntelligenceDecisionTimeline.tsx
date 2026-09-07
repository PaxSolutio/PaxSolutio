type TimelineItem = {
    id: string;

    previous_verdict: string | null;
    new_verdict: string;

    previous_overall_score: number | null;
    new_overall_score: number | null;

    previous_confidence_score: number | null;
    new_confidence_score: number | null;

    decision_change: string | null;

    decisive_evidence: string[] | null;

    remaining_unknowns: string[] | null;

    created_at: string;
};

type Props = {
    initialScore: number | null;
    initialVerdict: string | null;
    initialConfidence: number | null;

    reassessments: TimelineItem[];
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
    verdict: string | null
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

function formatDate(
    value: string
) {
    return new Date(
        value
    ).toLocaleString("fr-FR");
}

export default function IntelligenceDecisionTimeline({
    initialScore,
    initialVerdict,
    initialConfidence,
    reassessments,
}: Props) {
    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                Historique décisionnel
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
                Évolution du dossier
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Chronologie des changements de
                verdict, score et confiance après
                chaque nouvelle information
                opérationnelle.
            </p>

            <div className="mt-7">
                <div className="relative pl-8">
                    <div className="absolute bottom-0 left-[11px] top-0 w-px bg-white/10" />

                    <div className="relative pb-8">
                        <div className="absolute -left-8 top-1 h-6 w-6 rounded-full border border-blue-500/40 bg-[#06111f]">
                            <div className="absolute inset-[6px] rounded-full bg-blue-400" />
                        </div>

                        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                                    Étude initiale
                                </span>

                                <span
                                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${verdictClasses(
                                        initialVerdict
                                    )}`}
                                >
                                    {verdictLabel(
                                        initialVerdict
                                    )}
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-5 text-sm">
                                <div>
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                        Score
                                    </div>

                                    <div className="mt-1 font-semibold text-white">
                                        {initialScore ??
                                            "—"}
                                        {initialScore !==
                                        null
                                            ? "/100"
                                            : ""}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                        Confiance
                                    </div>

                                    <div className="mt-1 font-semibold text-white">
                                        {initialConfidence ??
                                            "—"}
                                        {initialConfidence !==
                                        null
                                            ? "%"
                                            : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {reassessments.map(
                        (item, index) => (
                            <div
                                key={item.id}
                                className="relative pb-8 last:pb-0"
                            >
                                <div className="absolute -left-8 top-1 h-6 w-6 rounded-full border border-violet-500/40 bg-[#06111f]">
                                    <div className="absolute inset-[6px] rounded-full bg-violet-400" />
                                </div>

                                <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.035] p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                                                Réévaluation #
                                                {index +
                                                    1}
                                            </div>

                                            <div className="mt-1 text-xs text-slate-500">
                                                {formatDate(
                                                    item.created_at
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${verdictClasses(
                                                item.new_verdict
                                            )}`}
                                        >
                                            {verdictLabel(
                                                item.new_verdict
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                                Score
                                            </div>

                                            <div className="mt-2 flex items-center gap-2 text-sm">
                                                <span className="text-slate-500">
                                                    {item.previous_overall_score ??
                                                        "—"}
                                                </span>

                                                <span className="text-slate-600">
                                                    →
                                                </span>

                                                <span className="font-semibold text-white">
                                                    {item.new_overall_score ??
                                                        "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                                Confiance
                                            </div>

                                            <div className="mt-2 flex items-center gap-2 text-sm">
                                                <span className="text-slate-500">
                                                    {item.previous_confidence_score ??
                                                        "—"}
                                                </span>

                                                <span className="text-slate-600">
                                                    →
                                                </span>

                                                <span className="font-semibold text-white">
                                                    {item.new_confidence_score ??
                                                        "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-white/[0.07] bg-black/10 p-4">
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                                Verdict
                                            </div>

                                            <div className="mt-2 text-sm font-semibold text-white">
                                                {verdictLabel(
                                                    item.new_verdict
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {item.decision_change && (
                                        <div className="mt-5">
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-400">
                                                Ce qui a changé
                                            </div>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                                {
                                                    item.decision_change
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {Array.isArray(
                                        item.decisive_evidence
                                    ) &&
                                        item
                                            .decisive_evidence
                                            .length >
                                            0 && (
                                            <div className="mt-5">
                                                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                                                    Éléments
                                                    décisifs
                                                </div>

                                                <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-400">
                                                    {item.decisive_evidence.map(
                                                        (
                                                            evidence,
                                                            evidenceIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    evidenceIndex
                                                                }
                                                                className="flex gap-2"
                                                            >
                                                                <span className="text-emerald-400">
                                                                    •
                                                                </span>

                                                                <span>
                                                                    {
                                                                        evidence
                                                                    }
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                    {Array.isArray(
                                        item.remaining_unknowns
                                    ) &&
                                        item
                                            .remaining_unknowns
                                            .length >
                                            0 && (
                                            <div className="mt-5">
                                                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-400">
                                                    Inconnues
                                                    restantes
                                                </div>

                                                <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-400">
                                                    {item.remaining_unknowns.map(
                                                        (
                                                            unknown,
                                                            unknownIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    unknownIndex
                                                                }
                                                                className="flex gap-2"
                                                            >
                                                                <span className="text-amber-400">
                                                                    •
                                                                </span>

                                                                <span>
                                                                    {
                                                                        unknown
                                                                    }
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}