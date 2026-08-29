export type ResourceSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type ResourceLink = {
  label: string;
  href: string;
};

export type Resource = {
  slug: string;
  category: string;

  title: string;
  metaTitle?: string;
  metaDescription?: string;

  excerpt: string;
  readingTime: string;

  featured?: boolean;

  introduction: string;

  sections: ResourceSection[];

  relatedLinks: ResourceLink[];
};

export const resources: Resource[] = [
  {
    slug: "trouver-fournisseur-fiable-chine",

    category: "Sourcing",

    title: "Comment trouver un fournisseur fiable en Chine ?",

    metaTitle: "Comment Trouver un Fournisseur Fiable en Chine ?",

    metaDescription:
      "Découvrez comment rechercher, comparer et vérifier un fournisseur en Chine avant de passer commande : cahier des charges, MOQ, échantillons, audit et contrôle qualité.",

    excerpt:
      "Les critères essentiels pour rechercher, comparer et vérifier un fabricant avant de lancer une commande en Chine.",

    readingTime: "8 min",

    featured: true,

    introduction:
      "Trouver un fournisseur en Chine est relativement simple. Identifier celui qui correspond réellement à votre produit, vos volumes, votre niveau de qualité et votre marché demande en revanche une méthode structurée.",

    sections: [
      {
        heading: "1. Commencer par un cahier des charges précis",

        paragraphs: [
          "La recherche ne devrait pas commencer par la plateforme ou le fournisseur, mais par le produit. Plus les caractéristiques recherchées sont précises, plus les offres obtenues seront comparables.",

          "Le cahier des charges peut inclure les dimensions, matériaux, fonctionnalités, niveaux de finition, accessoires, packaging, quantités et éventuelles personnalisations.",
        ],

        points: [
          "Produit et spécifications techniques",
          "Quantité envisagée et MOQ acceptable",
          "Budget ou prix cible",
          "Personnalisation et packaging",
          "Marché et pays de destination",
        ],
      },

      {
        heading: "2. Identifier plusieurs fournisseurs potentiels",

        paragraphs: [
          "Une seule proposition ne permet généralement pas de savoir si le prix, le MOQ ou les conditions proposés correspondent au marché. Comparer plusieurs fabricants permet d'obtenir une vision plus réaliste.",

          "Le prix unitaire ne doit pas être le seul critère. Les délais, la capacité de production, la qualité de communication, les possibilités de personnalisation et les conditions commerciales peuvent modifier fortement l'intérêt d'une offre.",
        ],
      },

      {
        heading: "3. Vérifier que l'entreprise correspond au projet",

        paragraphs: [
          "La vérification vise à confirmer les informations utiles concernant l'entreprise avec laquelle vous envisagez de travailler. Le niveau de vérification nécessaire dépend du montant de la commande, du produit et du risque accepté.",

          "Il peut également être pertinent de vérifier si l'interlocuteur est réellement le fabricant, une société de trading ou un intermédiaire.",
        ],

        points: [
          "Informations de l'entreprise",
          "Nature de l'activité",
          "Capacités annoncées",
          "Expérience sur le produit recherché",
          "Documents disponibles",
        ],
      },

      {
        heading: "4. Commander un échantillon lorsque cela est pertinent",

        paragraphs: [
          "Pour de nombreux produits, l'échantillon permet d'évaluer concrètement les matériaux, dimensions, fonctions ou finitions avant une production plus importante.",

          "Un bon échantillon ne garantit pas à lui seul que toute la production sera identique. Il constitue toutefois une référence utile pour définir ce qui est attendu.",
        ],
      },

      {
        heading: "5. Prévoir le contrôle avant l'expédition",

        paragraphs: [
          "Lorsque la marchandise est encore chez le fournisseur, il est généralement plus simple d'identifier un problème et de demander une correction qu'après l'arrivée de la commande dans le pays de destination.",

          "Les critères de contrôle doivent être définis selon le produit et les spécifications convenues avec le fournisseur.",
        ],
      },
    ],

    relatedLinks: [
      {
        label: "Recherche de fournisseurs",
        href: "/fournisseurs",
      },
      {
        label: "Contrôle qualité en Chine",
        href: "/controle-qualite",
      },
      {
        label: "Sourcing en Chine",
        href: "/sourcing",
      },
      {
        label: "Développement produit",
        href: "/developpement-produit",
      },
    ],
  },

  {
    slug: "fob-exw-cif-differences",

    category: "Incoterms",

    title: "FOB, EXW, CIF : quelles différences ?",

    metaTitle: "FOB, EXW ou CIF : Quelles Différences à l'Import ?",

    metaDescription:
      "Comprenez les principales différences entre EXW, FOB et CIF et leurs conséquences sur l'organisation, les coûts et les responsabilités d'une importation.",

    excerpt:
      "Comprendre les différences entre EXW, FOB et CIF avant de comparer les offres de fournisseurs et les coûts logistiques.",

    readingTime: "7 min",

    introduction:
      "Les Incoterms définissent certaines obligations respectives du vendeur et de l'acheteur ainsi que les points de transfert des risques et la répartition de certains coûts. Ils doivent être lus avec précision : un prix CIF ou FOB ne représente pas nécessairement le coût final rendu à destination.",

    sections: [
      {
        heading: "Pourquoi l'Incoterm influence le prix d'une offre",

        paragraphs: [
          "Deux fournisseurs peuvent proposer le même produit à des prix différents simplement parce que leurs offres ne couvrent pas les mêmes prestations logistiques.",

          "Avant de comparer deux prix, il faut donc vérifier l'Incoterm proposé ainsi que le lieu ou port précisément indiqué.",
        ],
      },

      {
        heading: "EXW : marchandise mise à disposition",

        paragraphs: [
          "En EXW, le vendeur met la marchandise à disposition au lieu convenu, souvent dans ses locaux. L'acheteur prend en charge une part importante de l'organisation de l'acheminement.",

          "Ce type d'offre peut paraître moins cher au départ, mais il faut ajouter les coûts nécessaires pour récupérer la marchandise et organiser les étapes suivantes.",
        ],

        points: [
          "Prix usine facilement identifiable",
          "Organisation logistique plus importante côté acheteur",
          "Frais locaux à intégrer au calcul",
        ],
      },

      {
        heading: "FOB : une référence fréquente en transport maritime",

        paragraphs: [
          "FOB est utilisé pour le transport maritime ou fluvial. Le vendeur prend en charge certaines opérations jusqu'au chargement de la marchandise à bord du navire au port d'expédition convenu.",

          "L'acheteur organise ensuite notamment le fret principal et les opérations relevant de son côté de l'Incoterm.",
        ],
      },

      {
        heading: "CIF : fret et assurance inclus jusqu'au port convenu",

        paragraphs: [
          "En CIF, le prix comprend notamment le coût de la marchandise, le fret jusqu'au port de destination convenu et une couverture d'assurance correspondant aux obligations prévues par cet Incoterm.",

          "CIF ne signifie cependant pas que les droits, taxes, frais portuaires, livraison finale ou autres coûts à destination sont nécessairement inclus.",
        ],
      },

      {
        heading: "Quel Incoterm choisir ?",

        paragraphs: [
          "Il n'existe pas un Incoterm systématiquement meilleur que les autres. Le choix dépend notamment de votre capacité à organiser le transport, de votre transitaire, du pays de départ, du mode de transport et des conditions proposées par le vendeur.",

          "L'essentiel est de comparer les offres sur une base équivalente et de calculer le coût global plutôt que de comparer uniquement le montant inscrit sur la facture du fournisseur.",
        ],
      },
    ],

    relatedLinks: [
      {
        label: "Logistique internationale",
        href: "/logistique",
      },
      {
        label: "Calculer un coût de revient",
        href: "/ressources/calculer-cout-revient-import",
      },
      {
        label: "FCL ou LCL",
        href: "/ressources/fcl-lcl-differences",
      },
    ],
  },

  {
    slug: "calculer-cout-revient-import",

    category: "Import",

    title: "Comment calculer le coût de revient d'un produit importé ?",

    metaTitle: "Calculer le Coût de Revient d'un Produit Importé",

    metaDescription:
      "Méthode pour calculer le coût de revient d'un produit importé : prix usine, transport, fret, assurance, droits de douane, taxes et frais annexes.",

    excerpt:
      "Prix fournisseur, transport, droits, taxes et frais annexes : les principaux éléments à intégrer dans votre calcul.",

    readingTime: "10 min",

    featured: true,

    introduction:
      "Le prix payé au fournisseur ne représente qu'une partie du coût réel d'un produit importé. Pour déterminer la rentabilité d'une opération, il faut reconstruire le coût de revient jusqu'au point qui correspond réellement à votre activité.",

    sections: [
      {
        heading: "1. Partir du coût de la marchandise",

        paragraphs: [
          "Le calcul commence par le prix des produits selon les quantités commandées et les conditions commerciales négociées avec le fournisseur.",

          "Les frais de personnalisation, moules, packaging, échantillons ou accessoires doivent également être ajoutés lorsqu'ils font partie du projet.",
        ],

        points: [
          "Prix unitaire",
          "Quantité",
          "Packaging",
          "Personnalisation",
          "Éventuels frais de développement",
        ],
      },

      {
        heading: "2. Ajouter les frais avant le départ",

        paragraphs: [
          "Selon l'Incoterm et l'organisation retenue, des coûts peuvent apparaître entre l'usine et le départ international de la marchandise.",

          "Ils peuvent notamment comprendre un transport domestique, la consolidation ou différentes opérations logistiques.",
        ],
      },

      {
        heading: "3. Intégrer le fret international",

        paragraphs: [
          "Le coût du transport dépend fortement du volume, du poids, de la destination et du mode choisi : maritime, aérien, ferroviaire ou routier.",

          "Pour le maritime, il faut également distinguer une expédition en conteneur complet d'une expédition en groupage.",
        ],
      },

      {
        heading: "4. Anticiper droits, taxes et frais à destination",

        paragraphs: [
          "Les marchandises peuvent être soumises à des droits de douane et à différentes taxes selon leur classification, leur origine et leur pays de destination.",

          "Des frais liés au traitement logistique, au port, au terminal, au dossier ou à la livraison finale peuvent également intervenir selon l'opération.",
        ],
      },

      {
        heading: "5. Ramener le coût global à une unité",

        paragraphs: [
          "Une fois l'ensemble des coûts de l'opération estimés, ils peuvent être répartis entre les produits afin d'obtenir un coût de revient par unité.",

          "Cette méthode permet ensuite de comparer le coût importé au prix de vente envisagé et de mesurer plus correctement la marge disponible.",
        ],
      },

      {
        heading: "Ne pas confondre coût d'importation et TVA récupérable",

        paragraphs: [
          "Dans une analyse financière, la manière de traiter la TVA dépend de la situation fiscale de l'entreprise et de l'opération. Elle ne doit donc pas être intégrée mécaniquement comme une charge définitive sans tenir compte du contexte.",
        ],
      },
    ],

    relatedLinks: [
      {
        label: "FOB, EXW et CIF",
        href: "/ressources/fob-exw-cif-differences",
      },
      {
        label: "Logistique internationale",
        href: "/logistique",
      },
      {
        label: "FCL ou LCL",
        href: "/ressources/fcl-lcl-differences",
      },
      {
        label: "Sourcing en Chine",
        href: "/sourcing",
      },
    ],
  },

  {
    slug: "importer-voiture-chine",

    category: "Automobile",

    title: "Importer une voiture de Chine : les étapes essentielles",

    metaTitle: "Importer une Voiture de Chine : Étapes & Logistique",

    metaDescription:
      "Les étapes d'une importation automobile depuis la Chine : recherche du véhicule, vérification de l'offre, achat, export, transport RoRo ou conteneur.",

    excerpt:
      "Recherche du véhicule, vérification, achat, export et transport : les principales étapes à anticiper avant une importation automobile.",

    readingTime: "12 min",

    featured: true,

    introduction:
      "Importer un véhicule depuis la Chine ne consiste pas simplement à comparer un prix chinois à un prix de vente local. Il faut analyser le véhicule, le vendeur, les conditions d'exportation, la logistique et les exigences du pays où le véhicule devra être utilisé.",

    sections: [
      {
        heading: "1. Définir précisément le véhicule recherché",

        paragraphs: [
          "Une même appellation commerciale peut correspondre à plusieurs motorisations, finitions ou années-modèles. La recherche doit donc préciser la configuration attendue.",

          "Il est également utile de définir le nombre de véhicules, le budget et le pays de destination dès le départ.",
        ],

        points: [
          "Marque et modèle",
          "Motorisation",
          "Version et équipements",
          "Quantité",
          "Budget cible",
          "Pays de destination",
        ],
      },

      {
        heading: "2. Comparer les offres disponibles en Chine",

        paragraphs: [
          "Les offres peuvent provenir de différents types d'acteurs. Le prix doit être comparé avec la configuration exacte du véhicule, les conditions commerciales et ce qui est réellement inclus.",

          "Une offre particulièrement basse peut cacher une différence de version, de disponibilité, de condition ou de services associés.",
        ],
      },

      {
        heading: "3. Vérifier les informations avant le paiement",

        paragraphs: [
          "Avant de procéder à l'achat, les informations disponibles sur le vendeur et le véhicule doivent être examinées selon le niveau de risque de l'opération.",

          "Le contenu et le niveau de vérification peuvent varier selon que le véhicule est neuf, déjà immatriculé, en stock ou commandé spécialement.",
        ],
      },

      {
        heading: "4. Organiser l'export depuis la Chine",

        paragraphs: [
          "Une fois le véhicule acheté, l'opération doit pouvoir être exportée conformément aux procédures applicables et aux conditions du vendeur.",

          "Les documents et étapes peuvent varier selon le véhicule, le vendeur, le port utilisé et la destination.",
        ],
      },

      {
        heading: "5. Choisir entre RoRo et conteneur",

        paragraphs: [
          "Le transport RoRo est une solution fréquemment utilisée pour les véhicules roulants lorsque des lignes adaptées existent. Le véhicule est embarqué sur un navire conçu pour ce type de chargement.",

          "Le conteneur constitue une autre possibilité. Le choix dépend notamment du véhicule, du port, de la destination, des disponibilités et du coût logistique.",
        ],
      },

      {
        heading: "6. Vérifier les règles du pays de destination",

        paragraphs: [
          "La possibilité d'acheter et d'expédier un véhicule ne signifie pas automatiquement qu'il pourra être immatriculé ou utilisé dans le pays de destination.",

          "Les exigences d'homologation, d'immatriculation, de fiscalité ou de conformité doivent donc être étudiées séparément pour le marché concerné avant l'achat.",
        ],
      },
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
        label: "Secteur automobile",
        href: "/secteurs/automobile",
      },
    ],
  },

  {
    slug: "controle-qualite-avant-expedition",

    category: "Contrôle qualité",

    title: "Pourquoi contrôler une commande avant expédition ?",

    metaTitle: "Contrôle Qualité en Chine Avant Expédition",

    metaDescription:
      "Découvrez le rôle d'une inspection avant expédition en Chine, les éléments pouvant être contrôlés et les différences avec un audit fournisseur.",

    excerpt:
      "Comprendre le rôle du contrôle qualité avant expédition et les éléments à vérifier avant le départ de la marchandise.",

    readingTime: "8 min",

    introduction:
      "Une inspection avant expédition permet d'obtenir des informations concrètes sur une commande alors qu'elle se trouve encore chez le fournisseur. Elle ne supprime pas tous les risques, mais peut permettre d'identifier certains écarts avant le départ de la marchandise.",

    sections: [
      {
        heading: "Pourquoi contrôler avant l'expédition ?",

        paragraphs: [
          "Lorsque la marchandise est déjà arrivée dans le pays de destination, une correction peut devenir longue et coûteuse. Effectuer certains contrôles avant le départ permet de prendre une décision avec davantage d'informations.",

          "L'inspection doit toutefois être adaptée au produit : contrôler un canapé, un appareil électronique ou une machine ne demande pas exactement la même méthode.",
        ],
      },

      {
        heading: "Définir les critères de contrôle à l'avance",

        paragraphs: [
          "Un contrôle efficace repose sur une référence claire : commande, cahier des charges, échantillon validé, photos, dimensions ou autres spécifications.",

          "Sans critères définis, il devient difficile de déterminer objectivement si un produit correspond à ce qui a été commandé.",
        ],

        points: [
          "Référence et modèle",
          "Quantités",
          "Dimensions",
          "Aspect et finitions",
          "Fonctions contrôlables",
          "Packaging et marquages",
        ],
      },

      {
        heading: "Documenter les observations",

        paragraphs: [
          "Les résultats d'une inspection peuvent être documentés au moyen de photos, de relevés et d'observations permettant au client de mieux comprendre l'état de la commande.",

          "Lorsque des anomalies sont identifiées, ces informations permettent d'échanger avec le fournisseur avant de décider de la suite.",
        ],
      },

      {
        heading: "Inspection produit et audit fournisseur : deux objectifs différents",

        paragraphs: [
          "Une inspection avant expédition se concentre principalement sur une commande ou des produits. Un audit fournisseur cherche plutôt à obtenir des informations sur l'entreprise, son organisation ou ses capacités selon le périmètre défini.",

          "Selon le projet, les deux approches peuvent être complémentaires mais ne répondent pas au même besoin.",
        ],
      },
    ],

    relatedLinks: [
      {
        label: "Contrôle qualité",
        href: "/controle-qualite",
      },
      {
        label: "Recherche fournisseurs",
        href: "/fournisseurs",
      },
      {
        label: "Trouver un fournisseur fiable",
        href: "/ressources/trouver-fournisseur-fiable-chine",
      },
    ],
  },

  {
    slug: "fcl-lcl-differences",

    category: "Logistique",

    title: "FCL ou LCL : quelle solution maritime choisir ?",

    metaTitle: "FCL ou LCL : Quelle Solution de Transport Maritime ?",

    metaDescription:
      "Comprenez les différences entre FCL et LCL : conteneur complet ou groupage maritime, volumes, organisation et critères pour choisir.",

    excerpt:
      "Conteneur complet ou groupage maritime : comprendre les différences entre FCL et LCL avant d'organiser votre transport.",

    readingTime: "7 min",

    introduction:
      "FCL et LCL sont deux modes courants d'organisation du transport maritime conteneurisé. Le meilleur choix dépend du volume, de la nature de la marchandise, du coût global et des contraintes de l'opération.",

    sections: [
      {
        heading: "Que signifie FCL ?",

        paragraphs: [
          "FCL signifie Full Container Load. Dans ce type d'expédition, un conteneur est utilisé pour une seule opération ou un seul chargeur selon l'organisation retenue.",

          "Il ne faut pas nécessairement remplir chaque mètre cube du conteneur pour utiliser une solution FCL. La décision dépend surtout du coût et des contraintes logistiques.",
        ],
      },

      {
        heading: "Que signifie LCL ?",

        paragraphs: [
          "LCL signifie Less than Container Load. Plusieurs expéditions peuvent partager l'espace d'un même conteneur.",

          "Cette solution permet d'expédier des volumes plus faibles sans réserver un conteneur complet, mais implique généralement des opérations de consolidation et de déconsolidation.",
        ],
      },

      {
        heading: "Quand envisager le LCL ?",

        paragraphs: [
          "Le LCL peut être intéressant lorsque le volume est insuffisant pour justifier économiquement un conteneur complet.",

          "Il est particulièrement utile pour certaines commandes de test, petits volumes ou opérations regroupant plusieurs fournisseurs.",
        ],
      },

      {
        heading: "Quand le FCL devient-il intéressant ?",

        paragraphs: [
          "Lorsque le volume augmente, le coût du groupage doit être comparé au coût d'un conteneur complet. À partir d'un certain niveau, le FCL peut devenir plus logique économiquement ou opérationnellement.",

          "Il n'existe cependant pas un seuil universel valable pour toutes les routes : les tarifs de fret et frais locaux évoluent.",
        ],
      },

      {
        heading: "Comparer le coût total et pas uniquement le fret",

        paragraphs: [
          "Le prix du transport maritime n'est qu'une partie du calcul. Les frais de consolidation, de traitement, de destination et d'acheminement peuvent modifier la comparaison.",

          "Il est donc préférable de comparer les solutions sur le coût global de l'opération et non uniquement sur une ligne de fret.",
        ],
      },
    ],

    relatedLinks: [
      {
        label: "Logistique internationale",
        href: "/logistique",
      },
      {
        label: "Calculer un coût de revient",
        href: "/ressources/calculer-cout-revient-import",
      },
      {
        label: "Comprendre FOB, EXW et CIF",
        href: "/ressources/fob-exw-cif-differences",
      },
    ],
  },
];