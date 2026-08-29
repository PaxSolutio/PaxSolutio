import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import ResourcesHero from "@/components/resources/ResourcesHero";
import FeaturedResources from "@/components/resources/FeaturedResources";
import ResourcesGrid from "@/components/resources/ResourcesGrid";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Guides Sourcing Chine, Import & Logistique",

  description:
    "Guides pratiques sur le sourcing en Chine, la recherche fournisseurs, les Incoterms, le coût d'importation, le contrôle qualité, l'automobile et la logistique internationale.",

  alternates: {
    canonical: "/ressources",
  },

  openGraph: {
    title: "Guides Sourcing Chine, Import & Logistique",
    description:
      "Comprenez le sourcing en Chine, les fournisseurs, l'importation, les Incoterms, le contrôle qualité et la logistique grâce aux guides PaxSolutio.",
    url: "/ressources",
  },
};

export default function ResourcesPage() {
  return (
    <main>
      <Header />

      <ResourcesHero />

      <FeaturedResources />

      <ResourcesGrid />

      <ServiceCTA
        title="Une question concernant votre propre import ?"
        description="Les guides permettent de comprendre les principes essentiels, mais chaque produit, fournisseur et destination possède ses propres contraintes."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}