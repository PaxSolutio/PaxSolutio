import OpenAI from "openai";
import { NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

type IntelligenceItem = {
    id: string;
    item_type: string;
    title: string;
    summary: string | null;
    analysis: string | null;
    categories: string[];
    countries: string[];
    companies: string[];
    products: string[];

    commercial_impact_score: number | null;
    opportunity_score: number | null;
    audience_relevance_score: number | null;
    novelty_score: number | null;
    seo_score: number | null;
    social_score: number | null;
    reliability_score: number | null;

    total_score: number | null;
    confidence_score: number | null;
    urgency_score: number | null;
    risk_score: number | null;

    status: string;
    event_date: string | null;
    detected_at: string;
};

type SourceRecord = {
    intelligence_item_id: string;
    source_url: string;
    source_title: string | null;
    published_at: string | null;
    is_primary: boolean;
};

export async function POST() {
    try {
        // =========================================================
        // 1. AUTHENTIFICATION
        // =========================================================

        const authSupabase = await createAuthServerClient();

        const {
            data: { user },
            error: userError,
        } = await authSupabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Non autorisé.",
                },
                {
                    status: 401,
                }
            );
        }

        // =========================================================
        // 2. VÉRIFICATION ADMINISTRATEUR
        // =========================================================

        const supabase = createServerSupabaseClient();

        const { data: admin, error: adminError } =
            await supabase
                .from("admin_users")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();

        if (adminError) {
            console.error(
                "Erreur vérification administrateur Brief :",
                adminError
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Impossible de vérifier les droits administrateur.",
                },
                {
                    status: 500,
                }
            );
        }

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Accès administrateur requis.",
                },
                {
                    status: 403,
                }
            );
        }

        // =========================================================
        // 3. CONFIGURATION DE LA PÉRIODE
        // =========================================================

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    error: "OPENAI_API_KEY manquante.",
                },
                {
                    status: 500,
                }
            );
        }

        const periodEnd = new Date();

        const periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() - 7);

        // =========================================================
        // 4. RÉCUPÉRATION DES ITEMS
        // =========================================================

        const { data: itemsData, error: itemsError } =
            await supabase
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
            commercial_impact_score,
            opportunity_score,
            audience_relevance_score,
            novelty_score,
            seo_score,
            social_score,
            reliability_score,
            total_score,
            confidence_score,
            urgency_score,
            risk_score,
            status,
            event_date,
            detected_at
          `
                )
                .gte(
                    "detected_at",
                    periodStart.toISOString()
                )
                .order("total_score", {
                    ascending: false,
                })
                .order("detected_at", {
                    ascending: false,
                })
                .limit(80);

        if (itemsError) {
            console.error(
                "Erreur récupération items Brief :",
                itemsError
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Impossible de récupérer les informations Intelligence.",
                },
                {
                    status: 500,
                }
            );
        }

        const items =
            (itemsData ?? []) as unknown as IntelligenceItem[];

        if (items.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Aucune information Intelligence disponible pour générer le brief.",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================================================
        // 5. RÉCUPÉRATION DES SOURCES
        // =========================================================

        const itemIds = items.map(
            (item) => item.id
        );

        const { data: sourcesData, error: sourcesError } =
            await supabase
                .from("intelligence_item_sources")
                .select(
                    `
            intelligence_item_id,
            source_url,
            source_title,
            published_at,
            is_primary
          `
                )
                .in(
                    "intelligence_item_id",
                    itemIds
                );

        if (sourcesError) {
            console.error(
                "Erreur récupération sources Brief :",
                sourcesError
            );
        }

        const sources =
            (sourcesData ?? []) as unknown as SourceRecord[];

        // =========================================================
        // 6. PRÉPARATION DU CONTEXTE
        // =========================================================

        const intelligenceContext =
            items.map((item, index) => {
                const itemSources =
                    sources
                        .filter(
                            (source) =>
                                source.intelligence_item_id ===
                                item.id
                        )
                        .slice(0, 5);

                return {
                    index: index + 1,
                    id: item.id,

                    item_type:
                        item.item_type,

                    title:
                        item.title,

                    summary:
                        item.summary,

                    analysis:
                        item.analysis,

                    categories:
                        item.categories ?? [],

                    countries:
                        item.countries ?? [],

                    companies:
                        item.companies ?? [],

                    products:
                        item.products ?? [],

                    event_date:
                        item.event_date,

                    detected_at:
                        item.detected_at,

                    scores: {
                        total:
                            item.total_score,

                        commercial_impact:
                            item.commercial_impact_score,

                        opportunity:
                            item.opportunity_score,

                        audience_relevance:
                            item.audience_relevance_score,

                        novelty:
                            item.novelty_score,

                        seo:
                            item.seo_score,

                        social:
                            item.social_score,

                        reliability:
                            item.reliability_score,

                        confidence:
                            item.confidence_score,

                        urgency:
                            item.urgency_score,

                        risk:
                            item.risk_score,
                    },

                    sources:
                        itemSources.map(
                            (source) => ({
                                title:
                                    source.source_title,

                                url:
                                    source.source_url,

                                published_at:
                                    source.published_at,

                                is_primary:
                                    source.is_primary,
                            })
                        ),
                };
            });

        // =========================================================
        // 7. PROMPT ANALYSTE
        // =========================================================

        const prompt = `
