import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createHmac,
    timingSafeEqual,
} from "crypto";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_TOLERANCE_MS =
    5 * 60 * 1000;

function verifyAirwallexSignature({
    rawBody,
    timestamp,
    signature,
    secret,
}: {
    rawBody: string;
    timestamp: string;
    signature: string;
    secret: string;
}) {
    const timestampNumber =
        Number(timestamp);

    if (
        !Number.isFinite(
            timestampNumber
        )
    ) {
        return false;
    }

    const age =
        Math.abs(
            Date.now() -
            timestampNumber
        );

    if (
        age >
        WEBHOOK_TOLERANCE_MS
    ) {
        return false;
    }

    const expectedSignature =
        createHmac(
            "sha256",
            secret
        )
            .update(
                `${timestamp}${rawBody}`
            )
            .digest("hex");

    const receivedBuffer =
        Buffer.from(
            signature,
            "utf8"
        );

    const expectedBuffer =
        Buffer.from(
            expectedSignature,
            "utf8"
        );

    if (
        receivedBuffer.length !==
        expectedBuffer.length
    ) {
        return false;
    }

    return timingSafeEqual(
        receivedBuffer,
        expectedBuffer
    );
}

export async function POST(
    request: NextRequest
) {
    try {
        // IMPORTANT :
        // récupérer le corps BRUT avant JSON.parse().
        const rawBody =
            await request.text();

        const timestamp =
            request.headers.get(
                "x-timestamp"
            );

        const signature =
            request.headers.get(
                "x-signature"
            );

        const testSecret =
            request.headers.get(
                "client-secret-key"
            );

        const secret =
            testSecret ||
            process.env
                .AIRWALLEX_WEBHOOK_SECRET;

        if (!secret) {
            console.error(
                "AIRWALLEX_WEBHOOK_SECRET manquant."
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
            !timestamp ||
            !signature
        ) {
            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Signature webhook manquante.",
                },
                {
                    status: 400,
                }
            );
        }

        const validSignature =
            verifyAirwallexSignature({
                rawBody,
                timestamp,
                signature,
                secret,
            });

        if (!validSignature) {
            console.error(
                "Signature webhook Airwallex invalide."
            );

            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Signature invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        let event: any;

        try {
            event =
                JSON.parse(rawBody);
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

        const eventName =
            typeof event?.name ===
                "string"
                ? event.name
                : "";

        const paymentIntent =
            event?.data?.object;

        /*
         * Pour le moment nous traitons uniquement
         * les événements PaymentIntent utiles.
         *
         * Les autres événements sont acquittés
         * sans modifier Supabase.
         */
        const handledEvents = [
            "payment_intent.succeeded",
            "payment_intent.payment_failed",
            "payment_intent.cancelled",
        ];

        if (
            !handledEvents.includes(
                eventName
            )
        ) {
            return NextResponse.json({
                received: true,
                ignored: true,
            });
        }

        const providerPaymentId =
            typeof paymentIntent?.id ===
                "string"
                ? paymentIntent.id
                : "";

        const merchantOrderId =
            typeof paymentIntent?.merchant_order_id ===
                "string"
                ? paymentIntent.merchant_order_id
                : "";

        if (
            !providerPaymentId ||
            !merchantOrderId
        ) {
            console.error(
                "Webhook Airwallex incomplet :",
                {
                    eventName,
                    providerPaymentId,
                    merchantOrderId,
                }
            );

            return NextResponse.json(
                {
                    received: false,
                    error:
                        "PaymentIntent incomplet.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            createServerSupabaseClient();

        // =====================================================
        // RETROUVER LE PAIEMENT LOCAL
        // =====================================================

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
                "airwallex"
            )
            .eq(
                "provider_payment_id",
                providerPaymentId
            )
            .maybeSingle();

        if (paymentReadError) {
            console.error(
                "Erreur lecture paiement webhook :",
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

        if (!localPayment) {
            console.error(
                "Paiement Airwallex inconnu :",
                providerPaymentId
            );

            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Paiement inconnu.",
                },
                {
                    status: 404,
                }
            );
        }

        /*
         * Vérification supplémentaire :
         * l'identifiant de commande reçu doit être
         * celui que nous avons enregistré.
         */
        if (
            localPayment.merchant_order_id !==
            merchantOrderId
        ) {
            console.error(
                "merchant_order_id incohérent.",
                {
                    local:
                        localPayment.merchant_order_id,
                    airwallex:
                        merchantOrderId,
                }
            );

            return NextResponse.json(
                {
                    received: false,
                    error:
                        "Commande incohérente.",
                },
                {
                    status: 400,
                }
            );
        }

        // =====================================================
        // SUCCEEDED
        // =====================================================

        if (
            eventName ===
            "payment_intent.succeeded"
        ) {
            /*
             * Vérification montant + devise.
             *
             * On ne fait pas confiance uniquement
             * au statut reçu.
             */
            const receivedAmount =
                Number(
                    paymentIntent?.amount
                );

            const receivedCurrency =
                String(
                    paymentIntent?.currency ||
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
                    "Montant/devise webhook incohérent.",
                    {
                        receivedAmount,
                        expectedAmount,
                        receivedCurrency,
                        expectedCurrency,
                    }
                );

                return NextResponse.json(
                    {
                        received: false,
                        error:
                            "Montant ou devise incohérent.",
                    },
                    {
                        status: 400,
                    }
                );
            }

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
                    "Erreur update payment succeeded :",
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

            const orderStatus =
                localPayment.payment_mode ===
                    "deposit"
                    ? "partially_paid"
                    : "paid";

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
                    "Erreur update order succeeded :",
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
                processed: true,
                payment_status:
                    "succeeded",
                order_status:
                    orderStatus,
            });
        }

        // =====================================================
        // FAILED
        // =====================================================

        if (
            eventName ===
            "payment_intent.payment_failed"
        ) {
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
                    "Erreur update payment failed :",
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
                    "Erreur update order failed :",
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
                processed: true,
                payment_status:
                    "failed",
                order_status:
                    "failed",
            });
        }

        // =====================================================
        // CANCELLED
        // =====================================================

        if (
            eventName ===
            "payment_intent.cancelled"
        ) {
            const {
                error:
                paymentUpdateError,
            } = await supabase
                .from("payments")
                .update({
                    status:
                        "cancelled",
                })
                .eq(
                    "id",
                    localPayment.id
                );

            if (
                paymentUpdateError
            ) {
                console.error(
                    "Erreur update payment cancelled :",
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
                        "cancelled",
                })
                .eq(
                    "id",
                    localPayment.order_id
                );

            if (
                orderUpdateError
            ) {
                console.error(
                    "Erreur update order cancelled :",
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
                processed: true,
                payment_status:
                    "cancelled",
                order_status:
                    "cancelled",
            });
        }

        return NextResponse.json({
            received: true,
        });
    } catch (error) {
        console.error(
            "Erreur webhook Airwallex :",
            error
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