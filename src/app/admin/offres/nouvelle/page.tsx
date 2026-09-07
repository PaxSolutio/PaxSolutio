import Link from "next/link";

import CommercialOfferForm from "@/components/admin/CommercialOfferForm";

export default function NewOfferPage() {
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
                        Nouvelle offre
                    </div>

                    <h1 className="mt-2 text-3xl font-semibold">
                        Créer une offre commerciale
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Cette offre pourra être
                        utilisée sur la page
                        Offres, la homepage ou
                        les pages sectorielles.
                    </p>
                </div>

                <div className="mt-8">
                    <CommercialOfferForm />
                </div>
            </div>
        </main>
    );
}