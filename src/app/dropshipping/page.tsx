import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import DropshippingHero from "@/components/dropshipping/DropshippingHero";
import DropshippingModels from "@/components/dropshipping/DropshippingModels";
import FulfillmentProcess from "@/components/dropshipping/FulfillmentProcess";
import FulfillmentServices from "@/components/dropshipping/FulfillmentServices";
import EcommerceIntegration from "@/components/dropshipping/EcommerceIntegration";
import DropshippingRequestForm from "@/components/dropshipping/DropshippingRequestForm";

import ServiceBenefits from "@/components/services/ServiceBenefits";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Dropshipping & Fulfillment | PaxSolutio",
  description:
    "Solutions de sourcing, stockage, préparation de commandes et expédition internationale pour les activités e-commerce.",
};

const benefits = [
  {
    number: "01",
    title: "Centraliser les opérations",
    description:
      "Sourcing, stockage, préparation et transport peuvent être pensés comme une seule chaîne.",
  },
  {
    number: "02",
    title: "Construire votre expérience client",
    description:
      "Packaging, préparation et mode d'expédition ont un impact direct sur l'expérience après l'achat.",
  },
  {
    number: "03",
    title: "Faire évoluer le modèle",
    description:
      "La solution peut évoluer avec vos références, vos volumes et les marchés que vous développez.",
  },
];

export default function DropshippingPage() {
  return (
    <main>
      <Header />

      <DropshippingHero />

      <ServiceBenefits
        title="Votre boutique n'est que la partie visible de votre e-commerce."
        intro="Derrière chaque commande se trouve une chaîne de fournisseurs, de stock, de préparation et de transport qu'il faut organiser."
        benefits={benefits}
      />

      <DropshippingModels />

      <FulfillmentProcess />

      <FulfillmentServices />

      <EcommerceIntegration />

      <DropshippingRequestForm />

      <ServiceCTA
        title="Vous avez déjà une boutique, un produit ou un fournisseur ?"
        description="Présentez-nous votre organisation actuelle et les volumes envisagés afin d'étudier les étapes à mettre en place."
        buttonLabel="Présenter mon projet"
        href="#dropshipping-request"
      />

      <Footer />
    </main>
  );
}