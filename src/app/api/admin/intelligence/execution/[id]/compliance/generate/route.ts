import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createAuthServerClient,
} from "@/lib/supabase/auth-server";

import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

const MODEL =
    "gpt-5.6-terra";

const ALLOWED_REQUIREMENT_TYPES = [
    "ce_marking",
    "declaration_of_conformity",
    "certificate",
    "test_report",
    "coc",
    "labeling",
    "manual",
    "packaging",
    "reach",
    "rohs",
    "battery",
    "emc",
    "lvd",
    "red",
    "machinery",
    "weee",
    "epr",
    "customs_document",
    "other",
] as const;

type GeneratedSuggestion = {
    requirement_type:
        (typeof ALLOWED_REQUIREMENT_TYPES)[number];

    title: string;

    description: string;

    suggested_required: boolean;

    suggested_blocking: boolean;

    applicability_rationale:
        string;

    confidence_score: number;

    source_urls: string[];
};

async function verifyAdmin() {
    const authSupabase =
        await createAuthServerClient();

    const {
        data: { user },
    } =
        await authSupabase.auth.getUser();

    if (!user) {
        return null;
    }

    const supabase =
        createServerSupabaseClient();

    const {
        data: admin,
    } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq(
            "user_id",
            user.id
        )
        .maybeSingle();

    if (!admin) {
        return null;
    }

    return {
        user,
        supabase,
    };
}

function extractOutputText(
    responseData: unknown
): string {
    if (
        !responseData ||
        typeof responseData !==
            "object"
    ) {
        return "";
    }

    const data =
        responseData as {
            output?: Array<{
                content?: Array<{
                    type?: string;
                    text?: string;
                }>;
            }>;
        };

    for (
        const output
        of data.output ?? []
    ) {
        for (
            const content
            of output.content ?? []
        ) {
            if (
                content.type ===
                    "output_text" &&
                typeof content.text ===
                    "string"
            ) {
                return content.text;
            }
        }
    }

    return "";
}

function normalizeScore(
    value: unknown
) {
    const parsed =
        Number(value);

    if (
        !Number.isFinite(parsed)
    ) {
        return 0;
    }

    return Math.min(
        Math.max(parsed, 0),
        100
    );
}

