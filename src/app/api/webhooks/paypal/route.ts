import {
    NextRequest,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPayPalBaseUrl() {
    return process.env.PAYPAL_ENV ===
        "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken() {
    const clientId =
        process.env.PAYPAL_CLIENT_ID;

    const clientSecret =
        process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "Configuration PayPal manquante."
        );
    }

    const credentials =
        Buffer.from(
            `${clientId}:${clientSecret}`
        ).toString("base64");

    const response = await fetch(
        `${getPayPalBaseUrl()}/v1/oauth2/token`,
        {
            method: "POST",

            headers: {
                Authorization:
                    `Basic ${credentials}`,

                "Content-Type":
                    "application/x-www-form-urlencoded",
            },

            body:
                "grant_type=client_credentials",

            cache: "no-store",
        }
    );

    const data =
        await response.json();

    if (
        !response.ok ||
        !data.access_token
    ) {
        console.error(
            "Erreur OAuth webhook PayPal :",
            data
        );

        throw new Error(
            "Impossible de s'authentifier auprès de PayPal."
        );
    }

    return data.access_token as string;
}

type PayPalWebhookEvent = {
    id?: string;
    event_type?: string;

    resource?: {
        id?: string;
        status?: string;

        amount?: {
            currency_code?: string;
            value?: string;
        };

        custom_id?: string;

        supplementary_data?: {
            related_ids?: {
                order_id?: string;
            };
        };
    };
};

