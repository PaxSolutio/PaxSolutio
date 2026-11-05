"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  label: string;
  href: string;
  icon: string;
  exact?: boolean;
};

type Props = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

const primaryNavigation: NavigationItem[] = [
  {
    label: "Vue globale",
    href: "/admin/intelligence",
    icon: "▦",
    exact: true,
  },
  {
    label: "Radar",
    href: "/admin/intelligence/radar",
    icon: "⌁",
  },
  {
    label: "Opportunités",
    href: "/admin/intelligence/opportunites",
    icon: "◇",
  },
  {
    label: "Dossiers",
    href: "/admin/intelligence/dossiers",
    icon: "▤",
  },
  {
    label: "Projets",
    href: "/admin/intelligence/execution",
    icon: "▣",
  },
];

const operationalNavigation: NavigationItem[] = [
  {label: "Suivi des projets", href: "/admin/suivi-projets", icon: "↗"},
  {
    label: "Fournisseurs",
    href: "/admin/intelligence/fournisseurs",
    icon: "♙",
  },
  {
    label: "Cotations",
    href: "/admin/intelligence/cotations",
    icon: "◫",
  },
  {
    label: "Conformité",
    href: "/admin/intelligence/conformite",
    icon: "✓",
  },
];

const analysisNavigation: NavigationItem[] = [
  {
    label: "Analytics",
    href: "/admin/intelligence/analytics",
    icon: "⌁",
  },
  {
    label: "Publications",
    href: "/admin/nouveautes",
    icon: "▧",
  },
];

function NavItem({
  item,
  onNavigate,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`
        group flex items-center gap-3 rounded-xl px-3 py-2.5
        text-sm font-medium transition-all duration-200
        ${
          active
            ? "bg-white/[0.08] text-white"
            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
        }
      `}
    >
      <span
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
          border text-sm transition
          ${
            active
              ? "border-white/15 bg-white/10 text-white"
              : "border-white/[0.06] bg-white/[0.02] text-zinc-500 group-hover:text-zinc-300"
          }
        `}
      >
        {item.icon}
      </span>

      <span className="truncate">
        {item.label}
      </span>
    </Link>
  );
}

function NavigationSection({
  items,
  onNavigate,
}: {
  items: NavigationItem[];
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export default function IntelligenceSidebar({
  variant = "desktop",
  onNavigate,
}: Props) {
  const pathname = usePathname();

  const settingsActive =
    pathname.startsWith(
      "/admin/intelligence/parametres"
    );

  const isDesktop =
    variant === "desktop";

  return (
    <aside
      className={
        isDesktop
          ? `
              fixed inset-y-0 left-0 z-50 hidden w-[260px]
              flex-col border-r border-white/[0.07]
              bg-[#0b0e13] lg:flex
            `
          : `
              fixed inset-y-0 left-0 z-[70] flex w-[280px]
              max-w-[86vw] flex-col border-r border-white/[0.07]
              bg-[#0b0e13] shadow-2xl shadow-black/50
              lg:hidden
            `
      }
    >
      {/* BRAND */}

      <div className="flex h-[88px] items-center justify-between border-b border-white/[0.07] px-5">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500">
            PAXSOLUTIO
          </div>

          <div className="mt-1 text-[15px] font-semibold tracking-wide text-white">
            Intelligence
          </div>
        </div>

        {!isDesktop && (
          <button
            type="button"
            aria-label="Fermer"
            onClick={onNavigate}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* STATUS */}

      <div className="border-b border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />

          System online
        </div>
      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <NavigationSection
          items={primaryNavigation}
          onNavigate={onNavigate}
        />

        <div className="my-5 border-t border-white/[0.06]" />

        <NavigationSection
          items={operationalNavigation}
          onNavigate={onNavigate}
        />

        <div className="my-5 border-t border-white/[0.06]" />

        <NavigationSection
          items={analysisNavigation}
          onNavigate={onNavigate}
        />
      </nav>

      {/* FOOTER */}

      <div className="border-t border-white/[0.07] p-3">
        <Link
          href="/admin/intelligence/parametres"
          onClick={onNavigate}
          className={`
            flex items-center gap-3 rounded-xl px-3 py-2.5
            text-sm font-medium transition
            ${
              settingsActive
                ? "bg-white/[0.08] text-white"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }
          `}
        >
          <span
            className={`
              flex h-8 w-8 items-center justify-center rounded-lg border
              ${
                settingsActive
                  ? "border-white/15 bg-white/10 text-white"
                  : "border-white/[0.06]"
              }
            `}
          >
            ⚙
          </span>

          Paramètres
        </Link>

        <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
          <div className="text-sm font-medium text-zinc-200">
            Administrateur
          </div>

          <div className="mt-0.5 text-xs text-zinc-500">
            PaxSolutio Intelligence
          </div>
        </div>
      </div>
    </aside>
  );
}