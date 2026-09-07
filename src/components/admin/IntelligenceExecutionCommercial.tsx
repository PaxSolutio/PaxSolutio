"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

type CommercialData = {
    id: string;
    execution_project_id: string;

    status: string;
    currency: string;

    product_cost: number | null;
    freight_cost: number | null;
    insurance_cost: number | null;
    customs_cost: number | null;
    clearance_cost: number | null;
    compliance_cost: number | null;
    packaging_cost: number | null;
    marketing_cost: number | null;
    other_costs: number | null;

    landed_cost_total: number | null;
    landed_cost_unit: number | null;

    target_sale_price: number | null;
    final_sale_price: number | null;

    gross_margin_amount: number | null;
    gross_margin_percent: number | null;

    warranty_defined: boolean;
    after_sales_defined: boolean;
    commercial_offer_ready: boolean;
    product_assets_ready: boolean;
    pricing_validated: boolean;

    warranty_notes: string | null;
    after_sales_notes: string | null;
    commercial_notes: string | null;
    internal_notes: string | null;

    human_validation_status: string;
    human_validation_notes: string | null;
    validated_at: string | null;

    created_at: string;
    updated_at: string;
};

type Props = {
    executionProjectId: string;
    initialCommercial?: CommercialData | null;
};

type EditableCommercial = {
    currency: string;

    product_cost: string;
    freight_cost: string;
    insurance_cost: string;
    customs_cost: string;
    clearance_cost: string;
    compliance_cost: string;
    packaging_cost: string;
    marketing_cost: string;
    other_costs: string;

    landed_cost_unit: string;

    target_sale_price: string;
    final_sale_price: string;

    warranty_defined: boolean;
    after_sales_defined: boolean;
    commercial_offer_ready: boolean;
    product_assets_ready: boolean;
    pricing_validated: boolean;

    warranty_notes: string;
    after_sales_notes: string;
    commercial_notes: string;
    internal_notes: string;
};

function toInputValue(
    value: number | null | undefined
) {
    return value === null ||
        value === undefined
        ? ""
        : String(value);
}

function createEditableState(
    commercial?: CommercialData | null
): EditableCommercial {
    return {
        currency:
            commercial?.currency ?? "EUR",

        product_cost: toInputValue(
            commercial?.product_cost
        ),

        freight_cost: toInputValue(
            commercial?.freight_cost
        ),

        insurance_cost: toInputValue(
            commercial?.insurance_cost
        ),

        customs_cost: toInputValue(
            commercial?.customs_cost
        ),

        clearance_cost: toInputValue(
            commercial?.clearance_cost
        ),

        compliance_cost: toInputValue(
            commercial?.compliance_cost
        ),

        packaging_cost: toInputValue(
            commercial?.packaging_cost
        ),

        marketing_cost: toInputValue(
            commercial?.marketing_cost
        ),

        other_costs: toInputValue(
            commercial?.other_costs
        ),

        landed_cost_unit: toInputValue(
            commercial?.landed_cost_unit
        ),

        target_sale_price: toInputValue(
            commercial?.target_sale_price
        ),

        final_sale_price: toInputValue(
            commercial?.final_sale_price
        ),

        warranty_defined:
            commercial?.warranty_defined ??
            false,

        after_sales_defined:
            commercial?.after_sales_defined ??
            false,

        commercial_offer_ready:
            commercial?.commercial_offer_ready ??
            false,

        product_assets_ready:
            commercial?.product_assets_ready ??
            false,

        pricing_validated:
            commercial?.pricing_validated ??
            false,

        warranty_notes:
            commercial?.warranty_notes ?? "",

        after_sales_notes:
            commercial?.after_sales_notes ??
            "",

        commercial_notes:
            commercial?.commercial_notes ??
            "",

        internal_notes:
            commercial?.internal_notes ?? "",
    };
}

function parseNumber(
    value: string
): number | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    const parsed = Number(
        trimmed.replace(",", ".")
    );

    return Number.isFinite(parsed)
        ? parsed
        : null;
}

