const steps = [
  {
    number: "01",
    title: "Définition des critères",
    description:
      "Définition des quantités, dimensions, fonctionnalités, tolérances, packaging et autres points critiques à vérifier.",
  },
  {
    number: "02",
    title: "Planification de l'inspection",
    description:
      "Coordination avec le fournisseur afin d'organiser le contrôle au stade de production le plus pertinent.",
  },
  {
    number: "03",
    title: "Contrôle sur place",
    description:
      "Vérification des critères convenus selon le produit, le cahier des charges et les informations disponibles.",
  },
  {
    number: "04",
    title: "Collecte des éléments",
    description:
      "Documentation des observations, mesures, résultats, photos et éventuelles anomalies identifiées pendant l'inspection.",
  },
  {
    number: "05",
    title: "Rapport d'inspection",
    description:
      "Présentation synthétique des contrôles réalisés, des éléments conformes et des écarts observés.",
  },
  {
    number: "06",
    title: "Décision avant expédition",
    description:
      "Vous disposez de davantage d'informations pour valider, corriger ou suspendre l'expédition selon les résultats obtenus.",
  },
];

export default function QualityProcess() {
  return (
    <section
      id="quality-process"
      className="bg-[#F6F8FB] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Processus d'inspection
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Un contrôle qualité efficace commence
            <span className="text-[#176BFF]"> par des critères clairement définis.</span>
          </h2>

          <p className="mt-6 max-w-[720px] text-lg leading-8 text-[#657386]">
            Chaque inspection est préparée autour des caractéristiques du produit et
            des risques identifiés afin que les vérifications réalisées soient réellement
            utiles à votre décision.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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