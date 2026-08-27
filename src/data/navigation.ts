export type NavigationItem = {
  label: string;
  href: string;
  description?: string;
};

export type NavigationGroup = {
  label: string;
  href: string;
  children?: NavigationItem[];
};

export const navigation: NavigationGroup[] = [
  {
    label: "Sourcing",
    href: "/sourcing",
    children: [
      {
        label: "Sourcing international",
        href: "/sourcing",
        description:
          "Recherche, qualification et négociation avec des fabricants.",
      },
      {
        label: "Sourcing automobile",
        href: "/sourcing-automobile",
        description:
          "Recherche, vérification, achat et export de véhicules.",
      },
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
        description:
          "Shortlist de fournisseurs adaptée à votre activité.",
      },
      {
        label: "Développement produit",
        href: "/developpement-produit",
        description:
          "OEM, ODM, personnalisation et développement de marque.",
      },
    ],
  },

  {
    label: "Logistique",
    href: "/logistique",
    children: [
      {
        label: "Transport maritime",
        href: "/logistique#sea",
        description: "FCL, LCL et solutions conteneurisées.",
      },
      {
        label: "Transport aérien",
        href: "/logistique#air",
        description: "Expéditions prioritaires et marchandises urgentes.",
      },
      {
        label: "Rail & Truck",
        href: "/logistique#rail",
        description: "Solutions ferroviaires et routières internationales.",
      },
      {
        label: "Automobile",
        href: "/sourcing-automobile",
        description: "Transport RoRo ou conteneur selon les opérations.",
      },
    ],
  },

  {
    label: "Contrôle & Audit",
    href: "/controle-qualite",
  },

  {
    label: "Solutions",
    href: "/solutions",
    children: [
      {
        label: "Dropshipping & Fulfillment",
        href: "/dropshipping",
        description:
          "Stockage, préparation et expédition des commandes e-commerce.",
      },
      {
        label: "Audit usine",
        href: "/controle-qualite",
        description:
          "Évaluation du fournisseur et de ses capacités de production.",
      },
      {
        label: "Contrôle qualité",
        href: "/controle-qualite",
        description:
          "Inspection de marchandises avant ou pendant la production.",
      },
      {
        label: "Réseau fournisseurs",
        href: "/fournisseurs",
        description:
          "Recherche de fabricants selon votre industrie.",
      },
    ],
  },

  {
    label: "Secteurs",
    href: "/secteurs",
  },

  {
    label: "Ressources",
    href: "/ressources",
  },
];