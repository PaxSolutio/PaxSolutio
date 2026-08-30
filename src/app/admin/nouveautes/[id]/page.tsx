"use client";

import ArticleEditor from "@/components/admin/ArticleEditor";
import {
    ChangeEvent,
    useEffect,
    useState,
} from "react";

import Link from "next/link";
import {
    useParams,
    useRouter,
} from "next/navigation";

import {
    createAuthBrowserClient,
} from "@/lib/supabase/auth-client";

type Category =
    | "actualite"
    | "reglementation"
    | "opportunite"
    | "terrain";

type Status =
    | "draft"
    | "published";

type CtaType =
    | ""
    | "article"
    | "quote"
    | "payment";

type NewsPost = {
    id: string;
    title: string;
    slug: string;

    excerpt: string | null;
    content: string;

    category: Category;
    status: Status;

    featured: boolean;

    image_url: string | null;
    video_url: string | null;

    price_label: string | null;
    market_price_label:
    | string
    | null;

    cta_label: string | null;
    cta_href: string | null;

    cta_type:
    | "article"
    | "quote"
    | "payment"
    | null;

    seo_title: string | null;
    seo_description:
    | string
    | null;

    tags: string[];
    source_urls: string[];
};

function createSlug(value: string) {
    return value
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
}

export default function EditPublicationPage() {
    const params = useParams();
    const router = useRouter();

    const id =
        params.id as string;

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [
        uploading,
        setUploading,
    ] = useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [title, setTitle] =
        useState("");

    const [slug, setSlug] =
        useState("");

    const [excerpt, setExcerpt] =
        useState("");

    const [content, setContent] =
        useState("");

    const [
        category,
        setCategory,
    ] = useState<Category>(
        "actualite"
    );

    const [
        status,
        setStatus,
    ] = useState<Status>(
        "draft"
    );

    const [
        featured,
        setFeatured,
    ] = useState(false);

    const [
        imageUrl,
        setImageUrl,
    ] = useState("");

    const [
        videoUrl,
        setVideoUrl,
    ] = useState("");

    const [
        priceLabel,
        setPriceLabel,
    ] = useState("");

    const [
        marketPriceLabel,
        setMarketPriceLabel,
    ] = useState("");

    const [
        ctaLabel,
        setCtaLabel,
    ] = useState("");

    const [
        ctaHref,
        setCtaHref,
    ] = useState("");

    const [
        ctaType,
        setCtaType,
    ] = useState<CtaType>("");

    const [
        tagsText,
        setTagsText,
    ] = useState("");

    const [
        sourcesText,
        setSourcesText,
    ] = useState("");

    const [
        seoTitle,
        setSeoTitle,
    ] = useState("");

    const [
        seoDescription,
        setSeoDescription,
    ] = useState("");

    useEffect(() => {
        async function loadPost() {
            setLoading(true);
            setError("");

            const supabase =
                createAuthBrowserClient();

            const {
                data,
                error: loadError,
            } = await supabase
                .from("news_posts")
                .select("*")
                .eq("id", id)
                .single();

            if (
                loadError ||
                !data
            ) {
                console.error(
                    "Erreur chargement publication :",
                    loadError
                );

                setError(
                    "Impossible de charger cette publication."
                );

                setLoading(false);
                return;
            }

            const post =
                data as NewsPost;

            setTitle(
                post.title || ""
            );

            setSlug(
                post.slug || ""
            );

            setExcerpt(
                post.excerpt || ""
            );

            setContent(
                post.content || ""
            );

            setCategory(
                post.category
            );

            setStatus(
                post.status
            );

            setFeatured(
                Boolean(post.featured)
            );

            setImageUrl(
                post.image_url || ""
            );

            setVideoUrl(
                post.video_url || ""
            );

            setPriceLabel(
                post.price_label || ""
            );

            setMarketPriceLabel(
                post.market_price_label ||
                ""
            );

            setCtaLabel(
                post.cta_label || ""
            );

            setCtaHref(
                post.cta_href || ""
            );

            setCtaType(
                post.cta_type || ""
            );

            setTagsText(
                Array.isArray(post.tags)
                    ? post.tags.join(", ")
                    : ""
            );

            setSourcesText(
                Array.isArray(
                    post.source_urls
                )
                    ? post.source_urls.join(
                        "\n"
                    )
                    : ""
            );

            setSeoTitle(
                post.seo_title || ""
            );

            setSeoDescription(
                post.seo_description ||
                ""
            );

            setLoading(false);
        }

        loadPost();
    }, [id]);

    async function uploadImage(
        event:
            ChangeEvent<HTMLInputElement>
    ) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            setError(
                "Le fichier sélectionné n'est pas une image."
            );

            return;
        }

        if (
            file.size >
            10 * 1024 * 1024
        ) {
            setError(
                "L'image ne doit pas dépasser 10 Mo."
            );

            return;
        }

        setUploading(true);
        setError("");

        try {
            const supabase =
                createAuthBrowserClient();

            const extension =
                file.name
                    .split(".")
                    .pop()
                    ?.toLowerCase() ||
                "jpg";

            const filePath =
                `publications/${Date.now()}-${crypto.randomUUID()}.${extension}`;

            const {
                error: uploadError,
            } = await supabase.storage
                .from("news-media")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert: false,
                    }
                );

            if (uploadError) {
                console.error(
                    "Erreur upload image :",
                    uploadError
                );

                setError(
                    "Impossible d'envoyer l'image."
                );

                return;
            }

            const {
                data: publicUrlData,
            } = supabase.storage
                .from("news-media")
                .getPublicUrl(
                    filePath
                );

            setImageUrl(
                publicUrlData.publicUrl
            );
        } catch (uploadError) {
            console.error(
                uploadError
            );

            setError(
                "Une erreur est survenue pendant l'envoi."
            );
        } finally {
            setUploading(false);
        }
    }

    async function savePost(
        newStatus: Status
    ) {
        if (!title.trim()) {
            setError(
                "Le titre est obligatoire."
            );

            return;
        }

        if (!slug.trim()) {
            setError(
                "Le slug est obligatoire."
            );

            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const tags =
                tagsText
                    .split(",")
                    .map((item) =>
                        item.trim()
                    )
                    .filter(Boolean);

            const sourceUrls =
                sourcesText
                    .split("\n")
                    .map((item) =>
                        item.trim()
                    )
                    .filter(Boolean);

            const response =
                await fetch(
                    "/api/admin/news",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                id,

                                title:
                                    title.trim(),

                                slug:
                                    createSlug(
                                        slug
                                    ),

                                excerpt:
                                    excerpt.trim(),

                                content,

                                category,

                                status:
                                    newStatus,

                                featured,

                                image_url:
                                    imageUrl ||
                                    null,

                                video_url:
                                    videoUrl ||
                                    null,

                                price_label:
                                    priceLabel ||
                                    null,

                                market_price_label:
                                    marketPriceLabel ||
                                    null,

                                cta_label:
                                    ctaLabel ||
                                    null,

                                cta_href:
                                    ctaHref ||
                                    null,

                                cta_type:
                                    ctaType ||
                                    null,

                                seo_title:
                                    seoTitle ||
                                    null,

                                seo_description:
                                    seoDescription ||
                                    null,

                                tags,

                                source_urls:
                                    sourceUrls,
                            }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    "Impossible d'enregistrer les modifications."
                );

                return;
            }

            setStatus(
                newStatus
            );

            setSuccess(
                newStatus ===
                    "published"
                    ? "Publication mise en ligne."
                    : "Brouillon enregistré."
            );

            router.refresh();
        } catch (saveError) {
            console.error(
                saveError
            );

            setError(
                "Une erreur est survenue pendant l'enregistrement."
            );
        } finally {
            setSaving(false);
        }
    }

    async function deletePost() {
        const confirmed =
            window.confirm(
                "Supprimer définitivement cette publication ? Cette action est irréversible."
            );

        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            const response =
                await fetch(
                    "/api/admin/news",
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                id,
                            }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    "Impossible de supprimer la publication."
                );

                return;
            }

            router.push(
                "/admin/nouveautes"
            );

            router.refresh();
        } catch (deleteError) {
            console.error(
                deleteError
            );

            setError(
                "Une erreur est survenue pendant la suppression."
            );
        } finally {
            setDeleting(false);
        }
    }

    const fieldClass =
        "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500";

    const labelClass =
        "mb-2 block text-sm font-medium text-slate-300";

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#06101f] text-white">
                <div className="text-slate-400">
                    Chargement...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#06101f] text-white">
            <header className="border-b border-white/10 bg-[#071321]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                            PaxSolutio
                        </div>

                        <div className="mt-1 font-semibold">
                            Administration
                        </div>
                    </div>

                    <Link
                        href="/admin/nouveautes"
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                        ← Retour
                    </Link>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="mb-10">
                    <div className="mb-3 text-sm font-medium text-blue-400">
                        Gestion éditoriale
                    </div>

                    <h1 className="text-4xl font-semibold tracking-tight">
                        Modifier la publication
                    </h1>

                    <div className="mt-3 flex items-center gap-3">
                        <span className="text-sm text-slate-400">
                            Statut actuel :
                        </span>

                        {status ===
                            "published" ? (
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                Publié
                            </span>
                        ) : (
                            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                                Brouillon
                            </span>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                        {success}
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
                    <div className="space-y-8">
                        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
                            <h2 className="mb-6 text-xl font-semibold">
                                Publication
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Titre *
                                    </label>

                                    <input
                                        value={title}
                                        onChange={(
                                            event
                                        ) =>
                                            setTitle(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        URL / slug *
                                    </label>

                                    <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                                        <span className="flex items-center border-r border-white/10 px-4 text-sm text-slate-500">
                                            /nouveautes/
                                        </span>

                                        <input
                                            value={slug}
                                            onChange={(
                                                event
                                            ) =>
                                                setSlug(
                                                    createSlug(
                                                        event.target
                                                            .value
                                                    )
                                                )
                                            }
                                            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Résumé
                                    </label>

                                    <textarea
                                        value={excerpt}
                                        onChange={(
                                            event
                                        ) =>
                                            setExcerpt(
                                                event.target
                                                    .value
                                            )
                                        }
                                        rows={4}
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Contenu de l&apos;article
                                    </label>

                                    <ArticleEditor
                                        value={content}
                                        onChange={setContent}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
                            <h2 className="mb-6 text-xl font-semibold">
                                Images & vidéo
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Image principale
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            uploadImage
                                        }
                                        disabled={
                                            uploading
                                        }
                                        className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-blue-500"
                                    />

                                    {uploading && (
                                        <div className="mt-3 text-sm text-blue-400">
                                            Envoi de
                                            l&apos;image...
                                        </div>
                                    )}

                                    {imageUrl && (
                                        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                                            <img
                                                src={
                                                    imageUrl
                                                }
                                                alt=""
                                                className="max-h-[420px] w-full object-cover"
                                            />

                                            <div className="flex items-center justify-between gap-4 bg-black/20 px-4 py-3">
                                                <span className="truncate text-xs text-slate-500">
                                                    {imageUrl}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setImageUrl(
                                                            ""
                                                        )
                                                    }
                                                    className="text-sm text-red-400"
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        URL vidéo
                                    </label>

                                    <input
                                        value={videoUrl}
                                        onChange={(
                                            event
                                        ) =>
                                            setVideoUrl(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
                            <h2 className="mb-6 text-xl font-semibold">
                                Opportunité commerciale
                            </h2>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Prix PaxSolutio
                                    </label>

                                    <input
                                        value={
                                            priceLabel
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPriceLabel(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Prix marché indicatif
                                    </label>

                                    <input
                                        value={
                                            marketPriceLabel
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setMarketPriceLabel(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Type de CTA
                                    </label>

                                    <select
                                        value={ctaType}
                                        onChange={(
                                            event
                                        ) =>
                                            setCtaType(
                                                event.target
                                                    .value as CtaType
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    >
                                        <option
                                            value=""
                                            className="bg-[#0a1727]"
                                        >
                                            Aucun
                                        </option>

                                        <option
                                            value="quote"
                                            className="bg-[#0a1727]"
                                        >
                                            Demande de devis
                                        </option>

                                        <option
                                            value="article"
                                            className="bg-[#0a1727]"
                                        >
                                            Lien
                                        </option>

                                        <option
                                            value="payment"
                                            className="bg-[#0a1727]"
                                        >
                                            Paiement
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Texte du bouton
                                    </label>

                                    <input
                                        value={ctaLabel}
                                        onChange={(
                                            event
                                        ) =>
                                            setCtaLabel(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Destination
                                    </label>

                                    <input
                                        value={ctaHref}
                                        onChange={(
                                            event
                                        ) =>
                                            setCtaHref(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
                            <h2 className="mb-6 text-xl font-semibold">
                                Sources & classification
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Tags
                                    </label>

                                    <input
                                        value={tagsText}
                                        onChange={(
                                            event
                                        ) =>
                                            setTagsText(
                                                event.target
                                                    .value
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Sources
                                    </label>

                                    <textarea
                                        value={
                                            sourcesText
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSourcesText(
                                                event.target
                                                    .value
                                            )
                                        }
                                        rows={6}
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
                            <h2 className="mb-6 text-xl font-semibold">
                                SEO
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Titre SEO
                                    </label>

                                    <input
                                        value={seoTitle}
                                        onChange={(
                                            event
                                        ) =>
                                            setSeoTitle(
                                                event.target
                                                    .value
                                            )
                                        }
                                        maxLength={70}
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Meta description
                                    </label>

                                    <textarea
                                        value={
                                            seoDescription
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSeoDescription(
                                                event.target
                                                    .value
                                            )
                                        }
                                        maxLength={170}
                                        rows={4}
                                        className={
                                            fieldClass
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                            <h2 className="mb-5 font-semibold">
                                Paramètres
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label
                                        className={
                                            labelClass
                                        }
                                    >
                                        Catégorie
                                    </label>

                                    <select
                                        value={category}
                                        onChange={(
                                            event
                                        ) =>
                                            setCategory(
                                                event.target
                                                    .value as Category
                                            )
                                        }
                                        className={
                                            fieldClass
                                        }
                                    >
                                        <option
                                            value="actualite"
                                            className="bg-[#0a1727]"
                                        >
                                            Actualité
                                        </option>

                                        <option
                                            value="reglementation"
                                            className="bg-[#0a1727]"
                                        >
                                            Réglementation
                                        </option>

                                        <option
                                            value="opportunite"
                                            className="bg-[#0a1727]"
                                        >
                                            Opportunité
                                        </option>

                                        <option
                                            value="terrain"
                                            className="bg-[#0a1727]"
                                        >
                                            Terrain PaxSolutio
                                        </option>
                                    </select>
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                    <input
                                        type="checkbox"
                                        checked={
                                            featured
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFeatured(
                                                event.target
                                                    .checked
                                            )
                                        }
                                        className="h-4 w-4"
                                    />

                                    <div>
                                        <div className="text-sm font-medium">
                                            Mettre à la une
                                        </div>

                                        <div className="mt-1 text-xs text-slate-500">
                                            Contenu principal
                                            de la rubrique.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </section>

                        <section className="sticky top-6 rounded-2xl border border-white/10 bg-[#0b1727] p-6 shadow-2xl">
                            <div className="space-y-3">
                                {status ===
                                    "draft" ? (
                                    <button
                                        type="button"
                                        disabled={
                                            saving
                                        }
                                        onClick={() =>
                                            savePost(
                                                "published"
                                            )
                                        }
                                        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Enregistrement..."
                                            : "Publier"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={
                                            saving
                                        }
                                        onClick={() =>
                                            savePost(
                                                "draft"
                                            )
                                        }
                                        className="w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
                                    >
                                        Dépublier
                                    </button>
                                )}

                                <button
                                    type="button"
                                    disabled={
                                        saving
                                    }
                                    onClick={() =>
                                        savePost(
                                            status
                                        )
                                    }
                                    className="w-full rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                                >
                                    Enregistrer les modifications
                                </button>

                                <div className="my-5 border-t border-white/10" />

                                <button
                                    type="button"
                                    disabled={
                                        deleting
                                    }
                                    onClick={
                                        deletePost
                                    }
                                    className="w-full rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    {deleting
                                        ? "Suppression..."
                                        : "Supprimer"}
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}