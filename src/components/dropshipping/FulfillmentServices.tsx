const services = [
  {
    title: "Product Sourcing",
    description:
      "Recherche de produits et fournisseurs adaptés au modèle e-commerce.",
  },
  {
    title: "Supplier Coordination",
    description:
      "Coordination des approvisionnements avec un ou plusieurs fournisseurs.",
  },
  {
    title: "Warehousing",
    description:
      "Stockage des marchandises lorsque le modèle nécessite un stock dédié.",
  },
  {
    title: "Quality Check",
    description:
      "Contrôles ou vérifications selon le niveau de service défini.",
  },
  {
    title: "Custom Packaging",
    description:
      "Possibilités de personnalisation du colis selon les besoins et volumes.",
  },
  {
    title: "Pick & Pack",
    description:
      "Préparation individuelle des commandes avant remise au transport.",
  },
  {
    title: "Worldwide Shipping",
    description:
      "Organisation des flux internationaux selon les destinations desservies.",
  },
  {
    title: "Tracking",
    description:
      "Utilisation des informations de suivi fournies par les solutions de transport.",
  },
];

export default function FulfillmentServices() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            E-commerce Operations
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            Construisez l&apos;infrastructure
            <span className="text-[#6EA4FF]"> derrière votre boutique.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="min-h-[270px] rounded-[26px] border border-white/10 bg-white/[0.04] p-7"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176BFF]/20 text-[#8CB8FF]">
                ✓
              </div>

              <h3 className="mt-10 text-xl font-extrabold">
                {service.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}