export const dynamic = "force-dynamic";
import { requireAdminRequest } from "@/lib/admin-access";
import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type ProductStudyResult = {
    executive_summary: string;

    market_analysis: {
        overview: string;
        target_markets: string[];
        trends: string[];
        evidence: string[];
    };

    demand_analysis: {
        target_customers: string[];
        use_cases: string[];
        demand_signals: string[];
        limitations: string[];
    };

    pricing_analysis: {
        observed_prices: Array<{
            market: string;
            price: string;
            context: string;
            source_url: string;
        }>;
        pricing_summary: string;
        margin_comment: string;
    };

    competition_analysis: {
        competitors: Array<{
            name: string;
            product: string;
            positioning: string;
            observed_price: string;
        }>;
        competition_summary: string;
    };

    supplier_analysis: {
        companies: Array<{
            name: string;
            role: string;
            country: string;
            verification_needed: boolean;
        }>;
        sourcing_summary: string;
    };

    regulatory_analysis: {
        export_requirements: string[];
        import_requirements: string[];
        compliance_points: string[];
        unknowns: string[];
    };

    logistics_analysis: {
        transport_options: string[];
        constraints: string[];
        cost_considerations: string[];
        logistics_summary: string;
    };

    risk_analysis: {
        risks: Array<{
            risk: string;
            severity: "low" | "medium" | "high";
            mitigation: string;
        }>;
        summary: string;
    };

    commercial_analysis: {
        business_models: string[];
        customer_segments: string[];
        commercial_potential: string;
        margin_assessment: string;
        paxsolutio_fit: string;
    };

    recommendations: Array<{
        action: string;
        priority: "low" | "medium" | "high";
        rationale: string;
    }>;

    market_score: number;
    competition_score: number;
    feasibility_score: number;
    commercial_score: number;
    risk_score: number;
    confidence_score: number;
    overall_score: number;
    pricing_score: number;
    sourcing_score: number;
    regulation_score: number;
    logistics_score: number;
    demand_score: number;
    profit_score: number;

    overall_verdict: "go" | "review" | "no_go";

    paxsolutio_recommendation: string;

    action_plan: Array<{
        action: string;
        priority: "low" | "medium" | "high";
        rationale: string;
    }>;

    source_urls: string[];
};

function clampScore(value: unknown) {
    if (typeof value !== "number") {
        return 0;
    }

    return Math.max(
        0,
        Math.min(100, Math.round(value))
    );
}

