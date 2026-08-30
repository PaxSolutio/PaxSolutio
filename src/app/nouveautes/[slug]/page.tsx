import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PageProps = {
    params: Promise<{
        slug: string;
    }>;
};

type NewsPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    category: string;
    image_url: string | null;
    video_url: string | null;
    price_label: string | null;
    market_price_label: string | null;
    cta_label: string | null;
    cta_href: string | null;
    cta_type: string | null;
    seo_title: string | null;
    seo_description: string | null;
    tags: string[];
    source_urls: string[];
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

async function getPost(slug: string) {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error) {
        console.error("Erreur récupération publication :", error);
    }

    return (data ?? null) as NewsPost | null;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return {
            title: "Publication introuvable",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const title = post.seo_title || post.title;
    const description =
        post.seo_description ||
        post.excerpt ||
        "Découvrez cette publication PaxSolutio.";

    return {
        title,
        description,

        alternates: {
            canonical: `/nouveautes/${post.slug}`,
        },

        openGraph: {
            title,
            description,
            url: `/nouveautes/${post.slug}`,
            type: "article",
            images: post.image_url
                ? [
                    {
                        url: post.image_url,
                        alt: post.title,
                    },
                ]
                : undefined,
            publishedTime: post.published_at || undefined,
        },

        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: post.image_url ? [post.image_url] : undefined,
        },
    };
}

