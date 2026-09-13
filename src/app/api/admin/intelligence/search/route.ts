import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SearchResult = {
  id: string;
  type:
    | "signal"
    | "opportunity"
    | "project"
    | "supplier"
    | "quote";
  label: string;
  description: string | null;
  href: string;
};

function cleanSearchValue(
  value: string
) {
  return value
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(
  request: NextRequest
) {
  // =========================================================
  // AUTHENTIFICATION
  // =========================================================

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
        error: "Non authentifié.",
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
        error: "Accès refusé.",
      },
      {
        status: 403,
      }
    );
  }

  // =========================================================
  // QUERY
  // =========================================================

  const rawQuery =
    request.nextUrl.searchParams.get(
      "q"
    ) ?? "";

  const query =
    cleanSearchValue(rawQuery);

  if (query.length < 2) {
    return NextResponse.json({
      success: true,
      results: [],
    });
  }

  const pattern = `%${query}%`;

  // =========================================================
  // RECHERCHE PARALLÈLE
  // =========================================================

  const [
    signalsResult,
    opportunitiesResult,
    projectsResult,
    suppliersResult,
    quotesResult,
  ] = await Promise.all([
    supabase
      .from("intelligence_items")
      .select(
        `
          id,
          title,
          summary,
          item_type
        `
      )
      .or(
        `title.ilike.${pattern},summary.ilike.${pattern}`
      )
      .order("detected_at", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from(
        "intelligence_opportunities"
      )
      .select(
        `
          id,
          title,
          product_name,
          status
        `
      )
      .or(
        `title.ilike.${pattern},product_name.ilike.${pattern}`
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from(
        "intelligence_execution_projects"
      )
      .select(
        `
          id,
          title,
          product_name,
          target_market,
          target_country,
          status
        `
      )
      .or(
        `title.ilike.${pattern},product_name.ilike.${pattern},target_market.ilike.${pattern},target_country.ilike.${pattern}`
      )
      .order("updated_at", {
        ascending: false,
      })
      .limit(5),

    supabase
      .from(
        "intelligence_execution_suppliers"
      )
      .select(
        `
          id,
          execution_project_id,
          name,
          country,
          city,
          verification_status
        `
      )
      .or(
        `name.ilike.${pattern},country.ilike.${pattern},city.ilike.${pattern}`
      )
      .limit(5),

    supabase
      .from(
        "intelligence_execution_quotes"
      )
      .select(
        `
          id,
          execution_project_id,
          reference,
          status,
          currency
        `
      )
      .ilike(
        "reference",
        pattern
      )
      .limit(5),
  ]);

  // =========================================================
  // NORMALISATION
  // =========================================================

  const results: SearchResult[] = [];

  for (
    const signal of
    signalsResult.data ?? []
  ) {
    results.push({
      id: signal.id,
      type: "signal",
      label: signal.title,
      description:
        signal.summary ||
        signal.item_type,
      href:
        "/admin/intelligence/radar",
    });
  }

  for (
    const opportunity of
    opportunitiesResult.data ?? []
  ) {
    results.push({
      id: opportunity.id,
      type: "opportunity",
      label:
        opportunity.product_name ||
        opportunity.title,
      description:
        opportunity.status,
      href:
        `/admin/intelligence/opportunites/${opportunity.id}`,
    });
  }

  for (
    const project of
    projectsResult.data ?? []
  ) {
    const location = [
      project.target_market,
      project.target_country,
    ]
      .filter(Boolean)
      .join(" · ");

    results.push({
      id: project.id,
      type: "project",
      label:
        project.product_name ||
        project.title,
      description:
        location ||
        project.status,
      href:
        `/admin/intelligence/execution/${project.id}`,
    });
  }

  for (
    const supplier of
    suppliersResult.data ?? []
  ) {
    const location = [
      supplier.city,
      supplier.country,
    ]
      .filter(Boolean)
      .join(", ");

    results.push({
      id: supplier.id,
      type: "supplier",
      label: supplier.name,
      description:
        location ||
        supplier.verification_status,
      href:
        `/admin/intelligence/execution/${supplier.execution_project_id}`,
    });
  }

  for (
    const quote of
    quotesResult.data ?? []
  ) {
    results.push({
      id: quote.id,
      type: "quote",
      label:
        quote.reference ||
        "Cotation sans référence",
      description:
        `${quote.status} · ${quote.currency}`,
      href:
        `/admin/intelligence/execution/${quote.execution_project_id}`,
    });
  }

  return NextResponse.json({
    success: true,
    results: results.slice(
      0,
      20
    ),
  });
}