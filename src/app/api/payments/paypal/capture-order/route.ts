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
            "Erreur authentification PayPal capture :",
            data
        );

        throw new Error(
            "Impossible de s'authentifier auprès de PayPal."
        );
    }

    return data.access_token as string;
}

export async function POST(
    request: NextRequest
) {
    try {
        const body =
            await request.json();

        const paypalOrderId =
            typeof body.paypal_order_id ===
                "string"
                ? body.paypal_order_id
                : "";

        if (!paypalOrderId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Identifiant PayPal manquant.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            createServerSupabaseClient();

        // ================================================
        // RETROUVER NOTRE TRANSACTION
        // ================================================

        const {
            data: localPayment,
            error: paymentError,
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

        if (paymentError) {
            console.error(
                "Erreur lecture payment PayPal :",
                paymentError
            );

            throw new Error(
                "Impossible de retrouver le paiement PayPal."
            );
        }

        if (!localPayment) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Paiement PayPal inconnu.",
                },
                {
                    status: 404,
                }
            );
        }

        if (
            localPayment.status ===
            "succeeded"
        ) {
            return NextResponse.json({
                success: true,
                already_captured: true,
                order_id:
                    localPayment.order_id,
            });
        }

        // ================================================
        // AUTH PAYPAL
        // ================================================

        const accessToken =
            await getPayPalAccessToken();

        // ================================================
        // CAPTURE
        // ================================================

        const response = await fetch(
                    `${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(
                        paypalOrderId
                    )}/capture`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`,

                            "Content-Type":
                                "application/json",

                            Prefer:
                                "return=representation",
                        },

                        cache: "no-store",
                    }
                );

        const capture =
            await response.json();

        if (!response.ok) {
            console.error(
                "Erreur capture PayPal :",
                capture
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "PayPal a refusé la capture du paiement.",
                },
                {
                    status:
                        response.status,
                }
            );
        }

        /*
         * Une capture PayPal réussie doit
         * normalement retourner COMPLETED.
         */
        if (
            capture.status !==
            "COMPLETED"
        ) {
            console.error(
                "Statut capture PayPal inattendu :",
                capture.status
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le paiement PayPal n'est pas encore finalisé.",
                    paypal_status:
                        capture.status,
                },
                {
                    status: 409,
                }
            );
        }

        // ================================================
        // VÉRIFICATION DU MONTANT CAPTURÉ
        // ================================================

        const capturedAmount =
            Number(
                capture
                    ?.purchase_units?.[0]
                    ?.payments
                    ?.captures?.[0]
                    ?.amount
                    ?.value
            );

        const capturedCurrency =
            String(
                capture
                    ?.purchase_units?.[0]
                    ?.payments
                    ?.captures?.[0]
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
                capturedAmount
            ) ||
            Math.abs(
                capturedAmount -
                expectedAmount
            ) > 0.001 ||
            capturedCurrency !==
            expectedCurrency
        ) {
            console.error(
                "Capture PayPal incohérente :",
                {
                    capturedAmount,
                    expectedAmount,
                    capturedCurrency,
                    expectedCurrency,
                }
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le montant PayPal capturé ne correspond pas à la commande.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * IMPORTANT :
         *
         * Pour cette première intégration,
         * la capture API nous confirme que
         * PayPal a effectivement capturé
         * le paiement.
         *
         * Nous ajouterons ensuite le webhook
         * PayPal comme confirmation asynchrone
         * et mécanisme de réconciliation.
         */

        const {
            error: paymentUpdateError,
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

        if (paymentUpdateError) {
            console.error(
                "Erreur update payment PayPal :",
                paymentUpdateError
            );

            throw new Error(
                "Le paiement PayPal a été capturé mais son statut local n'a pas pu être mis à jour."
            );
        }

        const orderStatus =
            localPayment.payment_mode ===
                "deposit"
                ? "partially_paid"
                : "paid";

        const {
            error: orderUpdateError,
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

        if (orderUpdateError) {
            console.error(
                "Erreur update order PayPal :",
                orderUpdateError
            );

            throw new Error(
                "Le paiement PayPal a été capturé mais la commande locale n'a pas pu être mise à jour."
            );
        }

        return NextResponse.json({
            success: true,

            order: {
                id:
                    localPayment.order_id,

                merchant_order_id:
                    localPayment.merchant_order_id,

                status:
                    orderStatus,
            },

            payment: {
                provider:
                    "paypal",

                status:
                    "succeeded",

                amount:
                    capturedAmount,

                currency:
                    capturedCurrency,
            },

            paypal: {
                order_id:
                    paypalOrderId,

                status:
                    capture.status,
            },
        });
    } catch (error) {
        console.error(
            "Erreur capture-order PayPal :",
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Impossible de capturer le paiement PayPal.",
            },
            {
                status: 500,
            }
        );
    }
}