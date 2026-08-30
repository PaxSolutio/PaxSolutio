import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/admin/LogoutButton";

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
    // 1. Vérification de la session utilisateur
    const authSupabase = await createAuthServerClient();

    const {
        data: { user },
        error: userError,
    } = await authSupabase.auth.getUser();

    if (userError || !user) {
        redirect("/admin/login");
    }

    // 2. Client serveur sécurisé avec Service Role
    // Il n'est jamais exposé au navigateur.
    const serverSupabase = createServerSupabaseClient();

    // 3. Vérification que l'utilisateur connecté est administrateur
    const { data: admin, error: adminError } = await serverSupabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError) {
        console.error("Erreur vérification administrateur :", adminError);
        redirect("/admin/login");
    }

    if (!admin) {
        redirect("/admin/login");
    }

    // 4. Récupération des publications
    const { data: posts, error: postsError } = await serverSupabase
        .from("news_posts")
        .select(
            "id, slug, title, category, status, featured, created_at, published_at"
        )
        .order("created_at", { ascending: false });

    if (postsError) {
        console.error("Erreur récupération nouveautés :", postsError);
    }

    const publicationList = (posts ?? []) as NewsPost[];

    const publishedCount = publicationList.filter(
        (post) => post.status === "published"
    ).length;

    const draftCount = publicationList.filter(
        (post) => post.status === "draft"
    ).length;

    return (
        <main className="min-h-screen bg-[#06101f] text-white">
            <header className="border-b border-white/10 bg-[#071321]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                            PaxSolutio
                        </div>

                        <div className="mt-1 font-semibold">
                            Administration
                        </div>
                    </div>

                    <LogoutButton />
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <div className="mb-3 text-sm font-medium text-blue-400">
                            Gestion éditoriale
                        </div>

                        <h1 className="text-4xl font-semibold tracking-tight">
                            Nouveautés
                        </h1>

                        <p className="mt-3 max-w-2xl text-slate-400">
                            Gérez les actualités, opportunités, informations réglementaires
                            et contenus terrain de PaxSolutio.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/intelligence"
                            className="inline-flex items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/20 hover:text-blue-200"
                        >
                            Intelligence
                        </Link>

                        <Link
                            href="/admin/nouveautes/nouveau"
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                        >
                            + Nouvelle publication
                        </Link>
                    </div>
                </div>

                <div className="mb-10 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="text-sm text-slate-400">
                            Total
                        </div>

                        <div className="mt-2 text-3xl font-semibold">
                            {publicationList.length}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="text-sm text-slate-400">
                            Publiées
                        </div>

                        <div className="mt-2 text-3xl font-semibold">
                            {publishedCount}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="text-sm text-slate-400">
                            Brouillons
                        </div>

                        <div className="mt-2 text-3xl font-semibold">
                            {draftCount}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                    {publicationList.length === 0 ? (
                        <div className="px-8 py-16 text-center">
                            <div className="text-xl font-semibold">
                                Aucune publication
                            </div>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                                Créez votre première actualité, opportunité ou publication
                                terrain.
                            </p>

                            <Link
                                href="/admin/nouveautes/nouveau"
                                className="mt-7 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                            >
                                Créer une publication
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left">
                                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Publication
                                        </th>

                                        <th className="px-6 py-4">
                                            Catégorie
                                        </th>

                                        <th className="px-6 py-4">
                                            Statut
                                        </th>

                                        <th className="px-6 py-4">
                                            Mise en avant
                                        </th>

                                        <th className="px-6 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {publicationList.map((post) => (
                                        <tr
                                            key={post.id}
                                            className="border-b border-white/[0.06] last:border-0"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="font-medium">
                                                    {post.title}
                                                </div>

                                                <div className="mt-1 text-xs text-slate-500">
                                                    /nouveautes/{post.slug}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-300">
                                                {categoryLabel(post.category)}
                                            </td>

                                            <td className="px-6 py-5">
                                                {post.status === "published" ? (
                                                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                                        Publié
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                                                        Brouillon
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-300">
                                                {post.featured ? "Oui" : "—"}
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <Link
                                                    href={`/admin/nouveautes/${post.id}`}
                                                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                                                >
                                                    Modifier
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}