Tu es le responsable Intelligence stratégique de PaxSolutio.

Tu dois produire un BRIEF STRATÉGIQUE EXÉCUTIF à partir
UNIQUEMENT des informations Intelligence fournies ci-dessous.

Tu ne dois PAS effectuer de nouvelle recherche web.

Tu ne dois PAS inventer de faits, chiffres, prix, entreprises,
réglementations ou conclusions non soutenues par les données.

PÉRIODE :
${periodStart.toISOString()}
→
${periodEnd.toISOString()}

MISSION :

Transformer des événements isolés en information décisionnelle.

Le brief doit permettre à la direction de PaxSolutio d'identifier :

- les opportunités commerciales ;
- les opportunités de sourcing ;
- les produits potentiellement intéressants ;
- les évolutions réglementaires ;
- les risques ;
- les changements géopolitiques importants ;
- les perturbations logistiques ;
- les mouvements de concurrents ;
- les nouvelles entreprises ;
- les tendances émergentes ;
- les signaux faibles ;
- les sujets intéressants pour le CMS public ;
- les sujets à surveiller dans le temps.

IMPORTANT :

PaxSolutio travaille notamment dans :

- sourcing international ;
- import-export ;
- recherche fournisseurs ;
- automobile ;
- équipements ;
- engins ;
- produits industriels ;
- e-commerce ;
- logistique internationale ;
- contrôle qualité ;
- commerce Chine-Europe et Chine-Afrique.

RÈGLES D'ANALYSE :

1. Distingue toujours FAIT et ANALYSE.

2. Une corrélation entre plusieurs événements peut être signalée,
mais elle ne doit jamais être présentée comme une certitude si
elle ne l'est pas.

3. Une opportunité commerciale doit expliquer POURQUOI elle
pourrait être intéressante.

4. Ne crée jamais de prix de sourcing.

5. Ne prétends jamais qu'un produit est homologué ou importable
sans réserve réglementaire.

6. Une opportunité produit peut être proposée pour étude,
mais pas automatiquement proposée à la vente.

7. Pour les sujets réglementaires et géopolitiques, utilise un
langage prudent.

8. Priorise les informations avec :
- score total élevé ;
- confiance élevée ;
- urgence élevée ;
- impact commercial élevé ;
- plusieurs sources crédibles.

9. Un sujet SEO intéressant mais sans valeur stratégique ne doit
pas devenir une priorité stratégique.

10. Un événement peut apparaître dans plusieurs analyses si cela
est réellement utile, mais évite la répétition.

11. Les candidats éditoriaux doivent être intéressants pour les
clients/prospects PaxSolutio.

12. Les informations confidentielles ou trop stratégiques peuvent
rester dans le brief sans être recommandées à la publication.

FORMAT ATTENDU :

executive_summary :
Synthèse de direction en 3 à 6 paragraphes courts.

opportunities :
Maximum 5 opportunités stratégiques générales.

product_opportunities :
Maximum 5 produits ou catégories de produits méritant une
étude de sourcing ou de marché.

risks_regulations :
Maximum 5 risques, réglementations ou événements géopolitiques.

trends_signals :
Maximum 5 tendances ou signaux faibles.

competition :
Maximum 5 mouvements concurrentiels ou entreprises à suivre.

editorial_candidates :
Maximum 5 sujets pouvant devenir un article PaxSolutio.

