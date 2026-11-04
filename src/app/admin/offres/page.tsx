import { requireAdminPage } from "@/lib/admin-access";
import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  await requireAdminPage();

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
            category,
            price_from,
            currency,
            status,
            featured,
            homepage,
            source_type,
            created_at
            `
        )
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw error;
    }

    const publishedCount =
        offers?.filter(
            (offer) =>
                offer.status ===
                "published"
        ).length ?? 0;

    const draftCount =
        offers?.filter(
            (offer) =>
                offer.status === "draft"
        ).length ?? 0;

    const homepageCount =
        offers?.filter(
            (offer) =>
                offer.homepage === true
        ).length ?? 0;

    return (
        <main className="min-h-screen bg-[#06101d] px-5 py-8 text-white lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                            Offres commerciales
                        </div>

                        <h1 className="mt-2 text-3xl font-semibold">
                            Catalogue PaxSolutio
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Gérez les offres
                            publiques, les prix
                            indicatifs et les CTA
                            visibles sur le site.
                        </p>
                    </div>

                    <Link
                        href="/admin/offres/nouvelle"
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        + Nouvelle offre
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                            Total
                        </div>

                        <div className="mt-2 text-2xl font-semibold">
                            {offers?.length ??
                                0}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                            Publiées
                        </div>

                        <div className="mt-2 text-2xl font-semibold text-emerald-300">
                            {
                                publishedCount
                            }
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                            Homepage
                        </div>

                        <div className="mt-2 text-2xl font-semibold text-blue-300">
                            {
                                homepageCount
                            }
                        </div>
                    </div>
                </div>

                <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#081321]">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Offres
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {
                                    draftCount
                                }{" "}
                                brouillon(s)
                            </p>
                        </div>
                    </div>

                    {!offers ||
                    offers.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <div className="text-sm font-medium text-slate-300">
                                Aucune offre pour
                                le moment.
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                                Créez votre
                                première offre
                                commerciale.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {offers.map(
                                (offer) => (
                                    <Link
                                        key={
                                            offer.id
                                        }
                                        href={`/admin/offres/${offer.id}`}
                                        className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.03] md:grid-cols-[1.5fr_0.7fr_0.6fr_0.5fr]"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-white">
                                                {
                                                    offer.title
                                                }
                                            </div>

                                            <div className="mt-1 text-xs text-slate-500">
                                                /
                                                {
                                                    offer.slug
                                                }
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {offer.category ? (
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                                                        {
                                                            offer.category
                                                        }
                                                    </span>
                                                ) : null}

                                                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
                                                    {
                                                        offer.source_type
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-[0.1em] text-slate-500">
                                                Prix
                                            </div>

                                            <div className="mt-1 text-sm font-medium">
                                                {offer.price_from
                                                    ? `${offer.price_from} ${offer.currency}`
                                                    : "—"}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-[0.1em] text-slate-500">
                                                Statut
                                            </div>

                                            <div className="mt-1 text-sm">
                                                {
                                                    offer.status
                                                }
                                            </div>
                                        </div>

                                        <div className="flex items-start justify-start gap-2 md:justify-end">
                                            {offer.featured ? (
                                                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300">
                                                    À la une
                                                </span>
                                            ) : null}

                                            {offer.homepage ? (
                                                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[11px] text-blue-300">
                                                    Homepage
                                                </span>
                                            ) : null}
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}