import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import IndustriesHero from "@/components/industries/IndustriesHero";
import IndustriesGrid from "@/components/industries/IndustriesGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Sourcing par Secteur en Chine & Solutions d'Import",
  description:
    "Découvrez les secteurs accompagnés par PaxSolutio pour le sourcing en Chine : automobile, machines, mobilier, beauté, électronique, textile, maison et e-commerce.",

  alternates: {
    canonical: "/secteurs",
  },

  openGraph: {
    title: "Sourcing par Secteur en Chine | PaxSolutio",
    description:
      "Automobile, machines, mobilier, beauté, électronique, textile, maison et e-commerce : découvrez nos solutions de sourcing et d'importation par secteur.",
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
        title="Votre produit ou votre secteur n'apparaît pas ici ?"
        description="Présentez-nous votre besoin. Notre réseau de fournisseurs et nos méthodes de sourcing ne se limitent pas aux secteurs présentés sur cette page."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}