"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/leads/submitLead";

const inputClass =
    "w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-4 text-sm text-[#071B33] outline-none transition placeholder:text-[#9BA8B8] focus:border-[#176BFF]";

export default function ContactForm() {
    const [requestType, setRequestType] = useState("Sourcing");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        console.log("CONTACT FORM SUBMIT");

        const formElement = event.currentTarget;
        const form = new FormData(formElement);

        setLoading(true);
        setSuccess(false);
        setError("");

        try {
            await submitLead({
                type: "general",

                name: form.get("name")?.toString(),
                company: form.get("company")?.toString(),

                email:
                    form.get("email")?.toString() || "",

                phone:
                    form.get("phone")?.toString(),

                message:
                    form.get("message")?.toString(),

                sourcePage: "/contact",

                website:
                    form.get("antiBotField")?.toString(),

                payload: {
                    requestType,
                },
            });

            formElement.reset();

            setRequestType("Sourcing");
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
        <section className="bg-[#F6F8FB] py-24 lg:py-32">
            <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
                <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">

                    {/* COLONNE GAUCHE */}

                    <div>
                        <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Contact
                        </div>

                        <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
                            Contactez PaxSolutio
                        </h2>

                        <p className="mt-6 max-w-[440px] text-base leading-8 text-[#657386]">
                            Présentez-nous votre besoin, votre produit, les quantités envisagées
                            ou votre marché cible. Nous étudions votre demande afin de déterminer
                            la solution la plus adaptée.
                        </p>

                        {/* ÉLÉMENTS DE CONFIANCE */}

                        <div className="mt-9 grid gap-3">

                            <div className="relative overflow-hidden rounded-[18px] border border-[#CFE0FF] bg-[#F2F7FF] p-5 pl-6">
                                <span className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#176BFF]" />

                                <div className="text-sm font-extrabold text-[#071B33]">
                                    France + Chine
                                </div>

                                <p className="mt-1 text-sm leading-6 text-[#657386]">
                                    Une présence opérationnelle pour coordonner vos projets
                                    entre fournisseurs, contrôle et logistique.
                                </p>
                            </div>

                            <div className="relative overflow-hidden rounded-[18px] border border-[#CFE0FF] bg-[#F2F7FF] p-5 pl-6">
                                <span className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#176BFF]" />

                                <div className="text-sm font-extrabold text-[#071B33]">
                                    Étude sans engagement
                                </div>

                                <p className="mt-1 text-sm leading-6 text-[#657386]">
                                    Un premier échange pour comprendre votre besoin et étudier
                                    la faisabilité de votre projet.
                                </p>
                            </div>

                            <div className="relative overflow-hidden rounded-[18px] border border-[#CFE0FF] bg-[#F2F7FF] p-5 pl-6">
                                <span className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#176BFF]" />

                                <div className="text-sm font-extrabold text-[#071B33]">
                                    Réponse sous 24–48 h ouvrées
                                </div>

                                <p className="mt-1 text-sm leading-6 text-[#657386]">
                                    Nous revenons vers vous après une première analyse de votre demande.
                                </p>
                            </div>

                        </div>

                    {/* WHATSAPP */}

                    <div className="mt-5 rounded-[22px] bg-[#071B33] p-6 shadow-[0_12px_30px_rgba(7,27,51,0.12)]">
                        <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#75A8FF]">
                            Contact direct
                        </div>

                        <div className="mt-3 text-lg font-extrabold text-white">
                            WhatsApp professionnel
                        </div>

                        <p className="mt-1 text-sm text-white/60">
                            +33 7 43 57 42 34
                        </p>

                        <a
                            href="https://wa.me/33743574234"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#176BFF] px-5 text-sm font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#2B78FF]"
                        >
                            Échanger sur WhatsApp
                            <span className="ml-3">→</span>
                        </a>
                    </div>

                    {/* PARTENAIRE LOGISTIQUE */}

                    <div className="mt-5 border-t border-[#DDE5EE] pt-5">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A9AAF]">
                            Écosystème opérationnel
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-extrabold text-[#071B33]">
                            <span>PaxSolutio · Sourcing</span>
                            <span>OneBillionForwarders · Logistique</span>
                        </div>
                    </div>
                </div>

                {/* FORMULAIRE */}

                <div className="rounded-[32px] border border-[#DDE5EE] bg-white p-7 sm:p-10">
                    <form
                        onSubmit={handleSubmit}
                        className="relative"
                    >

                        {/* HONEYPOT ANTI-SPAM

                  Ce champ est volontairement invisible.
                  Un utilisateur normal ne doit jamais le remplir.
              */}

                        <div
                            aria-hidden="true"
                            className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                        >
                            <label htmlFor="contact-anti-bot">
                                Ne pas remplir ce champ
                            </label>

                            <input
                                id="contact-anti-bot"
                                name="antiBotField"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                defaultValue=""
                            />
                        </div>


                        <div className="grid gap-4 sm:grid-cols-2">

                            <input
                                name="name"
                                type="text"
                                placeholder="Nom"
                                className={inputClass}
                            />

                            <input
                                name="company"
                                type="text"
                                placeholder="Société"
                                className={inputClass}
                            />

                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Adresse e-mail"
                                className={inputClass}
                            />

                            <input
                                name="phone"
                                type="tel"
                                placeholder="Téléphone"
                                className={inputClass}
                            />

                        </div>

                        <select
                            value={requestType}
                            onChange={(event) =>
                                setRequestType(event.target.value)
                            }
                            className={`${inputClass} mt-4`}
                        >
                            <option value="Sourcing">
                                Sourcing
                            </option>

                            <option value="Sourcing automobile">
                                Sourcing automobile
                            </option>

                            <option value="Recherche fournisseur">
                                Recherche fournisseur
                            </option>

                            <option value="Logistique">
                                Logistique
                            </option>

                            <option value="Audit usine">
                                Audit usine
                            </option>

                            <option value="Contrôle qualité">
                                Contrôle qualité
                            </option>

                            <option value="Dropshipping">
                                Dropshipping / Fulfillment
                            </option>

                            <option value="Autre">
                                Autre demande
                            </option>
                        </select>

                        <textarea
                            name="message"
                            rows={7}
                            placeholder="Décrivez votre projet, votre produit, les quantités, votre budget ou toute autre information utile..."
                            className={`${inputClass} mt-4 resize-none`}
                        />

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Envoi..."
                                    : "Envoyer ma demande"}

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

                        {/* MESSAGE DE SUCCÈS */}

                        {success && (
                            <div className="mt-6 rounded-xl bg-[#EAF8EF] px-5 py-4 text-sm font-bold text-[#237447]">
                                Votre demande a bien été envoyée.
                            </div>
                        )}

                        {/* MESSAGE D'ERREUR */}

                        {error && (
                            <div className="mt-6 rounded-xl bg-[#FFF0F0] px-5 py-4 text-sm font-bold text-[#A84242]">
                                {error}
                            </div>
                        )}

                    </form>
                </div>

            </div>
        </div>
        </section >
    );
}