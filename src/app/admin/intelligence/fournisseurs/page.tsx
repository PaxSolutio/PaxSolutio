import { requireAdminPage } from "@/lib/admin-access";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// =========================================================
// TYPES
// =========================================================

type Supplier = {
  id: string;
  execution_project_id: string;

  name: string;

  country: string | null;
  city: string | null;

  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_wechat: string | null;
  website: string | null;

  supplier_type: string;
  verification_status: string;

  verification_notes: string | null;
  payment_terms: string | null;

  production_lead_time_days: number | null;
  sample_available: boolean;

  notes: string | null;

  created_at: string;
};

type ExecutionProject = {
  id: string;
  title: string;
  product_name: string | null;
  target_market: string | null;
  target_country: string | null;
  status: string;
  priority: string;
};

// =========================================================
// LABELS
// =========================================================

const SUPPLIER_TYPE_LABELS: Record<string, string> = {
  factory: "Usine",
  trading_company: "Société de négoce",
  distributor: "Distributeur",
  agent: "Agent",
  other: "Autre",
};

const VERIFICATION_LABELS: Record<string, string> = {
  unverified: "Non vérifié",
  in_review: "En vérification",
  verified: "Vérifié",
  rejected: "Rejeté",
};

// =========================================================
// PAGE
// =========================================================

