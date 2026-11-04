import Image from "next/image";
import Link from "next/link";

const freightModes = [
  {
    code: "SEA",
    title: "Maritime",
    description:
      "FCL, LCL et solutions conteneurisées pour les volumes importants.",
  },
  {
    code: "AIR",
    title: "Aérien",
    description:
      "Pour les marchandises nécessitant un acheminement plus rapide.",
  },
  {
    code: "RAIL",
    title: "Rail",
    description:
      "Alternative Chine-Europe avec un compromis coût / délai.",
  },
  {
    code: "TRUCK",
    title: "Route",
    description:
      "Transport routier et connexions intermodales selon la destination.",
  },
];

export default function LogisticsSection() {
  return (
    <section className="bg-[#F6F8FB] py-14 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="overflow-hidden rounded-[32px] border border-[#DDE5EE] bg-white shadow-[0_18px_55px_rgba(7,27,51,0.05)]">
          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            {/* CONTENU GAUCHE */}
            <div className="min-w-0 p-6 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-black tracking-[-0.04em] text-[#071B33]">
                  PAX
                  <span className="text-[#176BFF]">SOLUTIO</span>
                </span>

                <span className="text-[#A3AFBD]">×</span>

                <span className="text-sm font-extrabold text-[#071B33]">
                  OneBillionForwarders
                </span>
              </div>

              <div className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                Logistique internationale
              </div>

              <h2 className="mt-4 max-w-[590px] text-[36px] font-extrabold leading-[1.06] tracking-[-0.045em] text-[#071B33] sm:text-[44px] lg:text-[48px]">
                Connectez votre sourcing
                <span className="text-[#176BFF]">
                  {" "}
                  directement au transport.
                </span>
              </h2>

              <p className="mt-6 max-w-[570px] text-base leading-8 text-[#657386]">
                Collecte, consolidation et transport peuvent être coordonnés
                avec notre partenaire OneBillionForwarders selon la destination,
                le volume et le délai recherché.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Consolidation",
                  "Stockage",
                  "Documents",
                  "Douane",
                  "Suivi",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F2F6FB] px-3 py-2 text-[11px] font-bold text-[#52647B]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/logistique"
                  className="inline-flex min-h-13 items-center justify-center rounded-xl bg-[#071B33] px-6 text-sm font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#0D2948]"
                >
                  Découvrir la logistique
                  <span className="ml-3">→</span>
                </Link>

                <a
                  href="https://www.obforwarders.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center justify-center rounded-xl border border-[#DDE5EE] bg-white px-6 text-sm font-extrabold !text-[#071B33] transition hover:-translate-y-0.5 hover:bg-[#F6F8FB]"
                >
                  OneBillionForwarders ↗
                </a>
              </div>
            </div>

            {/* CONTENU DROIT */}
            <div className="relative border-t border-[#DDE5EE] bg-[#071B33] text-white lg:border-l lg:border-t-0">
              {/* IMAGE */}
              <div className="relative h-[220px] overflow-hidden sm:h-[260px] lg:h-[280px]">
                <Image
                  src="/images/logistique-port.jpg"
                  alt="Opérations logistiques et transport international"
                  fill
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#071B33] via-[#071B33]/45 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9EC0FF]">
                    Acheminement international
                  </div>

                  <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.035em]">
                    Chine
                    <span className="mx-3 text-[#74A8FF]">→</span>
                    Destination
                  </h3>
                </div>
              </div>

              {/* MODES DE TRANSPORT */}
              <div className="min-w-0 p-6 sm:p-10 lg:p-12">
                <div className="grid gap-3 sm:grid-cols-2">
                  {freightModes.map((mode) => (
                    <div
                      key={mode.code}
                      className="group rounded-[22px] border border-white/10 bg-white/[0.05] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#176BFF]/50 hover:bg-white/[0.08]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-[0.16em] text-[#74A8FF]">
                          {mode.code}
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#176BFF]/15 text-[#8EB6FF] transition group-hover:bg-[#176BFF] group-hover:text-white">
                          →
                        </span>
                      </div>

                      <h4 className="mt-6 text-lg font-extrabold">
                        {mode.title}
                      </h4>

                      <p className="mt-2 text-xs leading-6 text-white/55">
                        {mode.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* FLUX */}
                <div className="mt-7 border-t border-white/10 pt-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/45">
                    <span>Collecte</span>
                    <span className="text-[#74A8FF]">→</span>
                    <span>Consolidation</span>
                    <span className="text-[#74A8FF]">→</span>
                    <span>Transport</span>
                    <span className="text-[#74A8FF]">→</span>
                    <span>Destination</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}