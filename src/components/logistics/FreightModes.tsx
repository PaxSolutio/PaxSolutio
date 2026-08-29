const freightModes = [
  {
    code: "SEA",
    title: "Fret maritime",
    description:
      "Transport FCL ou LCL depuis la Chine pour les marchandises volumineuses, palettes, équipements et importations en conteneur.",
    tags: ["FCL", "LCL", "Conteneur"],
  },
  {
    code: "AIR",
    title: "Fret aérien",
    description:
      "Solution adaptée aux marchandises urgentes, sensibles ou à forte valeur lorsque le délai de transport est prioritaire.",
    tags: ["Rapide", "Aéroport", "Urgent"],
  },
  {
    code: "RAIL",
    title: "Transport ferroviaire Chine-Europe",
    description:
      "Alternative intermédiaire entre le maritime et l'aérien sur les liaisons ferroviaires disponibles entre la Chine et l'Europe.",
    tags: ["Chine-Europe", "Rail", "Intermodal"],
  },
  {
    code: "TRUCK",
    title: "Transport routier",
    description:
      "Acheminement routier longue distance ou connexion entre fournisseurs, entrepôts, terminaux et destination finale.",
    tags: ["Camion", "Door-to-door", "Europe"],
  },
  {
    code: "EXPRESS",
    title: "Transport express",
    description:
      "Expédition rapide pour les échantillons, petits colis, pièces ou commandes urgentes lorsque le volume reste limité.",
    tags: ["Colis", "Échantillons", "Rapide"],
  },
  {
    code: "AUTO",
    title: "Transport de véhicules",
    description:
      "Solutions logistiques dédiées aux véhicules avec étude du transport RoRo ou en conteneur selon le modèle et la destination.",
    tags: ["RoRo", "Conteneur", "Véhicules"],
  },
];

export default function FreightModes() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Solutions de transport international
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Choisissez le mode de transport
            <span className="text-[#176BFF]"> adapté à votre opération.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Poids, volume, valeur de la marchandise, urgence, destination et budget
            permettent d&apos;orienter le choix entre fret maritime, aérien,
            ferroviaire, routier ou express.
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