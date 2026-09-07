import type { Metadata } from "next";
import CredibilitySection from "@/components/home/CredibilitySection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import FounderVideoSection from "@/components/home/FounderVideoSection";
import SectorShowcase from "@/components/home/SectorShowcase";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import LatestNewsSection from "@/components/home/LatestNewsSection";

import Hero from "@/components/home/hero";
import TrustBar from "@/components/home/trustbar";
import ValueProposition from "@/components/home/valueProposition";
import ServicesGrid from "@/components/home/servicesgrid";
import ProcessTimeline from "@/components/home/processtimeline";
import AutomotiveSection from "@/components/home/AutomotiveSection";
import LogisticsSection from "@/components/home/LogisticsSection";
import SupplierNetwork from "@/components/home/SupplierNetwork";
import QualitySection from "@/components/home/QualitySection";
import ProjectForm from "@/components/home/ProjectForm";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Sourcing Chine & Import International",
  description:
    "PaxSolutio accompagne les entreprises dans le sourcing en Chine : recherche de fournisseurs, négociation, contrôle qualité, import automobile et logistique internationale.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "PaxSolutio | Sourcing Chine & Import International",
    description:
      "Recherche de fournisseurs, contrôle qualité, sourcing automobile et logistique internationale depuis la Chine.",
    url: "/",
  },
};

export default function Home() {
  return (
    <main>
      <Header />

      <Hero />
      <TrustBar />
      <FounderVideoSection />
      <FeaturedOffersSection />
      <CredibilitySection />
      <LatestNewsSection />
      <SectorShowcase />
      <ValueProposition />
      <ServicesGrid />
      <ProcessTimeline />
      <AutomotiveSection />
      <LogisticsSection />
      <SupplierNetwork />
      <QualitySection />
      <ProjectForm />
      <FinalCTA />

      <Footer />
    </main>
  );
}