"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

type PaymentMode =
    | "full"
    | "deposit";

type PayPalPaymentButtonProps = {
    offerId: string;
    paymentMode: PaymentMode;

    disabled?: boolean;

    onSuccess: (result: {
        orderId: string;
        merchantOrderId: string;
        mode: PaymentMode;
        amount: number;
        currency: string;
    }) => void;
};

type PayPalWindow =
    Window & {
        paypal?: {
            Buttons: (
                options: Record<
                    string,
                    unknown
                >
            ) => {
                render: (
                    target:
                        HTMLElement
                ) => Promise<void>;
                close?: () =>
                    Promise<void>;
            };
        };
    };

type CreateOrderResponse = {
    success?: boolean;

    order?: {
        id?: string;
        merchant_order_id?: string;
    };

    paypal?: {
        order_id?: string;
    };

    amount?: number;
    currency?: string;
    mode?: PaymentMode;

    error?: string;
};

type CaptureResponse = {
    success?: boolean;

    order?: {
        id?: string;
        merchant_order_id?: string;
        status?: string;
    };

    payment?: {
        provider?: string;
        status?: string;
        amount?: number;
        currency?: string;
    };

    paypal?: {
        order_id?: string;
        status?: string;
    };

    error?: string;
};

export default function PayPalPaymentButton({
    offerId,
    paymentMode,
    disabled = false,
    onSuccess,
}: PayPalPaymentButtonProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(
            null
        );

    const buttonsRef =
        useRef<{
            close?: () =>
                Promise<void>;
        } | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadPayPal() {
            setLoading(true);
            setError(null);

            try {
                /*
                 * 1. Récupérer uniquement le
                 * Client ID public.
                 */
                const configResponse =
                    await fetch(
                        "/api/payments/paypal/config",
                        {
                            cache:
                                "no-store",
                        }
                    );

                const config =
                    await configResponse.json();

                if (
                    !configResponse.ok ||
                    !config.success ||
                    !config.client_id
                ) {
                    throw new Error(
                        config.error ||
                        "Configuration PayPal indisponible."
                    );
                }

                if (cancelled) {
                    return;
                }

                /*
                 * 2. Charger le SDK PayPal
                 * une seule fois.
                 */
                const paypalWindow =
                    window as PayPalWindow;

                if (
                    !paypalWindow.paypal
                ) {
                    await new Promise<void>(
                        (
                            resolve,
                            reject
                        ) => {
                            const existing =
                                document.querySelector<HTMLScriptElement>(
                                    'script[data-paxsolutio-paypal="true"]'
                                );

                            if (existing) {
                                if (
                                    paypalWindow.paypal
                                ) {
                                    resolve();
                                    return;
                                }

                                existing.addEventListener(
                                    "load",
                                    () =>
                                        resolve(),
                                    {
                                        once: true,
                                    }
                                );

                                existing.addEventListener(
                                    "error",
                                    () =>
                                        reject(
                                            new Error(
                                                "Impossible de charger PayPal."
                                            )
                                        ),
                                    {
                                        once: true,
                                    }
                                );

                                return;
                            }

                            const script =
                                document.createElement(
                                    "script"
                                );

                            script.src =
                                `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
                                    config.client_id
                                )}&currency=EUR&intent=capture`;

                            script.async =
                                true;

                            script.dataset.paxsolutioPaypal =
                                "true";

                            script.onload =
                                () =>
                                    resolve();

                            script.onerror =
                                () =>
                                    reject(
                                        new Error(
                                            "Impossible de charger le SDK PayPal."
                                        )
                                    );

                            document.head.appendChild(
                                script
                            );
                        }
                    );
                }

                if (cancelled) {
                    return;
                }

                if (
                    !paypalWindow.paypal ||
                    !containerRef.current
                ) {
                    throw new Error(
                        "PayPal n'est pas disponible."
                    );
                }

                /*
                 * Nettoyage avant un nouveau
                 * rendu des boutons.
                 */
                containerRef.current.innerHTML =
                    "";

                const buttons =
                    paypalWindow.paypal.Buttons(
                        {
                            style: {
                                layout:
                                    "vertical",
                                shape:
                                    "pill",
                                label:
                                    "paypal",
                                height:
                                    45,
                            },

                            /*
                             * Le montant n'est
                             * jamais envoyé par
                             * le navigateur.
                             */
                            createOrder:
                                async () => {
                                    setError(
                                        null
                                    );

                                    const response =
                                        await fetch(
                                            "/api/payments/paypal/create-order",
                                            {
                                                method:
                                                    "POST",

                                                headers:
                                                {
                                                    "Content-Type":
                                                        "application/json",
                                                },

                                                body:
                                                    JSON.stringify(
                                                        {
                                                            offer_id:
                                                                offerId,

                                                            payment_mode:
                                                                paymentMode,
                                                        }
                                                    ),
                                            }
                                        );

                                    const data =
                                        (await response.json()) as CreateOrderResponse;

                                    if (
                                        !response.ok ||
                                        !data.success ||
                                        !data
                                            .paypal
                                            ?.order_id
                                    ) {
                                        throw new Error(
                                            data.error ||
                                            "Impossible de créer le paiement PayPal."
                                        );
                                    }

                                    return data
                                        .paypal
                                        .order_id;
                                },

                            onApprove:
                                async (
                                    data: unknown
                                ) => {
                                    console.log(
                                        "[PayPal] onApprove",
                                        data
                                    );
                                    const approval =
                                        data as {
                                            orderID?: string;
                                        };

                                    if (
                                        !approval.orderID
                                    ) {
                                        throw new Error(
                                            "Identifiant PayPal manquant après approbation."
                                        );
                                    }

                                    setError(
                                        null
                                    );

                                    const response =
                                        await fetch(
                                            "/api/payments/paypal/capture-order",
                                            {
                                                method:
                                                    "POST",

                                                headers:
                                                {
                                                    "Content-Type":
                                                        "application/json",
                                                },

                                                body:
                                                    JSON.stringify(
                                                        {
                                                            paypal_order_id:
                                                                approval.orderID,
                                                        }
                                                    ),
                                            }
                                        );

                                    const result =
                                        (await response.json()) as CaptureResponse;

                                    if (
                                        !response.ok ||
                                        !result.success ||
                                        !result
                                            .order
                                            ?.id ||
                                        !result
                                            .payment
                                            ?.amount
                                    ) {
                                        throw new Error(
                                            result.error ||
                                            "Le paiement PayPal n'a pas pu être confirmé."
                                        );
                                    }

                                    onSuccess({
                                        orderId:
                                            result
                                                .order
                                                .id,

                                        merchantOrderId:
                                            result
                                                .order
                                                .merchant_order_id ||
                                            "",

                                        mode:
                                            paymentMode,

                                        amount:
                                            Number(
                                                result
                                                    .payment
                                                    .amount
                                            ),

                                        currency:
                                            result
                                                .payment
                                                .currency ||
                                            "EUR",
                                    });
                                },

                            onCancel:
                                () => {
                                    console.log(
                                        "[PayPal] onCancel"
                                    );
                                    setError(
                                        "Paiement PayPal annulé. Aucun paiement n'a été effectué."
                                    );
                                },

                            onError:
                                (
                                    paypalError:
                                        unknown
                                ) => {
                                    console.error(
                                        "Erreur PayPal :",
                                        paypalError
                                    );

                                    setError(
                                        "Une erreur PayPal est survenue. Vous pouvez réessayer."
                                    );
                                },
                        }
                    );

                buttonsRef.current =
                    buttons;

                await buttons.render(
                    containerRef.current
                );

                if (
                    !cancelled
                ) {
                    setLoading(
                        false
                    );
                }
            } catch (err) {
                console.error(
                    "Erreur initialisation PayPal :",
                    err
                );

                if (
                    !cancelled
                ) {
                    setLoading(
                        false
                    );

                    setError(
                        err instanceof
                            Error
                            ? err.message
                            : "Impossible de charger PayPal."
                    );
                }
            }
        }

        void loadPayPal();

        return () => {
            cancelled = true;

            try {
                void buttonsRef.current?.close?.();
            } catch {
                // Rien à faire.
            }

            buttonsRef.current =
                null;
        };
    }, [
        offerId,
        paymentMode,
        onSuccess,
    ]);

    return (
        <div
            className={
                disabled
                    ? "pointer-events-none opacity-60"
                    : ""
            }
        >
            {loading ? (
                <div className="py-3 text-center text-sm text-slate-500">
                    Chargement de
                    PayPal...
                </div>
            ) : null}

            <div
                ref={containerRef}
                className="min-h-[45px]"
            />

            {error ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                    {error}
                </div>
            ) : null}
        </div>
    );
}