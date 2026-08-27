const steps = [
  {
    number: "01",
    title: "Définir les critères",
    description:
      "Produit, quantité, tolérances, packaging, dimensions, fonctions ou points critiques.",
  },
  {
    number: "02",
    title: "Planifier le contrôle",
    description:
      "Coordination de l'intervention avec le fournisseur et définition du moment pertinent.",
  },
  {
    number: "03",
    title: "Inspection",
    description:
      "Vérification des éléments convenus selon les informations et critères disponibles.",
  },
  {
    number: "04",
    title: "Documentation",
    description:
      "Collecte des observations, photos et résultats issus du contrôle.",
  },
  {
    number: "05",
    title: "Rapport",
    description:
      "Présentation synthétique des éléments conformes, écarts et anomalies détectées.",
  },
  {
    number: "06",
    title: "Décision",
    description:
      "Vous disposez de davantage d'informations avant de valider la suite de l'opération.",
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
            Inspection Process
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Un contrôle utile commence
            <span className="text-[#176BFF]"> par de bons critères.</span>
          </h2>
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