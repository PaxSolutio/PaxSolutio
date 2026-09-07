"use client";

import {
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

type Shipment = {
    id: string;
    reference: string | null;

    status: string;

    transport_mode: string | null;
    incoterm: string | null;

    forwarder_name: string | null;
    carrier_name: string | null;

    origin_country: string | null;
    origin_city: string | null;
    origin_port: string | null;

    destination_country: string | null;
    destination_city: string | null;
    destination_port: string | null;

    pickup_date: string | null;
    etd: string | null;
    eta: string | null;
    delivered_at: string | null;

    booking_reference: string | null;
    tracking_number: string | null;

    bl_number: string | null;
    awb_number: string | null;
    container_number: string | null;
    seal_number: string | null;
    container_type: string | null;

    quantity: number | null;
    gross_weight_kg: number | null;
    volume_cbm: number | null;

    freight_cost: number | null;
    insurance_cost: number | null;
    origin_charges: number | null;
    destination_charges: number | null;
    customs_clearance_cost: number | null;
    customs_duties: number | null;
    import_vat: number | null;
    other_costs: number | null;

    currency: string;

    logistics_notes: string | null;
    customs_notes: string | null;
    internal_notes: string | null;
};

type ShipmentDocument = {
    id: string;
    shipment_id: string;

    document_type: string;
    document_name: string;

    status: string;

    document_url: string | null;
    reference: string | null;

    issue_date: string | null;
    expiry_date: string | null;

    notes: string | null;

    required: boolean;
    blocking: boolean;

    issuer: string | null;

    verification_notes: string | null;
    internal_notes: string | null;
};

type Props = {
    executionProjectId: string;
    initialShipments: Shipment[];
    initialDocuments: ShipmentDocument[];
    targetCountry: string | null;
};

const shipmentStatusLabels: Record<
    string,
    string
> = {
    planning: "Planification",
    booked: "Réservé",
    pickup: "Enlèvement",
    in_transit: "En transit",
    customs: "Douane",
    delivered: "Livré",
    cancelled: "Annulé",
};

const transportModeLabels: Record<
    string,
    string
> = {
    sea_fcl: "Maritime FCL",
    sea_lcl: "Maritime LCL",
    roro: "RoRo",
    air: "Aérien",
    rail: "Ferroviaire",
    road: "Routier",
    express: "Express",
    multimodal: "Multimodal",
};

const documentStatusLabels: Record<
    string,
    string
> = {
    missing: "Manquant",
    requested: "Demandé",
    received: "Reçu",
    verified: "Vérifié",
    rejected: "Rejeté",
    not_applicable: "Non applicable",
};

const initialShipmentForm = {
    reference: "",
    status: "planning",

    transport_mode: "",
    incoterm: "",

    forwarder_name: "",
    carrier_name: "",

    origin_country: "",
    origin_city: "",
    origin_port: "",

    destination_country: "",
    destination_city: "",
    destination_port: "",

    pickup_date: "",
    etd: "",
    eta: "",
    delivered_at: "",

    booking_reference: "",
    tracking_number: "",

    bl_number: "",
    awb_number: "",
    container_number: "",
    seal_number: "",
    container_type: "",

    quantity: "",
    gross_weight_kg: "",
    volume_cbm: "",

    freight_cost: "",
    insurance_cost: "",
    origin_charges: "",
    destination_charges: "",
    customs_clearance_cost: "",
    customs_duties: "",
    import_vat: "",
    other_costs: "",

    currency: "EUR",

    logistics_notes: "",
    customs_notes: "",
    internal_notes: "",
};

const initialDocumentForm = {
    document_type: "commercial_invoice",
    document_name: "",
    status: "missing",

    document_url: "",
    reference: "",

    issue_date: "",
    expiry_date: "",

    notes: "",

    required: true,
    blocking: false,

    issuer: "",

    verification_notes: "",
    internal_notes: "",
};

function num(value: string) {
    const parsed =
        Number(value);

    return value !== "" &&
        Number.isFinite(parsed)
        ? parsed
        : 0;
}

function formatMoney(
    value: number,
    currency: string
) {
    return `${Number(
        value
    ).toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${currency}`;
}

export default function IntelligenceExecutionLogistics({
    executionProjectId,
    initialShipments,
    initialDocuments,
    targetCountry,
}: Props) {
    const router = useRouter();

    const [
        shipments,
        setShipments,
    ] = useState<Shipment[]>(
        initialShipments
    );

    const [
        documents,
        setDocuments,
    ] = useState<
        ShipmentDocument[]
    >(initialDocuments);

    const [
        showShipmentForm,
        setShowShipmentForm,
    ] = useState(false);

    const [
        shipmentForm,
        setShipmentForm,
    ] = useState({
        ...initialShipmentForm,
        destination_country:
            targetCountry ?? "",
    });

    const [
        selectedShipmentId,
        setSelectedShipmentId,
    ] = useState<string | null>(
        initialShipments[0]?.id ??
            null
    );

    const [
        showDocumentForm,
        setShowDocumentForm,
    ] = useState(false);

    const [
        documentForm,
        setDocumentForm,
    ] = useState(
        initialDocumentForm
    );

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );

    const [
        message,
        setMessage,
    ] = useState<string | null>(
        null
    );

    const logisticsPreview =
        useMemo(() => {
            return (
                num(
                    shipmentForm.freight_cost
                ) +
                num(
                    shipmentForm.insurance_cost
                ) +
                num(
                    shipmentForm.origin_charges
                ) +
                num(
                    shipmentForm.destination_charges
                ) +
                num(
                    shipmentForm.customs_clearance_cost
                ) +
                num(
                    shipmentForm.customs_duties
                ) +
                num(
                    shipmentForm.import_vat
                ) +
                num(
                    shipmentForm.other_costs
                )
            );
        }, [shipmentForm]);

    const selectedShipment =
        shipments.find(
            (shipment) =>
                shipment.id ===
                selectedShipmentId
        ) ?? null;

    const selectedDocuments =
        documents.filter(
            (document) =>
                document.shipment_id ===
                selectedShipmentId
        );

    const documentStats =
        useMemo(() => {
            const applicable =
                selectedDocuments.filter(
                    (document) =>
                        document.required &&
                        document.status !==
                            "not_applicable"
                );

            const verified =
                applicable.filter(
                    (document) =>
                        document.status ===
                        "verified"
                );

            const blockers =
                selectedDocuments.filter(
                    (document) =>
                        document.blocking &&
                        document.status !==
                            "verified" &&
                        document.status !==
                            "not_applicable"
                );

            return {
                applicable:
                    applicable.length,

                verified:
                    verified.length,

                blockers:
                    blockers.length,

                percent:
                    applicable.length >
                    0
                        ? Math.round(
                              (verified.length /
                                  applicable.length) *
                                  100
                          )
                        : 0,
            };
        }, [
            selectedDocuments,
        ]);

    function updateShipmentField(
        field:
            keyof typeof shipmentForm,
        value: string
    ) {
        setShipmentForm(
            (current) => ({
                ...current,
                [field]: value,
            })
        );
    }

    function updateDocumentField(
        field:
            keyof typeof documentForm,
        value:
            string | boolean
    ) {
        setDocumentForm(
            (current) => ({
                ...current,
                [field]: value,
            })
        );
    }

    async function createShipment() {
        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/shipments`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body:
                            JSON.stringify(
                                shipmentForm
                            ),
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
                        "Impossible de créer l'expédition."
                );
            }

            setShipments(
                (current) => [
                    data.shipment,
                    ...current,
                ]
            );

            setSelectedShipmentId(
                data.shipment.id
            );

            setShipmentForm({
                ...initialShipmentForm,
                destination_country:
                    targetCountry ?? "",
            });

            setShowShipmentForm(
                false
            );

            setMessage(
                "Expédition créée."
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

    async function updateShipment(
        shipmentId: string,
        payload: Record<
            string,
            unknown
        >
    ) {
        try {
            setSaving(true);
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/shipments`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body:
                            JSON.stringify({
                                shipment_id:
                                    shipmentId,
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
                        "Modification impossible."
                );
            }

            setShipments(
                (current) =>
                    current.map(
                        (shipment) =>
                            shipment.id ===
                            shipmentId
                                ? data.shipment
                                : shipment
                    )
            );

            setMessage(
                "Expédition mise à jour."
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

    async function deleteShipment(
        shipmentId: string
    ) {
        if (
            !window.confirm(
                "Supprimer cette expédition et ses documents associés ?"
            )
        ) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/shipments`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body:
                            JSON.stringify({
                                shipment_id:
                                    shipmentId,
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
                        "Suppression impossible."
                );
            }

            setShipments(
                (current) =>
                    current.filter(
                        (shipment) =>
                            shipment.id !==
                            shipmentId
                    )
            );

            setDocuments(
                (current) =>
                    current.filter(
                        (document) =>
                            document.shipment_id !==
                            shipmentId
                    )
            );

            setSelectedShipmentId(
                null
            );

            setMessage(
                "Expédition supprimée."
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

    async function createDocument() {
        if (!selectedShipmentId) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/shipment-documents`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body:
                            JSON.stringify({
                                shipment_id:
                                    selectedShipmentId,
                                ...documentForm,
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
                        "Impossible d'ajouter le document."
                );
            }

            setDocuments(
                (current) => [
                    ...current,
                    data.document,
                ]
            );

            setDocumentForm(
                initialDocumentForm
            );

            setShowDocumentForm(
                false
            );

            setMessage(
                "Document ajouté."
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

    async function updateDocument(
        documentId: string,
        payload: Record<
            string,
            unknown
        >
    ) {
        try {
            setSaving(true);
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/shipment-documents`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body:
                            JSON.stringify({
                                document_id:
                                    documentId,
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
                        "Modification du document impossible."
                );
            }

            setDocuments(
                (current) =>
                    current.map(
                        (document) =>
                            document.id ===
                            documentId
                                ? data.document
                                : document
                    )
            );

            setMessage(
                "Document mis à jour."
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

    async function deleteDocument(
        documentId: string
    ) {
        if (
            !window.confirm(
                "Supprimer ce document ?"
            )
        ) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const response =
                await fetch(
                    `/api/admin/intelligence/execution/${executionProjectId}/shipment-documents`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body:
                            JSON.stringify({
                                document_id:
                                    documentId,
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
                        "Suppression impossible."
                );
            }

            setDocuments(
                (current) =>
                    current.filter(
                        (document) =>
                            document.id !==
                            documentId
                    )
            );

            setMessage(
                "Document supprimé."
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

    return (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                        Logistique
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-white">
                        Expéditions
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Pilote le transport, les coûts, les dates, le tracking et le dossier documentaire de chaque expédition.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setShowShipmentForm(
                            (current) =>
                                !current
                        )
                    }
                    className="rounded-xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/[0.14]"
                >
                    {showShipmentForm
                        ? "Fermer"
                        : "+ Ajouter une expédition"}
                </button>
            </div>

            {message && (
                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300">
                    {message}
                </div>
            )}

            {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {showShipmentForm && (
                <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/10 p-5">
                    <h3 className="font-semibold text-white">
                        Nouvelle expédition
                    </h3>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <Field label="Référence">
                            <input
                                value={
                                    shipmentForm.reference
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "reference",
                                        e.target.value
                                    )
                                }
                                placeholder="PS-SHIP-001"
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Mode transport">
                            <select
                                value={
                                    shipmentForm.transport_mode
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "transport_mode",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                <option value="">
                                    Non défini
                                </option>

                                {Object.entries(
                                    transportModeLabels
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

                        <Field label="Incoterm">
                            <input
                                value={
                                    shipmentForm.incoterm
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "incoterm",
                                        e.target.value
                                    )
                                }
                                placeholder="EXW, FOB, CIF..."
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Transitaire">
                            <input
                                value={
                                    shipmentForm.forwarder_name
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "forwarder_name",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Transporteur">
                            <input
                                value={
                                    shipmentForm.carrier_name
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "carrier_name",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Statut">
                            <select
                                value={
                                    shipmentForm.status
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            >
                                {Object.entries(
                                    shipmentStatusLabels
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

                        <Field label="Pays origine">
                            <input
                                value={
                                    shipmentForm.origin_country
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "origin_country",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Ville origine">
                            <input
                                value={
                                    shipmentForm.origin_city
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "origin_city",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Port origine">
                            <input
                                value={
                                    shipmentForm.origin_port
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "origin_port",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Pays destination">
                            <input
                                value={
                                    shipmentForm.destination_country
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "destination_country",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Ville destination">
                            <input
                                value={
                                    shipmentForm.destination_city
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "destination_city",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Port destination">
                            <input
                                value={
                                    shipmentForm.destination_port
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "destination_port",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <DateField
                            label="ETD"
                            value={
                                shipmentForm.etd
                            }
                            onChange={(value) =>
                                updateShipmentField(
                                    "etd",
                                    value
                                )
                            }
                        />

                        <DateField
                            label="ETA"
                            value={
                                shipmentForm.eta
                            }
                            onChange={(value) =>
                                updateShipmentField(
                                    "eta",
                                    value
                                )
                            }
                        />

                        <Field label="Tracking">
                            <input
                                value={
                                    shipmentForm.tracking_number
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "tracking_number",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="BL">
                            <input
                                value={
                                    shipmentForm.bl_number
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "bl_number",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="AWB">
                            <input
                                value={
                                    shipmentForm.awb_number
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "awb_number",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>

                        <Field label="Conteneur">
                            <input
                                value={
                                    shipmentForm.container_number
                                }
                                onChange={(e) =>
                                    updateShipmentField(
                                        "container_number",
                                        e.target.value
                                    )
                                }
                                className={
                                    inputClass
                                }
                            />
                        </Field>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-white">
                            Coûts logistiques
                        </h4>

                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {[
                                [
                                    "freight_cost",
                                    "Fret",
                                ],
                                [
                                    "insurance_cost",
                                    "Assurance",
                                ],
                                [
                                    "origin_charges",
                                    "Frais origine",
                                ],
                                [
                                    "destination_charges",
                                    "Frais destination",
                                ],
                                [
                                    "customs_clearance_cost",
                                    "Dédouanement",
                                ],
                                [
                                    "customs_duties",
                                    "Droits de douane",
                                ],
                                [
                                    "import_vat",
                                    "TVA import",
                                ],
                                [
                                    "other_costs",
                                    "Autres coûts",
                                ],
                            ].map(
                                ([
                                    field,
                                    label,
                                ]) => (
                                    <NumberField
                                        key={
                                            field
                                        }
                                        label={
                                            label
                                        }
                                        value={
                                            shipmentForm[
                                                field as keyof typeof shipmentForm
                                            ] as string
                                        }
                                        onChange={(value) =>
                                            updateShipmentField(
                                                field as keyof typeof shipmentForm,
                                                value
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>

                        <div className="mt-4 rounded-2xl border border-blue-500/15 bg-blue-500/[0.05] p-5">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                Total logistique estimé
                            </div>

                            <div className="mt-2 text-2xl font-semibold text-blue-300">
                                {formatMoney(
                                    logisticsPreview,
                                    shipmentForm.currency
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            disabled={
                                saving
                            }
                            onClick={
                                createShipment
                            }
                            className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-50"
                        >
                            {saving
                                ? "Création..."
                                : "Créer l'expédition"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6 grid gap-6 xl:grid-cols-[340px_1fr]">
                <div className="space-y-3">
                    {shipments.length ===
                    0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
                            Aucune expédition.
                        </div>
                    ) : (
                        shipments.map(
                            (shipment) => (
                                <button
                                    key={
                                        shipment.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        setSelectedShipmentId(
                                            shipment.id
                                        )
                                    }
                                    className={`w-full rounded-2xl border p-4 text-left ${
                                        selectedShipmentId ===
                                        shipment.id
                                            ? "border-blue-500/30 bg-blue-500/[0.06]"
                                            : "border-white/[0.07] bg-black/10"
                                    }`}
                                >
                                    <div className="font-semibold text-white">
                                        {shipment.reference ??
                                            "Expédition"}
                                    </div>

                                    <div className="mt-2 text-xs text-slate-400">
                                        {transportModeLabels[
                                            shipment.transport_mode ??
                                                ""
                                        ] ??
                                            "Mode non défini"}
                                    </div>

                                    <div className="mt-1 text-xs text-slate-500">
                                        {shipmentStatusLabels[
                                            shipment.status
                                        ] ??
                                            shipment.status}
                                    </div>
                                </button>
                            )
                        )
                    )}
                </div>

                {selectedShipment && (
                    <div className="rounded-2xl border border-white/[0.08] bg-black/10 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="text-lg font-semibold text-white">
                                    {selectedShipment.reference ??
                                        "Expédition"}
                                </div>

                                <div className="mt-1 text-sm text-slate-400">
                                    {selectedShipment.origin_city ??
                                        selectedShipment.origin_country ??
                                        "Origine"}
                                    {" → "}
                                    {selectedShipment.destination_city ??
                                        selectedShipment.destination_country ??
                                        "Destination"}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    deleteShipment(
                                        selectedShipment.id
                                    )
                                }
                                className="text-xs font-semibold text-red-300"
                            >
                                Supprimer
                            </button>
                        </div>

                        <div className="mt-5">
                            <Field label="Statut">
                                <select
                                    value={
                                        selectedShipment.status
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={(e) =>
                                        updateShipment(
                                            selectedShipment.id,
                                            {
                                                status:
                                                    e.target.value,
                                            }
                                        )
                                    }
                                    className={
                                        inputClass
                                    }
                                >
                                    {Object.entries(
                                        shipmentStatusLabels
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

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Info
                                label="Transitaire"
                                value={
                                    selectedShipment.forwarder_name
                                }
                            />

                            <Info
                                label="Transporteur"
                                value={
                                    selectedShipment.carrier_name
                                }
                            />

                            <Info
                                label="ETD"
                                value={
                                    selectedShipment.etd
                                }
                            />

                            <Info
                                label="ETA"
                                value={
                                    selectedShipment.eta
                                }
                            />

                            <Info
                                label="Tracking"
                                value={
                                    selectedShipment.tracking_number
                                }
                            />

                            <Info
                                label="BL"
                                value={
                                    selectedShipment.bl_number
                                }
                            />

                            <Info
                                label="AWB"
                                value={
                                    selectedShipment.awb_number
                                }
                            />

                            <Info
                                label="Conteneur"
                                value={
                                    selectedShipment.container_number
                                }
                            />
                        </div>

                        <div className="mt-8 border-t border-white/[0.07] pt-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-white">
                                        Documents logistiques
                                    </div>

                                    <div className="mt-1 text-xs text-slate-500">
                                        {documentStats.verified}/
                                        {
                                            documentStats.applicable
                                        }{" "}
                                        vérifiés ·{" "}
                                        {
                                            documentStats.percent
                                        }
                                        % ·{" "}
                                        {
                                            documentStats.blockers
                                        }{" "}
                                        blocage(s)
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDocumentForm(
                                            (current) =>
                                                !current
                                        )
                                    }
                                    className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-2 text-xs font-semibold text-blue-300"
                                >
                                    + Ajouter un document
                                </button>
                            </div>

                            {showDocumentForm && (
                                <div className="mt-5 rounded-xl border border-white/[0.07] p-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Type">
                                            <input
                                                value={
                                                    documentForm.document_type
                                                }
                                                onChange={(e) =>
                                                    updateDocumentField(
                                                        "document_type",
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </Field>

                                        <Field label="Nom document">
                                            <input
                                                value={
                                                    documentForm.document_name
                                                }
                                                onChange={(e) =>
                                                    updateDocumentField(
                                                        "document_name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Commercial Invoice"
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </Field>

                                        <Field label="Statut">
                                            <select
                                                value={
                                                    documentForm.status
                                                }
                                                onChange={(e) =>
                                                    updateDocumentField(
                                                        "status",
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    inputClass
                                                }
                                            >
                                                {Object.entries(
                                                    documentStatusLabels
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

                                        <Field label="Référence">
                                            <input
                                                value={
                                                    documentForm.reference
                                                }
                                                onChange={(e) =>
                                                    updateDocumentField(
                                                        "reference",
                                                        e.target.value
                                                    )
                                                }
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </Field>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-6">
                                        <label className="flex items-center gap-2 text-sm text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    documentForm.required
                                                }
                                                onChange={(e) =>
                                                    updateDocumentField(
                                                        "required",
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            Obligatoire
                                        </label>

                                        <label className="flex items-center gap-2 text-sm text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    documentForm.blocking
                                                }
                                                onChange={(e) =>
                                                    updateDocumentField(
                                                        "blocking",
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            Bloquant
                                        </label>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            disabled={
                                                saving
                                            }
                                            onClick={
                                                createDocument
                                            }
                                            className="rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white"
                                        >
                                            Ajouter
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 space-y-3">
                                {selectedDocuments.length ===
                                0 ? (
                                    <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">
                                        Aucun document.
                                    </div>
                                ) : (
                                    selectedDocuments.map(
                                        (document) => (
                                            <div
                                                key={
                                                    document.id
                                                }
                                                className={`rounded-xl border p-4 ${
                                                    document.blocking &&
                                                    document.status !==
                                                        "verified" &&
                                                    document.status !==
                                                        "not_applicable"
                                                        ? "border-red-500/20 bg-red-500/[0.03]"
                                                        : "border-white/[0.07]"
                                                }`}
                                            >
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                    <div>
                                                        <div className="font-semibold text-white">
                                                            {
                                                                document.document_name
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-xs text-slate-500">
                                                            {
                                                                document.document_type
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <select
                                                            value={
                                                                document.status
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                            onChange={(e) =>
                                                                updateDocument(
                                                                    document.id,
                                                                    {
                                                                        status:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            className="rounded-lg border border-white/10 bg-[#081726] px-3 py-2 text-xs text-white"
                                                        >
                                                            {Object.entries(
                                                                documentStatusLabels
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

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteDocument(
                                                                    document.id
                                                                )
                                                            }
                                                            className="text-xs font-semibold text-red-300"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#081726] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/40";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
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

function NumberField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <Field label={label}>
            <input
                type="number"
                min="0"
                step="any"
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className={
                    inputClass
                }
            />
        </Field>
    );
}

function DateField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <Field label={label}>
            <input
                type="date"
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                className={
                    inputClass
                }
            />
        </Field>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value:
        | string
        | number
        | null
        | undefined;
}) {
    return (
        <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                {label}
            </div>

            <div className="mt-1 text-sm text-slate-300">
                {value ??
                    "Non renseigné"}
            </div>
        </div>
    );
}