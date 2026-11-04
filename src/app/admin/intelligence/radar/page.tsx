import { requireAdminPage } from "@/lib/admin-access";
import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// =========================================================
// TYPES
// =========================================================

type IntelligenceItem = {
  id: string;
  title: string;
  summary: string | null;
  item_type: string;

  categories: string[];
  countries: string[];
  companies: string[];
  products: string[];

  total_score: number | null;
  confidence_score: number | null;
  urgency_score: number | null;
  risk_score: number | null;

  status: string;
  detected_at: string;
};

type SearchParams = {
  q?: string;
  type?: string;
  category?: string;
  country?: string;
  priority?: string;
  risk?: string;
};

const TYPE_LABELS: Record<string, string> = {
  news: "Actualité",
  product: "Produit",
  company: "Entreprise",
  competitor: "Concurrent",
  regulation: "Réglementation",
  geopolitics: "Géopolitique",
  logistics: "Logistique",
  market: "Marché",
  technology: "Technologie",
  opportunity: "Opportunité",
  event: "Événement",
  weak_signal: "Signal faible",
};

// =========================================================
// HELPERS
// =========================================================

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type;
}

function scoreTone(value: number | null) {
  if (value === null) {
    return "text-zinc-500";
  }

  if (value >= 85) {
    return "text-red-300";
  }

  if (value >= 70) {
    return "text-amber-300";
  }

  if (value >= 50) {
    return "text-blue-300";
  }

  return "text-zinc-400";
}

// =========================================================
// PAGE
// =========================================================

