import Link from "next/link";

const freightModes = [
  {
    code: "SEA",
    title: "Sea Freight",
    description: "FCL, LCL et solutions conteneurisées.",
  },
  {
    code: "AIR",
    title: "Air Freight",
    description: "Pour les expéditions rapides ou sensibles.",
  },
  {
    code: "RAIL",
    title: "Rail Freight",
    description: "Alternative équilibrée entre coût et délai.",
  },
  {
    code: "TRUCK",
    title: "Truck Freight",
    description: "Solutions routières et connexions intermodales.",
  },
];

export default function LogisticsSection() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="rounded-[36px] border border-[#E1E8F0] bg-white p-8 sm:p-10 lg:p-14">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-black tracking-[-0.04em] text-[#071B33]">
                  PAX<span className="text-[#176BFF]">SOLUTIO</span>
                </span>

                <span className="text-[#9BAABD]">×</span>

                <span className="text-sm font-extrabold text-[#071B33]">
                  OneBillionForwarders
                </span>
              </div>

              <div className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                Connected logistics
              </div>

              <h2 className="mt-5 text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
                Le sourcing connecté directement
                <span className="text-[#176BFF]"> à la logistique.</span>
              </h2>

              <p className="mt-6 max-w-[560px] text-base leading-8 text-[#657386]">
                Après validation de vos marchandises, leur acheminement peut
                être coordonné avec OneBillionForwarders selon la destination,
                le volume et le délai recherché.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Consolidation",
                  "Warehousing",
                  "Documentation",
                  "Customs",
                  "Tracking",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F2F6FB] px-4 py-2 text-xs font-bold text-[#52647B]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/logistique"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#071B33] px-6 text-sm font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#0D2948]"
                >
                  Nos solutions logistiques
                  <span className="ml-3">→</span>
                </Link>

                <a
                  href="https://www.obforwarders.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 text-sm font-extrabold !text-[#071B33] transition hover:-translate-y-0.5 hover:bg-[#F2F5F8]"
                >
                  OneBillionForwarders ↗
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {freightModes.map((mode) => (
                <div
                  key={mode.code}
                  className="group min-h-[220px] rounded-[26px] border border-[#E5EAF1] bg-[#FBFCFE] p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_60px_rgba(7,27,51,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-[0.18em] text-[#176BFF]">
                      {mode.code}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#176BFF] shadow-sm">
                      →
                    </span>
                  </div>

                  <h3 className="mt-12 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                    {mode.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#657386]">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}