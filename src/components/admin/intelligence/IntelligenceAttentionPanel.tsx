"use client";

import Link from "next/link";

type Opportunity = {
  id: string;
  title: string;
  product_name: string | null;
  priority_score: number | null;
  status:
    | "to_review"
    | "analyzing"
    | "validated"
    | "rejected"
    | "converted";
};

type Project = {
  id: string;
  title: string;
  product_name: string | null;
  status: string;
  priority: string;
};

type Supplier = {
  id: string;
  execution_project_id: string;
  verification_status: string;
};

type Quote = {
  id: string;
  execution_project_id: string;
  status: string;
};

type Compliance = {
  id: string;
  execution_project_id: string;
  status: string;
  risk_level: string | null;
  blocker_count: number | null;
};

type Props = {
  opportunities: Opportunity[];
  projects: Project[];
  suppliers: Supplier[];
  quotes: Quote[];
  compliance: Compliance[];
};

type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  level: "critical" | "warning" | "info";
};

export default function IntelligenceAttentionPanel({
  opportunities,
  projects,
  suppliers,
  quotes,
  compliance,
}: Props) {
  const actions: AttentionItem[] = [];

  // =========================================================
  // OPPORTUNITÉS À ÉTUDIER
  // =========================================================

  const opportunitiesToReview = opportunities.filter(
    (opportunity) => opportunity.status === "to_review"
  );

  if (opportunitiesToReview.length > 0) {
    actions.push({
      id: "opportunities-review",
      title: `${opportunitiesToReview.length} opportunité${
        opportunitiesToReview.length > 1 ? "s" : ""
      } à étudier`,
      detail:
        "Des dossiers Intelligence attendent une première décision.",
      href: "/admin/intelligence/opportunites",
      level: "warning",
    });
  }

  // =========================================================
  // OPPORTUNITÉS EN ANALYSE
  // =========================================================

  const opportunitiesAnalyzing = opportunities.filter(
    (opportunity) => opportunity.status === "analyzing"
  );

  if (opportunitiesAnalyzing.length > 0) {
    actions.push({
      id: "opportunities-analyzing",
      title: `${opportunitiesAnalyzing.length} dossier${
        opportunitiesAnalyzing.length > 1 ? "s" : ""
      } en analyse`,
      detail:
        "Une validation ou un rejet peut être nécessaire.",
      href: "/admin/intelligence/dossiers",
      level: "info",
    });
  }

  // =========================================================
  // PROJETS HAUTE PRIORITÉ
  // =========================================================

  const highPriorityProjects = projects.filter(
    (project) =>
      project.priority === "high" &&
      project.status !== "launched" &&
      project.status !== "cancelled"
  );

  if (highPriorityProjects.length > 0) {
    actions.push({
      id: "high-priority-projects",
      title: `${highPriorityProjects.length} projet${
        highPriorityProjects.length > 1 ? "s" : ""
      } haute priorité`,
      detail:
        "Ces projets actifs doivent rester en tête du suivi opérationnel.",
      href: "/admin/intelligence/execution",
      level: "warning",
    });
  }

  // =========================================================
  // FOURNISSEURS
  // =========================================================

  const suppliersInReview = suppliers.filter(
    (supplier) =>
      supplier.verification_status === "in_review"
  );

  const unverifiedSuppliers = suppliers.filter(
    (supplier) =>
      supplier.verification_status === "unverified"
  );

  if (suppliersInReview.length > 0) {
    actions.push({
      id: "suppliers-review",
      title: `${suppliersInReview.length} fournisseur${
        suppliersInReview.length > 1 ? "s" : ""
      } en vérification`,
      detail:
        "La vérification fournisseur n'est pas encore finalisée.",
      href: "/admin/intelligence/fournisseurs",
      level: "warning",
    });
  } else if (unverifiedSuppliers.length > 0) {
    actions.push({
      id: "suppliers-unverified",
      title: `${unverifiedSuppliers.length} fournisseur${
        unverifiedSuppliers.length > 1 ? "s" : ""
      } non vérifié${
        unverifiedSuppliers.length > 1 ? "s" : ""
      }`,
      detail:
        "La qualification sourcing doit encore être effectuée.",
      href: "/admin/intelligence/fournisseurs",
      level: "info",
    });
  }

  // =========================================================
  // COTATIONS
  // =========================================================

  const quotesUnderReview = quotes.filter(
    (quote) => quote.status === "under_review"
  );

  if (quotesUnderReview.length > 0) {
    actions.push({
      id: "quotes-review",
      title: `${quotesUnderReview.length} cotation${
        quotesUnderReview.length > 1 ? "s" : ""
      } à comparer`,
      detail:
        "Une décision financière reste à prendre.",
      href: "/admin/intelligence/cotations",
      level: "warning",
    });
  }

  // =========================================================
  // CONFORMITÉ BLOQUANTE
  // =========================================================

  const blockedCompliance = compliance.filter(
    (item) =>
      item.status === "blocked" ||
      (item.blocker_count ?? 0) > 0
  );

  if (blockedCompliance.length > 0) {
    actions.push({
      id: "compliance-blocked",
      title: `${blockedCompliance.length} dossier${
        blockedCompliance.length > 1 ? "s" : ""
      } conformité bloquant${
        blockedCompliance.length > 1 ? "s" : ""
      }`,
      detail:
        "Un blocage réglementaire empêche ou risque d'empêcher l'avancement.",
      href: "/admin/intelligence/conformite",
      level: "critical",
    });
  }

  // =========================================================
  // RISQUE CONFORMITÉ ÉLEVÉ
  // =========================================================

  const highRiskCompliance = compliance.filter(
    (item) =>
      item.risk_level === "high" ||
      item.risk_level === "critical"
  );

  if (
    highRiskCompliance.length > 0 &&
    blockedCompliance.length === 0
  ) {
    actions.push({
      id: "compliance-risk",
      title: `${highRiskCompliance.length} dossier${
        highRiskCompliance.length > 1 ? "s" : ""
      } à risque réglementaire élevé`,
      detail:
        "Un contrôle conformité approfondi est recommandé.",
      href: "/admin/intelligence/conformite",
      level: "critical",
    });
  }

  // =========================================================
  // TRI
  // =========================================================

  const priority = {
    critical: 3,
    warning: 2,
    info: 1,
  };

  const sortedActions = [...actions].sort(
    (a, b) =>
      priority[b.level] - priority[a.level]
  );

  const criticalCount = sortedActions.filter(
    (action) => action.level === "critical"
  ).length;

  const warningCount = sortedActions.filter(
    (action) => action.level === "warning"
  ).length;

  return (
    <section className="mb-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Supervision
          </div>

          <h3 className="mt-2 text-lg font-semibold text-white">
            Actions requises
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">
              {criticalCount} critique
              {criticalCount > 1 ? "s" : ""}
            </span>
          )}

          {warningCount > 0 && (
            <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              {warningCount} à traiter
            </span>
          )}

          {sortedActions.length === 0 && (
            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              Aucun blocage
            </span>
          )}
        </div>
      </div>

      {sortedActions.length === 0 ? (
        <div className="px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-300">
              ✓
            </div>

            <div>
              <div className="text-sm font-semibold text-zinc-200">
                Rien ne nécessite d'intervention immédiate
              </div>

              <div className="mt-1 text-xs text-zinc-600">
                Les opportunités et projets sont dans un état normal.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {sortedActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group flex items-center gap-4 px-6 py-4 transition hover:bg-white/[0.025]"
            >
              <AttentionIndicator
                level={action.level}
              />

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-zinc-200 transition group-hover:text-white">
                  {action.title}
                </div>

                <div className="mt-1 text-xs text-zinc-600">
                  {action.detail}
                </div>
              </div>

              <div className="text-xs text-zinc-600 transition group-hover:text-blue-300">
                Ouvrir →
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function AttentionIndicator({
  level,
}: {
  level: "critical" | "warning" | "info";
}) {
  const classes = {
    critical:
      "border-red-500/20 bg-red-500/10 text-red-300",
    warning:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
    info:
      "border-blue-500/20 bg-blue-500/10 text-blue-300",
  }[level];

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${classes}`}
    >
      {level === "critical"
        ? "!"
        : level === "warning"
          ? "•"
          : "i"}
    </div>
  );
}