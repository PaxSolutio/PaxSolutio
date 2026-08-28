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
    title: "Une solution adaptée",
    description:
      "Le mode de transport est étudié selon la marchandise, le volume, la destination et les délais recherchés.",
  },
  {
    number: "02",
    title: "Une chaîne coordonnée",
    description:
      "La collecte, la consolidation et le transport peuvent être intégrés directement après le sourcing.",
  },
  {
    number: "03",
    title: "Un seul parcours",
    description:
      "PaxSolutio et OneBillionForwarders permettent de connecter l'approvisionnement à l'acheminement international.",
  },
];

export default function LogisticsPage() {
  return (
    <main>
      <Header />

      <LogisticsHero />

      <ServiceBenefits
        title="Le meilleur transport n'est pas toujours le moins cher."
        intro="Une bonne décision logistique doit équilibrer coût, délai, contraintes produit et fiabilité de l'opération."
        benefits={benefits}
      />

      <FreightModes />

      <LogisticsServices />

      <OBFSection />

      <FreightRequestForm />

      <ServiceCTA
        title="Vous avez déjà votre fournisseur et votre marchandise est prête ?"
        description="Envoyez-nous les informations de départ, destination, poids et volume afin d'étudier votre besoin logistique."
        buttonLabel="Demander une solution"
        href="#freight-request"
      />

      <Footer />
    </main>
  );
}