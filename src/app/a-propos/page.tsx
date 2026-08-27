import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import AboutHero from "@/components/about/AboutHero";
import AboutMission from "@/components/about/AboutMission";
import PaxObf from "@/components/about/PaxObf";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "À propos | PaxSolutio",
  description:
    "Découvrez PaxSolutio et son approche intégrée du sourcing, du contrôle qualité et de la logistique internationale.",
};

export default function AboutPage() {
  return (
    <main>
      <Header />

      <AboutHero />
      <AboutMission />
      <PaxObf />

      <ServiceCTA
        title="Vous souhaitez nous présenter un projet ?"
        description="Expliquez-nous votre besoin et les différentes étapes déjà engagées."
        buttonLabel="Démarrer un projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}