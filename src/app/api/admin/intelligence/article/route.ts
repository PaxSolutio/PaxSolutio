import { NextResponse } from "next/server";
import OpenAI from "openai";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type IntelligenceSource = {
  source_url: string;
  source_title: string | null;
  published_at: string | null;
  is_primary: boolean;
};

type GeneratedArticle = {
  title: string;
  excerpt: string;
  content: string;

  category:
    | "actualite"
    | "reglementation"
    | "opportunite"
    | "terrain";

  seo_title: string;
  seo_description: string;
  tags: string[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

async function createUniqueSlug(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  title: string
) {
  const baseSlug =
    slugify(title) || `article-${Date.now()}`;

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const { data } = await supabase
      .from("news_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function requireAdmin() {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false as const,

      response: NextResponse.json(
        {
          success: false,
          error: "Non authentifié.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const supabase =
    createServerSupabaseClient();

  const { data: admin, error: adminError } =
    await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError || !admin) {
    return {
      authorized: false as const,

      response: NextResponse.json(
        {
          success: false,
          error:
            "Accès administrateur requis.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    authorized: true as const,
    user,
  };
}

export async function POST(
  request: Request
) {
  try {
    // =========================================================
    // AUTH
    // =========================================================

    const adminCheck =
      await requireAdmin();

    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OPENAI_API_KEY manquante.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================================================
    // BODY
    // =========================================================

    const body =
      (await request.json()) as {
        intelligenceItemId?: string;
      };

    const intelligenceItemId =
      body.intelligenceItemId?.trim();

    if (!intelligenceItemId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "intelligenceItemId manquant.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createServerSupabaseClient();

    // =========================================================
    // ITEM INTELLIGENCE
    // =========================================================

    const {
      data: intelligenceItem,
      error: itemError,
    } = await supabase
      .from("intelligence_items")
      .select(
        `
          id,
          item_type,
          title,
          summary,
          analysis,
          categories,
          countries,
          companies,
          products,
          event_date,
          total_score,
          confidence_score,
          urgency_score,
          risk_score,
          status,
          metadata,
          generated_news_post_id
        `
      )
      .eq(
        "id",
        intelligenceItemId
      )
      .single();

    if (
      itemError ||
      !intelligenceItem
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Information Intelligence introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    // =========================================================
    // ARTICLE DÉJÀ CRÉÉ
    // =========================================================

    if (
      intelligenceItem.generated_news_post_id
    ) {
      const { data: existingPost } =
        await supabase
          .from("news_posts")
          .select(
            "id, slug, status"
          )
          .eq(
            "id",
            intelligenceItem.generated_news_post_id
          )
          .maybeSingle();

      if (existingPost) {
        return NextResponse.json({
          success: true,
          alreadyExists: true,
          post: existingPost,
        });
      }
    }

    // =========================================================
    // SOURCES
    // =========================================================

    const {
      data: sourcesData,
      error: sourcesError,
    } = await supabase
      .from(
        "intelligence_item_sources"
      )
      .select(
        `
          source_url,
          source_title,
          published_at,
          is_primary
        `
      )
      .eq(
        "intelligence_item_id",
        intelligenceItemId
      )
      .order("is_primary", {
        ascending: false,
      });

    if (sourcesError) {
      console.error(
        "Erreur récupération sources :",
        sourcesError
      );
    }

    const sources =
      (sourcesData ??
        []) as IntelligenceSource[];

    if (sources.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de générer un article sans source.",
        },
        {
          status: 400,
        }
      );
    }

    const sourcesContext =
      sources
        .map(
          (
            source,
            index
          ) => `
SOURCE ${index + 1}
Titre : ${
            source.source_title ??
            "Non renseigné"
          }
URL : ${source.source_url}
Date : ${
            source.published_at ??
            "Non renseignée"
          }
Source primaire : ${
            source.is_primary
              ? "oui"
              : "non"
          }
`.trim()
        )
        .join("\n\n");

    // =========================================================
    // PROMPT ARTICLE
    // =========================================================

    const prompt = `
Tu es rédacteur et analyste pour PaxSolutio.

Tu dois transformer une information issue de PaxSolutio Intelligence
en un article professionnel destiné au site PaxSolutio.

PUBLIC CIBLE

- importateurs ;
- entrepreneurs ;
- distributeurs ;
- e-commerçants ;
- professionnels du sourcing ;
- entreprises travaillant avec la Chine ou à l'international.

L'article ne doit pas être un simple résumé d'actualité.

Il doit :
- expliquer les faits ;
- replacer l'information dans son contexte ;
- expliquer pourquoi elle est importante ;
- analyser les conséquences commerciales potentielles ;
- distinguer clairement les faits de l'analyse ;
- rester prudent sur les projections ;
- ne jamais inventer de données ;
- ne jamais inventer de citations ;
- ne jamais inventer de sources.

INFORMATION INTELLIGENCE

Type :
${intelligenceItem.item_type}

Titre :
${intelligenceItem.title}

Résumé :
${intelligenceItem.summary ?? ""}

Analyse Intelligence :
${intelligenceItem.analysis ?? ""}

Catégories :
${(intelligenceItem.categories ?? []).join(", ")}

Pays :
${(intelligenceItem.countries ?? []).join(", ")}

Entreprises :
${(intelligenceItem.companies ?? []).join(", ")}

Produits :
${(intelligenceItem.products ?? []).join(", ")}

Date événement :
${intelligenceItem.event_date ?? "Non renseignée"}

Score Intelligence :
${intelligenceItem.total_score ?? "N/A"}/100

Confiance :
${intelligenceItem.confidence_score ?? "N/A"}%

Urgence :
${intelligenceItem.urgency_score ?? "N/A"}%

Risque :
${intelligenceItem.risk_score ?? "N/A"}%

SOURCES

${sourcesContext}

RÈGLES

1. Utilise uniquement les informations supportées par les données Intelligence
et les sources fournies.

2. Ne transforme jamais une hypothèse en fait.

3. Pour une réglementation, un droit de douane, une sanction ou un sujet
juridique, reste informatif et indique si nécessaire que la situation
applicable doit être vérifiée au cas par cas.

4. Pour un produit ou véhicule :
- présente le lancement ou développement ;
- explique son positionnement ;
- analyse son potentiel commercial ;
- présente les limites et risques pertinents ;
- ne promet jamais une homologation, conformité ou rentabilité.

5. Évite tout ton publicitaire excessif.

6. Rédige en français.

7. Vise environ 800 à 1 300 mots seulement si les informations disponibles
permettent réellement ce niveau de détail.

8. Le contenu doit être en Markdown.

9. Structure possible :

Introduction

## Ce qu'il faut retenir

## Ce qui vient de se passer

## Pourquoi cette évolution est importante

## Quel potentiel ou impact commercial ?

## Les points de vigilance

## L'analyse PaxSolutio

Adapte la structure au sujet.

10. Ne crée pas de section Sources dans le contenu.
Les URL seront enregistrées séparément.

CATÉGORIES CMS

actualite
reglementation
opportunite
terrain

SEO

- seo_title naturel, environ 60 caractères maximum si possible ;
- seo_description autour de 140 à 160 caractères ;
- tags réellement pertinents ;
- aucun keyword stuffing.
`;

    // =========================================================
    // OPENAI
    // =========================================================

    const response =
      await openai.responses.create({
        model: "gpt-5.6-terra",

        reasoning: {
          effort: "medium",
        },

        input: prompt,

        text: {
          format: {
            type: "json_schema",

            name:
              "paxsolutio_generated_article",

            strict: true,

            schema: {
              type: "object",

              additionalProperties:
                false,

              properties: {
                title: {
                  type: "string",
                },

                excerpt: {
                  type: "string",
                },

                content: {
                  type: "string",
                },

                category: {
                  type: "string",

                  enum: [
                    "actualite",
                    "reglementation",
                    "opportunite",
                    "terrain",
                  ],
                },

                seo_title: {
                  type: "string",
                },

                seo_description: {
                  type: "string",
                },

                tags: {
                  type: "array",

                  items: {
                    type: "string",
                  },

                  maxItems: 12,
                },
              },

              required: [
                "title",
                "excerpt",
                "content",
                "category",
                "seo_title",
                "seo_description",
                "tags",
              ],
            },
          },
        },
      });

    if (!response.output_text) {
      throw new Error(
        "Aucun article généré par OpenAI."
      );
    }

    let generated:
      GeneratedArticle;

    try {
      generated =
        JSON.parse(
          response.output_text
        ) as GeneratedArticle;
    } catch {
      console.error(
        "Réponse article invalide :",
        response.output_text
      );

      throw new Error(
        "Impossible de lire l'article généré."
      );
    }

    // =========================================================
    // SLUG
    // =========================================================

    const slug =
      await createUniqueSlug(
        supabase,
        generated.title
      );

    const sourceUrls =
      Array.from(
        new Set(
          sources
            .map((source) =>
              source.source_url.trim()
            )
            .filter(Boolean)
        )
      );

    // =========================================================
    // BROUILLON CMS
    // =========================================================

    const {
      data: createdPost,
      error: createPostError,
    } = await supabase
      .from("news_posts")
      .insert({
        title:
          generated.title.trim(),

        slug,

        excerpt:
          generated.excerpt.trim(),

        content:
          generated.content.trim(),

        category:
          generated.category,

        status: "draft",

        featured: false,

        image_url: null,
        video_url: null,

        price_label: null,
        market_price_label: null,

        cta_label: null,
        cta_href: null,
        cta_type: null,

        seo_title:
          generated.seo_title.trim(),

        seo_description:
          generated.seo_description.trim(),

        tags:
          generated.tags
            .map((tag) =>
              tag.trim()
            )
            .filter(Boolean),

        source_urls:
          sourceUrls,

        published_at: null,
      })
      .select(
        "id, slug, status"
      )
      .single();

    if (
      createPostError ||
      !createdPost
    ) {
      console.error(
        "Erreur création brouillon Intelligence :",
        createPostError
      );

      throw new Error(
        "Impossible de créer le brouillon."
      );
    }

    // =========================================================
    // LIEN INTELLIGENCE → ARTICLE
    // =========================================================

    const existingMetadata =
      intelligenceItem.metadata &&
      typeof intelligenceItem.metadata ===
        "object" &&
      !Array.isArray(
        intelligenceItem.metadata
      )
        ? intelligenceItem.metadata
        : {};

    const {
      error: linkError,
    } = await supabase
      .from("intelligence_items")
      .update({
        generated_news_post_id:
          createdPost.id,

        status: "converted",

        updated_at:
          new Date().toISOString(),

        metadata: {
          ...existingMetadata,

          article_generated_at:
            new Date().toISOString(),

          article_generation_model:
            "gpt-5.6-terra",
        },
      })
      .eq(
        "id",
        intelligenceItemId
      );

    if (linkError) {
      console.error(
        "Erreur liaison Intelligence/article :",
        linkError
      );
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        alreadyExists: false,
        post: createdPost,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Erreur génération article Intelligence :",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Erreur serveur.",
      },
      {
        status: 500,
      }
    );
  }
}