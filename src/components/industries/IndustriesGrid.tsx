import Link from "next/link";
import { industries } from "@/data/industries";

export default function IndustriesGrid() {
  return (
    <section
      id="industries-list"
      className="scroll-mt-28 bg-[#F6F8FB] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Nos secteurs
            </div>

            <h2 className="max-w-[740px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Des méthodes adaptées
              <span className="text-[#176BFF]">
                {" "}
                aux contraintes de chaque produit.
              </span>
            </h2>
          </div>

          <p className="max-w-[470px] text-base leading-7 text-[#657386]">
            Découvrez les principaux secteurs dans lesquels nous pouvons
            rechercher des fournisseurs, comparer des fabricants, organiser
            des contrôles et accompagner les opérations d&apos;importation.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/secteurs/${industry.slug}`}
              className="group flex min-h-[340px] flex-col rounded-[28px] border border-[#E2E8F0] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-[#C9D9F1] hover:shadow-[0_22px_65px_rgba(7,27,51,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {industry.code}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F6FB] text-[#176BFF] transition group-hover:translate-x-1 group-hover:bg-[#176BFF] group-hover:text-white">
                  →
                </span>
              </div>

              <div className="mt-auto">
                <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                  {industry.name}
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {industry.shortDescription}
                </p>

                <div className="mt-7 text-sm font-extrabold text-[#176BFF]">
                  Voir le sourcing {industry.name.toLowerCase()} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-[28px] border border-[#DDE8F8] bg-[#EEF5FF] p-7 sm:p-9">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[#071B33]">
                Votre produit appartient à un autre secteur ?
              </h2>

              <p className="mt-3 max-w-[760px] text-sm leading-7 text-[#657386]">
                Cette sélection présente nos principales catégories mais ne
                limite pas notre capacité de recherche. Un projet peut être
                étudié à partir de son cahier des charges, de ses volumes et de
                ses contraintes spécifiques.
              </p>
            </div>

            <Link
              href="/#project"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[#176BFF] px-6 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              Présenter mon besoin
              <span className="ml-3">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}