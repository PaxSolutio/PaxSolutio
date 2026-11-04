import Link from "next/link";
import styles from "./HeroQuickLinks.module.css";

const links = [
  { label: "Nos offres", href: "#offres", path: "M3 7h18v14H3zM7 7V3h10v4M3 12h18M9 12v3h6v-3" },
  { label: "Sourcing Chine", href: "/sourcing", path: "M3 21V10l6 3V7l6 3V3h6v18H3zM7 17h1m4 0h1m4 0h1" },
  { label: "Sourcing automobile", href: "/sourcing-automobile", path: "M4 10l2-6h12l2 6M3 10h18v8H3zM5 18v3m14-3v3M6 14h2m8 0h2" },
  { label: "Transport international", href: "/logistique", path: "M2 5h13v13H2zM15 10h4l3 4v4h-7M7 18a2 2 0 1 0 0 .1M18 18a2 2 0 1 0 0 .1" },
];

export default function HeroQuickLinks() {
  return <nav className={styles.links} aria-label="Accès rapides">
    {links.map(link => <Link key={link.href} href={link.href} className={styles.card}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={link.path}/></svg>
      <span>{link.label}</span><span className={styles.arrow} aria-hidden="true">↗</span>
    </Link>)}
  </nav>;
}
