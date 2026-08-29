import Link from "next/link";

function FlowCard({
  label,
  title,
  position,
}: {
  label: string;
  title: string;
  position?: string;
}) {
  return (
    <div
      className={`absolute rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_18px_60px_rgba(7,27,51,0.10)] backdrop-blur ${position}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#176BFF]">
        {label}
      </span>

      <div className="mt-1 text-sm font-extrabold text-[#071B33]">
        {title}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 lg:min-h-[850px] lg:pt-0">
      <div className="absolute left-[-180px] top-[120px] h-[500px] w-[500px] rounded-full bg-[#EAF2FF] blur-[30px]" />
      <div className="absolute right-[-200px] top-[-140px] h-[600px] w-[600px] rounded-full bg-[#E8F8FC] opacity-70 blur-[50px]" />

      <div className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-16 px-6 pb-20 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-0 lg:pt-28">
        <div className="relative z-10 max-w-[760px]">
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#DCE8F8] bg-[#F6FAFF] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#176BFF]" />

            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#48617F]">
              Sourcing Chine • Contrôle qualité • Logistique internationale
            </span>
          </div>

          <h1 className="max-w-[800px] text-[46px] font-extrabold leading-[1.03] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[72px]">
            Votre sourcing en Chine,
            <br />
            du fournisseur à
            <span className="text-[#176BFF]"> la livraison.</span>
          </h1>

          <p className="mt-7 max-w-[650px] text-lg leading-8 text-[#657386] lg:text-xl">
            PaxSolutio accompagne entreprises et entrepreneurs dans la
            recherche de fournisseurs en Chine, la négociation, le
            développement produit, le contrôle qualité et l&apos;organisation
            de leur importation internationale.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#project"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              Présenter mon projet
              <span className="ml-3 text-lg">→</span>
            </Link>

            <Link
              href="#solutions"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#DDE5EF] bg-white px-7 text-sm font-extrabold text-[#071B33] transition duration-200 hover:border-[#B9C7D8] hover:bg-[#F8FAFC]"
            >
              Découvrir nos solutions
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#657386]">
            <span>✓ Sourcing B2B</span>
            <span>✓ Automobile</span>
            <span>✓ Private Label</span>
            <span>✓ Import international</span>
          </div>
        </div>

        <div className="relative mx-auto h-[520px] w-full max-w-[620px] lg:h-[650px]">
          <div className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#EAF2FF] to-[#E8F8FC]" />

          <div className="absolute left-1/2 top-[13%] h-[72%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#8CB8FF] to-transparent" />

          <div className="absolute left-1/2 top-[20%] h-3 w-3 -translate-x-1/2 rounded-full border-[3px] border-white bg-[#176BFF] shadow-md" />
          <div className="absolute left-1/2 top-[46%] h-3 w-3 -translate-x-1/2 rounded-full border-[3px] border-white bg-[#176BFF] shadow-md" />
          <div className="absolute left-1/2 top-[72%] h-3 w-3 -translate-x-1/2 rounded-full border-[3px] border-white bg-[#176BFF] shadow-md" />

          <FlowCard
            label="01 • SOURCER"
            title="Identifier le fournisseur"
            position="left-[5%] top-[12%] w-[210px]"
          />

          <FlowCard
            label="02 • VÉRIFIER"
            title="Contrôler la production"
            position="right-[2%] top-[34%] w-[210px]"
          />

          <FlowCard
            label="03 • EXPÉDIER"
            title="Organiser le transport"
            position="left-[8%] top-[57%] w-[210px]"
          />

          <FlowCard
            label="04 • LIVRER"
            title="Acheminer à destination"
            position="right-[5%] top-[78%] w-[210px]"
          />

          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border border-white bg-[#071B33] shadow-[0_25px_80px_rgba(7,27,51,0.22)]">
            <div className="text-center">
              <div className="text-[12px] font-black tracking-[0.12em] text-white">
                PAX
              </div>
              <div className="text-[12px] font-black tracking-[0.12em] text-[#5F9BFF]">
                SOLUTIO
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}