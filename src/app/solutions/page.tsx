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
    "Découvrez les solutions PaxSolutio pour le sourcing en Chine, la recherche fournisseurs, le développement produit, le contrôle qualité, l'automobile, la logistique et le fulfillment.",

  alternates: {
    canonical: "/solutions",
  },

  openGraph: {
    title: "Solutions Sourcing, Import & Supply Chain | PaxSolutio",
    description:
      "Recherche fournisseurs, sourcing, contrôle qualité, automobile, développement produit, logistique et fulfillment pour vos projets d'import.",
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
        title="Vous ne savez pas encore quelle solution correspond à votre projet ?"
        description="Présentez-nous votre produit, votre objectif, votre marché ou les étapes déjà réalisées. Nous pourrons identifier les services utiles à votre opération sans vous imposer un parcours complet."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}