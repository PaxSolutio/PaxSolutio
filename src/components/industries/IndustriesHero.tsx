export default function IndustriesHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute right-[-180px] top-[-120px] h-[560px] w-[560px] rounded-full bg-[#EAF2FF] blur-[50px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[900px]">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Industries
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
            Une stratégie de sourcing adaptée
            <span className="text-[#176BFF]"> à votre industrie.</span>
          </h1>

          <p className="mt-7 max-w-[760px] text-lg leading-8 text-[#657386] lg:text-xl">
            Machines, mobilier, automobile, beauté ou e-commerce : les critères
            de sélection d&apos;un fournisseur ne sont jamais exactement les
            mêmes.
          </p>
        </div>
      </div>
    </section>
  );
}