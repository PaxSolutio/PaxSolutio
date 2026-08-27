import Link from "next/link";

export default function SolutionsHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute right-[-180px] top-[-120px] h-[560px] w-[560px] rounded-full bg-[#EAF2FF] blur-[50px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[920px]">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            PaxSolutio Solutions
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
            Une solution pour chaque étape
            <span className="text-[#176BFF]">
              {" "}
              de votre supply chain.
            </span>
          </h1>

          <p className="mt-7 max-w-[760px] text-lg leading-8 text-[#657386] lg:text-xl">
            Utilisez un service indépendamment ou combinez sourcing, contrôle,
            fournisseurs, logistique et fulfillment dans une seule opération.
          </p>

          <Link
            href="/#project"
            className="mt-9 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
          >
            Présenter mon projet
            <span className="ml-3">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}