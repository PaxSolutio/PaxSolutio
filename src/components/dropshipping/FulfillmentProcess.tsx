const steps = [
  {
    number: "01",
    title: "Sourcing produit",
    description:
      "Recherche d'un fournisseur ou intégration de votre fournisseur existant afin d'organiser l'approvisionnement des produits.",
  },
  {
    number: "02",
    title: "Réception des marchandises",
    description:
      "Les produits sont réceptionnés dans un point de stockage ou de consolidation avant leur mise à disposition.",
  },
  {
    number: "03",
    title: "Gestion du stock",
    description:
      "Les références disponibles sont organisées afin de préparer les commandes selon les besoins de votre activité.",
  },
  {
    number: "04",
    title: "Réception de la commande",
    description:
      "Une commande client déclenche la sélection du produit correspondant dans le stock disponible.",
  },
  {
    number: "05",
    title: "Pick & Pack",
    description:
      "Le produit est sélectionné, préparé puis conditionné avec les éléments de packaging prévus pour votre marque.",
  },
  {
    number: "06",
    title: "Expédition",
    description:
      "Le colis est remis à une solution de transport adaptée au pays de destination et au niveau de service recherché.",
  },
  {
    number: "07",
    title: "Suivi",
    description:
      "Les informations de suivi disponibles peuvent être exploitées et transmises selon les solutions de transport utilisées.",
  },
  {
    number: "08",
    title: "Livraison client",
    description:
      "La commande poursuit son acheminement jusqu'au destinataire final selon le réseau logistique sélectionné.",
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
            Processus de fulfillment
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Du fournisseur en Chine
            <span className="text-[#176BFF]">
              {" "}
              jusqu&apos;au client final.
            </span>
          </h2>

          <p className="mt-6 max-w-[720px] text-lg leading-8 text-[#657386]">
            Une organisation fulfillment relie l&apos;approvisionnement, le
            stock, la préparation de commande et l&apos;expédition afin de
            transformer chaque vente en un flux logistique structuré.
          </p>
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