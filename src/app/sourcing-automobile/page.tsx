import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import AutomotiveHero from "@/components/automotive/AutomotiveHero";
import AutomotiveOptions from "@/components/automotive/AutomotiveOptions";
import AutomotiveProcess from "@/components/automotive/AutomotiveProcess";
import AutomotiveLogistics from "@/components/automotive/AutomotiveLogistics";
import VehicleRequestForm from "@/components/automotive/VehicleRequestForm";

import ServiceBenefits from "@/components/services/ServiceBenefits";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Sourcing Automobile Chine & Import de Véhicules",
  description:
    "PaxSolutio accompagne les professionnels dans le sourcing automobile en Chine : recherche de véhicules, vérification, négociation, export et logistique internationale.",

  alternates: {
    canonical: "/sourcing-automobile",
  },

  openGraph: {
    title: "Sourcing Automobile Chine & Import de Véhicules | PaxSolutio",
    description:
      "Recherche de véhicules en Chine, vérification, négociation, organisation de l'export et transport international vers votre marché.",
    url: "/sourcing-automobile",
  },
};

const benefits = [
  {
    number: "01",
    title: "Rechercher le bon véhicule",
    description:
      "La recherche est structurée selon le modèle, la version, l'année, la motorisation, la quantité, le budget et le marché de destination.",
  },
  {
    number: "02",
    title: "Vérifier avant de valider",
    description:
      "Les informations disponibles sur le véhicule, le vendeur, les conditions de vente et les éléments nécessaires à l'export sont étudiés avant décision.",
  },
  {
    number: "03",
    title: "Coordonner l'export et le transport",
    description:
      "Le sourcing automobile peut être relié directement à l'organisation de l'export et du transport international vers le marché cible.",
  },
];

export default function AutomotivePage() {
  return (
    <main>
      <Header />

      <AutomotiveHero />

      <ServiceBenefits
        title="Importer un véhicule depuis la Chine ne se résume pas à son prix d'achat."
        intro="Le modèle, la version, la disponibilité, l'état du véhicule, les conditions de vente, les documents disponibles, le mode d'export et le transport doivent être étudiés ensemble avant de valider une opération."
        benefits={benefits}
      />

      <AutomotiveOptions />

      <AutomotiveProcess />

      <AutomotiveLogistics />

      <VehicleRequestForm />

      <ServiceCTA
        title="Vous recherchez un véhicule en Chine ou vous avez déjà reçu une offre ?"
        description="Envoyez-nous le modèle, la version, l'année, les photos ou l'annonce disponible, votre budget, la quantité et le pays de destination afin d'étudier votre projet."
        buttonLabel="Présenter mon projet automobile"
        href="#vehicle-request"
      />

      <Footer />
    </main>
  );
}