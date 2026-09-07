"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Supplier = {
    id: string;
    name: string;

    country: string | null;
    city: string | null;

    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_wechat: string | null;
    website: string | null;

    supplier_type: string;
    verification_status: string;

    verification_notes: string | null;
    payment_terms: string | null;

    production_lead_time_days: number | null;
    sample_available: boolean;

    notes: string | null;
};

type Props = {
    executionProjectId: string;
    initialSuppliers: Supplier[];
};

const supplierTypeLabels: Record<string, string> = {
    factory: "Usine",
    trading_company: "Société de négoce",
    distributor: "Distributeur",
    agent: "Agent",
    other: "Autre",
};

const verificationLabels: Record<string, string> = {
    unverified: "Non vérifié",
    in_review: "En vérification",
    verified: "Vérifié",
    rejected: "Rejeté",
};

export default function IntelligenceExecutionSuppliers({
    executionProjectId,
    initialSuppliers,
}: Props) {
    const router = useRouter();

    const [suppliers, setSuppliers] =
        useState<Supplier[]>(initialSuppliers);

    const [showForm, setShowForm] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        country: "",
        city: "",

        supplier_type: "factory",

        contact_name: "",
        contact_email: "",
        contact_phone: "",
        contact_wechat: "",
        website: "",

        verification_status:
            "unverified",

        verification_notes: "",

        payment_terms: "",

        production_lead_time_days:
            "",

        sample_available: false,

        notes: "",
    });

    function updateField(
        field: keyof typeof form,
        value: string | boolean
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function createSupplier() {
        try {
            setSaving(true);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/execution/${executionProjectId}/suppliers`,
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
                        "Impossible de créer le fournisseur."
                );
            }

            setSuppliers(
                (current) => [
                    ...current,
                    data.supplier,
                ]
            );

            setForm({
                name: "",
                country: "",
                city: "",

                supplier_type:
                    "factory",

                contact_name: "",
                contact_email: "",
                contact_phone: "",
                contact_wechat: "",
                website: "",

                verification_status:
                    "unverified",

                verification_notes:
                    "",

                payment_terms: "",

                production_lead_time_days:
                    "",

                sample_available:
                    false,

                notes: "",
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

    async function deleteSupplier(
        supplierId: string
    ) {
        const confirmed =
            window.confirm(
                "Supprimer ce fournisseur ?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/execution/${executionProjectId}/suppliers`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        supplier_id:
                            supplierId,
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
                        "Impossible de supprimer le fournisseur."
                );
            }

            setSuppliers(
                (current) =>
                    current.filter(
                        (supplier) =>
                            supplier.id !==
                            supplierId
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
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                        Sourcing
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Fournisseurs
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Centralise les usines,
                        distributeurs et partenaires
                        étudiés pour ce projet.
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
                    className="rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                >
                    {showForm
                        ? "Fermer"
                        : "+ Ajouter un fournisseur"}
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
                        Nouveau fournisseur
                    </h3>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Field label="Nom fournisseur">
                            <input
                                value={
                                    form.name
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "name",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Ex. Guangzhou ABC Manufacturing"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Type">
                            <select
                                value={
                                    form.supplier_type
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "supplier_type",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="factory">
                                    Usine
                                </option>

                                <option value="trading_company">
                                    Société de négoce
                                </option>

                                <option value="distributor">
                                    Distributeur
                                </option>

                                <option value="agent">
                                    Agent
                                </option>

                                <option value="other">
                                    Autre
                                </option>
                            </select>
                        </Field>

                        <Field label="Pays">
                            <input
                                value={
                                    form.country
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "country",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Chine"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Ville">
                            <input
                                value={
                                    form.city
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "city",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Guangzhou"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Contact">
                            <input
                                value={
                                    form.contact_name
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "contact_name",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Nom du contact"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Email">
                            <input
                                value={
                                    form.contact_email
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "contact_email",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="contact@..."
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Téléphone">
                            <input
                                value={
                                    form.contact_phone
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "contact_phone",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="WeChat">
                            <input
                                value={
                                    form.contact_wechat
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "contact_wechat",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Site web">
                            <input
                                value={
                                    form.website
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "website",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Vérification">
                            <select
                                value={
                                    form.verification_status
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "verification_status",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="unverified">
                                    Non vérifié
                                </option>

                                <option value="in_review">
                                    En vérification
                                </option>

                                <option value="verified">
                                    Vérifié
                                </option>

                                <option value="rejected">
                                    Rejeté
                                </option>
                            </select>
                        </Field>

                        <Field label="Délai production (jours)">
                            <input
                                type="number"
                                min="0"
                                value={
                                    form.production_lead_time_days
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "production_lead_time_days",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Conditions de paiement">
                            <input
                                value={
                                    form.payment_terms
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "payment_terms",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Ex. 30% / 70%"
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <label className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={
                                form.sample_available
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    "sample_available",
                                    event
                                        .target
                                        .checked
                                )
                            }
                        />

                        Échantillon disponible
                    </label>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <TextArea
                            label="Notes de vérification"
                            value={
                                form.verification_notes
                            }
                            onChange={(value) =>
                                updateField(
                                    "verification_notes",
                                    value
                                )
                            }
                        />

                        <TextArea
                            label="Notes internes"
                            value={
                                form.notes
                            }
                            onChange={(value) =>
                                updateField(
                                    "notes",
                                    value
                                )
                            }
                        />
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={
                                createSupplier
                            }
                            className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-wait disabled:opacity-50"
                        >
                            {saving
                                ? "Création..."
                                : "Créer le fournisseur"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 space-y-4">
                {suppliers.length ===
                0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">
                        Aucun fournisseur
                        enregistré.
                    </div>
                ) : (
                    suppliers.map(
                        (supplier) => (
                            <div
                                key={
                                    supplier.id
                                }
                                className="rounded-2xl border border-white/[0.08] bg-black/10 p-5"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>
                                                {
                                                    supplierTypeLabels[
                                                        supplier
                                                            .supplier_type
                                                    ] ??
                                                    supplier.supplier_type
                                                }
                                            </Badge>

                                            <Badge>
                                                {
                                                    verificationLabels[
                                                        supplier
                                                            .verification_status
                                                    ] ??
                                                    supplier.verification_status
                                                }
                                            </Badge>

                                            {supplier.sample_available && (
                                                <Badge>
                                                    Échantillon
                                                    disponible
                                                </Badge>
                                            )}
                                        </div>

                                        <h3 className="mt-3 text-lg font-semibold text-white">
                                            {
                                                supplier.name
                                            }
                                        </h3>

                                        {(supplier.city ||
                                            supplier.country) && (
                                            <p className="mt-1 text-sm text-slate-400">
                                                {[
                                                    supplier.city,
                                                    supplier.country,
                                                ]
                                                    .filter(
                                                        Boolean
                                                    )
                                                    .join(
                                                        ", "
                                                    )}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteSupplier(
                                                supplier.id
                                            )
                                        }
                                        className="text-xs font-medium text-red-300 transition hover:text-red-200"
                                    >
                                        Supprimer
                                    </button>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <Info
                                        label="Contact"
                                        value={
                                            supplier.contact_name
                                        }
                                    />

                                    <Info
                                        label="Email"
                                        value={
                                            supplier.contact_email
                                        }
                                    />

                                    <Info
                                        label="WeChat"
                                        value={
                                            supplier.contact_wechat
                                        }
                                    />

                                    <Info
                                        label="Délai production"
                                        value={
                                            supplier.production_lead_time_days !==
                                            null
                                                ? `${supplier.production_lead_time_days} jours`
                                                : null
                                        }
                                    />

                                    <Info
                                        label="Paiement"
                                        value={
                                            supplier.payment_terms
                                        }
                                    />

                                    <Info
                                        label="Téléphone"
                                        value={
                                            supplier.contact_phone
                                        }
                                    />

                                    <Info
                                        label="Site"
                                        value={
                                            supplier.website
                                        }
                                    />
                                </div>

                                {supplier.verification_notes && (
                                    <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                        <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                            Vérification
                                        </div>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                            {
                                                supplier.verification_notes
                                            }
                                        </p>
                                    </div>
                                )}

                                {supplier.notes && (
                                    <div className="mt-3 text-sm leading-6 text-slate-400">
                                        {
                                            supplier.notes
                                        }
                                    </div>
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
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <label className="block">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                {label}
            </div>

            <textarea
                value={value}
                rows={4}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className={`${inputClass} resize-y`}
            />
        </label>
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
        | null
        | undefined;
}) {
    return (
        <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {label}
            </div>

            <div className="mt-1 text-sm text-slate-300">
                {value ||
                    "Non renseigné"}
            </div>
        </div>
    );
}