"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

type SearchResult = {
  id: string;
  type:
    | "signal"
    | "opportunity"
    | "project"
    | "supplier"
    | "quote";
  label: string;
  description: string | null;
  href: string;
};

type Props = {
  onOpenNavigation?: () => void;
};

function getPageTitle(
  pathname: string
) {
  if (
    pathname ===
    "/admin/intelligence"
  ) {
    return "Vue globale";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/opportunites"
    )
  ) {
    return "Opportunités";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/execution"
    )
  ) {
    return "Projets";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/actions"
    )
  ) {
    return "Actions";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/radar"
    )
  ) {
    return "Radar";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/dossiers"
    )
  ) {
    return "Dossiers";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/fournisseurs"
    )
  ) {
    return "Fournisseurs";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/cotations"
    )
  ) {
    return "Cotations";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/conformite"
    )
  ) {
    return "Conformité";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/analytics"
    )
  ) {
    return "Analytics";
  }

  if (
    pathname.startsWith(
      "/admin/intelligence/parametres"
    )
  ) {
    return "Paramètres";
  }

  if (
    pathname.startsWith(
      "/admin/nouveautes"
    )
  ) {
    return "Publications";
  }

  return "PaxSolutio Intelligence";
}

function resultTypeLabel(
  type: SearchResult["type"]
) {
  switch (type) {
    case "signal":
      return "Radar";

    case "opportunity":
      return "Opportunité";

    case "project":
      return "Projet";

    case "supplier":
      return "Fournisseur";

    case "quote":
      return "Cotation";

    default:
      return "Résultat";
  }
}

