"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
    id: string;
    status: string;
    priority: string;

    target_market: string | null;
    target_country: string | null;

    target_purchase_price: number | null;
    target_landed_cost: number | null;
    target_sale_price: number | null;

    currency: string | null;

    supplier_notes: string | null;
    compliance_notes: string | null;
    logistics_notes: string | null;
    commercial_notes: string | null;
    internal_notes: string | null;
};

type Props = {
    project: Project;
};

const STATUS_OPTIONS = [
    ["qualification", "Qualification"],
    ["sourcing", "Sourcing"],
    ["quotation", "Cotations"],
    ["sample", "Échantillon"],
    ["compliance", "Conformité"],
    ["logistics", "Logistique"],
    [
        "commercial_ready",
        "Prêt commercialement",
    ],
    ["launched", "Lancé"],
    ["cancelled", "Annulé"],
];

const PRIORITY_OPTIONS = [
    ["low", "Basse"],
    ["medium", "Moyenne"],
    ["high", "Haute"],
];

export default function IntelligenceExecutionEditor({
    project,
}: Props) {
    const router = useRouter();

    const [form, setForm] = useState({
        status:
            project.status ||
            "qualification",

        priority:
            project.priority ||
            "medium",

        target_market:
            project.target_market || "",

        target_country:
            project.target_country || "",

        target_purchase_price:
            project.target_purchase_price?.toString() ||
            "",

        target_landed_cost:
            project.target_landed_cost?.toString() ||
            "",

        target_sale_price:
            project.target_sale_price?.toString() ||
            "",

        currency:
            project.currency || "EUR",

        supplier_notes:
            project.supplier_notes || "",

        compliance_notes:
            project.compliance_notes || "",

        logistics_notes:
            project.logistics_notes || "",

        commercial_notes:
            project.commercial_notes || "",

        internal_notes:
            project.internal_notes || "",
    });

    const [saving, setSaving] =
        useState(false);

    const [success, setSuccess] =
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

        setSuccess(false);
    }

    async function save() {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const response = await fetch(
                `/api/admin/intelligence/execution/${project.id}`,
                {
                    method: "PATCH",

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
                        "Impossible d'enregistrer le projet."
                );
            }

            setSuccess(true);

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

    return (
        <section className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.035] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                        Pilotage opérationnel
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Mettre à jour le projet
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Les informations saisies
                        ici deviennent les données
                        opérationnelles de référence
                        du projet.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-wait disabled:opacity-50"
                >
                    {saving
                        ? "Enregistrement..."
                        : "Enregistrer"}
                </button>
            </div>

            {success && (
                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    Projet mis à jour avec
                    succès.
                </div>
            )}

            {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="mt-7 grid gap-5 md:grid-cols-2">
                <Field label="Phase actuelle">
                    <select
                        value={
                            form.status
                        }
                        onChange={(event) =>
                            updateField(
                                "status",
                                event.target
                                    .value
                            )
                        }
                        className={inputClass}
                    >
                        {STATUS_OPTIONS.map(
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
                                    {
                                        label
                                    }
                                </option>
                            )
                        )}
                    </select>
                </Field>

                <Field label="Priorité">
                    <select
                        value={
                            form.priority
                        }
                        onChange={(event) =>
                            updateField(
                                "priority",
                                event.target
                                    .value
                            )
                        }
                        className={inputClass}
                    >
                        {PRIORITY_OPTIONS.map(
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
                                    {
                                        label
                                    }
                                </option>
                            )
                        )}
                    </select>
                </Field>

                <Field label="Marché cible">
                    <input
                        value={
                            form.target_market
                        }
                        onChange={(event) =>
                            updateField(
                                "target_market",
                                event.target
                                    .value
                            )
                        }
                        placeholder="Ex. Automobile B2B"
                        className={inputClass}
                    />
                </Field>

                <Field label="Pays cible">
                    <input
                        value={
                            form.target_country
                        }
                        onChange={(event) =>
                            updateField(
                                "target_country",
                                event.target
                                    .value
                            )
                        }
                        placeholder="Ex. France"
                        className={inputClass}
                    />
                </Field>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-4">
                <Field label="Prix achat cible">
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            form.target_purchase_price
                        }
                        onChange={(event) =>
                            updateField(
                                "target_purchase_price",
                                event.target
                                    .value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Coût rendu cible">
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            form.target_landed_cost
                        }
                        onChange={(event) =>
                            updateField(
                                "target_landed_cost",
                                event.target
                                    .value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Prix vente cible">
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                            form.target_sale_price
                        }
                        onChange={(event) =>
                            updateField(
                                "target_sale_price",
                                event.target
                                    .value
                            )
                        }
                        className={inputClass}
                    />
                </Field>

                <Field label="Devise">
                    <select
                        value={
                            form.currency
                        }
                        onChange={(event) =>
                            updateField(
                                "currency",
                                event.target
                                    .value
                            )
                        }
                        className={inputClass}
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

                        <option value="GBP">
                            GBP
                        </option>
                    </select>
                </Field>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
                <TextArea
                    label="Sourcing & fournisseurs"
                    value={
                        form.supplier_notes
                    }
                    onChange={(value) =>
                        updateField(
                            "supplier_notes",
                            value
                        )
                    }
                />

                <TextArea
                    label="Conformité"
                    value={
                        form.compliance_notes
                    }
                    onChange={(value) =>
                        updateField(
                            "compliance_notes",
                            value
                        )
                    }
                />

                <TextArea
                    label="Logistique"
                    value={
                        form.logistics_notes
                    }
                    onChange={(value) =>
                        updateField(
                            "logistics_notes",
                            value
                        )
                    }
                />

                <TextArea
                    label="Commercialisation"
                    value={
                        form.commercial_notes
                    }
                    onChange={(value) =>
                        updateField(
                            "commercial_notes",
                            value
                        )
                    }
                />
            </div>

            <div className="mt-5">
                <TextArea
                    label="Notes internes"
                    value={
                        form.internal_notes
                    }
                    onChange={(value) =>
                        updateField(
                            "internal_notes",
                            value
                        )
                    }
                    large
                />
            </div>
        </section>
    );
}

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40";

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

function TextArea({
    label,
    value,
    onChange,
    large = false,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
    large?: boolean;
}) {
    return (
        <label className="block">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                {label}
            </div>

            <textarea
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                rows={large ? 6 : 5}
                className={`${inputClass} resize-y`}
            />
        </label>
    );
}