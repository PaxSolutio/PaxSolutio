import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <><nav aria-label="Rubriques administratives" className="flex flex-wrap gap-5 bg-[#071B33] px-6 py-3 text-sm text-white"><a href="/admin/intelligence">Administration</a><a href="/admin/offres">Offres</a><a href="/admin/suivi-projets">Suivi des projets</a></nav>{children}</>;
}