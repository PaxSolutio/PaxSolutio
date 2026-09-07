import Link from "next/link";
import { resources } from "@/data/resources";

export default function FeaturedResources() {
  const featured = resources.filter((resource) => resource.featured);

  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-[760px]">
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Guides essentiels
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Les sujets à maîtriser
              <span className="text-[#176BFF]">
                {" "}
                avant une opération d&apos;import.
              </span>
            </h2>
          </div>

          <p className="max-w-[430px] text-base leading-7 text-[#657386]">
            Commencez par les fondamentaux : sélectionner un fournisseur,
            calculer un coût de revient et comprendre les étapes spécifiques
            d&apos;une importation.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* CARTE VEDETTE */}
          {featured[0] && (
            <Link
              href={`/ressources/${featured[0].slug}`}
              className="group relative min-h-[520px] overflow-hidden rounded-[30px] border border-[#176BFF] bg-[#071B33] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(7,27,51,0.14)]"
            >
              <div className="absolute inset-0 bg-[url('/resources/featured-sourcing.png')] bg-cover bg-center" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#071B33] via-[#071B33]/70 to-black/10" />

              <div className="relative z-10 flex min-h-[520px] flex-col p-8 sm:p-10">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#79A9FF]">
                    {featured[0].category}
                  </div>

                  <span className="text-xs font-bold text-white/40">
                    {featured[0].readingTime}
                  </span>
                </div>

                <div className="mt-auto max-w-[560px]">
                  <h3 className="text-[32px] font-extrabold leading-tight tracking-[-0.04em] !text-white sm:text-[38px]">
                    {featured[0].title}
                  </h3>

                  <p className="mt-5 text-sm leading-7 text-white/70">
                    {featured[0].excerpt}
                  </p>

                  <div className="mt-8 text-sm font-extrabold text-white transition group-hover:translate-x-1">
                    Lire le guide →
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* 2 CARTES SECONDAIRES */}
          <div className="grid gap-5">
            {featured.slice(1, 3).map((resource) => (
              <Link
                key={resource.slug}
                href={`/ressources/${resource.slug}`}
                className="group flex min-h-[247px] flex-col rounded-[28px] border border-[#E2E8F0] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#C9D9F1] hover:shadow-[0_18px_50px_rgba(7,27,51,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#176BFF]">
                    {resource.category}
                  </div>

                  <span className="text-xs font-bold text-[#96A4B5]">
                    {resource.readingTime}
                  </span>
                </div>

                <div className="mt-auto">
                  <h3 className="text-2xl font-extrabold leading-tight tracking-[-0.035em] text-[#071B33]">
                    {resource.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#657386]">
                    {resource.excerpt}
                  </p>

                  <div className="mt-5 text-sm font-extrabold text-[#176BFF] transition group-hover:translate-x-1">
                    Lire le guide →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}