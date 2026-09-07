const values = [
  {
    number: "01",
    title: "Sourcer",
    description:
      "Identifier et comparer des fabricants adaptés à votre produit, vos volumes, votre budget et votre marché.",
    details: [
      "Recherche fournisseur",
      "Comparaison",
      "Négociation",
    ],
  },
  {
    number: "02",
    title: "Sécuriser",
    description:
      "Vérifier les partenaires, organiser les échantillons et contrôler les marchandises avant leur expédition.",
    details: [
      "Vérification fournisseur",
      "Audit usine",
      "Contrôle qualité",
    ],
  },
  {
    number: "03",
    title: "Acheminer",
    description:
      "Coordonner la collecte, la consolidation et le transport international jusqu'à votre marché de destination.",
    details: [
      "Maritime",
      "Aérien",
      "Rail & Route",
    ],
  },
];

export default function ValueProposition() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* INTRODUCTION */}
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Une approche intégrée
            </div>

            <h2 className="mt-4 text-[36px] font-extrabold leading-[1.06] tracking-[-0.045em] text-[#071B33] sm:text-[44px] lg:text-[48px]">
              Du fournisseur au transport,
              <span className="text-[#176BFF]">
                {" "}
                gardez une vision globale de votre import.
              </span>
            </h2>
          </div>

          <p className="max-w-[520px] text-base leading-8 text-[#657386]">
            PaxSolutio peut intervenir sur une étape précise ou coordonner
            plusieurs opérations afin de limiter les intermédiaires et
            simplifier le suivi de votre projet.
          </p>
        </div>

        {/* ÉTAPES */}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.number}
              className="group flex flex-col rounded-[26px] border border-[#E1E8F0] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#C9D9F1] hover:shadow-[0_20px_55px_rgba(7,27,51,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {value.number}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F5FF] text-sm text-[#176BFF] transition duration-300 group-hover:bg-[#176BFF] group-hover:text-white">
                  →
                </span>
              </div>

              <h3 className="mt-9 text-[27px] font-extrabold tracking-[-0.035em] text-[#071B33]">
                {value.title}
              </h3>

              <p className="mt-3 text-[14px] leading-7 text-[#657386]">
                {value.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2 lg:mt-auto lg:pt-6">
                {value.details.map((detail) => (
                  <span
                    key={detail}
                    className="rounded-full bg-[#F6F8FB] px-3 py-1.5 text-[11px] font-bold text-[#4D5E73] transition duration-300 group-hover:bg-[#F0F5FF]"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CHAÎNE OPÉRATIONNELLE */}
        <div className="mt-10 border-t border-[#E1E8F0] pt-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#52647B]">
            <span>Sourcing</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Vérification</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Contrôle</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Consolidation</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Transport</span>
            <span className="text-[#A6B2C1]">→</span>

            <span>Livraison</span>
          </div>
        </div>
      </div>
    </section>
  );
}