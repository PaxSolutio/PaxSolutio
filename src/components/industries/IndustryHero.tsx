import Link from "next/link";
import type { Industry } from "@/data/industries";

export default function IndustryHero({
  industry,
}: {
  industry: Industry;
}) {
  return (
    <section className="relative overflow-hidden bg-[#071B33] pb-24 pt-40 text-white lg:pb-32 lg:pt-48">
      <div className="absolute right-[-180px] top-[-100px] h-[560px] w-[560px] rounded-full bg-[#176BFF]/20 blur-[50px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[940px]">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            Sourcing par secteur / {industry.name}
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-[58px] lg:text-[68px]">
            {industry.title}
          </h1>

          <p className="mt-7 max-w-[800px] text-lg leading-8 text-white/60 lg:text-xl">
            {industry.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/#project"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              Présenter mon projet
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="/fournisseurs"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-extrabold text-white transition hover:bg-white/5"
            >
              Rechercher un fournisseur
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/50">
            <span>✓ Recherche fabricant</span>
            <span>✓ Comparaison</span>
            <span>✓ Contrôle</span>
            <span>✓ Import international</span>
          </div>
        </div>
      </div>
    </section>
  );
}