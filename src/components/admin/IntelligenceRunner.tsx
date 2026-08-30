"use client";

import CreateIntelligenceArticleButton from "@/components/admin/CreateIntelligenceArticleButton";
import Link from "next/link";
import { useMemo, useState } from "react";

import LogoutButton from "@/components/admin/LogoutButton";

type IntelligenceMission = {
    id: string;
    name: string;
    radar: string;
    query_text: string;
    frequency: "3h" | "12h" | "daily" | "weekly";
    priority: number;
    active: boolean;
    last_run_at: string | null;
    next_run_at: string | null;
};

type IntelligenceItem = {
    id: string;
    title: string;
    summary: string | null;
    analysis: string | null;
    item_type: string;
    categories: string[];
    countries: string[];
    companies: string[];
    products: string[];
    total_score: number | null;
    confidence_score: number | null;
    urgency_score: number | null;
    risk_score: number | null;
    status: string;
    detected_at: string;
    generated_news_post_id: string | null;
};

type RunResponse = {
    success: boolean;
    error?: string;

    query?: {
        id: string;
        name: string;
        radar: string;
    };

    found?: number;
    inserted?: number;
    items?: IntelligenceItem[];
};

type Props = {
    missions: IntelligenceMission[];
    initialItems: IntelligenceItem[];
};

function frequencyLabel(frequency: IntelligenceMission["frequency"]) {
    switch (frequency) {
        case "3h":
            return "Toutes les 3 h";

        case "12h":
            return "Toutes les 12 h";

        case "daily":
            return "Quotidienne";

        case "weekly":
            return "Hebdomadaire";

        default:
            return frequency;
    }
}

function radarLabel(radar: string) {
    switch (radar) {
        case "geopolitics":
            return "Géopolitique";

        case "trade":
            return "Commerce";

        case "logistics":
            return "Logistique";

        case "product":
            return "Produits";

        case "business":
            return "Business";

        case "ecommerce":
            return "E-commerce";

        case "opportunity":
            return "Opportunités";

        case "weak_signal":
            return "Signaux faibles";

        default:
            return radar;
    }
}

function itemTypeLabel(type: string) {
    switch (type) {
        case "news":
            return "Actualité";

        case "product":
            return "Produit";

        case "company":
            return "Entreprise";

        case "competitor":
            return "Concurrent";

        case "regulation":
            return "Réglementation";

        case "geopolitics":
            return "Géopolitique";

        case "logistics":
            return "Logistique";

        case "market":
            return "Marché";

        case "technology":
            return "Technologie";

        case "opportunity":
            return "Opportunité";

        case "event":
            return "Événement";

        case "weak_signal":
            return "Signal faible";

        default:
            return type;
    }
}

function formatDate(value: string | null) {
    if (!value) {
        return "Jamais";
    }

    return new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));
}

function scoreClass(score: number | null) {
    if (score === null) {
        return "bg-white/5 text-slate-400";
    }

    if (score >= 85) {
        return "bg-emerald-500/10 text-emerald-300";
    }

    if (score >= 75) {
        return "bg-blue-500/10 text-blue-300";
    }

    if (score >= 60) {
        return "bg-amber-500/10 text-amber-300";
    }

    return "bg-slate-500/10 text-slate-300";
}

