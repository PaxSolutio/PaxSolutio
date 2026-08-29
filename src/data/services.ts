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

    category: "SOURCING",

    title: "Sourcing en Chine",

    shortDescription:
      "Recherche, comparaison et négociation avec des fabricants adaptés à votre produit, vos volumes et votre marché.",

    href: "/sourcing",

    tags: [
      "Recherche",
      "Négociation",
      "Échantillons",
    ],
  },

  {
    slug: "automotive",

    category: "AUTOMOBILE",

    title: "Sourcing automobile",

    shortDescription:
      "Recherche de véhicules en Chine, comparaison des offres, vérification et coordination de l'export et du transport.",

    href: "/sourcing-automobile",

    tags: [
      "Véhicules",
      "Vérification",
      "Export",
    ],

    featured: true,
  },

  {
    slug: "logistics",

    category: "LOGISTIQUE",

    title: "Logistique internationale",

    shortDescription:
      "Organisation du transport maritime, aérien, ferroviaire ou routier selon les caractéristiques de votre opération.",

    href: "/logistique",

    tags: [
      "Maritime",
      "Aérien",
      "Rail",
      "Routier",
    ],
  },

  {
    slug: "quality",

    category: "QUALITÉ",

    title: "Audit & contrôle qualité",

    shortDescription:
      "Vérification fournisseur, audit usine et contrôle des marchandises avant leur expédition.",

    href: "/controle-qualite",

    tags: [
      "Audit usine",
      "Inspection",
      "Rapport",
    ],
  },

  {
    slug: "dropshipping",

    category: "E-COMMERCE",

    title: "Dropshipping & Fulfillment",

    shortDescription:
      "Sourcing, réception, stockage, préparation et expédition des commandes pour votre activité e-commerce.",

    href: "/dropshipping",

    tags: [
      "Stockage",
      "Préparation",
      "Expédition",
    ],
  },

  {
    slug: "suppliers",

    category: "FOURNISSEURS",

    title: "Recherche de fournisseurs",

    shortDescription:
      "Identification, comparaison et présélection de fabricants selon votre produit, vos quantités et vos exigences.",

    href: "/fournisseurs",

    tags: [
      "Fabricants",
      "B2B",
      "Multi-secteurs",
    ],
  },

  {
    slug: "product-development",

    category: "PRODUIT",

    title: "Développement produit",

    shortDescription:
      "OEM, ODM, Private Label, personnalisation et échantillonnage pour développer votre propre produit avec un fabricant.",

    href: "/developpement-produit",

    tags: [
      "OEM / ODM",
      "Private Label",
      "Personnalisation",
    ],
  },
];