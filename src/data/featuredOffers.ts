export type FeaturedOffer = {
  id: string;

  title: string;

  subtitle?: string;

  category: string;

  href: string;

  cta: string;

  image?: string;

  price?: string;

  marketPrice?: string;

  badge?: string;

  note?: string;

  placement: (
    | "header"
    | "homepage"
    | "automotive"
    | "resources"
  )[];

  active: boolean;
};

export const featuredOffers: FeaturedOffer[] = [
  {
    id: "example-automotive",

    title: "Offre automobile",

    subtitle:
      "Exemple d'une future opportunité de sourcing automobile",

    category: "Automobile",

    href: "/sourcing-automobile",

    cta: "Découvrir",

    badge: "Exemple",

    placement: [
      "header",
    ],

    active: false,
  },
];