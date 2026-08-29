const qualityServices = [
  {
    code: "VERIFY",
    title: "Vérification fournisseur",
    description:
      "Vérification des informations essentielles du fournisseur avant engagement ou lancement d'une commande.",
  },
  {
    code: "AUDIT",
    title: "Audit usine",
    description:
      "Évaluation du site de production, de l'organisation, des capacités industrielles et des informations disponibles sur le fabricant.",
  },
  {
    code: "DUPRO",
    title: "Inspection pendant production",
    description:
      "Contrôle réalisé en cours de fabrication afin d'identifier certains écarts avant la fin de la production.",
  },
  {
    code: "PSI",
    title: "Inspection avant expédition",
    description:
      "Contrôle de la marchandise terminée avant son départ selon les critères définis dans le cahier des charges.",
  },
  {
    code: "LOAD",
    title: "Supervision du chargement",
    description:
      "Vérification du chargement et de certains éléments logistiques lorsque le projet nécessite une supervision complémentaire.",
  },
  {
    code: "REPORT",
    title: "Rapport d'inspection",
    description:
      "Synthèse des contrôles réalisés avec observations, photos, résultats et anomalies identifiées.",
  },
];

export default function QualityServices() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Services de contrôle qualité
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Plusieurs niveaux de contrôle
            <span className="text-[#176BFF]"> selon votre produit et votre risque.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Le type d&apos;inspection dépend du fournisseur, du stade de production,
            des caractéristiques du produit et des points critiques que vous souhaitez
            vérifier avant l&apos;expédition.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {qualityServices.map((service) => (
            <div
              key={service.code}
              className="flex min-h-[320px] flex-col rounded-[28px] border border-[#E5EAF1] bg-[#FBFCFE] p-8"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                {service.code}
              </span>

              <div className="mt-auto">
                <h3 className="text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                  {service.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}