export type Industry = {
  slug: string;
  code: string;
  name: string;
  shortDescription: string;
  title: string;
  description: string;
  products: string[];
  challenges: string[];
  services: string[];
};

export const industries: Industry[] = [
  {
    slug: "automobile",
    code: "01",
    name: "Automobile",
    shortDescription:
      "Véhicules, pièces détachées, accessoires et équipements.",
    title: "Sourcing et solutions d'import pour le secteur automobile.",
    description:
      "Recherche de véhicules, pièces, accessoires et partenaires adaptés aux projets automobiles internationaux.",
    products: [
      "Véhicules neufs",
      "Pièces détachées",
      "Accessoires",
      "Équipements garage",
      "Composants automobiles",
      "Solutions OEM",
    ],
    challenges: [
      "Vérification du véhicule ou fournisseur",
      "Spécifications selon le marché cible",
      "Documentation export",
      "Transport RoRo ou conteneur",
    ],
    services: [
      "Sourcing",
      "Vérification",
      "Négociation",
      "Inspection",
      "Export",
      "Logistique",
    ],
  },
  {
    slug: "construction",
    code: "02",
    name: "Machines & Construction",
    shortDescription:
      "Engins, équipements industriels et matériel professionnel.",
    title: "Approvisionnez vos équipements et machines à l'international.",
    description:
      "PaxSolutio accompagne les projets portant sur les machines, engins de chantier et équipements professionnels.",
    products: [
      "Mini-pelles",
      "Engins de chantier",
      "Machines industrielles",
      "Outillage",
      "Équipements professionnels",
      "Pièces détachées",
    ],
    challenges: [
      "Spécifications techniques",
      "Compatibilité moteur et équipements",
      "Poids et dimensions",
      "Transport hors gabarit",
    ],
    services: [
      "Recherche fabricant",
      "Négociation",
      "Contrôle",
      "Inspection",
      "Documentation",
      "Transport",
    ],
  },
  {
    slug: "mobilier",
    code: "03",
    name: "Mobilier",
    shortDescription:
      "Canapés, mobilier professionnel et solutions d'aménagement.",
    title: "Sourcez votre mobilier directement auprès des fabricants.",
    description:
      "Recherche de fabricants pour projets résidentiels, commerciaux, hôteliers ou de distribution.",
    products: [
      "Canapés",
      "Fauteuils",
      "Tables",
      "Mobilier commercial",
      "Mobilier hôtelier",
      "Mobilier sur mesure",
    ],
    challenges: [
      "Qualité des matériaux",
      "Finitions",
      "Dimensions",
      "Packaging",
      "Optimisation du volume conteneur",
    ],
    services: [
      "Sourcing",
      "Échantillons",
      "Personnalisation",
      "Contrôle qualité",
      "Consolidation",
      "Sea Freight",
    ],
  },
  {
    slug: "beaute",
    code: "04",
    name: "Beauté & Esthétique",
    shortDescription:
      "Machines, équipements et consommables professionnels.",
    title: "Développez vos approvisionnements beauté et esthétique.",
    description:
      "Solutions de sourcing pour salons, distributeurs et professionnels du secteur esthétique.",
    products: [
      "Machines esthétiques",
      "Équipements salon",
      "Mobilier beauté",
      "Consommables",
      "Accessoires",
      "Packaging",
    ],
    challenges: [
      "Conformité produit",
      "Documentation",
      "Sécurité électrique",
      "Qualité des consommables",
    ],
    services: [
      "Sourcing",
      "Supplier Verification",
      "Contrôle qualité",
      "Private Label",
      "Packaging",
      "Transport",
    ],
  },
  {
    slug: "electronique",
    code: "05",
    name: "Électronique",
    shortDescription:
      "Produits électroniques, accessoires et équipements connectés.",
    title: "Sourcing électronique pour marques et distributeurs.",
    description:
      "Identification de fournisseurs et accompagnement sur des produits électroniques destinés à la distribution.",
    products: [
      "Électronique grand public",
      "Accessoires",
      "Objets connectés",
      "Audio",
      "Éclairage",
      "Composants",
    ],
    challenges: [
      "Spécifications techniques",
      "Certifications",
      "Contrôle fonctionnel",
      "Packaging",
    ],
    services: [
      "Recherche fournisseur",
      "OEM / ODM",
      "Échantillons",
      "Contrôle qualité",
      "Packaging",
      "Logistique",
    ],
  },
  {
    slug: "maison",
    code: "06",
    name: "Maison & Électroménager",
    shortDescription:
      "Équipements domestiques, accessoires et produits lifestyle.",
    title: "Développez une gamme maison adaptée à votre marché.",
    description:
      "Sourcing de produits pour distributeurs, e-commerce et marques spécialisées dans l'univers de la maison.",
    products: [
      "Électroménager",
      "Cuisine",
      "Maison",
      "Décoration",
      "Rangement",
      "Lifestyle",
    ],
    challenges: [
      "Rapport qualité / prix",
      "Design",
      "Packaging",
      "Certifications",
      "Optimisation logistique",
    ],
    services: [
      "Sourcing",
      "Private Label",
      "Packaging",
      "Quality Control",
      "Consolidation",
      "Transport",
    ],
  },
  {
    slug: "textile",
    code: "07",
    name: "Textile & Fashion",
    shortDescription:
      "Vêtements, accessoires et développement de marque.",
    title: "Développez vos collections auprès de fabricants adaptés.",
    description:
      "Recherche de partenaires textiles pour production, personnalisation et lancement de collections.",
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
      "Matières",
      "Tailles",
      "Couleurs",
      "Échantillonnage",
      "Contrôle production",
    ],
    services: [
      "Sourcing",
      "Sampling",
      "Private Label",
      "Production",
      "Quality Control",
      "Shipping",
    ],
  },
  {
    slug: "ecommerce",
    code: "08",
    name: "E-commerce",
    shortDescription:
      "Produits destinés aux marketplaces et boutiques en ligne.",
    title: "Construisez une supply chain pensée pour le e-commerce.",
    description:
      "Recherche produit, fournisseurs, packaging et logistique adaptés aux activités e-commerce.",
    products: [
      "Produits marketplace",
      "Private Label",
      "Produits tendance",
      "Accessoires",
      "Bundles",
      "Packaging personnalisé",
    ],
    challenges: [
      "Prix cible",
      "MOQ",
      "Packaging",
      "Délais",
      "Stock",
      "Fulfillment",
    ],
    services: [
      "Product Sourcing",
      "Private Label",
      "Quality Control",
      "Warehousing",
      "Fulfillment",
      "Shipping",
    ],
  },
];