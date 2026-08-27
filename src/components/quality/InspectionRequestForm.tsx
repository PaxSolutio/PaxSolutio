"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/leads/submitLead";

const inputClass =
    "w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-4 text-sm text-[#071B33] outline-none transition placeholder:text-[#9BA8B8] focus:border-[#176BFF]";

export default function InspectionRequestForm() {
    const [inspectionType, setInspectionType] = useState("psi");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        setLoading(true);
        setSuccess(false);
        setError("");

        try {
            await submitLead({
                type: "quality",

                name: form.get("name")?.toString(),
                email: form.get("email")?.toString() || "",

                message: form.get("message")?.toString(),

                sourcePage: "/controle-qualite",

                website: form.get("website")?.toString(),

                payload: {
                    inspectionType,
                    product: form.get("product")?.toString(),
                    quantity: form.get("quantity")?.toString(),
                    supplierLocation: form.get("supplierLocation")?.toString(),
                    supplierName: form.get("supplierName")?.toString(),
                    requestedDate: form.get("requestedDate")?.toString(),
                },
            });

            formElement.reset();

            setInspectionType("psi");
            setSuccess(true);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section
            id="inspection-request"
            className="bg-white py-24 lg:py-32"
        >
            <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
                <div className="rounded-[36px] border border-[#E0E7EF] bg-[#F7F9FC] p-7 sm:p-10 lg:p-14">
                    <div className="max-w-[760px]">
                        <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Inspection Request
                        </div>

                        <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
                            Que souhaitez-vous
                            <span className="text-[#176BFF]"> vérifier ?</span>
                        </h2>

                        <p className="mt-5 text-base leading-8 text-[#657386]">
                            Décrivez le produit, le fournisseur et le type de contrôle
                            recherché.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="relative mt-10"
                    >
                        {/* HONEYPOT ANTI-SPAM */}
                        <div
                            aria-hidden="true"
                            className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                        >
                            <label htmlFor="inspection-website">
                                Website
                            </label>

                            <input
                                id="inspection-website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <select
                                value={inspectionType}
                                onChange={(e) => setInspectionType(e.target.value)}
                                className={inputClass}
                            >
                                <option value="verification">
                                    Supplier Verification
                                </option>

                                <option value="audit">
                                    Factory Audit
                                </option>

                                <option value="dupro">
                                    During Production Inspection
                                </option>

                                <option value="psi">
                                    Pre-Shipment Inspection
                                </option>

                                <option value="loading">
                                    Loading Supervision
                                </option>
                            </select>

                            <input
                                name="product"
                                type="text"
                                required
                                placeholder="Produit concerné"
                                className={inputClass}
                            />

                            <input
                                name="quantity"
                                type="text"
                                placeholder="Quantité"
                                className={inputClass}
                            />

                            <input
                                name="supplierLocation"
                                type="text"
                                placeholder="Ville / pays du fournisseur"
                                className={inputClass}
                            />

                            <input
                                name="supplierName"
                                type="text"
                                placeholder="Nom du fournisseur"
                                className={inputClass}
                            />

                            <input
                                name="requestedDate"
                                type="text"
                                placeholder="Date souhaitée"
                                className={inputClass}
                            />

                            <input
                                name="name"
                                type="text"
                                placeholder="Nom / Société"
                                className={inputClass}
                            />

                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Adresse e-mail"
                                className={inputClass}
                            />
                        </div>

                        <textarea
                            name="message"
                            rows={5}
                            placeholder="Dimensions, quantité à contrôler, points critiques, packaging, défauts à surveiller, cahier des charges..."
                            className={`${inputClass} mt-4 resize-none`}
                        />

                        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <p className="max-w-[500px] text-xs leading-6 text-[#8795A7]">
                                Votre demande sera transmise afin d&apos;étudier le type
                                d&apos;inspection et les critères de contrôle adaptés.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Envoi..."
                                    : "Demander une inspection"}

                                {!loading && (
                                    <span className="ml-3">
                                        →
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* INFORMATION RGPD */}

                        <p className="mt-5 max-w-[650px] text-xs leading-6 text-[#8795A7]">
                            En envoyant ce formulaire, vous acceptez que PaxSolutio utilise
                            les informations transmises afin de traiter votre demande et de
                            vous recontacter. Pour en savoir plus sur l&apos;utilisation de
                            vos données et vos droits, consultez notre{" "}
                            <a
                                href="/confidentialite"
                                className="font-bold !text-[#176BFF] hover:underline"
                            >
                                politique de confidentialité
                            </a>
                            .
                        </p>

                        {success && (
                            <div className="mt-6 rounded-xl bg-[#EAF8EF] px-5 py-4 text-sm font-bold text-[#237447]">
                                Votre demande de contrôle a bien été envoyée.
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 rounded-xl bg-[#FFF0F0] px-5 py-4 text-sm font-bold text-[#A84242]">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}