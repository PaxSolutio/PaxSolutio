"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    origin_location: string | null;
    product_cost: number | null;
    freight_cost: number | null;
    insurance_cost: number | null;
    customs_duties: number | null;
    customs_clearance_cost: number | null;
    inland_transport_cost: number | null;
    other_costs: number | null;
    landed_cost: number | null;
    landed_cost_unit: number | null;
    target_sale_price: number | null;
    gross_margin: number | null;
    gross_margin_percent: number | null;
    payment_terms: string | null;
    production_lead_time_days: number | null;
    validity_date: string | null;
    status: string;
    notes: string | null;
    created_at: string;
};

type Props = {
    executionProjectId: string;
    suppliers: Supplier[];
    initialQuotes: Quote[];
};

const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    received: "Reçue",
    under_review: "En analyse",
    selected: "Sélectionnée",
    rejected: "Rejetée",
};

const initialForm = {
    supplier_id: "",
    reference: "",
    currency: "EUR",
    quantity: "",
    moq: "",
    unit_price: "",
    incoterm: "EXW",
    origin_location: "",
    freight_cost: "",
    insurance_cost: "",
    customs_duties: "",
    customs_clearance_cost: "",
    inland_transport_cost: "",
    other_costs: "",
    target_sale_price: "",
    payment_terms: "",
    production_lead_time_days: "",
    validity_date: "",
    status: "received",
    notes: "",
};

function numberValue(value: string) {
    const parsed = Number(value);

    return value !== "" &&
        Number.isFinite(parsed)
        ? parsed
        : 0;
}

