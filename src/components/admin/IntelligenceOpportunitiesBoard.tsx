"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import type {
  IntelligenceOpportunity,
} from "@/app/admin/intelligence/opportunites/page";

// =========================================================
// TYPES
// =========================================================

type Props = {
  initialOpportunities: IntelligenceOpportunity[];
};

type OpportunityStatus =
  | "to_review"
  | "analyzing"
  | "validated"
  | "rejected"
  | "converted";

type KindFilter =
  | "all"
  | "product"
  | "strategic";

type StatusFilter =
  | "all"
  | OpportunityStatus;

// =========================================================
// CONFIGURATION
// =========================================================

const columns: {
  status: OpportunityStatus;
  title: string;
  description: string;
}[] = [
  {
    status: "to_review",
    title: "À étudier",
    description: "Nouveaux dossiers",
  },
  {
    status: "analyzing",
    title: "En analyse",
    description: "Étude en cours",
  },
  {
    status: "validated",
    title: "Validées",
    description: "Opportunités retenues",
  },
  {
    status: "converted",
    title: "Converties",
    description: "Passées à l'action",
  },
  {
    status: "rejected",
    title: "Rejetées",
    description: "Non retenues",
  },
];

const STATUS_LABELS: Record<
  OpportunityStatus,
  string
> = {
  to_review: "À étudier",
  analyzing: "En analyse",
  validated: "Validée",
  converted: "Convertie",
  rejected: "Rejetée",
};

// =========================================================
// HELPERS
// =========================================================

function getKindLabel(
  kind: string
) {
  if (kind === "product") {
    return "Produit";
  }

  return "Stratégique";
}

