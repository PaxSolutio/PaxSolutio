import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import SuppliersHero from "@/components/suppliers/SuppliersHero";
import SupplierSegments from "@/components/suppliers/SupplierSegments";
import SupplierProcess from "@/components/suppliers/SupplierProcess";
import SupplierProfilePreview from "@/components/suppliers/SupplierProfilePreview";
import SupplierRequestForm from "@/components/suppliers/SupplierRequestForm";

import ServiceBenefits from "@/components/services/ServiceBenefits";
import ServiceCTA from "@/components/services/ServiceCTA";

export const metadata: Metadata = {
  title: "Recherche Fournisseurs | PaxSolutio",
  description:
    "Recherche et présélection de fabricants et fournisseurs selon votre produit, votre secteur et vos critères.",
};

const benefits = [
  {
    number: "01",
    title: "Recherche ciblée",
    description:
      "La mission part de critères définis plutôt que d'une recherche générique par produit.",
  },
  {
    number: "02",
    title: "Comparaison structurée",
    description:
      "Les propositions peuvent être comparées sur plusieurs éléments : prix, MOQ, délais, capacités et personnalisation.",
  },
  {
    number: "03",
    title: "Évolutif",
    description:
      "Une simple recherche fournisseur peut ensuite évoluer vers négociation, contrôle qualité ou logistique si nécessaire.",
  },
];

export default function SuppliersPage() {
  return (
    <main>
      <Header />

      <SuppliersHero />

      <ServiceBenefits
        title="Un bon fournisseur doit correspondre à votre modèle économique."
        intro="Le prix seul ne suffit pas. MOQ, qualité, capacité, délais et possibilités de personnalisation peuvent avoir autant d'impact sur votre projet."
        benefits={benefits}
      />

      <SupplierSegments />

      <SupplierProcess />

      <SupplierProfilePreview />

      <SupplierRequestForm />

      <ServiceCTA
        title="Vous avez déjà une référence produit ou un exemple précis ?"
        description="Envoyez un maximum d'informations afin que la recherche parte d'un cahier des charges clair."
        buttonLabel="Rechercher mes fournisseurs"
        href="#supplier-request"
      />

      <Footer />
    </main>
  );
}