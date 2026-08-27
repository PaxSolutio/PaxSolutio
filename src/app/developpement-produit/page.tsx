import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Développement produit | PaxSolutio",
  description:
    "Développement produit, OEM, ODM, personnalisation et accompagnement fournisseur avec PaxSolutio.",
};

export default function ProductDevelopmentPage() {
  return (
    <main>
      <Header />

      <section className="bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="max-w-[900px]">
            <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Product Development
            </div>

            <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
              Du produit existant
              <span className="text-[#176BFF]">
                {" "}
                à votre propre version.
              </span>
            </h1>

            <p className="mt-7 max-w-[760px] text-lg leading-8 text-[#657386] lg:text-xl">
              PaxSolutio vous accompagne dans la recherche du fabricant,
              l&apos;adaptation du produit, la personnalisation, le packaging
              et les échanges nécessaires au développement de votre projet.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["OEM", "Production selon vos spécifications."],
              ["ODM", "Adaptation de modèles existants."],
              ["Private Label", "Branding, packaging et personnalisation."],
              ["Échantillons", "Validation avant production."],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-[26px] border border-[#E2E8F0] bg-[#F8FAFC] p-7"
              >
                <h2 className="text-xl font-extrabold text-[#071B33]">
                  {title}
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceCTA
        title="Vous avez un produit à développer ou personnaliser ?"
        description="Présentez-nous votre idée, votre référence ou votre cahier des charges."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}