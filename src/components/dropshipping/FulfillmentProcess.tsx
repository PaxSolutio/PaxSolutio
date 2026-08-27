const steps = [
  {
    number: "01",
    title: "Sourcing",
    description:
      "Recherche ou utilisation de votre fournisseur existant pour approvisionner les produits.",
  },
  {
    number: "02",
    title: "Réception",
    description:
      "Les marchandises peuvent être réceptionnées dans un point de stockage ou de consolidation.",
  },
  {
    number: "03",
    title: "Stock",
    description:
      "Organisation du stock disponible pour les commandes de votre activité.",
  },
  {
    number: "04",
    title: "Commande",
    description:
      "Une commande client déclenche la préparation du produit correspondant.",
  },
  {
    number: "05",
    title: "Pick & Pack",
    description:
      "Sélection du produit, préparation et éventuelle personnalisation du colis.",
  },
  {
    number: "06",
    title: "Expédition",
    description:
      "Le colis est remis au réseau de transport adapté à la destination finale.",
  },
  {
    number: "07",
    title: "Tracking",
    description:
      "Transmission ou exploitation des données de suivi lorsqu'elles sont disponibles.",
  },
  {
    number: "08",
    title: "Client",
    description:
      "La commande poursuit son acheminement jusqu'au destinataire final.",
  },
];

export default function FulfillmentProcess() {
  return (
    <section
      id="fulfillment-process"
      className="bg-[#F6F8FB] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[820px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Fulfillment Flow
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Du fournisseur
            <span className="text-[#176BFF]"> jusqu&apos;au client final.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="min-h-[260px] rounded-[26px] border border-[#E2E8F0] bg-white p-7"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                {step.number}
              </span>

              <h3 className="mt-14 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                {step.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#657386]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}