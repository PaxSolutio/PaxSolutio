import { requireAdminPage } from "@/lib/admin-access";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Quote = {
  id: string;
  execution_project_id: string;
  supplier_id: string | null;
  reference: string | null;
  currency: string;
  quantity: number | null;
  unit_price: number | null;
  incoterm: string | null;
  landed_cost: number | null;
  landed_cost_unit: number | null;
  target_sale_price: number | null;
  gross_margin: number | null;
  gross_margin_percent: number | null;
  status: string;
  created_at: string;
};

type Supplier = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  title: string;
  product_name: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  received: "Reçue",
  under_review: "En analyse",
  selected: "Sélectionnée",
  rejected: "Rejetée",
};

function formatMoney(
  value: number | null,
  currency: string
) {
  if (value === null) return "—";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function IntelligenceQuotesPage() {
  await requireAdminPage();

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

  const { data: quotesData } = await supabase
    .from("intelligence_execution_quotes")
    .select(`
      id,
      execution_project_id,
      supplier_id,
      reference,
      currency,
      quantity,
      unit_price,
      incoterm,
      landed_cost,
      landed_cost_unit,
      target_sale_price,
      gross_margin,
      gross_margin_percent,
      status,
      created_at
    `)
    .order("created_at", { ascending: false });

  const { data: suppliersData } = await supabase
    .from("intelligence_execution_suppliers")
    .select("id,name");

  const { data: projectsData } = await supabase
    .from("intelligence_execution_projects")
    .select("id,title,product_name");

  const quotes = (quotesData ?? []) as Quote[];
  const suppliers = (suppliersData ?? []) as Supplier[];
  const projects = (projectsData ?? []) as Project[];

  const supplierMap = new Map(
    suppliers.map((supplier) => [supplier.id, supplier])
  );

  const projectMap = new Map(
    projects.map((project) => [project.id, project])
  );

  const selected = quotes.filter(
    (quote) => quote.status === "selected"
  ).length;

  const underReview = quotes.filter(
    (quote) => quote.status === "under_review"
  ).length;

  const received = quotes.filter(
    (quote) => quote.status === "received"
  ).length;

  const marginQuotes = quotes.filter(
    (quote) => quote.gross_margin_percent !== null
  );

  const averageMargin =
    marginQuotes.length > 0
      ? marginQuotes.reduce(
          (sum, quote) =>
            sum + (quote.gross_margin_percent ?? 0),
          0
        ) / marginQuotes.length
      : 0;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Analyse financière"
        title="Cotations"
        description="Comparaison globale des offres fournisseurs, coûts rendus et marges des projets Intelligence."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Cotations" value={quotes.length} />
        <Metric label="Reçues" value={received} tone="blue" />
        <Metric label="En analyse" value={underReview} tone="amber" />
        <Metric label="Sélectionnées" value={selected} tone="green" />
        <Metric
          label="Marge moyenne"
          value={`${averageMargin.toFixed(1)}%`}
          tone="green"
        />
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <div className="border-b border-white/[0.07] px-5 py-5">
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Comparateur global
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Toutes les cotations
          </h2>
        </div>

        {quotes.length === 0 ? (
          <Empty message="Aucune cotation enregistrée." />
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {quotes.map((quote) => {
              const supplier =
                quote.supplier_id
                  ? supplierMap.get(quote.supplier_id)
                  : null;

              const project = projectMap.get(
                quote.execution_project_id
              );

              return (
                <div
                  key={quote.id}
                  className="grid gap-5 px-5 py-5 transition hover:bg-white/[0.025] lg:grid-cols-[minmax(0,1.2fr)_160px_150px_150px_130px_90px]"
                >
                  <div>
                    <div className="font-semibold text-zinc-200">
                      {supplier?.name ??
                        "Fournisseur non associé"}
                    </div>

                    <div className="mt-1 text-xs text-zinc-600">
                      {project?.product_name ||
                        project?.title ||
                        "Projet inconnu"}
                    </div>
                  </div>

                  <Data
                    label="Prix unité"
                    value={formatMoney(
                      quote.unit_price,
                      quote.currency
                    )}
                  />

                  <Data
                    label="Coût rendu / u."
                    value={formatMoney(
                      quote.landed_cost_unit,
                      quote.currency
                    )}
                  />

                  <Data
                    label="Marge"
                    value={
                      quote.gross_margin_percent !== null
                        ? `${quote.gross_margin_percent.toFixed(
                            1
                          )}%`
                        : "—"
                    }
                  />

                  <div>
                    <div className="text-[10px] uppercase text-zinc-600">
                      Statut
                    </div>

                    <div className="mt-1 text-xs text-blue-300">
                      {STATUS_LABELS[quote.status] ??
                        quote.status}
                    </div>
                  </div>

                  <div className="flex items-center lg:justify-end">
                    <Link
                      href={`/admin/intelligence/execution/${quote.execution_project_id}`}
                      className="text-xs font-semibold text-blue-300 hover:text-blue-200"
                    >
                      Ouvrir →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
        {eyebrow}
      </div>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
        {description}
      </p>
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
  tone?: "default" | "green" | "amber" | "blue";
}) {
  const cls = {
    default: "text-white",
    green: "text-emerald-300",
    amber: "text-amber-300",
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
      <div className="text-[10px] uppercase text-zinc-600">
        {label}
      </div>
      <div className="mt-1 text-xs font-medium text-zinc-300">
        {value}
      </div>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="px-6 py-16 text-center text-sm text-zinc-600">
      {message}
    </div>
  );
}