const options = [
  {
    title: "Recherche de véhicules en Chine",
    description:
      "Recherche ciblée selon la marque, le modèle, la finition, la motorisation, l'année, la quantité, le budget et le pays de destination.",
  },
  {
    title: "Vérification du véhicule",
    description:
      "Étude des informations disponibles sur le véhicule et possibilité d'organiser des vérifications complémentaires selon le projet et la localisation.",
  },
  {
    title: "Comparaison & négociation",
    description:
      "Comparaison des offres disponibles et échanges avec les vendeurs ou fournisseurs sur le prix, les quantités et les conditions de vente.",
  },
  {
    title: "Coordination export",
    description:
      "Préparation et coordination des principales étapes nécessaires à l'expédition du véhicule depuis la Chine.",
  },
  {
    title: "Transport RoRo",
    description:
      "Étude du transport roulier lorsque des lignes compatibles existent entre le port de départ et le marché de destination.",
  },
  {
    title: "Transport en conteneur",
    description:
      "Organisation possible d'un transport conteneurisé selon les dimensions du véhicule, le volume et la destination.",
  },
];

export default function AutomotiveOptions() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Services de sourcing automobile
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            De la recherche du véhicule
            <span className="text-[#176BFF]"> jusqu&apos;à son export.</span>
          </h2>

          <p className="mt-6 max-w-[700px] text-lg leading-8 text-[#657386]">
            L&apos;accompagnement peut couvrir uniquement la recherche d&apos;un
            modèle ou intégrer plusieurs étapes : vérification, négociation,
            coordination export et transport international.
          </p>
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