import OpenAI from "openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type IntelligenceQuery = {
  id: string;
  name: string;
  radar: string;
  query_text: string;
  languages: string[];
  countries: string[];
  frequency: "3h" | "12h" | "daily" | "weekly";
  priority: number;
  active: boolean;
};

type IntelligenceSourceResult = {
  url: string;
  title: string | null;
  published_at: string | null;
  is_primary: boolean;
};

type IntelligenceResult = {
  item_type: string;
  title: string;
  summary: string;
  analysis: string;

  categories: string[];
  countries: string[];
  companies: string[];
  products: string[];

  source_language: string | null;
  event_date: string | null;

  commercial_impact_score: number;
  opportunity_score: number;
  audience_relevance_score: number;
  novelty_score: number;
  seo_score: number;
  social_score: number;
  reliability_score: number;

  confidence_score: number;
  urgency_score: number;
  risk_score: number;

  sources: IntelligenceSourceResult[];
};

type ExistingItem = {
  id: string;
  title: string;
  summary: string | null;
  event_date: string | null;
  detected_at: string;
  created_at: string;
};

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
}

function calculateTotalScore(item: IntelligenceResult) {
  return (
    clamp(item.commercial_impact_score, 0, 20) +
    clamp(item.opportunity_score, 0, 20) +
    clamp(item.audience_relevance_score, 0, 15) +
    clamp(item.novelty_score, 0, 15) +
    clamp(item.seo_score, 0, 10) +
    clamp(item.social_score, 0, 10) +
    clamp(item.reliability_score, 0, 10)
  );
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);

    parsed.hash = "";

    const removableParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ];

    for (const param of removableParams) {
      parsed.searchParams.delete(param);
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim().replace(/\/$/, "");
  }
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "from",
    "by",
    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "de",
    "du",
    "et",
    "en",
    "pour",
    "sur",
    "avec",
    "dans",
    "au",
    "aux",
  ]);

  return new Set(
    normalizeText(value)
      .split(" ")
      .filter(
        (token) =>
          token.length >= 3 && !stopWords.has(token)
      )
  );
}

function jaccardSimilarity(a: string, b: string) {
  const setA = tokenSet(a);
  const setB = tokenSet(b);

  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of setA) {
    if (setB.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...setA, ...setB]).size;

  return union === 0 ? 0 : intersection / union;
}

function getFreshnessDays(
  frequency: IntelligenceQuery["frequency"]
) {
  switch (frequency) {
    case "3h":
      return 3;

    case "12h":
      return 7;

    case "daily":
      return 14;

    case "weekly":
      return 45;

    default:
      return 14;
  }
}

function getExistingLookbackDays(
  frequency: IntelligenceQuery["frequency"]
) {
  switch (frequency) {
    case "3h":
      return 30;

    case "12h":
      return 45;

    case "daily":
      return 60;

    case "weekly":
      return 120;

    default:
      return 60;
  }
}

function getNextRunDate(
  frequency: IntelligenceQuery["frequency"]
) {
  const nextRun = new Date();

  switch (frequency) {
    case "3h":
      nextRun.setHours(nextRun.getHours() + 3);
      break;

    case "12h":
      nextRun.setHours(nextRun.getHours() + 12);
      break;

    case "weekly":
      nextRun.setDate(nextRun.getDate() + 7);
      break;

    case "daily":
    default:
      nextRun.setDate(nextRun.getDate() + 1);
      break;
  }

  return nextRun;
}

function isDateFresh(
  dateValue: string | null,
  freshnessDays: number
) {
  if (!dateValue) {
    return true;
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return true;
  }

  const limit = new Date();

  limit.setDate(limit.getDate() - freshnessDays);

  return parsed >= limit;
}

