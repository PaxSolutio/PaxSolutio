import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-white px-6 py-14 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="overflow-hidden rounded-[36px] bg-[#071B33] px-7 py-14 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            {/* TEXTE */}
            <div>
              <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#75A8FF]">
                Votre prochain projet
              </div>

              <h2 className="max-w-[780px] text-[38px] font-extrabold leading-[1.06] tracking-[-0.05em] sm:text-[48px] lg:text-[56px]">
                Vous avez une idée.
                <br />
                <span className="text-[#75A8FF]">
                  Passons au concret.
                </span>
              </h2>

              <p className="mt-6 max-w-[680px] text-base leading-8 text-white/60">
                Produit, fournisseur, véhicule ou transport : présentez-nous
                votre besoin ou découvrez les opportunités actuellement
                proposées par PaxSolutio.
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:min-w-[230px] lg:flex-col">
              <Link
                href="#project"
                className="group inline-flex min-h-14 items-center justify-between rounded-xl bg-[#176BFF] px-6 text-sm font-extrabold !text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#2A79FF]"
              >
                Présenter mon projet

                <span className="ml-5 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/offres"
                className="group inline-flex min-h-14 items-center justify-between rounded-xl border border-white/15 px-6 text-sm font-extrabold !text-white transition duration-300 hover:border-white/30 hover:bg-white/[0.06]"
              >
                Voir nos opportunités

                <span className="ml-5 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* BAS DE CTA */}
          <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
            <span>Sourcing</span>
            <span className="text-[#176BFF]">•</span>
            <span>Contrôle qualité</span>
            <span className="text-[#176BFF]">•</span>
            <span>Automobile</span>
            <span className="text-[#176BFF]">•</span>
            <span>Logistique</span>
            <span className="text-[#176BFF]">•</span>
            <span>International</span>
          </div>
        </div>
      </div>
    </section>
  );
}