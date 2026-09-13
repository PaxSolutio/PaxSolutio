import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type IntelligenceItemAnalytics = {
  item_type: string;
  categories: string[];
  countries: string[];
  total_score: number | null;
  urgency_score: number | null;
  risk_score: number | null;
};

type IntelligenceOpportunityAnalytics = {
  status: string;
  priority_score: number | null;
  opportunity_kind: string;
};

type IntelligenceProjectAnalytics = {
  status: string;
  priority: string;
  target_market: string | null;
  target_country: string | null;
};

export default async function IntelligenceAnalyticsPage() {
  // =========================================================
  // AUTHENTIFICATION
  // =========================================================

  const authSupabase = await createAuthServerClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = createServerSupabaseClient();

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login");
  }

  // =========================================================
  // DONNÉES INTELLIGENCE
  // =========================================================

  const {
    data: itemsData,
    error: itemsError,
  } = await supabase
    .from("intelligence_items")
    .select(
      `
        item_type,
        categories,
        countries,
        total_score,
        urgency_score,
        risk_score
      `
    );

  if (itemsError) {
    console.error(
      "Erreur récupération Analytics Intelligence Items :",
      itemsError
    );
  }

  const {
    data: opportunitiesData,
    error: opportunitiesError,
  } = await supabase
    .from("intelligence_opportunities")
    .select(
      `
        status,
        priority_score,
        opportunity_kind
      `
    );

  if (opportunitiesError) {
    console.error(
      "Erreur récupération Analytics Opportunités :",
      opportunitiesError
    );
  }

  const {
    data: projectsData,
    error: projectsError,
  } = await supabase
    .from("intelligence_execution_projects")
    .select(
      `
        status,
        priority,
        target_market,
        target_country
      `
    );

  if (projectsError) {
    console.error(
      "Erreur récupération Analytics Projets :",
      projectsError
    );
  }

  // =========================================================
  // NORMALISATION
  // =========================================================

  const items =
    (itemsData ?? []) as IntelligenceItemAnalytics[];

  const opportunities =
    (opportunitiesData ?? []) as IntelligenceOpportunityAnalytics[];

  const projects =
    (projectsData ?? []) as IntelligenceProjectAnalytics[];

  // =========================================================
  // CATÉGORIES
  // =========================================================

  const categoryCounts = new Map<string, number>();

  items.forEach((item) => {
    (item.categories ?? []).forEach((category) => {
      categoryCounts.set(
        category,
        (categoryCounts.get(category) ?? 0) + 1
      );
    });
  });

  const categories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxCategory = Math.max(
    ...categories.map(([, count]) => count),
    1
  );

  // =========================================================
  // PAYS
  // =========================================================

  const countryCounts = new Map<string, number>();

  items.forEach((item) => {
    (item.countries ?? []).forEach((country) => {
      countryCounts.set(
        country,
        (countryCounts.get(country) ?? 0) + 1
      );
    });
  });

  const countries = [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxCountry = Math.max(
    ...countries.map(([, count]) => count),
    1
  );

  // =========================================================
  // OPPORTUNITÉS
  // =========================================================

  const convertedOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.status === "converted"
  ).length;

  const analyzingOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.status === "analyzing"
  ).length;

  const validatedOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.status === "validated"
  ).length;

  const highPriorityOpportunities = opportunities.filter(
    (opportunity) =>
      (opportunity.priority_score ?? 0) >= 85
  ).length;

  const conversionRate =
    opportunities.length > 0
      ? (convertedOpportunities /
          opportunities.length) *
        100
      : 0;

  // =========================================================
  // PROJETS
  // =========================================================

  const activeProjects = projects.filter(
    (project) =>
      project.status !== "launched" &&
      project.status !== "cancelled"
  );

  const launchedProjects = projects.filter(
    (project) =>
      project.status === "launched"
  ).length;

  const highPriorityProjects = activeProjects.filter(
    (project) =>
      project.priority === "high"
  ).length;

  // =========================================================
  // SIGNAUX / RISQUES
  // =========================================================

  const highPrioritySignals = items.filter(
    (item) =>
      (item.total_score ?? 0) >= 85
  ).length;

  const urgentSignals = items.filter(
    (item) =>
      (item.urgency_score ?? 0) >= 75
  ).length;

  const highRiskSignals = items.filter(
    (item) =>
      (item.risk_score ?? 0) >= 70
  ).length;

  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
          Intelligence Analytics
        </div>

        <h1 className="mt-2 text-3xl font-semibold">
          Analytics
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          Lecture consolidée des tendances détectées,
          opportunités et projets PaxSolutio Intelligence.
        </p>
      </div>

      {/* =====================================================
          KPI PRINCIPAUX
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Signaux"
          value={items.length}
        />

        <Metric
          label="Opportunités"
          value={opportunities.length}
          tone="green"
        />

        <Metric
          label="Projets actifs"
          value={activeProjects.length}
          tone="blue"
        />

        <Metric
          label="Conversion"
          value={`${conversionRate.toFixed(1)}%`}
          tone="amber"
        />
      </div>

      {/* =====================================================
          KPI SECONDAIRES
      ====================================================== */}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SmallMetric
          label="Signaux prioritaires"
          value={highPrioritySignals}
          tone="amber"
        />

        <SmallMetric
          label="Urgences"
          value={urgentSignals}
          tone="red"
        />

        <SmallMetric
          label="Risques élevés"
          value={highRiskSignals}
          tone="red"
        />

        <SmallMetric
          label="Opportunités en analyse"
          value={analyzingOpportunities}
          tone="blue"
        />

        <SmallMetric
          label="Opportunités validées"
          value={validatedOpportunities}
          tone="green"
        />

        <SmallMetric
          label="Projets haute priorité"
          value={highPriorityProjects}
          tone="amber"
        />
      </div>

      {/* =====================================================
          RANKINGS
      ====================================================== */}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Ranking
          title="Catégories les plus détectées"
          data={categories}
          max={maxCategory}
          emptyLabel="Aucune catégorie détectée."
        />

        <Ranking
          title="Pays les plus détectés"
          data={countries}
          max={maxCountry}
          emptyLabel="Aucun pays détecté."
        />
      </div>

      {/* =====================================================
          PIPELINE ANALYTIQUE
      ====================================================== */}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Opportunités
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Performance du pipeline
          </h2>

          <div className="mt-6 space-y-5">
            <AnalyticsRow
              label="Total"
              value={opportunities.length}
            />

            <AnalyticsRow
              label="Haute priorité"
              value={highPriorityOpportunities}
              tone="amber"
            />

            <AnalyticsRow
              label="En analyse"
              value={analyzingOpportunities}
              tone="blue"
            />

            <AnalyticsRow
              label="Validées"
              value={validatedOpportunities}
              tone="green"
            />

            <AnalyticsRow
              label="Converties"
              value={convertedOpportunities}
              tone="green"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Exécution
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Performance des projets
          </h2>

          <div className="mt-6 space-y-5">
            <AnalyticsRow
              label="Projets totaux"
              value={projects.length}
            />

            <AnalyticsRow
              label="Projets actifs"
              value={activeProjects.length}
              tone="blue"
            />

            <AnalyticsRow
              label="Haute priorité"
              value={highPriorityProjects}
              tone="amber"
            />

            <AnalyticsRow
              label="Projets lancés"
              value={launchedProjects}
              tone="green"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTE ANALYTICS
      ====================================================== */}

      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Évolution
        </div>

        <h2 className="mt-2 text-lg font-semibold">
          Performance Intelligence
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
          Cette vue consolide actuellement les signaux,
          opportunités et projets enregistrés. Les historiques
          de conversion, marges, délais moyens et performances
          par marché pourront être ajoutés lorsque davantage de
          données d&apos;exécution seront disponibles.
        </p>
      </div>
    </div>
  );
}

