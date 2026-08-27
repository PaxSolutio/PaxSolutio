const freightModes = [
  {
    code: "SEA",
    title: "Transport maritime",
    description:
      "Solutions FCL ou LCL pour les marchandises volumineuses et les opérations d'import classiques.",
    tags: ["FCL", "LCL", "Containers"],
  },
  {
    code: "AIR",
    title: "Transport aérien",
    description:
      "Pour les marchandises urgentes, sensibles ou à forte valeur lorsque le délai est prioritaire.",
    tags: ["Fast", "Airport", "Urgent"],
  },
  {
    code: "RAIL",
    title: "Transport ferroviaire",
    description:
      "Une solution intermédiaire entre l'aérien et le maritime selon les routes disponibles.",
    tags: ["China-Europe", "Rail", "Intermodal"],
  },
  {
    code: "TRUCK",
    title: "Transport routier",
    description:
      "Acheminement routier ou connexion entre différentes étapes de la chaîne logistique.",
    tags: ["Truck", "Door", "Europe"],
  },
  {
    code: "EXPRESS",
    title: "Express",
    description:
      "Expédition rapide adaptée aux échantillons, petites commandes ou marchandises urgentes.",
    tags: ["Parcel", "Samples", "Fast"],
  },
  {
    code: "AUTO",
    title: "Automobile",
    description:
      "Solutions spécifiques pour véhicules avec étude RoRo ou conteneur selon la destination.",
    tags: ["RoRo", "Container", "Vehicles"],
  },
];

export default function FreightModes() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Freight Solutions
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Le bon mode de transport dépend
            <span className="text-[#176BFF]"> de votre opération.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Volume, poids, valeur, urgence et destination sont pris en compte
            pour orienter le choix logistique.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {freightModes.map((mode) => (
            <div
              key={mode.code}
              className="group flex min-h-[330px] flex-col rounded-[28px] border border-[#E5EAF1] bg-[#FBFCFE] p-8 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_65px_rgba(7,27,51,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {mode.code}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#176BFF] transition group-hover:bg-[#176BFF] group-hover:text-white">
                  →
                </span>
              </div>

              <div className="mt-auto">
                <h3 className="text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                  {mode.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {mode.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {mode.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#52647B]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}