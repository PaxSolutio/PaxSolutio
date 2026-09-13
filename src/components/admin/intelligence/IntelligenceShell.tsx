"use client";

import type { ReactNode } from "react";
import {
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import IntelligenceSidebar from "./IntelligenceSidebar";
import IntelligenceTopbar from "./IntelligenceTopbar";

export default function IntelligenceShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  // Ferme automatiquement la sidebar mobile après navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Empêche le scroll de fond quand la sidebar mobile est ouverte
  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileSidebarOpen]);

  // ESC ferme le menu mobile
  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080b10] text-white">
      {/* SIDEBAR DESKTOP */}

      <IntelligenceSidebar
        variant="desktop"
      />

      {/* SIDEBAR MOBILE */}

      {mobileSidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer la navigation"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm lg:hidden"
          />

          <IntelligenceSidebar
            variant="mobile"
            onNavigate={() =>
              setMobileSidebarOpen(false)
            }
          />
        </>
      )}

      {/* CONTENU */}

      <div className="min-h-screen min-w-0 lg:pl-[260px]">
        <IntelligenceTopbar
          onOpenNavigation={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="min-h-[calc(100vh-72px)] min-w-0 overflow-x-hidden px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}