import CredibilitySection from "@/components/home/CredibilitySection";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/hero";
import TrustBar from "@/components/home/trustbar";
import ValueProposition from "@/components/home/valueProposition";
import ServicesGrid from "@/components/home/servicesgrid";
import ProcessTimeline from "@/components/home/processtimeline";
import AutomotiveSection from "@/components/home/AutomotiveSection";
import LogisticsSection from "@/components/home/LogisticsSection";
import IndustriesSection from "@/components/home/IndustriesSection";
import SupplierNetwork from "@/components/home/SupplierNetwork";
import QualitySection from "@/components/home/QualitySection";
import ProjectForm from "@/components/home/ProjectForm";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main>
      <Header />

      <Hero />
      <TrustBar />
      <CredibilitySection />
      <ValueProposition />
      <ServicesGrid />
      <ProcessTimeline />
      <AutomotiveSection />
      <LogisticsSection />
      <IndustriesSection />
      <SupplierNetwork />
      <QualitySection />
      <ProjectForm />
      <FinalCTA />

      <Footer />
    </main>
  );
}