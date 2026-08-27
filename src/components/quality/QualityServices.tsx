const qualityServices = [
  {
    code: "VERIFY",
    title: "Supplier Verification",
    description:
      "Vérification des informations essentielles du fournisseur avant engagement.",
  },
  {
    code: "AUDIT",
    title: "Factory Audit",
    description:
      "Évaluation des capacités de production, de l'organisation et du site industriel.",
  },
  {
    code: "DUPRO",
    title: "During Production Inspection",
    description:
      "Contrôle pendant la production afin de détecter des écarts avant la fin de fabrication.",
  },
  {
    code: "PSI",
    title: "Pre-Shipment Inspection",
    description:
      "Inspection de la marchandise avant départ afin de vérifier les critères définis.",
  },
  {
    code: "LOAD",
    title: "Loading Supervision",
    description:
      "Vérification du chargement lorsque le projet nécessite une supervision complémentaire.",
  },
  {
    code: "REPORT",
    title: "Inspection Report",
    description:
      "Synthèse des éléments vérifiés, observations, photos et anomalies identifiées.",
  },
];

export default function QualityServices() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Quality Services
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Plusieurs niveaux de contrôle
            <span className="text-[#176BFF]"> selon votre risque.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Le type d&apos;inspection dépend du produit, du fournisseur, du
            stade de production et des points que vous souhaitez vérifier.
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