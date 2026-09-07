import Link from "next/link";
import { notFound } from "next/navigation";

import CommercialOfferForm from "@/components/admin/CommercialOfferForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditOfferPage({
    params,
}: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;

    const supabase =
        createServerSupabaseClient();

    const {
        data: offer,
        error,
    } = await supabase
        .from("commercial_offers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!offer) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#06101d] px-5 py-8 text-white lg:px-10">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/admin/offres"
                    className="text-sm text-slate-400 transition hover:text-white"
                >
                    ← Retour aux offres
                </Link>

                <div className="mt-6 border-b border-white/10 pb-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                        Offre commerciale
                    </div>

                    <h1 className="mt-2 text-3xl font-semibold">
                        {offer.title}
                    </h1>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            {offer.status}
                        </span>

                        {offer.featured ? (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                                À la une
                            </span>
                        ) : null}

                        {offer.homepage ? (
                            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                                Homepage
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-8">
                    <CommercialOfferForm
                        initialOffer={
                            offer
                        }
                    />
                </div>
            </div>
        </main>
    );
}