export default function IntelligenceExecutionQuotes({
    executionProjectId,
    suppliers,
    initialQuotes,
}: Props) {
    const router = useRouter();

    const [quotes, setQuotes] =
        useState<Quote[]>(initialQuotes);

    const [form, setForm] =
        useState(initialForm);

    const [showForm, setShowForm] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    function updateField(
        field: keyof typeof form,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    const preview = useMemo(() => {
        const quantity =
            numberValue(form.quantity);

        const unitPrice =
            numberValue(form.unit_price);

        const productCost =
            quantity * unitPrice;

        const additionalCosts =
            numberValue(form.freight_cost) +
            numberValue(form.insurance_cost) +
            numberValue(form.customs_duties) +
            numberValue(
                form.customs_clearance_cost
            ) +
            numberValue(
                form.inland_transport_cost
            ) +
            numberValue(form.other_costs);

        const landedCost =
            productCost +
            additionalCosts;

        const landedCostUnit =
            quantity > 0
                ? landedCost / quantity
                : 0;

        const salePrice =
            numberValue(
                form.target_sale_price
            );

        const margin =
            salePrice > 0
                ? salePrice -
                  landedCostUnit
                : 0;

        const marginPercent =
            salePrice > 0
                ? (margin / salePrice) *
                  100
                : 0;

        return {
            productCost,
            landedCost,
            landedCostUnit,
            margin,
            marginPercent,
        };
    }, [form]);

    async function createQuote() {
        try {
            setSaving(true);
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/quotes`,
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
                    data.error ||
                        "Impossible d'enregistrer la cotation."
                );
            }

            setQuotes((current) => [
                data.quote,
                ...current,
            ]);

            setForm(initialForm);
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

    async function deleteQuote(
        quoteId: string
    ) {
        if (
            !window.confirm(
                "Supprimer cette cotation ?"
            )
        ) {
            return;
        }

        try {
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/quotes`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            quote_id:
                                quoteId,
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
                        "Suppression impossible."
                );
            }

            setQuotes((current) =>
                current.filter(
                    (quote) =>
                        quote.id !==
                        quoteId
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

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                        Analyse financière
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Cotations fournisseurs
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Compare les prix usine,
                        coûts logistiques,
                        coûts rendus et marges
                        potentielles du projet.
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
                    className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                >
                    {showForm
                        ? "Fermer"
                        : "+ Ajouter une cotation"}
                </button>
            </div>

            {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="text-base font-semibold text-white">
                        Nouvelle cotation
                    </h3>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Field label="Fournisseur">
                            <select
                                value={
                                    form.supplier_id
                                }
                                onChange={(e) =>
                                    updateField(
                                        "supplier_id",
                                        e.target
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

                        <Field label="Référence devis">
                            <input
                                value={
                                    form.reference
                                }
                                onChange={(e) =>
                                    updateField(
                                        "reference",
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="QT-2026-001"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Devise">
                            <select
                                value={
                                    form.currency
                                }
                                onChange={(e) =>
                                    updateField(
                                        "currency",
                                        e.target
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
                            label="Quantité"
                            value={
                                form.quantity
                            }
                            onChange={(v) =>
                                updateField(
                                    "quantity",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="MOQ"
                            value={form.moq}
                            onChange={(v) =>
                                updateField(
                                    "moq",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Prix usine / unité"
                            value={
                                form.unit_price
                            }
                            onChange={(v) =>
                                updateField(
                                    "unit_price",
                                    v
                                )
                            }
                        />

                        <Field label="Incoterm">
                            <select
                                value={
                                    form.incoterm
                                }
                                onChange={(e) =>
                                    updateField(
                                        "incoterm",
                                        e.target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="EXW">
                                    EXW
                                </option>
                                <option value="FOB">
                                    FOB
                                </option>
                                <option value="CIF">
                                    CIF
                                </option>
                                <option value="CFR">
                                    CFR
                                </option>
                                <option value="DAP">
                                    DAP
                                </option>
                                <option value="DDP">
                                    DDP
                                </option>
                            </select>
                        </Field>

                        <Field label="Lieu d'origine">
                            <input
                                value={
                                    form.origin_location
                                }
                                onChange={(e) =>
                                    updateField(
                                        "origin_location",
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Guangzhou / Shenzhen..."
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <NumberField
                            label="Fret"
                            value={
                                form.freight_cost
                            }
                            onChange={(v) =>
                                updateField(
                                    "freight_cost",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Assurance"
                            value={
                                form.insurance_cost
                            }
                            onChange={(v) =>
                                updateField(
                                    "insurance_cost",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Droits de douane"
                            value={
                                form.customs_duties
                            }
                            onChange={(v) =>
                                updateField(
                                    "customs_duties",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Dédouanement"
                            value={
                                form.customs_clearance_cost
                            }
                            onChange={(v) =>
                                updateField(
                                    "customs_clearance_cost",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Transport intérieur"
                            value={
                                form.inland_transport_cost
                            }
                            onChange={(v) =>
                                updateField(
                                    "inland_transport_cost",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Autres coûts"
                            value={
                                form.other_costs
                            }
                            onChange={(v) =>
                                updateField(
                                    "other_costs",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Prix de vente cible / unité"
                            value={
                                form.target_sale_price
                            }
                            onChange={(v) =>
                                updateField(
                                    "target_sale_price",
                                    v
                                )
                            }
                        />

                        <NumberField
                            label="Délai production (jours)"
                            value={
                                form.production_lead_time_days
                            }
                            onChange={(v) =>
                                updateField(
                                    "production_lead_time_days",
                                    v
                                )
                            }
                        />

                        <Field label="Conditions paiement">
                            <input
                                value={
                                    form.payment_terms
                                }
                                onChange={(e) =>
                                    updateField(
                                        "payment_terms",
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="30% / 70%"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Validité du devis">
                            <input
                                type="date"
                                value={
                                    form.validity_date
                                }
                                onChange={(e) =>
                                    updateField(
                                        "validity_date",
                                        e.target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <Metric
                            label="Coût produit"
                            value={
                                preview.productCost
                            }
                            currency={
                                form.currency
                            }
                        />

                        <Metric
                            label="Coût rendu total"
                            value={
                                preview.landedCost
                            }
                            currency={
                                form.currency
                            }
                        />

                        <Metric
                            label="Coût rendu / unité"
                            value={
                                preview.landedCostUnit
                            }
                            currency={
                                form.currency
                            }
                        />

                        <Metric
                            label="Marge brute / unité"
                            value={
                                preview.margin
                            }
                            currency={
                                form.currency
                            }
                        />

                        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Taux de marque
                            </div>

                            <div className="mt-2 text-lg font-semibold text-emerald-300">
                                {preview.marginPercent.toFixed(
                                    1
                                )}
                                %
                            </div>
                        </div>
                    </div>

                    <label className="mt-5 block">
                        <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                            Notes
                        </div>

                        <textarea
                            rows={4}
                            value={
                                form.notes
                            }
                            onChange={(e) =>
                                updateField(
                                    "notes",
                                    e.target
                                        .value
                                )
                            }
                            className={`${inputClass} resize-y`}
                        />
                    </label>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={
                                createQuote
                            }
                            className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#04130d] transition hover:bg-emerald-400 disabled:opacity-50"
                        >
                            {saving
                                ? "Enregistrement..."
                                : "Enregistrer la cotation"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 space-y-4">
                {quotes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">
                        Aucune cotation
                        enregistrée.
                    </div>
                ) : (
                    quotes.map(
                        (quote) => (
                            <div
                                key={
                                    quote.id
                                }
                                className="rounded-2xl border border-white/[0.08] bg-black/10 p-5"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>
                                                {
                                                    statusLabels[
                                                        quote
                                                            .status
                                                    ] ??
                                                    quote.status
                                                }
                                            </Badge>

                                            {quote.incoterm && (
                                                <Badge>
                                                    {
                                                        quote.incoterm
                                                    }
                                                </Badge>
                                            )}
                                        </div>

                                        <h3 className="mt-3 text-lg font-semibold text-white">
                                            {supplierName(
                                                quote.supplier_id
                                            )}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {quote.reference
                                                ? `Devis ${quote.reference}`
                                                : "Cotation sans référence"}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteQuote(
                                                quote.id
                                            )
                                        }
                                        className="text-xs font-medium text-red-300 hover:text-red-200"
                                    >
                                        Supprimer
                                    </button>
                                </div>

                                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                    <Metric
                                        label="Prix usine / u."
                                        value={
                                            quote.unit_price ??
                                            0
                                        }
                                        currency={
                                            quote.currency
                                        }
                                    />

                                    <Metric
                                        label="Coût rendu total"
                                        value={
                                            quote.landed_cost ??
                                            0
                                        }
                                        currency={
                                            quote.currency
                                        }
                                    />

                                    <Metric
                                        label="Coût rendu / u."
                                        value={
                                            quote.landed_cost_unit ??
                                            0
                                        }
                                        currency={
                                            quote.currency
                                        }
                                    />

                                    <Metric
                                        label="Marge / u."
                                        value={
                                            quote.gross_margin ??
                                            0
                                        }
                                        currency={
                                            quote.currency
                                        }
                                    />

                                    <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4">
                                        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                            Taux de marque
                                        </div>

                                        <div className="mt-2 text-lg font-semibold text-emerald-300">
                                            {Number(
                                                quote.gross_margin_percent ??
                                                    0
                                            ).toFixed(
                                                1
                                            )}
                                            %
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                                    <Info
                                        label="Quantité"
                                        value={
                                            quote.quantity
                                        }
                                    />

                                    <Info
                                        label="MOQ"
                                        value={
                                            quote.moq
                                        }
                                    />

                                    <Info
                                        label="Délai"
                                        value={
                                            quote.production_lead_time_days !==
                                            null
                                                ? `${quote.production_lead_time_days} jours`
                                                : null
                                        }
                                    />

                                    <Info
                                        label="Origine"
                                        value={
                                            quote.origin_location
                                        }
                                    />

                                    <Info
                                        label="Paiement"
                                        value={
                                            quote.payment_terms
                                        }
                                    />

                                    <Info
                                        label="Prix vente cible"
                                        value={
                                            quote.target_sale_price !==
                                            null
                                                ? `${Number(
                                                      quote.target_sale_price
                                                  ).toFixed(
                                                      2
                                                  )} ${quote.currency}`
                                                : null
                                        }
                                    />
                                </div>

                                {quote.notes && (
                                    <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                        {
                                            quote.notes
                                        }
                                    </p>
                                )}
                            </div>
                        )
                    )
                )}
            </div>
        </section>
    );
}

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40";

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
    onChange: (value: string) => void;
}) {
    return (
        <Field label={label}>
            <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className={
                    inputClass
                }
            />
        </Field>
    );
}

function Metric({
    label,
    value,
    currency,
}: {
    label: string;
    value: number;
    currency: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {label}
            </div>

            <div className="mt-2 text-lg font-semibold text-white">
                {Number(value).toLocaleString(
                    "fr-FR",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }
                )}{" "}
                {currency}
            </div>
        </div>
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