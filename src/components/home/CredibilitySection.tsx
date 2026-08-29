const credibilityItems = [
  {
    value: "5+ ans",
    label: "Présence opérationnelle en Asie",
    description:
      "Réseau et expérience terrain développés progressivement au contact de fournisseurs et partenaires asiatiques.",
  },
  {
    value: "10 000+",
    label: "Contacts fournisseurs",
    description:
      "Réseau multi-secteurs composé de fabricants, grossistes, distributeurs et partenaires industriels.",
  },
  {
    value: "500 000 €+",
    label: "Volume cumulé",
    description:
      "Volume cumulé d'opérations réalisées dans le sourcing, l'importation et l'e-commerce.",
  },
  {
    value: "France + Chine",
    label: "Équipe opérationnelle",
    description:
      "Suivi commercial en France et relais terrain en Chine pour coordonner les opérations locales.",
  },
  {
    value: "Chine",
    label: "Présence physique",
    description:
      "Présence locale permettant de faciliter les échanges avec fabricants, fournisseurs et partenaires.",
  },
];

export default function CredibilitySection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Présence & réseau
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Le sourcing se construit
              <span className="text-[#176BFF]"> aussi sur le terrain.</span>
            </h2>
          </div>

          <p className="max-w-[590px] text-base leading-8 text-[#657386] lg:justify-self-end">
            PaxSolutio associe présence en Chine, réseau fournisseurs et
            coordination en France afin d&apos;accompagner des opérations de
            sourcing, de contrôle qualité et d&apos;importation internationale.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {credibilityItems.map((item) => (
            <div
              key={item.label}
              className="group rounded-[26px] border border-[#E2E8F0] bg-[#F8FAFC] p-7 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_55px_rgba(7,27,51,0.07)]"
            >
              <div className="text-[30px] font-extrabold tracking-[-0.04em] text-[#176BFF]">
                {item.value}
              </div>

              <div className="mt-4 text-base font-extrabold text-[#071B33]">
                {item.label}
              </div>

              <p className="mt-3 text-sm leading-7 text-[#657386]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}