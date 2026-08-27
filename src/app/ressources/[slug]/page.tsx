import type { Metadata } from "next";
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

  const resource = resources.find(
    (item) => item.slug === slug
  );

  if (!resource) {
    return {};
  }

  return {
    title: `${resource.title} | PaxSolutio`,
    description: resource.excerpt,
  };
}

export default async function ResourcePage({
  params,
}: Props) {
  const { slug } = await params;

  const resource = resources.find(
    (item) => item.slug === slug
  );

  if (!resource) {
    notFound();
  }

  return (
    <main>
      <Header />

      <section className="bg-[#071B33] pb-20 pt-40 text-white lg:pb-28 lg:pt-48">
        <div className="mx-auto max-w-[1000px] px-6">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            {resource.category}
          </div>

          <h1 className="mt-6 text-[42px] font-extrabold leading-[1.04] tracking-[-0.05em] sm:text-[54px] lg:text-[64px]">
            {resource.title}
          </h1>

          <div className="mt-7 flex items-center gap-4 text-sm text-white/45">
            <span>PaxSolutio</span>
            <span>•</span>
            <span>{resource.readingTime}</span>
          </div>
        </div>
      </section>

      <ArticleContent resource={resource} />

      <ServiceCTA
        title="Vous souhaitez appliquer ces principes à votre propre projet ?"
        description="Présentez-nous votre produit, vos volumes et votre objectif afin d'étudier votre situation concrète."
        buttonLabel="Parler de mon projet"
        href="/#project"
      />

      <Footer />
    </main>
  );
}