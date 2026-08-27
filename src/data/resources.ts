export type ResourceSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type Resource = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  readingTime: string;
  featured?: boolean;
  introduction: string;
  sections: ResourceSection[];
};

export const resources: Resource[] = [
  {
    slug: "trouver-fournisseur-fiable-chine",
    category: "Sourcing",
    title: "Comment trouver un fournisseur fiable en Chine ?",
    excerpt:
      "Les principaux critères à analyser avant de sélectionner un fabricant pour un projet d'import.",
    readingTime: "8 min",
    featured: true,
    introduction:
      "Trouver un fournisseur est relativement simple. Identifier un partenaire réellement adapté à son produit, son volume et son marché demande en revanche une analyse plus structurée.",
    sections: [
      {
        heading: "Définir précisément le besoin",
        paragraphs: [
          "Avant de rechercher des fabricants, il faut définir le produit attendu, les quantités, le niveau de qualité, les éventuelles personnalisations et le marché cible.",
          "Un cahier des charges précis permet de comparer des offres réellement comparables.",
        ],
        points: [
          "Produit et spécifications",
          "Quantité / MOQ",
          "Budget cible",
          "Packaging",
          "Destination",
        ],
      },
      {
        heading: "Comparer plusieurs fournisseurs",
        paragraphs: [
          "Une seule proposition ne permet généralement pas d'évaluer correctement le marché.",
          "Le prix doit être analysé avec les quantités minimales, les délais, les capacités de personnalisation et les conditions de paiement.",
        ],
      },
      {
        heading: "Vérifier avant de s'engager",
        paragraphs: [
          "Selon la valeur et le niveau de risque du projet, des vérifications complémentaires peuvent être pertinentes avant de confirmer une commande.",
        ],
        points: [
          "Supplier verification",
          "Échantillonnage",
          "Factory audit",
          "Contrôle qualité",
        ],
      },
    ],
  },

  {
    slug: "fob-exw-cif-differences",
    category: "Incoterms",
    title: "FOB, EXW, CIF : quelles différences ?",
    excerpt:
      "Comprendre les responsabilités et les coûts associés aux principaux Incoterms utilisés à l'import.",
    readingTime: "7 min",
    introduction:
      "Les Incoterms définissent la répartition de certaines responsabilités, des coûts et des risques entre vendeur et acheteur.",
    sections: [
      {
        heading: "EXW",
        paragraphs: [
          "En EXW, le vendeur met généralement la marchandise à disposition dans ses locaux selon les conditions convenues.",
        ],
      },
      {
        heading: "FOB",
        paragraphs: [
          "FOB est couramment utilisé pour les opérations maritimes et déplace une partie de l'organisation logistique vers le vendeur jusqu'au point prévu par l'Incoterm.",
        ],
      },
      {
        heading: "CIF",
        paragraphs: [
          "CIF inclut notamment certains coûts de transport et d'assurance jusqu'au port de destination convenu, sans pour autant signifier que tous les frais d'importation sont couverts.",
        ],
      },
    ],
  },

  {
    slug: "calculer-cout-revient-import",
    category: "Import",
    title: "Comment calculer le coût de revient d'un produit importé ?",
    excerpt:
      "Prix usine, transport, droits de douane, TVA et frais annexes : les éléments à intégrer.",
    readingTime: "10 min",
    featured: true,
    introduction:
      "Le prix payé au fournisseur ne représente qu'une partie du coût réel d'un produit importé.",
    sections: [
      {
        heading: "Le prix d'achat",
        paragraphs: [
          "Le calcul commence par le coût des marchandises selon les conditions commerciales négociées.",
        ],
      },
      {
        heading: "La logistique",
        paragraphs: [
          "Transport local, consolidation, fret international et frais associés doivent ensuite être intégrés.",
        ],
      },
      {
        heading: "Les coûts à destination",
        paragraphs: [
          "Selon l'opération, des droits de douane, taxes et différents frais de traitement peuvent s'ajouter.",
        ],
      },
    ],
  },

  {
    slug: "importer-voiture-chine",
    category: "Automobile",
    title: "Importer une voiture de Chine : les étapes essentielles",
    excerpt:
      "Recherche du véhicule, vérification, achat, export et solutions de transport international.",
    readingTime: "12 min",
    featured: true,
    introduction:
      "Une opération automobile internationale ne se limite pas au prix affiché par un vendeur. Il faut également anticiper export, transport et contraintes du marché de destination.",
    sections: [
      {
        heading: "Rechercher le véhicule",
        paragraphs: [
          "Le projet commence par une définition précise du modèle, de la version, du budget et de la quantité recherchée.",
        ],
      },
      {
        heading: "Vérifier l'offre",
        paragraphs: [
          "Les informations relatives au vendeur, aux spécifications du véhicule et aux conditions commerciales doivent être analysées avant achat.",
        ],
      },
      {
        heading: "Organiser l'export et le transport",
        paragraphs: [
          "Selon la destination et les lignes disponibles, différentes solutions logistiques peuvent être étudiées, notamment RoRo ou transport en conteneur.",
        ],
      },
    ],
  },

  {
    slug: "controle-qualite-avant-expedition",
    category: "Quality",
    title: "Pourquoi contrôler une commande avant expédition ?",
    excerpt:
      "Les différences entre contrôle qualité, audit fournisseur et inspection avant expédition.",
    readingTime: "8 min",
    introduction:
      "Une inspection avant expédition permet d'obtenir davantage d'informations sur une commande avant son départ.",
    sections: [
      {
        heading: "Définir ce qui doit être contrôlé",
        paragraphs: [
          "Une inspection utile nécessite des critères définis à l'avance selon le produit et le cahier des charges.",
        ],
      },
      {
        heading: "Observer et documenter",
        paragraphs: [
          "Les résultats peuvent inclure des observations, des photos et les anomalies relevées lors du contrôle.",
        ],
      },
    ],
  },

  {
    slug: "fcl-lcl-differences",
    category: "Logistique",
    title: "FCL ou LCL : quelle solution maritime choisir ?",
    excerpt:
      "Comprendre la différence entre conteneur complet et groupage maritime.",
    readingTime: "6 min",
    introduction:
      "FCL et LCL répondent à des besoins différents en matière de volume, de coût et d'organisation.",
    sections: [
      {
        heading: "FCL",
        paragraphs: [
          "FCL correspond à l'utilisation d'un conteneur complet pour une opération.",
        ],
      },
      {
        heading: "LCL",
        paragraphs: [
          "LCL permet de partager l'espace d'un conteneur lorsque le volume expédié ne justifie pas nécessairement un conteneur complet.",
        ],
      },
    ],
  },
];