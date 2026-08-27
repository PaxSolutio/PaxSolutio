export default function ResourcesHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute right-[-160px] top-[-100px] h-[520px] w-[520px] rounded-full bg-[#EAF2FF] blur-[50px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[900px]">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Resources & Insights
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
            Comprendre avant
            <span className="text-[#176BFF]"> d&apos;importer.</span>
          </h1>

          <p className="mt-7 max-w-[760px] text-lg leading-8 text-[#657386] lg:text-xl">
            Guides, analyses et ressources pratiques sur le sourcing,
            l&apos;importation, le contrôle qualité et la logistique
            internationale.
          </p>
        </div>
      </div>
    </section>
  );
}