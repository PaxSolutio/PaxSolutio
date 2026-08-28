import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import ResourcesHero from "@/components/resources/ResourcesHero";
import FeaturedResources from "@/components/resources/FeaturedResources";
import ResourcesGrid from "@/components/resources/ResourcesGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Guides Sourcing Chine, Import & Logistique",
  description:
    "Guides et ressources PaxSolutio sur le sourcing en Chine, la recherche fournisseurs, les Incoterms, les coûts d'importation, le contrôle qualité et la logistique.",

  alternates: {
    canonical: "/ressources",
  },

  openGraph: {
    title: "Guides Sourcing Chine, Import & Logistique | PaxSolutio",
    description:
      "Guides pratiques sur le sourcing en Chine, les fournisseurs, l'importation, les Incoterms, le contrôle qualité et la logistique internationale.",
    url: "/ressources",
  },
};

export default function ResourcesPage() {
  return (
    <main>
      <Header />

      <ResourcesHero />

      <FeaturedResources />

      <ResourcesGrid />

      <ServiceCTA
        title="Vous avez une question liée à votre propre projet ?"
        description="Les guides apportent une première compréhension, mais chaque opération d'import possède ses propres contraintes."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}