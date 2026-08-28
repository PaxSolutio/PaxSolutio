import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import QualityHero from "@/components/quality/QualityHero";
import QualityServices from "@/components/quality/QualityServices";
import QualityProcess from "@/components/quality/QualityProcess";
import InspectionReport from "@/components/quality/InspectionReport";
import InspectionRequestForm from "@/components/quality/InspectionRequestForm";

import ServiceBenefits from "@/components/services/ServiceBenefits";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Contrôle Qualité Chine & Audit Fournisseur",
  description:
    "PaxSolutio accompagne les entreprises dans le contrôle qualité en Chine : vérification fournisseur, audit usine, inspection avant expédition et rapport de contrôle.",

  alternates: {
    canonical: "/controle-qualite",
  },

  openGraph: {
    title: "Contrôle Qualité Chine & Audit Fournisseur | PaxSolutio",
    description:
      "Inspection qualité, vérification fournisseur et audit usine en Chine avant expédition de vos marchandises.",
    url: "/controle-qualite",
  },
};

const benefits = [
  {
    number: "01",
    title: "Vérifier plus tôt",
    description:
      "Contrôler certains éléments avant expédition permet d'identifier des écarts tant qu'une action reste encore possible.",
  },
  {
    number: "02",
    title: "Décider avec davantage d'informations",
    description:
      "Photos, observations et résultats de contrôle apportent une vision plus claire avant validation.",
  },
  {
    number: "03",
    title: "Adapter le contrôle",
    description:
      "L'inspection peut être structurée selon votre produit, vos exigences et les risques spécifiques à votre commande.",
  },
];

export default function QualityControlPage() {
  return (
    <main>
      <Header />

      <QualityHero />

      <ServiceBenefits
        title="La qualité se sécurise avant l'arrivée de la marchandise."
        intro="Le contrôle qualité ne supprime pas tous les risques, mais il permet de mieux comprendre l'état d'une commande avant son expédition."
        benefits={benefits}
      />

      <QualityServices />

      <QualityProcess />

      <InspectionReport />

      <InspectionRequestForm />

      <ServiceCTA
        title="Votre commande est presque prête à être expédiée ?"
        description="Transmettez-nous les informations disponibles sur le produit, le fournisseur et les points que vous souhaitez contrôler."
        buttonLabel="Planifier un contrôle"
        href="#inspection-request"
      />

      <Footer />
    </main>
  );
}