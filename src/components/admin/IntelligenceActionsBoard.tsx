"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ActionStatus =
    | "todo"
    | "in_progress"
    | "done"
    | "cancelled";

type ActionPriority =
    | "low"
    | "medium"
    | "high";

type ActionRow = {
    id: string;
    opportunity_id: string;

    title: string;
    description: string | null;

    priority: ActionPriority;
    status: ActionStatus;

    due_date: string | null;

    notes: string | null;

    created_at: string;
    updated_at: string;

    opportunity: {
        id: string;
        title: string;
        product_name: string | null;
        opportunity_kind: string;
        status: string;
        priority_score: number | null;
    } | null;
};

type Props = {
    initialActions: ActionRow[];
};

type FilterKey =
    | "all"
    | "todo"
    | "in_progress"
    | "overdue"
    | "done";

type SortKey =
    | "priority"
    | "due_date"
    | "recent";

const priorityWeight: Record<
    ActionPriority,
    number
> = {
    high: 3,
    medium: 2,
    low: 1,
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
    high: "Haute",
    medium: "Moyenne",
    low: "Faible",
};

function isOverdue(action: ActionRow) {
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

function formatDate(
    value: string | null
) {
    if (!value) {
        return "Aucune échéance";
    }

    return new Date(
        `${value}T00:00:00`
    ).toLocaleDateString("fr-FR");
}

function getStatusClasses(
    status: ActionStatus
) {
    switch (status) {
        case "done":
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

        case "in_progress":
            return "border-blue-500/30 bg-blue-500/10 text-blue-300";

        case "cancelled":
            return "border-slate-600 bg-slate-800/60 text-slate-400";

        default:
            return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    }
}

function getPriorityClasses(
    priority: ActionPriority
) {
    switch (priority) {
        case "high":
            return "border-red-500/25 bg-red-500/10 text-red-300";

        case "medium":
            return "border-amber-500/25 bg-amber-500/10 text-amber-300";

        default:
            return "border-slate-600 bg-slate-800/60 text-slate-400";
    }
}

export default function IntelligenceActionsBoard({
    initialActions,
}: Props) {
    const [actions, setActions] =
        useState<ActionRow[]>(initialActions);

    const [updatingId, setUpdatingId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [filter, setFilter] =
        useState<FilterKey>("all");

    const [sort, setSort] =
        useState<SortKey>("priority");

    async function updateAction(
        action: ActionRow,
        changes: {
            status?: ActionStatus;
            priority?: ActionPriority;
            due_date?: string | null;
        }
    ) {
        try {
            setUpdatingId(action.id);
            setError(null);

            const response = await fetch(
                `/api/admin/intelligence/opportunity/${action.opportunity_id}/actions`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        actionId: action.id,
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
                current.map((currentAction) =>
                    currentAction.id === action.id
                        ? {
                            ...currentAction,
                            ...data.action,

                            // On conserve la relation
                            // dossier déjà chargée.
                            opportunity:
                                currentAction.opportunity,
                        }
                        : currentAction
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

    const stats = useMemo(() => {
        const total =
            actions.length;

        const todo =
            actions.filter(
                (action) =>
                    action.status === "todo"
            ).length;

        const inProgress =
            actions.filter(
                (action) =>
                    action.status ===
                    "in_progress"
            ).length;

        const overdue =
            actions.filter(
                isOverdue
            ).length;

        const done =
            actions.filter(
                (action) =>
                    action.status === "done"
            ).length;

        const highPriority =
            actions.filter(
                (action) =>
                    action.priority ===
                    "high" &&
                    action.status !== "done" &&
                    action.status !==
                    "cancelled"
            ).length;

        return {
            total,
            todo,
            inProgress,
            overdue,
            done,
            highPriority,
        };
    }, [actions]);

    const filteredActions =
        useMemo(() => {
            const filtered =
                actions.filter(
                    (action) => {
                        switch (filter) {
                            case "todo":
                                return (
                                    action.status ===
                                    "todo"
                                );

                            case "in_progress":
                                return (
                                    action.status ===
                                    "in_progress"
                                );

                            case "overdue":
                                return isOverdue(
                                    action
                                );

                            case "done":
                                return (
                                    action.status ===
                                    "done"
                                );

                            default:
                                return true;
                        }
                    }
                );

            return [...filtered].sort(
                (a, b) => {
                    if (
                        sort ===
                        "priority"
                    ) {
                        const priorityDiff =
                            priorityWeight[
                            b.priority
                            ] -
                            priorityWeight[
                            a.priority
                            ];

                        if (
                            priorityDiff !== 0
                        ) {
                            return priorityDiff;
                        }

                        if (
                            isOverdue(a) !==
                            isOverdue(b)
                        ) {
                            return isOverdue(a)
                                ? -1
                                : 1;
                        }
                    }

                    if (
                        sort ===
                        "due_date"
                    ) {
                        if (
                            !a.due_date &&
                            !b.due_date
                        ) {
                            return 0;
                        }

                        if (!a.due_date) {
                            return 1;
                        }

                        if (!b.due_date) {
                            return -1;
                        }

                        return (
                            new Date(
                                a.due_date
                            ).getTime() -
                            new Date(
                                b.due_date
                            ).getTime()
                        );
                    }

                    if (
                        sort === "recent"
                    ) {
                        return (
                            new Date(
                                b.updated_at
                            ).getTime() -
                            new Date(
                                a.updated_at
                            ).getTime()
                        );
                    }

                    return 0;
                }
            );
        }, [
            actions,
            filter,
            sort,
        ]);

    const progress =
        stats.total > 0
            ? Math.round(
                (stats.done /
                    stats.total) *
                100
            )
            : 0;

    return (
        <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Total
                    </div>

                    <div className="mt-3 text-3xl font-semibold">
                        {stats.total}
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                        Actions suivies
                    </div>
                </div>

                <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/70">
                        À faire
                    </div>

                    <div className="mt-3 text-3xl font-semibold text-amber-200">
                        {stats.todo}
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                        Actions à lancer
                    </div>
                </div>

                <div className="rounded-2xl border border-blue-500/15 bg-blue-500/[0.04] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300/70">
                        En cours
                    </div>

                    <div className="mt-3 text-3xl font-semibold text-blue-200">
                        {stats.inProgress}
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                        En traitement
                    </div>
                </div>

                <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300/70">
                        En retard
                    </div>

                    <div className="mt-3 text-3xl font-semibold text-red-200">
                        {stats.overdue}
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                        Échéance dépassée
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
                        Terminées
                    </div>

                    <div className="mt-3 text-3xl font-semibold text-emerald-200">
                        {stats.done}
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                        {progress}% complété
                    </div>
                </div>
            </section>

            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex flex-col gap-5 border-b border-white/10 pb-6 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                            Pilotage
                        </div>

                        <h2 className="mt-2 text-2xl font-semibold">
                            Toutes les actions
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Priorise les actions,
                            surveille les retards et
                            ouvre directement le
                            dossier correspondant.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Trier
                            </label>

                            <select
                                value={sort}
                                onChange={(
                                    event
                                ) =>
                                    setSort(
                                        event
                                            .target
                                            .value as SortKey
                                    )
                                }
                                className="min-w-48 rounded-xl border border-white/10 bg-[#0b1625] px-4 py-2.5 text-sm text-slate-200 outline-none"
                            >
                                <option value="priority">
                                    Priorité
                                </option>

                                <option value="due_date">
                                    Échéance
                                </option>

                                <option value="recent">
                                    Dernière mise à jour
                                </option>
                            </select>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-2.5 text-sm text-slate-400">
                            {
                                filteredActions.length
                            }{" "}
                            résultat
                            {filteredActions.length >
                                1
                                ? "s"
                                : ""}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setFilter("all")
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${filter === "all"
                            ? "border-blue-500/30 bg-blue-500/15 text-blue-200"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                    >
                        Toutes{" "}
                        <span className="ml-1 opacity-60">
                            {stats.total}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setFilter("todo")
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${filter === "todo"
                            ? "border-amber-500/30 bg-amber-500/15 text-amber-200"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                    >
                        À faire{" "}
                        <span className="ml-1 opacity-60">
                            {stats.todo}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setFilter(
                                "in_progress"
                            )
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${filter ===
                            "in_progress"
                            ? "border-blue-500/30 bg-blue-500/15 text-blue-200"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                    >
                        En cours{" "}
                        <span className="ml-1 opacity-60">
                            {
                                stats.inProgress
                            }
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setFilter(
                                "overdue"
                            )
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${filter ===
                            "overdue"
                            ? "border-red-500/30 bg-red-500/15 text-red-200"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                    >
                        En retard{" "}
                        <span className="ml-1 opacity-60">
                            {stats.overdue}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setFilter("done")
                        }
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${filter === "done"
                            ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                    >
                        Terminées{" "}
                        <span className="ml-1 opacity-60">
                            {stats.done}
                        </span>
                    </button>
                </div>

                {stats.highPriority > 0 && (
                    <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[0.05] px-5 py-4">
                        <div className="text-sm font-semibold text-red-200">
                            {
                                stats.highPriority
                            }{" "}
                            action
                            {stats.highPriority >
                                1
                                ? "s"
                                : ""}{" "}
                            de priorité haute
                            encore active
                            {stats.highPriority >
                                1
                                ? "s"
                                : ""}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-red-200/60">
                            Ces actions sont
                            remontées en priorité dans
                            le tri stratégique.
                        </p>
                    </div>
                )}

                {filteredActions.length ===
                    0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
                        <div className="text-sm font-medium text-slate-300">
                            Aucune action dans cette
                            vue.
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                            Change le filtre ou
                            ajoute une nouvelle tâche
                            dans un dossier
                            Intelligence.
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {filteredActions.map(
                            (action) => {
                                const overdue =
                                    isOverdue(
                                        action
                                    );

                                const dossierName =
                                    action
                                        .opportunity
                                        ?.product_name ||
                                    action
                                        .opportunity
                                        ?.title ||
                                    "Dossier Intelligence";

                                return (
                                    <article
                                        key={
                                            action.id
                                        }
                                        className={`rounded-2xl border p-5 transition ${overdue
                                            ? "border-red-500/25 bg-red-500/[0.035]"
                                            : "border-white/[0.08] bg-black/10"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
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
                                                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getPriorityClasses(
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

                                                    {overdue && (
                                                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                                                            En
                                                            retard
                                                        </span>
                                                    )}

                                                    {action.due_date && (
                                                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
                                                            Échéance{" "}
                                                            {formatDate(
                                                                action.due_date
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-blue-400">
                                                    {
                                                        dossierName
                                                    }
                                                </div>

                                                <h3 className="mt-2 text-base font-semibold leading-6 text-white">
                                                    {
                                                        action.title
                                                    }
                                                </h3>

                                                {action.description && (
                                                    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                                                        {
                                                            action.description
                                                        }
                                                    </p>
                                                )}

                                                {action.notes && (
                                                    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                                                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                                            Notes
                                                        </div>

                                                        <div className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-400">
                                                            {
                                                                action.notes
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 flex-col gap-2 xl:w-48">
                                                <select
                                                    value={action.status}
                                                    disabled={updatingId === action.id}
                                                    onChange={(event) =>
                                                        updateAction(action, {
                                                            status:
                                                                event.target
                                                                    .value as ActionStatus,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1625] px-3 py-2.5 text-sm text-slate-200 outline-none disabled:cursor-wait disabled:opacity-50"
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

                                                <select
                                                    value={action.priority}
                                                    disabled={updatingId === action.id}
                                                    onChange={(event) =>
                                                        updateAction(action, {
                                                            priority:
                                                                event.target
                                                                    .value as ActionPriority,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1625] px-3 py-2.5 text-sm text-slate-200 outline-none disabled:cursor-wait disabled:opacity-50"
                                                >
                                                    <option value="low">
                                                        Priorité faible
                                                    </option>

                                                    <option value="medium">
                                                        Priorité moyenne
                                                    </option>

                                                    <option value="high">
                                                        Priorité haute
                                                    </option>
                                                </select>

                                                <input
                                                    type="date"
                                                    value={action.due_date ?? ""}
                                                    disabled={updatingId === action.id}
                                                    onChange={(event) =>
                                                        updateAction(action, {
                                                            due_date:
                                                                event.target.value ||
                                                                null,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-white/10 bg-[#0b1625] px-3 py-2.5 text-sm text-slate-200 outline-none disabled:cursor-wait disabled:opacity-50"
                                                />

                                                <Link
                                                    href={`/admin/intelligence/opportunites/${action.opportunity_id}`}
                                                    className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-center text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                                                >
                                                    Ouvrir le
                                                    dossier →
                                                </Link>

                                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                                                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                                        Mise à
                                                        jour
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-400">
                                                        {new Date(
                                                            action.updated_at
                                                        ).toLocaleDateString(
                                                            "fr-FR"
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}