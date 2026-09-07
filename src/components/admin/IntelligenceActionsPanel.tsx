"use client";

import { useCallback, useEffect, useState } from "react";

type ActionStatus =
    | "todo"
    | "in_progress"
    | "done"
    | "cancelled";

type ActionPriority =
    | "low"
    | "medium"
    | "high";

type IntelligenceAction = {
    id: string;
    opportunity_id: string;
    study_id: string | null;

    title: string;
    description: string | null;

    priority: ActionPriority;
    status: ActionStatus;

    due_date: string | null;

    source_type: string;
    source_index: number | null;

    notes: string | null;

    created_at: string;
    updated_at: string;
    completed_at: string | null;
};

type Props = {
    opportunityId: string;
};

const statusLabels: Record<
    ActionStatus,
    string
> = {
    todo: "À faire",
    in_progress: "En cours",
    done: "Terminée",
    cancelled: "Annulée",
};

const priorityLabels: Record<
    ActionPriority,
    string
> = {
    low: "Faible",
    medium: "Moyenne",
    high: "Haute",
};

function getStatusClasses(
    status: ActionStatus
) {
    switch (status) {
        case "done":
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

        case "in_progress":
            return "border-blue-500/30 bg-blue-500/10 text-blue-300";

        case "cancelled":
            return "border-zinc-600 bg-zinc-800/60 text-zinc-400";

        default:
            return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    }
}

function getPriorityClasses(
    priority: ActionPriority
) {
    switch (priority) {
        case "high":
            return "text-red-300";

        case "low":
            return "text-zinc-400";

        default:
            return "text-amber-300";
    }
}

