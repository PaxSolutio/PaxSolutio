import Link from "next/link";

export default function SolutionsHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute right-[-180px] top-[-120px] h-[560px] w-[560px] rounded-full bg-[#EAF2FF] blur-[50px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[940px]">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Solutions sourcing & import
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
            Les solutions pour construire
            <span className="text-[#176BFF]">
              {" "}
              votre opération d&apos;import.
            </span>
          </h1>

          <p className="mt-7 max-w-[780px] text-lg leading-8 text-[#657386] lg:text-xl">
            Recherche fournisseur, développement produit, contrôle qualité,
            sourcing automobile, logistique ou fulfillment : choisissez les
            étapes dont votre projet a réellement besoin ou combinez plusieurs
            services dans une même opération.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#solutions-list"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              Explorer les solutions
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="/#project"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#DDE5EF] bg-white px-7 text-sm font-extrabold text-[#071B33] transition hover:border-[#B9C7D8] hover:bg-[#F8FAFC]"
            >
              Présenter mon projet
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#657386]">
            <span>✓ Service indépendant</span>
            <span>✓ Accompagnement multi-étapes</span>
            <span>✓ Chine & international</span>
            <span>✓ Projets B2B et e-commerce</span>
          </div>
        </div>
      </div>
    </section>
  );
}