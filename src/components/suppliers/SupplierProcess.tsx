const steps = [
  {
    number: "01",
    title: "Définition du besoin",
    description:
      "Produit recherché, caractéristiques techniques, quantités, budget, marché de destination et contraintes du projet.",
  },
  {
    number: "02",
    title: "Recherche de fournisseurs",
    description:
      "Identification de fabricants et fournisseurs en Chine susceptibles de répondre au cahier des charges.",
  },
  {
    number: "03",
    title: "Présélection",
    description:
      "Premier filtrage selon les capacités, les informations disponibles, les MOQ, les délais et les conditions commerciales.",
  },
  {
    number: "04",
    title: "Qualification",
    description:
      "Échanges avec les fournisseurs sur les prix, capacités de production, personnalisation, packaging et exigences techniques.",
  },
  {
    number: "05",
    title: "Comparaison",
    description:
      "Organisation des différentes propositions afin de comparer les fournisseurs sur des critères concrets.",
  },
  {
    number: "06",
    title: "Shortlist fournisseurs",
    description:
      "Sélection des fabricants les plus adaptés avant négociation, échantillonnage, contrôle qualité ou lancement de commande.",
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
            Notre méthode de recherche
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Du cahier des charges
            <span className="text-[#176BFF]"> à une shortlist de fournisseurs qualifiés.</span>
          </h2>
          
          <p className="mt-6 max-w-[720px] text-lg leading-8 text-[#657386]">
            Notre processus vise à réduire le nombre d'options progressivement afin de
            comparer les fabricants sur les critères réellement importants pour votre projet.
          </p>
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