export type Service = {
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  href: string;
  tags: string[];
  featured?: boolean;
};

export const services: Service[] = [
  {
    slug: "sourcing",
    category: "SUPPLY",
    title: "Sourcing international",
    shortDescription:
      "Recherche, qualification et négociation avec des fabricants adaptés à votre projet.",
    href: "/sourcing",
    tags: ["Recherche", "Négociation", "Échantillons"],
  },

  {
    slug: "automotive",
    category: "AUTOMOTIVE",
    title: "Sourcing automobile",
    shortDescription:
      "Recherche, vérification, négociation, export et transport de véhicules.",
    href: "/sourcing-automobile",
    tags: ["Véhicules", "Inspection", "Export"],
    featured: true,
  },

  {
    slug: "logistics",
    category: "FREIGHT",
    title: "Logistique internationale",
    shortDescription:
      "Maritime, aérien, ferroviaire et routier selon votre opération.",
    href: "/logistique",
    tags: ["Sea", "Air", "Rail", "Truck"],
  },

  {
    slug: "quality",
    category: "QUALITY",
    title: "Audit & contrôle qualité",
    shortDescription:
      "Vérification fournisseur, audit usine et contrôle des marchandises.",
    href: "/controle-qualite",
    tags: ["Factory Audit", "PSI", "Report"],
  },

  {
    slug: "dropshipping",
    category: "E-COMMERCE",
    title: "Dropshipping & Fulfillment",
    shortDescription:
      "Sourcing, stockage, préparation et expédition pour votre e-commerce.",
    href: "/dropshipping",
    tags: ["Storage", "Packing", "Shipping"],
  },

  {
    slug: "suppliers",
    category: "NETWORK",
    title: "Réseau fournisseurs",
    shortDescription:
      "Recherche et présélection de fabricants selon votre secteur.",
    href: "/fournisseurs",
    tags: ["Supplier", "B2B", "Multi-sector"],
  },
];