const steps = [
  ["01", "Sourcing"],
  ["02", "Supplier"],
  ["03", "Quality"],
  ["04", "Consolidation"],
  ["05", "Freight"],
  ["06", "Delivery"],
];

export default function IntegratedSolution() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[850px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            End-to-end
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            Les services sont indépendants.
            <span className="text-[#6EA4FF]">
              {" "}
              La chaîne peut être complète.
            </span>
          </h2>

          <p className="mt-6 max-w-[700px] text-base leading-8 text-white/60">
            Vous pouvez nous confier uniquement une recherche fournisseur, une
            inspection ou un transport, ou construire une opération intégrée
            couvrant plusieurs étapes.
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

        <div className="mt-8 rounded-[24px] border border-[#176BFF]/30 bg-[#176BFF]/10 p-6">
          <div className="font-extrabold">
            PaxSolutio
            <span className="mx-3 text-white/30">×</span>
            OneBillionForwarders
          </div>

          <p className="mt-2 text-sm leading-7 text-white/55">
            La partie logistique peut être connectée à notre partenaire
            OneBillionForwarders pour compléter l&apos;opération.
          </p>
        </div>
      </div>
    </section>
  );
}