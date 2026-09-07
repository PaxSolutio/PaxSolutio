import Link from "next/link";

import CommercialOfferCard from "@/components/offers/CommercialOfferCard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function FeaturedOffersSection() {
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
            featured
            `
        )
        .eq("status", "published")
        .eq("homepage", true)
        .order("featured", {
            ascending: false,
        })
        .order("published_at", {
            ascending: false,
            nullsFirst: false,
        })
        .limit(3);

    if (error) {
        console.error(
            "Erreur offres homepage :",
            error
        );

        return null;
    }

    if (!offers || offers.length === 0) {
        return null;
    }

    return (
        <section className="bg-[#F6F8FB] pb-20 pt-12 lg:pb-24 lg:pt-14">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Offres & opportunités
                        </div>

                        <h2 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[42px]">
                            Des opportunités
                            concrètes, directement
                            accessibles.
                        </h2>

                        <p className="mt-5 max-w-xl text-base leading-7 text-[#657386]">
                            Une sélection de
                            produits et
                            équipements proposés
                            via notre réseau de
                            fournisseurs, avec
                            accompagnement
                            sourcing, contrôle
                            qualité et logistique.
                        </p>
                    </div>

                    <Link
                        href="/offres"
                        className="inline-flex shrink-0 items-center text-sm font-extrabold !text-[#176BFF] transition hover:translate-x-1 lg:mt-9"
                    >
                        Voir toutes les offres
                        <span className="ml-2">
                            →
                        </span>
                    </Link>
                </div>

                <div
                    className={`mt-10 grid gap-7 ${offers.length === 1
                        ? "max-w-[580px]"
                        : offers.length === 2
                            ? "md:grid-cols-2"
                            : "md:grid-cols-2 xl:grid-cols-3"
                        }`}
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
            </div>
        </section>
    );
}