export async function POST(
    request: NextRequest
) {
    try {
        const webhookId =
            process.env.PAYPAL_WEBHOOK_ID;

        if (!webhookId) {
            return NextResponse.json(
                {
                    received: false,
                    error:
                        "PAYPAL_WEBHOOK_ID manquant.",
                },
                {
                    status: 500,
                }
            );
        }

        // ================================================
        // PAYLOAD + HEADERS PAYPAL
        // ================================================

        const rawBody =
            await request.text();

        let event: PayPalWebhookEvent;

        try {
            event =
                JSON.parse(
                    rawBody
                ) as PayPalWebhookEvent;
        } catch {
            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Payload JSON invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        const transmissionId =
            request.headers.get(
                "paypal-transmission-id"
            );

        const transmissionTime =
            request.headers.get(
                "paypal-transmission-time"
            );

        const transmissionSig =
            request.headers.get(
                "paypal-transmission-sig"
            );

        const certUrl =
            request.headers.get(
                "paypal-cert-url"
            );

        const authAlgo =
            request.headers.get(
                "paypal-auth-algo"
            );

        if (
            !transmissionId ||
            !transmissionTime ||
            !transmissionSig ||
            !certUrl ||
            !authAlgo
        ) {
            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Headers PayPal manquants.",
                },
                {
                    status: 400,
                }
            );
        }

        // ================================================
        // VÉRIFICATION OFFICIELLE DE LA SIGNATURE
        // ================================================

        const accessToken =
            await getPayPalAccessToken();

        const verifyResponse =
            await fetch(
                `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            auth_algo:
                                authAlgo,

                            cert_url:
                                certUrl,

                            transmission_id:
                                transmissionId,

                            transmission_sig:
                                transmissionSig,

                            transmission_time:
                                transmissionTime,

                            webhook_id:
                                webhookId,

                            webhook_event:
                                event,
                        }),

                    cache: "no-store",
                }
            );

        const verification =
            await verifyResponse.json();

        if (
            !verifyResponse.ok ||
            verification
                .verification_status !==
            "SUCCESS"
        ) {
            console.error(
                "Signature webhook PayPal invalide :",
                verification
            );

            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Signature PayPal invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        console.log(
            "[PayPal webhook vérifié]",
            {
                id:
                    event.id,
                event_type:
                    event.event_type,
            }
        );

        // ================================================
        // ÉVÉNEMENTS NON TRAITÉS
        // ================================================

        const handledEvents = [
            "PAYMENT.CAPTURE.COMPLETED",
            "PAYMENT.CAPTURE.DECLINED",
            "PAYMENT.CAPTURE.PENDING",
            "PAYMENT.CAPTURE.REFUNDED",
            "PAYMENT.CAPTURE.REVERSED",
        ];

        if (
            !event.event_type ||
            !handledEvents.includes(
                event.event_type
            )
        ) {
            return NextResponse.json({
                received: true,
                verified: true,
                ignored: true,
                event_type:
                    event.event_type ||
                    null,
            });
        }

        const paypalOrderId =
            event.resource
                ?.supplementary_data
                ?.related_ids
                ?.order_id;

        if (!paypalOrderId) {
            console.error(
                "Order ID PayPal absent du webhook.",
                {
                    eventId:
                        event.id,
                    eventType:
                        event.event_type,
                }
            );

            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Order ID PayPal manquant.",
                },
                {
                    status: 400,
                }
            );
        }

        // ================================================
        // RETROUVER LE PAIEMENT LOCAL
        // ================================================

        const supabase =
            createServerSupabaseClient();

        const {
            data: localPayment,
            error: paymentReadError,
        } = await supabase
            .from("payments")
            .select(`
                id,
                order_id,
                provider,
                provider_payment_id,
                merchant_order_id,
                payment_mode,
                amount,
                currency,
                status
            `)
            .eq(
                "provider",
                "paypal"
            )
            .eq(
                "provider_payment_id",
                paypalOrderId
            )
            .maybeSingle();

        if (paymentReadError) {
            console.error(
                "Erreur lecture paiement webhook PayPal :",
                paymentReadError
            );

            return NextResponse.json(
                {
                    received: false,
                },
                {
                    status: 500,
                }
            );
        }

        /*
         * Un webhook authentique peut arriver
         * pour une transaction qui ne provient
         * pas de ce checkout PaxSolutio.
         *
         * On l'acquitte sans modifier la base.
         */
        if (!localPayment) {
            console.warn(
                "Webhook PayPal sans paiement PaxSolutio correspondant :",
                {
                    paypalOrderId,
                    eventId:
                        event.id,
                }
            );

            return NextResponse.json({
                received: true,
                verified: true,
                ignored: true,
                reason:
                    "payment_not_found",
            });
        }

        // ================================================
        // COMPLETED
        // ================================================

        if (
            event.event_type ===
            "PAYMENT.CAPTURE.COMPLETED"
        ) {
            const resourceStatus =
                String(
                    event.resource
                        ?.status ||
                    ""
                ).toUpperCase();

            if (
                resourceStatus !==
                "COMPLETED"
            ) {
                console.error(
                    "Statut PayPal incohérent pour PAYMENT.CAPTURE.COMPLETED :",
                    resourceStatus
                );

                return NextResponse.json(
                    {
                        received: false,
                        error:
                            "Statut PayPal incohérent.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const receivedAmount =
                Number(
                    event.resource
                        ?.amount
                        ?.value
                );

            const receivedCurrency =
                String(
                    event.resource
                        ?.amount
                        ?.currency_code ||
                    ""
                ).toUpperCase();

            const expectedAmount =
                Number(
                    localPayment.amount
                );

            const expectedCurrency =
                String(
                    localPayment.currency ||
                    ""
                ).toUpperCase();

            if (
                !Number.isFinite(
                    receivedAmount
                ) ||
                Math.abs(
                    receivedAmount -
                    expectedAmount
                ) > 0.001 ||
                receivedCurrency !==
                expectedCurrency
            ) {
                console.error(
                    "Montant/devise webhook PayPal incohérent :",
                    {
                        receivedAmount,
                        expectedAmount,
                        receivedCurrency,
                        expectedCurrency,
                        paypalOrderId,
                    }
                );

                return NextResponse.json(
                    {
                        received: false,
                        error:
                            "Montant ou devise PayPal incohérent.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            /*
             * Idempotence :
             * capture-order a probablement
             * déjà mis le paiement à succeeded.
             *
             * On peut néanmoins appliquer
             * les mêmes états sans risque.
             */

            if (
                localPayment.status !==
                "succeeded"
            ) {
                const {
                    error:
                    paymentUpdateError,
                } = await supabase
                    .from("payments")
                    .update({
                        status:
                            "succeeded",
                    })
                    .eq(
                        "id",
                        localPayment.id
                    );

                if (
                    paymentUpdateError
                ) {
                    console.error(
                        "Erreur update payment webhook PayPal :",
                        paymentUpdateError
                    );

                    return NextResponse.json(
                        {
                            received: false,
                        },
                        {
                            status: 500,
                        }
                    );
                }
            }

            const orderStatus =
                localPayment.payment_mode ===
                    "deposit"
                    ? "partially_paid"
                    : "paid";

            const {
                data: localOrder,
                error: orderReadError,
            } = await supabase
                .from("orders")
                .select(`
                    id,
                    status
                `)
                .eq(
                    "id",
                    localPayment.order_id
                )
                .maybeSingle();

            if (
                orderReadError ||
                !localOrder
            ) {
                console.error(
                    "Erreur lecture order webhook PayPal :",
                    orderReadError
                );

                return NextResponse.json(
                    {
                        received: false,
                    },
                    {
                        status: 500,
                    }
                );
            }

            if (
                localOrder.status !==
                orderStatus
            ) {
                const {
                    error:
                    orderUpdateError,
                } = await supabase
                    .from("orders")
                    .update({
                        status:
                            orderStatus,
                    })
                    .eq(
                        "id",
                        localPayment.order_id
                    );

                if (
                    orderUpdateError
                ) {
                    console.error(
                        "Erreur update order webhook PayPal :",
                        orderUpdateError
                    );

                    return NextResponse.json(
                        {
                            received: false,
                        },
                        {
                            status: 500,
                        }
                    );
                }
            }

            console.log(
                "[PayPal webhook réconcilié]",
                {
                    eventId:
                        event.id,
                    paypalOrderId,
                    paymentMode:
                        localPayment.payment_mode,
                    paymentStatus:
                        "succeeded",
                    orderStatus,
                }
            );

            return NextResponse.json({
                received: true,
                verified: true,
                processed: true,

                event_type:
                    event.event_type,

                payment_status:
                    "succeeded",

                order_status:
                    orderStatus,
            });
        }

        // ================================================
        // PENDING
        // ================================================

        if (
            event.event_type ===
            "PAYMENT.CAPTURE.PENDING"
        ) {
            /*
             * Notre enum payments accepte
             * déjà "pending".
             */
            if (
                localPayment.status !==
                "succeeded" &&
                localPayment.status !==
                "pending"
            ) {
                const {
                    error:
                    paymentUpdateError,
                } = await supabase
                    .from("payments")
                    .update({
                        status:
                            "pending",
                    })
                    .eq(
                        "id",
                        localPayment.id
                    );

                if (
                    paymentUpdateError
                ) {
                    console.error(
                        "Erreur update payment pending PayPal :",
                        paymentUpdateError
                    );

                    return NextResponse.json(
                        {
                            received: false,
                        },
                        {
                            status: 500,
                        }
                    );
                }
            }

            return NextResponse.json({
                received: true,
                verified: true,
                processed: true,
                payment_status:
                    localPayment.status ===
                        "succeeded"
                        ? "succeeded"
                        : "pending",
            });
        }

        // ================================================
        // DECLINED
        // ================================================

        if (
            event.event_type ===
            "PAYMENT.CAPTURE.DECLINED"
        ) {
            /*
             * Ne jamais rétrograder un paiement
             * déjà confirmé comme succeeded à
             * cause d'un événement tardif.
             */
            if (
                localPayment.status ===
                "succeeded"
            ) {
                return NextResponse.json({
                    received: true,
                    verified: true,
                    ignored: true,
                    reason:
                        "payment_already_succeeded",
                });
            }

            const {
                error:
                paymentUpdateError,
            } = await supabase
                .from("payments")
                .update({
                    status:
                        "failed",
                })
                .eq(
                    "id",
                    localPayment.id
                );

            if (
                paymentUpdateError
            ) {
                console.error(
                    "Erreur update payment declined PayPal :",
                    paymentUpdateError
                );

                return NextResponse.json(
                    {
                        received: false,
                    },
                    {
                        status: 500,
                    }
                );
            }

            const {
                error:
                orderUpdateError,
            } = await supabase
                .from("orders")
                .update({
                    status:
                        "failed",
                })
                .eq(
                    "id",
                    localPayment.order_id
                );

            if (
                orderUpdateError
            ) {
                console.error(
                    "Erreur update order declined PayPal :",
                    orderUpdateError
                );

                return NextResponse.json(
                    {
                        received: false,
                    },
                    {
                        status: 500,
                    }
                );
            }

            return NextResponse.json({
                received: true,
                verified: true,
                processed: true,
                payment_status:
                    "failed",
                order_status:
                    "failed",
            });
        }

        // ================================================
        // REFUNDED
        // ================================================

        if (
            event.event_type ===
            "PAYMENT.CAPTURE.REFUNDED"
        ) {
            /*
             * Un remboursement intervient après une capture
             * réussie. Contrairement à DECLINED, il est donc
             * normal de faire évoluer un paiement succeeded
             * vers refunded.
             *
             * Le traitement reste idempotent :
             * refunded -> refunded ne provoque aucune
             * modification supplémentaire.
             */

            if (
                localPayment.status !==
                "refunded"
            ) {
                const {
                    error:
                    paymentUpdateError,
                } = await supabase
                    .from("payments")
                    .update({
                        status:
                            "refunded",
                    })
                    .eq(
                        "id",
                        localPayment.id
                    );

                if (
                    paymentUpdateError
                ) {
                    console.error(
                        "Erreur update payment refunded PayPal :",
                        paymentUpdateError
                    );

                    return NextResponse.json(
                        {
                            received: false,
                        },
                        {
                            status: 500,
                        }
                    );
                }
            }

            const {
                error:
                orderUpdateError,
            } = await supabase
                .from("orders")
                .update({
                    status:
                        "refunded",
                })
                .eq(
                    "id",
                    localPayment.order_id
                );

            if (
                orderUpdateError
            ) {
                console.error(
                    "Erreur update order refunded PayPal :",
                    orderUpdateError
                );

                return NextResponse.json(
                    {
                        received: false,
                    },
                    {
                        status: 500,
                    }
                );
            }

            console.log(
                "[PayPal remboursement réconcilié]",
                {
                    eventId:
                        event.id,
                    paypalOrderId,
                    paymentStatus:
                        "refunded",
                    orderStatus:
                        "refunded",
                }
            );

            return NextResponse.json({
                received: true,
                verified: true,
                processed: true,
                event_type:
                    event.event_type,
                payment_status:
                    "refunded",
                order_status:
                    "refunded",
            });
        }

        // ================================================
        // REVERSED
        // ================================================

        if (
            event.event_type ===
            "PAYMENT.CAPTURE.REVERSED"
        ) {
            /*
             * Une inversion peut intervenir après une capture
             * réussie.
             *
             * On conserve "reversed" sur le paiement
             * et "refunded" sur la commande.
             */

            if (
                localPayment.status !==
                "reversed"
            ) {
                const {
                    error:
                    paymentUpdateError,
                } = await supabase
                    .from("payments")
                    .update({
                        status:
                            "reversed",
                    })
                    .eq(
                        "id",
                        localPayment.id
                    );

                if (
                    paymentUpdateError
                ) {
                    console.error(
                        "Erreur update payment reversed PayPal :",
                        paymentUpdateError
                    );

                    return NextResponse.json(
                        {
                            received: false,
                        },
                        {
                            status: 500,
                        }
                    );
                }
            }

            const {
                error:
                orderUpdateError,
            } = await supabase
                .from("orders")
                .update({
                    status:
                        "refunded",
                })
                .eq(
                    "id",
                    localPayment.order_id
                );

            if (
                orderUpdateError
            ) {
                console.error(
                    "Erreur update order reversed PayPal :",
                    orderUpdateError
                );

                return NextResponse.json(
                    {
                        received: false,
                    },
                    {
                        status: 500,
                    }
                );
            }

            console.log(
                "[PayPal reversal réconcilié]",
                {
                    eventId:
                        event.id,
                    paypalOrderId,
                    paymentStatus:
                        "reversed",
                    orderStatus:
                        "refunded",
                }
            );

            return NextResponse.json({
                received: true,
                verified: true,
                processed: true,
                event_type:
                    event.event_type,
                payment_status:
                    "reversed",
                order_status:
                    "refunded",
            });
        }

        // ================================================
        // FALLBACK ÉVÉNEMENT VÉRIFIÉ
        // ================================================

        return NextResponse.json({
            received: true,
            verified: true,
        });
    } catch (error) {
        console.error(
            "Erreur webhook PayPal :",
            error
        );

        return NextResponse.json(
            {
                received: false,
                error:
                    "Impossible de traiter le webhook PayPal.",
            },
            {
                status: 500,
            }
        );
    }
}