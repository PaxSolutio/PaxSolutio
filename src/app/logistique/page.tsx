import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import LogisticsHero from "@/components/logistics/LogisticsHero";
import FreightModes from "@/components/logistics/FreightModes";
import LogisticsServices from "@/components/logistics/LogisticsServices";
import OBFSection from "@/components/logistics/OBFSection";
import FreightRequestForm from "@/components/logistics/FreightRequestForm";

import ServiceBenefits from "@/components/services/ServiceBenefits";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Logistique Chine-France & Transport International",
  description:
    "PaxSolutio accompagne les entreprises dans leur logistique Chine-France et internationale : fret maritime, aérien, ferroviaire et routier, consolidation et acheminement.",

  alternates: {
    canonical: "/logistique",
  },

  openGraph: {
    title: "Logistique Chine-France & Transport International | PaxSolutio",
    description:
      "Solutions de transport international depuis la Chine : fret maritime, aérien, ferroviaire et routier, consolidation et coordination logistique.",
    url: "/logistique",
  },
};

const benefits = [
  {
    number: "01",
    title: "Choisir le bon mode de transport",
    description:
      "Fret maritime, aérien, ferroviaire ou routier : la solution est étudiée selon la nature de la marchandise, le volume, le budget et le délai recherché.",
  },
  {
    number: "02",
    title: "Coordonner toute la chaîne logistique",
    description:
      "Collecte chez le fournisseur, consolidation, préparation du transport et acheminement international peuvent être organisés dans un même parcours.",
  },
  {
    number: "03",
    title: "Connecter sourcing et transport",
    description:
      "PaxSolutio peut relier directement le sourcing, le contrôle qualité et l'organisation logistique afin de limiter les ruptures entre chaque étape.",
  },
];

export default function LogisticsPage() {
  return (
    <main>
      <Header />

      <LogisticsHero />

      <ServiceBenefits
        title="Une bonne logistique Chine-France doit équilibrer coût, délai et fiabilité."
        intro="Le transport international ne se résume pas au prix du fret. Le volume, le type de marchandise, la destination, le délai, la consolidation et les contraintes d'importation doivent être pris en compte avant de choisir une solution."
        benefits={benefits}
      />

      <FreightModes />

      <LogisticsServices />

      <OBFSection />

      <FreightRequestForm />

      <ServiceCTA
        title="Votre marchandise est prête à être expédiée depuis la Chine ?"
        description="Transmettez-nous le lieu de départ, la destination, le type de marchandise, le poids, le volume et le délai souhaité afin d'étudier une solution de transport adaptée."
        buttonLabel="Demander un devis transport"
        href="#freight-request"
      />

      <Footer />
    </main>
  );
}