import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import ArticleContent from "@/components/resources/ArticleContent";
import ServiceCTA from "@/components/services/ServiceCTA";

import { resources } from "@/data/resources";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return resources.map((resource) => ({
    slug: resource.slug,
  }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const resource = resources.find((item) => item.slug === slug);

  if (!resource) {
    return {};
  }

  return {
    title: resource.metaTitle || resource.title,

    description: resource.metaDescription || resource.excerpt,

    alternates: {
      canonical: `/ressources/${resource.slug}`,
    },

    openGraph: {
      title: resource.title,
      description: resource.metaDescription || resource.excerpt,
      url: `/ressources/${resource.slug}`,
      type: "article",
    },
  };
}

export default async function ResourcePage({
  params,
}: Props) {
  const { slug } = await params;

  const resource = resources.find((item) => item.slug === slug);

  if (!resource) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: resource.title,
    description: resource.metaDescription || resource.excerpt,
    author: {
      "@type": "Organization",
      name: "PaxSolutio",
    },
    publisher: {
      "@type": "Organization",
      name: "PaxSolutio",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://paxsolutio.com/ressources/${resource.slug}`,
    },
  };

  return (
    <main>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <section className="relative overflow-hidden bg-[#071B33] pb-20 pt-40 text-white lg:pb-28 lg:pt-48">
        <div className="absolute right-[-160px] top-[-120px] h-[500px] w-[500px] rounded-full bg-[#176BFF]/20 blur-[60px]" />

        <div className="relative mx-auto max-w-[1000px] px-6">
          <Link
            href="/ressources"
            className="mb-8 inline-flex items-center text-xs font-extrabold uppercase tracking-[0.16em] text-white/45 transition hover:text-white"
          >
            ← Toutes les ressources
          </Link>

          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            {resource.category}
          </div>

          <h1 className="mt-6 text-[42px] font-extrabold leading-[1.04] tracking-[-0.05em] sm:text-[54px] lg:text-[64px]">
            {resource.title}
          </h1>

          <p className="mt-7 max-w-[800px] text-lg leading-8 text-white/60">
            {resource.excerpt}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/45">
            <span>PaxSolutio</span>
            <span>•</span>
            <span>{resource.readingTime} de lecture</span>
            <span>•</span>
            <span>Guide pratique</span>
          </div>
        </div>
      </section>

      <ArticleContent resource={resource} />

      <ServiceCTA
        title="Vous souhaitez appliquer ces principes à votre propre projet ?"
        description="Présentez-nous votre produit, vos volumes, votre marché et votre objectif afin d'étudier votre situation concrète."
        buttonLabel="Présenter mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}