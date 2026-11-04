"use client";

import ArticleEditor from "@/components/admin/ArticleEditor";
import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createAuthBrowserClient } from "@/lib/supabase/auth-client";

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

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewPublicationPage() {
  const router = useRouter();

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [excerpt, setExcerpt] =
    useState("");

  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState<Category>("actualite");

  const [featured, setFeatured] =
    useState(false);

  const [imageUrl, setImageUrl] =
    useState("");

  const [videoUrl, setVideoUrl] =
    useState("");

  const [priceLabel, setPriceLabel] =
    useState("");

  const [
    marketPriceLabel,
    setMarketPriceLabel,
  ] = useState("");

  const [ctaLabel, setCtaLabel] =
    useState("");

  const [ctaHref, setCtaHref] =
    useState("");

  const [ctaType, setCtaType] =
    useState<CtaType>("");

  const [tagsText, setTagsText] =
    useState("");

  const [
    sourcesText,
    setSourcesText,
  ] = useState("");

  const [seoTitle, setSeoTitle] =
    useState("");

  const [
    seoDescription,
    setSeoDescription,
  ] = useState("");

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const generatedSlug = useMemo(
    () => createSlug(title),
    [title]
  );

  function handleTitleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const newTitle =
      event.target.value;

    setTitle(newTitle);

    if (
      !slug ||
      slug === generatedSlug
    ) {
      setSlug(
        createSlug(newTitle)
      );
    }
  }

  // =========================================================
  // IMAGE
  // =========================================================

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Le fichier sélectionné n'est pas une image."
      );

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
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

      const randomId =
        crypto.randomUUID();

      const filePath =
        `publications/${Date.now()}-${randomId}.${extension}`;

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
          "Erreur upload :",
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
        "Une erreur est survenue pendant l'envoi de l'image."
      );
    } finally {
      setUploading(false);
    }
  }

  // =========================================================
  // SAUVEGARDE
  // =========================================================

  async function savePublication(
    status: Status
  ) {
    if (!title.trim()) {
      setError(
        "Ajoutez un titre à la publication."
      );

      return;
    }

    if (!slug.trim()) {
      setError(
        "Ajoutez une URL à la publication."
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
          .map((tag) =>
            tag.trim()
          )
          .filter(Boolean);

      const sourceUrls =
        sourcesText
          .split("\n")
          .map((source) =>
            source.trim()
          )
          .filter(Boolean);

      const response =
        await fetch(
          "/api/admin/news",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
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

                status,

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
            "Impossible d'enregistrer la publication."
        );

        return;
      }

      setSuccess(
        status ===
          "published"
          ? "Publication mise en ligne."
          : "Brouillon enregistré."
      );

      setTimeout(() => {
        router.push(
          "/admin/nouveautes"
        );

        router.refresh();
      }, 700);
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

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    savePublication(
      "draft"
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/40 focus:bg-white/[0.05]";

  const labelClass =
    "mb-2 block text-sm font-medium text-zinc-300";

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="mx-auto max-w-7xl"
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
          Gestion éditoriale
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Nouvelle publication
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          Créez une actualité, une
          opportunité, une analyse
          réglementaire ou un contenu
          terrain.
        </p>
      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        {/* =====================================================
            COLONNE PRINCIPALE
        ====================================================== */}

        <div className="space-y-6">
          {/* PUBLICATION */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Contenu
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Publication
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  Titre *
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={
                    handleTitleChange
                  }
                  className={
                    fieldClass
                  }
                  placeholder="Ex. Nouveau véhicule électrique repéré en Chine"
                />
              </div>

              <div>
                <label className={labelClass}>
                  URL / slug *
                </label>

                <div className="flex overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] transition focus-within:border-blue-500/40">
                  <span className="flex items-center border-r border-white/[0.08] px-4 text-sm text-zinc-600">
                    /nouveautes/
                  </span>

                  <input
                    type="text"
                    value={slug}
                    onChange={(
                      event
                    ) =>
                      setSlug(
                        createSlug(
                          event
                            .target
                            .value
                        )
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Résumé
                </label>

                <textarea
                  value={excerpt}
                  onChange={(
                    event
                  ) =>
                    setExcerpt(
                      event
                        .target
                        .value
                    )
                  }
                  rows={4}
                  className={
                    fieldClass
                  }
                  placeholder="Résumé court de la publication..."
                />
              </div>

              <div>
                <label className={labelClass}>
                  Contenu de l&apos;article
                </label>

                <ArticleEditor
                  value={
                    content
                  }
                  onChange={
                    setContent
                  }
                />
              </div>
            </div>
          </section>

          {/* MÉDIAS */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Médias
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Images & vidéo
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
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
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-blue-500"
                />

                {uploading && (
                  <div className="mt-3 text-sm text-blue-400">
                    Envoi de
                    l&apos;image...
                  </div>
                )}

                {imageUrl && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08]">
                    <img
                      src={
                        imageUrl
                      }
                      alt="Aperçu"
                      className="max-h-[420px] w-full object-cover"
                    />

                    <div className="flex items-center justify-between gap-4 bg-black/20 px-4 py-3">
                      <span className="truncate text-xs text-zinc-600">
                        {imageUrl}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setImageUrl(
                            ""
                          )
                        }
                        className="text-sm text-red-400 transition hover:text-red-300"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  URL vidéo
                </label>

                <input
                  type="url"
                  value={videoUrl}
                  onChange={(
                    event
                  ) =>
                    setVideoUrl(
                      event
                        .target
                        .value
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="https://youtube.com/... ou autre URL vidéo"
                />
              </div>
            </div>
          </section>

          {/* OPPORTUNITÉ COMMERCIALE */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Conversion
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Opportunité commerciale
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                Ces champs peuvent rester
                vides pour un article
                classique.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Prix PaxSolutio
                </label>

                <input
                  type="text"
                  value={
                    priceLabel
                  }
                  onChange={(
                    event
                  ) =>
                    setPriceLabel(
                      event
                        .target
                        .value
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="À partir de 18 900 €"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Prix marché indicatif
                </label>

                <input
                  type="text"
                  value={
                    marketPriceLabel
                  }
                  onChange={(
                    event
                  ) =>
                    setMarketPriceLabel(
                      event
                        .target
                        .value
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="Prix marché : 24 000 €"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Type de CTA
                </label>

                <select
                  value={
                    ctaType
                  }
                  onChange={(
                    event
                  ) =>
                    setCtaType(
                      event
                        .target
                        .value as CtaType
                    )
                  }
                  className={
                    fieldClass
                  }
                >
                  <option
                    value=""
                    className="bg-[#0d1118]"
                  >
                    Aucun
                  </option>

                  <option
                    value="quote"
                    className="bg-[#0d1118]"
                  >
                    Demande de devis
                  </option>

                  <option
                    value="article"
                    className="bg-[#0d1118]"
                  >
                    Lien
                  </option>

                  <option
                    value="payment"
                    className="bg-[#0d1118]"
                  >
                    Paiement
                  </option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Texte du bouton
                </label>

                <input
                  type="text"
                  value={
                    ctaLabel
                  }
                  onChange={(
                    event
                  ) =>
                    setCtaLabel(
                      event
                        .target
                        .value
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="Demander un devis"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Destination du bouton
                </label>

                <input
                  type="text"
                  value={
                    ctaHref
                  }
                  onChange={(
                    event
                  ) =>
                    setCtaHref(
                      event
                        .target
                        .value
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="/contact"
                />
              </div>
            </div>
          </section>

          {/* SOURCES */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Intelligence
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Sources & classification
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  Tags
                </label>

                <input
                  type="text"
                  value={
                    tagsText
                  }
                  onChange={(
                    event
                  ) =>
                    setTagsText(
                      event
                        .target
                        .value
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="chine, automobile, import, byd"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Séparez les tags par
                  une virgule.
                </p>
              </div>

              <div>
                <label className={labelClass}>
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
                      event
                        .target
                        .value
                    )
                  }
                  rows={6}
                  className={
                    fieldClass
                  }
                  placeholder={
                    "https://source1.com\nhttps://source2.com"
                  }
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Une URL par ligne.
                </p>
              </div>
            </div>
          </section>

          {/* SEO */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Référencement
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                SEO
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  Titre SEO
                </label>

                <input
                  type="text"
                  value={
                    seoTitle
                  }
                  onChange={(
                    event
                  ) =>
                    setSeoTitle(
                      event
                        .target
                        .value
                    )
                  }
                  maxLength={70}
                  className={
                    fieldClass
                  }
                  placeholder={title}
                />

                <div className="mt-2 text-right text-xs text-zinc-600">
                  {
                    seoTitle.length
                  }
                  /70
                </div>
              </div>

              <div>
                <label className={labelClass}>
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
                      event
                        .target
                        .value
                    )
                  }
                  maxLength={170}
                  rows={4}
                  className={
                    fieldClass
                  }
                  placeholder={
                    excerpt
                  }
                />

                <div className="mt-2 text-right text-xs text-zinc-600">
                  {
                    seoDescription.length
                  }
                  /170
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            COLONNE DROITE
        ====================================================== */}

        <aside className="space-y-6">
          {/* PARAMÈTRES */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Paramètres
              </div>

              <h2 className="mt-2 font-semibold">
                Publication
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  Catégorie
                </label>

                <select
                  value={
                    category
                  }
                  onChange={(
                    event
                  ) =>
                    setCategory(
                      event
                        .target
                        .value as Category
                    )
                  }
                  className={
                    fieldClass
                  }
                >
                  <option
                    value="actualite"
                    className="bg-[#0d1118]"
                  >
                    Actualité
                  </option>

                  <option
                    value="reglementation"
                    className="bg-[#0d1118]"
                  >
                    Réglementation
                  </option>

                  <option
                    value="opportunite"
                    className="bg-[#0d1118]"
                  >
                    Opportunité
                  </option>

                  <option
                    value="terrain"
                    className="bg-[#0d1118]"
                  >
                    Terrain PaxSolutio
                  </option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <input
                  type="checkbox"
                  checked={
                    featured
                  }
                  onChange={(
                    event
                  ) =>
                    setFeatured(
                      event
                        .target
                        .checked
                    )
                  }
                  className="h-4 w-4"
                />

                <div>
                  <div className="text-sm font-medium">
                    Mettre à la une
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    Afficher cette
                    publication parmi les
                    contenus principaux.
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* APERÇU */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Prévisualisation
              </div>

              <h2 className="mt-2 font-semibold">
                Aperçu
              </h2>
            </div>

            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="mb-5 aspect-[16/9] w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mb-5 flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] text-xs text-zinc-700">
                Image
              </div>
            )}

            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              {category ===
              "actualite"
                ? "Actualité"
                : category ===
                    "reglementation"
                  ? "Réglementation"
                  : category ===
                      "opportunite"
                    ? "Opportunité"
                    : "Terrain"}
            </div>

            <h3 className="mt-3 text-lg font-semibold">
              {title ||
                "Titre de la publication"}
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {excerpt ||
                "Le résumé de votre publication apparaîtra ici."}
            </p>

            {priceLabel && (
              <div className="mt-5 text-lg font-semibold text-white">
                {priceLabel}
              </div>
            )}
          </section>

          {/* ACTIONS */}

          <section className="sticky top-[96px] rounded-2xl border border-white/[0.08] bg-[#0d1118] p-6 shadow-2xl shadow-black/20">
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Actions
              </div>

              <h2 className="mt-2 font-semibold">
                Enregistrer
              </h2>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={
                  saving ||
                  uploading
                }
                onClick={() =>
                  savePublication(
                    "published"
                  )
                }
                className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Enregistrement..."
                  : "Publier"}
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  uploading
                }
                className="w-full rounded-xl border border-white/[0.08] px-5 py-3 font-semibold text-zinc-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enregistrer le brouillon
              </button>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-600">
              Une publication publiée
              sera visible dans la
              rubrique Nouveautés.
            </p>
          </section>
        </aside>
      </div>
    </form>
  );
}