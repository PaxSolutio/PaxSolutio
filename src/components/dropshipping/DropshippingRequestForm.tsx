"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/leads/submitLead";

const inputClass =
    "w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-4 text-sm text-[#071B33] outline-none transition placeholder:text-[#9BA8B8] focus:border-[#176BFF]";

export default function DropshippingRequestForm() {
    const [businessModel, setBusinessModel] = useState("fulfillment");

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
                type: "dropshipping",

                name: form.get("name")?.toString(),
                email: form.get("email")?.toString() || "",

                message: form.get("message")?.toString(),

                sourcePage: "/dropshipping",

                website: form.get("website")?.toString(),

                payload: {
                    businessModel,
                    product: form.get("product")?.toString(),
                    skuCount: form.get("skuCount")?.toString(),
                    monthlyOrders: form.get("monthlyOrders")?.toString(),
                    averageWeight: form.get("averageWeight")?.toString(),
                    markets: form.get("markets")?.toString(),
                    ecommercePlatform: form.get("ecommercePlatform")?.toString(),
                },
            });

            formElement.reset();

            setBusinessModel("fulfillment");
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
            id="dropshipping-request"
            className="bg-[#F6F8FB] py-24 lg:py-32"
        >
            <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
                <div className="rounded-[36px] border border-[#E0E7EF] bg-white p-7 sm:p-10 lg:p-14">
                    <div className="max-w-[760px]">
                        <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            E-commerce Project
                        </div>

                        <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
                            Comment fonctionne
                            <span className="text-[#176BFF]"> votre activité ?</span>
                        </h2>

                        <p className="mt-5 text-base leading-8 text-[#657386]">
                            Décrivez votre boutique, vos produits et vos volumes afin
                            d&apos;étudier le modèle logistique pertinent.
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
                            <label htmlFor="dropshipping-website">
                                Website
                            </label>

                            <input
                                id="dropshipping-website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="mb-8 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setBusinessModel("dropshipping");
                                    setSuccess(false);
                                    setError("");
                                }}
                                className={`rounded-2xl border p-5 text-left transition ${businessModel === "dropshipping"
                                        ? "border-[#176BFF] bg-[#F2F7FF]"
                                        : "border-[#E2E8F0] bg-white"
                                    }`}
                            >
                                <div className="font-extrabold text-[#071B33]">
                                    Dropshipping
                                </div>

                                <div className="mt-2 text-xs leading-6 text-[#657386]">
                                    Expédition directe ou flux simplifié depuis le fournisseur.
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setBusinessModel("fulfillment");
                                    setSuccess(false);
                                    setError("");
                                }}
                                className={`rounded-2xl border p-5 text-left transition ${businessModel === "fulfillment"
                                        ? "border-[#176BFF] bg-[#F2F7FF]"
                                        : "border-[#E2E8F0] bg-white"
                                    }`}
                            >
                                <div className="font-extrabold text-[#071B33]">
                                    Fulfillment avec stock
                                </div>

                                <div className="mt-2 text-xs leading-6 text-[#657386]">
                                    Stockage puis préparation individuelle des commandes.
                                </div>
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                name="product"
                                type="text"
                                required
                                placeholder="Produit / catégorie"
                                className={inputClass}
                            />

                            <input
                                name="skuCount"
                                type="text"
                                placeholder="Nombre de références / SKU"
                                className={inputClass}
                            />

                            <input
                                name="monthlyOrders"
                                type="text"
                                placeholder="Commandes mensuelles estimées"
                                className={inputClass}
                            />

                            <input
                                name="averageWeight"
                                type="text"
                                placeholder="Poids moyen d'une commande"
                                className={inputClass}
                            />

                            <input
                                name="markets"
                                type="text"
                                placeholder="Marchés / pays clients"
                                className={inputClass}
                            />

                            <input
                                name="ecommercePlatform"
                                type="text"
                                placeholder="Plateforme e-commerce"
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
                            placeholder="Sourcing nécessaire, fournisseur existant, packaging, personnalisation, stockage, contraintes particulières..."
                            className={`${inputClass} mt-4 resize-none`}
                        />

                        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <p className="max-w-[500px] text-xs leading-6 text-[#8795A7]">
                                Votre demande sera transmise afin d&apos;étudier la solution
                                e-commerce et logistique adaptée à votre activité.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Envoi..."
                                    : "Étudier mon projet"}

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
                                Votre demande dropshipping / fulfillment a bien été envoyée.
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