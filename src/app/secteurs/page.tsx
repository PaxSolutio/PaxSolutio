import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import IndustriesHero from "@/components/industries/IndustriesHero";
import IndustriesGrid from "@/components/industries/IndustriesGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Secteurs & Industries | PaxSolutio",
  description:
    "Solutions de sourcing, contrôle et logistique adaptées à différents secteurs d'activité.",
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