import type {
    Metadata,
} from "next";

import CommercialOfferCard from "@/components/offers/CommercialOfferCard";
import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

export const dynamic =
    "force-dynamic";

export const metadata: Metadata = {
    title:
        "Offres & opportunités de sourcing",
    description:
        "Découvrez une sélection de produits et opportunités de sourcing proposées par PaxSolutio : construction, automobile, équipement professionnel et autres catégories.",
    alternates: {
        canonical: "/offres",
    },
};

export default async function OffersPage() {
    const supabase =
        createServerSupabaseClient();

    const {
        data: offers,
        error,
    } = await supabase
        .from("commercial_offers")
        .select(
            `
            id,
            title,
            slug,
            subtitle,
            short_description,
            category,
            image_url,
            price_from,
            market_price,
            currency,
            price_label,
            cta_label,
            featured,
            published_at
            `
        )
        .eq(
            "status",
            "published"
        )
        .order(
            "featured",
            {
                ascending: false,
            }
        )
        .order(
            "published_at",
            {
                ascending: false,
                nullsFirst: false,
            }
        );

    if (error) {
        throw error;
    }

    return (
        <main className="min-h-screen bg-[#f7f8fa]">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
                    <div className="max-w-3xl">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0d63f3]">
                            Offres PaxSolutio
                        </div>

                        <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-[#06101d] md:text-5xl">
                            Des opportunités
                            concrètes, sourcées
                            pour vos projets.
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                            Une sélection de
                            produits, véhicules
                            et équipements
                            accessibles grâce à
                            notre réseau
                            international de
                            fournisseurs.
                            Configuration,
                            contrôle qualité et
                            logistique peuvent
                            être adaptés à votre
                            projet.
                        </p>
                    </div>

                    <div className="mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0d63f3]">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                                </svg>
                            </div>

                            <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Sourcing
                                </div>

                                <div className="mt-1 text-sm font-bold text-[#06101d]">
                                    Direct fournisseurs
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0d63f3]">
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

                            <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Qualité
                                </div>

                                <div className="mt-1 text-sm font-bold text-[#06101d]">
                                    Contrôle & inspection
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0d63f3]">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5"
                                >
                                    <path d="M3 7h13v9H3z" />
                                    <path d="M16 10h3l2 3v3h-5z" />
                                    <circle cx="7" cy="18" r="1.5" />
                                    <circle cx="18" cy="18" r="1.5" />
                                </svg>
                            </div>

                            <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Logistique
                                </div>

                                <div className="mt-1 text-sm font-bold text-[#06101d]">
                                    International
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Sélection actuelle
                        </div>

                        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#06101d]">
                            Offres disponibles
                        </h2>
                    </div>

                    <div className="text-sm text-slate-500">
                        {offers?.length ?? 0}{" "}
                        offre
                        {(offers?.length ??
                            0) > 1
                            ? "s"
                            : ""}
                    </div>
                </div>

                {!offers ||
                    offers.length === 0 ? (
                    <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h3 className="text-lg font-semibold text-[#081426]">
                            De nouvelles
                            opportunités arrivent
                            prochainement.
                        </h3>

                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                            Notre sélection est
                            régulièrement mise à
                            jour en fonction des
                            fournisseurs,
                            disponibilités et
                            marchés étudiés.
                        </p>
                    </div>
                ) : (
                    <div
                        className={
                            offers.length === 1
                                ? "mt-8 max-w-[680px]"
                                : "mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3"
                        }
                    >
                        {offers.map(
                            (offer) => (
                                <CommercialOfferCard
                                    key={
                                        offer.id
                                    }
                                    offer={
                                        offer
                                    }
                                />
                            )
                        )}
                    </div>
                )}

                <div className="mt-12 rounded-[28px] bg-[#081426] px-6 py-8 text-white md:flex md:items-center md:justify-between md:px-10 md:py-10">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                            Vous recherchez un
                            produit qui n’est pas
                            encore présenté ici ?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            PaxSolutio peut
                            rechercher,
                            comparer et qualifier
                            des fournisseurs selon
                            votre cahier des
                            charges.
                        </p>
                    </div>

                    <a
                        href="/contact"
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold !text-[#081426] transition hover:bg-blue-50 md:mt-0"
                    >
                        Lancer une recherche →
                    </a>
                </div>
            </section>
        </main>
    );
}