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
          <span className="text-[#176BFF]">
            {" "}plusieurs étapes du projet.
          </span>
        </h2>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        
        {/* VISUEL TERRAIN */}
        <div className="relative min-h-[430px] overflow-hidden rounded-[30px] border border-[#DCE4EE] sm:min-h-[520px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/about/approche-terrain.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#071B33]/70 via-transparent to-transparent" />

          <div className="absolute bottom-7 left-7 right-7">
            <div className="inline-flex rounded-full border border-white/15 bg-[#071B33]/60 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              France × Chine
            </div>
          </div>
        </div>

        {/* 3 ÉTAPES */}
        <div className="grid gap-5">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="group rounded-[28px] border border-[#E2E8F0] bg-white p-7 transition duration-300 hover:border-[#C9D9F1] hover:shadow-[0_18px_50px_rgba(7,27,51,0.05)] sm:p-8"
            >
              <div className="flex gap-6">
                <span className="shrink-0 text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {pillar.number}
                </span>

                <div>
                  <h3 className="text-2xl font-extrabold tracking-[-0.03em] text-[#071B33]">
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#657386]">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
}