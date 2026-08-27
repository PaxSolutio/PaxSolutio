const steps = [
  {
    number: "01",
    title: "Votre demande",
    description:
      "Modèle, finition, quantité, budget, année et pays de destination.",
  },
  {
    number: "02",
    title: "Recherche marché",
    description:
      "Identification de vendeurs, distributeurs ou sources compatibles avec votre besoin.",
  },
  {
    number: "03",
    title: "Sélection",
    description:
      "Comparaison des options disponibles selon prix, spécifications et conditions.",
  },
  {
    number: "04",
    title: "Vérification",
    description:
      "Contrôle des informations disponibles sur le véhicule et le vendeur.",
  },
  {
    number: "05",
    title: "Achat & export",
    description:
      "Validation de l'offre, préparation documentaire et coordination export.",
  },
  {
    number: "06",
    title: "Transport",
    description:
      "Acheminement par RoRo ou conteneur selon disponibilité et destination.",
  },
];

export default function AutomotiveProcess() {
  return (
    <section id="process" className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Process
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            De la recherche du véhicule
            <span className="text-[#176BFF]"> à son expédition.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="min-h-[250px] rounded-[26px] border border-[#E2E8F0] bg-white p-7"
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