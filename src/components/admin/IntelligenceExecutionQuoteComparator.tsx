"use client";

import {
    useMemo,
    useState,
} from "react";

type Supplier = {
    id: string;
    name: string;
    country: string | null;
    verification_status: string;
};

type Quote = {
    id: string;
    supplier_id: string | null;
    reference: string | null;
    currency: string;
    quantity: number | null;
    moq: number | null;
    unit_price: number | null;
    incoterm: string | null;
    landed_cost: number | null;
    landed_cost_unit: number | null;
    target_sale_price: number | null;
    gross_margin: number | null;
    gross_margin_percent: number | null;
    production_lead_time_days: number | null;
    status: string;
};

type Props = {
    executionProjectId: string;
    suppliers: Supplier[];
    quotes: Quote[];
    initialSelectedQuoteId?: string | null;
};

type ScoredQuote = Quote & {
    supplierName: string;
    verificationStatus: string;
    landedScore: number;
    marginScore: number;
    moqScore: number;
    leadTimeScore: number;
    verificationScore: number;
    totalScore: number;
};

const verificationLabels: Record<
    string,
    string
> = {
    verified: "Vérifié",
    in_review: "En vérification",
    unverified: "Non vérifié",
    rejected: "Rejeté",
};

function clamp(
    value: number,
    min: number,
    max: number
) {
    return Math.min(
        Math.max(value, min),
        max
    );
}

function marginScore(
    marginPercent: number | null
) {
    if (
        marginPercent === null ||
        !Number.isFinite(marginPercent)
    ) {
        return 0;
    }

    if (marginPercent <= 0) {
        return 0;
    }

    if (marginPercent >= 50) {
        return 100;
    }

    return clamp(
        marginPercent * 2,
        0,
        100
    );
}

function landedCostScore(
    landedCostUnit: number | null,
    targetSalePrice: number | null
) {
    if (
        landedCostUnit === null ||
        targetSalePrice === null ||
        targetSalePrice <= 0
    ) {
        return 0;
    }

    const ratio =
        landedCostUnit /
        targetSalePrice;

    /*
        Coût rendu = part du prix de vente cible.

        <= 50 % → excellent
        60 %     → très bon
        70 %     → correct
        80 %     → faible
        90 %     → très faible
        >=100 %  → non rentable
    */

    if (ratio <= 0.5) {
        return 100;
    }

    if (ratio >= 1) {
        return 0;
    }

    return clamp(
        ((1 - ratio) / 0.5) *
        100,
        0,
        100
    );
}

function moqScore(
    moq: number | null,
    quantity: number | null
) {
    if (
        moq === null ||
        quantity === null ||
        quantity <= 0
    ) {
        return 40;
    }

    const ratio =
        moq / quantity;

    if (ratio <= 1) {
        return 100;
    }

    if (ratio <= 1.5) {
        return 75;
    }

    if (ratio <= 2) {
        return 55;
    }

    if (ratio <= 3) {
        return 30;
    }

    return 10;
}

function leadTimeScore(
    days: number | null
) {
    if (days === null) {
        return 40;
    }

    if (days <= 15) {
        return 100;
    }

    if (days <= 30) {
        return 80;
    }

    if (days <= 45) {
        return 60;
    }

    if (days <= 60) {
        return 40;
    }

    if (days <= 90) {
        return 20;
    }

    return 5;
}

function verificationScore(
    status: string
) {
    switch (status) {
        case "verified":
            return 100;

        case "in_review":
            return 60;

        case "unverified":
            return 30;

        case "rejected":
            return 0;

        default:
            return 20;
    }
}

function formatMoney(
    value: number | null,
    currency: string
) {
    if (value === null) {
        return "—";
    }

    return `${Number(
        value
    ).toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${currency}`;
}

function formatNumber(
    value: number | null
) {
    if (value === null) {
        return "—";
    }

    return Number(
        value
    ).toLocaleString("fr-FR", {
        maximumFractionDigits: 2,
    });
}