export default async function NewsPostPage({
    params,
}: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.seo_description || post.excerpt || undefined,
        datePublished: post.published_at || undefined,
        image: post.image_url || undefined,
        author: {
            "@type": "Organization",
            name: "PaxSolutio",
        },
        publisher: {
            "@type": "Organization",
            name: "PaxSolutio",
            url: "https://paxsolutio.com",
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://paxsolutio.com/nouveautes/${post.slug}`,
        },
    };

    return (
        <main className="min-h-screen bg-[#f6f7f9] text-[#081426]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />

            <article>
                {/* HEADER ARTICLE */}

                <header className="relative overflow-hidden bg-[#071321] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.2),transparent_35%)]" />

                    <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-24">
                        <Link
                            href="/nouveautes"
                            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                        >
                            ← Toutes les nouveautés
                        </Link>

                        <div className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-blue-400">
                            {categoryLabel(post.category)}
                        </div>

                        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                            {post.title}
                        </h1>

                        {post.excerpt && (
                            <p className="mt-7 max-w-3xl text-xl leading-8 text-slate-300">
                                {post.excerpt}
                            </p>
                        )}

                        {post.published_at && (
                            <div className="mt-8 text-sm text-slate-500">
                                Publié le {formatDate(post.published_at)}
                            </div>
                        )}
                    </div>
                </header>

                {/* IMAGE */}

                {post.image_url && (
                    <section className="mx-auto max-w-6xl px-6 pt-14">
                        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="max-h-[720px] w-full object-cover"
                            />
                        </div>
                    </section>
                )}

                {/* CONTENU */}

                <section className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
                        <div>
                            <ReactMarkdown
                                remarkPlugins={[
                                    remarkGfm,
                                ]}
                                components={{
                                    h2: ({
                                        children,
                                    }) => (
                                        <h2 className="mb-5 mt-12 text-3xl font-semibold tracking-tight text-[#081426] first:mt-0 md:text-4xl">
                                            {children}
                                        </h2>
                                    ),

                                    h3: ({
                                        children,
                                    }) => (
                                        <h3 className="mb-4 mt-9 text-2xl font-semibold text-[#081426]">
                                            {children}
                                        </h3>
                                    ),

                                    p: ({
                                        children,
                                    }) => (
                                        <p className="my-5 text-[17px] leading-8 text-slate-700 md:text-lg">
                                            {children}
                                        </p>
                                    ),

                                    strong: ({
                                        children,
                                    }) => (
                                        <strong className="font-semibold text-[#081426]">
                                            {children}
                                        </strong>
                                    ),

                                    ul: ({
                                        children,
                                    }) => (
                                        <ul className="my-7 list-disc space-y-2 pl-6 text-[17px] leading-8 text-slate-700 md:text-lg">
                                            {children}
                                        </ul>
                                    ),

                                    ol: ({
                                        children,
                                    }) => (
                                        <ol className="my-7 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-slate-700 md:text-lg">
                                            {children}
                                        </ol>
                                    ),

                                    blockquote: ({
                                        children,
                                    }) => (
                                        <blockquote className="my-10 rounded-r-xl border-l-4 border-[#0b5cff] bg-blue-50 px-6 py-5 text-lg italic leading-8 text-slate-700">
                                            {children}
                                        </blockquote>
                                    ),

                                    a: ({
                                        children,
                                        href,
                                    }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-[#0b5cff] underline decoration-blue-200 underline-offset-4 transition hover:decoration-[#0b5cff]"
                                        >
                                            {children}
                                        </a>
                                    ),

                                    img: ({
                                        src,
                                        alt,
                                    }) => (
                                        <figure className="my-12">
                                            <img
                                                src={src || ""}
                                                alt={alt || ""}
                                                className="max-h-[720px] w-full rounded-2xl object-cover shadow-sm"
                                            />

                                            {alt && (
                                                <figcaption className="mt-3 text-center text-sm text-slate-500">
                                                    {alt}
                                                </figcaption>
                                            )}
                                        </figure>
                                    ),

                                    hr: () => (
                                        <hr className="my-12 border-slate-200" />
                                    ),
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        {post.video_url && (
                            <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0b5cff]">
                                    Vidéo
                                </div>

                                <a
                                    href={post.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-block break-all text-slate-700 underline underline-offset-4"
                                >
                                    Voir la vidéo
                                </a>
                            </div>
                        )}

                        {post.source_urls?.length > 0 && (
                            <section className="mt-14 border-t border-slate-200 pt-8">
                                <h2 className="text-xl font-semibold">
                                    Sources
                                </h2>

                                <div className="mt-5 space-y-3">
                                    {post.source_urls.map((source) => (
                                        <a
                                            key={source}
                                            href={source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block break-all text-sm font-medium text-[#0b5cff] hover:underline"
                                        >
                                            {source}
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* SIDEBAR */}

                    <aside className="space-y-6">
                        {(post.price_label ||
                            post.market_price_label ||
                            post.cta_label) && (
                                <div className="sticky top-8 rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm">
                                    <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[#0b5cff]">
                                        Opportunité
                                    </div>

                                    {post.market_price_label && (
                                        <div className="mt-5 text-sm text-slate-500">
                                            {post.market_price_label}
                                        </div>
                                    )}

                                    {post.price_label && (
                                        <div className="mt-2 text-3xl font-semibold">
                                            {post.price_label}
                                        </div>
                                    )}

                                    {post.cta_label && post.cta_href && (
                                        <Link
                                            href={post.cta_href}
                                            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#0b5cff] px-5 py-3.5 font-semibold text-white transition hover:bg-[#084edc]"
                                        >
                                            {post.cta_label}
                                        </Link>
                                    )}

                                    {post.cta_type === "payment" && (
                                        <p className="mt-4 text-xs leading-5 text-slate-500">
                                            Le paiement en ligne sera disponible prochainement.
                                        </p>
                                    )}
                                </div>
                            )}

                        {post.tags?.length > 0 && (
                            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm">
                                <div className="text-sm font-semibold">
                                    Thématiques
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </section>
            </article>

            {/* CTA FINAL */}

            <section className="bg-[#071321] text-white">
                <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-16 md:flex-row md:items-center">
                    <div>
                        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-400">
                            Votre projet
                        </div>

                        <h2 className="mt-3 text-3xl font-semibold">
                            Besoin de sourcer un produit ou un fournisseur ?
                        </h2>

                        <p className="mt-4 max-w-xl leading-7 text-slate-300">
                            PaxSolutio vous accompagne de la recherche fournisseur jusqu’à la
                            coordination logistique.
                        </p>
                    </div>

                    <Link
                        href="/contact"
                        className="inline-flex rounded-xl bg-white px-6 py-3.5 font-semibold text-[#081426] transition hover:bg-slate-100"
                    >
                        Démarrer un projet
                    </Link>
                </div>
            </section>
        </main>
    );
}