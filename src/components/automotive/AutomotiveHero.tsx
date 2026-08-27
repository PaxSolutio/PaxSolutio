import Link from "next/link";

export default function AutomotiveHero() {
  return (
    <section className="relative overflow-hidden bg-[#071B33] pb-24 pt-40 text-white lg:pb-32 lg:pt-48">
      <div className="absolute right-[-180px] top-[-100px] h-[560px] w-[560px] rounded-full bg-[#176BFF]/20 blur-[50px]" />
      <div className="absolute bottom-[-220px] left-[20%] h-[500px] w-[500px] rounded-full bg-[#3CC7E8]/10 blur-[60px]" />

      <div className="mx-auto grid max-w-[1320px] gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
        <div className="relative z-10">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            PaxSolutio Automotive
          </div>

          <h1 className="max-w-[780px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-[58px] lg:text-[70px]">
            Sourcez des véhicules
            <span className="text-[#6EA4FF]"> à l&apos;international.</span>
          </h1>

          <p className="mt-7 max-w-[700px] text-lg leading-8 text-white/60 lg:text-xl">
            Recherche de modèles, vérification du vendeur, inspection,
            négociation, formalités export et organisation du transport
            jusqu&apos;à destination.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#vehicle-request"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#2A79FF]"
            >
              Rechercher un véhicule
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="#process"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-extrabold text-white transition hover:bg-white/5"
            >
              Voir notre méthode
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/55">
            <span>✓ Véhicules neufs</span>
            <span>✓ Achat B2B</span>
            <span>✓ Export</span>
            <span>✓ RoRo / Conteneur</span>
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <div className="absolute inset-0 rounded-[36px] border border-white/10 bg-white/[0.04]" />

          <div className="absolute left-[9%] top-[9%] right-[9%] rounded-[24px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7FAEFF]">
              Vehicle Sourcing Request
            </div>

            <div className="mt-3 text-2xl font-extrabold">
              BYD Seal / Toyota / BMW...
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Market", "International"],
                ["Status", "Sourcing"],
                ["Inspection", "Available"],
                ["Shipping", "RoRo / Container"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white/[0.05] p-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                    {label}
                  </div>
                  <div className="mt-1 text-sm font-bold">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-[9%] left-[9%] right-[9%] grid grid-cols-3 gap-3">
            {["Source", "Verify", "Export"].map((item, index) => (
              <div
                key={item}
                className="rounded-[20px] border border-white/10 bg-[#0B2848] p-5"
              >
                <div className="text-[10px] font-black text-[#6EA4FF]">
                  0{index + 1}
                </div>
                <div className="mt-3 text-sm font-extrabold">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}