async function hasKnownSourceUrl(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  urls: string[]
) {
  if (urls.length === 0) {
    return false;
  }

  const normalizedUrls = urls.map(normalizeUrl);

  const { data, error } = await supabase
    .from("intelligence_item_sources")
    .select("source_url")
    .in("source_url", normalizedUrls)
    .limit(1);

  if (error) {
    console.error(
      "Erreur vérification URLs existantes :",
      error
    );

    return false;
  }

  return Boolean(data && data.length > 0);
}

function findSemanticDuplicate(
  candidate: IntelligenceResult,
  existingItems: ExistingItem[]
) {
  let best:
    | {
        item: ExistingItem;
        similarity: number;
      }
    | null = null;

  for (const existing of existingItems) {
    const titleSimilarity = jaccardSimilarity(
      candidate.title,
      existing.title
    );

    const combinedCandidate =
      `${candidate.title} ${candidate.summary}`;

    const combinedExisting =
      `${existing.title} ${existing.summary ?? ""}`;

    const contentSimilarity = jaccardSimilarity(
      combinedCandidate,
      combinedExisting
    );

    const similarity =
      titleSimilarity * 0.7 + contentSimilarity * 0.3;

    if (!best || similarity > best.similarity) {
      best = {
        item: existing,
        similarity,
      };
    }
  }

  if (best && best.similarity >= 0.72) {
    return best;
  }

  return null;
}

