import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import ResourcesHero from "@/components/resources/ResourcesHero";
import FeaturedResources from "@/components/resources/FeaturedResources";
import ResourcesGrid from "@/components/resources/ResourcesGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Ressources Import & Sourcing | PaxSolutio",
  description:
    "Guides et ressources sur le sourcing, l'importation, la logistique, le contrôle qualité et l'automobile.",
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