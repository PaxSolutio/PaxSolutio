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
  title: "Dropshipping Chine & Fulfillment E-commerce",
  description:
    "PaxSolutio accompagne les e-commerçants dans le dropshipping depuis la Chine : sourcing produit, stockage, préparation de commandes, packaging et expédition internationale.",

  alternates: {
    canonical: "/dropshipping",
  },

  openGraph: {
    title: "Dropshipping Chine & Fulfillment E-commerce | PaxSolutio",
    description:
      "Sourcing, stockage, préparation de commandes et expédition internationale pour vos activités e-commerce depuis la Chine.",
    url: "/dropshipping",
  },
};

const benefits = [
  {
    number: "01",
    title: "Centraliser sourcing et fulfillment",
    description:
      "La recherche produit, le stockage, la préparation des commandes et l'expédition peuvent être organisés dans une même chaîne opérationnelle.",
  },
  {
    number: "02",
    title: "Maîtriser l'expérience client",
    description:
      "Contrôle du produit, packaging, préparation de commande et méthode d'expédition influencent directement la qualité de l'expérience après l'achat.",
  },
  {
    number: "03",
    title: "Adapter la logistique à votre croissance",
    description:
      "L'organisation peut évoluer avec votre catalogue, vos volumes de commandes, vos besoins de stockage et les différents marchés que vous développez.",
  },
];

export default function DropshippingPage() {
  return (
    <main>
      <Header />

      <DropshippingHero />

      <ServiceBenefits
        title="Le dropshipping depuis la Chine ne se résume pas à expédier un produit."
        intro="Derrière chaque commande se trouvent un fournisseur, un produit à contrôler, du stock à gérer, une préparation à effectuer et un transport à organiser. Structurer ces étapes permet de construire une activité e-commerce plus fiable."
        benefits={benefits}
      />

      <DropshippingModels />

      <FulfillmentProcess />

      <FulfillmentServices />

      <EcommerceIntegration />

      <DropshippingRequestForm />

      <ServiceCTA
        title="Vous avez déjà une boutique, un produit ou un fournisseur en Chine ?"
        description="Présentez-nous votre activité, vos produits, vos volumes de commandes, vos marchés de destination et votre organisation actuelle afin d'étudier une solution adaptée."
        buttonLabel="Étudier mon projet e-commerce"
        href="#dropshipping-request"
      />

      <Footer />
    </main>
  );
}