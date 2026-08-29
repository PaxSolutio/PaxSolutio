"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { navigation } from "@/data/navigation";
import { featuredOffers } from "@/data/featuredOffers";

type NavigationItem = (typeof navigation)[number];

function DesktopMegaMenu({
  item,
}: {
  item: NavigationItem;
}) {
  if (!item.children) return null;

  const featuredOffer = featuredOffers.find(
    (offer) =>
      offer.active &&
      offer.placement.includes("header")
  );

  return (
    <div
      className="
        invisible absolute left-1/2 top-full
        z-[120]
        w-[820px] -translate-x-1/2 pt-5
        opacity-0 translate-y-2
        transition-all duration-200
        group-hover:visible
        group-hover:translate-y-0
        group-hover:opacity-100
      "
    >
      <div className="rounded-[24px] border border-[#DDE5EE] bg-white p-3 shadow-[0_28px_90px_rgba(7,27,51,0.18)]">
        <div className="grid grid-cols-2 gap-2">
          {item.children.map((child) => (
            <Link
              key={`${child.label}-${child.href}`}
              href={child.href}
              className="group/link rounded-[18px] bg-white p-5 transition duration-200 hover:bg-[#F6F8FB]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-extrabold text-[#071B33]">
                    {child.label}
                  </div>

                  {child.description && (
                    <p className="mt-2 text-sm leading-6 text-[#657386]">
                      {child.description}
                    </p>
                  )}
                </div>

                <span className="mt-1 shrink-0 text-[#176BFF] transition group-hover/link:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {featuredOffer ? (
          <Link
            href={featuredOffer.href}
            className="mt-2 flex items-center justify-between gap-6 rounded-[18px] bg-[#071B33] px-6 py-5 text-white transition hover:bg-[#0A2340]"
          >
            <div>
              {featuredOffer.badge && (
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#75A8FF]">
                  {featuredOffer.badge}
                </div>
              )}

              <div className="font-extrabold">
                {featuredOffer.title}
              </div>

              {featuredOffer.subtitle && (
                <div className="mt-1 text-xs text-white/55">
                  {featuredOffer.subtitle}
                </div>
              )}

              {featuredOffer.price && (
                <div className="mt-2 text-sm font-extrabold text-[#75A8FF]">
                  {featuredOffer.price}
                </div>
              )}
            </div>

            <div className="shrink-0 text-sm font-extrabold">
              {featuredOffer.cta} →
            </div>
          </Link>
        ) : (
          <div className="mt-2 flex items-center justify-between gap-6 rounded-[18px] bg-[#071B33] px-6 py-5 text-white">
            <div>
              <div className="text-sm font-extrabold">
                Vous avez un projet en Chine ?
              </div>

              <div className="mt-1 text-xs text-white/55">
                Produit, fournisseur, véhicule ou transport :
                présentez-nous votre besoin.
              </div>
            </div>

            <Link
              href="/#project"
              className="shrink-0 rounded-xl bg-white px-5 py-3 text-xs font-extrabold !text-[#071B33] transition hover:bg-[#F1F4F8]"
            >
              Démarrer →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [openedMenu, setOpenedMenu] =
    useState<string | null>(null);

  const [scrolled, setScrolled] =
    useState(false);

  const headerOffer = featuredOffers.find(
    (offer) =>
      offer.active &&
      offer.placement.includes("header")
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
    setOpenedMenu(null);
  }

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-[100] w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-[#E3E9F0] bg-white/95 shadow-[0_8px_30px_rgba(7,27,51,0.06)] backdrop-blur-xl"
            : "border-transparent bg-white/90 backdrop-blur-lg"
        }`}
      >
        {headerOffer && (
          <Link
            href={headerOffer.href}
            className="hidden bg-[#071B33] px-6 py-2.5 text-center text-xs text-white transition hover:bg-[#0A2340] sm:block"
          >
            <span className="font-extrabold">
              {headerOffer.badge && (
                <span className="mr-2 text-[#78A9FF]">
                  {headerOffer.badge}
                </span>
              )}

              {headerOffer.title}
            </span>

            {headerOffer.subtitle && (
              <span className="ml-2 text-white/55">
                — {headerOffer.subtitle}
              </span>
            )}

            {headerOffer.price && (
              <span className="ml-3 font-extrabold text-[#78A9FF]">
                {headerOffer.price}
              </span>
            )}

            <span className="ml-3 font-extrabold">
              {headerOffer.cta} →
            </span>
          </Link>
        )}

        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="relative z-[110] text-[21px] font-extrabold tracking-[-0.04em] text-[#071B33]"
          >
            PAX
            <span className="text-[#176BFF]">
              SOLUTIO
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-8 lg:flex">
            {navigation.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="group relative flex h-full items-center"
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#35445A] transition hover:text-[#176BFF]"
                  >
                    {item.label}

                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  <DesktopMegaMenu item={item} />
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-semibold text-[#35445A] transition hover:text-[#176BFF]"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden lg:block">
            <Link
              href="/#project"
              className="inline-flex min-h-12 items-center rounded-xl bg-[#176BFF] px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              Démarrer un projet
            </Link>
          </div>

          <button
            type="button"
            aria-label={
              mobileOpen
                ? "Fermer le menu"
                : "Ouvrir le menu"
            }
            aria-expanded={mobileOpen}
            onClick={() =>
              setMobileOpen((value) => !value)
            }
            className="relative z-[110] flex h-11 w-11 items-center justify-center rounded-xl border border-[#DFE6EF] bg-white lg:hidden"
          >
            <div className="relative h-5 w-5">
              <span
                className={`absolute left-0 top-[4px] h-[2px] w-5 rounded-full bg-[#071B33] transition duration-300 ${
                  mobileOpen
                    ? "translate-y-[5px] rotate-45"
                    : ""
                }`}
              />

              <span
                className={`absolute left-0 top-[9px] h-[2px] w-5 rounded-full bg-[#071B33] transition duration-300 ${
                  mobileOpen
                    ? "opacity-0"
                    : "opacity-100"
                }`}
              />

              <span
                className={`absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-[#071B33] transition duration-300 ${
                  mobileOpen
                    ? "-translate-y-[5px] -rotate-45"
                    : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[90] bg-white transition duration-300 lg:hidden ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      >
        <div
          className={`h-full overflow-y-auto px-6 pb-10 transition duration-300 ${
            headerOffer
              ? "pt-[150px]"
              : "pt-[105px]"
          }`}
        >
          <nav>
            {navigation.map((item) => {
              const isOpen =
                openedMenu === item.label;

              return (
                <div
                  key={item.label}
                  className="border-b border-[#E9EDF2]"
                >
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="flex-1 py-5 text-[20px] font-extrabold tracking-[-0.03em] text-[#071B33]"
                    >
                      {item.label}
                    </Link>

                    {item.children && (
                      <button
                        type="button"
                        aria-label={`Afficher ${item.label}`}
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenedMenu(
                            isOpen
                              ? null
                              : item.label
                          )
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F7FA] text-[#176BFF]"
                      >
                        <span
                          className={`text-xl transition duration-200 ${
                            isOpen
                              ? "rotate-45"
                              : ""
                          }`}
                        >
                          +
                        </span>
                      </button>
                    )}
                  </div>

                  {item.children && (
                    <div
                      className={`grid overflow-hidden transition-all duration-300 ${
                        isOpen
                          ? "grid-rows-[1fr] pb-5"
                          : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0">
                        <div className="space-y-2">
                          {item.children.map(
                            (child) => (
                              <Link
                                key={`${child.label}-${child.href}`}
                                href={child.href}
                                onClick={closeMobileMenu}
                                className="block rounded-[18px] bg-[#F7F9FC] p-4"
                              >
                                <div className="text-sm font-extrabold text-[#071B33]">
                                  {child.label}
                                </div>

                                {child.description && (
                                  <div className="mt-1 text-xs leading-5 text-[#657386]">
                                    {
                                      child.description
                                    }
                                  </div>
                                )}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {headerOffer && (
            <Link
              href={headerOffer.href}
              onClick={closeMobileMenu}
              className="mt-8 block rounded-[24px] bg-[#071B33] p-6 text-white"
            >
              {headerOffer.badge && (
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#75A8FF]">
                  {headerOffer.badge}
                </div>
              )}

              <div className="mt-3 text-xl font-extrabold">
                {headerOffer.title}
              </div>

              {headerOffer.subtitle && (
                <div className="mt-2 text-sm text-white/55">
                  {headerOffer.subtitle}
                </div>
              )}

              {headerOffer.price && (
                <div className="mt-3 font-extrabold text-[#75A8FF]">
                  {headerOffer.price}
                </div>
              )}

              <div className="mt-6 text-sm font-extrabold">
                {headerOffer.cta} →
              </div>
            </Link>
          )}

          <Link
            href="/#project"
            onClick={closeMobileMenu}
            className="mt-8 flex min-h-14 w-full items-center justify-center rounded-xl bg-[#176BFF] px-6 text-sm font-extrabold text-white"
          >
            Démarrer un projet
          </Link>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/a-propos"
              onClick={closeMobileMenu}
              className="text-xs font-bold text-[#657386]"
            >
              À propos
            </Link>

            <span className="text-[#CBD3DD]">
              •
            </span>

            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="text-xs font-bold text-[#657386]"
            >
              Contact
            </Link>

            <span className="text-[#CBD3DD]">
              •
            </span>

            <Link
              href="/ressources"
              onClick={closeMobileMenu}
              className="text-xs font-bold text-[#657386]"
            >
              Guides
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}