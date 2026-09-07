"use client";

import {
    FormEvent,
    useState,
} from "react";

import {
    submitLead,
} from "@/lib/leads/submitLead";

type Props = {
    offerId: string;
    offerTitle: string;
    offerSlug: string;
    priceFrom?: number | null;
    currency?: string | null;
};

const inputClass =
    "w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-4 text-sm text-[#071B33] outline-none transition placeholder:text-[#9BA8B8] focus:border-[#16A36A]";

function formatPrice(
    value: number,
    currency = "EUR"
) {
    return new Intl.NumberFormat(
        "fr-FR",
        {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }
    ).format(value);
}

export default function OfferQuoteForm({
    offerId,
    offerTitle,
    offerSlug,
    priceFrom,
    currency = "EUR",
}: Props) {
    const [loading, setLoading] =
        useState(false);

    const [success, setSuccess] =
        useState(false);

    const [error, setError] =
        useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const formElement =
            event.currentTarget;

        const form =
            new FormData(
                formElement
            );

        setLoading(true);
        setSuccess(false);
        setError("");

        try {
            const quantity =
                form
                    .get("quantity")
                    ?.toString();

            const destination =
                form
                    .get("destination")
                    ?.toString();

            const configuration =
                form
                    .get("configuration")
                    ?.toString();

            await submitLead({
                type: "sourcing",

                name:
                    form
                        .get("name")
                        ?.toString(),

                company:
                    form
                        .get("company")
                        ?.toString(),

                email:
                    form
                        .get("email")
                        ?.toString() ||
                    "",

                phone:
                    form
                        .get("phone")
                        ?.toString(),

                message:
                    form
                        .get("message")
                        ?.toString(),

                sourcePage:
                    `/offres/${offerSlug}`,

                website:
                    form
                        .get("website")
                        ?.toString(),

                payload: {
                    requestType:
                        "offer_quote",

                    offerId,
                    offerTitle,
                    offerSlug,

                    displayedPrice:
                        priceFrom ??
                        null,

                    currency:
                        currency ??
                        "EUR",

                    quantity,
                    destination,
                    configuration,
                },
            });

            formElement.reset();
            setSuccess(true);
        } catch (submitError) {
            setError(
                submitError instanceof
                    Error
                    ? submitError.message
                    : "Une erreur est survenue."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section
            id="demande-devis"
            className="mt-16 scroll-mt-10"
        >
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
                    <div className="bg-[#071B33] p-8 text-white md:p-10">
                        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-300">
                            Demande de devis
                        </div>

                        <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">
                            Parlons de votre
                            projet.
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            Votre demande sera
                            automatiquement liée
                            à cette offre afin
                            que notre équipe
                            puisse vous répondre
                            plus rapidement.
                        </p>

                        <div className="mt-8 rounded-[22px] border border-white/10 bg-white/[0.06] p-5">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">
                                Offre concernée
                            </div>

                            <div className="mt-2 text-lg font-bold">
                                {offerTitle}
                            </div>

                            {priceFrom ? (
                                <div className="mt-4">
                                    <div className="text-xs text-slate-400">
                                        Prix affiché
                                    </div>

                                    <div className="mt-1 text-2xl font-extrabold text-[#39D98A]">
                                        À partir de{" "}
                                        {formatPrice(
                                            priceFrom,
                                            currency ??
                                                "EUR"
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-6 space-y-3 text-xs leading-5 text-slate-400">
                            <p>
                                ✓ Offre identifiée
                                automatiquement
                            </p>

                            <p>
                                ✓ Quantité et
                                destination prises
                                en compte
                            </p>

                            <p>
                                ✓ Configuration
                                étudiée selon votre
                                besoin
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="relative p-8 md:p-10"
                    >
                        <div
                            aria-hidden="true"
                            className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                        >
                            <label htmlFor="offer-website">
                                Website
                            </label>

                            <input
                                id="offer-website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="mb-6">
                            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#16A36A]">
                                Votre demande
                            </div>

                            <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#071B33]">
                                Obtenir un devis
                                personnalisé
                            </h3>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                name="name"
                                type="text"
                                placeholder="Nom"
                                className={
                                    inputClass
                                }
                            />

                            <input
                                name="company"
                                type="text"
                                placeholder="Société"
                                className={
                                    inputClass
                                }
                            />

                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Adresse e-mail *"
                                className={
                                    inputClass
                                }
                            />

                            <input
                                name="phone"
                                type="tel"
                                placeholder="Téléphone"
                                className={
                                    inputClass
                                }
                            />

                            <input
                                name="quantity"
                                type="text"
                                placeholder="Quantité souhaitée"
                                className={
                                    inputClass
                                }
                            />

                            <input
                                name="destination"
                                type="text"
                                placeholder="Pays de livraison"
                                className={
                                    inputClass
                                }
                            />
                        </div>

                        <input
                            name="configuration"
                            type="text"
                            placeholder="Configuration / motorisation souhaitée"
                            className={`${inputClass} mt-4`}
                        />

                        <textarea
                            name="message"
                            rows={5}
                            placeholder="Précisez votre besoin : accessoires, utilisation prévue, contraintes, délai souhaité..."
                            className={`${inputClass} mt-4 resize-none`}
                        />

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[#16A36A] px-8 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#12875A] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Envoi..."
                                : "Demander mon devis"}

                            {!loading ? (
                                <span className="ml-3">
                                    →
                                </span>
                            ) : null}
                        </button>

                        <p className="mt-5 text-xs leading-6 text-[#8795A7]">
                            En envoyant ce
                            formulaire, vous
                            acceptez que
                            PaxSolutio utilise
                            les informations
                            transmises pour
                            traiter votre
                            demande et vous
                            recontacter.{" "}

                            <a
                                href="/confidentialite"
                                className="font-bold !text-[#176BFF] hover:underline"
                            >
                                Politique de
                                confidentialité
                            </a>
                            .
                        </p>

                        {success ? (
                            <div className="mt-6 rounded-xl bg-[#EAF8EF] px-5 py-4 text-sm font-bold text-[#237447]">
                                Votre demande de
                                devis a bien été
                                envoyée.
                            </div>
                        ) : null}

                        {error ? (
                            <div className="mt-6 rounded-xl bg-[#FFF0F0] px-5 py-4 text-sm font-bold text-[#A84242]">
                                {error}
                            </div>
                        ) : null}
                    </form>
                </div>
            </div>
        </section>
    );
}