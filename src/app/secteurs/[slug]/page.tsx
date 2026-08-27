import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";

import IndustryHero from "@/components/industries/IndustryHero";
import IndustryDetails from "@/components/industries/IndustryDetails";
import ServiceCTA from "@/components/services/ServiceCTA";

import { industries } from "@/data/industries";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return industries.map((industry) => ({
    slug: industry.slug,
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const industry = industries.find(
    (item) => item.slug === slug
  );

  if (!industry) {
    return {};
  }

  return {
    title: `${industry.name} | Sourcing & Import | PaxSolutio`,
    description: industry.description,
  };
}

export default async function IndustryPage({
  params,
}: Props) {
  const { slug } = await params;

  const industry = industries.find(
    (item) => item.slug === slug
  );

  if (!industry) {
    notFound();
  }

  return (
    <main>
      <Header />

      <IndustryHero industry={industry} />

      <IndustryDetails industry={industry} />

      <ServiceCTA
        title={`Vous avez un projet dans le secteur ${industry.name} ?`}
        description="Présentez-nous votre produit, vos volumes et votre marché cible afin d'étudier les solutions adaptées."
        buttonLabel="Démarrer mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}