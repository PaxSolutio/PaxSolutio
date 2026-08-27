const segments = [
  {
    title: "Automobile",
    description:
      "Véhicules, pièces détachées, accessoires et équipements automobiles.",
  },
  {
    title: "Machines & Construction",
    description:
      "Engins, équipements industriels, outillage et matériel professionnel.",
  },
  {
    title: "Mobilier",
    description:
      "Canapés, mobilier résidentiel, commercial et solutions d'aménagement.",
  },
  {
    title: "Beauté & Esthétique",
    description:
      "Machines, consommables, accessoires et équipements professionnels.",
  },
  {
    title: "Électronique",
    description:
      "Produits électroniques, accessoires et équipements connectés.",
  },
  {
    title: "Maison",
    description:
      "Électroménager, équipements domestiques et produits lifestyle.",
  },
  {
    title: "Textile",
    description:
      "Vêtements, accessoires, personnalisation et private label.",
  },
  {
    title: "E-commerce",
    description:
      "Produits destinés à Amazon, marketplaces et boutiques en ligne.",
  },
];

export default function SupplierSegments() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Multi-sector Network
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Une recherche adaptée
            <span className="text-[#176BFF]"> à votre industrie.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Les critères pertinents varient fortement d&apos;un secteur à
            l&apos;autre. La recherche doit donc être structurée autour du
            produit et de son marché.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {segments.map((segment, index) => (
            <div
              key={segment.title}
              className="min-h-[250px] rounded-[26px] border border-[#E2E8F0] bg-white p-7"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-12 text-xl font-extrabold tracking-[-0.03em] text-[#071B33]">
                {segment.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#657386]">
                {segment.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}