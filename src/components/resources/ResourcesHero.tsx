import Link from "next/link";

export default function ResourcesHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute right-[-160px] top-[-100px] h-[520px] w-[520px] rounded-full bg-[#EAF2FF] blur-[50px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[940px]">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Guides sourcing & import
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
            Comprendre avant
            <span className="text-[#176BFF]"> d&apos;acheter et d&apos;importer.</span>
          </h1>

          <p className="mt-7 max-w-[800px] text-lg leading-8 text-[#657386] lg:text-xl">
            Guides pratiques sur le sourcing en Chine, la sélection des
            fournisseurs, les coûts d&apos;importation, les Incoterms, le
            contrôle qualité, l&apos;automobile et la logistique internationale.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#guides"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              Explorer les guides
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="/#project"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#DDE5EF] bg-white px-7 text-sm font-extrabold text-[#071B33] transition hover:bg-[#F8FAFC]"
            >
              Parler de mon projet
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#657386]">
            <span>Sourcing Chine</span>
            <span>•</span>
            <span>Import</span>
            <span>•</span>
            <span>Logistique</span>
            <span>•</span>
            <span>Contrôle qualité</span>
          </div>
        </div>
      </div>
    </section>
  );
}