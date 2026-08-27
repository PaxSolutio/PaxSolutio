const steps = [
  {
    number: "01",
    title: "Brief",
    description:
      "Vous nous présentez votre produit, votre budget, vos volumes et votre marché cible.",
  },
  {
    number: "02",
    title: "Recherche",
    description:
      "Nous identifions et qualifions les fournisseurs correspondant à vos critères.",
  },
  {
    number: "03",
    title: "Proposition",
    description:
      "Vous recevez une sélection structurée avec prix, MOQ, délais et conditions.",
  },
  {
    number: "04",
    title: "Validation",
    description:
      "Échantillons, négociation finale et validation du fournisseur retenu.",
  },
  {
    number: "05",
    title: "Production",
    description:
      "Nous suivons les échanges avec le fabricant pendant la préparation de la commande.",
  },
  {
    number: "06",
    title: "Inspection",
    description:
      "La marchandise peut être contrôlée avant expédition selon votre cahier des charges.",
  },
  {
    number: "07",
    title: "Logistique",
    description:
      "Collecte, consolidation et transport selon la solution la plus adaptée.",
  },
  {
    number: "08",
    title: "Livraison",
    description:
      "Votre marchandise poursuit son acheminement jusqu'à la destination convenue.",
  },
];

export default function ProcessTimeline() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              De la demande à la livraison
            </div>

            <h2 className="max-w-[720px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[56px]">
              Une méthode claire
              <span className="text-[#176BFF]"> à chaque étape.</span>
            </h2>
          </div>

          <p className="max-w-[420px] text-base leading-7 text-[#657386]">
            Chaque projet peut être pris en charge intégralement ou uniquement
            sur les étapes dont vous avez besoin.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-[23px] top-4 hidden h-[calc(100%-32px)] w-px bg-[#DCE5F0] md:block lg:left-0 lg:top-[26px] lg:h-px lg:w-full" />

          <div className="grid gap-5 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative rounded-[24px] border border-[#E6ECF3] bg-white p-7 shadow-[0_12px_40px_rgba(7,27,51,0.04)]"
              >
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#176BFF] text-xs font-black text-white shadow-md">
                  {step.number}
                </div>

                <h3 className="mt-7 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#657386]">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="mt-6 text-sm font-bold text-[#176BFF] lg:hidden">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}