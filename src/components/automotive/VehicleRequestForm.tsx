"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/leads/submitLead";

const inputClass =
    "w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-4 text-sm text-[#071B33] outline-none transition placeholder:text-[#9BA8B8] focus:border-[#176BFF]";

export default function VehicleRequestForm() {
    const [quantity, setQuantity] = useState("1");

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
                type: "automotive",

                name: form.get("name")?.toString(),
                email: form.get("email")?.toString() || "",

                message: form.get("message")?.toString(),

                sourcePage: "/sourcing-automobile",

                website: form.get("website")?.toString(),

                payload: {
                    brand: form.get("brand")?.toString(),
                    model: form.get("model")?.toString(),
                    year: form.get("year")?.toString(),
                    engine: form.get("engine")?.toString(),
                    version: form.get("version")?.toString(),
                    quantity,
                    budget: form.get("budget")?.toString(),
                    destination: form.get("destination")?.toString(),
                },
            });

            formElement.reset();

            setQuantity("1");
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
            id="vehicle-request"
            className="bg-white py-24 lg:py-32"
        >
            <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
                <div className="rounded-[36px] border border-[#E0E7EF] bg-[#F7F9FC] p-7 sm:p-10 lg:p-14">
                    <div className="max-w-[760px]">
                        <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Vehicle Request
                        </div>

                        <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
                            Quel véhicule
                            <span className="text-[#176BFF]">
                                {" "}
                                recherchez-vous ?
                            </span>
                        </h2>

                        <p className="mt-5 text-base leading-8 text-[#657386]">
                            Transmettez-nous les caractéristiques essentielles afin de lancer
                            une première recherche.
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
                            <label htmlFor="vehicle-website">
                                Website
                            </label>

                            <input
                                id="vehicle-website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                name="brand"
                                type="text"
                                required
                                placeholder="Marque"
                                className={inputClass}
                            />

                            <input
                                name="model"
                                type="text"
                                required
                                placeholder="Modèle"
                                className={inputClass}
                            />

                            <input
                                name="year"
                                type="text"
                                placeholder="Année souhaitée"
                                className={inputClass}
                            />

                            <input
                                name="engine"
                                type="text"
                                placeholder="Motorisation"
                                className={inputClass}
                            />

                            <input
                                name="version"
                                type="text"
                                placeholder="Finition / version"
                                className={inputClass}
                            />

                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className={inputClass}
                            >
                                <option value="1">
                                    1 véhicule
                                </option>

                                <option value="2-5">
                                    2 à 5 véhicules
                                </option>

                                <option value="6-10">
                                    6 à 10 véhicules
                                </option>

                                <option value="10+">
                                    Plus de 10 véhicules
                                </option>
                            </select>

                            <input
                                name="budget"
                                type="text"
                                placeholder="Budget approximatif"
                                className={inputClass}
                            />

                            <input
                                name="destination"
                                type="text"
                                placeholder="Pays / port de destination"
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
                            placeholder="Couleur, options, kilométrage maximum, contraintes particulières..."
                            className={`${inputClass} mt-4 resize-none`}
                        />

                        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <p className="max-w-[500px] text-xs leading-6 text-[#8795A7]">
                                Votre demande sera transmise à PaxSolutio afin d&apos;étudier
                                les possibilités de sourcing automobile.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Envoi..."
                                    : "Envoyer ma recherche"}

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
                                Votre demande automobile a bien été envoyée.
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