function formatMoney(
    value: number | null | undefined,
    currency = "EUR"
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    try {
        return new Intl.NumberFormat(
            "fr-FR",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 2,
            }
        ).format(value);
    } catch {
        return `${value.toFixed(2)} ${currency}`;
    }
}

function formatPercent(
    value: number | null | undefined
) {
    if (
        value === null ||
        value === undefined
    ) {
        return "—";
    }

    return `${value.toFixed(1)} %`;
}

function Field({
    label,
    value,
    onChange,
    suffix,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    suffix?: string;
}) {
    return (
        <label className="space-y-2">
            <span className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                {label}
            </span>

            <div className="relative">
                <input
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(event) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 pr-14 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                    placeholder="0"
                />

                {suffix ? (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                        {suffix}
                    </span>
                ) : null}
            </div>
        </label>
    );
}

function ToggleRow({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/8 bg-slate-950/40 p-3">
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                    onChange(
                        event.target.checked
                    )
                }
                className="mt-1 h-4 w-4 accent-blue-500"
            />

            <span>
                <span className="block text-sm font-medium text-slate-100">
                    {title}
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {description}
                </span>
            </span>
        </label>
    );
}

export default function IntelligenceExecutionCommercial({
    executionProjectId,
    initialCommercial = null,
}: Props) {
    const [
        commercial,
        setCommercial,
    ] = useState<CommercialData | null>(
        initialCommercial
    );

    const [form, setForm] =
        useState<EditableCommercial>(
            createEditableState(
                initialCommercial
            )
        );

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [decisionNotes, setDecisionNotes] =
        useState(
            initialCommercial?.human_validation_notes ??
            ""
        );

    const [decisionLoading, setDecisionLoading] =
        useState(false);

    const [decisionMessage, setDecisionMessage] =
        useState<string | null>(null);

    const [decisionError, setDecisionError] =
        useState<string | null>(null);

    useEffect(() => {
        if (initialCommercial) {
            return;
        }

        async function loadCommercial() {
            setLoading(true);
            setError(null);

            try {
                const response =
                    await fetch(
                        `/api/admin/intelligence/execution/${executionProjectId}/commercial`,
                        {
                            method: "GET",
                            cache: "no-store",
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ??
                        "Erreur de chargement."
                    );
                }

                if (data.commercial) {
                    setCommercial(
                        data.commercial
                    );

                    setForm(
                        createEditableState(
                            data.commercial
                        )
                    );
                }
            } catch (loadError) {
                console.error(
                    loadError
                );

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Impossible de charger la commercialisation."
                );
            } finally {
                setLoading(false);
            }
        }

        loadCommercial();
    }, [
        executionProjectId,
        initialCommercial,
    ]);

    const localMetrics = useMemo(() => {
        const costs = [
            parseNumber(
                form.product_cost
            ),
            parseNumber(
                form.freight_cost
            ),
            parseNumber(
                form.insurance_cost
            ),
            parseNumber(
                form.customs_cost
            ),
            parseNumber(
                form.clearance_cost
            ),
            parseNumber(
                form.compliance_cost
            ),
            parseNumber(
                form.packaging_cost
            ),
            parseNumber(
                form.marketing_cost
            ),
            parseNumber(
                form.other_costs
            ),
        ];

        const hasCosts =
            costs.some(
                (value) =>
                    value !== null
            );

        const landedCost =
            hasCosts
                ? costs.reduce<number>(
                    (
                        total,
                        value
                    ) =>
                        total +
                        (value ?? 0),
                    0
                )
                : null;

        const finalPrice =
            parseNumber(
                form.final_sale_price
            );

        const targetPrice =
            parseNumber(
                form.target_sale_price
            );

        const salePrice =
            finalPrice ??
            targetPrice;

        const margin =
            landedCost !== null &&
                salePrice !== null
                ? salePrice -
                landedCost
                : null;

        const marginRate =
            margin !== null &&
                landedCost !== null &&
                landedCost > 0
                ? (margin /
                    landedCost) *
                100
                : null;

        const markupRate =
            margin !== null &&
                salePrice !== null &&
                salePrice > 0
                ? (margin /
                    salePrice) *
                100
                : null;

        return {
            landedCost,
            salePrice,
            margin,
            marginRate,
            markupRate,
        };
    }, [form]);

    function updateField<
        K extends keyof EditableCommercial
    >(
        field: K,
        value: EditableCommercial[K]
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function buildPayload() {
        return {
            currency:
                form.currency,

            product_cost:
                parseNumber(
                    form.product_cost
                ),

            freight_cost:
                parseNumber(
                    form.freight_cost
                ),

            insurance_cost:
                parseNumber(
                    form.insurance_cost
                ),

            customs_cost:
                parseNumber(
                    form.customs_cost
                ),

            clearance_cost:
                parseNumber(
                    form.clearance_cost
                ),

            compliance_cost:
                parseNumber(
                    form.compliance_cost
                ),

            packaging_cost:
                parseNumber(
                    form.packaging_cost
                ),

            marketing_cost:
                parseNumber(
                    form.marketing_cost
                ),

            other_costs:
                parseNumber(
                    form.other_costs
                ),

            landed_cost_unit:
                parseNumber(
                    form.landed_cost_unit
                ),

            target_sale_price:
                parseNumber(
                    form.target_sale_price
                ),

            final_sale_price:
                parseNumber(
                    form.final_sale_price
                ),

            warranty_defined:
                form.warranty_defined,

            after_sales_defined:
                form.after_sales_defined,

            commercial_offer_ready:
                form.commercial_offer_ready,

            product_assets_ready:
                form.product_assets_ready,

            pricing_validated:
                form.pricing_validated,

            warranty_notes:
                form.warranty_notes ||
                null,

            after_sales_notes:
                form.after_sales_notes ||
                null,

            commercial_notes:
                form.commercial_notes ||
                null,

            internal_notes:
                form.internal_notes ||
                null,
        };
    }

    async function createCommercial() {
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/commercial`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            buildPayload()
                        ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "Création impossible."
                );
            }

            setCommercial(
                data.commercial
            );

            setForm(
                createEditableState(
                    data.commercial
                )
            );

            setMessage(
                "Dossier commercial initialisé."
            );
        } catch (saveError) {
            console.error(
                saveError
            );

            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Impossible de créer le dossier commercial."
            );
        } finally {
            setSaving(false);
        }
    }

    async function saveCommercial() {
        if (!commercial) {
            await createCommercial();
            return;
        }

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/commercial`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            buildPayload()
                        ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ??
                    "Mise à jour impossible."
                );
            }

            setCommercial(
                data.commercial
            );

            setForm(
                createEditableState(
                    data.commercial
                )
            );

            setMessage(
                "Commercialisation enregistrée."
            );
        } catch (saveError) {
            console.error(
                saveError
            );

            setError(
                saveError instanceof Error
                    ? saveError.message
                    : "Impossible d'enregistrer la commercialisation."
            );
        } finally {
            setSaving(false);
        }
    }

    async function submitCommercialDecision(
        decision:
            | "commercial_ready"
            | "keep_in_review"
            | "rejected"
    ) {
        setDecisionLoading(true);
        setDecisionError(null);
        setDecisionMessage(null);

        try {
            const response = await fetch(
                `/api/admin/intelligence/execution/${executionProjectId}/commercial/decision`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        decision,
                        decision_notes:
                            decisionNotes,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                const blockers =
                    Array.isArray(
                        data.blockingReasons
                    )
                        ? data.blockingReasons.join(
                            " "
                        )
                        : "";

                throw new Error(
                    blockers ||
                    data.error ||
                    "Décision impossible."
                );
            }

            if (data.commercial) {
                setCommercial(
                    data.commercial
                );

                setForm(
                    createEditableState(
                        data.commercial
                    )
                );
            }

            if (
                decision ===
                "commercial_ready"
            ) {
                setDecisionMessage(
                    "Projet validé Commercial Ready."
                );
            } else if (
                decision ===
                "keep_in_review"
            ) {
                setDecisionMessage(
                    "Projet maintenu en préparation."
                );
            } else {
                setDecisionMessage(
                    "Projet commercial rejeté."
                );
            }
        } catch (decisionSubmitError) {
            console.error(
                decisionSubmitError
            );

            setDecisionError(
                decisionSubmitError instanceof
                    Error
                    ? decisionSubmitError.message
                    : "Impossible d'enregistrer la décision."
            );
        } finally {
            setDecisionLoading(false);
        }
    }

    const checklistCount = [
        form.warranty_defined,
        form.after_sales_defined,
        form.commercial_offer_ready,
        form.product_assets_ready,
        form.pricing_validated,
    ].filter(Boolean).length;

    const checklistPercent =
        Math.round(
            (checklistCount / 5) *
            100
        );

    return (
        <section className="rounded-2xl border border-white/10 bg-[#08111f] p-5 shadow-2xl shadow-black/10">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                        Commercialisation
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Préparation commerciale
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Consolidez les coûts,
                        validez le prix de
                        vente et préparez le
                        projet avant son
                        passage en statut
                        commercialement prêt.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                        {commercial
                            ? commercial.status
                            : "Non initialisé"}
                    </span>

                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                        {checklistPercent} %
                        prêt
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="py-8 text-sm text-slate-400">
                    Chargement de la
                    commercialisation...
                </div>
            ) : (
                <>
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                Coût rendu
                            </div>

                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatMoney(
                                    localMetrics.landedCost,
                                    form.currency
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                Prix retenu
                            </div>

                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatMoney(
                                    localMetrics.salePrice,
                                    form.currency
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                Marge brute
                            </div>

                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatMoney(
                                    localMetrics.margin,
                                    form.currency
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                Taux de marge
                            </div>

                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatPercent(
                                    localMetrics.marginRate
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                Taux de marque
                            </div>

                            <div className="mt-2 text-lg font-semibold text-white">
                                {formatPercent(
                                    localMetrics.markupRate
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                        <div className="space-y-6">
                            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-white">
                                            Structure
                                            des coûts
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Montants
                                            utilisés
                                            pour
                                            calculer
                                            le coût
                                            rendu.
                                        </p>
                                    </div>

                                    <select
                                        value={
                                            form.currency
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateField(
                                                "currency",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                                    >
                                        <option value="EUR">
                                            EUR
                                        </option>

                                        <option value="USD">
                                            USD
                                        </option>

                                        <option value="CNY">
                                            CNY
                                        </option>

                                        <option value="RMB">
                                            RMB
                                        </option>
                                    </select>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Field
                                        label="Coût produit"
                                        value={
                                            form.product_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "product_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Transport"
                                        value={
                                            form.freight_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "freight_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Assurance"
                                        value={
                                            form.insurance_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "insurance_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Douane"
                                        value={
                                            form.customs_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "customs_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Dédouanement"
                                        value={
                                            form.clearance_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "clearance_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Conformité"
                                        value={
                                            form.compliance_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "compliance_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Packaging"
                                        value={
                                            form.packaging_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "packaging_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Marketing"
                                        value={
                                            form.marketing_cost
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "marketing_cost",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Autres coûts"
                                        value={
                                            form.other_costs
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "other_costs",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                                <h3 className="text-sm font-semibold text-white">
                                    Prix &
                                    rentabilité
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Définissez
                                    les objectifs
                                    de prix avant
                                    validation
                                    commerciale.
                                </p>

                                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                    <Field
                                        label="Coût rendu / unité"
                                        value={
                                            form.landed_cost_unit
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "landed_cost_unit",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Prix cible"
                                        value={
                                            form.target_sale_price
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "target_sale_price",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />

                                    <Field
                                        label="Prix final"
                                        value={
                                            form.final_sale_price
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "final_sale_price",
                                                value
                                            )
                                        }
                                        suffix={
                                            form.currency
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                                <h3 className="text-sm font-semibold text-white">
                                    Notes
                                    commerciales
                                </h3>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <label className="space-y-2">
                                        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                            Garantie
                                        </span>

                                        <textarea
                                            rows={4}
                                            value={
                                                form.warranty_notes
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "warranty_notes",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                            SAV
                                        </span>

                                        <textarea
                                            rows={4}
                                            value={
                                                form.after_sales_notes
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "after_sales_notes",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                            Notes
                                            commerciales
                                        </span>

                                        <textarea
                                            rows={4}
                                            value={
                                                form.commercial_notes
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "commercial_notes",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                            Notes
                                            internes
                                        </span>

                                        <textarea
                                            rows={4}
                                            value={
                                                form.internal_notes
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "internal_notes",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white">
                                        Préparation
                                        commerciale
                                    </h3>

                                    <span className="text-sm font-semibold text-blue-300">
                                        {
                                            checklistCount
                                        }
                                        /5
                                    </span>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                                    <div
                                        className="h-full rounded-full bg-blue-500 transition-all"
                                        style={{
                                            width: `${checklistPercent}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-4 space-y-2">
                                    <ToggleRow
                                        title="Garantie définie"
                                        description="Les conditions de garantie sont prêtes."
                                        checked={
                                            form.warranty_defined
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "warranty_defined",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        title="SAV défini"
                                        description="Le traitement après-vente est organisé."
                                        checked={
                                            form.after_sales_defined
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "after_sales_defined",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        title="Offre commerciale prête"
                                        description="Le devis ou support commercial est préparé."
                                        checked={
                                            form.commercial_offer_ready
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "commercial_offer_ready",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        title="Visuels produits prêts"
                                        description="Photos, vidéos ou assets sont disponibles."
                                        checked={
                                            form.product_assets_ready
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "product_assets_ready",
                                                value
                                            )
                                        }
                                    />

                                    <ToggleRow
                                        title="Prix validé"
                                        description="Le prix commercial final a été confirmé."
                                        checked={
                                            form.pricing_validated
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateField(
                                                "pricing_validated",
                                                value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/8 bg-slate-950/40 p-4">
                                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                    Validation humaine
                                </div>

                                <div className="mt-2 text-sm font-medium text-white">
                                    {commercial?.human_validation_status ===
                                        "approved"
                                        ? "Commercial Ready"
                                        : commercial?.human_validation_status ===
                                            "rejected"
                                            ? "Rejeté"
                                            : "En attente"}
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    La décision finale reste
                                    humaine. Les contrôles du
                                    système peuvent bloquer le
                                    passage si un élément critique
                                    est encore manquant.
                                </p>

                                <textarea
                                    rows={4}
                                    value={decisionNotes}
                                    onChange={(event) =>
                                        setDecisionNotes(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Note de décision..."
                                    className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
                                />

                                {decisionError ? (
                                    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300">
                                        {decisionError}
                                    </div>
                                ) : null}

                                {decisionMessage ? (
                                    <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs leading-5 text-emerald-300">
                                        {decisionMessage}
                                    </div>
                                ) : null}

                                <div className="mt-4 grid gap-2">
                                    <button
                                        type="button"
                                        disabled={
                                            decisionLoading ||
                                            !commercial
                                        }
                                        onClick={() =>
                                            submitCommercialDecision(
                                                "commercial_ready"
                                            )
                                        }
                                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Valider Commercial Ready
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            decisionLoading ||
                                            !commercial
                                        }
                                        onClick={() =>
                                            submitCommercialDecision(
                                                "keep_in_review"
                                            )
                                        }
                                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
                                    >
                                        Maintenir en préparation
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            decisionLoading ||
                                            !commercial
                                        }
                                        onClick={() =>
                                            submitCommercialDecision(
                                                "rejected"
                                            )
                                        }
                                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
                                    >
                                        Rejeter
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>


                    {
                        error ? (
                            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        ) : null
                    }

                    {
                        message ? (
                            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                                {message}
                            </div>
                        ) : null
                    }

                    <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={
                                saveCommercial
                            }
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? "Enregistrement..."
                                : commercial
                                    ? "Enregistrer"
                                    : "Initialiser la commercialisation"}
                        </button>
                    </div>
                </>
            )
            }
        </section >
    );
}