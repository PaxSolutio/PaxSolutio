import Link from "next/link";

type Offer = {
    id: string;
    title: string;
    slug: string;
    subtitle?: string | null;
    short_description?: string | null;
    category?: string | null;
    image_url?: string | null;
    price_from?: number | null;
    market_price?: number | null;
    currency?: string | null;
    price_label?: string | null;
    cta_label?: string | null;
    featured?: boolean | null;
};

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

export default function CommercialOfferCard({
    offer,
}: {
    offer: Offer;
}) {
    return (
        <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.14)]">
            <Link
                href={`/offres/${offer.slug}`}
                className="block"
            >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                    {offer.image_url ? (
                        <img
                            src={offer.image_url}
                            alt={offer.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            Visuel à venir
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                    <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                        {offer.category ? (
                            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#081426] shadow-sm">
                                {offer.category}
                            </span>
                        ) : null}

                        {offer.featured ? (
                            <span className="rounded-full bg-[#0d63f3] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                                Sélection PaxSolutio
                            </span>
                        ) : null}
                    </div>

                    {offer.price_from ? (
                        <div className="absolute bottom-5 left-5">
                            <div className="text-xs font-semibold text-white/85">
                                {offer.price_label ??
                                    "À partir de"}
                            </div>

                            <div className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[#f4c542] drop-shadow-sm">
                                {formatPrice(
                                    offer.price_from,
                                    offer.currency ??
                                        "EUR"
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="p-6 md:p-7">
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#081426]">
                        {offer.title}
                    </h2>

                    {offer.subtitle ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                            {offer.subtitle}
                        </p>
                    ) : offer.short_description ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                            {offer.short_description}
                        </p>
                    ) : null}

                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                                Sourcing
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                                Contrôle qualité
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                                Logistique
                            </span>
                        </div>

                        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#081426] px-5 py-2.5 text-xs font-semibold text-white transition group-hover:bg-[#0d63f3]">
                            Voir l’offre →
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}