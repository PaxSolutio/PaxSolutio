"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    createElement,
    init,
} from "@airwallex/components-sdk";

import PayPalPaymentButton from "@/components/offers/PayPalPaymentButton";

type PaymentMode = "full" | "deposit";

type OfferPaymentBoxProps = {
    offerId: string;
    currency?: string | null;

    paymentEnabled: boolean;
    paymentPrice?: number | null;

    fullPaymentEnabled: boolean;
    depositEnabled: boolean;

    depositType?: "percent" | "fixed" | null;
    depositPercent?: number | null;
    depositAmount?: number | null;
};

type CreateIntentResponse = {
    success?: boolean;

    environment?: "prod" | "demo";

    order?: {
        id?: string;
        merchant_order_id?: string;
    };

    payment?: {
        id?: string;
        client_secret?: string;
        amount?: number;
        currency?: string;
        mode?: PaymentMode;
        merchant_order_id?: string;
    };

    error?: string;
};

type PaymentStatusResponse = {
    success?: boolean;

    order?: {
        id?: string;
        merchant_order_id?: string;
        payment_mode?: PaymentMode;
        amount?: number;
        currency?: string;
        status?: string;
    };

    payment?: {
        id?: string;
        provider?: string;
        status?: string;
        amount?: number;
        currency?: string;
    } | null;

    confirmed?: boolean;

    error?: string;
};

type ConfirmedPayment = {
    orderId: string;
    merchantOrderId: string;
    mode: PaymentMode;
    amount: number;
    currency: string;
    orderStatus: string;
    paymentStatus: string;
};

function formatPrice(
    value: number,
    currency = "EUR"
) {
    return new Intl.NumberFormat(
        "fr-FR",
        {
            style: "currency",
            currency,
            minimumFractionDigits:
                value % 1 === 0
                    ? 0
                    : 2,
            maximumFractionDigits: 2,
        }
    ).format(value);
}

function sleep(ms: number) {
    return new Promise<void>(
        (resolve) => {
            window.setTimeout(
                resolve,
                ms
            );
        }
    );
}

