"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";
import CommercialOfferImages from "@/components/admin/CommercialOfferImages";

type FormState = {
    title: string;
    slug: string;
    subtitle: string;
    short_description: string;
    description: string;

    category: string;
    product_type: string;

    price_from: string;
    market_price: string;
    currency: string;
    price_label: string;

    image_url: string;
    gallery_urls: string[];

    cta_type: string;
    cta_label: string;
    cta_url: string;

    conditions: string;
    delivery_information: string;

    seo_title: string;
    seo_description: string;

    status: "draft" | "published";

    featured: boolean;
    homepage: boolean;
    specifications: Record<string, string>;
};

const initialState: FormState = {
    title: "",
    slug: "",
    subtitle: "",
    short_description: "",
    description: "",

    category: "",
    product_type: "",

    price_from: "",
    market_price: "",
    currency: "EUR",
    price_label: "À partir de",

    image_url: "",
    gallery_urls: [],

    cta_type: "quote",
    cta_label: "Demander un devis",
    cta_url: "",

    conditions: "",
    delivery_information: "",

    seo_title: "",
    seo_description: "",

    status: "draft",

    featured: false,
    homepage: false,
    specifications: {},
};

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
    placeholder?: string;
}) {
    return (
        <label className="space-y-2">
            <span className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                {label}
            </span>

            <input
                type="text"
                value={value}
                placeholder={
                    placeholder
                }
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
            />
        </label>
    );
}

type OfferData = Partial<FormState> & {
    id?: string;
    published_at?: string | null;
};

