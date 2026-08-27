const models = [
  {
    badge: "MODEL 01",
    title: "Dropshipping fournisseur",
    description:
      "Le fournisseur prépare et expédie les commandes selon le fonctionnement défini avec votre activité.",
    points: [
      "Pas ou peu de stock intermédiaire",
      "Organisation dépendante du fournisseur",
      "Adapté à certains catalogues",
      "Flux plus direct",
    ],
  },
  {
    badge: "MODEL 02",
    title: "Fulfillment avec stock",
    description:
      "Les produits sont réceptionnés et stockés avant préparation individuelle des commandes.",
    points: [
      "Stock centralisé",
      "Contrôle avant expédition",
      "Packaging personnalisé",
      "Préparation commande par commande",
    ],
  },
];

export default function DropshippingModels() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[800px]">
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Operating Models
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Le dropshipping et le fulfillment
            <span className="text-[#176BFF]"> ne sont pas la même chose.</span>
          </h2>

          <p className="mt-6 max-w-[700px] text-lg leading-8 text-[#657386]">
            Le modèle doit être choisi selon vos volumes, vos fournisseurs,
            votre besoin de personnalisation et l&apos;expérience que vous
            souhaitez offrir à vos clients.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {models.map((model, index) => (
            <div
              key={model.title}
              className={`rounded-[30px] border p-8 sm:p-10 ${
                index === 1
                  ? "border-[#176BFF] bg-[#071B33] text-white"
                  : "border-[#E5EAF1] bg-[#F9FBFD] text-[#071B33]"
              }`}
            >
              <div
                className={`text-xs font-black uppercase tracking-[0.18em] ${
                  index === 1 ? "text-[#79A9FF]" : "text-[#176BFF]"
                }`}
              >
                {model.badge}
              </div>

              <h3 className="mt-8 text-3xl font-extrabold tracking-[-0.04em]">
                {model.title}
              </h3>

              <p
                className={`mt-5 max-w-[560px] text-sm leading-7 ${
                  index === 1 ? "text-white/60" : "text-[#657386]"
                }`}
              >
                {model.description}
              </p>

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {model.points.map((point) => (
                  <div
                    key={point}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-semibold ${
                      index === 1
                        ? "bg-white/[0.05] text-white/80"
                        : "bg-white text-[#52647B]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                        index === 1
                          ? "bg-[#176BFF]/20 text-[#8CB8FF]"
                          : "bg-[#EAF2FF] text-[#176BFF]"
                      }`}
                    >
                      ✓
                    </span>

                    {point}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}