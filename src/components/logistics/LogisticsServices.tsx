const services = [
  {
    number: "01",
    title: "Collecte chez le fournisseur",
    description:
      "Organisation de la récupération des marchandises auprès d'un ou plusieurs fournisseurs avant leur acheminement vers l'entrepôt ou le terminal.",
  },
  {
    number: "02",
    title: "Consolidation des commandes",
    description:
      "Regroupement de marchandises provenant de plusieurs fournisseurs afin de préparer une expédition commune lorsque cela est pertinent.",
  },
  {
    number: "03",
    title: "Stockage temporaire",
    description:
      "Mise en entrepôt temporaire lorsque la marchandise doit être regroupée, préparée ou attendre une prochaine étape logistique.",
  },
  {
    number: "04",
    title: "Documents de transport",
    description:
      "Coordination des informations et documents nécessaires à l'organisation du transport international.",
  },
  {
    number: "05",
    title: "Coordination douanière",
    description:
      "Accompagnement dans la préparation de l'opération et coordination avec les intervenants chargés des formalités douanières.",
  },
  {
    number: "06",
    title: "Suivi de l'expédition",
    description:
      "Suivi des principales étapes du transport selon le mode utilisé et les informations disponibles auprès des opérateurs.",
  },
];

export default function LogisticsServices() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Au-delà du transport
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            La logistique commence
            <span className="text-[#176BFF]"> bien avant le départ de la marchandise.</span>
          </h2>

          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
            Une expédition internationale peut nécessiter collecte, consolidation,
            stockage, documentation, coordination douanière et suivi avant même
            l&apos;acheminement vers la destination finale.
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