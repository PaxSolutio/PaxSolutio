import Link from "next/link";
import { redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type NewsPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  featured: boolean;
  created_at: string;
  published_at: string | null;
};

function categoryLabel(category: string) {
  switch (category) {
    case "actualite":
      return "Actualité";

    case "reglementation":
      return "Réglementation";

    case "opportunite":
      return "Opportunité";

    case "terrain":
      return "Terrain";

    default:
      return category;
  }
}

export default async function AdminNewsPage() {
  const authSupabase = await createAuthServerClient();

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
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

  if (adminError || !admin) {
    redirect("/admin/login");
  }

  const {
    data: postsData,
    error: postsError,
  } = await supabase
    .from("news_posts")
    .select(
      `
        id,
        slug,
        title,
        category,
        status,
        featured,
        created_at,
        published_at
      `
    )
    .order("created_at", {
      ascending: false,
    });

  if (postsError) {
    console.error(
      "Erreur récupération publications :",
      postsError
    );
  }

  const posts =
    (postsData ?? []) as NewsPost[];

  const publishedCount = posts.filter(
    (post) => post.status === "published"
  ).length;

  const draftCount = posts.filter(
    (post) => post.status === "draft"
  ).length;

  const featuredCount = posts.filter(
    (post) => post.featured
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            Gestion éditoriale
          </div>

          <h1 className="mt-2 text-3xl font-semibold">
            Publications
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
            Actualités, opportunités, informations réglementaires
            et contenus terrain de PaxSolutio.
          </p>
        </div>

        <Link
          href="/admin/nouveautes/nouveau"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          + Nouvelle publication
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total" value={posts.length} />
        <Metric label="Publiées" value={publishedCount} tone="green" />
        <Metric label="Brouillons" value={draftCount} tone="amber" />
        <Metric label="À la une" value={featuredCount} tone="blue" />
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] px-6 py-5">
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            Bibliothèque éditoriale
          </div>

          <h2 className="mt-2 text-lg font-semibold">
            Toutes les publications
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="font-medium text-zinc-300">
              Aucune publication.
            </div>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600">
              Crée ta première actualité, opportunité ou publication terrain.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/nouveautes/${post.id}`}
                className="grid gap-4 px-6 py-5 transition hover:bg-white/[0.025] lg:grid-cols-[minmax(0,1.4fr)_160px_130px_120px_90px] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-200">
                    {post.title}
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    /nouveautes/{post.slug}
                  </div>
                </div>

                <div className="text-xs text-zinc-400">
                  {categoryLabel(post.category)}
                </div>

                <StatusBadge status={post.status} />

                <div className="text-xs text-zinc-400">
                  {post.featured ? "À la une" : "Standard"}
                </div>

                <div className="text-right text-xs font-semibold text-blue-300">
                  Modifier →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
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

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const isPublished =
    status === "published";

  return (
    <span
      className={`inline-flex w-fit rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
        isPublished
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/20 bg-amber-500/10 text-amber-300"
      }`}
    >
      {isPublished
        ? "Publié"
        : "Brouillon"}
    </span>
  );
}