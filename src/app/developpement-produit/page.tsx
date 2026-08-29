import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Développement Produit en Chine | OEM, ODM & Private Label",
  description:
    "PaxSolutio accompagne les entreprises dans le développement de produits en Chine : OEM, ODM, Private Label, personnalisation, packaging, échantillons et recherche fabricant.",

  alternates: {
    canonical: "/developpement-produit",
  },

  openGraph: {
    title:
      "Développement Produit en Chine | OEM, ODM & Private Label | PaxSolutio",
    description:
      "Développement et personnalisation de produits en Chine : OEM, ODM, Private Label, packaging, échantillons et accompagnement fabricant.",
    url: "/developpement-produit",
  },
};

const developmentOptions = [
  {
    title: "OEM",
    description:
      "Développement ou fabrication selon votre cahier des charges, vos spécifications techniques et vos exigences produit.",
  },
  {
    title: "ODM",
    description:
      "Adaptation d'un produit ou d'un modèle existant afin de créer une version correspondant à votre marque et à votre marché.",
  },
  {
    title: "Private Label",
    description:
      "Personnalisation du produit avec votre marque : logo, couleurs, packaging, accessoires et éléments de présentation.",
  },
  {
    title: "Échantillonnage",
    description:
      "Organisation et suivi d'échantillons afin de vérifier les principaux éléments du produit avant le lancement de la production.",
  },
];

const process = [
  {
    number: "01",
    title: "Définition du produit",
    description:
      "Analyse de votre idée, de votre référence, de vos fonctionnalités, de votre marché cible, de vos volumes et de votre budget.",
  },
  {
    number: "02",
    title: "Recherche du fabricant",
    description:
      "Identification de fabricants capables de produire ou d'adapter le produit selon les caractéristiques demandées.",
  },
  {
    number: "03",
    title: "Spécifications & personnalisation",
    description:
      "Échanges sur les dimensions, matériaux, couleurs, branding, packaging, accessoires et modifications souhaitées.",
  },
  {
    number: "04",
    title: "Échantillon",
    description:
      "Organisation d'un prototype ou d'un échantillon lorsque le projet le nécessite avant le lancement de la production.",
  },
  {
    number: "05",
    title: "Validation",
    description:
      "Vérification des principaux éléments du produit et ajustements éventuels avant validation commerciale ou technique.",
  },
  {
    number: "06",
    title: "Production & contrôle",
    description:
      "Après validation, le projet peut être accompagné jusqu'à la production, au contrôle qualité et à l'organisation de l'expédition.",
  },
];

export default function ProductDevelopmentPage() {
  return (
    <main>
      <Header />

      <section className="bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="max-w-[900px]">
            <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Développement produit en Chine
            </div>

            <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
              Développez et personnalisez votre produit
              <span className="text-[#176BFF]">
                {" "}
                avec un fabricant en Chine.
              </span>
            </h1>

            <p className="mt-7 max-w-[760px] text-lg leading-8 text-[#657386] lg:text-xl">
              PaxSolutio accompagne les entreprises dans la recherche du
              fabricant, le développement OEM ou ODM, la personnalisation,
              le private label, le packaging et la validation
              d&apos;échantillons avant production.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {developmentOptions.map((option) => (
              <div
                key={option.title}
                className="rounded-[26px] border border-[#E2E8F0] bg-[#F8FAFC] p-7"
              >
                <h2 className="text-xl font-extrabold text-[#071B33]">
                  {option.title}
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F6F8FB] py-24 lg:py-32">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="max-w-[820px]">
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Notre méthode
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              De l&apos;idée
              <span className="text-[#176BFF]">
                {" "}
                à un produit prêt à être fabriqué.
              </span>
            </h2>

            <p className="mt-6 max-w-[720px] text-lg leading-8 text-[#657386]">
              Le développement d&apos;un produit nécessite de structurer les
              spécifications, identifier le bon fabricant, valider les choix
              techniques et commerciaux puis contrôler les étapes avant
              production.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {process.map((step) => (
              <div
                key={step.number}
                className="min-h-[270px] rounded-[26px] border border-[#E2E8F0] bg-white p-7"
              >
                <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {step.number}
                </span>

                <h3 className="mt-12 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceCTA
        title="Vous avez un produit à développer ou à personnaliser ?"
        description="Envoyez-nous votre idée, vos photos, vos références, votre cahier des charges, les quantités envisagées et les éléments de personnalisation souhaités afin d'étudier votre projet."
        buttonLabel="Présenter mon projet produit"
        href="/#project"
      />

      <Footer />
    </main>
  );
}