export async function runIntelligenceQuery(
  queryId: string
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY est manquante.");
  }

  const supabase = createServerSupabaseClient();

  // =========================================================
  // MISSION
  // =========================================================

  const { data: query, error: queryError } =
    await supabase
      .from("intelligence_queries")
      .select("*")
      .eq("id", queryId)
      .eq("active", true)
      .single<IntelligenceQuery>();

  if (queryError || !query) {
    throw new Error(
      `Mission Intelligence introuvable : ${
        queryError?.message ?? queryId
      }`
    );
  }

  const freshnessDays = getFreshnessDays(
    query.frequency
  );

  const existingLookbackDays =
    getExistingLookbackDays(query.frequency);

  const existingSince = new Date();

  existingSince.setDate(
    existingSince.getDate() - existingLookbackDays
  );

  // =========================================================
  // ITEMS EXISTANTS POUR ANTI-DOUBLON
  // =========================================================

  const { data: existingData, error: existingError } =
    await supabase
      .from("intelligence_items")
      .select(
        `
          id,
          title,
          summary,
          event_date,
          detected_at,
          created_at
        `
      )
      .gte(
        "created_at",
        existingSince.toISOString()
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(500);

  if (existingError) {
    console.error(
      "Erreur récupération items existants :",
      existingError
    );
  }

  const existingItems =
    (existingData ?? []) as ExistingItem[];

  // =========================================================
  // PROMPT
  // =========================================================

  const prompt = `
Tu es l'analyste principal de PaxSolutio Intelligence.

DATE ACTUELLE :
${new Date().toISOString()}

MISSION :
${query.name}

RADAR :
${query.radar}

OBJECTIF DE RECHERCHE :
${query.query_text}

LANGUES :
${query.languages?.join(", ") || "fr, en"}

PAYS :
${query.countries?.join(", ") || "international"}

IMPORTANT :
Cette mission est exécutée selon une fréquence "${query.frequency}".

Pour cette mission, privilégie les événements et développements
survenus au cours des ${freshnessDays} derniers jours.

Tu peux utiliser une information plus ancienne UNIQUEMENT si un
développement récent la rend à nouveau directement pertinente.
Dans ce cas, event_date doit correspondre au développement récent,
pas seulement à la date historique d'origine.

PAXSOLUTIO INTELLIGENCE surveille notamment :

- sourcing international ;
- import-export ;
- produits émergents ;
- nouvelles technologies ;
- fabricants ;
- automobile chinoise ;
- nouveaux concurrents ;
- expansions internationales ;
- acquisitions ;
- levées de fonds ;
- nouvelles fortunes et entrepreneurs ;
- réglementation ;
- droits de douane ;
- antidumping ;
- sanctions ;
- export controls ;
- géopolitique ayant un impact commercial ;
- transport international ;
- ports ;
- fret maritime, aérien, ferroviaire et routier ;
- marketplaces ;
- e-commerce ;
- macroéconomie ;
- signaux faibles ;
- opportunités commerciales.

RÈGLES :

1. Recherche réellement sur le web.

2. Ne retourne que des événements ayant une utilité commerciale,
stratégique, réglementaire ou concurrentielle.

3. Utilise plusieurs sources lorsqu'elles sont disponibles.

4. Privilégie :
   - sources officielles ;
   - autorités ;
   - institutions ;
   - entreprises directement concernées ;
   - agences de presse reconnues ;
   - presse économique ;
   - presse spécialisée crédible.

5. Regroupe plusieurs articles traitant du même événement en un
seul item.

6. Ne crée jamais de chiffres, dates, entreprises ou URL.

7. Une rumeur doit avoir une confidence_score faible.

8. Une information très ancienne sans nouveau développement récent
ne doit pas être retournée.

9. Retourne au maximum 5 items.

SCORING :

commercial_impact_score : 0-20
opportunity_score : 0-20
audience_relevance_score : 0-15
novelty_score : 0-15
seo_score : 0-10
social_score : 0-10
reliability_score : 0-10

confidence_score : 0-100
urgency_score : 0-100
risk_score : 0-100

TYPES AUTORISÉS :

news
product
company
competitor
regulation
geopolitics
logistics
market
technology
opportunity
event
weak_signal
`;

  // =========================================================
  // STRUCTURED OUTPUT
  // =========================================================

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    reasoning: {
      effort: "low",
    },

    tools: [
      {
        type: "web_search",
      },
    ],

    tool_choice: "auto",

    include: [
      "web_search_call.action.sources",
    ],

    input: prompt,

    text: {
      format: {
        type: "json_schema",
        name: "paxsolutio_intelligence_results",
        strict: true,

        schema: {
          type: "object",

          additionalProperties: false,

          properties: {
            items: {
              type: "array",

              maxItems: 5,

              items: {
                type: "object",

                additionalProperties: false,

                properties: {
                  item_type: {
                    type: "string",

                    enum: [
                      "news",
                      "product",
                      "company",
                      "competitor",
                      "regulation",
                      "geopolitics",
                      "logistics",
                      "market",
                      "technology",
                      "opportunity",
                      "event",
                      "weak_signal",
                    ],
                  },

                  title: {
                    type: "string",
                  },

                  summary: {
                    type: "string",
                  },

                  analysis: {
                    type: "string",
                  },

                  categories: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },

                  countries: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },

                  companies: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },

                  products: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },

                  source_language: {
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },

                  event_date: {
                    anyOf: [
                      {
                        type: "string",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },

                  commercial_impact_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 20,
                  },

                  opportunity_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 20,
                  },

                  audience_relevance_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 15,
                  },

                  novelty_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 15,
                  },

                  seo_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 10,
                  },

                  social_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 10,
                  },

                  reliability_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 10,
                  },

                  confidence_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },

                  urgency_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },

                  risk_score: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },

                  sources: {
                    type: "array",

                    items: {
                      type: "object",

                      additionalProperties: false,

                      properties: {
                        url: {
                          type: "string",
                        },

                        title: {
                          anyOf: [
                            {
                              type: "string",
                            },
                            {
                              type: "null",
                            },
                          ],
                        },

                        published_at: {
                          anyOf: [
                            {
                              type: "string",
                            },
                            {
                              type: "null",
                            },
                          ],
                        },

                        is_primary: {
                          type: "boolean",
                        },
                      },

                      required: [
                        "url",
                        "title",
                        "published_at",
                        "is_primary",
                      ],
                    },
                  },
                },

                required: [
                  "item_type",
                  "title",
                  "summary",
                  "analysis",
                  "categories",
                  "countries",
                  "companies",
                  "products",
                  "source_language",
                  "event_date",
                  "commercial_impact_score",
                  "opportunity_score",
                  "audience_relevance_score",
                  "novelty_score",
                  "seo_score",
                  "social_score",
                  "reliability_score",
                  "confidence_score",
                  "urgency_score",
                  "risk_score",
                  "sources",
                ],
              },
            },
          },

          required: ["items"],
        },
      },
    },
  });

  if (!response.output_text) {
    throw new Error(
      "Le moteur Intelligence n'a retourné aucun contenu."
    );
  }

  let parsed: {
    items: IntelligenceResult[];
  };

  try {
    parsed = JSON.parse(response.output_text);
  } catch {
    console.error(
      "Structured Output Intelligence invalide :",
      response.output_text
    );

    throw new Error(
      "Impossible de lire la réponse Intelligence."
    );
  }

  const items = Array.isArray(parsed.items)
    ? parsed.items
    : [];

  // =========================================================
  // INSERTIONS
  // =========================================================

  const insertedItems = [];

  let rejectedByFreshness = 0;
  let rejectedBySourceDuplicate = 0;
  let rejectedBySemanticDuplicate = 0;
  let rejectedByScore = 0;

  for (const item of items) {
    if (!item.title || !item.summary) {
      continue;
    }

    // ---------------------------------------------------------
    // FRAÎCHEUR
    // ---------------------------------------------------------

    if (
      !isDateFresh(
        item.event_date,
        freshnessDays
      )
    ) {
      rejectedByFreshness += 1;

      continue;
    }

    // ---------------------------------------------------------
    // SCORE
    // ---------------------------------------------------------

    const totalScore =
      calculateTotalScore(item);

    if (totalScore < 40) {
      rejectedByScore += 1;

      continue;
    }

    // ---------------------------------------------------------
    // URL DUPLICATE
    // ---------------------------------------------------------

    const normalizedSources =
      (item.sources ?? [])
        .filter((source) => source.url)
        .map((source) => ({
          ...source,
          url: normalizeUrl(source.url),
        }));

    const sourceUrls =
      normalizedSources.map(
        (source) => source.url
      );

    const knownSource = await hasKnownSourceUrl(
      supabase,
      sourceUrls
    );

    if (knownSource) {
      rejectedBySourceDuplicate += 1;

      continue;
    }

    // ---------------------------------------------------------
    // SEMANTIC DUPLICATE
    // ---------------------------------------------------------

    const semanticDuplicate =
      findSemanticDuplicate(
        item,
        existingItems
      );

    if (semanticDuplicate) {
      rejectedBySemanticDuplicate += 1;

      /*
       * On ne crée pas un deuxième item.
       * On enrichit seulement l'item existant
       * avec les nouvelles sources.
       */

      for (const source of normalizedSources) {
        const { error: sourceError } =
          await supabase
            .from(
              "intelligence_item_sources"
            )
            .insert({
              intelligence_item_id:
                semanticDuplicate.item.id,

              source_url: source.url,

              source_title:
                source.title || null,

              published_at:
                source.published_at || null,

              is_primary:
                source.is_primary ?? false,
            });

        if (
          sourceError &&
          sourceError.code !== "23505"
        ) {
          console.error(
            "Erreur enrichissement source duplicate :",
            sourceError
          );
        }
      }

      await supabase
        .from("intelligence_items")
        .update({
          updated_at:
            new Date().toISOString(),

          metadata: {
            last_duplicate_similarity:
              semanticDuplicate.similarity,

            last_duplicate_detected_at:
              new Date().toISOString(),

            intelligence_query_id:
              query.id,

            intelligence_query_name:
              query.name,

            radar:
              query.radar,

            model:
              "gpt-5.6-luna",
          },
        })
        .eq(
          "id",
          semanticDuplicate.item.id
        );

      continue;
    }

    // ---------------------------------------------------------
    // INSERTION ITEM
    // ---------------------------------------------------------

    const { data: inserted, error: insertError } =
      await supabase
        .from("intelligence_items")
        .insert({
          item_type:
            item.item_type || "news",

          title:
            item.title.trim(),

          summary:
            item.summary.trim(),

          analysis:
            item.analysis?.trim() || null,

          categories:
            item.categories ?? [],

          countries:
            item.countries ?? [],

          companies:
            item.companies ?? [],

          products:
            item.products ?? [],

          source_language:
            item.source_language || null,

          event_date:
            item.event_date || null,

          commercial_impact_score:
            clamp(
              item.commercial_impact_score,
              0,
              20
            ),

          opportunity_score:
            clamp(
              item.opportunity_score,
              0,
              20
            ),

          audience_relevance_score:
            clamp(
              item.audience_relevance_score,
              0,
              15
            ),

          novelty_score:
            clamp(
              item.novelty_score,
              0,
              15
            ),

          seo_score:
            clamp(
              item.seo_score,
              0,
              10
            ),

          social_score:
            clamp(
              item.social_score,
              0,
              10
            ),

          reliability_score:
            clamp(
              item.reliability_score,
              0,
              10
            ),

          total_score: totalScore,

          confidence_score:
            clamp(
              item.confidence_score,
              0,
              100
            ),

          urgency_score:
            clamp(
              item.urgency_score,
              0,
              100
            ),

          risk_score:
            clamp(
              item.risk_score,
              0,
              100
            ),

          status: "detected",

          metadata: {
            intelligence_query_id:
              query.id,

            intelligence_query_name:
              query.name,

            radar:
              query.radar,

            model:
              "gpt-5.6-luna",

            freshness_days:
              freshnessDays,

            detection_version:
              "v2",
          },
        })
        .select()
        .single();

    if (insertError || !inserted) {
      console.error(
        "Erreur insertion intelligence_items :",
        insertError
      );

      continue;
    }

    // ---------------------------------------------------------
    // SOURCES
    // ---------------------------------------------------------

    for (const source of normalizedSources) {
      const { error: sourceError } =
        await supabase
          .from(
            "intelligence_item_sources"
          )
          .insert({
            intelligence_item_id:
              inserted.id,

            source_url:
              source.url,

            source_title:
              source.title || null,

            published_at:
              source.published_at || null,

            is_primary:
              source.is_primary ?? false,
          });

      if (sourceError) {
        console.error(
          "Erreur insertion source Intelligence :",
          sourceError
        );
      }
    }

    insertedItems.push(inserted);

    existingItems.unshift({
      id: inserted.id,
      title: inserted.title,
      summary: inserted.summary,
      event_date: inserted.event_date,
      detected_at: inserted.detected_at,
      created_at: inserted.created_at,
    });
  }

  // =========================================================
  // NEXT RUN
  // =========================================================

  const now = new Date();

  const nextRun =
    getNextRunDate(query.frequency);

  const { error: updateError } =
    await supabase
      .from("intelligence_queries")
      .update({
        last_run_at:
          now.toISOString(),

        next_run_at:
          nextRun.toISOString(),

        updated_at:
          now.toISOString(),
      })
      .eq("id", query.id);

  if (updateError) {
    console.error(
      "Erreur mise à jour intelligence_queries :",
      updateError
    );
  }

  // =========================================================
  // RESULT
  // =========================================================

  return {
    query: {
      id: query.id,
      name: query.name,
      radar: query.radar,
    },

    found: items.length,

    inserted:
      insertedItems.length,

    rejected: {
      freshness:
        rejectedByFreshness,

      sourceDuplicate:
        rejectedBySourceDuplicate,

      semanticDuplicate:
        rejectedBySemanticDuplicate,

      score:
        rejectedByScore,
    },

    items:
      insertedItems,
  };
}