import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type IntelligenceMissionSettings = {
  id: string;
  name: string;
  radar: string;
  frequency: "3h" | "12h" | "daily" | "weekly";
  priority: number;
  active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
};

const FREQUENCY_LABELS: Record<
  IntelligenceMissionSettings["frequency"],
  string
> = {
  "3h": "Toutes les 3 heures",
  "12h": "Toutes les 12 heures",
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
};

const RADAR_LABELS: Record<string, string> = {
  geopolitics: "Géopolitique",
  trade: "Commerce",
  logistics: "Logistique",
  product: "Produits",
  business: "Business",
  ecommerce: "E-commerce",
  opportunity: "Opportunités",
  weak_signal: "Signaux faibles",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Non planifiée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function IntelligenceSettingsPage() {
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

  const {
    data: admin,
    error: adminError,
  } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Erreur vérification administrateur Paramètres :",
      adminError
    );
  }

  if (!admin) {
    redirect("/admin/login");
  }

  // =========================================================
  // MISSIONS INTELLIGENCE
  // =========================================================

  const {
    data: missionsData,
    error: missionsError,
  } = await supabase
    .from("intelligence_queries")
    .select(
      `
        id,
        name,
        radar,
        frequency,
        priority,
        active,
        last_run_at,
        next_run_at
      `
    )
    .order("priority", {
      ascending: false,
    });

  if (missionsError) {
    console.error(
      "Erreur récupération missions Paramètres :",
      missionsError
    );
  }

  const missions =
    (missionsData ?? []) as IntelligenceMissionSettings[];

  // =========================================================
  // KPIs
  // =========================================================

  const activeMissions = missions.filter(
    (mission) => mission.active
  ).length;

  const inactiveMissions =
    missions.length - activeMissions;

  const highPriorityMissions = missions.filter(
    (mission) => mission.priority >= 85
  ).length;

  const dailyMissions = missions.filter(
    (mission) => mission.frequency === "daily"
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
            System Configuration
          </div>

          <h1 className="mt-2 text-3xl font-semibold">
            Paramètres
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Configuration et état des missions de veille
            PaxSolutio Intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Système opérationnel
        </div>
      </div>

      {/* =====================================================
          KPIs
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card
          label="Missions configurées"
          value={missions.length}
        />

        <Card
          label="Missions actives"
          value={activeMissions}
          tone="green"
        />

        <Card
          label="Inactives"
          value={inactiveMissions}
        />

        <Card
          label="Haute priorité"
          value={highPriorityMissions}
          tone="amber"
        />

        <Card
          label="Quotidiennes"
          value={dailyMissions}
          tone="blue"
        />
      </div>

      {/* =====================================================
          MISSIONS
      ====================================================== */}

      <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] px-6 py-5">
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Missions Intelligence
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Configuration de veille
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Fréquence, priorité, radar associé et état
            d&apos;exécution des missions configurées.
          </p>
        </div>

        {missions.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-600">
            Aucune mission Intelligence configurée.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="grid gap-5 px-6 py-5 transition hover:bg-white/[0.02] lg:grid-cols-[minmax(0,1.3fr)_150px_130px_190px_120px]"
              >
                {/* MISSION */}

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-200">
                    {mission.name}
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    Radar :{" "}
                    {RADAR_LABELS[mission.radar] ??
                      mission.radar}
                  </div>
                </div>

                {/* FRÉQUENCE */}

                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                    Fréquence
                  </div>

                  <div className="mt-1 text-xs text-zinc-300">
                    {FREQUENCY_LABELS[
                      mission.frequency
                    ]}
                  </div>
                </div>

                {/* PRIORITÉ */}

                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                    Priorité
                  </div>

                  <div
                    className={`mt-1 text-xs font-semibold ${
                      mission.priority >= 85
                        ? "text-amber-300"
                        : mission.priority >= 70
                          ? "text-blue-300"
                          : "text-zinc-400"
                    }`}
                  >
                    {mission.priority}/100
                  </div>
                </div>

                {/* EXÉCUTION */}

                <div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                    Dernière exécution
                  </div>

                  <div className="mt-1 text-xs text-zinc-300">
                    {formatDate(
                      mission.last_run_at
                    )}
                  </div>

                  <div className="mt-1 text-[10px] text-zinc-600">
                    Prochaine :{" "}
                    {formatDate(
                      mission.next_run_at
                    )}
                  </div>
                </div>

                {/* STATUS */}

                <div className="lg:text-right">
                  <span
                    className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      mission.active
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-500"
                    }`}
                  >
                    {mission.active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          SYSTEM
      ====================================================== */}

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            État système
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Intelligence Engine
          </h2>

          <div className="mt-6 space-y-4">
            <SystemRow
              label="Authentification"
              value="Opérationnelle"
              good
            />

            <SystemRow
              label="Base Intelligence"
              value="Connectée"
              good
            />

            <SystemRow
              label="Missions actives"
              value={`${activeMissions}/${missions.length}`}
              good={activeMissions > 0}
            />

            <SystemRow
              label="Mode actuel"
              value="Supervision"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
            Configuration
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Lecture seule
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Cette interface affiche actuellement la configuration
            réelle des missions. L&apos;édition des fréquences,
            priorités, radars et activation pourra être ajoutée
            ensuite avec des contrôles sécurisés côté serveur.
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// COMPONENTS
// =========================================================

function Card({
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

      <div
        className={`mt-3 text-3xl font-semibold ${cls}`}
      >
        {value}
      </div>
    </div>
  );
}

function SystemRow({
  label,
  value,
  good = false,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span
        className={`text-sm font-semibold ${
          good
            ? "text-emerald-300"
            : "text-zinc-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}