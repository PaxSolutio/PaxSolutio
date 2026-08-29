import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import ServiceHero from "@/components/services/ServiceHero";
import ServiceBenefits from "@/components/services/ServiceBenefits";
import ServiceProcess from "@/components/services/ServiceProcess";
import ServiceOfferGrid from "@/components/services/ServiceOfferGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Sourcing Chine & Recherche Fournisseurs",
  description:
    "PaxSolutio accompagne les entreprises dans le sourcing en Chine : recherche et qualification de fournisseurs, négociation, échantillonnage, contrôle qualité et logistique.",

  alternates: {
    canonical: "/sourcing",
  },

  openGraph: {
    title: "Sourcing Chine & Recherche Fournisseurs | PaxSolutio",
    description:
      "Recherche de fabricants, qualification fournisseurs, négociation, contrôle qualité et accompagnement import depuis la Chine.",
    url: "/sourcing",
  },
};

const benefits = [
  {
    number: "01",
    title: "Réduire les risques fournisseurs",
    description:
      "La recherche est structurée selon votre produit, vos volumes, votre budget, vos exigences qualité et votre marché afin d'éviter une sélection basée uniquement sur le prix.",
  },
  {
    number: "02",
    title: "Comparer les fabricants",
    description:
      "Prix, MOQ, délais de production, capacités, personnalisation, packaging et conditions commerciales peuvent être comparés avant de sélectionner un fournisseur.",
  },
  {
    number: "03",
    title: "Centraliser votre importation",
    description:
      "Le sourcing peut être connecté à la vérification fournisseur, au contrôle qualité et à la logistique internationale afin de limiter les intermédiaires.",
  },
];

const process = [
  {
    number: "01",
    title: "Définition du cahier des charges",
    description:
      "Nous analysons le produit recherché, les caractéristiques techniques, les quantités, le budget, le marché de destination et les contraintes du projet.",
  },
  {
    number: "02",
    title: "Recherche de fabricants en Chine",
    description:
      "Identification de fabricants et fournisseurs susceptibles de répondre au cahier des charges grâce à notre réseau et aux différentes sources disponibles.",
  },
  {
    number: "03",
    title: "Qualification des fournisseurs",
    description:
      "Analyse des informations disponibles, des capacités de production, des MOQ, des délais et des conditions proposées par les fournisseurs sélectionnés.",
  },
  {
    number: "04",
    title: "Comparaison & négociation",
    description:
      "Comparaison des offres et négociation des prix, quantités minimales, délais, packaging, personnalisation et conditions commerciales.",
  },
  {
    number: "05",
    title: "Échantillon & validation",
    description:
      "Lorsque le projet le nécessite, des échantillons peuvent être organisés afin de vérifier le produit avant le lancement de la production.",
  },
  {
    number: "06",
    title: "Production, contrôle & expédition",
    description:
      "Après validation, le projet peut être suivi jusqu'à la production, au contrôle qualité et à l'organisation du transport international.",
  },
];

const offers = [
  {
    title: "Recherche de fabricants",
    description:
      "Identification de fabricants et fournisseurs en Chine selon votre produit, vos volumes et vos critères.",
  },
  {
    title: "Comparatif fournisseurs",
    description:
      "Comparaison des prix, MOQ, délais, capacités de production et conditions commerciales.",
  },
  {
    title: "Négociation fournisseur",
    description:
      "Négociation des tarifs, quantités, délais, packaging, personnalisation et modalités de commande.",
  },
  {
    title: "Échantillonnage",
    description:
      "Organisation et suivi d'échantillons afin de valider le produit avant la production.",
  },
  {
    title: "Private Label",
    description:
      "Recherche de solutions pour votre marque : logo, packaging, couleurs, accessoires et personnalisation.",
  },
  {
    title: "Développement produit",
    description:
      "Accompagnement OEM et ODM lorsqu'un produit nécessite des modifications ou un cahier des charges spécifique.",
  },
  {
    title: "Vérification fournisseur",
    description:
      "Vérification complémentaire du fabricant ou du fournisseur avant engagement et lancement de commande.",
  },
  {
    title: "Contrôle qualité",
    description:
      "Organisation possible d'une inspection de la marchandise avant son expédition.",
  },
  {
    title: "Logistique internationale",
    description:
      "Coordination du transport maritime, aérien, ferroviaire ou routier selon le volume et la destination.",
  },
];

export default function SourcingPage() {
  return (
    <main>
      <Header />

      <ServiceHero
        eyebrow="Sourcing en Chine"
        title="Sourcing en Chine : trouvez les bons fournisseurs."
        highlightedText="Construisez une supply chain plus fiable."
        description="PaxSolutio accompagne les entreprises dans la recherche, la qualification et la négociation avec des fabricants et fournisseurs en Chine, jusqu'au contrôle qualité et à l'organisation de l'importation."
        primaryCta="Lancer un sourcing"
        primaryHref="/#project"
        secondaryCta="Découvrir notre méthode"
        secondaryHref="#process"
      />

      <ServiceBenefits
        title="Le sourcing en Chine ne consiste pas simplement à trouver le prix le plus bas."
        intro="Un bon fournisseur doit être compatible avec votre produit, vos volumes, votre marché, vos exigences qualité, vos délais et votre modèle économique. PaxSolutio structure la recherche afin de comparer les fabricants sur des critères concrets avant toute décision."
        benefits={benefits}
      />

      <div id="process">
        <ServiceProcess
          eyebrow="Notre méthode de sourcing"
          title="Du cahier des charges au fournisseur sélectionné."
          description="Notre processus de sourcing en Chine permet de structurer la recherche, comparer les fabricants et sécuriser les principales étapes avant la production et l'expédition."
          steps={process}
        />
      </div>

      <ServiceOfferGrid
        eyebrow="Services de sourcing"
        title="Un accompagnement adapté à chaque étape de votre projet d'importation."
        offers={offers}
      />

      <ServiceCTA
        title="Vous avez déjà un produit ou une idée précise ?"
        description="Envoyez-nous les informations disponibles : photos, liens, quantités, budget, spécifications ou cahier des charges."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}