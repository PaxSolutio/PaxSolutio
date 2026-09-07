"use client";

import { useState } from "react";

type OpportunityStatus =
    | "to_review"
    | "analyzing"
    | "validated"
    | "rejected"
    | "converted";

type Props = {
    opportunityId: string;
    initialStatus: OpportunityStatus;
    initialNotes: string | null;
};

const statuses: {
    value: OpportunityStatus;
    label: string;
}[] = [
    {
        value: "to_review",
        label: "À étudier",
    },
    {
        value: "analyzing",
        label: "En analyse",
    },
    {
        value: "validated",
        label: "Validée",
    },
    {
        value: "rejected",
        label: "Rejetée",
    },
    {
        value: "converted",
        label: "Convertie",
    },
];

export default function IntelligenceOpportunityManager({
    opportunityId,
    initialStatus,
    initialNotes,
}: Props) {
    const [status, setStatus] =
        useState<OpportunityStatus>(
            initialStatus
        );

    const [notes, setNotes] =
        useState(initialNotes ?? "");

    const [savingStatus, setSavingStatus] =
        useState(false);

    const [savingNotes, setSavingNotes] =
        useState(false);

    const [statusSaved, setStatusSaved] =
        useState(false);

    const [notesSaved, setNotesSaved] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function updateOpportunity(
        payload: {
            status?: OpportunityStatus;
            notes?: string;
        }
    ) {
        const response = await fetch(
            `/api/admin/intelligence/opportunity/${opportunityId}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error ||
                    "Impossible de mettre à jour le dossier."
            );
        }

        return data;
    }

    async function saveStatus(
        newStatus: OpportunityStatus
    ) {
        const previousStatus = status;

        setStatus(newStatus);
        setSavingStatus(true);
        setStatusSaved(false);
        setError(null);

        try {
            await updateOpportunity({
                status: newStatus,
            });

            setStatusSaved(true);

            window.setTimeout(() => {
                setStatusSaved(false);
            }, 2000);
        } catch (error) {
            setStatus(previousStatus);

            setError(
                error instanceof Error
                    ? error.message
                    : "Erreur inconnue."
            );
        } finally {
            setSavingStatus(false);
        }
    }

    async function saveNotes() {
        setSavingNotes(true);
        setNotesSaved(false);
        setError(null);

        try {
            await updateOpportunity({
                notes,
            });

            setNotesSaved(true);

            window.setTimeout(() => {
                setNotesSaved(false);
            }, 2000);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Erreur inconnue."
            );
        } finally {
            setSavingNotes(false);
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Gestion
                </div>

                <h2 className="mt-2 text-lg font-semibold">
                    État du dossier
                </h2>

                <label className="mt-5 block">
                    <span className="text-xs text-slate-500">
                        Statut
                    </span>

                    <select
                        value={status}
                        disabled={savingStatus}
                        onChange={(event) =>
                            saveStatus(
                                event.target
                                    .value as OpportunityStatus
                            )
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1726] px-3 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 disabled:opacity-60"
                    >
                        {statuses.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="mt-3 min-h-5 text-xs">
                    {savingStatus && (
                        <span className="text-slate-500">
                            Enregistrement...
                        </span>
                    )}

                    {!savingStatus &&
                        statusSaved && (
                            <span className="text-emerald-300">
                                ✓ Statut enregistré
                            </span>
                        )}
                </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Notes privées
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    Tes observations, recherches à
                    effectuer, fournisseurs potentiels ou
                    décisions concernant ce dossier.
                </p>

                <textarea
                    value={notes}
                    onChange={(event) => {
                        setNotes(
                            event.target.value
                        );

                        setNotesSaved(false);
                    }}
                    rows={9}
                    placeholder="Ex. : vérifier les prix FOB, homologation UE, contacter deux fournisseurs..."
                    className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-[#0b1726] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50"
                />

                <button
                    type="button"
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="mt-3 w-full rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-wait disabled:opacity-60"
                >
                    {savingNotes
                        ? "Enregistrement..."
                        : "Enregistrer les notes"}
                </button>

                {notesSaved && (
                    <div className="mt-3 text-xs text-emerald-300">
                        ✓ Notes enregistrées
                    </div>
                )}

                {error && (
                    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        {error}
                    </div>
                )}
            </section>
        </div>
    );
}