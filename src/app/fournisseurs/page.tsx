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
  title: "Recherche de Fournisseurs Chine & Fabricants",
  description:
    "PaxSolutio accompagne les entreprises dans la recherche de fournisseurs et fabricants en Chine : présélection, vérification, comparaison et qualification selon vos critères.",

  alternates: {
    canonical: "/fournisseurs",
  },

  openGraph: {
    title: "Recherche de Fournisseurs Chine & Fabricants | PaxSolutio",
    description:
      "Identification et qualification de fournisseurs chinois, fabricants et partenaires industriels adaptés à votre projet.",
    url: "/fournisseurs",
  },
};

const benefits = [
  {
    number: "01",
    title: "Identifier les bons fabricants",
    description:
      "La recherche est réalisée selon votre produit, vos quantités, votre budget, vos exigences techniques et votre marché afin d'identifier des fournisseurs réellement adaptés au projet.",
  },
  {
    number: "02",
    title: "Comparer avant de choisir",
    description:
      "Prix, MOQ, délais de production, capacités, personnalisation, packaging et conditions commerciales peuvent être comparés avant toute sélection.",
  },
  {
    number: "03",
    title: "Vérifier et sécuriser la suite",
    description:
      "La recherche fournisseur peut être complétée par des échanges de qualification, une vérification du fabricant, des échantillons, un contrôle qualité et l'organisation logistique.",
  },
];

export default function SuppliersPage() {
  return (
    <main>
      <Header />

      <SuppliersHero />

      <ServiceBenefits
        title="Trouver un fournisseur en Chine ne consiste pas seulement à comparer les prix."
        intro="Le fabricant sélectionné doit pouvoir répondre à vos volumes, vos exigences qualité, vos délais, votre budget et vos besoins de personnalisation. PaxSolutio structure la recherche afin de comparer plusieurs critères avant de retenir un fournisseur."
        benefits={benefits}
      />

      <SupplierSegments />

      <SupplierProcess />

      <SupplierProfilePreview />

      <SupplierRequestForm />

      <ServiceCTA
        title="Vous recherchez un fabricant ou un fournisseur en Chine ?"
        description="Envoyez-nous votre produit, vos photos ou liens de référence, les quantités envisagées, votre budget et vos exigences afin de lancer une recherche ciblée."
        buttonLabel="Rechercher mes fournisseurs"
        href="#supplier-request"
      />

      <Footer />
    </main>
  );
}