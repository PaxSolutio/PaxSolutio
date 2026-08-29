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
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[820px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Une approche intégrée
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[56px]">
            Du fournisseur au transport,
            <span className="text-[#176BFF]">
              {" "}
              gardez une vision globale de votre import.
            </span>
          </h2>

          <p className="mt-6 max-w-[700px] text-lg leading-8 text-[#657386]">
            PaxSolutio peut intervenir sur une étape précise ou coordonner
            plusieurs opérations afin de limiter les intermédiaires et
            simplifier le suivi de votre projet.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.number}
              className="group rounded-[28px] border border-[#E6ECF3] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-[#C9D9F1] hover:shadow-[0_22px_65px_rgba(7,27,51,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {value.number}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F5FF] text-[#176BFF] transition group-hover:bg-[#176BFF] group-hover:text-white">
                  →
                </span>
              </div>

              <h3 className="mt-12 text-3xl font-extrabold tracking-[-0.04em] text-[#071B33]">
                {value.title}
              </h3>

              <p className="mt-4 min-h-[112px] text-[15px] leading-7 text-[#657386]">
                {value.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {value.details.map((detail) => (
                  <span
                    key={detail}
                    className="rounded-full bg-[#F6F8FB] px-3 py-2 text-xs font-bold text-[#4D5E73]"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}