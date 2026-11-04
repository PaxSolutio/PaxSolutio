const steps = [
  {
    number: "01",
    title: "Cahier des charges",
    description:
      "Produit, quantités, budget, spécifications et marché cible.",
  },
  {
    number: "02",
    title: "Recherche",
    description:
      "Identification des fabricants et fournisseurs adaptés.",
  },
  {
    number: "03",
    title: "Comparaison",
    description:
      "Prix, MOQ, capacités, délais et conditions comparés.",
  },
  {
    number: "04",
    title: "Échantillon",
    description:
      "Validation du produit ou du prototype lorsque nécessaire.",
  },
  {
    number: "05",
    title: "Production",
    description:
      "Suivi des échanges et de la préparation de la commande.",
  },
  {
    number: "06",
    title: "Contrôle",
    description:
      "Inspection possible avant expédition selon vos critères.",
  },
  {
    number: "07",
    title: "Logistique",
    description:
      "Collecte, consolidation et organisation du transport.",
  },
  {
    number: "08",
    title: "Acheminement",
    description:
      "Transport international jusqu’à la destination prévue.",
  },
];

export default function ProcessTimeline() {
  return (
    <section className="bg-white py-14 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* INTRODUCTION */}
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Notre méthode
            </div>

            <h2 className="mt-4 max-w-[720px] [overflow-wrap:anywhere] text-[36px] font-extrabold leading-[1.06] tracking-[-0.045em] text-[#071B33] sm:text-[44px] lg:text-[48px]">
              Du besoin initial
              <span className="text-[#176BFF]">
                {" "}
                à l&apos;acheminement.
              </span>
            </h2>
          </div>

          <p className="max-w-[500px] text-base leading-8 text-[#657386] lg:justify-self-end">
            Chaque projet peut suivre l&apos;ensemble du parcours ou seulement
            certaines étapes selon vos besoins, vos fournisseurs et votre
            organisation.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative mt-12">
          <div className="absolute left-[18px] top-4 h-[calc(100%-32px)] w-px bg-[#DDE5EE] lg:left-0 lg:top-[22px] lg:h-px lg:w-full" />

          <div className="relative grid gap-8 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative pl-14 transition duration-300 lg:pl-0"
              >
                <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#176BFF] text-[10px] font-black text-white shadow-sm transition duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_22px_rgba(23,107,255,0.28)] lg:relative lg:z-10 lg:h-11 lg:w-11">
                  {step.number}
                </div>

                <div className="lg:mt-5">
                  <h3 className="text-lg font-extrabold tracking-[-0.025em] text-[#071B33] transition duration-300 group-hover:text-[#176BFF]">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-[250px] text-sm leading-6 text-[#657386] transition duration-300 group-hover:text-[#4D5E73]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RÉSUMÉ */}
        <div className="mt-14 rounded-[24px] border border-[#DDE5EE] bg-[#F6F8FB] px-6 py-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#52647B]">
            <span>Brief</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Recherche</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Sélection</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Échantillon</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Production</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Contrôle</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Transport</span>
          </div>
        </div>
      </div>
    </section>
  );
}