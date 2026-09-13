import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ExecutionProject = {
  id: string;
  opportunity_id: string;
  study_id: string | null;
  reassessment_id: string | null;

  title: string;
  product_name: string | null;

  target_market: string | null;
  target_country: string | null;

  status: string;
  priority: string;

  target_purchase_price: number | null;
  target_landed_cost: number | null;
  target_sale_price: number | null;

  currency: string | null;

  source_decision: string;

  created_at: string;
  updated_at: string;
};

type SearchParams = {
  q?: string;
  status?: string;
  priority?: string;
};

const STATUS_LABELS: Record<string, string> = {
  qualification: "Qualification",
  sourcing: "Sourcing",
  quotation: "Cotations",
  sample: "Échantillon",
  compliance: "Conformité",
  logistics: "Logistique",
  commercial_ready: "Prêt commercialement",
  launched: "Lancé",
  cancelled: "Annulé",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

const STATUS_PROGRESS: Record<string, number> = {
  qualification: 10,
  sourcing: 25,
  quotation: 40,
  sample: 55,
  compliance: 65,
  logistics: 80,
  commercial_ready: 90,
  launched: 100,
  cancelled: 0,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(
  value: number | null,
  currency: string | null
) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function IntelligenceExecutionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const supabase =
    createServerSupabaseClient();

  const {
    data,
    error,
  } = await supabase
    .from("intelligence_execution_projects")
    .select("*")
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const projects =
    (data ?? []) as ExecutionProject[];

  const query =
    (params.q ?? "")
      .trim()
      .toLowerCase();

  const statusFilter =
    params.status ?? "all";

  const priorityFilter =
    params.priority ?? "all";

  const filteredProjects =
    projects.filter((project) => {
      const matchesSearch =
        !query ||
        [
          project.title,
          project.product_name,
          project.target_market,
          project.target_country,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );

      const matchesStatus =
        statusFilter === "all" ||
        project.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        project.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });

  const activeProjects =
    projects.filter(
      (project) =>
        project.status !== "launched" &&
        project.status !== "cancelled"
    );

  const qualificationProjects =
    projects.filter(
      (project) =>
        project.status === "qualification"
    );

  const sourcingProjects =
    projects.filter((project) =>
      [
        "sourcing",
        "quotation",
        "sample",
        "compliance",
        "logistics",
        "commercial_ready",
      ].includes(project.status)
    );

  const launchedProjects =
    projects.filter(
      (project) =>
        project.status === "launched"
    );

  const highPriorityProjects =
    activeProjects.filter(
      (project) =>
        project.priority === "high"
    );

  const commercialReadyProjects =
    projects.filter(
      (project) =>
        project.status ===
        "commercial_ready"
    );

  const filtersActive =
    query.length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all";

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            Execution Intelligence
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Projets
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Pilotage opérationnel des opportunités ayant franchi
            l&apos;analyse Intelligence et obtenu une décision GO.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/intelligence/opportunites"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            Opportunités
          </Link>

          <Link
            href="/admin/intelligence/dossiers"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10 px-4 text-sm font-medium text-blue-300 transition hover:bg-blue-500/15"
          >
            Dossiers
          </Link>
        </div>
      </div>

      {/* =====================================================
          KPI
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Projets actifs"
          value={activeProjects.length}
        />

        <MetricCard
          label="À qualifier"
          value={qualificationProjects.length}
        />

        <MetricCard
          label="En exécution"
          value={sourcingProjects.length}
          tone="blue"
        />

        <MetricCard
          label="Haute priorité"
          value={highPriorityProjects.length}
          tone="amber"
        />

        <MetricCard
          label="Prêts commercialement"
          value={commercialReadyProjects.length}
          tone="green"
        />

        <MetricCard
          label="Lancements"
          value={launchedProjects.length}
          tone="violet"
        />
      </div>

      {/* =====================================================
          FILTRES
      ====================================================== */}

      <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <form
          method="GET"
          className="flex flex-col gap-3 xl:flex-row xl:items-center"
        >
          <div className="min-w-0 flex-1">
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Rechercher un projet, produit, marché ou pays..."
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/10 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-blue-500/30"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
            >
              <option value="all">
                Tous les statuts
              </option>

              {Object.entries(
                STATUS_LABELS
              ).map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>

            <select
              name="priority"
              defaultValue={priorityFilter}
              className="h-10 rounded-xl border border-white/[0.08] bg-[#0d1118] px-3 text-sm text-zinc-300 outline-none"
            >
              <option value="all">
                Toutes priorités
              </option>

              <option value="high">
                Haute
              </option>

              <option value="medium">
                Moyenne
              </option>

              <option value="low">
                Basse
              </option>
            </select>

            <button
              type="submit"
              className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Filtrer
            </button>

            {filtersActive && (
              <Link
                href="/admin/intelligence/execution"
                className="inline-flex h-10 items-center rounded-xl border border-white/[0.08] px-4 text-sm text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-300"
              >
                Réinitialiser
              </Link>
            )}
          </div>
        </form>

        <div className="mt-3 text-xs text-zinc-600">
          {filteredProjects.length} résultat
          {filteredProjects.length > 1
            ? "s"
            : ""}
        </div>
      </section>

      {/* =====================================================
          EMPTY
      ====================================================== */}

      {projects.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
            →
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Aucun projet en exécution
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            Lorsqu&apos;une opportunité Intelligence obtiendra un verdict
            GO et sera validée pour l&apos;exécution, elle apparaîtra ici.
          </p>

          <Link
            href="/admin/intelligence/opportunites"
            className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Voir les opportunités
          </Link>
        </section>
      ) : filteredProjects.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
          <div className="font-medium text-zinc-300">
            Aucun projet trouvé
          </div>

          <p className="mt-2 text-sm text-zinc-600">
            Aucun projet ne correspond aux filtres sélectionnés.
          </p>

          <Link
            href="/admin/intelligence/execution"
            className="mt-5 inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            Réinitialiser les filtres
          </Link>
        </section>
      ) : (
        /* ===================================================
            PROJETS
        ==================================================== */

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredProjects.map(
            (project) => {
              const progress =
                STATUS_PROGRESS[
                  project.status
                ] ?? 0;

              return (
                <article
                  key={project.id}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-blue-500/20 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={project.status}
                        />

                        <PriorityBadge
                          priority={
                            project.priority
                          }
                        />
                      </div>

                      <h2 className="mt-4 truncate text-lg font-semibold text-zinc-100">
                        {project.title}
                      </h2>

                      {project.product_name && (
                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {
                            project.product_name
                          }
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right text-[10px] text-zinc-700">
                      Mis à jour

                      <div className="mt-1 text-xs text-zinc-400">
                        {formatDate(
                          project.updated_at
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PROGRESSION */}

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        Progression
                      </span>

                      <span className="font-semibold text-zinc-300">
                        {progress}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={`h-full rounded-full ${
                          project.status ===
                          "cancelled"
                            ? "bg-red-500/60"
                            : project.status ===
                                "launched"
                              ? "bg-emerald-500/70"
                              : "bg-blue-500/70"
                        }`}
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* FINANCES */}

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <DataBox
                      label="Achat cible"
                      value={formatPrice(
                        project.target_purchase_price,
                        project.currency
                      )}
                    />

                    <DataBox
                      label="Coût rendu"
                      value={formatPrice(
                        project.target_landed_cost,
                        project.currency
                      )}
                    />

                    <DataBox
                      label="Vente cible"
                      value={formatPrice(
                        project.target_sale_price,
                        project.currency
                      )}
                    />
                  </div>

                  {/* MARCHÉ */}

                  {(project.target_market ||
                    project.target_country) && (
                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-500">
                      {project.target_market && (
                        <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
                          Marché :{" "}
                          {
                            project.target_market
                          }
                        </span>
                      )}

                      {project.target_country && (
                        <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
                          Pays :{" "}
                          {
                            project.target_country
                          }
                        </span>
                      )}
                    </div>
                  )}

                  {/* ACTION */}

                  <div className="mt-6 border-t border-white/[0.06] pt-5">
                    <Link
                      href={`/admin/intelligence/execution/${project.id}`}
                      className="inline-flex text-sm font-semibold text-blue-300 transition group-hover:text-blue-200"
                    >
                      Ouvrir le projet d&apos;exécution →
                    </Link>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}
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
    | "blue"
    | "green"
    | "amber"
    | "violet";
}) {
  const cls = {
    default: "text-white",
    blue: "text-blue-300",
    green: "text-emerald-300",
    amber: "text-amber-300",
    violet: "text-violet-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>

      <div className={`mt-3 text-3xl font-semibold ${cls}`}>
        {value}
      </div>
    </div>
  );
}

function DataBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/10 p-3">
      <div className="text-[10px] uppercase tracking-[0.1em] text-zinc-600">
        {label}
      </div>

      <div className="mt-2 text-sm font-semibold text-zinc-300">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "launched"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : status === "cancelled"
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : status === "commercial_ready"
          ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
          : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${classes}`}
    >
      {STATUS_LABELS[status] ??
        status}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  const classes =
    priority === "high"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : priority === "low"
        ? "border-white/[0.08] bg-white/[0.03] text-zinc-500"
        : "border-amber-500/20 bg-amber-500/10 text-amber-300";

  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${classes}`}
    >
      Priorité{" "}
      {PRIORITY_LABELS[
        priority
      ] ?? priority}
    </span>
  );
}