export async function POST(
    _request: NextRequest,
    context: RouteContext
) {
    try {
        const auth =
            await verifyAdmin();

        if (!auth) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Non autorisé.",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            id,
        } =
            await context.params;

        /*
         * 1. Projet Execution
         */

        const {
            data: project,
            error: projectError,
        } = await auth.supabase
            .from(
                "intelligence_execution_projects"
            )
            .select(
                `
                id,
                opportunity_id,
                title,
                product_name,
                target_market,
                target_country,
                status,
                selected_quote_id,
                supplier_notes,
                compliance_notes,
                internal_notes
                `
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();

        if (projectError) {
            throw projectError;
        }

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Projet d'exécution introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
         * 2. Dossier conformité
         */

        const {
            data: compliance,
            error:
                complianceError,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance"
            )
            .select("*")
            .eq(
                "execution_project_id",
                id
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            )
            .limit(1)
            .maybeSingle();

        if (complianceError) {
            throw complianceError;
        }

        if (!compliance) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Crée d'abord le dossier conformité du projet.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * 3. Checklist déjà validée
         */

        const {
            data: existingItems,
            error:
                existingItemsError,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance_items"
            )
            .select(
                `
                requirement_type,
                title,
                description,
                required,
                blocking,
                status
                `
            )
            .eq(
                "compliance_id",
                compliance.id
            );

        if (
            existingItemsError
        ) {
            throw existingItemsError;
        }

        /*
         * 4. Informations issues
         *    de l'étude stratégique
         */

        let opportunityContext:
            Record<
                string,
                unknown
            > | null = null;

        if (
            project.opportunity_id
        ) {
            const {
                data:
                    opportunity,
            } = await auth.supabase
                .from(
                    "intelligence_opportunities"
                )
                .select(
                    `
                    title,
                    description,
                    opportunity_type,
                    product_name,
                    target_market,
                    target_country,
                    notes
                    `
                )
                .eq(
                    "id",
                    project.opportunity_id
                )
                .maybeSingle();

            opportunityContext =
                opportunity ??
                null;
        }

        /*
         * 5. Offre retenue
         */

        let quoteContext:
            Record<
                string,
                unknown
            > | null = null;

        if (
            project.selected_quote_id
        ) {
            const {
                data: quote,
            } = await auth.supabase
                .from(
                    "intelligence_execution_quotes"
                )
                .select(
                    `
                    reference,
                    currency,
                    quantity,
                    unit_price,
                    incoterm,
                    origin_location,
                    supplier_id
                    `
                )
                .eq(
                    "id",
                    project.selected_quote_id
                )
                .maybeSingle();

            quoteContext =
                quote ?? null;
        }

        /*
         * 6. Échantillon validé
         */

        const {
            data: approvedSample,
        } = await auth.supabase
            .from(
                "intelligence_execution_samples"
            )
            .select(
                `
                sample_reference,
                quality_score,
                conformity_score,
                product_score,
                test_result,
                conformity_notes,
                test_notes
                `
            )
            .eq(
                "execution_project_id",
                id
            )
            .eq(
                "test_result",
                "approved"
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            )
            .limit(1)
            .maybeSingle();

        const productName =
            project.product_name ??
            opportunityContext
                ?.product_name ??
            project.title;

        const targetMarket =
            compliance.target_market ??
            project.target_market ??
            opportunityContext
                ?.target_market ??
            null;

        const targetCountry =
            compliance.target_country ??
            project.target_country ??
            opportunityContext
                ?.target_country ??
            null;

        if (
            !productName ||
            !targetCountry
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le produit et le pays cible doivent être renseignés avant de générer la checklist.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * 7. Prompt réglementaire
         */

        const contextPayload = {
            product_name:
                productName,

            target_market:
                targetMarket,

            target_country:
                targetCountry,

            project_status:
                project.status,

            project_notes: {
                supplier:
                    project.supplier_notes,

                compliance:
                    project.compliance_notes,

                internal:
                    project.internal_notes,
            },

            opportunity:
                opportunityContext,

            selected_quote:
                quoteContext,

            approved_sample:
                approvedSample ??
                null,

            existing_checklist:
                existingItems ??
                [],
        };

        const systemPrompt = `
Tu es le moteur de veille réglementaire de PaxSolutio.

Ta mission est de PROPOSER une checklist réglementaire de préparation à l'importation ou à la mise sur le marché.

Tu ne dois JAMAIS déclarer qu'un produit est légalement conforme.

Tu ne dois JAMAIS considérer qu'un certificat est valide sans vérification humaine du document.

Tu dois distinguer :
- exigence réglementaire potentiellement applicable ;
- document ou preuve à obtenir ;
- contrôle à effectuer ;
- exigence non applicable ou incertaine.

Recherche sur le web avant de répondre.

PRIORITÉ DES SOURCES :
1. textes officiels et autorités publiques ;
2. EUR-Lex et institutions de l'Union européenne lorsque le marché est UE ;
3. autorités nationales compétentes ;
4. services douaniers officiels ;
5. normes ou organismes reconnus lorsque pertinent.

Évite les blogs commerciaux comme source principale lorsqu'une source officielle existe.

Pour chaque suggestion :
- choisis le requirement_type approprié ;
- donne un titre opérationnel ;
- explique ce qui doit être contrôlé ;
- indique si cela semble obligatoire ;
- indique si l'absence de cet élément semble potentiellement bloquante ;
- explique pourquoi l'exigence semble applicable ;
- donne un score de confiance entre 0 et 100 ;
- fournis les URL des principales sources utilisées.

IMPORTANT :
La notion "blocking" signifie seulement :
"cet élément doit probablement être résolu avant de considérer le dossier interne comme prêt".
Cela ne constitue pas un avis juridique.

Ne duplique pas inutilement les exigences déjà présentes dans existing_checklist.

En cas de doute ou si des informations techniques manquent, abaisse confidence_score et précise ce qui doit être confirmé dans applicability_rationale.

Pour un véhicule, une machine, un équipement électrique, radio, batterie ou autre catégorie fortement réglementée, recherche spécifiquement le cadre applicable au type de produit et au marché cible.

Réponds uniquement selon le schéma JSON demandé.
`.trim();

        const userPrompt = `
Analyse ce projet et propose la checklist réglementaire initiale.

CONTEXTE PROJET :

${JSON.stringify(
    contextPayload,
    null,
    2
)}

Génère uniquement les exigences réellement utiles à examiner pour ce produit et ce marché.

Ne crée pas artificiellement une exigence pour chaque catégorie disponible.
`.trim();

        /*
         * 8. Appel OpenAI Responses API
         */

        const apiKey =
            process.env
                .OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error(
                "OPENAI_API_KEY manquant."
            );
        }

        const response =
            await fetch(
                "https://api.openai.com/v1/responses",
                {
                    method:
                        "POST",

                    headers: {
                        Authorization:
                            `Bearer ${apiKey}`,

                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            model:
                                MODEL,

                            reasoning: {
                                effort:
                                    "medium",
                            },

                            tools: [
                                {
                                    type:
                                        "web_search",
                                },
                            ],

                            input: [
                                {
                                    role:
                                        "system",

                                    content:
                                        systemPrompt,
                                },

                                {
                                    role:
                                        "user",

                                    content:
                                        userPrompt,
                                },
                            ],

                            text: {
                                format: {
                                    type:
                                        "json_schema",

                                    name:
                                        "compliance_suggestions",

                                    strict:
                                        true,

                                    schema: {
                                        type:
                                            "object",

                                        additionalProperties:
                                            false,

                                        properties: {
                                            suggestions:
                                                {
                                                    type:
                                                        "array",

                                                    minItems:
                                                        1,

                                                    maxItems:
                                                        20,

                                                    items:
                                                        {
                                                            type:
                                                                "object",

                                                            additionalProperties:
                                                                false,

                                                            properties:
                                                                {
                                                                    requirement_type:
                                                                        {
                                                                            type:
                                                                                "string",

                                                                            enum:
                                                                                [
                                                                                    ...ALLOWED_REQUIREMENT_TYPES,
                                                                                ],
                                                                        },

                                                                    title:
                                                                        {
                                                                            type:
                                                                                "string",
                                                                        },

                                                                    description:
                                                                        {
                                                                            type:
                                                                                "string",
                                                                        },

                                                                    suggested_required:
                                                                        {
                                                                            type:
                                                                                "boolean",
                                                                        },

                                                                    suggested_blocking:
                                                                        {
                                                                            type:
                                                                                "boolean",
                                                                        },

                                                                    applicability_rationale:
                                                                        {
                                                                            type:
                                                                                "string",
                                                                        },

                                                                    confidence_score:
                                                                        {
                                                                            type:
                                                                                "number",

                                                                            minimum:
                                                                                0,

                                                                            maximum:
                                                                                100,
                                                                        },

                                                                    source_urls:
                                                                        {
                                                                            type:
                                                                                "array",

                                                                            items:
                                                                                {
                                                                                    type:
                                                                                        "string",
                                                                                },
                                                                        },
                                                                },

                                                            required:
                                                                [
                                                                    "requirement_type",
                                                                    "title",
                                                                    "description",
                                                                    "suggested_required",
                                                                    "suggested_blocking",
                                                                    "applicability_rationale",
                                                                    "confidence_score",
                                                                    "source_urls",
                                                                ],
                                                        },
                                                },
                                        },

                                        required:
                                            [
                                                "suggestions",
                                            ],
                                    },
                                },
                            },
                        }),
                }
            );

        const responseData =
            await response.json();

        if (!response.ok) {
            console.error(
                "OpenAI compliance generation error:",
                responseData
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "La génération réglementaire IA a échoué.",
                    details:
                        responseData,
                },
                {
                    status: 500,
                }
            );
        }

        /*
         * Raw fetch :
         * output_text n'est pas une
         * propriété top-level.
         */

        const outputText =
            extractOutputText(
                responseData
            );

        if (!outputText) {
            console.error(
                "Réponse OpenAI sans output_text :",
                responseData
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "La réponse IA ne contient aucun résultat exploitable.",
                },
                {
                    status: 500,
                }
            );
        }

        let parsed: {
            suggestions:
                GeneratedSuggestion[];
        };

        try {
            parsed =
                JSON.parse(
                    outputText
                );
        } catch (
            parseError
        ) {
            console.error(
                "JSON conformité invalide :",
                outputText,
                parseError
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "La réponse réglementaire IA n'est pas un JSON valide.",
                },
                {
                    status: 500,
                }
            );
        }

        const suggestions =
            parsed.suggestions ??
            [];

        if (
            suggestions.length ===
            0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Aucune suggestion réglementaire n'a été générée.",
                },
                {
                    status: 500,
                }
            );
        }

        /*
         * 9. On conserve l'historique
         * accepté/rejeté.
         *
         * Seules les anciennes suggestions
         * encore PENDING sont remplacées.
         */

        const {
            error:
                deletePendingError,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance_suggestions"
            )
            .delete()
            .eq(
                "compliance_id",
                compliance.id
            )
            .eq(
                "review_status",
                "pending"
            );

        if (
            deletePendingError
        ) {
            throw deletePendingError;
        }

        const rows =
            suggestions.map(
                (suggestion) => ({
                    compliance_id:
                        compliance.id,

                    execution_project_id:
                        id,

                    requirement_type:
                        ALLOWED_REQUIREMENT_TYPES.includes(
                            suggestion.requirement_type
                        )
                            ? suggestion.requirement_type
                            : "other",

                    title:
                        suggestion.title.trim(),

                    description:
                        suggestion.description.trim(),

                    suggested_required:
                        Boolean(
                            suggestion.suggested_required
                        ),

                    suggested_blocking:
                        Boolean(
                            suggestion.suggested_blocking
                        ),

                    applicability_rationale:
                        suggestion
                            .applicability_rationale
                            .trim(),

                    confidence_score:
                        normalizeScore(
                            suggestion.confidence_score
                        ),

                    source_urls:
                        Array.isArray(
                            suggestion.source_urls
                        )
                            ? suggestion.source_urls.filter(
                                  (
                                      value
                                  ): value is string =>
                                      typeof value ===
                                          "string" &&
                                      value.trim()
                                          .length >
                                          0
                              )
                            : [],

                    review_status:
                        "pending",

                    model:
                        MODEL,
                })
            );

        const {
            data:
                insertedSuggestions,
            error:
                insertError,
        } = await auth.supabase
            .from(
                "intelligence_execution_compliance_suggestions"
            )
            .insert(rows)
            .select("*");

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({
            success: true,

            count:
                insertedSuggestions
                    ?.length ?? 0,

            suggestions:
                insertedSuggestions ??
                [],
        });
    } catch (error) {
        console.error(
            "Erreur génération checklist conformité :",
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Erreur inconnue.",
            },
            {
                status: 500,
            }
        );
    }
}