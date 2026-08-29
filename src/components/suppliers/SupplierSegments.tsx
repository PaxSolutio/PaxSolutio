const segments = [
  {
    title: "Automobile",
    description:
      "Véhicules, pièces détachées, accessoires, équipements automobiles et solutions d'export.",
  },
  {
    title: "Machines & Construction",
    description:
      "Engins, machines industrielles, outillage, équipements de chantier et matériel professionnel.",
  },
  {
    title: "Mobilier",
    description:
      "Canapés, mobilier résidentiel et professionnel, aménagement et fabrication personnalisée.",
  },
  {
    title: "Beauté & Esthétique",
    description:
      "Machines esthétiques, équipements professionnels, consommables et accessoires spécialisés.",
  },
  {
    title: "Électronique",
    description:
      "Produits électroniques, accessoires, appareils connectés et solutions OEM ou Private Label.",
  },
  {
    title: "Maison",
    description:
      "Électroménager, équipements domestiques, décoration et produits lifestyle.",
  },
  {
    title: "Textile",
    description:
      "Vêtements, accessoires, fabrication textile, personnalisation et Private Label.",
  },
  {
    title: "E-commerce",
    description:
      "Produits destinés à Amazon, marketplaces et boutiques en ligne avec options de packaging et fulfillment.",
  },
];

export default function SupplierSegments() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Réseau fournisseurs multisectoriel
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Une recherche de fournisseurs adaptée
            <span className="text-[#176BFF]"> à votre secteur d'activité.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Les critères de sélection varient selon les produits et les industries.
            La recherche fournisseur doit donc tenir compte des normes, des volumes,
            des capacités de production, de la personnalisation et du marché de destination.
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