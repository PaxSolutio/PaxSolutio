const pillars = [
  {
    number: "01",
    title: "Comprendre",
    description:
      "Chaque opération commence par l'analyse du produit, du marché et des contraintes du projet.",
  },
  {
    number: "02",
    title: "Structurer",
    description:
      "Nous organisons les étapes nécessaires entre sourcing, contrôle et logistique.",
  },
  {
    number: "03",
    title: "Coordonner",
    description:
      "L'objectif est de limiter la multiplication des intermédiaires et de conserver une vision cohérente de l'opération.",
  },
];

export default function AboutMission() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[820px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Notre approche
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Un interlocuteur capable de relier
            <span className="text-[#176BFF]"> plusieurs étapes du projet.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="rounded-[28px] border border-[#E2E8F0] bg-white p-8"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                {pillar.number}
              </span>

              <h3 className="mt-12 text-2xl font-extrabold text-[#071B33]">
                {pillar.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#657386]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}