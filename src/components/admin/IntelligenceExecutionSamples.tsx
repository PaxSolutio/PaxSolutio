"use client";

import {
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

type Supplier = {
    id: string;
    name: string;
};

type Quote = {
    id: string;
    supplier_id: string | null;
    reference: string | null;
    currency: string;
    status: string;
};

type Sample = {
    id: string;

    supplier_id: string | null;
    quote_id: string | null;

    sample_reference: string | null;

    quantity: number;
    unit_price: number | null;
    shipping_cost: number | null;
    other_costs: number | null;
    currency: string;
    total_cost: number | null;

    status: string;

    ordered_at: string | null;
    expected_ship_date: string | null;
    shipped_at: string | null;
    expected_delivery_date: string | null;
    received_at: string | null;

    carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;

    quality_score: number | null;
    conformity_score: number | null;
    packaging_score: number | null;
    product_score: number | null;

    test_result: string | null;

    quality_notes: string | null;
    conformity_notes: string | null;
    packaging_notes: string | null;
    test_notes: string | null;
    corrections_requested: string | null;

    decision_notes: string | null;
};

type Props = {
    executionProjectId: string;
    suppliers: Supplier[];
    quotes: Quote[];
    selectedQuoteId: string | null;
    initialSamples: Sample[];
};

const statusLabels: Record<
    string,
    string
> = {
    planned: "Planifié",
    ordered: "Commandé",
    in_production: "En production",
    shipped: "Expédié",
    received: "Reçu",
    testing: "En test",
    validated: "Validé",
    corrections_required:
        "Corrections requises",
    rejected: "Refusé",
    cancelled: "Annulé",
};

const resultLabels: Record<
    string,
    string
> = {
    pending: "En attente",
    approved: "Validé",
    corrections_required:
        "Corrections requises",
    rejected: "Refusé",
};

const initialForm = {
    supplier_id: "",
    quote_id: "",

    sample_reference: "",

    quantity: "1",
    unit_price: "",
    shipping_cost: "",
    other_costs: "",
    currency: "EUR",

    status: "planned",

    ordered_at: "",
    expected_ship_date: "",
    shipped_at: "",
    expected_delivery_date: "",
    received_at: "",

    carrier: "",
    tracking_number: "",
    tracking_url: "",

    quality_score: "",
    conformity_score: "",
    packaging_score: "",
    product_score: "",

    test_result: "pending",

    quality_notes: "",
    conformity_notes: "",
    packaging_notes: "",
    test_notes: "",
    corrections_requested: "",
    decision_notes: "",
};

function numberValue(
    value: string
) {
    const parsed =
        Number(value);

    return value !== "" &&
        Number.isFinite(parsed)
        ? parsed
        : 0;
}

function money(
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

export default function IntelligenceExecutionSamples({
    executionProjectId,
    suppliers,
    quotes,
    selectedQuoteId,
    initialSamples,
}: Props) {
    const router = useRouter();

    const [
        samples,
        setSamples,
    ] = useState<Sample[]>(
        initialSamples
    );

    const [
        form,
        setForm,
    ] = useState(() => {
        const selectedQuote =
            quotes.find(
                (quote) =>
                    quote.id ===
                    selectedQuoteId
            );

        return {
            ...initialForm,

            quote_id:
                selectedQuote?.id ??
                "",

            supplier_id:
                selectedQuote?.supplier_id ??
                "",

            currency:
                selectedQuote?.currency ??
                "EUR",
        };
    });

    const [
        showForm,
        setShowForm,
    ] = useState(false);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );

    function updateField(
        field: keyof typeof form,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    const totalPreview =
        useMemo(() => {
            const quantity =
                numberValue(
                    form.quantity
                );

            const unitPrice =
                numberValue(
                    form.unit_price
                );

            const shipping =
                numberValue(
                    form.shipping_cost
                );

            const other =
                numberValue(
                    form.other_costs
                );

            return (
                quantity *
                unitPrice +
                shipping +
                other
            );
        }, [form]);

    function supplierName(
        supplierId: string | null
    ) {
        if (!supplierId) {
            return "Fournisseur non associé";
        }

        return (
            suppliers.find(
                (supplier) =>
                    supplier.id ===
                    supplierId
            )?.name ??
            "Fournisseur inconnu"
        );
    }

    function quoteReference(
        quoteId: string | null
    ) {
        if (!quoteId) {
            return "Aucune cotation";
        }

        return (
            quotes.find(
                (quote) =>
                    quote.id ===
                    quoteId
            )?.reference ??
            "Cotation"
        );
    }

    async function createSample() {
        try {
            setSaving(true);
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/samples`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(
                            form
                        ),
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
                    "Impossible de créer l'échantillon."
                );
            }

            setSamples(
                (current) => [
                    data.sample,
                    ...current,
                ]
            );

            const selectedQuote =
                quotes.find(
                    (quote) =>
                        quote.id ===
                        selectedQuoteId
                );

            setForm({
                ...initialForm,

                quote_id:
                    selectedQuote?.id ??
                    "",

                supplier_id:
                    selectedQuote?.supplier_id ??
                    "",

                currency:
                    selectedQuote?.currency ??
                    "EUR",
            });

            setShowForm(false);

            router.refresh();
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

    async function updateSample(
        sampleId: string,
        payload: Record<
            string,
            unknown
        >
    ) {
        try {
            setSaving(true);
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/samples`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            sample_id:
                                sampleId,
                            ...payload,
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
                    "Modification impossible."
                );
            }

            setSamples(
                (current) =>
                    current.map(
                        (sample) =>
                            sample.id ===
                                sampleId
                                ? data.sample
                                : sample
                    )
            );

            router.refresh();
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

    async function deleteSample(
        sampleId: string
    ) {
        if (
            !window.confirm(
                "Supprimer cet échantillon ?"
            )
        ) {
            return;
        }

        try {
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/samples`,
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            sample_id:
                                sampleId,
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
                    "Suppression impossible."
                );
            }

            setSamples(
                (current) =>
                    current.filter(
                        (sample) =>
                            sample.id !==
                            sampleId
                    )
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        }
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                        Validation produit
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Échantillons
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Suis la commande,
                        l'expédition, la réception
                        et les tests des
                        échantillons avant toute
                        validation opérationnelle.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setShowForm(
                            (current) =>
                                !current
                        )
                    }
                    className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                    {showForm
                        ? "Fermer"
                        : "+ Ajouter un échantillon"}
                </button>
            </div>

            {selectedQuoteId && (
                <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4 text-sm text-emerald-300">
                    Une offre est retenue. Le
                    nouvel échantillon sera
                    automatiquement lié à cette
                    cotation si tu ne choisis pas
                    une autre offre.
                </div>
            )}

            {error && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="text-base font-semibold text-white">
                        Nouvel échantillon
                    </h3>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Field label="Fournisseur">
                            <select
                                value={
                                    form.supplier_id
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "supplier_id",
                                        event.target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    Aucun
                                </option>

                                {suppliers.map(
                                    (supplier) => (
                                        <option
                                            key={
                                                supplier.id
                                            }
                                            value={
                                                supplier.id
                                            }
                                        >
                                            {
                                                supplier.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </Field>

                        <Field label="Cotation liée">
                            <select
                                value={
                                    form.quote_id
                                }
                                onChange={(
                                    event
                                ) => {
                                    const quoteId =
                                        event.target
                                            .value;

                                    const quote =
                                        quotes.find(
                                            (
                                                item
                                            ) =>
                                                item.id ===
                                                quoteId
                                        );

                                    setForm(
                                        (
                                            current
                                        ) => ({
                                            ...current,

                                            quote_id:
                                                quoteId,

                                            supplier_id:
                                                quote?.supplier_id ??
                                                current.supplier_id,

                                            currency:
                                                quote?.currency ??
                                                current.currency,
                                        })
                                    );
                                }}
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    Aucune
                                </option>

                                {quotes.map(
                                    (quote) => (
                                        <option
                                            key={
                                                quote.id
                                            }
                                            value={
                                                quote.id
                                            }
                                        >
                                            {quote.reference ??
                                                "Sans référence"}
                                            {quote.status ===
                                                "selected"
                                                ? " — Offre retenue"
                                                : ""}
                                        </option>
                                    )
                                )}
                            </select>
                        </Field>

                        <Field label="Référence échantillon">
                            <input
                                value={
                                    form.sample_reference
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "sample_reference",
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="SAMPLE-001"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <NumberField
                            label="Quantité"
                            value={
                                form.quantity
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "quantity",
                                    value
                                )
                            }
                        />

                        <NumberField
                            label="Prix / unité"
                            value={
                                form.unit_price
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "unit_price",
                                    value
                                )
                            }
                        />

                        <Field label="Devise">
                            <select
                                value={
                                    form.currency
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "currency",
                                        event.target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="EUR">
                                    EUR
                                </option>

                                <option value="USD">
                                    USD
                                </option>

                                <option value="CNY">
                                    CNY / RMB
                                </option>
                            </select>
                        </Field>

                        <NumberField
                            label="Transport"
                            value={
                                form.shipping_cost
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "shipping_cost",
                                    value
                                )
                            }
                        />

                        <NumberField
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
                        />

                        <Field label="Statut">
                            <select
                                value={
                                    form.status
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "status",
                                        event.target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="planned">
                                    Planifié
                                </option>

                                <option value="ordered">
                                    Commandé
                                </option>

                                <option value="in_production">
                                    En production
                                </option>

                                <option value="shipped">
                                    Expédié
                                </option>

                                <option value="received">
                                    Reçu
                                </option>

                                <option value="testing">
                                    En test
                                </option>
                            </select>
                        </Field>

                        <DateField
                            label="Date commande"
                            value={
                                form.ordered_at
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "ordered_at",
                                    value
                                )
                            }
                        />

                        <DateField
                            label="Expédition prévue"
                            value={
                                form.expected_ship_date
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "expected_ship_date",
                                    value
                                )
                            }
                        />

                        <DateField
                            label="Livraison prévue"
                            value={
                                form.expected_delivery_date
                            }
                            onChange={(
                                value
                            ) =>
                                updateField(
                                    "expected_delivery_date",
                                    value
                                )
                            }
                        />

                        <Field label="Transporteur">
                            <input
                                value={
                                    form.carrier
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "carrier",
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="DHL, UPS..."
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Tracking">
                            <input
                                value={
                                    form.tracking_number
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "tracking_number",
                                        event.target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Lien tracking">
                            <input
                                value={
                                    form.tracking_url
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "tracking_url",
                                        event.target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <div className="mt-5 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.05] p-5">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            Coût total
                            échantillon
                        </div>

                        <div className="mt-2 text-2xl font-semibold text-cyan-300">
                            {money(
                                totalPreview,
                                form.currency
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={
                                createSample
                            }
                            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#031216] transition hover:bg-cyan-400 disabled:opacity-50"
                        >
                            {saving
                                ? "Création..."
                                : "Créer l'échantillon"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 space-y-5">
                {samples.length ===
                    0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">
                        Aucun échantillon
                        enregistré.
                    </div>
                ) : (
                    samples.map(
                        (sample) => (
                            <SampleCard
                                key={
                                    sample.id
                                }
                                sample={
                                    sample
                                }
                                supplierName={supplierName(
                                    sample.supplier_id
                                )}
                                quoteReference={quoteReference(
                                    sample.quote_id
                                )}
                                saving={
                                    saving
                                }
                                onUpdate={(
                                    payload
                                ) =>
                                    updateSample(
                                        sample.id,
                                        payload
                                    )
                                }
                                onDelete={() =>
                                    deleteSample(
                                        sample.id
                                    )
                                }
                            />
                        )
                    )
                )}
            </div>
        </section>
    );
}

function SampleCard({
    sample,
    supplierName,
    quoteReference,
    saving,
    onUpdate,
    onDelete,
}: {
    sample: Sample;
    supplierName: string;
    quoteReference: string;
    saving: boolean;
    onUpdate: (
        payload: Record<
            string,
            unknown
        >
    ) => Promise<void>;
    onDelete: () => void;
}) {
    const [
        editing,
        setEditing,
    ] = useState(false);

    const [
        saved,
        setSaved,
    ] = useState(false);

    const [
        scores,
        setScores,
    ] = useState({
        quality_score:
            sample.quality_score?.toString() ??
            "",

        conformity_score:
            sample.conformity_score?.toString() ??
            "",

        packaging_score:
            sample.packaging_score?.toString() ??
            "",

        product_score:
            sample.product_score?.toString() ??
            "",

        test_result:
            sample.test_result ??
            "pending",

        quality_notes:
            sample.quality_notes ??
            "",

        conformity_notes:
            sample.conformity_notes ??
            "",

        packaging_notes:
            sample.packaging_notes ??
            "",

        test_notes:
            sample.test_notes ??
            "",

        corrections_requested:
            sample.corrections_requested ??
            "",

        decision_notes:
            sample.decision_notes ??
            "",
    });

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-black/10 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap gap-2">
                        <Badge>
                            {statusLabels[
                                sample.status
                            ] ??
                                sample.status}
                        </Badge>

                        <Badge>
                            {resultLabels[
                                sample.test_result ??
                                "pending"
                            ] ??
                                "En attente"}
                        </Badge>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-white">
                        {sample.sample_reference ??
                            "Échantillon"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        {supplierName} ·{" "}
                        {quoteReference}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            setEditing(
                                (current) =>
                                    !current
                            )
                        }
                        className="text-xs font-semibold text-cyan-300"
                    >
                        {editing
                            ? "Fermer"
                            : "Évaluer"}
                    </button>

                    <button
                        type="button"
                        onClick={
                            onDelete
                        }
                        className="text-xs font-semibold text-red-300"
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <Info
                    label="Quantité"
                    value={
                        sample.quantity
                    }
                />

                <Info
                    label="Coût total"
                    value={money(
                        sample.total_cost,
                        sample.currency
                    )}
                />

                <Info
                    label="Transporteur"
                    value={
                        sample.carrier
                    }
                />

                <Info
                    label="Tracking"
                    value={
                        sample.tracking_number
                    }
                />

                <Info
                    label="Commande"
                    value={
                        sample.ordered_at
                    }
                />

                <Info
                    label="Réception"
                    value={
                        sample.received_at
                    }
                />
            </div>

            <div className="mt-5">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                    Étape actuelle
                </div>

                <select
                    value={
                        sample.status
                    }
                    disabled={saving}
                    onChange={(
                        event
                    ) =>
                        onUpdate({
                            status:
                                event.target
                                    .value,
                        })
                    }
                    className={inputClass}
                >
                    {Object.entries(
                        statusLabels
                    ).map(
                        ([
                            value,
                            label,
                        ]) => (
                            <option
                                key={
                                    value
                                }
                                value={
                                    value
                                }
                            >
                                {label}
                            </option>
                        )
                    )}
                </select>
            </div>

            {editing && (
                <div className="mt-6 border-t border-white/[0.07] pt-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-400">
                        Contrôle et tests
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <ScoreField
                            label="Qualité"
                            value={
                                scores.quality_score
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        quality_score:
                                            value,
                                    })
                                )
                            }
                        />

                        <ScoreField
                            label="Conformité"
                            value={
                                scores.conformity_score
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        conformity_score:
                                            value,
                                    })
                                )
                            }
                        />

                        <ScoreField
                            label="Packaging"
                            value={
                                scores.packaging_score
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        packaging_score:
                                            value,
                                    })
                                )
                            }
                        />

                        <ScoreField
                            label="Produit"
                            value={
                                scores.product_score
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        product_score:
                                            value,
                                    })
                                )
                            }
                        />
                    </div>

                    <div className="mt-4">
                        <Field label="Résultat du test">
                            <select
                                value={
                                    scores.test_result
                                }
                                onChange={(
                                    event
                                ) =>
                                    setScores(
                                        (
                                            current
                                        ) => ({
                                            ...current,

                                            test_result:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="pending">
                                    En attente
                                </option>

                                <option value="approved">
                                    Validé
                                </option>

                                <option value="corrections_required">
                                    Corrections
                                    requises
                                </option>

                                <option value="rejected">
                                    Refusé
                                </option>
                            </select>
                        </Field>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <TextArea
                            label="Notes qualité"
                            value={
                                scores.quality_notes
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        quality_notes:
                                            value,
                                    })
                                )
                            }
                        />

                        <TextArea
                            label="Notes conformité"
                            value={
                                scores.conformity_notes
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        conformity_notes:
                                            value,
                                    })
                                )
                            }
                        />

                        <TextArea
                            label="Notes packaging"
                            value={
                                scores.packaging_notes
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        packaging_notes:
                                            value,
                                    })
                                )
                            }
                        />

                        <TextArea
                            label="Notes produit / test"
                            value={
                                scores.test_notes
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        test_notes:
                                            value,
                                    })
                                )
                            }
                        />

                        <TextArea
                            label="Corrections demandées"
                            value={
                                scores.corrections_requested
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        corrections_requested:
                                            value,
                                    })
                                )
                            }
                        />

                        <TextArea
                            label="Note de décision"
                            value={
                                scores.decision_notes
                            }
                            onChange={(
                                value
                            ) =>
                                setScores(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        decision_notes:
                                            value,
                                    })
                                )
                            }
                        />
                    </div>

                    {saved && (
                        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-300">
                            Évaluation enregistrée avec succès.
                        </div>
                    )}

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={async () => {
                                setSaved(false);

                                await onUpdate(
                                    scores
                                );

                                setSaved(true);

                                setTimeout(() => {
                                    setSaved(false);
                                }, 3000);
                            }}
                            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-[#031216] transition hover:bg-cyan-400 disabled:opacity-50"
                        >
                            {saving
                                ? "Enregistrement..."
                                : "Enregistrer l'évaluation"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/40";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                {label}
            </div>

            {children}
        </label>
    );
}

function NumberField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <Field label={label}>
            <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(
                    event
                ) =>
                    onChange(
                        event.target
                            .value
                    )
                }
                className={
                    inputClass
                }
            />
        </Field>
    );
}

function ScoreField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <Field label={`${label} /100`}>
            <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={value}
                onChange={(
                    event
                ) =>
                    onChange(
                        event.target
                            .value
                    )
                }
                className={
                    inputClass
                }
            />
        </Field>
    );
}

function DateField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <Field label={label}>
            <input
                type="date"
                value={value}
                onChange={(
                    event
                ) =>
                    onChange(
                        event.target
                            .value
                    )
                }
                className={
                    inputClass
                }
            />
        </Field>
    );
}

function TextArea({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <Field label={label}>
            <textarea
                rows={4}
                value={value}
                onChange={(
                    event
                ) =>
                    onChange(
                        event.target
                            .value
                    )
                }
                className={`${inputClass} resize-y`}
            />
        </Field>
    );
}

function Badge({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-300">
            {children}
        </span>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value:
    | string
    | number
    | null
    | undefined;
}) {
    return (
        <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {label}
            </div>

            <div className="mt-1 text-sm text-slate-300">
                {value ??
                    "Non renseigné"}
            </div>
        </div>
    );
}