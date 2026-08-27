import Link from "next/link";

export default function QualityHero() {
  return (
    <section className="relative overflow-hidden bg-[#071B33] pb-24 pt-40 text-white lg:pb-32 lg:pt-48">
      <div className="absolute right-[-160px] top-[-100px] h-[520px] w-[520px] rounded-full bg-[#176BFF]/20 blur-[50px]" />
      <div className="absolute bottom-[-220px] left-[15%] h-[460px] w-[460px] rounded-full bg-[#3CC7E8]/10 blur-[60px]" />

      <div className="mx-auto grid max-w-[1320px] gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
        <div className="relative z-10">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            Quality Control & Factory Audit
          </div>

          <h1 className="max-w-[780px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-[58px] lg:text-[70px]">
            Vérifiez avant
            <span className="text-[#6EA4FF]"> d&apos;expédier.</span>
          </h1>

          <p className="mt-7 max-w-[700px] text-lg leading-8 text-white/60 lg:text-xl">
            PaxSolutio vous accompagne dans la vérification des fournisseurs,
            l&apos;audit usine et le contrôle de vos marchandises avant leur
            expédition.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#inspection-request"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#2A79FF]"
            >
              Demander un contrôle
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="#quality-process"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-extrabold text-white transition hover:bg-white/5"
            >
              Voir la méthode
            </Link>
          </div>
        </div>

        <div className="relative min-h-[500px]">
          <div className="absolute inset-0 rounded-[36px] border border-white/10 bg-white/[0.04]" />

          <div className="absolute left-[9%] right-[9%] top-[10%] rounded-[24px] border border-white/10 bg-white/[0.05] p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7FAEFF]">
              Inspection Report
            </div>

            <div className="mt-3 text-2xl font-extrabold">
              Pre-Shipment Inspection
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Quantity", "Checked"],
                ["Packaging", "Reviewed"],
                ["Visual", "Inspected"],
                ["Report", "Available"],
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

          <div className="absolute bottom-[10%] left-[9%] right-[9%] grid grid-cols-3 gap-3">
            {["Verify", "Inspect", "Report"].map((item, index) => (
              <div
                key={item}
                className="rounded-[20px] border border-white/10 bg-[#0B2848] p-5"
              >
                <div className="text-[10px] font-black text-[#6EA4FF]">
                  0{index + 1}
                </div>

                <div className="mt-3 text-sm font-extrabold">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}