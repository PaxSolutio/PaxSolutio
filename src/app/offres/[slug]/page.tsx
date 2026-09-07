import OfferGallery from "@/components/offers/OfferGallery";
import OfferQuoteForm from "@/components/offers/OfferQuoteForm";

import type {
    Metadata,
} from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic =
    "force-dynamic";

function formatPrice(
    value: number,
    currency = "EUR"
) {
    return new Intl.NumberFormat(
        "fr-FR",
        {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }
    ).format(value);
}

async function getOffer(
    slug: string
) {
    const supabase =
        createServerSupabaseClient();

    const {
        data,
        error,
    } = await supabase
        .from("commercial_offers")
        .select("*")
        .eq("slug", slug)
        .eq(
            "status",
            "published"
        )
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{
        slug: string;
    }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const offer =
        await getOffer(slug);

    if (!offer) {
        return {};
    }

    return {
        title:
            offer.seo_title ||
            offer.title,

        description:
            offer.seo_description ||
            offer.short_description ||
            offer.subtitle ||
            undefined,

        alternates: {
            canonical:
                `/offres/${offer.slug}`,
        },

        openGraph: {
            title:
                offer.seo_title ||
                offer.title,

            description:
                offer.seo_description ||
                offer.short_description ||
                offer.subtitle ||
                undefined,

            images:
                offer.image_url
                    ? [
                        {
                            url: offer.image_url,
                        },
                    ]
                    : undefined,
        },
    };
}

