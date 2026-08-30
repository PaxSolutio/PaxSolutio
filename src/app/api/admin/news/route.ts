import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Category =
  | "actualite"
  | "reglementation"
  | "opportunite"
  | "terrain";

type Status = "draft" | "published";

type CtaType =
  | "article"
  | "quote"
  | "payment"
  | null;

type NewsPayload = {
  id?: string;

  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;

  category?: Category;
  status?: Status;

  featured?: boolean;

  image_url?: string | null;
  video_url?: string | null;

  price_label?: string | null;
  market_price_label?: string | null;

  cta_label?: string | null;
  cta_href?: string | null;
  cta_type?: CtaType;

  seo_title?: string | null;
  seo_description?: string | null;

  tags?: string[];
  source_urls?: string[];
};

async function requireAdmin() {
  const authSupabase = await createAuthServerClient();

  const {
    data: { user },
    error: userError,
  } = await authSupabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Non authentifié." },
        { status: 401 }
      ),
    };
  }

  const { data: isAdmin, error: adminError } =
    await authSupabase.rpc("is_admin");

  if (adminError || !isAdmin) {
    console.error(
      "Erreur vérification administrateur :",
      adminError
    );

    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    user,
  };
}

function cleanPayload(body: NewsPayload) {
  return {
    title: body.title?.trim(),

    slug: body.slug?.trim(),

    excerpt:
      body.excerpt?.trim() || null,

    content:
      body.content?.trim() || "",

    category: body.category,

    status: body.status,

    featured:
      Boolean(body.featured),

    image_url:
      body.image_url || null,

    video_url:
      body.video_url?.trim() || null,

    price_label:
      body.price_label?.trim() || null,

    market_price_label:
      body.market_price_label?.trim() || null,

    cta_label:
      body.cta_label?.trim() || null,

    cta_href:
      body.cta_href?.trim() || null,

    cta_type:
      body.cta_type || null,

    seo_title:
      body.seo_title?.trim() || null,

    seo_description:
      body.seo_description?.trim() || null,

    tags:
      Array.isArray(body.tags)
        ? body.tags
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],

    source_urls:
      Array.isArray(body.source_urls)
        ? body.source_urls
            .map((url) => url.trim())
            .filter(Boolean)
        : [],
  };
}

function validatePayload(body: NewsPayload) {
  if (!body.title?.trim()) {
    return "Le titre est obligatoire.";
  }

  if (!body.slug?.trim()) {
    return "Le slug est obligatoire.";
  }

  if (
    !body.category ||
    ![
      "actualite",
      "reglementation",
      "opportunite",
      "terrain",
    ].includes(body.category)
  ) {
    return "Catégorie invalide.";
  }

  if (
    !body.status ||
    !["draft", "published"].includes(body.status)
  ) {
    return "Statut invalide.";
  }

  return null;
}

// ============================================================
// CREATE
// ============================================================

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin();

    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const body =
      (await request.json()) as NewsPayload;

    const validationError =
      validatePayload(body);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const serverSupabase =
      createServerSupabaseClient();

    const slug = body.slug!.trim();

    const { data: existingPost } =
      await serverSupabase
        .from("news_posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (existingPost) {
      return NextResponse.json(
        {
          error:
            "Une publication utilise déjà cette URL.",
        },
        { status: 409 }
      );
    }

    const payload =
      cleanPayload(body);

    const { data: post, error } =
      await serverSupabase
        .from("news_posts")
        .insert({
          ...payload,

          published_at:
            body.status === "published"
              ? new Date().toISOString()
              : null,
        })
        .select("id, slug, status")
        .single();

    if (error) {
      console.error(
        "Erreur création publication :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible d'enregistrer la publication.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erreur API création publication :",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

// ============================================================
// UPDATE
// ============================================================

export async function PATCH(request: Request) {
  try {
    const adminCheck = await requireAdmin();

    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const body =
      (await request.json()) as NewsPayload;

    if (!body.id) {
      return NextResponse.json(
        {
          error:
            "Identifiant de publication manquant.",
        },
        { status: 400 }
      );
    }

    const validationError =
      validatePayload(body);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const serverSupabase =
      createServerSupabaseClient();

    const {
      data: currentPost,
      error: currentPostError,
    } = await serverSupabase
      .from("news_posts")
      .select(
        "id, slug, status, published_at"
      )
      .eq("id", body.id)
      .single();

    if (
      currentPostError ||
      !currentPost
    ) {
      return NextResponse.json(
        {
          error:
            "Publication introuvable.",
        },
        { status: 404 }
      );
    }

    const slug =
      body.slug!.trim();

    const {
      data: duplicateSlug,
    } = await serverSupabase
      .from("news_posts")
      .select("id")
      .eq("slug", slug)
      .neq("id", body.id)
      .maybeSingle();

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            "Une autre publication utilise déjà cette URL.",
        },
        { status: 409 }
      );
    }

    const payload =
      cleanPayload(body);

    let publishedAt =
      currentPost.published_at;

    if (
      currentPost.status !==
        "published" &&
      body.status === "published"
    ) {
      publishedAt =
        new Date().toISOString();
    }

    if (
      body.status === "draft"
    ) {
      publishedAt = null;
    }

    const {
      data: updatedPost,
      error: updateError,
    } = await serverSupabase
      .from("news_posts")
      .update({
        ...payload,

        published_at:
          publishedAt,
      })
      .eq("id", body.id)
      .select(
        "id, slug, status, published_at"
      )
      .single();

    if (updateError) {
      console.error(
        "Erreur modification publication :",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Impossible de modifier la publication.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error(
      "Erreur API modification publication :",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE
// ============================================================

export async function DELETE(
  request: Request
) {
  try {
    const adminCheck = await requireAdmin();

    if (!adminCheck.authorized) {
      return adminCheck.response;
    }

    const body =
      (await request.json()) as {
        id?: string;
      };

    if (!body.id) {
      return NextResponse.json(
        {
          error:
            "Identifiant manquant.",
        },
        { status: 400 }
      );
    }

    const serverSupabase =
      createServerSupabaseClient();

    const { error } =
      await serverSupabase
        .from("news_posts")
        .delete()
        .eq("id", body.id);

    if (error) {
      console.error(
        "Erreur suppression publication :",
        error
      );

      return NextResponse.json(
        {
          error:
            "Impossible de supprimer la publication.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erreur API suppression publication :",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}