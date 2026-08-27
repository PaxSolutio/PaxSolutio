import type { Metadata } from "next";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | PaxSolutio",
  description:
    "Contactez PaxSolutio pour vos projets de sourcing, fournisseurs, automobile, contrôle qualité et logistique.",
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