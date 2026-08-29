import type { MetadataRoute } from "next";

import { industries } from "@/data/industries";
import { resources } from "@/data/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://paxsolutio.com";

  const mainRoutes = [
    {
      path: "",
      priority: 1,
      changeFrequency: "weekly" as const,
    },

    {
      path: "/sourcing",
      priority: 0.9,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/fournisseurs",
      priority: 0.9,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/sourcing-automobile",
      priority: 0.9,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/logistique",
      priority: 0.9,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/controle-qualite",
      priority: 0.85,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/developpement-produit",
      priority: 0.85,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/dropshipping",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/solutions",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/secteurs",
      priority: 0.8,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/ressources",
      priority: 0.85,
      changeFrequency: "weekly" as const,
    },

    {
      path: "/a-propos",
      priority: 0.65,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/contact",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },

    {
      path: "/mentions-legales",
      priority: 0.3,
      changeFrequency: "yearly" as const,
    },

    {
      path: "/confidentialite",
      priority: 0.3,
      changeFrequency: "yearly" as const,
    },
  ];

  const staticPages: MetadataRoute.Sitemap = mainRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const industryPages: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: `${baseUrl}/secteurs/${industry.slug}`,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const resourcePages: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: `${baseUrl}/ressources/${resource.slug}`,
    changeFrequency: "monthly",
    priority: resource.featured ? 0.8 : 0.7,
  }));

  return [
    ...staticPages,
    ...industryPages,
    ...resourcePages,
  ];
}