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
    title: "Détecter les écarts avant expédition",
    description:
      "Une inspection réalisée avant l'envoi permet d'identifier certains défauts, différences ou non-conformités tant qu'une action corrective reste encore possible.",
  },
  {
    number: "02",
    title: "Décider avec des éléments concrets",
    description:
      "Photos, observations, quantités contrôlées et résultats d'inspection permettent d'évaluer plus précisément l'état de la commande avant validation.",
  },
  {
    number: "03",
    title: "Adapter le contrôle à votre produit",
    description:
      "Les points de contrôle peuvent être définis selon votre cahier des charges, votre produit, votre marché et les principaux risques identifiés.",
  },
];

export default function QualityControlPage() {
  return (
    <main>
      <Header />

      <QualityHero />

      <ServiceBenefits
        title="Le contrôle qualité en Chine permet d'agir avant l'expédition."
        intro="Une inspection ne supprime pas tous les risques liés à une production, mais elle permet de vérifier des critères définis avant que la marchandise ne quitte le fournisseur et de prendre une décision avec davantage d'informations."
        benefits={benefits}
      />

      <QualityServices />

      <QualityProcess />

      <InspectionReport />

      <InspectionRequestForm />

      <ServiceCTA
        title="Vous souhaitez contrôler une production avant son expédition ?"
        description="Transmettez-nous les informations sur votre produit, votre fournisseur, votre commande et les critères à vérifier afin d'étudier l'organisation d'une inspection en Chine."
        buttonLabel="Planifier une inspection"
        href="#inspection-request"
      />

      <Footer />
    </main>
  );
}