export default async function IntelligenceRadarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPage();

  const params = await searchParams;

  // =========================================================
  // AUTHENTIFICATION
  // =========================================================

  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const supabase =
    createServerSupabaseClient();

  const {
    data: admin,
    error: adminError,
  } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    redirect("/admin/login");
  }

  // =========================================================
  // DONNÉES RADAR
  // =========================================================

  const {
    data: itemsData,
    error: itemsError,
  } = await supabase
    .from("intelligence_items")
    .select(
      `
        id,
        title,
        summary,
        item_type,
        categories,
        countries,
        companies,
        products,
        total_score,
        confidence_score,
        urgency_score,
        risk_score,
        status,
        detected_at
      `
    )
    .order("detected_at", {
      ascending: false,
    })
    .limit(250);

  if (itemsError) {
    console.error(
      "Erreur chargement Radar Intelligence :",
      itemsError
    );
  }

  const items =
    (itemsData ?? []) as IntelligenceItem[];

  // =========================================================
  // VALEURS FILTRES
  // =========================================================

  const availableTypes = [
    ...new Set(
      items
        .map((item) => item.item_type)
        .filter(Boolean)
    ),
  ].sort();

  const availableCategories = [
    ...new Set(
      items.flatMap(
        (item) => item.categories ?? []
      )
    ),
  ].sort();

  const availableCountries = [
    ...new Set(
      items.flatMap(
        (item) => item.countries ?? []
      )
    ),
  ].sort();

  // =========================================================
  // FILTRES
  // =========================================================

  const query =
    (params.q ?? "")
      .trim()
      .toLowerCase();

  const typeFilter =
    params.type ?? "all";

  const categoryFilter =
    params.category ?? "all";

  const countryFilter =
    params.country ?? "all";

  const priorityFilter =
    params.priority ?? "all";

  const riskFilter =
    params.risk ?? "all";

  const filteredItems = items.filter(
    (item) => {
      const searchValues = [
        item.title,
        item.summary,
        ...(item.categories ?? []),
        ...(item.countries ?? []),
        ...(item.companies ?? []),
        ...(item.products ?? []),
      ]
        .filter(Boolean)
        .map((value) =>
          String(value).toLowerCase()
        );

      const matchesSearch =
        query.length === 0 ||
        searchValues.some((value) =>
          value.includes(query)
        );

      const matchesType =
        typeFilter === "all" ||
        item.item_type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        (item.categories ?? []).includes(
          categoryFilter
        );

      const matchesCountry =
        countryFilter === "all" ||
        (item.countries ?? []).includes(
          countryFilter
        );

      const matchesPriority =
        priorityFilter === "all" ||
        (priorityFilter === "high" &&
          (item.total_score ?? 0) >= 85) ||
        (priorityFilter === "medium" &&
          (item.total_score ?? 0) >= 70 &&
          (item.total_score ?? 0) < 85) ||
        (priorityFilter === "normal" &&
          (item.total_score ?? 0) < 70);

      const matchesRisk =
        riskFilter === "all" ||
        (riskFilter === "high" &&
          (item.risk_score ?? 0) >= 70) ||
        (riskFilter === "medium" &&
          (item.risk_score ?? 0) >= 40 &&
          (item.risk_score ?? 0) < 70) ||
        (riskFilter === "low" &&
          (item.risk_score ?? 0) < 40);

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesCountry &&
        matchesPriority &&
        matchesRisk
      );
    }
  );

  // =========================================================
  // KPIs
  // =========================================================

  const highPriority = items.filter(
    (item) =>
      (item.total_score ?? 0) >= 85
  ).length;

  const urgent = items.filter(
    (item) =>
      (item.urgency_score ?? 0) >= 75
  ).length;

  const highRisk = items.filter(
    (item) =>
      (item.risk_score ?? 0) >= 70
  ).length;

  const opportunities = items.filter(
    (item) =>
      item.item_type === "opportunity"
  ).length;

  const regulations = items.filter(
    (item) =>
      item.item_type === "regulation"
  ).length;

  const weakSignals = items.filter(
    (item) =>
      item.item_type === "weak_signal"
  ).length;

  const filtersActive =
    query.length > 0 ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    countryFilter !== "all" ||
    priorityFilter !== "all" ||
    riskFilter !== "all";

  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            Intelligence Radar
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Radar
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Exploration des signaux,
            tendances, risques et
            opportunités détectés par
            les missions de veille
            PaxSolutio Intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]" />

          Veille active
        </div>
      </div>

      {/* =====================================================
          KPIs
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Signaux"
          value={items.length}
        />

        <MetricCard
          label="Haute priorité"
          value={highPriority}
          tone="amber"
        />

        <MetricCard
          label="Urgents"
          value={urgent}
          tone="red"
        />

        <MetricCard
          label="Risques élevés"
          value={highRisk}
          tone="red"
        />

        <MetricCard
          label="Opportunités"
          value={opportunities}
          tone="green"
        />

        <MetricCard
          label="Signaux faibles"
          value={weakSignals}
          tone="blue"
        />
      </div>

      {/* =====================================================
          SYNTHÈSE
      ====================================================== */}

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <SummaryCard
          label="Réglementation"
          value={regulations}
          description="signaux réglementaires détectés"
        />

        <SummaryCard
          label="Opportunités potentielles"
          value={opportunities}
          description="signaux classifiés comme opportunités"
          tone="green"
        />

        <SummaryCard
          label="Alertes"
          value={urgent + highRisk}
          description="urgences ou risques élevés"
          tone="red"
        />
      </div>

      {/* =====================================================
          FILTRES
      ====================================================== */}

      <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <form
          method="GET"
          className="space-y-3"
        >
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="min-w-0 flex-1">
              <input
                type="search"
                name="q"
                defaultValue={
                  params.q ?? ""
                }
                placeholder="Rechercher un produit, une entreprise, un pays, un signal..."
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/10 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-blue-500/30"
              />
            </div>

            <select
              name="type"
              defaultValue={
                typeFilter
              }
              className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
            >
              <option value="all">
                Tous les types
              </option>

              {availableTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {typeLabel(
                      type
                    )}
                  </option>
                )
              )}
            </select>

            <select
              name="priority"
              defaultValue={
                priorityFilter
              }
              className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
            >
              <option value="all">
                Toute priorité
              </option>

              <option value="high">
                Haute ≥ 85
              </option>

              <option value="medium">
                Moyenne 70–84
              </option>

              <option value="normal">
                Standard &lt; 70
              </option>
            </select>

            <select
              name="risk"
              defaultValue={
                riskFilter
              }
              className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
            >
              <option value="all">
                Tous les risques
              </option>

              <option value="high">
                Risque élevé
              </option>

              <option value="medium">
                Risque moyen
              </option>

              <option value="low">
                Risque faible
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <select
                name="category"
                defaultValue={
                  categoryFilter
                }
                className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
              >
                <option value="all">
                  Toutes les catégories
                </option>

                {availableCategories.map(
                  (category) => (
                    <option
                      key={category}
                      value={
                        category
                      }
                    >
                      {category}
                    </option>
                  )
                )}
              </select>

              <select
                name="country"
                defaultValue={
                  countryFilter
                }
                className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
              >
                <option value="all">
                  Tous les pays
                </option>

                {availableCountries.map(
                  (country) => (
                    <option
                      key={country}
                      value={
                        country
                      }
                    >
                      {country}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Appliquer
              </button>

              {filtersActive && (
                <a
                  href="/admin/intelligence/radar"
                  className="inline-flex h-10 items-center rounded-xl border border-white/[0.08] px-4 text-sm text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-300"
                >
                  Réinitialiser
                </a>
              )}
            </div>
          </div>
        </form>

        <div className="mt-3 text-xs text-zinc-600">
          {
            filteredItems.length
          }{" "}
          signal
          {filteredItems.length >
          1
            ? "s"
            : ""}{" "}
          affiché
          {filteredItems.length >
          1
            ? "s"
            : ""}
          {" · "}
          {items.length} au total
        </div>
      </section>

      {/* =====================================================
          FLUX
      ====================================================== */}

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Flux Intelligence
            </div>

            <h2 className="mt-2 text-xl font-semibold">
              Signaux détectés
            </h2>
          </div>

          <div className="text-xs text-zinc-600">
            {
              filteredItems.length
            }{" "}
            résultat
            {filteredItems.length >
            1
              ? "s"
              : ""}
          </div>
        </div>

        {filteredItems.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
            <div className="font-medium text-zinc-300">
              Aucun signal
            </div>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Aucun résultat ne
              correspond aux filtres
              sélectionnés.
            </p>

            {filtersActive && (
              <a
                href="/admin/intelligence/radar"
                className="mt-5 inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200"
              >
                Réinitialiser les
                filtres
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(
              (item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.035]"
                >
                  <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                    {/* INFORMATION */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                          {typeLabel(
                            item.item_type
                          )}
                        </span>

                        {(item.categories ??
                          [])
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              category
                            ) => (
                              <span
                                key={
                                  category
                                }
                                className="rounded-lg border border-blue-500/10 bg-blue-500/10 px-2.5 py-1 text-[10px] text-blue-300"
                              >
                                {
                                  category
                                }
                              </span>
                            )
                          )}
                      </div>

                      <h3 className="mt-4 text-base font-semibold leading-6 text-white">
                        {
                          item.title
                        }
                      </h3>

                      {item.summary && (
                        <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
                          {
                            item.summary
                          }
                        </p>
                      )}

                      {/* ENTITÉS */}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-zinc-600">
                        <span>
                          {formatDate(
                            item.detected_at
                          )}
                        </span>

                        {item.countries
                          ?.length >
                          0 && (
                          <span>
                            Pays :{" "}
                            {item.countries
                              .slice(
                                0,
                                3
                              )
                              .join(
                                " · "
                              )}
                          </span>
                        )}

                        {item.companies
                          ?.length >
                          0 && (
                          <span>
                            Entreprises :{" "}
                            {item.companies
                              .slice(
                                0,
                                3
                              )
                              .join(
                                " · "
                              )}
                          </span>
                        )}

                        {item.products
                          ?.length >
                          0 && (
                          <span>
                            Produits :{" "}
                            {item.products
                              .slice(
                                0,
                                3
                              )
                              .join(
                                " · "
                              )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SCORES */}

                    <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-[390px] xl:justify-end">
                      <Score
                        label="Score"
                        value={
                          item.total_score
                        }
                      />

                      <Score
                        label="Confiance"
                        value={
                          item.confidence_score
                        }
                      />

                      <Score
                        label="Urgence"
                        value={
                          item.urgency_score
                        }
                      />

                      <Score
                        label="Risque"
                        value={
                          item.risk_score
                        }
                      />
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// =========================================================
// COMPONENTS
// =========================================================

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?:
    | "default"
    | "green"
    | "amber"
    | "red"
    | "blue";
}) {
  const toneClass = {
    default: "text-white",
    green: "text-emerald-300",
    amber: "text-amber-300",
    red: "text-red-300",
    blue: "text-blue-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>

      <div
        className={`mt-3 text-3xl font-semibold ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string;
  value: number;
  description: string;
  tone?:
    | "default"
    | "green"
    | "red";
}) {
  const toneClass = {
    default: "text-white",
    green: "text-emerald-300",
    red: "text-red-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>

      <div
        className={`mt-3 text-2xl font-semibold ${toneClass}`}
      >
        {value}
      </div>

      <div className="mt-2 text-xs text-zinc-600">
        {description}
      </div>
    </div>
  );
}

function Score({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="min-w-[74px] rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </div>

      <div
        className={`mt-1 text-xs font-semibold ${scoreTone(
          value
        )}`}
      >
        {value ?? "—"}
        {value !== null
          ? "/100"
          : ""}
      </div>
    </div>
  );
}