import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
    title: "Nouveautés Sourcing, Import & Opportunités",
    description:
        "Découvrez les actualités PaxSolutio, opportunités de sourcing, informations réglementaires, nouveautés produits et contenus terrain depuis la Chine.",
    alternates: {
        canonical: "/nouveautes",
    },
    openGraph: {
        title: "Nouveautés Sourcing, Import & Opportunités | PaxSolutio",
        description:
            "Actualités, opportunités, réglementation import et contenus terrain PaxSolutio.",
        url: "/nouveautes",
        type: "website",
    },
};

type NewsPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    category: string;
    featured: boolean;
    image_url: string | null;
    video_url: string | null;
    price_label: string | null;
    market_price_label: string | null;
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
            return "Terrain PaxSolutio";
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

export default async function NewsPage() {
    const supabase = createServerSupabaseClient();

    const { data: posts, error } = await supabase
        .from("news_posts")
        .select(
            "id, slug, title, excerpt, category, featured, image_url, video_url, price_label, market_price_label, published_at"
        )
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false });

    if (error) {
        console.error("Erreur récupération nouveautés publiques :", error);
    }

    const publicationList = (posts ?? []) as NewsPost[];

    const featuredPost =
        publicationList.find((post) => post.featured) ?? publicationList[0];

    const remainingPosts = featuredPost
        ? publicationList.filter((post) => post.id !== featuredPost.id)
        : publicationList;

    return (
        <>
            <main className="min-h-screen bg-[#f6f7f9] text-[#081426]">
                {/* HERO */}

                <section className="relative overflow-hidden bg-[#071321] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_35%)]" />

                    <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
                        <div className="max-w-4xl">
                            <div className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
                                Actualités • Opportunités • Terrain
                            </div>

                            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                                Découvrez ce qui bouge dans le sourcing international.
                            </h1>

                            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                                Nouveaux produits, tendances marché, réglementation,
                                opportunités de sourcing et contenus directement issus du terrain.
                            </p>

                            <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-300">
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                                    Chine
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                                    Sourcing
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                                    Automobile
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                                    Import & logistique
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PUBLICATION À LA UNE */}

                <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
                    {publicationList.length === 0 ? (
                        <div className="rounded-[2rem] border border-slate-200 bg-white px-8 py-20 text-center shadow-sm">
                            <h2 className="text-2xl font-semibold">
                                Les premières publications arrivent bientôt
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
                                Retrouvez prochainement nos opportunités de sourcing, analyses,
                                nouveautés produits et informations import.
                            </p>

                            <Link
                                href="/ressources"
                                className="mt-8 inline-flex rounded-xl bg-[#0b5cff] px-5 py-3 font-semibold text-white transition hover:bg-[#084edc]"
                            >
                                Consulter nos guides
                            </Link>
                        </div>
                    ) : (
                        <>
                            {featuredPost && (
                                <div className="mb-24">
                                    <div className="mb-8 flex items-end justify-between gap-6">
                                        <div>
                                            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b5cff]">
                                                À la une
                                            </div>

                                            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                                                Le dernier sujet à découvrir
                                            </h2>
                                        </div>
                                    </div>

                                    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                                        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                                            <div className="relative min-h-[360px] overflow-hidden bg-slate-100 lg:min-h-[560px]">
                                                {featuredPost.image_url ? (
                                                    <img
                                                        src={featuredPost.image_url}
                                                        alt={featuredPost.title}
                                                        className="absolute inset-0 h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-[360px] items-center justify-center text-sm text-slate-400">
                                                        PaxSolutio
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
                                                <div className="text-sm font-semibold uppercase tracking-[0.15em] text-[#0b5cff]">
                                                    {categoryLabel(featuredPost.category)}
                                                </div>

                                                <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                                                    {featuredPost.title}
                                                </h3>

                                                {featuredPost.published_at && (
                                                    <div className="mt-4 text-sm text-slate-500">
                                                        {formatDate(featuredPost.published_at)}
                                                    </div>
                                                )}

                                                {featuredPost.excerpt && (
                                                    <p className="mt-7 text-[17px] leading-8 font-medium text-slate-700">
                                                        {featuredPost.excerpt}
                                                    </p>
                                                )}

                                                {featuredPost.price_label && (
                                                    <div className="mt-8">
                                                        {featuredPost.market_price_label && (
                                                            <div className="text-sm text-slate-500">
                                                                {featuredPost.market_price_label}
                                                            </div>
                                                        )}

                                                        <div className="mt-1 text-2xl font-semibold text-[#081426]">
                                                            {featuredPost.price_label}
                                                        </div>
                                                    </div>
                                                )}

                                                <Link
                                                    href={`/nouveautes/${featuredPost.slug}`}
                                                    className="mt-9 inline-flex w-fit rounded-xl bg-[#0b5cff] px-6 py-3.5 font-semibold text-white transition hover:bg-[#084edc]"
                                                >
                                                    Découvrir
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            )}

                            {/* AUTRES PUBLICATIONS */}

                            <div className="mb-10 flex items-end justify-between gap-6">
                                <div>
                                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b5cff]">
                                        Dernières publications
                                    </div>

                                    <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                                        Actualités, analyses & opportunités
                                    </h2>
                                </div>

                                <Link
                                    href="/ressources"
                                    className="hidden text-sm font-semibold text-slate-600 transition hover:text-[#0b5cff] md:block"
                                >
                                    Voir les guides →
                                </Link>
                            </div>

                            {remainingPosts.length > 0 ? (
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {remainingPosts.map((post) => (
                                        <article
                                            key={post.id}
                                            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                                        >
                                            <Link href={`/nouveautes/${post.slug}`}>
                                                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                                    {post.image_url ? (
                                                        <img
                                                            src={post.image_url}
                                                            alt={post.title}
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                            PaxSolutio
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-7">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b5cff]">
                                                        {categoryLabel(post.category)}
                                                    </div>

                                                    <h3 className="mt-3 text-xl font-semibold leading-snug">
                                                        {post.title}
                                                    </h3>

                                                    {post.excerpt && (
                                                        <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-slate-700">
                                                            {post.excerpt}
                                                        </p>
                                                    )}

                                                    {post.price_label && (
                                                        <div className="mt-5 text-lg font-semibold">
                                                            {post.price_label}
                                                        </div>
                                                    )}

                                                    <div className="mt-6 text-sm font-semibold text-[#0b5cff]">
                                                        Lire la publication →
                                                    </div>
                                                </div>
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
                                    D’autres publications seront ajoutées prochainement.
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* BLOC TERRAIN */}

                <section className="bg-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center md:py-24">
                        <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b5cff]">
                                Sur le terrain
                            </div>

                            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                                Plus que des articles : montrer ce qui se passe réellement.
                            </h2>
                        </div>

                        <div>
                            <p className="text-lg leading-8 text-slate-600">
                                Visites d’usines, showrooms, inspections, produits repérés,
                                chargements et évolutions du marché : cette rubrique est aussi
                                pensée pour accueillir progressivement photos et vidéos terrain.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA FINAL */}

                <section className="bg-[#071321] text-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
                        <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-400">
                                Ressources PaxSolutio
                            </div>

                            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                                Approfondissez vos projets de sourcing et d’import.
                            </h2>

                            <p className="mt-5 max-w-xl leading-7 text-slate-300">
                                Guides pratiques, Incoterms, contrôle qualité, fournisseurs,
                                logistique et coûts d’importation.
                            </p>
                        </div>

                        <div className="md:text-right">
                            <Link
                                href="/ressources"
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold !text-[#081426] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:!text-[#081426] hover:shadow-md"
                            >
                                Explorer les ressources
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}