"use client";

import {
    ChangeEvent,
    FormEvent,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import CommercialOfferImages from "@/components/admin/CommercialOfferImages";

type DepositType = "percent" | "fixed";

type FormState = {
    id?: string;

    title: string;
    slug: string;
    subtitle: string;
    short_description: string;
    description: string;

    category: string;
    product_type: string;
    tags: string[];

    image_url: string;
    gallery_urls: string[];
    video_url: string;

    price_from: string;
    market_price: string;
    currency: string;
    price_label: string;

    selling_points: string[];
    specifications: Record<string, string>;

    conditions: string;
    delivery_information: string;

    cta_type: string;
    cta_label: string;
    cta_url: string;

    // Paiement
    payment_enabled: boolean;
    payment_price: string;

    full_payment_enabled: boolean;

    deposit_enabled: boolean;
    deposit_type: DepositType;
    deposit_percent: string;
    deposit_amount: string;

    status: string;

    featured: boolean;
    homepage: boolean;

    placement_pages: string[];

    seo_title: string;
    seo_description: string;

    published_at?: string | null;
};

type InitialOffer =
    Partial<FormState> & {
        price_from?: number | string | null;
        market_price?: number | string | null;

        payment_price?: number | string | null;
        deposit_percent?: number | string | null;
        deposit_amount?: number | string | null;

        image_url?: string | null;
        video_url?: string | null;

        subtitle?: string | null;
        short_description?: string | null;
        description?: string | null;

        category?: string | null;
        product_type?: string | null;

        conditions?: string | null;
        delivery_information?: string | null;

        cta_type?: string | null;
        cta_label?: string | null;
        cta_url?: string | null;

        seo_title?: string | null;
        seo_description?: string | null;

        tags?: string[] | null;
        gallery_urls?: string[] | null;
        selling_points?: string[] | null;

        specifications?: Record<string, string> | null;
        placement_pages?: string[] | null;
    };

function createSlug(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function stringValue(
    value: string | number | null | undefined
) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function formatMoney(
    value: number,
    currency: string
) {
    try {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: currency || "EUR",
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${value.toFixed(2)} ${currency || "EUR"}`;
    }
}

export default function CommercialOfferForm({
    initialOffer,
}: {
    initialOffer?: InitialOffer;
}) {
    const router = useRouter();

    const isEditing = Boolean(initialOffer?.id);

    const [form, setForm] = useState<FormState>({
        id: initialOffer?.id,

        title: initialOffer?.title ?? "",
        slug: initialOffer?.slug ?? "",

        subtitle: initialOffer?.subtitle ?? "",
        short_description:
            initialOffer?.short_description ?? "",
        description: initialOffer?.description ?? "",

        category: initialOffer?.category ?? "",
        product_type: initialOffer?.product_type ?? "",

        tags: initialOffer?.tags ?? [],

        image_url: initialOffer?.image_url ?? "",
        gallery_urls: initialOffer?.gallery_urls ?? [],
        video_url: initialOffer?.video_url ?? "",

        price_from: stringValue(initialOffer?.price_from),
        market_price: stringValue(initialOffer?.market_price),

        currency: initialOffer?.currency ?? "EUR",
        price_label: initialOffer?.price_label ?? "À partir de",

        selling_points: initialOffer?.selling_points ?? [],

        specifications:
            initialOffer?.specifications ?? {},

        conditions: initialOffer?.conditions ?? "",

        delivery_information:
            initialOffer?.delivery_information ?? "",

        cta_type: initialOffer?.cta_type ?? "quote",

        cta_label:
            initialOffer?.cta_label ?? "Demander un devis",

        cta_url: initialOffer?.cta_url ?? "",

        // =====================================================
        // PAIEMENT
        // =====================================================

        payment_enabled: Boolean(
            initialOffer?.payment_enabled
        ),

        payment_price: stringValue(
            initialOffer?.payment_price
        ),

        full_payment_enabled: Boolean(
            initialOffer?.full_payment_enabled
        ),

        deposit_enabled: Boolean(
            initialOffer?.deposit_enabled
        ),

        deposit_type:
            initialOffer?.deposit_type === "fixed"
                ? "fixed"
                : "percent",

        deposit_percent: stringValue(
            initialOffer?.deposit_percent
        ),

        deposit_amount: stringValue(
            initialOffer?.deposit_amount
        ),

        status: initialOffer?.status ?? "draft",

        featured: Boolean(initialOffer?.featured),
        homepage: Boolean(initialOffer?.homepage),

        placement_pages:
            initialOffer?.placement_pages ?? [],

        seo_title: initialOffer?.seo_title ?? "",

        seo_description:
            initialOffer?.seo_description ?? "",

        published_at:
            initialOffer?.published_at ?? null,
    });

    const [tagsText, setTagsText] = useState(
        form.tags.join(", ")
    );

    const [sellingPointsText, setSellingPointsText] =
        useState(
            form.selling_points.join("\n")
        );

    const [specificationsText, setSpecificationsText] =
        useState(
            Object.entries(form.specifications)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n")
        );

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    // =========================================================
    // CALCUL DU PAIEMENT
    // =========================================================

    const paymentCalculations = useMemo(() => {
        const price = Number(form.payment_price);

        const validPrice =
            Number.isFinite(price) && price > 0;

        if (!validPrice) {
            return {
                price: 0,
                deposit: 0,
                balance: 0,
                valid: false,
            };
        }

        let deposit = 0;

        if (form.deposit_enabled) {
            if (form.deposit_type === "percent") {
                const percent = Number(form.deposit_percent);

                if (
                    Number.isFinite(percent) &&
                    percent > 0
                ) {
                    deposit =
                        price * (percent / 100);
                }
            } else {
                const fixed = Number(form.deposit_amount);

                if (
                    Number.isFinite(fixed) &&
                    fixed > 0
                ) {
                    deposit = fixed;
                }
            }
        }

        return {
            price,
            deposit,
            balance: Math.max(price - deposit, 0),
            valid: true,
        };
    }, [
        form.payment_price,
        form.deposit_enabled,
        form.deposit_type,
        form.deposit_percent,
        form.deposit_amount,
    ]);

    function updateField<K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    function handleTitleChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const value = event.target.value;

        setForm((current) => {
            const oldGeneratedSlug =
                createSlug(current.title);

            const shouldUpdateSlug =
                !current.slug ||
                current.slug === oldGeneratedSlug;

            return {
                ...current,
                title: value,
                slug: shouldUpdateSlug
                    ? createSlug(value)
                    : current.slug,
            };
        });
    }

    // =========================================================
    // SAVE
    // =========================================================

    async function saveOffer(
        status: "draft" | "published" | "archived"
    ) {
        if (!form.title.trim()) {
            setError("Le titre est obligatoire.");
            return;
        }

        if (!form.slug.trim()) {
            setError("Le slug est obligatoire.");
            return;
        }

        if (form.payment_enabled) {
            const paymentPrice =
                Number(form.payment_price);

            if (
                !Number.isFinite(paymentPrice) ||
                paymentPrice <= 0
            ) {
                setError(
                    "Indiquez un prix réellement payable supérieur à 0."
                );
                return;
            }

            if (
                !form.full_payment_enabled &&
                !form.deposit_enabled
            ) {
                setError(
                    "Activez au moins le paiement intégral ou l'acompte."
                );
                return;
            }

            if (
                form.deposit_enabled &&
                form.deposit_type === "percent"
            ) {
                const percent =
                    Number(form.deposit_percent);

                if (
                    !Number.isFinite(percent) ||
                    percent <= 0 ||
                    percent >= 100
                ) {
                    setError(
                        "L'acompte doit être compris entre 0 et 100 %."
                    );
                    return;
                }
            }

            if (
                form.deposit_enabled &&
                form.deposit_type === "fixed"
            ) {
                const amount =
                    Number(form.deposit_amount);

                if (
                    !Number.isFinite(amount) ||
                    amount <= 0
                ) {
                    setError(
                        "Indiquez un montant d'acompte supérieur à 0."
                    );
                    return;
                }

                if (amount >= paymentPrice) {
                    setError(
                        "L'acompte doit être inférieur au prix payable."
                    );
                    return;
                }
            }
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const tags = tagsText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            const sellingPoints = sellingPointsText
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);

            const specifications = specificationsText
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .reduce<Record<string, string>>(
                    (result, line) => {
                        const separator =
                            line.indexOf(":");

                        if (separator === -1) {
                            return result;
                        }

                        const key = line
                            .slice(0, separator)
                            .trim();

                        const value = line
                            .slice(separator + 1)
                            .trim();

                        if (key && value) {
                            result[key] = value;
                        }

                        return result;
                    },
                    {}
                );

            const payload = {
                ...form,

                id: initialOffer?.id,

                slug: createSlug(form.slug),

                tags,

                selling_points: sellingPoints,

                specifications,

                status,

                payment_price: form.payment_enabled
                    ? form.payment_price
                    : "",

                full_payment_enabled:
                    form.payment_enabled
                        ? form.full_payment_enabled
                        : false,

                deposit_enabled:
                    form.payment_enabled
                        ? form.deposit_enabled
                        : false,

                deposit_percent:
                    form.payment_enabled &&
                        form.deposit_enabled &&
                        form.deposit_type === "percent"
                        ? form.deposit_percent
                        : "",

                deposit_amount:
                    form.payment_enabled &&
                        form.deposit_enabled &&
                        form.deposit_type === "fixed"
                        ? form.deposit_amount
                        : "",
            };

            const response = await fetch(
                "/api/admin/offers",
                {
                    method: isEditing ? "PATCH" : "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    "Impossible d'enregistrer l'offre."
                );
                return;
            }

            setSuccess(
                status === "published"
                    ? "Offre publiée."
                    : status === "archived"
                        ? "Offre archivée."
                        : "Brouillon enregistré."
            );

            if (!isEditing && data.offer?.id) {
                router.push(
                    `/admin/offres/${data.offer.id}`
                );

                router.refresh();
                return;
            }

            router.refresh();
        } catch (saveError) {
            console.error(saveError);

            setError(
                "Une erreur est survenue pendant l'enregistrement."
            );
        } finally {
            setSaving(false);
        }
    }

    function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        saveOffer("draft");
    }

    const fieldClass =
        "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:bg-white/[0.06]";

    const labelClass =
        "mb-2 block text-sm font-medium text-slate-300";

    const sectionClass =
        "rounded-2xl border border-white/10 bg-white/[0.03] p-6";

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                    {success}
                </div>
            )}

            <section className={sectionClass}>
                <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Informations
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                        Offre commerciale
                    </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            Titre *
                        </label>

                        <input
                            value={form.title}
                            onChange={handleTitleChange}
                            className={fieldClass}
                            placeholder="Mini-pelle 1T"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            Slug *
                        </label>

                        <input
                            value={form.slug}
                            onChange={(event) =>
                                updateField(
                                    "slug",
                                    createSlug(event.target.value)
                                )
                            }
                            className={fieldClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Catégorie
                        </label>

                        <input
                            value={form.category}
                            onChange={(event) =>
                                updateField(
                                    "category",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="Engins de chantier"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Type de produit
                        </label>

                        <input
                            value={form.product_type}
                            onChange={(event) =>
                                updateField(
                                    "product_type",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="Mini-pelle"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            Sous-titre
                        </label>

                        <input
                            value={form.subtitle}
                            onChange={(event) =>
                                updateField(
                                    "subtitle",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            Description courte
                        </label>

                        <textarea
                            rows={3}
                            value={form.short_description}
                            onChange={(event) =>
                                updateField(
                                    "short_description",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            Description complète
                        </label>

                        <textarea
                            rows={8}
                            value={form.description}
                            onChange={(event) =>
                                updateField(
                                    "description",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            Tags
                        </label>

                        <input
                            value={tagsText}
                            onChange={(event) =>
                                setTagsText(event.target.value)
                            }
                            className={fieldClass}
                            placeholder="mini-pelle, chantier, import"
                        />
                    </div>
                </div>
            </section>

            {/* =====================================================
          MÉDIAS
      ====================================================== */}

            <section className={sectionClass}>
                <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Médias
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                        Images & vidéo
                    </h2>
                </div>

                <CommercialOfferImages
                    imageUrl={form.image_url}
                    galleryUrls={form.gallery_urls}
                    onImageChange={(url) =>
                        updateField(
                            "image_url",
                            url
                        )
                    }
                    onGalleryChange={(urls) =>
                        updateField(
                            "gallery_urls",
                            urls
                        )
                    }
                />

                <div className="mt-6">
                    <label className={labelClass}>
                        URL vidéo
                    </label>

                    <input
                        type="url"
                        value={form.video_url}
                        onChange={(event) =>
                            updateField(
                                "video_url",
                                event.target.value
                            )
                        }
                        className={fieldClass}
                        placeholder="https://..."
                    />
                </div>
            </section>

            {/* =====================================================
          PRIX & CTA
      ====================================================== */}

            <section className={sectionClass}>
                <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Commercial
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                        Prix & CTA
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Le prix affiché peut rester indicatif. Le prix
                        réellement payable est configuré séparément
                        dans la section Paiement en ligne.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            Prix affiché à partir de
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price_from}
                            onChange={(event) =>
                                updateField(
                                    "price_from",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="4500"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Prix marché indicatif
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.market_price}
                            onChange={(event) =>
                                updateField(
                                    "market_price",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="6000"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Devise
                        </label>

                        <select
                            value={form.currency}
                            onChange={(event) =>
                                updateField(
                                    "currency",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                        >
                            <option value="EUR">EUR — Euro</option>
                            <option value="USD">USD — Dollar US</option>
                            <option value="GBP">GBP — Livre sterling</option>
                            <option value="CNY">CNY — Yuan</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Libellé du prix
                        </label>

                        <input
                            value={form.price_label}
                            onChange={(event) =>
                                updateField(
                                    "price_label",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="À partir de"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Type de CTA
                        </label>

                        <select
                            value={form.cta_type}
                            onChange={(event) =>
                                updateField(
                                    "cta_type",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                        >
                            <option value="quote">
                                Demande de devis
                            </option>
                            <option value="contact">
                                Contact
                            </option>
                            <option value="external">
                                Lien externe
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Texte du CTA
                        </label>

                        <input
                            value={form.cta_label}
                            onChange={(event) =>
                                updateField(
                                    "cta_label",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="Demander un devis"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>
                            URL du CTA
                        </label>

                        <input
                            value={form.cta_url}
                            onChange={(event) =>
                                updateField(
                                    "cta_url",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="/contact"
                        />
                    </div>
                </div>
            </section>

            {/* =====================================================
          PAIEMENT EN LIGNE
      ====================================================== */}

            <section className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.035] p-6">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                            Paiement
                        </div>

                        <h2 className="mt-2 text-xl font-semibold">
                            Paiement en ligne
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Configurez le montant réellement payable et les
                            options proposées au client.
                        </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                        <input
                            type="checkbox"
                            checked={form.payment_enabled}
                            onChange={(event) =>
                                updateField(
                                    "payment_enabled",
                                    event.target.checked
                                )
                            }
                            className="h-4 w-4 accent-emerald-500"
                        />

                        <span className="text-sm font-semibold text-slate-200">
                            {form.payment_enabled
                                ? "Paiement activé"
                                : "Activer"}
                        </span>
                    </label>
                </div>

                {form.payment_enabled && (
                    <div className="mt-7 space-y-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Prix réellement payable *
                                </label>

                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.payment_price}
                                        onChange={(event) =>
                                            updateField(
                                                "payment_price",
                                                event.target.value
                                            )
                                        }
                                        className={`${fieldClass} pr-20`}
                                        placeholder="4500"
                                    />

                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-slate-500">
                                        {form.currency}
                                    </div>
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Ce montant servira de base au paiement.
                                    Il peut être différent du prix indicatif
                                    affiché sur l&apos;offre.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    Prix total
                                </div>

                                <div className="mt-2 text-2xl font-semibold text-white">
                                    {paymentCalculations.valid
                                        ? formatMoney(
                                            paymentCalculations.price,
                                            form.currency
                                        )
                                        : "—"}
                                </div>

                                {form.price_from &&
                                    Number(form.price_from) !==
                                    paymentCalculations.price && (
                                        <div className="mt-2 text-xs text-amber-300">
                                            Prix affiché :{" "}
                                            {formatMoney(
                                                Number(form.price_from) || 0,
                                                form.currency
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* MODES AUTORISÉS */}

                        <div>
                            <div className="mb-3 text-sm font-medium text-slate-300">
                                Modes proposés au client
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <label
                                    className={`cursor-pointer rounded-xl border p-4 transition ${form.full_payment_enabled
                                            ? "border-emerald-500/30 bg-emerald-500/10"
                                            : "border-white/10 bg-black/10 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={form.full_payment_enabled}
                                            onChange={(event) =>
                                                updateField(
                                                    "full_payment_enabled",
                                                    event.target.checked
                                                )
                                            }
                                            className="mt-1 h-4 w-4 accent-emerald-500"
                                        />

                                        <div>
                                            <div className="text-sm font-semibold text-white">
                                                Paiement intégral
                                            </div>

                                            <div className="mt-1 text-xs leading-5 text-slate-500">
                                                Le client peut régler la totalité
                                                de l&apos;offre immédiatement.
                                            </div>

                                            {paymentCalculations.valid && (
                                                <div className="mt-3 text-lg font-semibold text-emerald-300">
                                                    {formatMoney(
                                                        paymentCalculations.price,
                                                        form.currency
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </label>

                                <label
                                    className={`cursor-pointer rounded-xl border p-4 transition ${form.deposit_enabled
                                            ? "border-blue-500/30 bg-blue-500/10"
                                            : "border-white/10 bg-black/10 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={form.deposit_enabled}
                                            onChange={(event) =>
                                                updateField(
                                                    "deposit_enabled",
                                                    event.target.checked
                                                )
                                            }
                                            className="mt-1 h-4 w-4 accent-blue-500"
                                        />

                                        <div>
                                            <div className="text-sm font-semibold text-white">
                                                Acompte / réservation
                                            </div>

                                            <div className="mt-1 text-xs leading-5 text-slate-500">
                                                Le client réserve l&apos;offre en
                                                réglant seulement une partie du prix.
                                            </div>

                                            {form.deposit_enabled &&
                                                paymentCalculations.deposit > 0 && (
                                                    <div className="mt-3 text-lg font-semibold text-blue-300">
                                                        {formatMoney(
                                                            paymentCalculations.deposit,
                                                            form.currency
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* CONFIGURATION ACOMPTE */}

                        {form.deposit_enabled && (
                            <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-5">
                                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                                    Configuration de l&apos;acompte
                                </div>

                                <div className="mt-5 grid gap-5 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>
                                            Type d&apos;acompte
                                        </label>

                                        <select
                                            value={form.deposit_type}
                                            onChange={(event) =>
                                                updateField(
                                                    "deposit_type",
                                                    event.target.value as DepositType
                                                )
                                            }
                                            className={fieldClass}
                                        >
                                            <option value="percent">
                                                Pourcentage du prix
                                            </option>

                                            <option value="fixed">
                                                Montant fixe
                                            </option>
                                        </select>
                                    </div>

                                    {form.deposit_type === "percent" ? (
                                        <div>
                                            <label className={labelClass}>
                                                Pourcentage
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    max="99.99"
                                                    step="0.01"
                                                    value={form.deposit_percent}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "deposit_percent",
                                                            event.target.value
                                                        )
                                                    }
                                                    className={`${fieldClass} pr-12`}
                                                    placeholder="30"
                                                />

                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-500">
                                                    %
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className={labelClass}>
                                                Montant fixe
                                            </label>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.deposit_amount}
                                                    onChange={(event) =>
                                                        updateField(
                                                            "deposit_amount",
                                                            event.target.value
                                                        )
                                                    }
                                                    className={`${fieldClass} pr-20`}
                                                    placeholder="1350"
                                                />

                                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-slate-500">
                                                    {form.currency}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {paymentCalculations.valid &&
                                    paymentCalculations.deposit > 0 && (
                                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                            <PaymentSummary
                                                label="Prix total"
                                                value={formatMoney(
                                                    paymentCalculations.price,
                                                    form.currency
                                                )}
                                            />

                                            <PaymentSummary
                                                label={
                                                    form.deposit_type === "percent"
                                                        ? `Acompte ${form.deposit_percent || "—"} %`
                                                        : "Acompte fixe"
                                                }
                                                value={formatMoney(
                                                    paymentCalculations.deposit,
                                                    form.currency
                                                )}
                                                tone="blue"
                                            />

                                            <PaymentSummary
                                                label="Solde restant"
                                                value={formatMoney(
                                                    paymentCalculations.balance,
                                                    form.currency
                                                )}
                                                tone="amber"
                                            />
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* INFRASTRUCTURE PAIEMENT */}

                        <div className="rounded-2xl border border-white/10 bg-black/10 p-5">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Infrastructure de paiement
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-semibold text-white">
                                            Airwallex
                                        </div>

                                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                                            Principal
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        Checkout intégré à PaxSolutio. Carte,
                                        Klarna et autres moyens activés dans
                                        votre compte Airwallex.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.05] p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="font-semibold text-white">
                                            PayPal
                                        </div>

                                        <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
                                            Séparé
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                        PayPal sera proposé séparément du
                                        checkout Airwallex.
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4 text-xs leading-5 text-slate-600">
                                Cette section configure pour l&apos;instant les
                                règles commerciales. La connexion aux API
                                Airwallex et PayPal sera ajoutée à l&apos;étape
                                checkout.
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* =====================================================
          ARGUMENTS COMMERCIAUX
      ====================================================== */}

            <section className={sectionClass}>
                <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Contenu commercial
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                        Arguments & caractéristiques
                    </h2>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className={labelClass}>
                            Points forts
                        </label>

                        <textarea
                            rows={6}
                            value={sellingPointsText}
                            onChange={(event) =>
                                setSellingPointsText(event.target.value)
                            }
                            className={fieldClass}
                            placeholder={
                                "Moteur Kubota\nTriple pompe hydraulique\nLivraison disponible"
                            }
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Un point fort par ligne.
                        </p>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Caractéristiques techniques
                        </label>

                        <textarea
                            rows={8}
                            value={specificationsText}
                            onChange={(event) =>
                                setSpecificationsText(event.target.value)
                            }
                            className={fieldClass}
                            placeholder={
                                "Poids: 1 000 kg\nMoteur: Kubota\nPuissance: 10,2 kW"
                            }
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Format : Nom: Valeur — une caractéristique
                            par ligne.
                        </p>
                    </div>

                </div>
            </section>

            {/* =====================================================
          CONDITIONS & LIVRAISON
      ====================================================== */}

            <section className={sectionClass}>
                <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Conditions
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                        Conditions & livraison
                    </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            Conditions commerciales
                        </label>

                        <textarea
                            rows={7}
                            value={form.conditions}
                            onChange={(event) =>
                                updateField(
                                    "conditions",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="Conditions de vente, validité de l'offre, éléments inclus..."
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Informations de livraison
                        </label>

                        <textarea
                            rows={7}
                            value={form.delivery_information}
                            onChange={(event) =>
                                updateField(
                                    "delivery_information",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                            placeholder="Délais indicatifs, transport, livraison, destination..."
                        />
                    </div>
                </div>
            </section>

            {/* =====================================================
          SEO
      ====================================================== */}

            <section className={sectionClass}>
                <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Référencement
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                        SEO
                    </h2>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className={labelClass}>
                            Titre SEO
                        </label>

                        <input
                            value={form.seo_title}
                            onChange={(event) =>
                                updateField(
                                    "seo_title",
                                    event.target.value
                                )
                            }
                            maxLength={70}
                            className={fieldClass}
                            placeholder={form.title}
                        />

                        <div className="mt-2 text-right text-xs text-slate-600">
                            {form.seo_title.length}/70
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Meta description
                        </label>

                        <textarea
                            rows={4}
                            value={form.seo_description}
                            onChange={(event) =>
                                updateField(
                                    "seo_description",
                                    event.target.value
                                )
                            }
                            maxLength={170}
                            className={fieldClass}
                            placeholder={
                                form.short_description ||
                                "Description de l'offre pour les moteurs de recherche"
                            }
                        />

                        <div className="mt-2 text-right text-xs text-slate-600">
                            {form.seo_description.length}/170
                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
          PUBLICATION
      ====================================================== */}

            <section className={sectionClass}>
                <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                        Visibilité
                    </div>

                    <h2 className="mt-2 text-xl font-semibold">
                        Publication
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className={labelClass}>
                            Statut
                        </label>

                        <select
                            value={form.status}
                            onChange={(event) =>
                                updateField(
                                    "status",
                                    event.target.value
                                )
                            }
                            className={fieldClass}
                        >
                            <option value="draft">
                                Brouillon
                            </option>

                            <option value="published">
                                Publiée
                            </option>

                            <option value="archived">
                                Archivée
                            </option>
                        </select>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3 md:self-end">
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(event) =>
                                updateField(
                                    "featured",
                                    event.target.checked
                                )
                            }
                            className="h-4 w-4 accent-blue-500"
                        />

                        <div>
                            <div className="text-sm font-medium text-slate-200">
                                À la une
                            </div>

                            <div className="mt-1 text-xs text-slate-600">
                                Mettre cette offre en avant.
                            </div>
                        </div>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3 md:self-end">
                        <input
                            type="checkbox"
                            checked={form.homepage}
                            onChange={(event) =>
                                updateField(
                                    "homepage",
                                    event.target.checked
                                )
                            }
                            className="h-4 w-4 accent-blue-500"
                        />

                        <div>
                            <div className="text-sm font-medium text-slate-200">
                                Homepage
                            </div>

                            <div className="mt-1 text-xs text-slate-600">
                                Afficher sur la page d&apos;accueil.
                            </div>
                        </div>
                    </label>
                </div>
            </section>

            {/* =====================================================
          RÉCAPITULATIF PAIEMENT
      ====================================================== */}

            {form.payment_enabled &&
                paymentCalculations.valid && (
                    <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                            Récapitulatif paiement
                        </div>

                        <h2 className="mt-2 text-xl font-semibold">
                            Configuration client
                        </h2>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <PaymentSummary
                                label="Prix payable"
                                value={formatMoney(
                                    paymentCalculations.price,
                                    form.currency
                                )}
                            />

                            {form.full_payment_enabled && (
                                <PaymentSummary
                                    label="Paiement intégral"
                                    value={formatMoney(
                                        paymentCalculations.price,
                                        form.currency
                                    )}
                                    tone="green"
                                />
                            )}

                            {form.deposit_enabled &&
                                paymentCalculations.deposit > 0 && (
                                    <PaymentSummary
                                        label="Acompte"
                                        value={formatMoney(
                                            paymentCalculations.deposit,
                                            form.currency
                                        )}
                                        tone="blue"
                                    />
                                )}

                            {form.deposit_enabled &&
                                paymentCalculations.deposit > 0 && (
                                    <PaymentSummary
                                        label="Solde restant"
                                        value={formatMoney(
                                            paymentCalculations.balance,
                                            form.currency
                                        )}
                                        tone="amber"
                                    />
                                )}
                        </div>

                        <div className="mt-5 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-xs leading-5 text-slate-500">
                            Le montant sera créé côté serveur au moment du
                            checkout. Le client ne pourra pas modifier lui-même
                            le prix ou le montant de l&apos;acompte.
                        </div>
                    </section>
                )}

            {/* =====================================================
          ACTIONS
      ====================================================== */}

            <section className="sticky bottom-4 z-20 rounded-2xl border border-white/10 bg-[#081321]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="text-sm font-semibold text-white">
                            {isEditing
                                ? "Modifier l'offre"
                                : "Créer l'offre"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                            {form.status === "published"
                                ? "Cette offre est actuellement publiée."
                                : form.status === "archived"
                                    ? "Cette offre est actuellement archivée."
                                    : "Cette offre est actuellement en brouillon."}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isEditing && (
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                    saveOffer("archived")
                                }
                                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                            >
                                Archiver
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:opacity-50"
                        >
                            {saving
                                ? "Enregistrement..."
                                : "Enregistrer le brouillon"}
                        </button>

                        <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                                saveOffer("published")
                            }
                            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                        >
                            {saving
                                ? "Enregistrement..."
                                : isEditing
                                    ? "Enregistrer & publier"
                                    : "Créer & publier"}
                        </button>
                    </div>
                </div>
            </section>
        </form>
    );
}
function PaymentSummary({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: string;
    tone?:
    | "default"
    | "green"
    | "blue"
    | "amber";
}) {
    const toneClass = {
        default: "text-white",
        green: "text-emerald-300",
        blue: "text-blue-300",
        amber: "text-amber-300",
    }[tone];

    return (
        <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {label}
            </div>

            <div
                className={`mt-2 text-lg font-semibold ${toneClass}`}
            >
                {value}
            </div>
        </div>
    );
}