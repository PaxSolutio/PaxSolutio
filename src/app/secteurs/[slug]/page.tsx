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

  const industry = industries.find((item) => item.slug === slug);

  if (!industry) {
    return {};
  }

  return {
    title: industry.metaTitle,
    description: industry.metaDescription,

    alternates: {
      canonical: `/secteurs/${industry.slug}`,
    },

    openGraph: {
      title: `${industry.metaTitle} | PaxSolutio`,
      description: industry.metaDescription,
      url: `/secteurs/${industry.slug}`,
    },
  };
}

export default async function IndustryPage({
  params,
}: Props) {
  const { slug } = await params;

  const industry = industries.find((item) => item.slug === slug);

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
        description="Présentez-nous votre produit, les quantités envisagées, vos spécifications et votre marché cible. Nous pourrons étudier les étapes de sourcing, de contrôle et d'importation adaptées."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}