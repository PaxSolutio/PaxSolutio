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
    label: "Solutions",
    href: "/solutions",

    children: [
      {
        label: "Sourcing en Chine",
        href: "/sourcing",
        description:
          "Recherche, comparaison et négociation avec des fabricants adaptés à votre projet.",
      },

      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
        description:
          "Identification et présélection de fabricants selon votre produit et vos volumes.",
      },

      {
        label: "Développement produit",
        href: "/developpement-produit",
        description:
          "OEM, ODM, Private Label, personnalisation et échantillonnage.",
      },

      {
        label: "Contrôle qualité",
        href: "/controle-qualite",
        description:
          "Vérification fournisseur, audit usine et inspection des marchandises.",
      },

      {
        label: "Logistique internationale",
        href: "/logistique",
        description:
          "Transport maritime, aérien, ferroviaire et routier.",
      },

      {
        label: "Dropshipping & Fulfillment",
        href: "/dropshipping",
        description:
          "Stockage, préparation et expédition pour les activités e-commerce.",
      },
    ],
  },

  {
    label: "Automobile",
    href: "/sourcing-automobile",
  },

  {
    label: "Secteurs",
    href: "/secteurs",

    children: [
      {
        label: "Automobile",
        href: "/secteurs/automobile",
        description:
          "Véhicules, pièces, accessoires et équipements automobiles.",
      },

      {
        label: "Machines & Construction",
        href: "/secteurs/construction",
        description:
          "Engins de chantier, machines et équipements professionnels.",
      },

      {
        label: "Mobilier",
        href: "/secteurs/mobilier",
        description:
          "Canapés, mobilier professionnel, hôtelier et sur mesure.",
      },

      {
        label: "Beauté & Esthétique",
        href: "/secteurs/beaute",
        description:
          "Machines esthétiques, mobilier, accessoires et consommables.",
      },

      {
        label: "Électronique",
        href: "/secteurs/electronique",
        description:
          "Produits électroniques, accessoires et projets OEM / ODM.",
      },

      {
        label: "Maison & Électroménager",
        href: "/secteurs/maison",
        description:
          "Électroménager, décoration, cuisine et produits lifestyle.",
      },

      {
        label: "Textile & Fashion",
        href: "/secteurs/textile",
        description:
          "Vêtements, accessoires, chaussures et Private Label.",
      },

      {
        label: "E-commerce",
        href: "/secteurs/ecommerce",
        description:
          "Produits marketplace, Private Label et supply chain e-commerce.",
      },
    ],
  },

  {
    label: "Ressources",
    href: "/ressources",

    children: [
      {
        label: "Trouver un fournisseur en Chine",
        href: "/ressources/trouver-fournisseur-fiable-chine",
        description:
          "Les critères essentiels pour rechercher et vérifier un fabricant.",
      },

      {
        label: "Calculer un coût d'import",
        href: "/ressources/calculer-cout-revient-import",
        description:
          "Prix fournisseur, transport, douane et frais annexes.",
      },

      {
        label: "FOB, EXW ou CIF",
        href: "/ressources/fob-exw-cif-differences",
        description:
          "Comprendre les principaux Incoterms utilisés à l'import.",
      },

      {
        label: "Importer une voiture de Chine",
        href: "/ressources/importer-voiture-chine",
        description:
          "Recherche du véhicule, export et transport international.",
      },

      {
        label: "Contrôle avant expédition",
        href: "/ressources/controle-qualite-avant-expedition",
        description:
          "Pourquoi vérifier une commande avant son départ.",
      },

      {
        label: "FCL ou LCL",
        href: "/ressources/fcl-lcl-differences",
        description:
          "Conteneur complet ou groupage maritime.",
      },
    ],
  },

  {
    label: "À propos",
    href: "/a-propos",
  },
];