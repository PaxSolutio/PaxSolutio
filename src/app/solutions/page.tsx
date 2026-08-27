import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import SolutionsHero from "@/components/solutions/SolutionsHero";
import SolutionsGrid from "@/components/solutions/SolutionsGrid";
import IntegratedSolution from "@/components/solutions/IntegratedSolution";

import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Solutions | PaxSolutio",
  description:
    "Sourcing, fournisseurs, automobile, contrôle qualité, logistique et fulfillment international.",
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