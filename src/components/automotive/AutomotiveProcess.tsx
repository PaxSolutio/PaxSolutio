const steps = [
  {
    number: "01",
    title: "Définition de votre recherche",
    description:
      "Marque, modèle, version, motorisation, année, quantité, budget et pays de destination sont définis avant le lancement de la recherche.",
  },
  {
    number: "02",
    title: "Recherche sur le marché chinois",
    description:
      "Identification de vendeurs, distributeurs ou fournisseurs susceptibles de proposer le véhicule correspondant à votre demande.",
  },
  {
    number: "03",
    title: "Comparaison des offres",
    description:
      "Les véhicules disponibles sont comparés selon leur prix, leurs spécifications, leur disponibilité et les conditions proposées.",
  },
  {
    number: "04",
    title: "Vérification",
    description:
      "Les informations disponibles sur le véhicule et le vendeur sont étudiées avant validation et des vérifications complémentaires peuvent être organisées lorsque cela est nécessaire.",
  },
  {
    number: "05",
    title: "Validation & coordination export",
    description:
      "Après sélection de l'offre, les informations et documents nécessaires à l'opération d'export sont coordonnés avec les intervenants concernés.",
  },
  {
    number: "06",
    title: "Transport international",
    description:
      "Le véhicule peut ensuite être acheminé par RoRo ou conteneur selon les routes disponibles, le véhicule et le pays de destination.",
  },
];

export default function AutomotiveProcess() {
  return (
    <section id="process" className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Notre méthode automobile
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Du véhicule recherché
            <span className="text-[#176BFF]"> à son expédition internationale.</span>
          </h2>

          <p className="mt-6 max-w-[700px] text-lg leading-8 text-[#657386]">
            Chaque projet est structuré autour du véhicule demandé, du pays de
            destination et des contraintes de l&apos;opération afin de comparer
            les offres avant toute validation.
          </p>
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