import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Vérification fournisseur",
    description:
      "Vérification des informations disponibles sur l'entreprise et le profil du fournisseur.",
  },
  {
    number: "02",
    title: "Audit usine",
    description:
      "Évaluation sur site des capacités, de l'organisation et des conditions de production.",
  },
  {
    number: "03",
    title: "Contrôle en production",
    description:
      "Inspection pendant la fabrication afin d'identifier certains écarts avant la fin de production.",
  },
  {
    number: "04",
    title: "Inspection avant expédition",
    description:
      "Contrôle des marchandises avant leur départ selon les critères définis pour la commande.",
  },
];

export default function QualitySection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-12">
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Contrôle qualité en Chine
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Vérifiez avant
              <span className="text-[#176BFF]">
                {" "}
                que la marchandise ne quitte la Chine.
              </span>
            </h2>

            <p className="mt-6 max-w-[520px] text-lg leading-8 text-[#657386]">
              Les inspections permettent d&apos;identifier certains écarts et
              de disposer d&apos;éléments concrets avant de valider
              l&apos;expédition de votre commande.
            </p>

            <Link
              href="/controle-qualite"
              className="mt-9 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#071B33] px-7 text-sm font-extrabold !text-white transition hover:-translate-y-0.5"
            >
              Découvrir le contrôle qualité
              <span className="ml-3">→</span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.number}
                className="min-h-[280px] rounded-[28px] border border-[#E5EAF1] bg-[#FBFCFE] p-8"
              >
                <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {service.number}
                </span>

                <h3 className="mt-16 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                  {service.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-[28px] bg-[#071B33] px-7 py-8 text-white sm:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-lg font-extrabold">
                Rapport de contrôle documenté
              </div>

              <p className="mt-2 max-w-[760px] text-sm leading-7 text-white/60">
                Photos, observations, quantités contrôlées et écarts identifiés
                peuvent être regroupés dans un rapport afin de faciliter votre
                décision avant expédition.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "Photos",
                "Quantités",
                "Packaging",
                "Anomalies",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}