export default function OfferPaymentBox({
    offerId,
    currency = "EUR",
    paymentEnabled,
    paymentPrice,
    fullPaymentEnabled,
    depositEnabled,
    depositType,
    depositPercent,
    depositAmount,
}: OfferPaymentBoxProps) {
    const safeCurrency =
        currency || "EUR";

    const totalPrice =
        typeof paymentPrice === "number"
            ? paymentPrice
            : 0;

    const calculatedDeposit =
        useMemo(() => {
            if (
                !depositEnabled ||
                totalPrice <= 0
            ) {
                return 0;
            }

            if (
                depositType === "percent" &&
                typeof depositPercent ===
                "number"
            ) {
                return (
                    Math.round(
                        totalPrice *
                        (depositPercent /
                            100) *
                        100
                    ) / 100
                );
            }

            if (
                depositType === "fixed" &&
                typeof depositAmount ===
                "number"
            ) {
                return depositAmount;
            }

            return 0;
        }, [
            depositEnabled,
            depositType,
            depositPercent,
            depositAmount,
            totalPrice,
        ]);

    const remainingBalance =
        Math.max(
            totalPrice -
            calculatedDeposit,
            0
        );

    const initialMode: PaymentMode =
        fullPaymentEnabled
            ? "full"
            : "deposit";

    const [paymentMode, setPaymentMode] =
        useState<PaymentMode>(
            initialMode
        );

    const [loading, setLoading] =
        useState(false);

    const [
        checkoutVisible,
        setCheckoutVisible,
    ] = useState(false);

    const [
        checkoutReady,
        setCheckoutReady,
    ] = useState(false);

    const [
        confirmationPending,
        setConfirmationPending,
    ] = useState(false);

    const [
        confirmedPayment,
        setConfirmedPayment,
    ] =
        useState<ConfirmedPayment | null>(
            null
        );

    const [error, setError] =
        useState<string | null>(null);

    const elementRef =
        useRef<any>(null);

    const activeOrderIdRef =
        useRef<string | null>(null);

    const pollingCancelledRef =
        useRef(false);

    const containerId =
        `airwallex-dropin-${offerId}`;

    useEffect(() => {
        return () => {
            pollingCancelledRef.current =
                true;

            try {
                elementRef.current?.destroy?.();
            } catch {
                // Rien à faire pendant le démontage.
            }

            elementRef.current = null;
        };
    }, []);

    async function destroyCurrentElement() {
        if (!elementRef.current) {
            return;
        }

        try {
            elementRef.current.destroy();
        } catch (destroyError) {
            console.warn(
                "Impossible de détruire l'ancien élément Airwallex :",
                destroyError
            );
        }

        elementRef.current = null;
    }

    async function readPaymentStatus(
        orderId: string
    ) {
        const response = await fetch(
            `/api/payments/status/${encodeURIComponent(
                orderId
            )}`,
            {
                method: "GET",
                cache: "no-store",
            }
        );

        const data =
            (await response.json()) as PaymentStatusResponse;

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.error ||
                "Impossible de vérifier le paiement."
            );
        }

        return data;
    }

    async function waitForServerConfirmation(
        orderId: string
    ) {
        pollingCancelledRef.current =
            false;

        setConfirmationPending(true);
        setError(null);

        /*
         * Le webhook arrive généralement
         * rapidement, mais on laisse jusqu'à
         * environ 30 secondes.
         */
        const maxAttempts = 15;
        const delayMs = 2000;

        try {
            for (
                let attempt = 0;
                attempt < maxAttempts;
                attempt += 1
            ) {
                if (
                    pollingCancelledRef.current
                ) {
                    return;
                }

                const status =
                    await readPaymentStatus(
                        orderId
                    );

                if (
                    status.confirmed &&
                    status.order &&
                    status.payment
                ) {
                    const mode =
                        status.order
                            .payment_mode;

                    if (
                        mode !== "full" &&
                        mode !== "deposit"
                    ) {
                        throw new Error(
                            "Mode de paiement confirmé invalide."
                        );
                    }

                    const amount =
                        Number(
                            status.order
                                .amount
                        );

                    if (
                        !Number.isFinite(
                            amount
                        )
                    ) {
                        throw new Error(
                            "Montant confirmé invalide."
                        );
                    }

                    const confirmedCurrency =
                        status.order
                            .currency ||
                        safeCurrency;

                    await destroyCurrentElement();

                    setCheckoutVisible(
                        false
                    );

                    setCheckoutReady(
                        false
                    );

                    setConfirmedPayment({
                        orderId:
                            status.order.id ||
                            orderId,

                        merchantOrderId:
                            status.order
                                .merchant_order_id ||
                            "",

                        mode,

                        amount,

                        currency:
                            confirmedCurrency,

                        orderStatus:
                            status.order
                                .status ||
                            "",

                        paymentStatus:
                            status.payment
                                .status ||
                            "",
                    });

                    setConfirmationPending(
                        false
                    );

                    return;
                }

                /*
                 * Échec confirmé côté serveur :
                 * on ne continue pas à attendre.
                 */
                if (
                    status.order?.status ===
                    "failed" ||
                    status.order?.status ===
                    "cancelled" ||
                    status.payment?.status ===
                    "failed" ||
                    status.payment?.status ===
                    "cancelled"
                ) {
                    throw new Error(
                        "Le paiement n'a pas été confirmé. Vous pouvez réessayer."
                    );
                }

                await sleep(
                    delayMs
                );
            }

            /*
             * Timeout :
             * on ne déclare surtout pas le
             * paiement réussi nous-mêmes.
             */
            setConfirmationPending(
                false
            );

            setError(
                "Le paiement a été transmis, mais sa confirmation prend plus de temps que prévu. Ne payez pas une seconde fois. Actualisez la page dans quelques instants ou contactez PaxSolutio si nécessaire."
            );
        } catch (statusError) {
            console.error(
                "Erreur confirmation serveur du paiement :",
                statusError
            );

            setConfirmationPending(
                false
            );

            setError(
                statusError instanceof
                    Error
                    ? statusError.message
                    : "Impossible de confirmer le paiement."
            );
        }
    }

    async function handleContinue() {
        if (
            loading ||
            confirmationPending ||
            confirmedPayment
        ) {
            return;
        }

        setLoading(true);
        setError(null);
        setCheckoutReady(false);

        activeOrderIdRef.current =
            null;

        try {
            await destroyCurrentElement();

            /*
             * Le navigateur transmet uniquement
             * l'offre et le mode de paiement.
             * Le serveur recalcule le montant.
             */
            const response =
                await fetch(
                    "/api/payments/airwallex/create-intent",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                offer_id:
                                    offerId,

                                payment_mode:
                                    paymentMode,
                            }),
                    }
                );

            const data =
                (await response.json()) as CreateIntentResponse;

            if (
                !response.ok ||
                !data.success ||
                !data.order?.id ||
                !data.payment?.id ||
                !data.payment
                    .client_secret
            ) {
                throw new Error(
                    data.error ||
                    "Impossible de préparer le paiement."
                );
            }

            activeOrderIdRef.current =
                data.order.id;

            setCheckoutVisible(true);

            if (
                data.environment !== "prod" &&
                data.environment !== "demo"
            ) {
                throw new Error(
                    "Environnement Airwallex invalide."
                );
            }

            await init({
                env: data.environment,

                enabledElements: [
                    "payments",
                ],
            });

            const dropIn =
                await createElement(
                    "dropIn",
                    {
                        intent_id:
                            data.payment.id,

                        client_secret:
                            data.payment
                                .client_secret,

                        currency:
                            data.payment
                                .currency ||
                            safeCurrency,

                        layout: {
                            type: "accordion",
                        },
                    }
                );

            if (!dropIn) {
                throw new Error(
                    "Le checkout Airwallex n'a pas pu être créé."
                );
            }

            elementRef.current =
                dropIn;

            /*
             * React doit afficher le conteneur
             * avant le mount Airwallex.
             */
            await new Promise<void>(
                (resolve) => {
                    requestAnimationFrame(
                        () => {
                            requestAnimationFrame(
                                () =>
                                    resolve()
                            );
                        }
                    );
                }
            );

            const container =
                document.getElementById(
                    containerId
                );

            if (!container) {
                throw new Error(
                    "Le conteneur du checkout Airwallex est introuvable."
                );
            }

            dropIn.mount(container);

            dropIn.on(
                "ready",
                () => {
                    setCheckoutReady(
                        true
                    );
                }
            );

            /*
             * IMPORTANT :
             *
             * success signifie uniquement que
             * le paiement a été transmis avec
             * succès côté Airwallex.js.
             *
             * On attend ensuite la confirmation
             * enregistrée par notre webhook.
             */
            dropIn.on(
                "success",
                () => {
                    setError(null);

                    const orderId =
                        activeOrderIdRef.current;

                    if (!orderId) {
                        setError(
                            "Le paiement a été transmis mais la commande locale est introuvable."
                        );

                        return;
                    }

                    void waitForServerConfirmation(
                        orderId
                    );
                }
            );

            dropIn.on(
                "error",
                (event: unknown) => {
                    console.error(
                        "Erreur Drop-in Airwallex :",
                        event
                    );

                    setError(
                        "Le paiement n'a pas pu être finalisé. Vérifiez les informations saisies puis réessayez."
                    );
                }
            );
        } catch (err) {
            console.error(
                "Erreur préparation Airwallex :",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue pendant la préparation du paiement."
            );

            setCheckoutVisible(false);

            activeOrderIdRef.current =
                null;

            await destroyCurrentElement();
        } finally {
            setLoading(false);
        }
    }

    const handlePayPalSuccess = useCallback((result: {
        orderId: string;
        merchantOrderId: string;
        mode: PaymentMode;
        amount: number;
        currency: string;
    }) => {
        pollingCancelledRef.current =
            true;

        void destroyCurrentElement();

        setCheckoutVisible(false);
        setCheckoutReady(false);
        setConfirmationPending(false);
        setError(null);

        setConfirmedPayment({
            orderId:
                result.orderId,

            merchantOrderId:
                result.merchantOrderId,

            mode:
                result.mode,

            amount:
                result.amount,

            currency:
                result.currency,

            orderStatus:
                result.mode === "deposit"
                    ? "partially_paid"
                    : "paid",

            paymentStatus:
                "succeeded",
        });
    }, []);

    async function handleChangeMode(
        mode: PaymentMode
    ) {
        if (
            mode === paymentMode ||
            confirmationPending ||
            confirmedPayment
        ) {
            return;
        }

        pollingCancelledRef.current =
            true;

        await destroyCurrentElement();

        activeOrderIdRef.current =
            null;

        setPaymentMode(mode);
        setCheckoutVisible(false);
        setCheckoutReady(false);
        setConfirmationPending(false);
        setConfirmedPayment(null);
        setError(null);
    }

    if (
        !paymentEnabled ||
        totalPrice <= 0 ||
        (!fullPaymentEnabled &&
            !depositEnabled)
    ) {
        return null;
    }

    /*
     * =====================================================
     * ÉCRAN FINAL CONFIRMÉ PAR LE SERVEUR
     * =====================================================
     */

    if (confirmedPayment) {
        const isDeposit =
            confirmedPayment.mode ===
            "deposit";

        const confirmedBalance =
            isDeposit
                ? Math.max(
                    totalPrice -
                    confirmedPayment.amount,
                    0
                )
                : 0;

        return (
            <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                        ✓
                    </div>

                    <div className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        Confirmation
                        serveur
                    </div>

                    <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#06101d]">
                        {isDeposit
                            ? "Acompte confirmé"
                            : "Paiement confirmé"}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {formatPrice(
                            confirmedPayment.amount,
                            confirmedPayment.currency
                        )}{" "}
                        réglés avec
                        succès.
                    </p>

                    {isDeposit ? (
                        <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/70 p-4">
                            <div className="text-xs font-medium text-slate-500">
                                Solde restant
                            </div>

                            <div className="mt-1 text-xl font-extrabold text-[#06101d]">
                                {formatPrice(
                                    confirmedBalance,
                                    confirmedPayment.currency
                                )}
                            </div>
                        </div>
                    ) : null}

                    {confirmedPayment.merchantOrderId ? (
                        <div className="mt-5 border-t border-emerald-200 pt-4">
                            <div className="text-xs text-slate-500">
                                Référence de
                                paiement
                            </div>

                            <div className="mt-1 break-all text-sm font-semibold text-[#06101d]">
                                {
                                    confirmedPayment.merchantOrderId
                                }
                            </div>
                        </div>
                    ) : null}

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                        La confirmation a
                        été vérifiée côté
                        serveur auprès du
                        système de paiement.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Paiement en ligne
                    </div>

                    <div className="mt-2 text-sm font-medium text-slate-600">
                        Prix de
                        l&apos;offre
                    </div>
                </div>

                <div className="text-right text-2xl font-extrabold tracking-[-0.03em] text-[#06101d]">
                    {formatPrice(
                        totalPrice,
                        safeCurrency
                    )}
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {fullPaymentEnabled ? (
                    <button
                        type="button"
                        disabled={
                            confirmationPending
                        }
                        onClick={() =>
                            void handleChangeMode(
                                "full"
                            )
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${paymentMode ===
                            "full"
                            ? "border-[#0d63f3] bg-blue-50/60 shadow-[0_8px_24px_rgba(13,99,243,0.08)]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMode ===
                                        "full"
                                        ? "border-[#0d63f3]"
                                        : "border-slate-300"
                                        }`}
                                >
                                    {paymentMode ===
                                        "full" ? (
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0d63f3]" />
                                    ) : null}
                                </span>

                                <div>
                                    <div className="text-sm font-bold text-[#06101d]">
                                        Paiement
                                        intégral
                                    </div>

                                    <div className="mt-0.5 text-xs text-slate-500">
                                        Régler la
                                        totalité
                                        maintenant
                                    </div>
                                </div>
                            </div>

                            <div className="text-base font-extrabold text-[#06101d]">
                                {formatPrice(
                                    totalPrice,
                                    safeCurrency
                                )}
                            </div>
                        </div>
                    </button>
                ) : null}

                {depositEnabled &&
                    calculatedDeposit > 0 ? (
                    <button
                        type="button"
                        disabled={
                            confirmationPending
                        }
                        onClick={() =>
                            void handleChangeMode(
                                "deposit"
                            )
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${paymentMode ===
                            "deposit"
                            ? "border-[#0d63f3] bg-blue-50/60 shadow-[0_8px_24px_rgba(13,99,243,0.08)]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <span
                                    className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${paymentMode ===
                                        "deposit"
                                        ? "border-[#0d63f3]"
                                        : "border-slate-300"
                                        }`}
                                >
                                    {paymentMode ===
                                        "deposit" ? (
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0d63f3]" />
                                    ) : null}
                                </span>

                                <div>
                                    <div className="text-sm font-bold text-[#06101d]">
                                        Verser un
                                        acompte
                                        {depositType ===
                                            "percent" &&
                                            depositPercent
                                            ? ` de ${depositPercent} %`
                                            : ""}
                                    </div>

                                    <div className="mt-0.5 text-xs text-slate-500">
                                        Solde restant
                                        :{" "}
                                        {formatPrice(
                                            remainingBalance,
                                            safeCurrency
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-base font-extrabold text-[#06101d]">
                                {formatPrice(
                                    calculatedDeposit,
                                    safeCurrency
                                )}
                            </div>
                        </div>
                    </button>
                ) : null}
            </div>

            <button
                type="button"
                onClick={
                    handleContinue
                }
                disabled={
                    loading ||
                    confirmationPending
                }
                className="mt-5 flex w-full items-center justify-center rounded-full bg-[#0d63f3] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(13,99,243,0.20)] transition hover:bg-[#0b55d1] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading
                    ? "Ouverture du paiement..."
                    : confirmationPending
                        ? "Confirmation du paiement..."
                        : checkoutVisible
                            ? "Recharger le paiement sécurisé"
                            : "Continuer vers le paiement sécurisé"}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                >
                    <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                    />

                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                Paiement sécurisé
                via Airwallex
            </div>

            {confirmationPending ? (
                <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-blue-200 border-t-[#0d63f3]" />

                        <div>
                            <div className="text-sm font-semibold text-[#06101d]">
                                Confirmation du
                                paiement en cours
                            </div>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                Votre paiement a
                                été transmis. Nous
                                attendons maintenant
                                sa confirmation
                                sécurisée côté
                                serveur.
                            </p>

                            <p className="mt-2 text-xs font-medium text-[#0d63f3]">
                                Ne fermez pas cette
                                page et ne payez pas
                                une seconde fois.
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            {checkoutVisible ? (
                <div
                    className={`mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 ${confirmationPending
                        ? "pointer-events-none opacity-60"
                        : ""
                        }`}
                >
                    {!checkoutReady ? (
                        <div className="pb-4 text-center text-sm text-slate-500">
                            Chargement des
                            moyens de
                            paiement...
                        </div>
                    ) : null}

                    <div
                        id={containerId}
                        className="min-h-[120px]"
                    />
                </div>
            ) : null}

            <div className="mt-6">
                <div className="mb-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />

                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                        ou
                    </div>

                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3">
                        <div className="text-sm font-bold text-[#06101d]">
                            Payer avec PayPal
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Le montant correspond au
                            mode de paiement sélectionné
                            ci-dessus.
                        </p>
                    </div>

                    <PayPalPaymentButton
                        offerId={offerId}
                        paymentMode={paymentMode}
                        disabled={
                            loading ||
                            confirmationPending
                        }
                        onSuccess={
                            handlePayPalSuccess
                        }
                    />
                </div>
            </div>

            {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                </div>
            ) : null}
        </div>
    );
}