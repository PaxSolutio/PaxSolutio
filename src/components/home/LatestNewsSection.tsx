import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type NewsPost = {
    id: string;
    slug: string;
    title: string;
    category: string;
    excerpt: string | null;
    image_url: string | null;
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

function formatDate(date: string | null) {
    if (!date) return "";

    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

export default async function LatestNewsSection() {
    const supabase = createServerSupabaseClient();

    const { data: posts, error } = await supabase
        .from("news_posts")
        .select(
            `
        id,
        slug,
        title,
        category,
        excerpt,
        image_url,
        published_at
        `
        )
        .eq("status", "published")
        .eq("featured", true)
        .order("published_at", {
            ascending: false,
            nullsFirst: false,
        })
        .limit(3);

    if (error) {
        console.error(
            "Erreur récupération nouveautés homepage :",
            error
        );

        return null;
    }

    const publicationList = (posts ?? []) as NewsPost[];

    if (publicationList.length === 0) {
        return null;
    }

    return (
        <section className="border-t border-[#E2E8F0] bg-white pt-20 pb-12 lg:pt-24 lg:pb-14">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">

                {/* HEADER */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-[760px]">
                        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Intelligence & actualités
                        </div>

                        <h2 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[42px]">
                            Les mouvements
                            <span className="text-[#176BFF]">
                                {" "}
                                à surveiller.
                            </span>
                        </h2>

                        <p className="mt-5 max-w-[650px] text-base leading-7 text-[#657386]">
                            Réglementation, marchés, produits et opportunités :
                            une sélection d&apos;informations détectées et analysées
                            par PaxSolutio Intelligence.
                        </p>
                    </div>

                    <Link
                        href="/nouveautes"
                        className="inline-flex shrink-0 items-center text-sm font-extrabold !text-[#176BFF] transition hover:translate-x-1"
                    >
                        Toutes les nouveautés
                        <span className="ml-2">
                            →
                        </span>
                    </Link>
                </div>

                {/* ARTICLES */}
                <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {publicationList.map((post, index) => (
                        <Link
                            key={post.id}
                            href={`/nouveautes/${post.slug}`}
                            className={`group overflow-hidden rounded-[26px] border transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(7,27,51,0.08)] ${index === 0
                                ? "border-[#C9D9F1] bg-[#071B33]"
                                : "border-[#E2E8F0] bg-[#F8FAFD]"
                                }`}
                        >
                            {/* IMAGE */}
                            <div className="relative aspect-[16/9] overflow-hidden bg-[#E8EDF3]">
                                {post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                                    />
                                ) : (
                                    <div
                                        className={`absolute inset-0 ${index === 0
                                            ? "bg-[radial-gradient(circle_at_70%_20%,#164575_0%,#0B2B4C_40%,#071B33_85%)]"
                                            : "bg-[#EEF3F8]"
                                            }`}
                                    />
                                )}
                            </div>

                            {/* CONTENU */}
                            <div className="flex min-h-[250px] flex-col p-7">
                                <div className="flex items-center justify-between gap-4">
                                    <span
                                        className={`text-[10px] font-black uppercase tracking-[0.18em] ${index === 0
                                            ? "text-[#79A9FF]"
                                            : "text-[#176BFF]"
                                            }`}
                                    >
                                        {categoryLabel(post.category)}
                                    </span>

                                    <span
                                        className={`text-xs ${index === 0
                                            ? "text-white/40"
                                            : "text-[#96A4B5]"
                                            }`}
                                    >
                                        {formatDate(post.published_at)}
                                    </span>
                                </div>

                                <div className="mt-6">
                                    <h3
                                        className={`text-[22px] font-extrabold leading-tight tracking-[-0.03em] ${index === 0
                                            ? "!text-white"
                                            : "text-[#071B33]"
                                            }`}
                                    >
                                        {post.title}
                                    </h3>

                                    {post.excerpt && (
                                        <p
                                            className={`mt-4 line-clamp-3 text-sm leading-6 ${index === 0
                                                ? "text-white/60"
                                                : "text-[#657386]"
                                                }`}
                                        >
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>

                                <div
                                    className={`mt-auto pt-6 text-sm font-extrabold transition group-hover:translate-x-1 ${index === 0
                                        ? "text-[#79A9FF]"
                                        : "text-[#176BFF]"
                                        }`}
                                >
                                    Lire l&apos;analyse →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* SIGNATURE */}
                <div className="mt-7 text-xs font-semibold text-[#96A4B5]">
                    Publications alimentées par PaxSolutio Intelligence
                </div>
            </div>
        </section>
    );
}