export default function IntelligenceActionsPanel({
    opportunityId,
}: Props) {
    const [actions, setActions] =
        useState<IntelligenceAction[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [importing, setImporting] =
        useState(false);

    const [updatingId, setUpdatingId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [showManualForm, setShowManualForm] =
        useState(false);

    const [creatingManual, setCreatingManual] =
        useState(false);

    const [manualTitle, setManualTitle] =
        useState("");

    const [manualDescription, setManualDescription] =
        useState("");

    const [manualPriority, setManualPriority] =
        useState<ActionPriority>("medium");

    const [manualDueDate, setManualDueDate] =
        useState("");

    const [manualNotes, setManualNotes] =
        useState("");

    const loadActions =
        useCallback(async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/admin/intelligence/opportunity/${opportunityId}/actions`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.error ||
                        "Impossible de récupérer les actions."
                    );
                }

                setActions(
                    Array.isArray(data.actions)
                        ? data.actions
                        : []
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erreur inconnue."
                );
            } finally {
                setLoading(false);
            }
        }, [opportunityId]);

    useEffect(() => {
        void loadActions();
    }, [loadActions]);

    async function importStudyActions() {
        try {
            setImporting(true);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/actions`,
                {
                    method: "POST",
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                    "Impossible d'importer le plan d'action."
                );
            }

            setActions(
                Array.isArray(data.actions)
                    ? data.actions
                    : []
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setImporting(false);
        }
    }

    async function updateAction(
        actionId: string,
        changes: {
            status?: ActionStatus;
            priority?: ActionPriority;
            due_date?: string | null;
            notes?: string | null;
        }
    ) {
        try {
            setUpdatingId(actionId);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/actions`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        actionId,
                        ...changes,
                    }),
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                    "Impossible de modifier l'action."
                );
            }

            setActions((current) =>
                current.map((action) =>
                    action.id === actionId
                        ? data.action
                        : action
                )
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setUpdatingId(null);
        }
    }

    async function createManualAction() {
        const title = manualTitle.trim();

        if (!title) {
            setError(
                "Le titre de la tâche est obligatoire."
            );
            return;
        }

        try {
            setCreatingManual(true);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${opportunityId}/actions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        mode: "manual",

                        title,

                        description:
                            manualDescription.trim() ||
                            null,

                        priority:
                            manualPriority,

                        due_date:
                            manualDueDate ||
                            null,

                        notes:
                            manualNotes.trim() ||
                            null,
                    }),
                }
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                    "Impossible de créer la tâche."
                );
            }

            setActions((current) => [
                ...current,
                data.action,
            ]);

            setManualTitle("");
            setManualDescription("");
            setManualPriority("medium");
            setManualDueDate("");
            setManualNotes("");

            setShowManualForm(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setCreatingManual(false);
        }
    }

    const completed =
        actions.filter(
            (action) =>
                action.status === "done"
        ).length;

    function isOverdue(action: IntelligenceAction) {
        if (
            !action.due_date ||
            action.status === "done" ||
            action.status === "cancelled"
        ) {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(
            `${action.due_date}T00:00:00`
        );

        return dueDate < today;
    }

    return (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                        Exécution
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Actions Intelligence
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        Transforme les recommandations
                        de l&apos;étude en tâches
                        opérationnelles suivies.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {actions.length === 0 && (
                        <button
                            type="button"
                            onClick={
                                importStudyActions
                            }
                            disabled={importing}
                            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {importing
                                ? "Création..."
                                : "Transformer en tâches"}
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            setShowManualForm(
                                (current) => !current
                            )
                        }
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                    >
                        {showManualForm
                            ? "Fermer"
                            : "+ Nouvelle tâche"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {showManualForm && (
                <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                        Nouvelle tâche
                    </div>

                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Titre
                            </label>

                            <input
                                type="text"
                                value={manualTitle}
                                onChange={(event) =>
                                    setManualTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Ex. Contacter le fournisseur pour obtenir le prix FOB"
                                className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Description
                            </label>

                            <textarea
                                value={
                                    manualDescription
                                }
                                onChange={(event) =>
                                    setManualDescription(
                                        event.target.value
                                    )
                                }
                                rows={3}
                                placeholder="Objectif ou contexte de cette action..."
                                className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Priorité
                                </label>

                                <select
                                    value={
                                        manualPriority
                                    }
                                    onChange={(event) =>
                                        setManualPriority(
                                            event.target
                                                .value as ActionPriority
                                        )
                                    }
                                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-zinc-200 outline-none"
                                >
                                    <option value="low">
                                        Faible
                                    </option>

                                    <option value="medium">
                                        Moyenne
                                    </option>

                                    <option value="high">
                                        Haute
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Échéance
                                </label>

                                <input
                                    type="date"
                                    value={
                                        manualDueDate
                                    }
                                    onChange={(event) =>
                                        setManualDueDate(
                                            event.target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-zinc-200 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Notes
                            </label>

                            <textarea
                                value={manualNotes}
                                onChange={(event) =>
                                    setManualNotes(
                                        event.target.value
                                    )
                                }
                                rows={3}
                                placeholder="Informations complémentaires..."
                                className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowManualForm(
                                        false
                                    )
                                }
                                disabled={
                                    creatingManual
                                }
                                className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 disabled:opacity-50"
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={
                                    createManualAction
                                }
                                disabled={
                                    creatingManual
                                }
                                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {creatingManual
                                    ? "Création..."
                                    : "Créer la tâche"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="mt-6 text-sm text-zinc-400">
                    Chargement des actions...
                </div>
            ) : actions.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-white/10 px-5 py-8 text-center">
                    <p className="text-sm text-zinc-300">
                        Aucune tâche créée pour le
                        moment.
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                        Le plan d&apos;action de
                        l&apos;étude peut être converti
                        automatiquement.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mt-6 flex items-center justify-between border-b border-white/10 pb-4">
                        <p className="text-sm text-zinc-400">
                            {completed} /{" "}
                            {actions.length} terminée
                            {actions.length > 1
                                ? "s"
                                : ""}
                        </p>

                        <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-emerald-400 transition-all"
                                style={{
                                    width: `${actions.length
                                        ? (completed /
                                            actions.length) *
                                        100
                                        : 0
                                        }%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {actions.map(
                            (action, index) => (
                                <article
                                    key={
                                        action.id
                                    }
                                    className={`rounded-xl border p-4 ${isOverdue(action)
                                        ? "border-red-500/30 bg-red-500/[0.04]"
                                        : "border-white/10 bg-black/20"
                                        }`}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-semibold text-zinc-500">
                                                    #
                                                    {index +
                                                        1}
                                                </span>

                                                <span
                                                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusClasses(
                                                        action.status
                                                    )}`}
                                                >
                                                    {
                                                        statusLabels[
                                                        action
                                                            .status
                                                        ]
                                                    }
                                                </span>

                                                <span
                                                    className={`text-xs font-semibold ${getPriorityClasses(
                                                        action.priority
                                                    )}`}
                                                >
                                                    Priorité{" "}
                                                    {
                                                        priorityLabels[
                                                        action
                                                            .priority
                                                        ]
                                                    }
                                                </span>

                                                {isOverdue(action) && (
                                                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-300">
                                                        En retard
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="mt-3 font-semibold leading-6 text-white">
                                                {
                                                    action.title
                                                }
                                            </h3>

                                            {action.description && (
                                                <p className="mt-2 text-sm leading-6 text-zinc-400">
                                                    {
                                                        action.description
                                                    }
                                                </p>
                                            )}

                                            {action.due_date && (
                                                <p className="mt-3 text-xs text-zinc-500">
                                                    Échéance :{" "}
                                                    {
                                                        action.due_date
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/10 pt-4">
                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                                    Priorité
                                                </label>

                                                <select
                                                    value={action.priority}
                                                    disabled={updatingId === action.id}
                                                    onChange={(event) =>
                                                        updateAction(action.id, {
                                                            priority: event.target
                                                                .value as ActionPriority,
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-zinc-200 outline-none disabled:opacity-50"
                                                >
                                                    <option value="low">
                                                        Faible
                                                    </option>

                                                    <option value="medium">
                                                        Moyenne
                                                    </option>

                                                    <option value="high">
                                                        Haute
                                                    </option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                                    Échéance
                                                </label>

                                                <input
                                                    type="date"
                                                    value={action.due_date ?? ""}
                                                    disabled={updatingId === action.id}
                                                    onChange={(event) =>
                                                        updateAction(action.id, {
                                                            due_date:
                                                                event.target.value ||
                                                                null,
                                                        })
                                                    }
                                                    className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-zinc-200 outline-none disabled:opacity-50"
                                                />

                                                {isOverdue(action) && (
                                                    <p className="mt-2 text-xs font-medium text-red-300">
                                                        Cette action a dépassé son échéance.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                                Notes
                                            </label>

                                            <textarea
                                                defaultValue={action.notes ?? ""}
                                                disabled={updatingId === action.id}
                                                placeholder="Résultat d'un contact, prix obtenu, blocage, information complémentaire..."
                                                rows={3}
                                                onBlur={(event) => {
                                                    const newNotes =
                                                        event.target.value.trim();

                                                    const oldNotes =
                                                        action.notes?.trim() ?? "";

                                                    if (newNotes === oldNotes) {
                                                        return;
                                                    }

                                                    void updateAction(action.id, {
                                                        notes: newNotes || null,
                                                    });
                                                }}
                                                className="w-full resize-y rounded-lg border border-white/10 bg-[#0b1220] px-3 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 disabled:opacity-50"
                                            />

                                            <p className="mt-1 text-[11px] text-zinc-600">
                                                Les notes sont enregistrées lorsque
                                                tu quittes le champ.
                                            </p>
                                        </div>

                                        <select
                                            value={
                                                action.status
                                            }
                                            disabled={
                                                updatingId ===
                                                action.id
                                            }
                                            onChange={(event) =>
                                                updateAction(action.id, {
                                                    status: event.target
                                                        .value as ActionStatus,
                                                })
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-zinc-200 outline-none disabled:opacity-50"
                                        >
                                            <option value="todo">
                                                À faire
                                            </option>

                                            <option value="in_progress">
                                                En cours
                                            </option>

                                            <option value="done">
                                                Terminée
                                            </option>

                                            <option value="cancelled">
                                                Annulée
                                            </option>
                                        </select>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                </>
            )}
        </section>
    );
}