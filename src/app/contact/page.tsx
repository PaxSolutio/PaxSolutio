import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Projet de Sourcing & Import",
  description:
    "Contactez PaxSolutio pour présenter votre projet de sourcing, recherche fournisseur, import automobile, contrôle qualité, logistique ou e-commerce.",

  alternates: {
    canonical: "/contact",
  },

  openGraph: {
    title: "Contact | Projet de Sourcing & Import | PaxSolutio",
    description:
      "Présentez votre projet à PaxSolutio : sourcing, fournisseurs, automobile, contrôle qualité, logistique et solutions e-commerce.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main>
      <Header />

      <ContactHero />
      <ContactForm />

      <Footer />
    </main>
  );
}