export default function IntelligenceRunner({
    missions,
    initialItems,
}: Props) {
    const [selectedMissionId, setSelectedMissionId] = useState(
        missions[0]?.id ?? ""
    );

    const [items, setItems] =
        useState<IntelligenceItem[]>(initialItems);

    const [running, setRunning] = useState(false);

    const [result, setResult] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const selectedMission = useMemo(
        () =>
            missions.find(
                (mission) => mission.id === selectedMissionId
            ) ?? null,
        [missions, selectedMissionId]
    );

    async function runMission() {
        if (!selectedMissionId || running) {
            return;
        }

        setRunning(true);
        setResult(null);

        try {
            const response = await fetch(
                "/api/admin/intelligence/run",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        queryId: selectedMissionId,
                    }),
                }
            );

            const data = (await response.json()) as RunResponse;

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Impossible d'exécuter la mission Intelligence."
                );
            }

            const newItems = data.items ?? [];

            if (newItems.length > 0) {
                setItems((current) => {
                    const existingIds = new Set(
                        newItems.map((item) => item.id)
                    );

                    return [
                        ...newItems,
                        ...current.filter(
                            (item) => !existingIds.has(item.id)
                        ),
                    ];
                });
            }

            setResult({
                type: "success",
                message:
                    `${data.found ?? 0} information(s) détectée(s), ` +
                    `${data.inserted ?? 0} conservée(s) dans Intelligence.`,
            });
        } catch (error) {
            setResult({
                type: "error",
                message:
                    error instanceof Error
                        ? error.message
                        : "Erreur Intelligence inconnue.",
            });
        } finally {
            setRunning(false);
        }
    }

    const highPriorityCount = items.filter(
        (item) => (item.total_score ?? 0) >= 85
    ).length;

    const editorialCandidateCount = items.filter(
        (item) => (item.total_score ?? 0) >= 75
    ).length;

    return (
        <main className="min-h-screen bg-[#06101f] text-white">
            {/* =====================================================
          HEADER
      ====================================================== */}

            <header className="border-b border-white/10 bg-[#071321]">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                            PaxSolutio
                        </div>

                        <div className="mt-1 font-semibold">
                            Administration
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <Link
                            href="/admin/nouveautes"
                            className="hidden text-sm font-medium text-slate-400 transition hover:text-white sm:block"
                        >
                            Nouveautés
                        </Link>

                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* =====================================================
            TITRE
        ====================================================== */}

                <div className="mb-10">
                    <div className="mb-3 text-sm font-medium text-blue-400">
                        Veille stratégique automatisée
                    </div>

                    <h1 className="text-4xl font-semibold tracking-tight">
                        PaxSolutio Intelligence
                    </h1>

                    <p className="mt-3 max-w-3xl leading-7 text-slate-400">
                        Analysez les marchés, produits, entreprises,
                        réglementations, événements géopolitiques et
                        opportunités susceptibles d&apos;impacter le commerce
                        international.
                    </p>
                </div>

                {/* =====================================================
            KPIs
        ====================================================== */}

                <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="text-sm text-slate-400">
                            Missions actives
                        </div>

                        <div className="mt-2 text-3xl font-semibold">
                            {missions.length}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="text-sm text-slate-400">
                            Informations
                        </div>

                        <div className="mt-2 text-3xl font-semibold">
                            {items.length}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="text-sm text-slate-400">
                            Candidats éditoriaux
                        </div>

                        <div className="mt-2 text-3xl font-semibold text-blue-300">
                            {editorialCandidateCount}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="text-sm text-slate-400">
                            Priorité haute
                        </div>

                        <div className="mt-2 text-3xl font-semibold text-emerald-300">
                            {highPriorityCount}
                        </div>
                    </div>
                </div>

                {/* =====================================================
            MOTEUR MANUEL
        ====================================================== */}

                <section className="mb-10 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] to-white/[0.02]">
                    <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="p-7 md:p-9">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                                Moteur Intelligence
                            </div>

                            <h2 className="mt-3 text-2xl font-semibold">
                                Lancer une mission de veille
                            </h2>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                                Pour la phase de test, chaque mission est déclenchée
                                manuellement. L&apos;automatisation sera activée
                                seulement après validation de la qualité des résultats.
                            </p>

                            <div className="mt-7">
                                <label
                                    htmlFor="mission"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Mission
                                </label>

                                <select
                                    id="mission"
                                    value={selectedMissionId}
                                    onChange={(event) =>
                                        setSelectedMissionId(event.target.value)
                                    }
                                    disabled={running}
                                    className="w-full rounded-xl border border-white/10 bg-[#071321] px-4 py-3.5 text-sm text-white outline-none transition focus:border-blue-500"
                                >
                                    {missions.map((mission) => (
                                        <option
                                            key={mission.id}
                                            value={mission.id}
                                        >
                                            {mission.name} —{" "}
                                            {frequencyLabel(mission.frequency)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedMission && (
                                <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/10 p-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                                            {radarLabel(selectedMission.radar)}
                                        </span>

                                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                                            Priorité {selectedMission.priority}/100
                                        </span>

                                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                                            {frequencyLabel(
                                                selectedMission.frequency
                                            )}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-slate-400">
                                        {selectedMission.query_text}
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={runMission}
                                disabled={!selectedMissionId || running}
                                className="mt-6 inline-flex min-w-52 items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {running
                                    ? "Analyse en cours..."
                                    : "Lancer la veille"}
                            </button>

                            {result && (
                                <div
                                    className={`mt-5 rounded-xl border px-4 py-3 text-sm ${result.type === "success"
                                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                                            : "border-red-500/20 bg-red-500/10 text-red-300"
                                        }`}
                                >
                                    {result.message}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/10 bg-black/10 p-7 md:p-9 lg:border-l lg:border-t-0">
                            <div className="text-sm font-semibold">
                                Mission sélectionnée
                            </div>

                            {selectedMission ? (
                                <div className="mt-6 space-y-5">
                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-slate-500">
                                            Radar
                                        </div>

                                        <div className="mt-1 font-medium">
                                            {radarLabel(selectedMission.radar)}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-slate-500">
                                            Fréquence cible
                                        </div>

                                        <div className="mt-1 font-medium">
                                            {frequencyLabel(
                                                selectedMission.frequency
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-slate-500">
                                            Dernière exécution
                                        </div>

                                        <div className="mt-1 font-medium">
                                            {formatDate(
                                                selectedMission.last_run_at
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-slate-500">
                                            Prochaine exécution théorique
                                        </div>

                                        <div className="mt-1 font-medium">
                                            {selectedMission.next_run_at
                                                ? formatDate(
                                                    selectedMission.next_run_at
                                                )
                                                : "Pas encore planifiée"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-5 text-sm text-slate-500">
                                    Aucune mission disponible.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* =====================================================
            DERNIERS ITEMS
        ====================================================== */}

                <section>
                    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <div className="text-sm font-medium text-blue-400">
                                Radar
                            </div>

                            <h2 className="mt-1 text-2xl font-semibold">
                                Informations détectées
                            </h2>
                        </div>

                        <div className="text-sm text-slate-500">
                            {items.length} résultat
                            {items.length > 1 ? "s" : ""}
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 px-8 py-16 text-center">
                            <div className="text-xl font-semibold">
                                Aucun signal détecté pour le moment
                            </div>

                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
                                Sélectionnez une mission ci-dessus et lancez la
                                première veille PaxSolutio Intelligence.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-white/15"
                                >
                                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                                                    {itemTypeLabel(item.item_type)}
                                                </span>

                                                {item.categories
                                                    ?.slice(0, 3)
                                                    .map((category) => (
                                                        <span
                                                            key={category}
                                                            className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300"
                                                        >
                                                            {category}
                                                        </span>
                                                    ))}
                                            </div>

                                            <h3 className="text-lg font-semibold leading-7">
                                                {item.title}
                                            </h3>

                                            {item.summary && (
                                                <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                                                    {item.summary}
                                                </p>
                                            )}

                                            <div className="mt-4 text-xs text-slate-600">
                                                Détecté le {formatDate(item.detected_at)}
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                                <CreateIntelligenceArticleButton
                                                    intelligenceItemId={item.id}
                                                    generatedNewsPostId={
                                                        item.generated_news_post_id
                                                    }
                                                />

                                                {item.generated_news_post_id && (
                                                    <span className="text-xs font-medium text-emerald-400">
                                                        ✓ Brouillon déjà créé
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[280px] lg:justify-end">
                                            <span
                                                className={`rounded-xl px-3 py-2 text-xs font-semibold ${scoreClass(
                                                    item.total_score
                                                )}`}
                                            >
                                                Score {item.total_score ?? "—"}/100
                                            </span>

                                            <span className="rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                                                Confiance{" "}
                                                {item.confidence_score ?? "—"}%
                                            </span>

                                            <span className="rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
                                                Urgence {item.urgency_score ?? "—"}%
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}