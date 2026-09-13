import Link from "next/link";
import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Compliance = {
  id: string;
  execution_project_id: string;
  target_market: string | null;
  target_country: string | null;
  status: string;
  risk_level: string;
  overall_score: number | null;
  missing_requirements: number;
  blocker_count: number;
};

type Project = {
  id: string;
  title: string;
  product_name: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non démarré",
  in_review: "En vérification",
  blocked: "Bloqué",
  ready: "Prêt",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const RISK_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
};

export default async function IntelligenceCompliancePage() {
  const authSupabase = await createAuthServerClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const supabase = createServerSupabaseClient();

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/admin/login");

  const { data: complianceData } = await supabase
    .from("intelligence_execution_compliance")
    .select(`
      id,
      execution_project_id,
      target_market,
      target_country,
      status,
      risk_level,
      overall_score,
      missing_requirements,
      blocker_count
    `);

  const { data: projectsData } = await supabase
    .from("intelligence_execution_projects")
    .select("id,title,product_name");

  const compliance =
    (complianceData ?? []) as Compliance[];

  const projects = (projectsData ?? []) as Project[];

  const projectMap = new Map(
    projects.map((project) => [project.id, project])
  );

  const approved = compliance.filter(
    (item) =>
      item.status === "approved" ||
      item.status === "ready"
  ).length;

  const blocked = compliance.filter(
    (item) =>
      item.status === "blocked" ||
      item.blocker_count > 0
  ).length;

  const highRisk = compliance.filter(
    (item) =>
      item.risk_level === "high" ||
      item.risk_level === "critical"
  ).length;

  const scores = compliance.filter(
    (item) => item.overall_score !== null
  );

  const averageScore =
    scores.length > 0
      ? scores.reduce(
          (sum, item) =>
            sum + (item.overall_score ?? 0),
          0
        ) / scores.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
          Regulatory Control
        </div>

        <h1 className="mt-2 text-3xl font-semibold">
          Conformité
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          Contrôle global des exigences réglementaires,
          risques et points bloquants des projets.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Dossiers" value={compliance.length} />
        <Metric
          label="Prêts / approuvés"
          value={approved}
          tone="green"
        />
        <Metric
          label="Bloqués"
          value={blocked}
          tone="red"
        />
        <Metric
          label="Risque élevé"
          value={highRisk}
          tone="red"
        />
        <Metric
          label="Score moyen"
          value={`${averageScore.toFixed(0)}/100`}
          tone="blue"
        />
      </div>

      <div className="mt-8 space-y-4">
        {compliance.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center text-sm text-zinc-600">
            Aucun dossier conformité.
          </div>
        ) : (
          compliance.map((item) => {
            const project = projectMap.get(
              item.execution_project_id
            );

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_150px_130px_130px_100px] lg:items-center">
                  <div>
                    <div className="font-semibold text-zinc-200">
                      {project?.product_name ||
                        project?.title ||
                        "Projet"}
                    </div>

                    <div className="mt-1 text-xs text-zinc-600">
                      {[item.target_market, item.target_country]
                        .filter(Boolean)
                        .join(" · ") || "Marché non défini"}
                    </div>
                  </div>

                  <Data
                    label="Statut"
                    value={
                      STATUS_LABELS[item.status] ??
                      item.status
                    }
                  />

                  <Data
                    label="Risque"
                    value={
                      RISK_LABELS[item.risk_level] ??
                      item.risk_level
                    }
                  />

                  <Data
                    label="Score"
                    value={
                      item.overall_score !== null
                        ? `${item.overall_score}/100`
                        : "—"
                    }
                  />

                  <div className="lg:text-right">
                    <Link
                      href={`/admin/intelligence/execution/${item.execution_project_id}`}
                      className="text-xs font-semibold text-blue-300"
                    >
                      Ouvrir →
                    </Link>
                  </div>
                </div>

                {(item.blocker_count > 0 ||
                  item.missing_requirements > 0) && (
                  <div className="mt-4 flex gap-3 text-xs">
                    {item.blocker_count > 0 && (
                      <span className="rounded-lg bg-red-500/10 px-3 py-1.5 text-red-300">
                        {item.blocker_count} blocage
                        {item.blocker_count > 1 ? "s" : ""}
                      </span>
                    )}

                    {item.missing_requirements > 0 && (
                      <span className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-amber-300">
                        {item.missing_requirements} exigence
                        {item.missing_requirements > 1
                          ? "s"
                          : ""}{" "}
                        manquante
                        {item.missing_requirements > 1
                          ? "s"
                          : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "green" | "red" | "blue";
}) {
  const cls = {
    default: "text-white",
    green: "text-emerald-300",
    red: "text-red-300",
    blue: "text-blue-300",
  }[tone];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
      <div className={`mt-3 text-3xl font-semibold ${cls}`}>
        {value}
      </div>
    </div>
  );
}

function Data({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </div>
      <div className="mt-1 text-xs font-medium text-zinc-300">
        {value}
      </div>
    </div>
  );
}