// =========================================================
// COMPONENTS
// =========================================================

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "green" | "blue" | "amber";
}) {
  const cls = {
    default: "text-white",
    green: "text-emerald-300",
    blue: "text-blue-300",
    amber: "text-amber-300",
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

function SmallMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "green" | "blue" | "amber" | "red";
}) {
  const cls = {
    default: "text-white",
    green: "text-emerald-300",
    blue: "text-blue-300",
    amber: "text-amber-300",
    red: "text-red-300",
  }[tone];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </div>

      <div
        className={`mt-2 text-2xl font-semibold ${cls}`}
      >
        {value}
      </div>
    </div>
  );
}

function Ranking({
  title,
  data,
  max,
  emptyLabel,
}: {
  title: string;
  data: [string, number][];
  max: number;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      {data.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-600">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map(([label, count]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-zinc-400">
                  {label}
                </span>

                <span className="text-zinc-600">
                  {count}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-blue-500/70"
                  style={{
                    width: `${(count / max) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "green" | "blue" | "amber";
}) {
  const cls = {
    default: "text-zinc-200",
    green: "text-emerald-300",
    blue: "text-blue-300",
    amber: "text-amber-300",
  }[tone];

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span className={`text-sm font-semibold ${cls}`}>
        {value}
      </span>
    </div>
  );
}