function getPriorityTone(
  score: number | null
) {
  if (score === null) {
    return "text-zinc-500";
  }

  if (score >= 85) {
    return "text-amber-300";
  }

  if (score >= 70) {
    return "text-emerald-300";
  }

  return "text-zinc-400";
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

// =========================================================
// CARD
// =========================================================

function OpportunityCard({
  opportunity,
}: {
  opportunity: IntelligenceOpportunity;
}) {
  const sourceCount =
    opportunity.source_item_ids
      ?.length ?? 0;

  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-blue-500/20 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            opportunity.opportunity_kind ===
            "product"
              ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-300"
              : "border-blue-500/15 bg-blue-500/10 text-blue-300"
          }`}
        >
          {getKindLabel(
            opportunity.opportunity_kind
          )}
        </span>

        <div className="text-right">
          <div className="text-[9px] uppercase tracking-[0.12em] text-zinc-700">
            Priorité
          </div>

          <div
            className={`mt-1 text-xs font-semibold ${getPriorityTone(
              opportunity.priority_score
            )}`}
          >
            {opportunity.priority_score ??
              "—"}
            {opportunity.priority_score !==
              null && "/100"}
          </div>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-zinc-100">
        {opportunity.product_name ||
          opportunity.title}
      </h3>

      {opportunity.summary && (
        <p className="mt-2 line-clamp-4 text-xs leading-5 text-zinc-500">
          {opportunity.summary}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {opportunity.confidence_score !==
          null && (
          <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-500">
            Confiance{" "}
            {
              opportunity.confidence_score
            }
            %
          </span>
        )}

        {sourceCount > 0 && (
          <span className="rounded-lg border border-blue-500/10 bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">
            {sourceCount} signal
            {sourceCount > 1
              ? "s"
              : ""}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="text-[10px] text-zinc-700">
          {formatDate(
            opportunity.created_at
          )}
        </span>

        <Link
          href={`/admin/intelligence/opportunites/${opportunity.id}`}
          className="text-xs font-semibold text-blue-300 transition group-hover:text-blue-200"
        >
          Ouvrir →
        </Link>
      </div>
    </article>
  );
}

// =========================================================
// MAIN
// =========================================================

export default function IntelligenceOpportunitiesBoard({
  initialOpportunities,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [
    kindFilter,
    setKindFilter,
  ] =
    useState<KindFilter>(
      "all"
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "all"
    );

  const [
    highPriorityOnly,
    setHighPriorityOnly,
  ] =
    useState(false);

  const opportunities =
    initialOpportunities;

  // =========================================================
  // KPIs
  // =========================================================

  const total =
    opportunities.length;

  const highPriority =
    opportunities.filter(
      (opportunity) =>
        (opportunity.priority_score ??
          0) >= 85
    ).length;

  const productCount =
    opportunities.filter(
      (opportunity) =>
        opportunity.opportunity_kind ===
        "product"
    ).length;

  const validatedCount =
    opportunities.filter(
      (opportunity) =>
        opportunity.status ===
          "validated" ||
        opportunity.status ===
          "converted"
    ).length;

  const analyzingCount =
    opportunities.filter(
      (opportunity) =>
        opportunity.status ===
        "analyzing"
    ).length;

  const convertedCount =
    opportunities.filter(
      (opportunity) =>
        opportunity.status ===
        "converted"
    ).length;

  // =========================================================
  // FILTRES
  // =========================================================

  const filteredOpportunities =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return opportunities.filter(
        (opportunity) => {
          const matchesSearch =
            normalizedSearch.length ===
              0 ||
            [
              opportunity.title,
              opportunity.product_name,
              opportunity.summary,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              );

          const matchesKind =
            kindFilter === "all" ||
            (kindFilter ===
              "product" &&
              opportunity.opportunity_kind ===
                "product") ||
            (kindFilter ===
              "strategic" &&
              opportunity.opportunity_kind !==
                "product");

          const matchesStatus =
            statusFilter ===
              "all" ||
            opportunity.status ===
              statusFilter;

          const matchesPriority =
            !highPriorityOnly ||
            (opportunity.priority_score ??
              0) >= 85;

          return (
            matchesSearch &&
            matchesKind &&
            matchesStatus &&
            matchesPriority
          );
        }
      );
    }, [
      opportunities,
      search,
      kindFilter,
      statusFilter,
      highPriorityOnly,
    ]);

  const opportunitiesByStatus =
    useMemo(() => {
      return columns.reduce(
        (result, column) => {
          result[column.status] =
            filteredOpportunities.filter(
              (opportunity) =>
                opportunity.status ===
                column.status
            );

          return result;
        },
        {} as Record<
          OpportunityStatus,
          IntelligenceOpportunity[]
        >
      );
    }, [
      filteredOpportunities,
    ]);

  const filtersActive =
    search.trim().length >
      0 ||
    kindFilter !== "all" ||
    statusFilter !== "all" ||
    highPriorityOnly;

  function resetFilters() {
    setSearch("");
    setKindFilter("all");
    setStatusFilter("all");
    setHighPriorityOnly(false);
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mx-auto max-w-[1800px]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            Opportunity Intelligence
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Opportunités
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Qualification et suivi des
            opportunités détectées par
            PaxSolutio Intelligence.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/intelligence/dossiers"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            Vue dossiers
          </Link>

          <Link
            href="/admin/intelligence/radar"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10 px-4 text-sm font-medium text-blue-300 transition hover:bg-blue-500/15"
          >
            Ouvrir le Radar
          </Link>
        </div>
      </div>

      {/* =====================================================
          KPI
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric
          label="Opportunités"
          value={total}
        />

        <Metric
          label="Haute priorité"
          value={
            highPriority
          }
          tone="amber"
        />

        <Metric
          label="Produits"
          value={productCount}
          tone="green"
        />

        <Metric
          label="En analyse"
          value={analyzingCount}
          tone="blue"
        />

        <Metric
          label="Retenues"
          value={
            validatedCount
          }
          tone="green"
        />

        <Metric
          label="Converties"
          value={
            convertedCount
          }
          tone="violet"
        />
      </div>

      {/* =====================================================
          FILTRES
      ====================================================== */}

      <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <input
              type="search"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Rechercher une opportunité..."
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/10 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-blue-500/30"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={
                kindFilter
              }
              onChange={(
                event
              ) =>
                setKindFilter(
                  event
                    .target
                    .value as KindFilter
                )
              }
              className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
            >
              <option value="all">
                Tous les types
              </option>

              <option value="product">
                Produits
              </option>

              <option value="strategic">
                Stratégiques
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event
                    .target
                    .value as StatusFilter
                )
              }
              className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
            >
              <option value="all">
                Tous les statuts
              </option>

              {columns.map(
                (column) => (
                  <option
                    key={
                      column.status
                    }
                    value={
                      column.status
                    }
                  >
                    {
                      column.title
                    }
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                setHighPriorityOnly(
                  (current) =>
                    !current
                )
              }
              className={`h-10 rounded-xl border px-4 text-sm font-medium transition ${
                highPriorityOnly
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                  : "border-white/[0.08] bg-white/[0.025] text-zinc-400 hover:bg-white/[0.05]"
              }`}
            >
              Priorité ≥ 85
            </button>

            {filtersActive && (
              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="h-10 rounded-xl border border-white/[0.08] px-4 text-sm text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-300"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-600">
          {
            filteredOpportunities.length
          }{" "}
          résultat
          {filteredOpportunities.length >
          1
            ? "s"
            : ""}
        </div>
      </section>

      {/* =====================================================
          EMPTY GLOBAL
      ====================================================== */}

      {opportunities.length ===
      0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
          <div className="text-lg font-semibold text-white">
            Aucune opportunité
          </div>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
            Les opportunités créées
            depuis les Briefs
            Intelligence apparaîtront
            ici.
          </p>

          <Link
            href="/admin/intelligence/radar"
            className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Ouvrir le Radar
          </Link>
        </section>
      ) : filteredOpportunities.length ===
        0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
          <div className="font-medium text-zinc-300">
            Aucun résultat
          </div>

          <p className="mt-2 text-sm text-zinc-600">
            Aucun dossier ne
            correspond aux filtres
            sélectionnés.
          </p>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="mt-5 text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            Réinitialiser les
            filtres
          </button>
        </section>
      ) : (
        /* ===================================================
            KANBAN
        ==================================================== */

        <section className="mt-6 overflow-x-auto pb-10">
          <div className="grid min-w-[1500px] grid-cols-5 gap-4">
            {columns.map(
              (column) => {
                const columnItems =
                  opportunitiesByStatus[
                    column
                      .status
                  ] ?? [];

                return (
                  <div
                    key={
                      column.status
                    }
                    className="rounded-2xl border border-white/[0.07] bg-black/10 p-3"
                  >
                    <div className="flex items-start justify-between gap-3 px-2 pb-4 pt-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                          {
                            STATUS_LABELS[
                              column
                                .status
                            ]
                          }
                        </div>

                        <h2 className="mt-1 text-sm font-semibold text-white">
                          {
                            column.title
                          }
                        </h2>

                        <div className="mt-1 text-xs text-zinc-600">
                          {
                            column.description
                          }
                        </div>
                      </div>

                      <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-zinc-400">
                        {
                          columnItems.length
                        }
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnItems.length ===
                      0 ? (
                        <div className="rounded-2xl border border-dashed border-white/[0.06] px-4 py-10 text-center text-xs text-zinc-700">
                          Aucun dossier
                        </div>
                      ) : (
                        columnItems.map(
                          (
                            opportunity
                          ) => (
                            <OpportunityCard
                              key={
                                opportunity.id
                              }
                              opportunity={
                                opportunity
                              }
                            />
                          )
                        )
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}
    </div>
  );
}

// =========================================================
// KPI
// =========================================================

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?:
    | "default"
    | "blue"
    | "green"
    | "amber"
    | "violet";
}) {
  const cls = {
    default:
      "text-white",
    blue:
      "text-blue-300",
    green:
      "text-emerald-300",
    amber:
      "text-amber-300",
    violet:
      "text-violet-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>

      <div
        className={`mt-3 text-3xl font-semibold ${cls}`}
      >
        {value}
      </div>
    </div>
  );
}