export async function POST(
    _request: NextRequest,
    context: RouteContext
) {
  const accessDenied = await requireAdminRequest(_request);
  if (accessDenied) return accessDenied;

    const { id } = await context.params;

    const authSupabase =
        await createAuthServerClient();

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

    const supabase =
        createServerSupabaseClient();

    const {
        data: admin,
        error: adminError,
    } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !admin) {
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

    const {
        data: opportunity,
        error: opportunityError,
    } = await supabase
        .from("intelligence_opportunities")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (
        opportunityError ||
        !opportunity
    ) {
        return NextResponse.json(
            {
                success: false,
                error:
                    "Dossier Intelligence introuvable.",
            },
            {
                status: 404,
            }
        );
    }

    if (
        opportunity.opportunity_kind !==
        "product"
    ) {
        return NextResponse.json(
            {
                success: false,
                error:
                    "L'étude produit est réservée aux dossiers de type produit.",
            },
            {
                status: 400,
            }
        );
    }

    const sourceItemIds: string[] =
        opportunity.source_item_ids ?? [];

    let intelligenceItems: Array<{
        id: string;
        title: string;
        summary: string | null;
        analysis: string | null;
        countries: string[];
        companies: string[];
        products: string[];
        total_score: number | null;
        confidence_score: number | null;
    }> = [];

    if (sourceItemIds.length > 0) {
        const {
            data: items,
            error: itemsError,
        } = await supabase
            .from("intelligence_items")
            .select(
                `
                id,
                title,
                summary,
                analysis,
                countries,
                companies,
                products,
                total_score,
                confidence_score
                `
            )
            .in("id", sourceItemIds);

        if (itemsError) {
            console.error(
                "Erreur chargement Intelligence Items :",
                itemsError
            );
        }

        intelligenceItems =
            items ?? [];
    }

    let storedSources: Array<{
        source_url: string;
        source_title: string | null;
        published_at: string | null;
        is_primary: boolean;
    }> = [];

    if (sourceItemIds.length > 0) {
        const {
            data: sources,
            error: sourcesError,
        } = await supabase
            .from("intelligence_item_sources")
            .select(
                `
                source_url,
                source_title,
                published_at,
                is_primary
                `
            )
            .in(
                "intelligence_item_id",
                sourceItemIds
            );

        if (sourcesError) {
            console.error(
                "Erreur chargement sources :",
                sourcesError
            );
        }

        storedSources =
            sources ?? [];
    }

    const existingSourceUrls =
        Array.from(
            new Set(
                storedSources
                    .map(
                        (source) =>
                            source.source_url
                    )
                    .filter(Boolean)
            )
        );

    const {
        data: existingStudy,
    } = await supabase
        .from(
            "intelligence_product_studies"
        )
        .select("id,status")
        .eq("opportunity_id", id)
        .maybeSingle();

    if (
        existingStudy?.status ===
        "researching"
    ) {
        return NextResponse.json(
            {
                success: false,
                error:
                    "Une étude est déjà en cours pour ce dossier.",
            },
            {
                status: 409,
            }
        );
    }

    const studyTitle =
        `Étude produit — ${opportunity.product_name ||
        opportunity.title
        }`;

    const {
        data: study,
        error: studyInitError,
    } = await supabase
        .from(
            "intelligence_product_studies"
        )
        .upsert(
            {
                opportunity_id: id,

                title: studyTitle,

                product_name:
                    opportunity.product_name ||
                    opportunity.title,

                status: "researching",

                source_item_ids:
                    sourceItemIds,

                updated_at:
                    new Date().toISOString(),

                metadata: {
                    opportunity_status:
                        opportunity.status,

                    opportunity_priority:
                        opportunity.priority_score,

                    generation_started_at:
                        new Date().toISOString(),
                },
            },
            {
                onConflict:
                    "opportunity_id",
            }
        )
        .select()
        .single();

    if (
        studyInitError ||
        !study
    ) {
        console.error(
            "Erreur initialisation étude :",
            studyInitError
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible d'initialiser l'étude produit.",
            },
            {
                status: 500,
            }
        );
    }

    const openAiKey =
        process.env.OPENAI_API_KEY;

    if (!openAiKey) {
        await supabase
            .from(
                "intelligence_product_studies"
            )
            .update({
                status: "failed",
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", study.id);

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

    const intelligenceContext =
        intelligenceItems
            .map(
                (item, index) => `
SIGNAL ${index + 1}
Titre : ${item.title}
Résumé : ${item.summary ?? "N/A"}
Analyse : ${item.analysis ?? "N/A"}
Pays : ${(item.countries ?? []).join(", ") || "N/A"}
Entreprises : ${(item.companies ?? []).join(", ") || "N/A"}
Produits : ${(item.products ?? []).join(", ") || "N/A"}
Score : ${item.total_score ?? "N/A"}
Confiance : ${item.confidence_score ?? "N/A"}
`
            )
            .join("\n");

    const storedSourceContext =
        storedSources
            .map(
                (source, index) => `
SOURCE EXISTANTE ${index + 1}
Titre : ${source.source_title ?? "N/A"}
URL : ${source.source_url}
Date : ${source.published_at ?? "N/A"}
Primaire : ${source.is_primary ? "oui" : "non"}
`
            )
            .join("\n");

    const prompt = `
Tu es PaxSolutio Intelligence Analyst.

Tu travailles exclusivement pour PaxSolutio, société française de sourcing international spécialisée Chine-Europe-Afrique.

Ton rôle est d'agir comme un cabinet de conseil stratégique spécialisé en :

- sourcing industriel,
- import-export,
- réglementation,
- logistique internationale,
- analyse de marché,
- validation fournisseur.

Ton objectif n'est PAS de vendre le produit.

Ton objectif est de déterminer si PaxSolutio doit investir du temps, proposer ce produit à ses clients ou abandonner cette opportunité.

DOSSIER

Titre :
${opportunity.title}

Produit :
${opportunity.product_name ?? opportunity.title}

Résumé :
${opportunity.summary ?? "N/A"}

Analyse stratégique initiale :
${opportunity.rationale ?? "N/A"}

Type d'opportunité :
${opportunity.opportunity_type ?? "N/A"}

Priorité :
${opportunity.priority_score ?? "N/A"}/100

Confiance initiale :
${opportunity.confidence_score ?? "N/A"}/100


SIGNAUX INTELLIGENCE EXISTANTS

${intelligenceContext || "Aucun signal détaillé disponible."}


SOURCES EXISTANTES

${storedSourceContext || "Aucune source existante fournie."}


INSTRUCTIONS DE RECHERCHE

Effectue une recherche web complémentaire et ciblée.

Cherche en priorité :
- fabricant ou marque officielle,
- documentation officielle,
- prix observables,
- lancement commercial,
- marchés concernés,
- distributeurs,
- concurrents,
- réglementation,
- certifications,
- exigences d'exportation,
- exigences d'importation,
- contraintes logistiques,
- SAV,
- disponibilité des pièces,
- risques commerciaux,
- risques réglementaires.

Favorise :
1. sources officielles,
2. fabricants,
3. organismes gouvernementaux,
4. douanes,
5. organismes de certification,
6. médias économiques fiables,
7. distributeurs reconnus.

Ne considère PAS une marketplace inconnue ou une publication sociale comme preuve suffisante d'un prix ou d'une conformité.


RÈGLES ABSOLUES

N'invente jamais :
- un prix,
- un coût FOB,
- une marge,
- un MOQ,
- une certification,
- une homologation,
- un fournisseur,
- un distributeur,
- une donnée de marché.

Si une donnée n'est pas vérifiable :
indique explicitement qu'elle reste à vérifier.

Distingue systématiquement :
- les faits observés,
- l'analyse,
- les hypothèses.

Un fournisseur mentionné publiquement n'est pas automatiquement considéré comme fournisseur fiable ou approuvé par PaxSolutio.

Une certification annoncée par un fabricant n'est pas automatiquement une preuve de conformité au marché cible.

Pour les véhicules :
ne déduis jamais une homologation européenne, française ou africaine d'une simple commercialisation en Chine ou ailleurs.

Pour les produits réglementés :
reste prudent et recommande une vérification spécialisée si nécessaire.


SCORING

Attribue des scores 0–100 :

market_score :
attractivité du marché.

competition_score :
100 = environnement concurrentiel favorable.
0 = concurrence extrêmement défavorable.

feasibility_score :
faisabilité réelle du sourcing/importation/commercialisation.

commercial_score :
potentiel commercial pour PaxSolutio.

risk_score :
100 = risque très élevé.
0 = risque faible.

confidence_score :
niveau de confiance dans l'étude selon la qualité des preuves.

overall_score :
intérêt global de poursuivre l'opportunité.

Le score global ne doit pas être mécaniquement une moyenne.
Il doit refléter une décision stratégique.

SCORES COMPLÉMENTAIRES

pricing_score :
100 = prix observés, positionnement et potentiel de marge très favorables.
0 = économie du produit défavorable ou absence critique de visibilité prix.
Ne récompense pas l'absence de données.

sourcing_score :
100 = sourcing réaliste, offre fournisseur identifiable, chaîne d'approvisionnement accessible.
0 = sourcing très difficile, opaque, inaccessible ou fortement dépendant d'acteurs non vérifiables.

regulation_score :
100 = environnement réglementaire relativement clair et maîtrisable.
0 = obstacles réglementaires majeurs ou incompatibilité probable avec les marchés cibles.
Une incertitude réglementaire importante doit réduire ce score.

logistics_score :
100 = transport, manutention, stockage et importation relativement simples.
0 = logistique particulièrement coûteuse, complexe ou risquée.

demand_score :
100 = plusieurs signaux crédibles indiquent une demande commerciale forte.
0 = aucune preuve convaincante de demande ou marché extrêmement faible.

profit_score :
100 = potentiel économique particulièrement intéressant selon les données vérifiables disponibles.
0 = potentiel de rentabilité faible.
Si les coûts d'achat, d'importation ou de revente ne sont pas suffisamment connus, reste prudent et réduis la confiance plutôt que d'inventer une marge.


VERDICT FINAL

overall_verdict doit obligatoirement être :

"go"
si les preuves disponibles justifient de poursuivre activement l'opportunité.

"review"
si l'opportunité est intéressante mais nécessite encore des vérifications importantes.

"no_go"
si les risques, contraintes ou perspectives commerciales ne justifient pas de poursuivre actuellement.


RECOMMANDATION PAXSOLUTIO

paxsolutio_recommendation doit expliquer clairement :
- pourquoi poursuivre ou non,
- ce qui manque encore pour décider,
- quelle valeur PaxSolutio pourrait apporter,
- quelle serait la prochaine décision rationnelle.

action_plan doit contenir des actions concrètes et ordonnées.
Évite les recommandations vagues telles que "faire plus de recherches".
Précise exactement quoi vérifier, auprès de qui et dans quel but lorsque les informations disponibles le permettent.

RECOMMANDATIONS

Les recommandations doivent déboucher sur des actions concrètes, par exemple :
- identifier 3 fabricants,
- demander prix FOB,
- obtenir certifications,
- vérifier HS Code,
- vérifier homologation,
- commander un échantillon,
- contacter distributeurs,
- étudier prix France,
- abandonner l'opportunité.

Retourne uniquement des informations justifiées.
`;

    try {
        const openAiResponse =
            await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${openAiKey}`,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        model:
                            "gpt-5.6-terra",

                        reasoning: {
                            effort: "medium",
                        },

                        tools: [
                            {
                                type: "web_search",
                            },
                        ],

                        input: prompt,

                        text: {
                            format: {
                                type: "json_schema",

                                name:
                                    "paxsolutio_product_study",

                                strict: true,

                                schema: {
                                    type: "object",

                                    additionalProperties: false,

                                    properties: {
                                        executive_summary: {
                                            type: "string",
                                        },

                                        market_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                overview: {
                                                    type: "string",
                                                },
                                                target_markets: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                trends: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                evidence: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            required: [
                                                "overview",
                                                "target_markets",
                                                "trends",
                                                "evidence",
                                            ],
                                        },

                                        demand_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                target_customers: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                use_cases: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                demand_signals: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                limitations: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            required: [
                                                "target_customers",
                                                "use_cases",
                                                "demand_signals",
                                                "limitations",
                                            ],
                                        },

                                        pricing_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                observed_prices: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        additionalProperties: false,
                                                        properties: {
                                                            market: {
                                                                type: "string",
                                                            },
                                                            price: {
                                                                type: "string",
                                                            },
                                                            context: {
                                                                type: "string",
                                                            },
                                                            source_url: {
                                                                type: "string",
                                                            },
                                                        },
                                                        required: [
                                                            "market",
                                                            "price",
                                                            "context",
                                                            "source_url",
                                                        ],
                                                    },
                                                },
                                                pricing_summary: {
                                                    type: "string",
                                                },
                                                margin_comment: {
                                                    type: "string",
                                                },
                                            },
                                            required: [
                                                "observed_prices",
                                                "pricing_summary",
                                                "margin_comment",
                                            ],
                                        },

                                        competition_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                competitors: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        additionalProperties: false,
                                                        properties: {
                                                            name: {
                                                                type: "string",
                                                            },
                                                            product: {
                                                                type: "string",
                                                            },
                                                            positioning: {
                                                                type: "string",
                                                            },
                                                            observed_price: {
                                                                type: "string",
                                                            },
                                                        },
                                                        required: [
                                                            "name",
                                                            "product",
                                                            "positioning",
                                                            "observed_price",
                                                        ],
                                                    },
                                                },
                                                competition_summary: {
                                                    type: "string",
                                                },
                                            },
                                            required: [
                                                "competitors",
                                                "competition_summary",
                                            ],
                                        },

                                        supplier_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                companies: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        additionalProperties: false,
                                                        properties: {
                                                            name: {
                                                                type: "string",
                                                            },
                                                            role: {
                                                                type: "string",
                                                            },
                                                            country: {
                                                                type: "string",
                                                            },
                                                            verification_needed: {
                                                                type: "boolean",
                                                            },
                                                        },
                                                        required: [
                                                            "name",
                                                            "role",
                                                            "country",
                                                            "verification_needed",
                                                        ],
                                                    },
                                                },
                                                sourcing_summary: {
                                                    type: "string",
                                                },
                                            },
                                            required: [
                                                "companies",
                                                "sourcing_summary",
                                            ],
                                        },

                                        regulatory_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                export_requirements: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                import_requirements: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                compliance_points: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                unknowns: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                            },
                                            required: [
                                                "export_requirements",
                                                "import_requirements",
                                                "compliance_points",
                                                "unknowns",
                                            ],
                                        },

                                        logistics_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                transport_options: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                constraints: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                cost_considerations: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                logistics_summary: {
                                                    type: "string",
                                                },
                                            },
                                            required: [
                                                "transport_options",
                                                "constraints",
                                                "cost_considerations",
                                                "logistics_summary",
                                            ],
                                        },

                                        risk_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                risks: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        additionalProperties: false,
                                                        properties: {
                                                            risk: {
                                                                type: "string",
                                                            },
                                                            severity: {
                                                                type: "string",
                                                                enum: [
                                                                    "low",
                                                                    "medium",
                                                                    "high",
                                                                ],
                                                            },
                                                            mitigation: {
                                                                type: "string",
                                                            },
                                                        },
                                                        required: [
                                                            "risk",
                                                            "severity",
                                                            "mitigation",
                                                        ],
                                                    },
                                                },
                                                summary: {
                                                    type: "string",
                                                },
                                            },
                                            required: [
                                                "risks",
                                                "summary",
                                            ],
                                        },

                                        commercial_analysis: {
                                            type: "object",
                                            additionalProperties: false,
                                            properties: {
                                                business_models: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                customer_segments: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                    },
                                                },
                                                commercial_potential: {
                                                    type: "string",
                                                },
                                                margin_assessment: {
                                                    type: "string",
                                                },
                                                paxsolutio_fit: {
                                                    type: "string",
                                                },
                                            },
                                            required: [
                                                "business_models",
                                                "customer_segments",
                                                "commercial_potential",
                                                "margin_assessment",
                                                "paxsolutio_fit",
                                            ],
                                        },

                                        recommendations: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                additionalProperties: false,
                                                properties: {
                                                    action: {
                                                        type: "string",
                                                    },
                                                    priority: {
                                                        type: "string",
                                                        enum: [
                                                            "low",
                                                            "medium",
                                                            "high",
                                                        ],
                                                    },
                                                    rationale: {
                                                        type: "string",
                                                    },
                                                },
                                                required: [
                                                    "action",
                                                    "priority",
                                                    "rationale",
                                                ],
                                            },
                                        },

                                        market_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        competition_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        feasibility_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        commercial_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        risk_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        confidence_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        overall_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        overall_verdict: {
                                            type: "string",
                                            enum: [
                                                "go",
                                                "review",
                                                "no_go",
                                            ],
                                        },

                                        pricing_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        sourcing_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        regulation_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        logistics_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        demand_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        profit_score: {
                                            type: "integer",
                                            minimum: 0,
                                            maximum: 100,
                                        },

                                        paxsolutio_recommendation: {
                                            type: "string",
                                        },

                                        action_plan: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                additionalProperties: false,
                                                properties: {
                                                    action: {
                                                        type: "string",
                                                    },
                                                    priority: {
                                                        type: "string",
                                                        enum: [
                                                            "low",
                                                            "medium",
                                                            "high",
                                                        ],
                                                    },
                                                    rationale: {
                                                        type: "string",
                                                    },
                                                },
                                                required: [
                                                    "action",
                                                    "priority",
                                                    "rationale",
                                                ],
                                            },
                                        },

                                        source_urls: {
                                            type: "array",
                                            items: {
                                                type: "string",
                                            },
                                        },
                                    },

                                    required: [
                                        "executive_summary",
                                        "market_analysis",
                                        "demand_analysis",
                                        "pricing_analysis",
                                        "competition_analysis",
                                        "supplier_analysis",
                                        "regulatory_analysis",
                                        "logistics_analysis",
                                        "risk_analysis",
                                        "commercial_analysis",
                                        "recommendations",
                                        "market_score",
                                        "competition_score",
                                        "feasibility_score",
                                        "commercial_score",
                                        "risk_score",
                                        "confidence_score",
                                        "overall_score",
                                        "overall_verdict",
                                        "pricing_score",
                                        "sourcing_score",
                                        "regulation_score",
                                        "logistics_score",
                                        "demand_score",
                                        "profit_score",
                                        "paxsolutio_recommendation",
                                        "action_plan",
                                        "source_urls",
                                    ],
                                },
                            },
                        },
                    }),
                }
            );

        if (!openAiResponse.ok) {
            const errorText =
                await openAiResponse.text();

            console.error(
                "Erreur OpenAI étude produit :",
                errorText
            );

            throw new Error(
                `OpenAI ${openAiResponse.status}`
            );
        }

        const responseData =
            await openAiResponse.json();

        const outputText =
            Array.isArray(responseData.output)
                ? responseData.output
                    .filter(
                        (item: {
                            type?: string;
                            content?: unknown[];
                        }) =>
                            item.type === "message" &&
                            Array.isArray(item.content)
                    )
                    .flatMap(
                        (item: {
                            content?: Array<{
                                type?: string;
                                text?: string;
                            }>;
                        }) =>
                            item.content ?? []
                    )
                    .filter(
                        (content: {
                            type?: string;
                            text?: string;
                        }) =>
                            content.type ===
                            "output_text" &&
                            typeof content.text ===
                            "string"
                    )
                    .map(
                        (content: {
                            text?: string;
                        }) =>
                            content.text ?? ""
                    )
                    .join("\n")
                    .trim()
                : "";

        if (!outputText) {
            console.error(
                "Réponse OpenAI sans texte exploitable :",
                JSON.stringify(
                    responseData.output,
                    null,
                    2
                )
            );

            throw new Error(
                "Réponse OpenAI sans contenu texte exploitable."
            );
        }

        const result =
            JSON.parse(
                outputText
            ) as ProductStudyResult;

        const sourceUrls =
            Array.from(
                new Set([
                    ...existingSourceUrls,
                    ...(result.source_urls ?? []),
                ])
            );

        const completedAt =
            new Date().toISOString();

        const {
            data: completedStudy,
            error: updateError,
        } = await supabase
            .from(
                "intelligence_product_studies"
            )
            .update({
                status:
                    "completed",

                executive_summary:
                    result.executive_summary,

                market_analysis:
                    result.market_analysis,

                demand_analysis:
                    result.demand_analysis,

                pricing_analysis:
                    result.pricing_analysis,

                competition_analysis:
                    result.competition_analysis,

                supplier_analysis:
                    result.supplier_analysis,

                regulatory_analysis:
                    result.regulatory_analysis,

                logistics_analysis:
                    result.logistics_analysis,

                risk_analysis:
                    result.risk_analysis,

                commercial_analysis:
                    result.commercial_analysis,

                recommendations:
                    result.recommendations,

                source_urls:
                    sourceUrls,

                source_item_ids:
                    sourceItemIds,

                market_score:
                    clampScore(
                        result.market_score
                    ),

                competition_score:
                    clampScore(
                        result.competition_score
                    ),

                feasibility_score:
                    clampScore(
                        result.feasibility_score
                    ),

                commercial_score:
                    clampScore(
                        result.commercial_score
                    ),

                risk_score:
                    clampScore(
                        result.risk_score
                    ),

                confidence_score:
                    clampScore(
                        result.confidence_score
                    ),

                overall_score:
                    clampScore(
                        result.overall_score
                    ),

                overall_verdict: result.overall_verdict,

                pricing_score: result.pricing_score,
                sourcing_score: result.sourcing_score,
                regulation_score: result.regulation_score,
                logistics_score: result.logistics_score,
                demand_score: result.demand_score,
                profit_score: result.profit_score,

                paxsolutio_recommendation:
                    result.paxsolutio_recommendation,

                action_plan: result.action_plan,

                model:
                    "gpt-5.6-terra",

                completed_at:
                    completedAt,

                updated_at:
                    completedAt,

                metadata: {
                    opportunity_priority:
                        opportunity.priority_score,

                    intelligence_items_used:
                        intelligenceItems.length,

                    stored_sources_used:
                        storedSources.length,

                    web_research:
                        true,

                    generation_completed_at:
                        completedAt,
                },
            })
            .eq(
                "id",
                study.id
            )
            .select()
            .single();

        if (
            updateError ||
            !completedStudy
        ) {
            console.error(
                "Erreur stockage étude :",
                updateError
            );

            throw new Error(
                "Impossible d'enregistrer l'étude."
            );
        }

        return NextResponse.json({
            success: true,

            study:
                completedStudy,

            intelligenceItemsUsed:
                intelligenceItems.length,

            sources:
                sourceUrls.length,
        });
    } catch (error) {
        console.error(
            "Erreur génération étude produit :",
            error
        );

        await supabase
            .from(
                "intelligence_product_studies"
            )
            .update({
                status: "failed",

                updated_at:
                    new Date().toISOString(),

                metadata: {
                    generation_failed_at:
                        new Date().toISOString(),

                    error:
                        error instanceof Error
                            ? error.message
                            : "Erreur inconnue",
                },
            })
            .eq("id", study.id);

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Impossible de générer l'étude produit.",
            },
            {
                status: 500,
            }
        );
    }
}