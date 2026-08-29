import Link from "next/link";

export default function OBFSection() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-[-0.04em]">
              PAX<span className="text-[#6EA4FF]">SOLUTIO</span>
            </span>

            <span className="text-white/30">×</span>

            <span className="font-extrabold">
              OneBillionForwarders
            </span>
          </div>

          <div className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            Partenaire logistique international
          </div>

          <h2 className="mt-5 text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            Du fournisseur en Chine
            <span className="text-[#6EA4FF]"> jusqu&apos;à l&apos;acheminement international.</span>
          </h2>

          <p className="mt-6 max-w-[600px] text-base leading-8 text-white/60">
            PaxSolutio intervient sur le sourcing, la coordination fournisseur et le
            contrôle qualité. OneBillionForwarders prend en charge les opérations
            logistiques nécessaires pour connecter la marchandise à son marché de
            destination.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#project"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white"
            >
              Démarrer un projet
            </Link>

            <a
              href="https://www.obforwarders.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-extrabold text-white transition hover:bg-white/5"
            >
              Découvrir OneBillionForwarders ↗
            </a>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 sm:p-9">
          <div className="grid gap-4">
            {[
              ["01", "Sourcing", "PaxSolutio"],
              ["02", "Contrôle", "PaxSolutio"],
              ["03", "Consolidation", "OBF"],
              ["04", "Transport", "OBF"],
              ["05", "Suivi", "Coordonné"],
            ].map(([number, title, owner]) => (
              <div
                key={number}
                className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.03] px-5 py-5"
              >
                <div className="flex items-center gap-5">
                  <span className="text-xs font-black text-[#79A9FF]">
                    {number}
                  </span>

                  <span className="font-extrabold">
                    {title}
                  </span>
                </div>

                <span className="text-xs font-bold text-white/40">
                  {owner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}