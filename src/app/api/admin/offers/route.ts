import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createServerSupabaseClient,
} from "@/lib/supabase/server";

function normalizeSlug(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function numberOrNull(
    value: unknown
): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : null;
}

export async function POST(
    request: NextRequest
) {
    try {
        const body =
            await request.json();

        const title =
            typeof body.title === "string"
                ? body.title.trim()
                : "";

        if (!title) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le titre est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const slug = normalizeSlug(
            body.slug || title
        );

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le slug est invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            createServerSupabaseClient();

        const {
            data: existing,
            error: existingError,
        } = await supabase
            .from("commercial_offers")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Une offre utilise déjà ce slug.",
                },
                {
                    status: 409,
                }
            );
        }

        const status =
            body.status === "published"
                ? "published"
                : "draft";

        const payload = {
            title,
            slug,

            subtitle:
                body.subtitle?.trim() ||
                null,

            short_description:
                body.short_description?.trim() ||
                null,

            description:
                body.description?.trim() ||
                null,

            category:
                body.category?.trim() ||
                null,

            product_type:
                body.product_type?.trim() ||
                null,

            tags: Array.isArray(
                body.tags
            )
                ? body.tags
                : [],

            image_url:
                body.image_url?.trim() ||
                null,

            gallery_urls: Array.isArray(
                body.gallery_urls
            )
                ? body.gallery_urls
                : [],

            video_url:
                body.video_url?.trim() ||
                null,

            price_from:
                numberOrNull(
                    body.price_from
                ),

            market_price:
                numberOrNull(
                    body.market_price
                ),

            currency:
                body.currency ||
                "EUR",

            price_label:
                body.price_label ||
                "À partir de",

            selling_points:
                Array.isArray(
                    body.selling_points
                )
                    ? body.selling_points
                    : [],

            specifications:
                body.specifications &&
                    typeof body.specifications ===
                    "object"
                    ? body.specifications
                    : {},

            conditions:
                body.conditions?.trim() ||
                null,

            delivery_information:
                body.delivery_information?.trim() ||
                null,

            cta_type:
                body.cta_type ||
                "quote",

            cta_label:
                body.cta_label ||
                "Demander un devis",

            cta_url:
                body.cta_url?.trim() ||
                null,

            status,

            featured:
                Boolean(
                    body.featured
                ),

            homepage:
                Boolean(
                    body.homepage
                ),

            placement_pages:
                Array.isArray(
                    body.placement_pages
                )
                    ? body.placement_pages
                    : [],

            seo_title:
                body.seo_title?.trim() ||
                null,

            seo_description:
                body.seo_description?.trim() ||
                null,

            source_type:
                "manual",

            published_at:
                status === "published"
                    ? new Date().toISOString()
                    : null,

            updated_at:
                new Date().toISOString(),
        };

        const {
            data: offer,
            error,
        } = await supabase
            .from("commercial_offers")
            .insert(payload)
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            offer,
        });
    } catch (error) {
        console.error(
            "Erreur création offre :",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible de créer l'offre.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PATCH(
    request: NextRequest
) {
    try {
        const body = await request.json();

        const id =
            typeof body.id === "string"
                ? body.id
                : "";

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Identifiant de l'offre manquant.",
                },
                {
                    status: 400,
                }
            );
        }

        const title =
            typeof body.title === "string"
                ? body.title.trim()
                : "";

        if (!title) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le titre est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        const slug = normalizeSlug(
            body.slug || title
        );

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le slug est invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            createServerSupabaseClient();

        const {
            data: duplicate,
            error: duplicateError,
        } = await supabase
            .from("commercial_offers")
            .select("id")
            .eq("slug", slug)
            .neq("id", id)
            .maybeSingle();

        if (duplicateError) {
            throw duplicateError;
        }

        if (duplicate) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Une autre offre utilise déjà ce slug.",
                },
                {
                    status: 409,
                }
            );
        }

        const status =
            body.status === "published"
                ? "published"
                : body.status === "archived"
                    ? "archived"
                    : "draft";

        const payload = {
            title,
            slug,

            subtitle:
                body.subtitle?.trim() ||
                null,

            short_description:
                body.short_description?.trim() ||
                null,

            description:
                body.description?.trim() ||
                null,

            category:
                body.category?.trim() ||
                null,

            product_type:
                body.product_type?.trim() ||
                null,

            tags: Array.isArray(
                body.tags
            )
                ? body.tags
                : [],

            image_url:
                body.image_url?.trim() ||
                null,

            gallery_urls: Array.isArray(
                body.gallery_urls
            )
                ? body.gallery_urls
                : [],

            video_url:
                body.video_url?.trim() ||
                null,

            price_from:
                numberOrNull(
                    body.price_from
                ),

            market_price:
                numberOrNull(
                    body.market_price
                ),

            currency:
                body.currency || "EUR",

            price_label:
                body.price_label ||
                "À partir de",

            selling_points:
                Array.isArray(
                    body.selling_points
                )
                    ? body.selling_points
                    : [],

            specifications:
                body.specifications &&
                    typeof body.specifications ===
                    "object"
                    ? body.specifications
                    : {},

            conditions:
                body.conditions?.trim() ||
                null,

            delivery_information:
                body.delivery_information?.trim() ||
                null,

            cta_type:
                body.cta_type || "quote",

            cta_label:
                body.cta_label ||
                "Demander un devis",

            cta_url:
                body.cta_url?.trim() ||
                null,

            status,

            featured: Boolean(
                body.featured
            ),

            homepage: Boolean(
                body.homepage
            ),

            placement_pages:
                Array.isArray(
                    body.placement_pages
                )
                    ? body.placement_pages
                    : [],

            seo_title:
                body.seo_title?.trim() ||
                null,

            seo_description:
                body.seo_description?.trim() ||
                null,

            published_at:
                status === "published"
                    ? body.published_at ||
                    new Date().toISOString()
                    : null,

            updated_at:
                new Date().toISOString(),
        };

        const {
            data: offer,
            error,
        } = await supabase
            .from("commercial_offers")
            .update(payload)
            .eq("id", id)
            .select("*")
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            offer,
        });
    } catch (error) {
        console.error(
            "Erreur modification offre :",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "Impossible de modifier l'offre.",
            },
            {
                status: 500,
            }
        );
    }
}