watchlist :
Maximum 5 sujets trop incertains ou encore trop faibles pour
agir immédiatement mais qui méritent une surveillance.

Chaque élément doit comporter :

- title
- summary
- rationale
- priority_score de 0 à 100
- confidence_score de 0 à 100
- source_item_ids

Pour product_opportunities, ajoute également :

- product_name
- opportunity_type

opportunity_type doit être l'une de ces valeurs :

sourcing
resale
sample
automotive
industrial
ecommerce
market_test
other

DONNÉES INTELLIGENCE :

${JSON.stringify(
            intelligenceContext,
            null,
            2
        )}
`;

        // =========================================================
        // 8. ANALYSE GPT
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
                            "paxsolutio_intelligence_brief",

                        strict: true,

                        schema: {
                            type: "object",

                            additionalProperties: false,

                            properties: {
                                executive_summary: {
                                    type: "string",
                                },

                                opportunities: {
                                    type: "array",
                                    maxItems: 5,
                                    items: {
                                        type: "object",
                                        additionalProperties: false,

                                        properties: {
                                            title: {
                                                type: "string",
                                            },

                                            summary: {
                                                type: "string",
                                            },

                                            rationale: {
                                                type: "string",
                                            },

                                            priority_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            confidence_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            source_item_ids: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                },
                                            },
                                        },

                                        required: [
                                            "title",
                                            "summary",
                                            "rationale",
                                            "priority_score",
                                            "confidence_score",
                                            "source_item_ids",
                                        ],
                                    },
                                },

                                product_opportunities: {
                                    type: "array",
                                    maxItems: 5,

                                    items: {
                                        type: "object",

                                        additionalProperties: false,

                                        properties: {
                                            product_name: {
                                                type: "string",
                                            },

                                            opportunity_type: {
                                                type: "string",

                                                enum: [
                                                    "sourcing",
                                                    "resale",
                                                    "sample",
                                                    "automotive",
                                                    "industrial",
                                                    "ecommerce",
                                                    "market_test",
                                                    "other",
                                                ],
                                            },

                                            title: {
                                                type: "string",
                                            },

                                            summary: {
                                                type: "string",
                                            },

                                            rationale: {
                                                type: "string",
                                            },

                                            priority_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            confidence_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            source_item_ids: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                },
                                            },
                                        },

                                        required: [
                                            "product_name",
                                            "opportunity_type",
                                            "title",
                                            "summary",
                                            "rationale",
                                            "priority_score",
                                            "confidence_score",
                                            "source_item_ids",
                                        ],
                                    },
                                },

                                risks_regulations: {
                                    type: "array",
                                    maxItems: 5,
                                    items: {
                                        type: "object",
                                        additionalProperties: false,

                                        properties: {
                                            title: {
                                                type: "string",
                                            },

                                            summary: {
                                                type: "string",
                                            },

                                            rationale: {
                                                type: "string",
                                            },

                                            priority_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            confidence_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            source_item_ids: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                },
                                            },
                                        },

                                        required: [
                                            "title",
                                            "summary",
                                            "rationale",
                                            "priority_score",
                                            "confidence_score",
                                            "source_item_ids",
                                        ],
                                    },
                                },

                                trends_signals: {
                                    type: "array",
                                    maxItems: 5,
                                    items: {
                                        type: "object",
                                        additionalProperties: false,

                                        properties: {
                                            title: {
                                                type: "string",
                                            },

                                            summary: {
                                                type: "string",
                                            },

                                            rationale: {
                                                type: "string",
                                            },

                                            priority_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            confidence_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            source_item_ids: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                },
                                            },
                                        },

                                        required: [
                                            "title",
                                            "summary",
                                            "rationale",
                                            "priority_score",
                                            "confidence_score",
                                            "source_item_ids",
                                        ],
                                    },
                                },

                                competition: {
                                    type: "array",
                                    maxItems: 5,
                                    items: {
                                        type: "object",
                                        additionalProperties: false,

                                        properties: {
                                            title: {
                                                type: "string",
                                            },

                                            summary: {
                                                type: "string",
                                            },

                                            rationale: {
                                                type: "string",
                                            },

                                            priority_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            confidence_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            source_item_ids: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                },
                                            },
                                        },

                                        required: [
                                            "title",
                                            "summary",
                                            "rationale",
                                            "priority_score",
                                            "confidence_score",
                                            "source_item_ids",
                                        ],
                                    },
                                },

                                editorial_candidates: {
                                    type: "array",
                                    maxItems: 5,
                                    items: {
                                        type: "object",
                                        additionalProperties: false,

                                        properties: {
                                            title: {
                                                type: "string",
                                            },

                                            summary: {
                                                type: "string",
                                            },

                                            rationale: {
                                                type: "string",
                                            },

                                            priority_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            confidence_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            source_item_ids: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                },
                                            },
                                        },

                                        required: [
                                            "title",
                                            "summary",
                                            "rationale",
                                            "priority_score",
                                            "confidence_score",
                                            "source_item_ids",
                                        ],
                                    },
                                },

                                watchlist: {
                                    type: "array",
                                    maxItems: 5,
                                    items: {
                                        type: "object",
                                        additionalProperties: false,

                                        properties: {
                                            title: {
                                                type: "string",
                                            },

                                            summary: {
                                                type: "string",
                                            },

                                            rationale: {
                                                type: "string",
                                            },

                                            priority_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            confidence_score: {
                                                type: "integer",
                                                minimum: 0,
                                                maximum: 100,
                                            },

                                            source_item_ids: {
                                                type: "array",
                                                items: {
                                                    type: "string",
                                                },
                                            },
                                        },

                                        required: [
                                            "title",
                                            "summary",
                                            "rationale",
                                            "priority_score",
                                            "confidence_score",
                                            "source_item_ids",
                                        ],
                                    },
                                },
                            },

                            required: [
                                "executive_summary",
                                "opportunities",
                                "product_opportunities",
                                "risks_regulations",
                                "trends_signals",
                                "competition",
                                "editorial_candidates",
                                "watchlist",
                            ],
                        },
                    },
                },
            });

        if (!response.output_text) {
            throw new Error(
                "Aucun Brief Intelligence généré."
            );
        }

        // =========================================================
        // 9. PARSING
        // =========================================================

        const briefData =
            JSON.parse(response.output_text);

        // =========================================================
        // 10. IDENTIFIANTS SOURCES UTILISÉS
        // =========================================================

        const validItemIds = new Set(
            items.map((item) => item.id)
        );

        const sourceItemIds = Array.from(
            new Set(
                [
                    ...briefData.opportunities,
                    ...briefData.product_opportunities,
                    ...briefData.risks_regulations,
                    ...briefData.trends_signals,
                    ...briefData.competition,
                    ...briefData.editorial_candidates,
                    ...briefData.watchlist,
                ]
                    .flatMap(
                        (entry: {
                            source_item_ids?: string[];
                        }) =>
                            entry.source_item_ids ?? []
                    )
                    .filter(
                        (id: string) =>
                            validItemIds.has(id)
                    )
            )
        );

        // =========================================================
        // 11. ENREGISTREMENT
        // =========================================================

        const { data: insertedBrief, error: insertError } =
            await supabase
                .from("intelligence_briefs")
                .insert({
                    title:
                        "Brief stratégique PaxSolutio Intelligence",

                    period_start:
                        periodStart.toISOString(),

                    period_end:
                        periodEnd.toISOString(),

                    executive_summary:
                        briefData.executive_summary,

                    opportunities:
                        briefData.opportunities,

                    product_opportunities:
                        briefData.product_opportunities,

                    risks_regulations:
                        briefData.risks_regulations,

                    trends_signals:
                        briefData.trends_signals,

                    competition:
                        briefData.competition,

                    editorial_candidates:
                        briefData.editorial_candidates,

                    watchlist:
                        briefData.watchlist,

                    source_item_ids:
                        sourceItemIds,

                    model:
                        "gpt-5.6-terra",

                    status:
                        "generated",

                    updated_at:
                        new Date().toISOString(),
                })
                .select()
                .single();

        if (insertError || !insertedBrief) {
            console.error(
                "Erreur insertion Intelligence Brief :",
                insertError
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le Brief a été généré mais n'a pas pu être enregistré.",
                },
                {
                    status: 500,
                }
            );
        }

        // =========================================================
        // 12. RÉPONSE
        // =========================================================

        return NextResponse.json({
            success: true,
            brief: insertedBrief,
            analyzedItems: items.length,
        });
    } catch (error) {
        console.error(
            "Erreur génération Brief Intelligence :",
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Erreur Brief Intelligence inconnue.",
            },
            {
                status: 500,
            }
        );
    }
}