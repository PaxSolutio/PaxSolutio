const credibilityItems = [
  {
    value: "5+ ans",
    label: "Présence en Asie",
    description:
      "Expérience terrain et réseau opérationnel développés progressivement en Asie.",
  },
  {
    value: "10 000+",
    label: "Contacts fournisseurs",
    description:
      "Portefeuille multi-secteurs composé de fabricants, distributeurs et partenaires.",
  },
  {
    value: "500 000 €+",
    label: "Volume traité",
    description:
      "Volume cumulé en sourcing et e-commerce sur les opérations accompagnées.",
  },
  {
    value: "France + Chine",
    label: "Équipe opérationnelle",
    description:
      "Suivi client en France et présence terrain en Chine pour les opérations locales.",
  },
  {
    value: "Chine",
    label: "Présence physique",
    description:
      "Locaux et capacité de coordination sur place auprès des fournisseurs et partenaires.",
  },
];

export default function CredibilitySection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Présence & expérience
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Une structure pensée pour
              <span className="text-[#176BFF]"> travailler sur le terrain.</span>
            </h2>
          </div>

          <p className="max-w-[560px] text-base leading-8 text-[#657386] lg:justify-self-end">
            PaxSolutio combine présence locale, réseau fournisseur et
            coordination internationale afin d&apos;accompagner des projets de
            sourcing, de contrôle et d&apos;acheminement.
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