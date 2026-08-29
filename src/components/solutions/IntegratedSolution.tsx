import Link from "next/link";

const steps = [
  ["01", "Besoin"],
  ["02", "Sourcing"],
  ["03", "Fournisseur"],
  ["04", "Contrôle"],
  ["05", "Logistique"],
  ["06", "Destination"],
];

export default function IntegratedSolution() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[880px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            Accompagnement multi-étapes
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            Chaque service peut être indépendant.
            <span className="text-[#6EA4FF]">
              {" "}
              Votre projet peut aussi être coordonné de bout en bout.
            </span>
          </h2>

          <p className="mt-6 max-w-[760px] text-base leading-8 text-white/60">
            Un client peut déjà disposer d&apos;un fournisseur et avoir besoin
            uniquement d&apos;un contrôle qualité ou d&apos;un transport. À
            l&apos;inverse, PaxSolutio peut intervenir dès la définition du
            besoin et coordonner plusieurs étapes jusqu&apos;à
            l&apos;acheminement.
          </p>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map(([number, label], index) => (
            <div
              key={label}
              className="relative rounded-[22px] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="text-[10px] font-black text-[#79A9FF]">
                {number}
              </div>

              <div className="mt-8 text-sm font-extrabold">
                {label}
              </div>

              {index < steps.length - 1 && (
                <span className="absolute -right-[11px] top-1/2 z-10 hidden -translate-y-1/2 text-[#79A9FF] lg:block">
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[24px] border border-[#176BFF]/30 bg-[#176BFF]/10 p-6 sm:p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="font-extrabold">
                PaxSolutio
                <span className="mx-3 text-white/30">×</span>
                OneBillionForwarders
              </div>

              <p className="mt-2 max-w-[760px] text-sm leading-7 text-white/55">
                Lorsque le projet nécessite une solution de transport, la
                partie logistique peut être coordonnée avec
                OneBillionForwarders pour relier les opérations de sourcing à
                l&apos;acheminement international.
              </p>
            </div>

            <Link
              href="/logistique"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-extrabold text-white transition hover:bg-white/5"
            >
              Voir la logistique
              <span className="ml-3">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm font-semibold">
          <Link
            href="/sourcing"
            className="text-white/60 transition hover:text-white"
          >
            Sourcing →
          </Link>

          <Link
            href="/fournisseurs"
            className="text-white/60 transition hover:text-white"
          >
            Recherche fournisseurs →
          </Link>

          <Link
            href="/controle-qualite"
            className="text-white/60 transition hover:text-white"
          >
            Contrôle qualité →
          </Link>

          <Link
            href="/developpement-produit"
            className="text-white/60 transition hover:text-white"
          >
            Développement produit →
          </Link>

          <Link
            href="/dropshipping"
            className="text-white/60 transition hover:text-white"
          >
            Dropshipping →
          </Link>
        </div>
      </div>
    </section>
  );
}