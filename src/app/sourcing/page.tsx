import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import ServiceHero from "@/components/services/ServiceHero";
import ServiceBenefits from "@/components/services/ServiceBenefits";
import ServiceProcess from "@/components/services/ServiceProcess";
import ServiceOfferGrid from "@/components/services/ServiceOfferGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Sourcing International | PaxSolutio",
  description:
    "Recherche de fournisseurs, négociation, vérification et accompagnement sourcing pour vos projets d'import internationaux.",
};

const benefits = [
  {
    number: "01",
    title: "Réduire les incertitudes",
    description:
      "Nous structurons la recherche fournisseur selon des critères précis : produit, qualité attendue, volumes, budget et destination.",
  },
  {
    number: "02",
    title: "Comparer réellement",
    description:
      "Prix, MOQ, délais, capacités et conditions peuvent être comparés avant de sélectionner un partenaire.",
  },
  {
    number: "03",
    title: "Centraliser votre projet",
    description:
      "Le sourcing peut être connecté au contrôle qualité et à la logistique afin d'éviter de multiplier les intermédiaires.",
  },
];

const process = [
  {
    number: "01",
    title: "Définition du besoin",
    description:
      "Nous analysons votre produit, vos quantités, votre marché, votre budget et vos contraintes.",
  },
  {
    number: "02",
    title: "Recherche fournisseurs",
    description:
      "Identification de fabricants ou partenaires susceptibles de correspondre au cahier des charges.",
  },
  {
    number: "03",
    title: "Qualification",
    description:
      "Analyse des informations disponibles, échanges avec les fournisseurs et comparaison des propositions.",
  },
  {
    number: "04",
    title: "Négociation",
    description:
      "Discussion des prix, MOQ, packaging, délais, personnalisation et conditions commerciales.",
  },
  {
    number: "05",
    title: "Échantillon & validation",
    description:
      "Lorsque nécessaire, un échantillon peut être organisé avant validation de la commande.",
  },
  {
    number: "06",
    title: "Production & expédition",
    description:
      "Le projet peut ensuite être accompagné jusqu'au contrôle qualité et à la logistique internationale.",
  },
];

const offers = [
  {
    title: "Recherche fabricant",
    description:
      "Identification de fournisseurs adaptés au produit et aux critères du projet.",
  },
  {
    title: "Comparatif fournisseurs",
    description:
      "Analyse structurée des différentes propositions obtenues.",
  },
  {
    title: "Négociation commerciale",
    description:
      "Prix, quantités, conditions, délais et modalités de production.",
  },
  {
    title: "Échantillonnage",
    description:
      "Organisation d'échantillons lorsqu'une validation physique est nécessaire.",
  },
  {
    title: "Private Label",
    description:
      "Étude des possibilités de personnalisation, packaging et identité de marque.",
  },
  {
    title: "Développement produit",
    description:
      "Accompagnement lorsqu'un produit nécessite des modifications ou spécifications particulières.",
  },
  {
    title: "Supplier Verification",
    description:
      "Vérification complémentaire du fournisseur avant engagement lorsque nécessaire.",
  },
  {
    title: "Contrôle qualité",
    description:
      "Inspection potentielle de la marchandise avant son expédition.",
  },
  {
    title: "Logistique",
    description:
      "Coordination du transport avec la solution adaptée au volume et à la destination.",
  },
];

export default function SourcingPage() {
  return (
    <main>
      <Header />

      <ServiceHero
        eyebrow="Sourcing International"
        title="Trouvez les bons fournisseurs."
        highlightedText="Construisez une meilleure supply chain."
        description="PaxSolutio accompagne les entreprises dans l'identification, la qualification et la négociation avec des fournisseurs adaptés à leurs projets d'importation."
        primaryCta="Lancer un sourcing"
        primaryHref="/#project"
        secondaryCta="Découvrir notre méthode"
        secondaryHref="#process"
      />

      <ServiceBenefits
        title="Le sourcing ne consiste pas simplement à trouver un prix."
        intro="Le bon fournisseur doit être compatible avec votre produit, votre marché, vos exigences qualité et votre modèle économique."
        benefits={benefits}
      />

      <div id="process">
        <ServiceProcess
          eyebrow="Notre méthode"
          title="De votre cahier des charges au fournisseur sélectionné."
          description="Chaque mission est structurée afin de comparer les options avant de prendre une décision."
          steps={process}
        />
      </div>

      <ServiceOfferGrid
        eyebrow="Services sourcing"
        title="Une mission adaptée au niveau d'accompagnement dont vous avez besoin."
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