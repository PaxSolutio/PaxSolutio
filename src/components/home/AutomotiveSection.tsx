import Link from "next/link";

const automotiveSteps = [
  "Recherche du véhicule",
  "Vérification vendeur / véhicule",
  "Négociation",
  "Formalités export",
  "Transport RoRo ou conteneur",
  "Suivi logistique",
];

export default function AutomotiveSection() {
  return (
    <section className="overflow-hidden bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-10">
        <div className="relative min-h-[520px]">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#123B69] via-[#0C2A4C] to-[#071B33]" />

          <div className="absolute left-[8%] top-[10%] h-[82%] w-[84%] rounded-[28px] border border-white/10 bg-white/[0.03]" />

          <div className="absolute left-[13%] top-[16%] rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#8EB6FF]">
            Automotive sourcing
          </div>

          <div className="absolute bottom-[14%] left-[12%] right-[12%]">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                    Vehicle request
                  </div>

                  <div className="mt-2 text-xl font-extrabold">
                    BYD • Toyota • BMW • Mercedes...
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#176BFF] font-black">
                  →
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                    Source
                  </div>
                  <div className="mt-1 text-sm font-bold">Market</div>
                </div>

                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                    Verify
                  </div>
                  <div className="mt-1 text-sm font-bold">Inspection</div>
                </div>

                <div className="rounded-2xl bg-white/[0.05] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                    Ship
                  </div>
                  <div className="mt-1 text-sm font-bold">Export</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-[9%] top-[22%] h-36 w-36 rounded-full bg-[#176BFF]/20 blur-3xl" />
        </div>

        <div>
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#74A8FF]">
            PaxSolutio Automotive
          </div>

          <h2 className="max-w-[650px] text-[40px] font-extrabold leading-[1.06] tracking-[-0.05em] sm:text-[50px] lg:text-[58px]">
            Accédez autrement au marché automobile international.
          </h2>

          <p className="mt-6 max-w-[620px] text-lg leading-8 text-white/60">
            Vous recherchez un modèle précis ou souhaitez développer une
            activité d&apos;import automobile ? PaxSolutio peut vous
            accompagner depuis l&apos;identification du véhicule jusqu&apos;à
            son export.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {automotiveSteps.map((step) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#176BFF]/20 text-xs font-black text-[#8EB6FF]">
                  ✓
                </span>

                <span className="text-sm font-semibold text-white/80">
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#2E7BFF]"
            >
              Décrire le véhicule recherché
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="/sourcing-automobile"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-extrabold text-white transition hover:bg-white/5"
            >
              Découvrir l&apos;automobile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}