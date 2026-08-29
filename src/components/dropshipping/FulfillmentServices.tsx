const services = [
  {
    title: "Sourcing produit",
    description:
      "Recherche de produits et de fournisseurs adaptés à votre catalogue, vos volumes, votre budget et votre modèle e-commerce.",
  },
  {
    title: "Coordination fournisseurs",
    description:
      "Organisation des approvisionnements lorsque plusieurs fabricants ou fournisseurs participent à votre catalogue.",
  },
  {
    title: "Stockage",
    description:
      "Stockage temporaire ou dédié des marchandises lorsque votre modèle nécessite une disponibilité avant commande.",
  },
  {
    title: "Contrôle produit",
    description:
      "Possibilité d'organiser des vérifications ou contrôles selon les produits et le niveau de service défini.",
  },
  {
    title: "Packaging personnalisé",
    description:
      "Préparation de solutions de packaging, branding ou éléments personnalisés selon les besoins et volumes disponibles.",
  },
  {
    title: "Pick & Pack",
    description:
      "Sélection, préparation et conditionnement individuel des produits avant leur remise au transporteur.",
  },
  {
    title: "Expédition internationale",
    description:
      "Organisation des expéditions selon les destinations, caractéristiques des colis et solutions de transport disponibles.",
  },
  {
    title: "Suivi des commandes",
    description:
      "Utilisation des informations de suivi disponibles auprès des solutions logistiques et transporteurs sélectionnés.",
  },
];

export default function FulfillmentServices() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            Services fulfillment e-commerce
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            Construisez l&apos;infrastructure logistique
            <span className="text-[#6EA4FF]">
              {" "}
              derrière votre boutique.
            </span>
          </h2>

          <p className="mt-6 max-w-[700px] text-base leading-8 text-white/60">
            Selon votre modèle, plusieurs opérations peuvent être combinées
            afin de relier vos fournisseurs en Chine à la préparation et à
            l&apos;expédition de vos commandes clients.
          </p>
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