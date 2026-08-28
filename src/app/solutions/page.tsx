import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import SolutionsHero from "@/components/solutions/SolutionsHero";
import SolutionsGrid from "@/components/solutions/SolutionsGrid";
import IntegratedSolution from "@/components/solutions/IntegratedSolution";

import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Solutions Sourcing, Import & Supply Chain",
  description:
    "Découvrez les solutions PaxSolutio pour le sourcing international, la recherche fournisseurs, l'automobile, le contrôle qualité, la logistique et le fulfillment.",

  alternates: {
    canonical: "/solutions",
  },

  openGraph: {
    title: "Solutions Sourcing, Import & Supply Chain | PaxSolutio",
    description:
      "Une offre intégrée pour accompagner vos projets de sourcing, importation, contrôle qualité, logistique et e-commerce.",
    url: "/solutions",
  },
};

export default function SolutionsPage() {
  return (
    <main>
      <Header />

      <SolutionsHero />

      <SolutionsGrid />

      <IntegratedSolution />

      <ServiceCTA
        title="Vous ne savez pas exactement quels services votre projet nécessite ?"
        description="Présentez-nous simplement votre objectif. Nous pourrons identifier les différentes étapes nécessaires à votre opération."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}