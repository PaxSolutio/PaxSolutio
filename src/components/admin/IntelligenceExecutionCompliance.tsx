"use client";

import {
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

type Compliance = {
    id: string;
    execution_project_id: string;

    sample_id: string | null;
    quote_id: string | null;
    supplier_id: string | null;

    target_market: string | null;
    target_country: string | null;

    status: string;
    risk_level: string;

    overall_score: number | null;
    missing_requirements: number;
    blocker_count: number;

    regulatory_summary: string | null;
    blocking_issues: string | null;
    internal_notes: string | null;
    decision_notes: string | null;
};

type ComplianceItem = {
    id: string;
    compliance_id: string;

    requirement_type: string;

    title: string;
    description: string | null;

    required: boolean;
    blocking: boolean;

    status: string;

    document_reference: string | null;
    document_url: string | null;

    issuer: string | null;

    issue_date: string | null;
    expiry_date: string | null;

    verified_at: string | null;

    verification_notes: string | null;
};

type ComplianceSuggestion = {
    id: string;
    compliance_id: string;
    execution_project_id: string;

    requirement_type: string;

    title: string;
    description: string | null;

    suggested_required: boolean;
    suggested_blocking: boolean;

    applicability_rationale: string | null;

    confidence_score: number | null;

    source_urls: string[];

    review_status:
    | "pending"
    | "accepted"
    | "rejected";

    accepted_item_id: string | null;

    model: string | null;

    created_at: string;
    reviewed_at: string | null;
};

type Props = {
    executionProjectId: string;

    initialCompliance:
    | Compliance
    | null;

    initialItems:
    ComplianceItem[];

    targetMarket:
    | string
    | null;

    targetCountry:
    | string
    | null;
};

const complianceStatusLabels:
    Record<string, string> = {
    not_started:
        "Non démarré",

    in_review:
        "En vérification",

    blocked:
        "Bloqué",

    ready:
        "Prêt",

    approved:
        "Approuvé",

    rejected:
        "Rejeté",
};

const riskLabels:
    Record<string, string> = {
    low: "Faible",
    medium: "Moyen",
    high: "Élevé",
    critical: "Critique",
};

const itemStatusLabels:
    Record<string, string> = {
    missing: "Manquant",
    requested: "Demandé",
    received: "Reçu",
    under_review:
        "En vérification",
    valid: "Valide",
    invalid: "Invalide",
    not_applicable:
        "Non applicable",
};

const requirementTypeLabels:
    Record<string, string> = {
    ce_marking:
        "Marquage CE",

    declaration_of_conformity:
        "Déclaration de conformité",

    certificate:
        "Certificat",

    test_report:
        "Rapport de test",

    coc:
        "CoC",

    labeling:
        "Étiquetage",

    manual:
        "Manuel / notice",

    packaging:
        "Packaging",

    reach:
        "REACH",

    rohs:
        "RoHS",

    battery:
        "Batterie",

    emc:
        "EMC",

    lvd:
        "LVD",

    red:
        "RED",

    machinery:
        "Machines",

    weee:
        "DEEE / WEEE",

    epr:
        "REP / EPR",

    customs_document:
        "Document douanier",

    other:
        "Autre",
};

const initialItemForm = {
    requirement_type:
        "other",

    title: "",
    description: "",

    required: true,
    blocking: false,

    status: "missing",

    document_reference:
        "",

    document_url: "",

    issuer: "",

    issue_date: "",
    expiry_date: "",

    verification_notes:
        "",
};

export default function IntelligenceExecutionCompliance({
    executionProjectId,
    initialCompliance,
    initialItems,
    targetMarket,
    targetCountry,
}: Props) {
    const router =
        useRouter();

    const [
        compliance,
        setCompliance,
    ] = useState<
        Compliance | null
    >(initialCompliance);

    const [
        items,
        setItems,
    ] = useState<
        ComplianceItem[]
    >(initialItems);

    const [
        showAddForm,
        setShowAddForm,
    ] = useState(false);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState<
        string | null
    >(null);

    const [
        error,
        setError,
    ] = useState<
        string | null
    >(null);

    const [
        itemForm,
        setItemForm,
    ] = useState(
        initialItemForm
    );

    const [
        suggestions,
        setSuggestions,
    ] = useState<
        ComplianceSuggestion[]
    >([]);

    const [
        generatingAi,
        setGeneratingAi,
    ] = useState(false);

    const [
        loadingSuggestions,
        setLoadingSuggestions,
    ] = useState(false);

    const score =
        Number(
            compliance
                ?.overall_score ??
            0
        );

    const progress =
        useMemo(() => {
            const applicable =
                items.filter(
                    (item) =>
                        item.required &&
                        item.status !==
                        "not_applicable"
                );

            const valid =
                applicable.filter(
                    (item) =>
                        item.status ===
                        "valid"
                );

            return {
                applicable:
                    applicable.length,

                valid:
                    valid.length,
            };
        }, [items]);

    function updateItemForm(
        field:
            keyof typeof itemForm,
        value:
            string | boolean
    ) {
        setItemForm(
            (current) => ({
                ...current,
                [field]: value,
            })
        );
    }

    async function loadSuggestions() {
        try {
            setLoadingSuggestions(
                true
            );

            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance/suggestions`
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ??
                    "Impossible de charger les suggestions IA."
                );
            }

            setSuggestions(
                data.suggestions ??
                []
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setLoadingSuggestions(
                false
            );
        }
    }

    async function generateSuggestions() {
        if (!compliance) {
            return;
        }

        try {
            setGeneratingAi(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance/generate`,
                    {
                        method:
                            "POST",
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ??
                    "Impossible de générer la checklist IA."
                );
            }

            setSuggestions(
                data.suggestions ??
                []
            );

            setMessage(
                `${data.count ?? 0} suggestion(s) réglementaire(s) générée(s).`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setGeneratingAi(false);
        }
    }

    async function reviewSuggestion(
        suggestionId: string,
        action:
            | "accept"
            | "reject"
    ) {
        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance/suggestions`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                suggestion_id:
                                    suggestionId,

                                action,
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
                    data.error ??
                    "Impossible de traiter cette suggestion."
                );
            }

            setSuggestions(
                (current) =>
                    current.map(
                        (suggestion) =>
                            suggestion.id ===
                                suggestionId
                                ? data.suggestion
                                : suggestion
                    )
            );

            if (
                action ===
                "accept" &&
                data.item
            ) {
                setItems(
                    (current) => [
                        ...current,
                        data.item,
                    ]
                );

                if (
                    data.compliance
                ) {
                    setCompliance(
                        data.compliance
                    );
                }

                setMessage(
                    "Suggestion acceptée et ajoutée à la checklist."
                );
            } else {
                setMessage(
                    "Suggestion rejetée."
                );
            }

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    async function createCompliance() {
        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                action:
                                    "create_compliance",

                                target_market:
                                    targetMarket,

                                target_country:
                                    targetCountry,
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
                    data.error ??
                    "Impossible de créer le dossier conformité."
                );
            }

            setCompliance(
                data.compliance
            );

            setMessage(
                data.already_exists
                    ? "Le dossier conformité existe déjà."
                    : "Dossier conformité créé."
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    async function addItem() {
        if (!compliance) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                action:
                                    "add_item",

                                compliance_id:
                                    compliance.id,

                                ...itemForm,
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
                    data.error ??
                    "Impossible d'ajouter l'exigence."
                );
            }

            setItems(
                (current) => [
                    ...current,
                    data.item,
                ]
            );

            setCompliance(
                data.compliance
            );

            setItemForm(
                initialItemForm
            );

            setShowAddForm(
                false
            );

            setMessage(
                "Exigence ajoutée."
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    async function updateItem(
        itemId: string,
        payload: Record<
            string,
            unknown
        >
    ) {
        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance`,
                    {
                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                action:
                                    "update_item",

                                item_id:
                                    itemId,

                                ...payload,
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
                    data.error ??
                    "Impossible de modifier l'exigence."
                );
            }

            setItems(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                                itemId
                                ? data.item
                                : item
                    )
            );

            setCompliance(
                data.compliance
            );

            setMessage(
                "Exigence mise à jour."
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    async function deleteItem(
        itemId: string
    ) {
        if (
            !window.confirm(
                "Supprimer cette exigence ?"
            )
        ) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance`,
                    {
                        method:
                            "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                item_id:
                                    itemId,
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
                    data.error ??
                    "Impossible de supprimer l'exigence."
                );
            }

            setItems(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            itemId
                    )
            );

            setCompliance(
                data.compliance
            );

            setMessage(
                "Exigence supprimée."
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    async function updateCompliance(
        payload: Record<
            string,
            unknown
        >
    ) {
        if (!compliance) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/compliance`,
                    {
                        method:
                            "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                action:
                                    "update_compliance",

                                compliance_id:
                                    compliance.id,

                                ...payload,
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
                    data.error ??
                    "Impossible de modifier le dossier."
                );
            }

            setCompliance(
                data.compliance
            );

            setMessage(
                "Dossier conformité mis à jour."
            );

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur inconnue."
            );
        } finally {
            setSaving(false);
        }
    }

    if (!compliance) {
        return (
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                    Conformité
                </div>

                <h2 className="mt-2 text-xl font-semibold text-white">
                    Dossier réglementaire
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    Centralise les exigences,
                    documents, certificats et
                    points bloquants avant import
                    ou mise sur le marché.
                </p>

                <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                    <div className="text-sm text-slate-400">
                        Aucun dossier conformité
                        n'a encore été créé pour ce
                        projet.
                    </div>

                    <button
                        type="button"
                        disabled={
                            saving
                        }
                        onClick={
                            createCompliance
                        }
                        className="mt-5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-[#181006] transition hover:bg-amber-400 disabled:opacity-50"
                    >
                        {saving
                            ? "Création..."
                            : "Créer le dossier conformité"}
                    </button>
                </div>

                {error && (
                    <Message
                        type="error"
                    >
                        {error}
                    </Message>
                )}
            </section>
        );
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                        Conformité
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Dossier réglementaire
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Suis chaque exigence,
                        document et point bloquant
                        avant import ou mise sur
                        le marché.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge>
                        {complianceStatusLabels[
                            compliance.status
                        ] ??
                            compliance.status}
                    </Badge>

                    <Badge>
                        Risque{" "}
                        {riskLabels[
                            compliance.risk_level
                        ] ??
                            compliance.risk_level}
                    </Badge>
                </div>
            </div>

            {message && (
                <Message
                    type="success"
                >
                    {message}
                </Message>
            )}

            {error && (
                <Message
                    type="error"
                >
                    {error}
                </Message>
            )}

            <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
                            Assistant réglementaire IA
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-white">
                            Génération assistée de checklist
                        </h3>

                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                            L’IA recherche les exigences potentiellement applicables au produit et au marché cible. Chaque proposition doit être examinée avant d’être ajoutée à la checklist réelle.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={
                                generatingAi
                            }
                            onClick={
                                generateSuggestions
                            }
                            className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50"
                        >
                            {generatingAi
                                ? "Recherche en cours..."
                                : "✨ Générer avec l’IA"}
                        </button>

                        <button
                            type="button"
                            disabled={
                                loadingSuggestions
                            }
                            onClick={
                                loadSuggestions
                            }
                            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.04] disabled:opacity-50"
                        >
                            {loadingSuggestions
                                ? "Chargement..."
                                : "Charger les suggestions"}
                        </button>
                    </div>
                </div>

                {suggestions.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {suggestions.map(
                            (suggestion) => (
                                <div
                                    key={
                                        suggestion.id
                                    }
                                    className="rounded-2xl border border-white/[0.08] bg-black/10 p-5"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge>
                                                    {requirementTypeLabels[
                                                        suggestion.requirement_type
                                                    ] ??
                                                        suggestion.requirement_type}
                                                </Badge>

                                                {suggestion.suggested_required && (
                                                    <Badge>
                                                        Obligatoire suggéré
                                                    </Badge>
                                                )}

                                                {suggestion.suggested_blocking && (
                                                    <Badge>
                                                        Bloquant suggéré
                                                    </Badge>
                                                )}

                                                <Badge>
                                                    {
                                                        suggestion.review_status
                                                    }
                                                </Badge>
                                            </div>

                                            <h4 className="mt-3 font-semibold text-white">
                                                {
                                                    suggestion.title
                                                }
                                            </h4>

                                            {suggestion.description && (
                                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                                    {
                                                        suggestion.description
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="min-w-[110px] text-left lg:text-right">
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                                                Confiance IA
                                            </div>

                                            <div className="mt-1 text-xl font-semibold text-violet-300">
                                                {suggestion.confidence_score !==
                                                    null
                                                    ? `${Number(
                                                        suggestion.confidence_score
                                                    ).toFixed(
                                                        0
                                                    )}%`
                                                    : "—"}
                                            </div>
                                        </div>
                                    </div>

                                    {suggestion.applicability_rationale && (
                                        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                                                Pourquoi cette exigence ?
                                            </div>

                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {
                                                    suggestion.applicability_rationale
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {Array.isArray(
                                        suggestion.source_urls
                                    ) &&
                                        suggestion
                                            .source_urls
                                            .length >
                                        0 && (
                                            <div className="mt-4">
                                                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                                                    Sources
                                                </div>

                                                <div className="mt-2 space-y-2">
                                                    {suggestion.source_urls.map(
                                                        (
                                                            url
                                                        ) => (
                                                            <a
                                                                key={
                                                                    url
                                                                }
                                                                href={
                                                                    url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block break-all text-xs text-blue-400 hover:text-blue-300"
                                                            >
                                                                {
                                                                    url
                                                                }
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {suggestion.review_status ===
                                        "pending" && (
                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        saving
                                                    }
                                                    onClick={() =>
                                                        reviewSuggestion(
                                                            suggestion.id,
                                                            "accept"
                                                        )
                                                    }
                                                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-[#03120d] transition hover:bg-emerald-400 disabled:opacity-50"
                                                >
                                                    Accepter
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        saving
                                                    }
                                                    onClick={() =>
                                                        reviewSuggestion(
                                                            suggestion.id,
                                                            "reject"
                                                        )
                                                    }
                                                    className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/[0.1] disabled:opacity-50"
                                                >
                                                    Rejeter
                                                </button>
                                            </div>
                                        )}
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Kpi
                    label="Score conformité"
                    value={`${score.toFixed(
                        0
                    )}%`}
                />

                <Kpi
                    label="Exigences valides"
                    value={`${progress.valid}/${progress.applicable}`}
                />

                <Kpi
                    label="Éléments manquants"
                    value={String(
                        compliance.missing_requirements
                    )}
                />

                <Kpi
                    label="Blocages"
                    value={String(
                        compliance.blocker_count
                    )}
                />
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                    className="h-full bg-amber-400 transition-all"
                    style={{
                        width: `${Math.min(
                            score,
                            100
                        )}%`,
                    }}
                />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <Field label="Marché cible">
                    <input
                        defaultValue={
                            compliance.target_market ??
                            ""
                        }
                        onBlur={(
                            event
                        ) =>
                            updateCompliance(
                                {
                                    target_market:
                                        event
                                            .target
                                            .value,
                                }
                            )
                        }
                        className={
                            inputClass
                        }
                    />
                </Field>

                <Field label="Pays cible">
                    <input
                        defaultValue={
                            compliance.target_country ??
                            ""
                        }
                        onBlur={(
                            event
                        ) =>
                            updateCompliance(
                                {
                                    target_country:
                                        event
                                            .target
                                            .value,
                                }
                            )
                        }
                        className={
                            inputClass
                        }
                    />
                </Field>

                <Field label="Niveau de risque">
                    <select
                        value={
                            compliance.risk_level
                        }
                        disabled={
                            saving
                        }
                        onChange={(
                            event
                        ) =>
                            updateCompliance(
                                {
                                    risk_level:
                                        event
                                            .target
                                            .value,
                                }
                            )
                        }
                        className={
                            inputClass
                        }
                    >
                        <option value="low">
                            Faible
                        </option>

                        <option value="medium">
                            Moyen
                        </option>

                        <option value="high">
                            Élevé
                        </option>

                        <option value="critical">
                            Critique
                        </option>
                    </select>
                </Field>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-white">
                        Checklist
                        réglementaire
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Une exigence peut être
                        obligatoire, bloquante ou
                        non applicable selon le
                        produit.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setShowAddForm(
                            (current) =>
                                !current
                        )
                    }
                    className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/[0.14]"
                >
                    {showAddForm
                        ? "Fermer"
                        : "+ Ajouter une exigence"}
                </button>
            </div>

            {showAddForm && (
                <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/10 p-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Field label="Type d'exigence">
                            <select
                                value={
                                    itemForm.requirement_type
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateItemForm(
                                        "requirement_type",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                {Object.entries(
                                    requirementTypeLabels
                                ).map(
                                    ([
                                        value,
                                        label,
                                    ]) => (
                                        <option
                                            key={
                                                value
                                            }
                                            value={
                                                value
                                            }
                                        >
                                            {
                                                label
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </Field>

                        <Field label="Titre">
                            <input
                                value={
                                    itemForm.title
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateItemForm(
                                        "title",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Ex. Déclaration UE de conformité"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Statut">
                            <select
                                value={
                                    itemForm.status
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateItemForm(
                                        "status",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                {Object.entries(
                                    itemStatusLabels
                                ).map(
                                    ([
                                        value,
                                        label,
                                    ]) => (
                                        <option
                                            key={
                                                value
                                            }
                                            value={
                                                value
                                            }
                                        >
                                            {
                                                label
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </Field>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <Field label="Description">
                            <textarea
                                rows={3}
                                value={
                                    itemForm.description
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateItemForm(
                                        "description",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={`${inputClass} resize-y`}
                            />
                        </Field>

                        <Field label="Notes de vérification">
                            <textarea
                                rows={3}
                                value={
                                    itemForm.verification_notes
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateItemForm(
                                        "verification_notes",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={`${inputClass} resize-y`}
                            />
                        </Field>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-6">
                        <label className="flex items-center gap-3 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={
                                    itemForm.required
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateItemForm(
                                        "required",
                                        event
                                            .target
                                            .checked
                                    )
                                }
                            />

                            Exigence obligatoire
                        </label>

                        <label className="flex items-center gap-3 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                checked={
                                    itemForm.blocking
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateItemForm(
                                        "blocking",
                                        event
                                            .target
                                            .checked
                                    )
                                }
                            />

                            Bloquante
                        </label>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={
                                addItem
                            }
                            className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-[#181006] transition hover:bg-amber-400 disabled:opacity-50"
                        >
                            {saving
                                ? "Ajout..."
                                : "Ajouter l'exigence"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 space-y-4">
                {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-500">
                        Aucune exigence
                        enregistrée.
                    </div>
                ) : (
                    items.map(
                        (item) => (
                            <ComplianceItemCard
                                key={
                                    item.id
                                }
                                item={
                                    item
                                }
                                saving={
                                    saving
                                }
                                onUpdate={(
                                    payload
                                ) =>
                                    updateItem(
                                        item.id,
                                        payload
                                    )
                                }
                                onDelete={() =>
                                    deleteItem(
                                        item.id
                                    )
                                }
                            />
                        )
                    )
                )}
            </div>
        </section>
    );
}

function ComplianceItemCard({
    item,
    saving,
    onUpdate,
    onDelete,
}: {
    item: ComplianceItem;
    saving: boolean;

    onUpdate: (
        payload: Record<
            string,
            unknown
        >
    ) => Promise<void>;

    onDelete: () => void;
}) {
    const [
        expanded,
        setExpanded,
    ] = useState(false);

    return (
        <div
            className={`rounded-2xl border p-5 ${item.blocking &&
                item.status !==
                "valid" &&
                item.status !==
                "not_applicable"
                ? "border-red-500/20 bg-red-500/[0.025]"
                : item.status ===
                    "valid"
                    ? "border-emerald-500/15 bg-emerald-500/[0.025]"
                    : "border-white/[0.07] bg-black/10"
                }`}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex flex-wrap gap-2">
                        <Badge>
                            {requirementTypeLabels[
                                item.requirement_type
                            ] ??
                                item.requirement_type}
                        </Badge>

                        {item.required && (
                            <Badge>
                                Obligatoire
                            </Badge>
                        )}

                        {item.blocking && (
                            <Badge>
                                Bloquante
                            </Badge>
                        )}
                    </div>

                    <h4 className="mt-3 font-semibold text-white">
                        {item.title}
                    </h4>

                    {item.description && (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                            {
                                item.description
                            }
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            setExpanded(
                                (current) =>
                                    !current
                            )
                        }
                        className="text-xs font-semibold text-amber-300"
                    >
                        {expanded
                            ? "Fermer"
                            : "Détails"}
                    </button>

                    <button
                        type="button"
                        onClick={
                            onDelete
                        }
                        className="text-xs font-semibold text-red-300"
                    >
                        Supprimer
                    </button>
                </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Statut">
                    <select
                        value={
                            item.status
                        }
                        disabled={
                            saving
                        }
                        onChange={(
                            event
                        ) =>
                            onUpdate({
                                status:
                                    event
                                        .target
                                        .value,
                            })
                        }
                        className={
                            inputClass
                        }
                    >
                        {Object.entries(
                            itemStatusLabels
                        ).map(
                            ([
                                value,
                                label,
                            ]) => (
                                <option
                                    key={
                                        value
                                    }
                                    value={
                                        value
                                    }
                                >
                                    {
                                        label
                                    }
                                </option>
                            )
                        )}
                    </select>
                </Field>

                <div className="flex items-end gap-6 pb-3">
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            checked={
                                item.required
                            }
                            onChange={(
                                event
                            ) =>
                                onUpdate({
                                    required:
                                        event
                                            .target
                                            .checked,
                                })
                            }
                        />

                        Obligatoire
                    </label>

                    <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            checked={
                                item.blocking
                            }
                            onChange={(
                                event
                            ) =>
                                onUpdate({
                                    blocking:
                                        event
                                            .target
                                            .checked,
                                })
                            }
                        />

                        Bloquante
                    </label>
                </div>
            </div>

            {expanded && (
                <div className="mt-5 border-t border-white/[0.07] pt-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Field label="Référence document">
                            <input
                                defaultValue={
                                    item.document_reference ??
                                    ""
                                }
                                onBlur={(
                                    event
                                ) =>
                                    onUpdate({
                                        document_reference:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Émetteur">
                            <input
                                defaultValue={
                                    item.issuer ??
                                    ""
                                }
                                onBlur={(
                                    event
                                ) =>
                                    onUpdate({
                                        issuer:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Lien document">
                            <input
                                defaultValue={
                                    item.document_url ??
                                    ""
                                }
                                onBlur={(
                                    event
                                ) =>
                                    onUpdate({
                                        document_url:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Date émission">
                            <input
                                type="date"
                                defaultValue={
                                    item.issue_date ??
                                    ""
                                }
                                onBlur={(
                                    event
                                ) =>
                                    onUpdate({
                                        issue_date:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Expiration">
                            <input
                                type="date"
                                defaultValue={
                                    item.expiry_date ??
                                    ""
                                }
                                onBlur={(
                                    event
                                ) =>
                                    onUpdate({
                                        expiry_date:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <div className="mt-4">
                        <Field label="Notes de vérification">
                            <textarea
                                rows={4}
                                defaultValue={
                                    item.verification_notes ??
                                    ""
                                }
                                onBlur={(
                                    event
                                ) =>
                                    onUpdate({
                                        verification_notes:
                                            event
                                                .target
                                                .value,
                                    })
                                }
                                className={`${inputClass} resize-y`}
                            />
                        </Field>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-500/40";

function Field({
    label,
    children,
}: {
    label: string;
    children:
    React.ReactNode;
}) {
    return (
        <label className="block">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                {label}
            </div>

            {children}
        </label>
    );
}

function Badge({
    children,
}: {
    children:
    React.ReactNode;
}) {
    return (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-300">
            {children}
        </span>
    );
}

function Kpi({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {label}
            </div>

            <div className="mt-2 text-2xl font-semibold text-white">
                {value}
            </div>
        </div>
    );
}

function Message({
    type,
    children,
}: {
    type:
    | "success"
    | "error";

    children:
    React.ReactNode;
}) {
    return (
        <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${type ===
                "success"
                ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300"
                : "border-red-500/20 bg-red-500/[0.06] text-red-300"
                }`}
        >
            {children}
        </div>
    );
}