export default function IntelligenceExecutionQuoteComparator({
    executionProjectId,
    suppliers,
    quotes,
    initialSelectedQuoteId = null,
}: Props) {
    const currencies = useMemo(
        () =>
            Array.from(
                new Set(
                    quotes
                        .map(
                            (quote) =>
                                quote.currency
                        )
                        .filter(Boolean)
                )
            ),
        [quotes]
    );

    const [currency, setCurrency] =
        useState(
            currencies[0] ?? "EUR"
        );

    const [
        selectedQuoteId,
        setSelectedQuoteId,
    ] = useState<string | null>(
        initialSelectedQuoteId
    );

    const [
        pendingQuoteId,
        setPendingQuoteId,
    ] = useState<string | null>(
        null
    );

    const [
        decisionNotes,
        setDecisionNotes,
    ] = useState("");

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState<string | null>(
        null
    );

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );

    const comparableQuotes =
        useMemo(
            () =>
                quotes.filter(
                    (quote) =>
                        quote.currency ===
                        currency &&
                        quote.status !==
                        "rejected"
                ),
            [quotes, currency]
        );

    const scoredQuotes =
        useMemo<ScoredQuote[]>(() => {
            return comparableQuotes
                .map((quote) => {
                    const supplier =
                        suppliers.find(
                            (item) =>
                                item.id ===
                                quote.supplier_id
                        );

                    const verification =
                        supplier
                            ?.verification_status ??
                        "unverified";

                    const landedScore =
                        landedCostScore(
                            quote.landed_cost_unit,
                            quote.target_sale_price
                        );

                    const profitabilityScore =
                        marginScore(
                            quote.gross_margin_percent
                        );

                    const minimumOrderScore =
                        moqScore(
                            quote.moq,
                            quote.quantity
                        );

                    const productionScore =
                        leadTimeScore(
                            quote.production_lead_time_days
                        );

                    const supplierVerificationScore =
                        verificationScore(
                            verification
                        );

                    /*
                        Score ABSOLU PaxSolutio
    
                        30 % économie / coût rendu
                        30 % rentabilité
                        15 % MOQ
                        10 % délai
                        15 % fiabilité fournisseur
                    */

                    const totalScore =
                        landedScore * 0.3 +
                        profitabilityScore *
                        0.3 +
                        minimumOrderScore *
                        0.15 +
                        productionScore *
                        0.1 +
                        supplierVerificationScore *
                        0.15;

                    return {
                        ...quote,

                        supplierName:
                            supplier?.name ??
                            "Fournisseur non associé",

                        verificationStatus:
                            verification,

                        landedScore:
                            clamp(
                                landedScore,
                                0,
                                100
                            ),

                        marginScore:
                            clamp(
                                profitabilityScore,
                                0,
                                100
                            ),

                        moqScore:
                            clamp(
                                minimumOrderScore,
                                0,
                                100
                            ),

                        leadTimeScore:
                            clamp(
                                productionScore,
                                0,
                                100
                            ),

                        verificationScore:
                            supplierVerificationScore,

                        totalScore:
                            clamp(
                                totalScore,
                                0,
                                100
                            ),
                    };
                })
                .sort(
                    (a, b) =>
                        b.totalScore -
                        a.totalScore
                );
        }, [
            comparableQuotes,
            suppliers,
        ]);

    const bestQuote =
        scoredQuotes[0] ?? null;

    const pendingQuote =
        scoredQuotes.find(
            (quote) =>
                quote.id ===
                pendingQuoteId
        ) ?? null;

    async function selectQuote(
        quoteId: string
    ) {
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/quote-selection`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            quote_id:
                                quoteId,

                            decision_notes:
                                decisionNotes.trim() ||
                                null,
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
                    data.error ??
                    "Impossible de retenir cette offre."
                );
            }

            setSelectedQuoteId(
                quoteId
            );

            setPendingQuoteId(
                null
            );

            setDecisionNotes("");

            setMessage(
                "Offre retenue et décision enregistrée."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                        Aide à la décision
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Comparateur de cotations
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Compare les offres selon
                        le coût rendu, la
                        rentabilité, le MOQ, le
                        délai et la vérification
                        du fournisseur. La
                        décision finale reste
                        humaine.
                    </p>
                </div>

                {currencies.length > 0 && (
                    <div className="min-w-[150px]">
                        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            Devise comparée
                        </div>

                        <select
                            value={currency}
                            onChange={(event) =>
                                setCurrency(
                                    event.target
                                        .value
                                )
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none"
                        >
                            {currencies.map(
                                (item) => (
                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >
                                        {
                                            item
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                )}
            </div>

            {message && (
                <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-5 py-4 text-sm text-emerald-300">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-5 py-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {quotes.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">
                    Ajoute au moins deux
                    cotations pour commencer à
                    comparer les fournisseurs.
                </div>
            )}

            {quotes.length > 0 &&
                comparableQuotes.length <
                2 && (
                    <div className="mt-6 rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-5 text-sm leading-6 text-amber-200">
                        Il faut au moins deux
                        cotations non rejetées
                        dans la même devise pour
                        obtenir un classement
                        réellement pertinent.
                    </div>
                )}

            {scoredQuotes.length >= 2 &&
                bestQuote && (
                    <>
                        <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-5">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">
                                Meilleur compromis
                                selon le score
                                actuel
                            </div>

                            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="text-xl font-semibold text-white">
                                        {
                                            bestQuote.supplierName
                                        }
                                    </div>

                                    <div className="mt-1 text-sm text-slate-400">
                                        {bestQuote.reference
                                            ? `Devis ${bestQuote.reference}`
                                            : "Cotation sans référence"}
                                    </div>
                                </div>

                                <div className="text-left lg:text-right">
                                    <div className="text-3xl font-semibold text-violet-300">
                                        {bestQuote.totalScore.toFixed(
                                            1
                                        )}
                                        /100
                                    </div>

                                    <div className="mt-1 text-xs text-slate-500">
                                        Score comparatif
                                        interne
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-xs leading-5 text-slate-500">
                                Le classement est
                                indicatif et ne
                                sélectionne jamais
                                automatiquement une
                                offre.
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4">
                            {scoredQuotes.map(
                                (
                                    quote,
                                    index
                                ) => {
                                    const isSelected =
                                        selectedQuoteId ===
                                        quote.id;

                                    return (
                                        <div
                                            key={
                                                quote.id
                                            }
                                            className={`rounded-2xl border p-5 ${isSelected
                                                ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                                                : "border-white/[0.07] bg-black/10"
                                                }`}
                                        >
                                            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                                <div className="flex min-w-0 items-start gap-4">
                                                    <div className="pt-1 text-sm font-semibold text-slate-500">
                                                        #
                                                        {index +
                                                            1}
                                                    </div>

                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="font-semibold text-white">
                                                                {
                                                                    quote.supplierName
                                                                }
                                                            </div>

                                                            {isSelected && (
                                                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                                                                    Offre
                                                                    retenue
                                                                </span>
                                                            )}

                                                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase text-slate-300">
                                                                {verificationLabels[
                                                                    quote
                                                                        .verificationStatus
                                                                ] ??
                                                                    quote.verificationStatus}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2 text-xs text-slate-500">
                                                            {quote.reference ??
                                                                "Sans référence"}

                                                            {quote.incoterm
                                                                ? ` · ${quote.incoterm}`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 xl:max-w-4xl">
                                                    <Metric
                                                        label="Prix usine"
                                                        value={formatMoney(
                                                            quote.unit_price,
                                                            quote.currency
                                                        )}
                                                    />

                                                    <Metric
                                                        label="Coût rendu/u."
                                                        value={formatMoney(
                                                            quote.landed_cost_unit,
                                                            quote.currency
                                                        )}
                                                    />

                                                    <Metric
                                                        label="Marge"
                                                        value={
                                                            quote.gross_margin_percent !==
                                                                null
                                                                ? `${Number(
                                                                    quote.gross_margin_percent
                                                                ).toFixed(
                                                                    1
                                                                )}%`
                                                                : "—"
                                                        }
                                                    />

                                                    <Metric
                                                        label="MOQ"
                                                        value={formatNumber(
                                                            quote.moq
                                                        )}
                                                    />

                                                    <Metric
                                                        label="Délai"
                                                        value={
                                                            quote.production_lead_time_days !==
                                                                null
                                                                ? `${quote.production_lead_time_days} j`
                                                                : "—"
                                                        }
                                                    />
                                                </div>

                                                <div className="flex min-w-[150px] flex-col items-start gap-3 xl:items-end">
                                                    <div>
                                                        <span className="text-xl font-semibold text-violet-300">
                                                            {quote.totalScore.toFixed(
                                                                1
                                                            )}
                                                        </span>

                                                        <span className="text-xs text-slate-600">
                                                            /100
                                                        </span>
                                                    </div>

                                                    {!isSelected && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPendingQuoteId(
                                                                    quote.id
                                                                );

                                                                setDecisionNotes(
                                                                    ""
                                                                );

                                                                setMessage(
                                                                    null
                                                                );

                                                                setError(
                                                                    null
                                                                );
                                                            }}
                                                            className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/[0.14]"
                                                        >
                                                            Retenir
                                                            cette
                                                            offre
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-5">
                            <WeightCard
                                value="30 %"
                                label="Coût rendu"
                            />

                            <WeightCard
                                value="30 %"
                                label="Rentabilité"
                            />

                            <WeightCard
                                value="15 %"
                                label="MOQ"
                            />

                            <WeightCard
                                value="10 %"
                                label="Délai"
                            />

                            <WeightCard
                                value="15 %"
                                label="Fiabilité fournisseur"
                            />
                        </div>
                    </>
                )}

            {pendingQuote && (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-400">
                        Validation humaine
                    </div>

                    <h3 className="mt-2 text-lg font-semibold text-white">
                        Retenir l'offre de{" "}
                        {
                            pendingQuote.supplierName
                        }
                        ?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Cette action enregistrera
                        cette cotation comme offre
                        retenue pour le projet.
                        L'historique de la décision
                        sera conservé.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <Metric
                            label="Coût rendu / unité"
                            value={formatMoney(
                                pendingQuote.landed_cost_unit,
                                pendingQuote.currency
                            )}
                        />

                        <Metric
                            label="Marge brute"
                            value={
                                pendingQuote.gross_margin_percent !==
                                    null
                                    ? `${Number(
                                        pendingQuote.gross_margin_percent
                                    ).toFixed(
                                        1
                                    )}%`
                                    : "—"
                            }
                        />

                        <Metric
                            label="Score comparatif"
                            value={`${pendingQuote.totalScore.toFixed(
                                1
                            )}/100`}
                        />
                    </div>

                    <label className="mt-5 block">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            Note de décision
                        </span>

                        <textarea
                            value={
                                decisionNotes
                            }
                            onChange={(
                                event
                            ) =>
                                setDecisionNotes(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Pourquoi cette offre est-elle retenue ? Prix, MOQ, qualité fournisseur, délai, conditions commerciales..."
                            rows={4}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                        />
                    </label>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                                selectQuote(
                                    pendingQuote.id
                                )
                            }
                            className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#03120d] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving
                                ? "Enregistrement..."
                                : "Confirmer la sélection"}
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => {
                                setPendingQuoteId(
                                    null
                                );

                                setDecisionNotes(
                                    ""
                                );
                            }}
                            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04]"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

function Metric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {label}
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-200">
                {value}
            </div>
        </div>
    );
}

function WeightCard({
    value,
    label,
}: {
    value: string;
    label: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="text-lg font-semibold text-white">
                {value}
            </div>

            <div className="mt-1 text-xs text-slate-500">
                {label}
            </div>
        </div>
    );
}