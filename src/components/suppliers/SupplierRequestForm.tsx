"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/leads/submitLead";

const inputClass =
    "w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-4 text-sm text-[#071B33] outline-none transition placeholder:text-[#9BA8B8] focus:border-[#176BFF]";

export default function SupplierRequestForm() {
    const [sector, setSector] = useState("");

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
                type: "supplier",

                name: form.get("name")?.toString(),
                email: form.get("email")?.toString() || "",

                message: form.get("message")?.toString(),

                sourcePage: "/fournisseurs",

                website: form.get("website")?.toString(),

                payload: {
                    sector,
                    product: form.get("product")?.toString(),
                    quantity: form.get("quantity")?.toString(),
                    budget: form.get("budget")?.toString(),
                    destination: form.get("destination")?.toString(),
                    privateLabel: form.get("privateLabel")?.toString(),
                },
            });

            formElement.reset();

            setSector("");
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
            id="supplier-request"
            className="bg-white py-24 lg:py-32"
        >
            <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
                <div className="rounded-[36px] border border-[#E0E7EF] bg-[#F7F9FC] p-7 sm:p-10 lg:p-14">
                    <div className="max-w-[760px]">
                        <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Supplier Request
                        </div>

                        <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
                            Quel fournisseur
                            <span className="text-[#176BFF]">
                                {" "}
                                recherchez-vous ?
                            </span>
                        </h2>

                        <p className="mt-5 text-base leading-8 text-[#657386]">
                            Décrivez précisément votre produit afin de nous permettre de
                            cibler la recherche.
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
                            <label htmlFor="supplier-website">
                                Website
                            </label>

                            <input
                                id="supplier-website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <select
                                value={sector}
                                onChange={(e) => setSector(e.target.value)}
                                required
                                className={inputClass}
                            >
                                <option value="">
                                    Secteur d&apos;activité
                                </option>

                                <option value="automotive">
                                    Automobile
                                </option>

                                <option value="construction">
                                    Machines & Construction
                                </option>

                                <option value="furniture">
                                    Mobilier
                                </option>

                                <option value="beauty">
                                    Beauté & Esthétique
                                </option>

                                <option value="electronics">
                                    Électronique
                                </option>

                                <option value="home">
                                    Maison & Électroménager
                                </option>

                                <option value="textile">
                                    Textile
                                </option>

                                <option value="ecommerce">
                                    E-commerce
                                </option>

                                <option value="other">
                                    Autre
                                </option>
                            </select>

                            <input
                                name="product"
                                type="text"
                                required
                                placeholder="Produit recherché"
                                className={inputClass}
                            />

                            <input
                                name="quantity"
                                type="text"
                                placeholder="Quantité / MOQ souhaité"
                                className={inputClass}
                            />

                            <input
                                name="budget"
                                type="text"
                                placeholder="Budget cible"
                                className={inputClass}
                            />

                            <input
                                name="destination"
                                type="text"
                                placeholder="Pays de destination"
                                className={inputClass}
                            />

                            <input
                                name="privateLabel"
                                type="text"
                                placeholder="Personnalisation / Private Label"
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
                            placeholder="Dimensions, matière, normes, références, liens produits, niveau de qualité attendu, contraintes particulières..."
                            className={`${inputClass} mt-4 resize-none`}
                        />

                        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <p className="max-w-[500px] text-xs leading-6 text-[#8795A7]">
                                Votre demande sera transmise à PaxSolutio afin de lancer
                                l&apos;étude de votre recherche fournisseur.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Envoi..."
                                    : "Lancer ma recherche"}

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
                                Votre demande de recherche fournisseur a bien été envoyée.
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