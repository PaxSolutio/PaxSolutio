const steps = [
  {
    number: "01",
    title: "Votre besoin",
    description:
      "Produit, caractéristiques, quantités, budget, destination et contraintes.",
  },
  {
    number: "02",
    title: "Recherche",
    description:
      "Identification de fournisseurs susceptibles de répondre au cahier des charges.",
  },
  {
    number: "03",
    title: "Premier filtre",
    description:
      "Analyse des informations disponibles et des conditions commerciales.",
  },
  {
    number: "04",
    title: "Échanges",
    description:
      "Questions complémentaires sur prix, MOQ, délais, personnalisation et capacités.",
  },
  {
    number: "05",
    title: "Comparatif",
    description:
      "Organisation des différentes options afin de faciliter leur comparaison.",
  },
  {
    number: "06",
    title: "Shortlist",
    description:
      "Sélection des fournisseurs qui correspondent le mieux aux critères définis.",
  },
];

export default function SupplierProcess() {
  return (
    <section
      id="supplier-process"
      className="bg-white py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[780px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Supplier Research
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Du besoin initial
            <span className="text-[#176BFF]"> à une shortlist exploitable.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="min-h-[260px] rounded-[26px] border border-[#E5EAF1] bg-[#FBFCFE] p-7"
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