export default function IntelligenceTopbar({
  onOpenNavigation,
}: Props) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const title =
    getPageTitle(pathname);

  const searchContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const actionContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const searchInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    actionsOpen,
    setActionsOpen,
  ] = useState(false);

  const [query, setQuery] =
    useState("");

  const [
    results,
    setResults,
  ] =
    useState<SearchResult[]>(
      []
    );

  const [
    searching,
    setSearching,
  ] = useState(false);

  // =========================================================
  // RACCOURCIS
  // =========================================================

  useEffect(() => {
    function handleShortcut(
      event: KeyboardEvent
    ) {
      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        setSearchOpen(true);
        setActionsOpen(false);

        window.setTimeout(
          () => {
            searchInputRef.current?.focus();
          },
          50
        );
      }

      if (
        event.key === "Escape"
      ) {
        setSearchOpen(false);
        setActionsOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleShortcut
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleShortcut
      );
    };
  }, []);

  // =========================================================
  // CLIC EXTÉRIEUR
  // =========================================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          target
        )
      ) {
        setSearchOpen(false);
      }

      if (
        actionContainerRef.current &&
        !actionContainerRef.current.contains(
          target
        )
      ) {
        setActionsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =========================================================
  // RECHERCHE
  // =========================================================

  useEffect(() => {
    const cleanQuery =
      query.trim();

    if (
      cleanQuery.length < 2
    ) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        async () => {
          try {
            setSearching(true);

            const response =
              await fetch(
                `/api/admin/intelligence/search?q=${encodeURIComponent(
                  cleanQuery
                )}`,
                {
                  signal:
                    controller.signal,
                }
              );

            const data =
              await response.json();

            if (
              response.ok &&
              data.success
            ) {
              setResults(
                data.results ??
                  []
              );
            } else {
              setResults([]);
            }
          } catch (error) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

            console.error(
              "Erreur recherche Intelligence :",
              error
            );

            setResults([]);
          } finally {
            setSearching(false);
          }
        },
        300
      );

    return () => {
      window.clearTimeout(
        timer
      );

      controller.abort();
    };
  }, [query]);

  function openSearch() {
    setSearchOpen(true);
    setActionsOpen(false);

    window.setTimeout(
      () => {
        searchInputRef.current?.focus();
      },
      50
    );
  }

  function openResult(
    result: SearchResult
  ) {
    setSearchOpen(false);
    setQuery("");
    setResults([]);

    router.push(
      result.href
    );
  }

  return (
    <header
      className="
        sticky top-0 z-40
        flex h-[72px]
        items-center justify-between gap-3
        border-b border-white/[0.07]
        bg-[#080b10]/90 px-3
        backdrop-blur-xl
        sm:px-5 lg:px-8
      "
    >
      {/* LEFT */}

      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Ouvrir la navigation"
          onClick={
            onOpenNavigation
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
        >
          ☰
        </button>

        <div className="min-w-0">
          <div className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600 sm:block">
            Intelligence Command Center
          </div>

          <h1 className="truncate text-sm font-semibold text-zinc-100 sm:mt-1 sm:text-base">
            {title}
          </h1>
        </div>
      </div>

      {/* RIGHT */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* SEARCH */}

        <div
          ref={
            searchContainerRef
          }
          className="relative"
        >
          <button
            type="button"
            onClick={
              openSearch
            }
            className="
              hidden h-10 min-w-[260px]
              items-center justify-between
              rounded-xl border border-white/[0.07]
              bg-white/[0.025] px-4
              text-left text-sm text-zinc-500
              transition hover:border-white/[0.12]
              hover:bg-white/[0.04]
              md:flex
            "
          >
            <span>
              Rechercher...
            </span>

            <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-zinc-600">
              Ctrl K
            </span>
          </button>

          <button
            type="button"
            aria-label="Rechercher"
            onClick={
              openSearch
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-400 transition hover:bg-white/[0.05] hover:text-white md:hidden"
          >
            ⌕
          </button>

          {searchOpen && (
            <div className="fixed inset-x-3 top-[82px] z-[80] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d1118] shadow-2xl shadow-black/50 sm:inset-x-auto sm:right-5 sm:w-[480px] lg:right-8">
              <div className="border-b border-white/[0.07] p-3">
                <input
                  ref={
                    searchInputRef
                  }
                  type="text"
                  value={query}
                  onChange={(
                    event
                  ) =>
                    setQuery(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Projet, fournisseur, opportunité, signal..."
                  className="
                    h-11 w-full rounded-xl
                    border border-white/[0.08]
                    bg-white/[0.035] px-4
                    text-sm text-white outline-none
                    placeholder:text-zinc-600
                    focus:border-blue-500/30
                  "
                />
              </div>

              <div className="max-h-[min(420px,calc(100vh-160px))] overflow-y-auto p-2">
                {query.trim().length <
                2 ? (
                  <div className="px-4 py-8 text-center text-sm text-zinc-600">
                    Saisissez au moins
                    deux caractères.
                  </div>
                ) : searching ? (
                  <div className="px-4 py-8 text-center text-sm text-zinc-500">
                    Recherche...
                  </div>
                ) : results.length ===
                  0 ? (
                  <div className="px-4 py-8 text-center text-sm text-zinc-600">
                    Aucun résultat.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map(
                      (result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          onClick={() =>
                            openResult(
                              result
                            )
                          }
                          className="
                            flex w-full
                            items-start gap-3
                            rounded-xl px-3 py-3
                            text-left transition
                            hover:bg-white/[0.05]
                          "
                        >
                          <div className="mt-0.5 shrink-0 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                            {resultTypeLabel(
                              result.type
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-zinc-200">
                              {
                                result.label
                              }
                            </div>

                            {result.description && (
                              <div className="mt-1 truncate text-xs text-zinc-600">
                                {
                                  result.description
                                }
                              </div>
                            )}
                          </div>

                          <div className="mt-1 text-xs text-zinc-600">
                            →
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}

        <div
          ref={
            actionContainerRef
          }
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setActionsOpen(
                (current) =>
                  !current
              );

              setSearchOpen(false);
            }}
            className="
              h-10 rounded-xl
              border border-white/[0.08]
              bg-white px-3
              text-sm font-semibold text-black
              transition hover:bg-zinc-200
              sm:px-4
            "
          >
            <span className="sm:hidden">
              +
            </span>

            <span className="hidden sm:inline">
              + Nouvelle action
            </span>
          </button>

          {actionsOpen && (
            <div className="absolute right-0 top-12 w-[280px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d1118] p-2 shadow-2xl shadow-black/40">
              <div className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Actions rapides
              </div>

              <ActionLink
                href="/admin/intelligence"
                title="Lancer une veille"
                description="Exécuter une mission Intelligence"
                onClick={() =>
                  setActionsOpen(false)
                }
              />

              <ActionLink
                href="/admin/intelligence/opportunites"
                title="Gérer les opportunités"
                description="Étudier ou créer un dossier"
                onClick={() =>
                  setActionsOpen(false)
                }
              />

              <ActionLink
                href="/admin/intelligence/execution"
                title="Ouvrir les projets"
                description="Piloter l'exécution"
                onClick={() =>
                  setActionsOpen(false)
                }
              />

              <ActionLink
                href="/admin/intelligence/fournisseurs"
                title="Ajouter un fournisseur"
                description="Ouvrir le sourcing"
                onClick={() =>
                  setActionsOpen(false)
                }
              />

              <div className="my-2 border-t border-white/[0.06]" />

              <ActionLink
                href="/admin/nouveautes/nouveau"
                title="Nouvelle publication"
                description="Créer un contenu PaxSolutio"
                onClick={() =>
                  setActionsOpen(false)
                }
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ActionLink({
  href,
  title,
  description,
  onClick,
}: {
  href: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-3 py-3 transition hover:bg-white/[0.05]"
    >
      <div className="text-sm font-medium text-zinc-200">
        {title}
      </div>

      <div className="mt-1 text-xs text-zinc-600">
        {description}
      </div>
    </Link>
  );
}