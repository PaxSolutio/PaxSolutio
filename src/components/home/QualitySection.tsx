import Image from "next/image";
import Link from "next/link";

const controls = [
  {
    number: "01",
    title: "Vérification fournisseur",
    description:
      "Vérification du profil du fournisseur et des informations disponibles avant engagement.",
  },
  {
    number: "02",
    title: "Audit usine",
    description:
      "Évaluation sur site des capacités, de l'organisation et des conditions de production.",
  },
  {
    number: "03",
    title: "Suivi de production",
    description:
      "Contrôle pendant la fabrication afin d'identifier certains écarts avant la fin de production.",
  },
  {
    number: "04",
    title: "Avant expédition",
    description:
      "Inspection des marchandises selon les critères définis avant validation du départ.",
  },
];

const reportItems = ["Photos", "Quantités", "Finitions", "Packaging"];

export default function QualitySection() {
  return (
    <section className="bg-white py-14 lg:py-16 xl:py-24">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        {/* INTRO */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Contrôle qualité en Chine
            </div>

            <h2 className="max-w-[760px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Vérifiez avant que la marchandise
              <span className="text-[#176BFF]"> ne quitte la Chine.</span>
            </h2>
          </div>

          <div className="lg:pb-1">
            <p className="max-w-[520px] text-base leading-8 text-[#657386]">
              Les inspections permettent d&apos;identifier certains écarts et
              de disposer d&apos;éléments concrets avant de valider
              l&apos;expédition de votre commande.
            </p>

            <Link
              href="/controle-qualite"
              className="mt-6 inline-flex items-center text-sm font-extrabold !text-[#071B33] transition hover:text-[#176BFF]"
            >
              Découvrir le contrôle qualité
              <span className="ml-3">→</span>
            </Link>
          </div>
        </div>

        {/* VISUEL + CONTROLES */}
        <div className="mt-14 overflow-hidden rounded-[32px] border border-[#E5EAF1] bg-[#F6F8FB]">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* PHOTO TERRAIN */}
            <div className="group relative min-h-[420px] overflow-hidden lg:min-h-[620px]">
              <Image
                src="/quality/controle-usine.jpg"
                alt="Production de minipelles observée sur site en Chine"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#071B33]/70 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 p-7 sm:p-9">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#071B33]/70 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-[#176BFF]" />
                  Présence terrain en Chine
                </div>

                <p className="mt-4 max-w-[430px] text-sm leading-6 text-white/80">
                  Visites fournisseurs, suivi de production et vérifications
                  directement sur site selon les besoins du projet.
                </p>
              </div>
            </div>

            {/* CONTROLES */}
            <div className="flex flex-col justify-between p-7 sm:p-9 lg:p-10">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                  Contrôle sur site
                </div>

                <h3 className="mt-4 max-w-[420px] text-3xl font-extrabold tracking-[-0.04em] text-[#071B33]">
                  Des contrôles à chaque étape clé.
                </h3>

                <div className="mt-8 divide-y divide-[#DDE4ED]">
                  {controls.map((control) => (
                    <div
                      key={control.number}
                      className="group/item grid grid-cols-[44px_1fr] gap-3 py-5 first:pt-0"
                    >
                      <span className="pt-1 text-xs font-black tracking-[0.14em] text-[#176BFF]">
                        {control.number}
                      </span>

                      <div>
                        <h4 className="text-base font-extrabold text-[#071B33] transition group-hover/item:text-[#176BFF]">
                          {control.title}
                        </h4>

                        <p className="mt-1.5 max-w-[420px] text-sm leading-6 text-[#657386]">
                          {control.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-[#DDE4ED] pt-6">
                <div className="text-sm font-extrabold text-[#071B33]">
                  Éléments de contrôle
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {reportItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#DDE4ED] bg-white px-4 py-2 text-xs font-bold text-[#526174]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PROCESS */}
          <div className="border-t border-[#E5EAF1] bg-white px-7 py-6 sm:px-10">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#7A8797] sm:gap-x-6">
              <span>Fournisseur</span>
              <span className="text-[#176BFF]">→</span>
              <span>Production</span>
              <span className="text-[#176BFF]">→</span>
              <span>Contrôle</span>
              <span className="text-[#176BFF]">→</span>
              <span>Validation</span>
              <span className="text-[#176BFF]">→</span>
              <span>Expédition</span>
            </div>
          </div>
        </div>

        {/* RAPPORT */}
        <div className="mt-5 grid gap-5 rounded-[24px] bg-[#071B33] px-7 py-7 text-white sm:px-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-lg font-extrabold">
              Rapport de contrôle documenté
            </div>

            <p className="mt-2 max-w-[760px] text-sm leading-7 text-white/60">
              Photos, observations, quantités contrôlées et écarts identifiés
              peuvent être regroupés afin de faciliter votre décision avant
              expédition.
            </p>
          </div>

          <Link
            href="/controle-qualite"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-extrabold !text-[#071B33] transition hover:-translate-y-0.5"
          >
            En savoir plus
            <span className="ml-3">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}