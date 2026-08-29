import Link from "next/link";
import { resources } from "@/data/resources";

const categories = [
  "Sourcing",
  "Import",
  "Logistique",
  "Automobile",
  "Contrôle qualité",
  "Incoterms",
];

export default function ResourcesGrid() {
  return (
    <section
      id="guides"
      className="scroll-mt-28 bg-white py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Toutes les ressources
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Guides pratiques
              <span className="text-[#176BFF]"> & analyses.</span>
            </h2>

            <p className="mt-5 max-w-[650px] text-base leading-7 text-[#657386]">
              Approfondissez chaque étape d&apos;un projet de sourcing et
              d&apos;importation grâce à des contenus dédiés.
            </p>
          </div>

          <div className="flex max-w-[520px] flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-[#DFE6EF] bg-white px-4 py-2 text-xs font-bold text-[#52647B]"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/ressources/${resource.slug}`}
              className="group flex min-h-[340px] flex-col rounded-[26px] border border-[#E5EAF1] bg-[#FBFCFE] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#CCD9EA] hover:bg-white hover:shadow-[0_20px_60px_rgba(7,27,51,0.07)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#176BFF]">
                  {resource.category}
                </span>

                <span className="text-xs font-bold text-[#96A4B5]">
                  {resource.readingTime}
                </span>
              </div>

              <div className="mt-auto">
                <h3 className="text-xl font-extrabold leading-tight tracking-[-0.03em] text-[#071B33]">
                  {resource.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {resource.excerpt}
                </p>

                <div className="mt-7 text-sm font-extrabold text-[#176BFF] transition group-hover:translate-x-1">
                  Lire le guide →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}