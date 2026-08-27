const options = [
  {
    title: "Recherche personnalisée",
    description:
      "Vous nous indiquez marque, modèle, finition, motorisation, année, quantité et budget.",
  },
  {
    title: "Vérification du véhicule",
    description:
      "Lorsque disponible, nous pouvons organiser des vérifications documentaires ou physiques avant achat.",
  },
  {
    title: "Négociation & achat",
    description:
      "Nous échangeons avec le vendeur ou fournisseur afin d'obtenir les conditions correspondant au projet.",
  },
  {
    title: "Export",
    description:
      "Préparation et coordination des étapes nécessaires à la sortie du véhicule depuis le pays d'origine.",
  },
  {
    title: "Transport RoRo",
    description:
      "Solution adaptée lorsque le véhicule peut être transporté roulier selon la route disponible.",
  },
  {
    title: "Transport conteneur",
    description:
      "Alternative permettant un acheminement conteneurisé, notamment selon le véhicule ou la destination.",
  },
];

export default function AutomotiveOptions() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Automotive Services
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Une solution adaptée au niveau
            <span className="text-[#176BFF]"> d&apos;accompagnement recherché.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option, index) => (
            <div
              key={option.title}
              className="rounded-[28px] border border-[#E5EAF1] bg-[#FBFCFE] p-8"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                0{index + 1}
              </span>

              <h3 className="mt-12 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                {option.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#657386]">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}