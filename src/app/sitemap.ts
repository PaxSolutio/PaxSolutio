import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://paxsolutio.com";

  const routes = [
    "",
    "/sourcing",
    "/sourcing-automobile",
    "/developpement-produit",
    "/fournisseurs",
    "/logistique",
    "/controle-qualite",
    "/dropshipping",
    "/solutions",
    "/secteurs",
    "/ressources",
    "/a-propos",
    "/contact",
    "/mentions-legales",
    "/confidentialite",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" || route === "/ressources"
        ? "weekly"
        : "monthly",
    priority:
      route === ""
        ? 1
        : [
            "/sourcing",
            "/sourcing-automobile",
            "/logistique",
            "/fournisseurs",
          ].includes(route)
          ? 0.9
          : 0.7,
  }));
}