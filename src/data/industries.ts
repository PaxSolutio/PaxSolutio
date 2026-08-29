export type Industry = {
  slug: string;
  code: string;
  name: string;

  metaTitle: string;
  metaDescription: string;

  shortDescription: string;
  title: string;
  description: string;

  intro: string;

  products: string[];
  challenges: string[];
  services: string[];

  sourcingPoints: string[];

  relatedLinks: {
    label: string;
    href: string;
  }[];
};

export const industries: Industry[] = [
  {
    slug: "automobile",

    code: "01",

    name: "Automobile",

    metaTitle: "Sourcing Automobile en Chine & Import de Véhicules",

    metaDescription:
      "Sourcing automobile en Chine : recherche de véhicules, fournisseurs, pièces et équipements, vérification des offres et coordination export et transport.",

    shortDescription:
      "Véhicules, pièces détachées, accessoires et équipements automobiles.",

    title:
      "Sourcing automobile en Chine pour véhicules, pièces et équipements.",

    description:
      "PaxSolutio accompagne les professionnels dans la recherche de véhicules, fournisseurs, pièces détachées et équipements automobiles disponibles en Chine.",

    intro:
      "Le sourcing automobile demande de comparer non seulement les prix, mais également les configurations proposées, les informations disponibles sur le véhicule, les conditions du vendeur, les documents d'exportation et la solution de transport adaptée au pays de destination.",

    products: [
      "Véhicules neufs",
      "Véhicules électriques",
      "Pièces détachées",
      "Accessoires automobiles",
      "Équipements de garage",
      "Composants OEM",
    ],

    challenges: [
      "Identification du véhicule et de sa configuration",
      "Vérification du vendeur ou fournisseur",
      "Comparaison des offres disponibles",
      "Documents nécessaires à l'export",
      "Choix entre transport RoRo et conteneur",
      "Contraintes propres au marché de destination",
    ],

    services: [
      "Recherche de véhicules",
      "Recherche fournisseurs",
      "Comparaison des offres",
      "Vérification",
      "Coordination export",
      "Transport international",
    ],

    sourcingPoints: [
      "Marque, modèle et motorisation recherchés",
      "Version et niveau d'équipement",
      "Quantité souhaitée",
      "Budget cible",
      "Pays de destination",
      "Mode de transport envisagé",
    ],

    relatedLinks: [
      {
        label: "Sourcing automobile",
        href: "/sourcing-automobile",
      },
      {
        label: "Logistique internationale",
        href: "/logistique",
      },
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
      },
    ],
  },

  {
    slug: "construction",

    code: "02",

    name: "Machines & Construction",

    metaTitle: "Sourcing Machines & Engins de Chantier en Chine",

    metaDescription:
      "Recherche de fabricants de machines, mini-pelles, engins de chantier et équipements professionnels en Chine avec contrôle et organisation logistique.",

    shortDescription:
      "Engins de chantier, machines industrielles et équipements professionnels.",

    title:
      "Sourcing de machines et engins de chantier auprès de fabricants chinois.",

    description:
      "PaxSolutio accompagne la recherche de fabricants pour les machines, engins de chantier, équipements industriels et matériels professionnels.",

    intro:
      "Pour une machine ou un engin de chantier, le prix d'achat ne suffit pas à comparer deux offres. Motorisation, hydraulique, dimensions, poids, composants, accessoires, pièces détachées et conditions de transport doivent être étudiés avant la commande.",

    products: [
      "Mini-pelles",
      "Engins de chantier",
      "Machines industrielles",
      "Chariots et équipements de manutention",
      "Outillage professionnel",
      "Pièces détachées",
    ],

    challenges: [
      "Spécifications techniques",
      "Motorisation et composants",
      "Capacité et performances annoncées",
      "Disponibilité des pièces détachées",
      "Poids et dimensions d'expédition",
      "Transport de machines et équipements lourds",
    ],

    services: [
      "Recherche fabricant",
      "Comparaison technique",
      "Négociation",
      "Inspection",
      "Contrôle qualité",
      "Organisation du transport",
    ],

    sourcingPoints: [
      "Type de machine recherchée",
      "Capacité ou tonnage",
      "Motorisation souhaitée",
      "Accessoires nécessaires",
      "Quantité",
      "Destination finale",
    ],

    relatedLinks: [
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
      },
      {
        label: "Contrôle qualité",
        href: "/controle-qualite",
      },
      {
        label: "Logistique internationale",
        href: "/logistique",
      },
    ],
  },

  {
    slug: "mobilier",

    code: "03",

    name: "Mobilier",

    metaTitle: "Sourcing Mobilier en Chine & Fabricants de Meubles",

    metaDescription:
      "Recherche de fabricants de mobilier en Chine : canapés, fauteuils, tables, mobilier professionnel, hôtelier et projets sur mesure.",

    shortDescription:
      "Canapés, mobilier professionnel, hôtelier et solutions d'aménagement.",

    title:
      "Sourcez votre mobilier directement auprès de fabricants en Chine.",

    description:
      "Nous accompagnons les projets de sourcing de mobilier résidentiel, commercial, hôtelier et destiné à la distribution.",

    intro:
      "Le sourcing de mobilier implique de travailler sur les matériaux, les dimensions, les finitions, les couleurs, le conditionnement et l'optimisation du volume transporté. Les écarts entre fabricants peuvent être importants, même pour des produits visuellement similaires.",

    products: [
      "Canapés",
      "Fauteuils",
      "Tables",
      "Mobilier commercial",
      "Mobilier hôtelier",
      "Mobilier sur mesure",
    ],

    challenges: [
      "Choix des matériaux",
      "Qualité des finitions",
      "Dimensions et personnalisation",
      "Protection du produit",
      "Packaging",
      "Optimisation du chargement conteneur",
    ],

    services: [
      "Recherche fabricant",
      "Échantillonnage",
      "Personnalisation",
      "Contrôle qualité",
      "Consolidation",
      "Transport maritime",
    ],

    sourcingPoints: [
      "Type de mobilier",
      "Dimensions",
      "Matériaux et coloris",
      "Quantités",
      "Packaging demandé",
      "Destination",
    ],

    relatedLinks: [
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
      },
      {
        label: "Développement produit",
        href: "/developpement-produit",
      },
      {
        label: "Logistique internationale",
        href: "/logistique",
      },
    ],
  },

  {
    slug: "beaute",

    code: "04",

    name: "Beauté & Esthétique",

    metaTitle: "Sourcing Beauté & Machines Esthétiques en Chine",

    metaDescription:
      "Sourcing en Chine de machines esthétiques, équipements de salon, mobilier beauté, accessoires, consommables et solutions Private Label.",

    shortDescription:
      "Machines esthétiques, équipements de salon et consommables professionnels.",

    title:
      "Sourcing de machines et équipements pour la beauté et l'esthétique.",

    description:
      "PaxSolutio accompagne salons, distributeurs et professionnels dans la recherche de fabricants et de produits destinés au secteur de la beauté.",

    intro:
      "Les équipements esthétiques nécessitent une attention particulière aux spécifications techniques, à la documentation disponible, à la sécurité électrique, aux accessoires fournis et aux possibilités de personnalisation lorsque le produit doit être commercialisé sous une marque.",

    products: [
      "Machines esthétiques",
      "Équipements de salon",
      "Mobilier beauté",
      "Accessoires professionnels",
      "Consommables",
      "Packaging personnalisé",
    ],

    challenges: [
      "Spécifications du produit",
      "Documentation disponible",
      "Sécurité électrique",
      "Qualité des composants",
      "Accessoires et consommables",
      "Personnalisation de marque",
    ],

    services: [
      "Recherche fournisseur",
      "Vérification fournisseur",
      "Développement produit",
      "Private Label",
      "Contrôle qualité",
      "Transport",
    ],

    sourcingPoints: [
      "Type de machine ou produit",
      "Fonctions recherchées",
      "Quantité",
      "Personnalisation souhaitée",
      "Marché cible",
      "Budget",
    ],

    relatedLinks: [
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
      },
      {
        label: "Développement produit",
        href: "/developpement-produit",
      },
      {
        label: "Contrôle qualité",
        href: "/controle-qualite",
      },
    ],
  },

  {
    slug: "electronique",

    code: "05",

    name: "Électronique",

    metaTitle: "Sourcing Électronique en Chine & Fabricants OEM ODM",

    metaDescription:
      "Recherche de fabricants électroniques en Chine pour produits grand public, accessoires, objets connectés et projets OEM, ODM ou Private Label.",

    shortDescription:
      "Produits électroniques, objets connectés, accessoires et composants.",

    title:
      "Sourcing électronique en Chine pour marques et distributeurs.",

    description:
      "Nous accompagnons les entreprises dans l'identification de fabricants et la comparaison de solutions pour leurs produits électroniques.",

    intro:
      "Dans l'électronique, deux produits d'apparence identique peuvent utiliser des composants très différents. Il est donc important de définir précisément les performances, fonctions, accessoires, packaging et exigences du marché avant de comparer les fabricants.",

    products: [
      "Électronique grand public",
      "Accessoires électroniques",
      "Objets connectés",
      "Audio",
      "Éclairage",
      "Composants",
    ],

    challenges: [
      "Spécifications techniques",
      "Choix des composants",
      "Fonctions du produit",
      "Tests fonctionnels",
      "Documentation",
      "Packaging",
    ],

    services: [
      "Recherche fournisseur",
      "OEM / ODM",
      "Échantillonnage",
      "Développement produit",
      "Contrôle qualité",
      "Logistique",
    ],

    sourcingPoints: [
      "Fonctions attendues",
      "Caractéristiques techniques",
      "Design",
      "Quantité",
      "Packaging",
      "Marché cible",
    ],

    relatedLinks: [
      {
        label: "Développement produit",
        href: "/developpement-produit",
      },
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
      },
      {
        label: "Contrôle qualité",
        href: "/controle-qualite",
      },
    ],
  },

  {
    slug: "maison",

    code: "06",

    name: "Maison & Électroménager",

    metaTitle: "Sourcing Électroménager & Produits Maison en Chine",

    metaDescription:
      "Sourcing de produits maison et électroménager en Chine pour distributeurs, marques et e-commerce : fabricants, personnalisation, contrôle et import.",

    shortDescription:
      "Électroménager, accessoires maison, cuisine, décoration et lifestyle.",

    title:
      "Sourcez vos produits maison et électroménager auprès de fabricants chinois.",

    description:
      "PaxSolutio accompagne distributeurs, marques et e-commerçants dans leurs projets d'approvisionnement pour l'univers de la maison.",

    intro:
      "Le secteur maison couvre des produits très différents, du petit accessoire à l'appareil électrique. Le sourcing doit donc tenir compte du prix cible, de la qualité attendue, du design, du packaging, du volume logistique et des caractéristiques techniques propres à chaque référence.",

    products: [
      "Petit électroménager",
      "Équipements de cuisine",
      "Produits maison",
      "Décoration",
      "Rangement",
      "Produits lifestyle",
    ],

    challenges: [
      "Rapport qualité / prix",
      "Design et finitions",
      "Spécifications techniques",
      "Packaging",
      "Volumes d'expédition",
      "Optimisation logistique",
    ],

    services: [
      "Sourcing",
      "Private Label",
      "Développement produit",
      "Packaging",
      "Contrôle qualité",
      "Transport",
    ],

    sourcingPoints: [
      "Catégorie de produit",
      "Prix cible",
      "Quantité",
      "Design souhaité",
      "Personnalisation",
      "Marché de destination",
    ],

    relatedLinks: [
      {
        label: "Sourcing en Chine",
        href: "/sourcing",
      },
      {
        label: "Développement produit",
        href: "/developpement-produit",
      },
      {
        label: "Logistique internationale",
        href: "/logistique",
      },
    ],
  },

  {
    slug: "textile",

    code: "07",

    name: "Textile & Fashion",

    metaTitle: "Sourcing Textile en Chine & Fabricants de Vêtements",

    metaDescription:
      "Recherche de fabricants textiles en Chine pour vêtements, sportswear, accessoires, sacs, chaussures, Private Label et collections personnalisées.",

    shortDescription:
      "Vêtements, accessoires, chaussures et développement de collections.",

    title:
      "Développez vos produits textiles auprès de fabricants adaptés.",

    description:
      "Nous accompagnons les projets de recherche fabricant, personnalisation et production pour les marques et distributeurs du secteur textile.",

    intro:
      "Le textile demande de cadrer précisément la matière, le grammage, les dimensions, les couleurs, les tailles, les techniques de marquage et les quantités. L'échantillonnage joue souvent un rôle essentiel avant le lancement d'une production.",

    products: [
      "Vêtements",
      "Sportswear",
      "Accessoires",
      "Sacs",
      "Chaussures",
      "Textile personnalisé",
    ],

    challenges: [
      "MOQ",
      "Matières et grammages",
      "Tailles",
      "Couleurs",
      "Échantillonnage",
      "Régularité de production",
    ],

    services: [
      "Recherche fabricant",
      "Échantillonnage",
      "Private Label",
      "Développement produit",
      "Contrôle production",
      "Transport",
    ],

    sourcingPoints: [
      "Type de produit",
      "Matière",
      "Tailles",
      "Quantités",
      "Personnalisation",
      "Prix cible",
    ],

    relatedLinks: [
      {
        label: "Développement produit",
        href: "/developpement-produit",
      },
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
      },
      {
        label: "Contrôle qualité",
        href: "/controle-qualite",
      },
    ],
  },

  {
    slug: "ecommerce",

    code: "08",

    name: "E-commerce",

    metaTitle: "Sourcing E-commerce en Chine & Private Label",

    metaDescription:
      "Sourcing de produits en Chine pour e-commerce, marketplaces et marques : fournisseurs, Private Label, packaging, contrôle qualité et fulfillment.",

    shortDescription:
      "Produits pour marketplaces, boutiques en ligne et marques Private Label.",

    title:
      "Construisez une supply chain pensée pour votre activité e-commerce.",

    description:
      "PaxSolutio accompagne les e-commerçants dans la recherche de produits et fournisseurs ainsi que dans l'organisation de leurs opérations en Chine.",

    intro:
      "Pour un projet e-commerce, la performance dépend autant du produit que de son coût final, du MOQ, du packaging, des délais, du contrôle qualité et de la façon dont le stock et les commandes seront gérés après la production.",

    products: [
      "Produits marketplace",
      "Produits Private Label",
      "Accessoires",
      "Bundles",
      "Produits de niche",
      "Packaging personnalisé",
    ],

    challenges: [
      "Prix de revient cible",
      "MOQ",
      "Packaging",
      "Délais d'approvisionnement",
      "Gestion du stock",
      "Fulfillment",
    ],

    services: [
      "Product sourcing",
      "Private Label",
      "Contrôle qualité",
      "Stockage",
      "Fulfillment",
      "Expédition",
    ],

    sourcingPoints: [
      "Produit recherché",
      "Prix cible",
      "Quantité",
      "Canal de vente",
      "Packaging",
      "Mode de fulfillment",
    ],

    relatedLinks: [
      {
        label: "Dropshipping & fulfillment",
        href: "/dropshipping",
      },
      {
        label: "Développement produit",
        href: "/developpement-produit",
      },
      {
        label: "Sourcing en Chine",
        href: "/sourcing",
      },
    ],
  },
];