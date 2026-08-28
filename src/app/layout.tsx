import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paxsolutio.com"),

  title: {
    default:
      "PaxSolutio | Sourcing, contrôle qualité & logistique internationale",
    template: "%s | PaxSolutio",
  },

  description:
    "PaxSolutio accompagne les entreprises dans le sourcing international, la recherche de fournisseurs, le sourcing automobile, le contrôle qualité et la logistique internationale.",

  keywords: [
    "sourcing international",
    "sourcing Chine",
    "recherche fournisseur Chine",
    "import Chine",
    "sourcing automobile",
    "contrôle qualité Chine",
    "audit usine",
    "logistique internationale",
    "import export",
    "PaxSolutio",
  ],

  authors: [
    {
      name: "PaxSolutio",
      url: "https://paxsolutio.com",
    },
  ],

  creator: "PaxSolutio",
  publisher: "PaxSolutio",

  alternates: {
    canonical: "https://paxsolutio.com",
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",

    url: "https://paxsolutio.com",

    siteName: "PaxSolutio",

    title:
      "PaxSolutio | Sourcing, contrôle qualité & logistique internationale",

    description:
      "Sourcing international, recherche fournisseurs, automobile, contrôle qualité et logistique internationale.",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PaxSolutio — Sourcing & Supply Chain",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "PaxSolutio | Sourcing, contrôle qualité & logistique internationale",

    description:
      "Sourcing international, recherche fournisseurs, automobile, contrôle qualité et logistique internationale.",

    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}