export default async function OfferPage({
    params,
}: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { slug } = await params;

    const offer =
        await getOffer(slug);

    if (!offer) {
        notFound();
    }

    const gallery =
        Array.isArray(
            offer.gallery_urls
        )
            ? offer.gallery_urls
            : [];

    const allImages = [
        offer.image_url,
        ...gallery,
    ].filter(Boolean) as string[];

    return (
        <main className="min-h-screen bg-[#f7f8fa]">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
                    <Link
                        href="/offres"
                        className="inline-flex items-center rounded-xl border border-[#0d63f3] bg-white px-4 py-2 text-sm font-semibold !text-[#0d63f3] shadow-[0_6px_18px_rgba(13,99,243,0.10)] transition hover:bg-blue-50"
                    >
                        ← Retour aux offres
                    </Link>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
                <div className="grid items-start gap-10 lg:grid-cols-[0.55fr_1.45fr]">
                    <div>
                        <OfferGallery
                            title={
                                offer.title
                            }
                            images={
                                allImages
                            }
                        />
                    </div>

                    <div className="lg:sticky lg:top-10 lg:self-start">
                        <div className="flex flex-wrap gap-2">
                            {offer.category ? (
                                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                                    {
                                        offer.category
                                    }
                                </span>
                            ) : null}

                            {offer.featured ? (
                                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0d63f3]">
                                    Sélection
                                    PaxSolutio
                                </span>
                            ) : null}
                        </div>

                        <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.045em] text-[#06101d] md:text-5xl">
                            {offer.title}
                        </h1>

                        {offer.subtitle ? (
                            <p className="mt-4 text-lg leading-8 text-slate-600">
                                {
                                    offer.subtitle
                                }
                            </p>
                        ) : null}

                        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
                            {offer.market_price ? (
                                <div className="text-sm text-slate-400">
                                    Prix marché
                                    indicatif{" "}
                                    <span className="ml-1 line-through">
                                        {formatPrice(
                                            offer.market_price,
                                            offer.currency ??
                                            "EUR"
                                        )}
                                    </span>
                                </div>
                            ) : null}

                            {offer.price_from ? (
                                <div className="mt-1">
                                    <div className="text-sm font-medium text-slate-500">
                                        {offer.price_label ??
                                            "À partir de"}
                                    </div>

                                    <div className="mt-1 text-4xl font-extrabold tracking-[-0.04em] text-[#16A36A]">
                                        {formatPrice(
                                            offer.price_from,
                                            offer.currency ??
                                            "EUR"
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-2xl font-semibold text-[#081426]">
                                    Prix sur
                                    demande
                                </div>
                            )}

                            <p className="mt-4 text-xs leading-5 text-slate-500">
                                Tarif indicatif
                                pouvant varier
                                selon la
                                configuration,
                                les quantités,
                                les conditions
                                fournisseur, le
                                marché de
                                destination et
                                la logistique.
                            </p>

                            <Link
                                href="#demande-devis"
                                className="mt-6 flex w-full items-center justify-center rounded-full bg-[#16A36A] px-6 py-3.5 text-sm font-semibold !text-white shadow-[0_10px_25px_rgba(22,163,106,0.20)] transition hover:bg-[#12875A]"
                            >
                                {offer.cta_label ||
                                    "Demander un devis"}
                            </Link>

                            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0d63f3]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                            />

                                            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                                        </svg>
                                    </div>

                                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Sourcing
                                    </div>

                                    <div className="mt-1 text-xs font-semibold text-[#06101d]">
                                        Fournisseurs
                                        qualifiés
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0d63f3]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6l-7-3Z" />

                                            <path d="m9 12 2 2 4-4" />
                                        </svg>
                                    </div>

                                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Contrôle
                                    </div>

                                    <div className="mt-1 text-xs font-semibold text-[#06101d]">
                                        Inspection
                                        possible
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0d63f3]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <path d="M3 7h13v9H3z" />

                                            <path d="M16 10h3l2 3v3h-5z" />

                                            <circle
                                                cx="7"
                                                cy="18"
                                                r="1.5"
                                            />

                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="1.5"
                                            />
                                        </svg>
                                    </div>

                                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Logistique
                                    </div>

                                    <div className="mt-1 text-xs font-semibold text-[#06101d]">
                                        Organisation
                                        internationale
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {(offer.short_description ||
                    offer.description) && (
                        <section className="mt-16 border-t border-slate-200 pt-12">
                            <div className="grid items-start gap-10 lg:grid-cols-[0.55fr_1.45fr]">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d63f3]">
                                        Présentation
                                    </div>

                                    <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[#06101d]">
                                        À propos de
                                        cette offre
                                    </h2>
                                </div>

                                <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_14px_40px_rgba(15,23,42,0.05)] md:p-10">
                                    {offer.short_description ? (
                                        <p className="text-lg font-semibold leading-8 text-[#06101d]">
                                            {
                                                offer.short_description
                                            }
                                        </p>
                                    ) : null}

                                    {offer.description ? (
                                        <div className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600">
                                            {
                                                offer.description
                                            }
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </section>
                    )}

                {offer.specifications &&
                    Object.keys(
                        offer.specifications
                    ).length > 0 ? (
                    <section className="mt-16">
                        <div className="grid items-start gap-10 lg:grid-cols-[0.55fr_1.45fr]">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0d63f3]">
                                    Fiche
                                    technique
                                </div>

                                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[#06101d]">
                                    Caractéristiques
                                    principales
                                </h2>

                                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                                    Les
                                    caractéristiques
                                    peuvent varier
                                    selon la
                                    configuration
                                    retenue et le
                                    fournisseur.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                                <div className="grid md:grid-cols-2">
                                    {Object.entries(
                                        offer.specifications
                                    ).map(
                                        (
                                            [
                                                label,
                                                value,
                                            ],
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    label
                                                }
                                                className={`border-b border-slate-100 p-6 ${index %
                                                    2 ===
                                                    0
                                                    ? "md:border-r md:border-slate-100"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                    {
                                                        label
                                                    }
                                                </div>

                                                <div className="mt-2 text-base font-bold text-[#06101d]">
                                                    {String(
                                                        value
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                ) : null}

                <OfferQuoteForm
                    offerId={offer.id}
                    offerTitle={offer.title}
                    offerSlug={offer.slug}
                    priceFrom={
                        offer.price_from
                    }
                    currency={
                        offer.currency
                    }
                />

                <div className="mt-16 rounded-[32px] bg-[#081426] px-7 py-9 text-white md:flex md:items-center md:justify-between md:px-10">
                    <div className="max-w-2xl">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                            Projet personnalisé
                        </div>

                        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                            Besoin d’une autre
                            configuration ou
                            d’un autre produit ?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Nous pouvons
                            rechercher une
                            solution adaptée à
                            votre cahier des
                            charges, vos
                            quantités et votre
                            marché.
                        </p>
                    </div>

                    <Link
                        href="/contact"
                        className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold !text-[#081426] transition hover:bg-blue-50 md:mt-0"
                    >
                        Parler de mon projet →
                    </Link>
                </div>
            </section>
        </main >
    );
}