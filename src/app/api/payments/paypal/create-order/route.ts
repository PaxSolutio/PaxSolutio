import {
    NextRequest,
    NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentMode =
    | "full"
    | "deposit";

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
            "Erreur authentification PayPal :",
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

        const offerId =
            typeof body.offer_id ===
                "string"
                ? body.offer_id
                : "";

        const paymentMode:
            PaymentMode | null =
            body.payment_mode === "full" ||
                body.payment_mode === "deposit"
                ? body.payment_mode
                : null;

        if (!offerId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Offre manquante.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!paymentMode) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Mode de paiement invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        const supabase =
            createServerSupabaseClient();

        // =================================================
        // OFFRE
        // =================================================

        const {
            data: offer,
            error: offerError,
        } = await supabase
            .from("commercial_offers")
            .select(`
                id,
                title,
                slug,
                currency,
                status,
                payment_enabled,
                payment_price,
                full_payment_enabled,
                deposit_enabled,
                deposit_type,
                deposit_percent,
                deposit_amount
            `)
            .eq(
                "id",
                offerId
            )
            .maybeSingle();

        if (offerError) {
            console.error(
                "Erreur lecture offre PayPal :",
                offerError
            );

            throw new Error(
                "Impossible de charger l'offre."
            );
        }

        if (!offer) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Offre introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        if (
            offer.status !==
            "published" ||
            !offer.payment_enabled
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Le paiement n'est pas disponible pour cette offre.",
                },
                {
                    status: 400,
                }
            );
        }

        const totalPrice =
            Number(
                offer.payment_price
            );

        if (
            !Number.isFinite(
                totalPrice
            ) ||
            totalPrice <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Prix de paiement invalide.",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // CALCUL SERVEUR
        // =================================================

        let amount =
            totalPrice;

        if (
            paymentMode === "full"
        ) {
            if (
                !offer.full_payment_enabled
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Le paiement intégral n'est pas disponible.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        if (
            paymentMode === "deposit"
        ) {
            if (
                !offer.deposit_enabled
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Le paiement par acompte n'est pas disponible.",
                    },
                    {
                        status: 400,
                    }
                );
            }

            if (
                offer.deposit_type ===
                "percent"
            ) {
                const percent =
                    Number(
                        offer.deposit_percent
                    );

                if (
                    !Number.isFinite(
                        percent
                    ) ||
                    percent <= 0 ||
                    percent >= 100
                ) {
                    throw new Error(
                        "Pourcentage d'acompte invalide."
                    );
                }

                amount =
                    totalPrice *
                    (percent / 100);
            } else {
                const fixedAmount =
                    Number(
                        offer.deposit_amount
                    );

                if (
                    !Number.isFinite(
                        fixedAmount
                    ) ||
                    fixedAmount <= 0 ||
                    fixedAmount >=
                    totalPrice
                ) {
                    throw new Error(
                        "Montant d'acompte invalide."
                    );
                }

                amount =
                    fixedAmount;
            }
        }

        amount =
            Math.round(
                amount * 100
            ) / 100;

        const currency =
            (
                offer.currency ||
                "EUR"
            ).toUpperCase();

        // =================================================
        // PAYPAL
        // =================================================

        const accessToken =
            await getPayPalAccessToken();

        const response =
            await fetch(
                `${getPayPalBaseUrl()}/v2/checkout/orders`,
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

                    body:
                        JSON.stringify({
                            intent:
                                "CAPTURE",

                            purchase_units: [
                                {
                                    reference_id:
                                        offer.id,

                                    description:
                                        offer.title,

                                    custom_id:
                                        `${offer.id}:${paymentMode}`,

                                    amount: {
                                        currency_code:
                                            currency,

                                        value:
                                            amount.toFixed(
                                                2
                                            ),
                                    },
                                },
                            ],

                            payment_source: {
                                paypal: {
                                    experience_context: {
                                        brand_name:
                                            "PaxSolutio",

                                        locale:
                                            "fr-FR",

                                        landing_page:
                                            "LOGIN",

                                        user_action:
                                            "PAY_NOW",

                                        shipping_preference:
                                            "NO_SHIPPING",
                                    },
                                },
                            },
                        }),

                    cache: "no-store",
                }
            );

        const paypalOrder =
            await response.json();

        if (!response.ok) {
            console.error(
                "Erreur création order PayPal :",
                paypalOrder
            );

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "PayPal a refusé la création du paiement.",
                },
                {
                    status:
                        response.status,
                }
            );
        }

        if (!paypalOrder.id) {
            throw new Error(
                "PayPal n'a retourné aucun identifiant de commande."
            );
        }

        // =================================================
        // ORDER PAXSOLUTIO
        // =================================================

        const merchantOrderId =
            `PP-${offer.id.slice(
                0,
                8
            )}-${Date.now()}`;

        const {
            data: localOrder,
            error: orderError,
        } = await supabase
            .from("orders")
            .insert({
                offer_id:
                    offer.id,

                merchant_order_id:
                    merchantOrderId,

                payment_mode:
                    paymentMode,

                amount,

                currency,

                status:
                    "pending",
            })
            .select("id")
            .single();

        if (
            orderError ||
            !localOrder
        ) {
            console.error(
                "Erreur création commande PayPal Supabase :",
                orderError
            );

            throw new Error(
                "Le paiement PayPal a été préparé mais la commande n'a pas pu être enregistrée."
            );
        }

        // =================================================
        // PAYMENT PAXSOLUTIO
        // =================================================

        const {
            error: paymentError,
        } = await supabase
            .from("payments")
            .insert({
                order_id:
                    localOrder.id,

                provider:
                    "paypal",

                provider_payment_id:
                    paypalOrder.id,

                merchant_order_id:
                    merchantOrderId,

                payment_mode:
                    paymentMode,

                amount,

                currency,

                status:
                    "created",
            });

        if (paymentError) {
            console.error(
                "Erreur création payment PayPal Supabase :",
                paymentError
            );

            const {
                error: cleanupError,
            } = await supabase
                .from("orders")
                .delete()
                .eq(
                    "id",
                    localOrder.id
                );

            if (cleanupError) {
                console.error(
                    "Erreur nettoyage commande PayPal :",
                    cleanupError
                );
            }

            throw new Error(
                "Le paiement PayPal a été préparé mais son enregistrement local a échoué."
            );
        }

        return NextResponse.json({
            success: true,

            order: {
                id:
                    localOrder.id,

                merchant_order_id:
                    merchantOrderId,
            },

            paypal: {
                order_id:
                    paypalOrder.id,
            },

            amount,

            currency,

            mode:
                paymentMode,
        });
    } catch (error) {
        console.error(
            "Erreur create-order PayPal :",
            error
        );

        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Impossible de créer le paiement PayPal.",
            },
            {
                status: 500,
            }
        );
    }
}