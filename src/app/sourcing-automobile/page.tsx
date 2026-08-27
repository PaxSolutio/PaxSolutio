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
  title: "Sourcing Automobile International | PaxSolutio",
  description:
    "Recherche de véhicules, vérification, négociation, export et transport international avec PaxSolutio.",
};

const benefits = [
  {
    number: "01",
    title: "Recherche ciblée",
    description:
      "La recherche part du véhicule réellement demandé : modèle, version, année, quantité, budget et destination.",
  },
  {
    number: "02",
    title: "Plus de visibilité",
    description:
      "Les informations disponibles sur le véhicule, le vendeur et les conditions sont étudiées avant validation.",
  },
  {
    number: "03",
    title: "Une chaîne complète",
    description:
      "Le sourcing peut être relié directement aux étapes d'export et de logistique internationale.",
  },
];

export default function AutomotivePage() {
  return (
    <main>
      <Header />

      <AutomotiveHero />

      <ServiceBenefits
        title="L'achat du véhicule n'est qu'une partie de l'opération."
        intro="La sélection du bon véhicule doit être pensée avec sa disponibilité, son export et son acheminement jusqu'au marché cible."
        benefits={benefits}
      />

      <AutomotiveOptions />

      <AutomotiveProcess />

      <AutomotiveLogistics />

      <VehicleRequestForm />

      <ServiceCTA
        title="Vous avez déjà trouvé un véhicule ou reçu une offre ?"
        description="Transmettez-nous les informations disponibles afin que nous puissions étudier les prochaines étapes possibles."
        buttonLabel="Présenter mon véhicule"
        href="#vehicle-request"
      />

      <Footer />
    </main>
  );
}