export default async function IntelligenceSuppliersPage() {
  await requireAdminPage();

  // =======================================================
  // AUTHENTIFICATION
  // =======================================================

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

  // =======================================================
  // FOURNISSEURS
  // =======================================================

  const {
    data: suppliersData,
    error: suppliersError,
  } = await supabase
    .from("intelligence_execution_suppliers")
    .select(`
      id,
      execution_project_id,
      name,
      country,
      city,
      contact_name,
      contact_email,
      contact_phone,
      contact_wechat,
      website,
      supplier_type,
      verification_status,
      verification_notes,
      payment_terms,
      production_lead_time_days,
      sample_available,
      notes,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (suppliersError) {
    console.error(
      "Erreur récupération fournisseurs Intelligence :",
      suppliersError
    );
  }

  const suppliers =
    (suppliersData ?? []) as Supplier[];

  // =======================================================
  // PROJETS
  // =======================================================

  const {
    data: projectsData,
    error: projectsError,
  } = await supabase
    .from("intelligence_execution_projects")
    .select(`
      id,
      title,
      product_name,
      target_market,
      target_country,
      status,
      priority
    `);

  if (projectsError) {
    console.error(
      "Erreur récupération projets Intelligence :",
      projectsError
    );
  }

  const projects =
    (projectsData ?? []) as ExecutionProject[];

  const projectMap = new Map(
    projects.map((project) => [
      project.id,
      project,
    ])
  );

  // =======================================================
  // KPIs
  // =======================================================

  const verifiedSuppliers = suppliers.filter(
    (supplier) =>
      supplier.verification_status === "verified"
  );

  const suppliersInReview = suppliers.filter(
    (supplier) =>
      supplier.verification_status === "in_review"
  );

  const unverifiedSuppliers = suppliers.filter(
    (supplier) =>
      supplier.verification_status === "unverified"
  );

  const rejectedSuppliers = suppliers.filter(
    (supplier) =>
      supplier.verification_status === "rejected"
  );

  const factories = suppliers.filter(
    (supplier) =>
      supplier.supplier_type === "factory"
  );

  const withSample = suppliers.filter(
    (supplier) =>
      supplier.sample_available
  );

  // =======================================================
  // INTERFACE
  // =======================================================

  return (
    <div className="mx-auto max-w-7xl">
      {/* ===================================================
          HEADER
      ==================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            Sourcing Intelligence
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Fournisseurs
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Vue globale des fournisseurs identifiés,
            étudiés et vérifiés dans les projets
            PaxSolutio Intelligence.
          </p>
        </div>

        <div className="text-xs text-zinc-600">
          {suppliers.length} fournisseur
          {suppliers.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* ===================================================
          KPI
      ==================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Fournisseurs"
          value={suppliers.length}
        />

        <MetricCard
          label="Vérifiés"
          value={verifiedSuppliers.length}
          tone="green"
        />

        <MetricCard
          label="En vérification"
          value={suppliersInReview.length}
          tone="amber"
        />

        <MetricCard
          label="Non vérifiés"
          value={unverifiedSuppliers.length}
        />

        <MetricCard
          label="Rejetés"
          value={rejectedSuppliers.length}
          tone="red"
        />

        <MetricCard
          label="Usines"
          value={factories.length}
          tone="blue"
        />
      </div>

      {/* ===================================================
          SYNTHÈSE
      ==================================================== */}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <SummaryCard
          label="Échantillons"
          value={withSample.length}
          description="fournisseurs avec échantillon disponible"
        />

        <SummaryCard
          label="Taux de vérification"
          value={
            suppliers.length > 0
              ? `${Math.round(
                  (verifiedSuppliers.length /
                    suppliers.length) *
                    100
                )}%`
              : "0%"
          }
          description="des fournisseurs actuellement vérifiés"
        />

        <SummaryCard
          label="Projets couverts"
          value={
            new Set(
              suppliers.map(
                (supplier) =>
                  supplier.execution_project_id
              )
            ).size
          }
          description="projets avec au moins un fournisseur"
        />
      </div>

      {/* ===================================================
          LISTE FOURNISSEURS
      ==================================================== */}

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Base fournisseurs
            </div>

            <h2 className="mt-2 text-xl font-semibold">
              Tous les fournisseurs
            </h2>
          </div>

          <div className="text-xs text-zinc-600">
            {suppliers.length} résultat
            {suppliers.length > 1 ? "s" : ""}
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] px-6 py-16 text-center">
            <div className="font-medium text-zinc-300">
              Aucun fournisseur enregistré.
            </div>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Les fournisseurs ajoutés depuis les projets
              d&apos;exécution apparaîtront automatiquement ici.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {/* HEADER TABLE */}

            <div className="hidden grid-cols-[minmax(0,1.4fr)_170px_150px_170px_120px] gap-4 border-b border-white/[0.07] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-600 lg:grid">
              <div>Fournisseur</div>
              <div>Projet</div>
              <div>Type</div>
              <div>Vérification</div>
              <div className="text-right">
                Action
              </div>
            </div>

            {/* ROWS */}

            <div className="divide-y divide-white/[0.06]">
              {suppliers.map((supplier) => {
                const project =
                  projectMap.get(
                    supplier.execution_project_id
                  );

                return (
                  <div
                    key={supplier.id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.025] lg:grid-cols-[minmax(0,1.4fr)_170px_150px_170px_120px] lg:items-center"
                  >
                    {/* SUPPLIER */}

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-200">
                        {supplier.name}
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-zinc-600">
                        {(supplier.city ||
                          supplier.country) && (
                          <span>
                            {[
                              supplier.city,
                              supplier.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        )}

                        {supplier.production_lead_time_days !==
                          null && (
                          <span>
                            ·{" "}
                            {
                              supplier.production_lead_time_days
                            }{" "}
                            j
                          </span>
                        )}

                        {supplier.sample_available && (
                          <span className="text-blue-300">
                            · Échantillon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PROJECT */}

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600 lg:hidden">
                        Projet
                      </div>

                      <div className="mt-1 truncate text-xs text-zinc-300 lg:mt-0">
                        {project?.product_name ||
                          project?.title ||
                          "Projet inconnu"}
                      </div>
                    </div>

                    {/* TYPE */}

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600 lg:hidden">
                        Type
                      </div>

                      <div className="mt-1 text-xs text-zinc-400 lg:mt-0">
                        {SUPPLIER_TYPE_LABELS[
                          supplier.supplier_type
                        ] ??
                          supplier.supplier_type}
                      </div>
                    </div>

                    {/* VERIFICATION */}

                    <div>
                      <VerificationBadge
                        status={
                          supplier.verification_status
                        }
                      />
                    </div>

                    {/* ACTION */}

                    <div className="flex lg:justify-end">
                      {project ? (
                        <Link
                          href={`/admin/intelligence/execution/${project.id}`}
                          className="text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                        >
                          Ouvrir →
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-700">
                          —
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="text-xs uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>

      <div className="mt-3 text-2xl font-semibold text-white">
        {value}
      </div>

      <div className="mt-2 text-xs text-zinc-600">
        {description}
      </div>
    </div>
  );
}

function VerificationBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "verified"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : status === "in_review"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
        : status === "rejected"
          ? "border-red-500/20 bg-red-500/10 text-red-300"
          : "border-white/[0.08] bg-white/[0.03] text-zinc-400";

  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${classes}`}
    >
      {VERIFICATION_LABELS[status] ??
        status}
    </span>
  );
}