export default function CommercialOfferForm({
    initialOffer,
}: {
    initialOffer?: OfferData;
}) {
    const router =
        useRouter();

    const isEditing =
        Boolean(initialOffer?.id);

    const [form, setForm] =
        useState<FormState>({
            ...initialState,
            ...initialOffer,

            price_from:
                initialOffer?.price_from != null
                    ? String(
                        initialOffer.price_from
                    )
                    : "",

            market_price:
                initialOffer?.market_price != null
                    ? String(
                        initialOffer.market_price
                    )
                    : "",
        });

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(
            null
        );

    function update<
        K extends keyof FormState
    >(
        field: K,
        value: FormState[K]
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function submit() {
        setSaving(true);
        setError(null);

        try {
            const response =
                await fetch(
                    "/api/admin/offers",
                    {
                        method: isEditing
                            ? "PATCH"
                            : "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            ...form,
                            id: initialOffer?.id,
                            published_at:
                                initialOffer?.published_at,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Création impossible."
                );
            }

            if (!isEditing) {
                router.push(
                    "/admin/offres"
                );
            }

            router.refresh();
        } catch (submitError) {
            setError(
                submitError instanceof
                    Error
                    ? submitError.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#081321] p-5">
                <h2 className="text-sm font-semibold text-white">
                    Informations principales
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Field
                        label="Titre"
                        value={
                            form.title
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "title",
                                value
                            )
                        }
                        placeholder="Minipelle compacte 1T"
                    />

                    <Field
                        label="Slug"
                        value={
                            form.slug
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "slug",
                                value
                            )
                        }
                        placeholder="minipelle-compacte-1t"
                    />

                    <Field
                        label="Sous-titre"
                        value={
                            form.subtitle
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "subtitle",
                                value
                            )
                        }
                        placeholder="Solution compacte pour chantier et terrassement"
                    />

                    <Field
                        label="Catégorie"
                        value={
                            form.category
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "category",
                                value
                            )
                        }
                        placeholder="Construction"
                    />

                    <Field
                        label="Type produit"
                        value={
                            form.product_type
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "product_type",
                                value
                            )
                        }
                        placeholder="Minipelle"
                    />
                </div>

                <label className="mt-4 block space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                        Description courte
                    </span>

                    <textarea
                        rows={3}
                        value={
                            form.short_description
                        }
                        onChange={(
                            event
                        ) =>
                            update(
                                "short_description",
                                event
                                    .target
                                    .value
                            )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                    />
                </label>

                <label className="mt-4 block space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                        Description complète
                    </span>

                    <textarea
                        rows={7}
                        value={
                            form.description
                        }
                        onChange={(
                            event
                        ) =>
                            update(
                                "description",
                                event
                                    .target
                                    .value
                            )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60"
                    />
                </label>
            </div>

            <CommercialOfferImages
                imageUrl={
                    form.image_url
                }
                galleryUrls={
                    form.gallery_urls
                }
                onImageChange={(
                    url
                ) =>
                    update(
                        "image_url",
                        url
                    )
                }
                onGalleryChange={(
                    urls
                ) =>
                    update(
                        "gallery_urls",
                        urls
                    )
                }
            />

            <div className="rounded-2xl border border-white/10 bg-[#081321] p-5">
                <h2 className="text-sm font-semibold text-white">
                    Caractéristiques techniques
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    Ajoutez les informations techniques principales de l’offre.
                </p>

                <div className="mt-5 space-y-3">
                    {Object.entries(
                        form.specifications
                    ).map(
                        ([key, value], index) => (
                            <div
                                key={`${key}-${index}`}
                                className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                            >
                                <input
                                    type="text"
                                    value={key}
                                    placeholder="Ex. Poids opérationnel"
                                    onChange={(event) => {
                                        const entries =
                                            Object.entries(
                                                form.specifications
                                            );

                                        entries[index] = [
                                            event.target.value,
                                            value,
                                        ];

                                        update(
                                            "specifications",
                                            Object.fromEntries(
                                                entries
                                            )
                                        );
                                    }}
                                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
                                />

                                <input
                                    type="text"
                                    value={value}
                                    placeholder="Ex. 1 000 kg"
                                    onChange={(event) => {
                                        update(
                                            "specifications",
                                            {
                                                ...form.specifications,
                                                [key]:
                                                    event.target
                                                        .value,
                                            }
                                        );
                                    }}
                                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const entries =
                                            Object.entries(
                                                form.specifications
                                            ).filter(
                                                (_, i) =>
                                                    i !== index
                                            );

                                        update(
                                            "specifications",
                                            Object.fromEntries(
                                                entries
                                            )
                                        );
                                    }}
                                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                                >
                                    Supprimer
                                </button>
                            </div>
                        )
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            update(
                                "specifications",
                                {
                                    ...form.specifications,
                                    [`Caractéristique ${Object.keys(
                                        form.specifications
                                    ).length + 1
                                        }`]: "",
                                }
                            )
                        }
                        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
                    >
                        + Ajouter une caractéristique
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#081321] p-5">
                <h2 className="text-sm font-semibold text-white">
                    Prix & CTA
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <Field
                        label="Prix à partir de"
                        value={
                            form.price_from
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "price_from",
                                value
                            )
                        }
                        placeholder="3499"
                    />

                    <Field
                        label="Prix marché indicatif"
                        value={
                            form.market_price
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "market_price",
                                value
                            )
                        }
                        placeholder="4900"
                    />

                    <label className="space-y-2">
                        <span className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                            Devise
                        </span>

                        <select
                            value={
                                form.currency
                            }
                            onChange={(
                                event
                            ) =>
                                update(
                                    "currency",
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white"
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
                        </select>
                    </label>

                    <Field
                        label="Libellé prix"
                        value={
                            form.price_label
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "price_label",
                                value
                            )
                        }
                    />

                    <label className="space-y-2">
                        <span className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                            Type CTA
                        </span>

                        <select
                            value={
                                form.cta_type
                            }
                            onChange={(
                                event
                            ) =>
                                update(
                                    "cta_type",
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white"
                        >
                            <option value="quote">
                                Devis
                            </option>

                            <option value="contact">
                                Contact
                            </option>

                            <option value="sample">
                                Échantillon
                            </option>

                            <option value="buy">
                                Achat
                            </option>
                        </select>
                    </label>

                    <Field
                        label="Texte CTA"
                        value={
                            form.cta_label
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "cta_label",
                                value
                            )
                        }
                    />

                    <Field
                        label="URL CTA"
                        value={
                            form.cta_url
                        }
                        onChange={(
                            value
                        ) =>
                            update(
                                "cta_url",
                                value
                            )
                        }
                        placeholder="/contact"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#081321] p-5">
                <h2 className="text-sm font-semibold text-white">
                    Publication
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <label className="space-y-2">
                        <span className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                            Statut
                        </span>

                        <select
                            value={
                                form.status
                            }
                            onChange={(
                                event
                            ) =>
                                update(
                                    "status",
                                    event
                                        .target
                                        .value as
                                    | "draft"
                                    | "published"
                                )
                            }
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white"
                        >
                            <option value="draft">
                                Brouillon
                            </option>

                            <option value="published">
                                Publiée
                            </option>
                        </select>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
                        <input
                            type="checkbox"
                            checked={
                                form.featured
                            }
                            onChange={(
                                event
                            ) =>
                                update(
                                    "featured",
                                    event
                                        .target
                                        .checked
                                )
                            }
                            className="h-4 w-4 accent-blue-500"
                        />

                        <span className="text-sm text-slate-200">
                            Mettre à la une
                        </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
                        <input
                            type="checkbox"
                            checked={
                                form.homepage
                            }
                            onChange={(
                                event
                            ) =>
                                update(
                                    "homepage",
                                    event
                                        .target
                                        .checked
                                )
                            }
                            className="h-4 w-4 accent-blue-500"
                        />

                        <span className="text-sm text-slate-200">
                            Afficher sur la homepage
                        </span>
                    </label>
                </div>
            </div>

            {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            ) : null}

            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={
                        saving
                    }
                    onClick={
                        submit
                    }
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                    {saving
                        ? "Enregistrement..."
                        : isEditing
                            ? "Enregistrer les modifications"
                            : "Créer l'offre"}
                </button>
            </div>
        </div>
    );
}