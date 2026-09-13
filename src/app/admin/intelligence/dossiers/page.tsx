import Link from "next/link";
import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type IntelligenceDossier = {
  id: string;
  title: string;
  product_name: string | null;
  opportunity_kind: string;
  priority_score: number | null;
  confidence_score: number | null;
  status:
    | "to_review"
    | "analyzing"
    | "validated"
    | "converted"
    | "rejected";
  created_at: string;
};

const STATUS_LABELS: Record<IntelligenceDossier["status"], string> = {
  to_review: "À étudier",
  analyzing: "En analyse",
  validated: "Validé",
  converted: "Converti",
  rejected: "Rejeté",
};

const STATUS_CLASSES: Record<
  IntelligenceDossier["status"],
  string
> = {
  to_review:
    "border-white/[0.08] bg-white/[0.03] text-zinc-400",
  analyzing:
    "border-blue-500/20 bg-blue-500/10 text-blue-300",
  validated:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  converted:
    "border-violet-500/20 bg-violet-500/10 text-violet-300",
  rejected:
    "border-red-500/20 bg-red-500/10 text-red-300",
};

export default async function IntelligenceDossiersPage() {
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

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Erreur vérification administrateur Dossiers :",
      adminError
    );
  }

  if (!admin) {
    redirect("/admin/login");
  }

  // =========================================================
  // DOSSIERS / OPPORTUNITÉS
  // =========================================================

  const {
    data: dossiersData,
    error: dossiersError,
  } = await supabase
    .from("intelligence_opportunities")
    .select(
      `
        id,
        title,
        product_name,
        opportunity_kind,
        priority_score,
        confidence_score,
        status,
        created_at
      `
    )
    .order("created_at", {
      ascending: false,
    });

  if (dossiersError) {
    console.error(
      "Erreur récupération dossiers Intelligence :",
      dossiersError
    );
  }

  const dossiers =
    (dossiersData ?? []) as IntelligenceDossier[];

  // =========================================================
  // KPIs
  // =========================================================

  const toReviewCount = dossiers.filter(
    (dossier) => dossier.status === "to_review"
  ).length;

  const analyzingCount = dossiers.filter(
    (dossier) => dossier.status === "analyzing"
  ).length;

  const validatedCount = dossiers.filter(
    (dossier) => dossier.status === "validated"
  ).length;

  const convertedCount = dossiers.filter(
    (dossier) => dossier.status === "converted"
  ).length;

  const rejectedCount = dossiers.filter(
    (dossier) => dossier.status === "rejected"
  ).length;

  const highPriorityCount = dossiers.filter(
    (dossier) =>
      (dossier.priority_score ?? 0) >= 85
  ).length;

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
            Intelligence Workflow
          </div>

          <h1 className="mt-2 text-3xl font-semibold">
            Dossiers
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Vue synthétique des dossiers issus des opportunités
            Intelligence et de leur état de qualification.
          </p>
        </div>

        <div className="text-xs text-zinc-600">
          {dossiers.length} dossier
          {dossiers.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* =====================================================
          KPI
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric
          label="À étudier"
          value={toReviewCount}
        />

        <Metric
          label="En analyse"
          value={analyzingCount}
          tone="blue"
        />

        <Metric
          label="Validés"
          value={validatedCount}
          tone="green"
        />

        <Metric
          label="Convertis"
          value={convertedCount}
          tone="violet"
        />

        <Metric
          label="Rejetés"
          value={rejectedCount}
          tone="red"
        />

        <Metric
          label="Haute priorité"
          value={highPriorityCount}
          tone="amber"
        />
      </div>

      {/* =====================================================
          LISTE DOSSIERS
      ====================================================== */}

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Dossiers Intelligence
            </div>

            <h2 className="mt-2 text-xl font-semibold">
              Tous les dossiers
            </h2>
          </div>

          <div className="text-xs text-zinc-600">
            {dossiers.length} résultat
            {dossiers.length > 1 ? "s" : ""}
          </div>
        </div>

        {dossiers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
            <div className="font-medium text-zinc-300">
              Aucun dossier Intelligence.
            </div>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Les opportunités créées par Intelligence apparaîtront
              automatiquement ici.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dossiers.map((dossier) => (
              <Link
                key={dossier.id}
                href={`/admin/intelligence/opportunites/${dossier.id}`}
                className="block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-blue-500/20 hover:bg-white/[0.04]"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                  {/* DOSSIER */}

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-zinc-200">
                      {dossier.product_name ||
                        dossier.title}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600">
                      <span>
                        {dossier.opportunity_kind === "product"
                          ? "Produit"
                          : "Stratégique"}
                      </span>

                      <span>
                        Confiance{" "}
                        {dossier.confidence_score ?? "—"}%
                      </span>

                      <span>
                        Score priorité{" "}
                        {dossier.priority_score ?? "—"}/100
                      </span>
                    </div>
                  </div>

                  {/* STATUS + SCORE */}

                  <div className="flex flex-wrap items-center gap-4">
                    <span
                      className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                        STATUS_CLASSES[dossier.status]
                      }`}
                    >
                      {STATUS_LABELS[dossier.status]}
                    </span>

                    <div
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        (dossier.priority_score ?? 0) >= 85
                          ? "bg-amber-500/10 text-amber-300"
                          : (dossier.priority_score ?? 0) >= 75
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-white/[0.04] text-zinc-400"
                      }`}
                    >
                      {dossier.priority_score ?? "—"}
                    </div>

                    <div className="text-xs font-semibold text-blue-300">
                      Ouvrir →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
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
  value: number;
  tone?:
    | "default"
    | "blue"
    | "green"
    | "violet"
    | "red"
    | "amber";
}) {
  const cls = {
    default: "text-white",
    blue: "text-blue-300",
    green: "text-emerald-300",
    violet: "text-violet-300",
    red: "text-red-300",
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