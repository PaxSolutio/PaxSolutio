export type FeaturedOffer = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  href: string;
  cta: string;
  image?: string;
  price?: string;
  badge?: string;
  placement: ("header" | "homepage" | "automotive")[];
  active: boolean;
};

export const featuredOffers: FeaturedOffer[] = [
  {
    id: "example-automotive",
    title: "Offre automobile",
    subtitle: "Exemple d'une future offre mise en avant",
    category: "Automobile",
    href: "/sourcing-automobile",
    cta: "Découvrir",
    badge: "Exemple",
    placement: ["header"],
    active: false,
  },
];