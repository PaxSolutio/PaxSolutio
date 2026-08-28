import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import IndustriesHero from "@/components/industries/IndustriesHero";
import IndustriesGrid from "@/components/industries/IndustriesGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Sourcing par Secteur & Solutions d'Import",
  description:
    "PaxSolutio accompagne les entreprises dans leurs projets de sourcing et d'importation dans différents secteurs : industrie, automobile, mobilier, e-commerce et équipements.",

  alternates: {
    canonical: "/secteurs",
  },

  openGraph: {
    title: "Sourcing par Secteur & Solutions d'Import | PaxSolutio",
    description:
      "Découvrez les secteurs accompagnés par PaxSolutio pour le sourcing, la recherche fournisseurs, le contrôle qualité et la logistique internationale.",
    url: "/secteurs",
  },
};

export default function IndustriesPage() {
  return (
    <main>
      <Header />

      <IndustriesHero />

      <IndustriesGrid />

      <ServiceCTA
        title="Votre secteur n'apparaît pas dans cette liste ?"
        description="Présentez-nous votre produit et votre besoin. Nos solutions de sourcing ne sont pas limitées aux secteurs présentés ici."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}