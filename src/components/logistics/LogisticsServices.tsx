const services = [
  {
    number: "01",
    title: "Pickup fournisseur",
    description:
      "Organisation de la collecte de vos marchandises auprès d'un ou plusieurs fournisseurs.",
  },
  {
    number: "02",
    title: "Consolidation",
    description:
      "Regroupement de plusieurs commandes avant expédition afin de centraliser l'opération.",
  },
  {
    number: "03",
    title: "Warehousing",
    description:
      "Stockage temporaire lorsque le projet nécessite une étape intermédiaire.",
  },
  {
    number: "04",
    title: "Documentation",
    description:
      "Coordination des informations et documents nécessaires au transport.",
  },
  {
    number: "05",
    title: "Dédouanement",
    description:
      "Accompagnement ou coordination avec les acteurs impliqués dans les formalités douanières.",
  },
  {
    number: "06",
    title: "Tracking",
    description:
      "Suivi des principales étapes de l'expédition selon les données disponibles.",
  },
];

export default function LogisticsServices() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Beyond Freight
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Le transport ne commence pas
            <span className="text-[#176BFF]"> au départ du navire.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Une opération logistique peut inclure plusieurs étapes avant et
            après le transport principal.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.number}
              className="min-h-[260px] rounded-[26px] border border-[#E2E8F0] bg-white p-7"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                {service.number}
              </span>

              <h3 className="mt-14 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                {service.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#657386]">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}