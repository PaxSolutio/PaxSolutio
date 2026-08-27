import Link from "next/link";

const industries = [
  {
    title: "Automobile",
    description: "Véhicules, pièces et équipements.",
    href: "/secteurs/automobile",
    code: "01",
  },
  {
    title: "Machines & Construction",
    description: "Engins, équipements et outillage professionnel.",
    href: "/secteurs/construction",
    code: "02",
  },
  {
    title: "Mobilier",
    description: "Sofas, mobilier professionnel et aménagement.",
    href: "/secteurs/mobilier",
    code: "03",
  },
  {
    title: "Beauté & Esthétique",
    description: "Machines, consommables et équipements professionnels.",
    href: "/secteurs/beaute",
    code: "04",
  },
  {
    title: "Électronique",
    description: "Produits électroniques et accessoires.",
    href: "/secteurs/electronique",
    code: "05",
  },
  {
    title: "Maison & Électroménager",
    description: "Équipements domestiques et produits lifestyle.",
    href: "/secteurs/maison",
    code: "06",
  },
  {
    title: "Textile & Fashion",
    description: "Vêtements, accessoires et private label.",
    href: "/secteurs/textile",
    code: "07",
  },
  {
    title: "E-commerce",
    description: "Produits destinés aux marketplaces et boutiques en ligne.",
    href: "/secteurs/ecommerce",
    code: "08",
  },
];

export default function IndustriesSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[760px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Expertises sectorielles
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[56px]">
            Votre industrie a ses propres
            <span className="text-[#176BFF]"> contraintes.</span>
          </h2>

          <p className="mt-6 max-w-[650px] text-lg leading-8 text-[#657386]">
            Nos méthodes de sourcing et de contrôle s&apos;adaptent au produit,
            au marché cible et aux contraintes spécifiques de chaque secteur.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <Link
              key={industry.title}
              href={industry.href}
              className="group flex min-h-[260px] flex-col rounded-[26px] border border-[#E6ECF3] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#C9D9F1] hover:shadow-[0_22px_65px_rgba(7,27,51,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-[0.18em] text-[#176BFF]">
                  {industry.code}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F7FC] text-[#176BFF] transition group-hover:bg-[#176BFF] group-hover:text-white">
                  →
                </span>
              </div>

              <div className="mt-auto">
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[#071B33]">
                  {industry.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#657386]">
                  {industry.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}