import { requireAdminPage } from "@/lib/admin-access";
import IntelligenceHumanDecision from "@/components/admin/IntelligenceHumanDecision";
import IntelligenceExecutionAction from "@/components/admin/IntelligenceExecutionAction";
import IntelligenceDecisionTimeline from "@/components/admin/IntelligenceDecisionTimeline";
import IntelligenceReassessment from "@/components/admin/IntelligenceReassessment";
import IntelligenceActionsPanel from "@/components/admin/IntelligenceActionsPanel";
import ProductStudyAction from "@/components/admin/ProductStudyAction";
import IntelligenceOpportunityManager from "@/components/admin/IntelligenceOpportunityManager";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

function getStatusLabel(status: string) {
    switch (status) {
        case "to_review":
            return "À étudier";
        case "analyzing":
            return "En analyse";
        case "validated":
            return "Validée";
        case "rejected":
            return "Rejetée";
        case "converted":
            return "Convertie";
        default:
            return status;
    }
}

export default async function IntelligenceOpportunityPage({
    params,
}: PageProps) {
  await requireAdminPage();

    const { id } = await params;

    const authSupabase =
        await createAuthServerClient();

    const {
        data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    const supabase =
        createServerSupabaseClient();

    const { data: admin } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!admin) {
        redirect("/admin/login");
    }

    const {
        data: opportunity,
        error,
    } = await supabase
        .from("intelligence_opportunities")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error(
            "Erreur chargement dossier Intelligence :",
            error
        );
    }

    if (!opportunity) {
        notFound();
    }

    const {
        data: productStudy,
        error: productStudyError,
    } = await supabase
        .from("intelligence_product_studies")
        .select(
            `
        id,
        status,
        overall_verdict,
        overall_score,
        confidence_score,
        completed_at
        `
        )
        .eq("opportunity_id", opportunity.id)
        .maybeSingle();


    // ↓ AJOUTER LE NOUVEAU BLOC ICI

    const {
        data: reassessments,
        error: reassessmentsError,
    } = await supabase
        .from("intelligence_reassessments")
        .select(
            `
        id,
        previous_verdict,
        new_verdict,
        previous_overall_score,
        new_overall_score,
        previous_confidence_score,
        new_confidence_score,
        decision_change,
        decisive_evidence,
        remaining_unknowns,
        created_at
        `
        )
        .eq(
            "opportunity_id",
            opportunity.id
        )
        .order("created_at", {
            ascending: true,
        });

    if (reassessmentsError) {
        console.error(
            "Erreur chargement historique Intelligence :",
            reassessmentsError
        );
    }


    // ↓ PUIS LE RESTE DU CODE DÉJÀ PRÉSENT


    if (productStudyError) {
        console.error(
            "Erreur chargement étude produit :",
            productStudyError
        );
    }

    const sourceIds =
        opportunity.source_item_ids ?? [];

    let sourceItems: {
        id: string;
        title: string;
        summary: string | null;
        total_score: number | null;
        confidence_score: number | null;
        detected_at: string | null;
    }[] = [];

    if (sourceIds.length > 0) {
        const {
            data: sources,
            error: sourcesError,
        } = await supabase
            .from("intelligence_items")
            .select(
                "id,title,summary,total_score,confidence_score,detected_at"
            )
            .in("id", sourceIds)
            .order("detected_at", {
                ascending: false,
            });

        if (sourcesError) {
            console.error(
                "Erreur chargement signaux du dossier :",
                sourcesError
            );
        }

        sourceItems = sources ?? [];
    }

    const latestReassessment =
        reassessments?.length
            ? reassessments[
            reassessments.length - 1
            ]
            : null;

    const currentAiVerdict =
        latestReassessment?.new_verdict ??
        productStudy?.overall_verdict ??
        null;

    const {
        data: latestHumanDecision,
        error: latestHumanDecisionError,
    } = await supabase
        .from("intelligence_decisions")
        .select(
            `
        id,
        human_decision,
        decision_notes,
        created_at
        `
        )
        .eq(
            "opportunity_id",
            opportunity.id
        )
        .order("created_at", {
            ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (latestHumanDecisionError) {
        throw latestHumanDecisionError;
    }

    return (
        <main className="min-h-screen bg-[#06111f] text-white">
            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <header className="border-b border-white/10 pb-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                                PaxSolutio Intelligence
                            </div>

                            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight">
                                {opportunity.product_name ||
                                    opportunity.title}
                            </h1>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${opportunity.opportunity_kind ===
                                        "product"
                                        ? "bg-emerald-500/10 text-emerald-300"
                                        : "bg-blue-500/10 text-blue-300"
                                        }`}
                                >
                                    {opportunity.opportunity_kind ===
                                        "product"
                                        ? "Produit"
                                        : "Stratégique"}
                                </span>

                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                                    {getStatusLabel(
                                        opportunity.status
                                    )}
                                </span>

                                {opportunity.priority_score !==
                                    null && (
                                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                            Priorité{" "}
                                            {
                                                opportunity.priority_score
                                            }
                                            /100
                                        </span>
                                    )}

                                {opportunity.confidence_score !==
                                    null && (
                                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                                            Confiance{" "}
                                            {
                                                opportunity.confidence_score
                                            }
                                            %
                                        </span>
                                    )}
                            </div>
                        </div>

                        <Link
                            href="/admin/intelligence/opportunites"
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                        >
                            ← Dossiers Intelligence
                        </Link>
                    </div>
                </header>

                <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Résumé
                            </div>

                            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {opportunity.summary ||
                                    "Aucun résumé disponible."}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Analyse stratégique
                            </div>

                            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                {opportunity.rationale ||
                                    "Aucune analyse stratégique disponible."}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                                        Sources
                                    </div>

                                    <h2 className="mt-2 text-xl font-semibold">
                                        Signaux associés
                                    </h2>
                                </div>

                                <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                                    {sourceItems.length} signal
                                    {sourceItems.length > 1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>

                            <div className="mt-6 space-y-3">
                                {sourceItems.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">
                                        Aucun signal associé.
                                    </div>
                                ) : (
                                    sourceItems.map(
                                        (source) => (
                                            <article
                                                key={source.id}
                                                className="rounded-2xl border border-white/[0.08] bg-black/10 p-5"
                                            >
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-white">
                                                            {
                                                                source.title
                                                            }
                                                        </h3>

                                                        {source.summary && (
                                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                                {
                                                                    source.summary
                                                                }
                                                            </p>
                                                        )}
                                                    </div>

                                                    {source.total_score !==
                                                        null && (
                                                            <span className="shrink-0 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300">
                                                                {
                                                                    source.total_score
                                                                }
                                                                /100
                                                            </span>
                                                        )}
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                                                    {source.confidence_score !==
                                                        null && (
                                                            <span className="rounded-lg bg-white/5 px-2 py-1">
                                                                Confiance{" "}
                                                                {
                                                                    source.confidence_score
                                                                }
                                                                %
                                                            </span>
                                                        )}

                                                    {source.detected_at && (
                                                        <span className="rounded-lg bg-white/5 px-2 py-1">
                                                            Détecté le{" "}
                                                            {new Date(
                                                                source.detected_at
                                                            ).toLocaleDateString(
                                                                "fr-FR"
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </article>
                                        )
                                    )
                                )}
                            </div>
                        </section>

                        <IntelligenceActionsPanel
                            opportunityId={opportunity.id}
                        />

                        {productStudy?.status === "completed" && (
                            <IntelligenceReassessment
                                opportunityId={opportunity.id}
                                currentVerdict={
                                    productStudy.overall_verdict
                                }
                                currentScore={
                                    productStudy.overall_score
                                }
                                currentConfidence={
                                    productStudy.confidence_score
                                }
                            />
                        )}

                        {productStudy?.status === "completed" && (
                            <IntelligenceDecisionTimeline
                                initialScore={
                                    productStudy.overall_score
                                }
                                initialVerdict={
                                    productStudy.overall_verdict
                                }
                                initialConfidence={
                                    productStudy.confidence_score
                                }
                                reassessments={
                                    reassessments ?? []
                                }
                            />
                        )}

                        {productStudy?.status === "completed" && (
                            <IntelligenceHumanDecision
                                opportunityId={opportunity.id}
                                aiVerdict={currentAiVerdict}
                            />
                        )}

                        {productStudy?.status === "completed" && (
                            <IntelligenceExecutionAction
                                opportunityId={opportunity.id}
                                verdict={
                                    latestHumanDecision?.human_decision ??
                                    null
                                }
                            />
                        )}
                    </div>

                    <aside className="space-y-6">
                        <IntelligenceOpportunityManager
                            opportunityId={opportunity.id}
                            initialStatus={opportunity.status}
                            initialNotes={opportunity.notes}
                        />

                        {opportunity.opportunity_kind === "product" && (
                            <ProductStudyAction
                                opportunityId={opportunity.id}
                                initialStudy={productStudy}
                            />
                        )}

                        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Informations
                            </div>

                            <div className="mt-5 space-y-4 text-sm">
                                <div>
                                    <div className="text-xs text-slate-500">
                                        Créé le
                                    </div>

                                    <div className="mt-1 text-slate-300">
                                        {new Date(
                                            opportunity.created_at
                                        ).toLocaleString("fr-FR")}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-slate-500">
                                        Dernière mise à jour
                                    </div>

                                    <div className="mt-1 text-slate-300">
                                        {new Date(
                                            opportunity.updated_at
                                        ).toLocaleString("fr-FR")}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}