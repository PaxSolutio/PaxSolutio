import {
  NextRequest,
  NextResponse,
} from "next/server";

import { randomUUID } from "crypto";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentMode =
  | "full"
  | "deposit";

function getAirwallexBaseUrl() {
  return process.env.AIRWALLEX_ENV ===
    "production"
    ? "https://api.airwallex.com"
    : "https://api.sandbox.airwallex.com";
}

async function getAirwallexAccessToken() {
  const clientId =
    process.env.AIRWALLEX_CLIENT_ID;

  const apiKey =
    process.env.AIRWALLEX_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error(
      "Configuration Airwallex manquante."
    );
  }

  const response = await fetch(
    `${getAirwallexBaseUrl()}/api/v1/authentication/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "x-client-id":
          clientId,

        "x-api-key":
          apiKey,
      },

      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      "Erreur authentification Airwallex :",
      data
    );

    throw new Error(
      "Impossible de s'authentifier auprès d'Airwallex."
    );
  }

  if (!data.token) {
    throw new Error(
      "Airwallex n'a retourné aucun access token."
    );
  }

  return data.token as string;
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

    // =====================================================
    // OFFRE
    // =====================================================

    const supabase =
      createServerSupabaseClient();

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
      .eq("id", offerId)
      .maybeSingle();

    if (offerError) {
      console.error(
        "Erreur lecture offre :",
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

    // =====================================================
    // CALCUL SERVEUR
    // =====================================================

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
      paymentMode ===
      "deposit"
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

    // =====================================================
    // IDENTIFIANT COMMANDE PAXSOLUTIO
    // =====================================================

    const merchantOrderId =
      `PS-${offer.id.slice(
        0,
        8
      )}-${Date.now()}`;

    // =====================================================
    // AUTH AIRWALLEX
    // =====================================================

    const accessToken =
      await getAirwallexAccessToken();

    // =====================================================
    // PAYMENT INTENT AIRWALLEX
    // =====================================================

    const requestId =
      randomUUID();

    const origin =
      request.nextUrl.origin;

    const returnUrl =
      `${origin}/offres/${offer.slug}?payment=return`;

    const airwallexResponse =
      await fetch(
        `${getAirwallexBaseUrl()}/api/v1/pa/payment_intents/create`,
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
              request_id:
                requestId,

              merchant_order_id:
                merchantOrderId,

              amount,

              currency,

              return_url:
                returnUrl,

              metadata: {
                offer_id:
                  offer.id,

                offer_slug:
                  offer.slug,

                payment_mode:
                  paymentMode,

                source:
                  "paxsolutio_website",
              },
            }),

          cache: "no-store",
        }
      );

    const paymentIntent =
      await airwallexResponse.json();

    if (
      !airwallexResponse.ok
    ) {
      console.error(
        "Erreur création PaymentIntent Airwallex :",
        paymentIntent
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Airwallex a refusé la création du paiement.",
        },
        {
          status:
            airwallexResponse.status,
        }
      );
    }

    if (
      !paymentIntent.id ||
      !paymentIntent.client_secret
    ) {
      console.error(
        "PaymentIntent Airwallex incomplet :",
        {
          id:
            paymentIntent.id,
          hasClientSecret:
            Boolean(
              paymentIntent.client_secret
            ),
        }
      );

      throw new Error(
        "Airwallex a retourné un PaymentIntent incomplet."
      );
    }

    // =====================================================
    // COMMANDE PAXSOLUTIO
    // =====================================================

    const {
      data: order,
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

    if (orderError || !order) {
      console.error(
        "Erreur création commande Supabase :",
        orderError
      );

      throw new Error(
        "Le paiement a été préparé mais la commande n'a pas pu être enregistrée."
      );
    }

    // =====================================================
    // TRANSACTION PAXSOLUTIO
    // =====================================================

    const {
      error: paymentError,
    } = await supabase
      .from("payments")
      .insert({
        order_id:
          order.id,

        provider:
          "airwallex",

        provider_payment_id:
          paymentIntent.id,

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
        "Erreur création paiement Supabase :",
        paymentError
      );

      // Nettoyage de la commande orpheline.
      const {
        error: cleanupError,
      } = await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      if (cleanupError) {
        console.error(
          "Erreur nettoyage commande orpheline :",
          cleanupError
        );
      }

      throw new Error(
        "Le paiement a été préparé mais son enregistrement local a échoué."
      );
    }

    // =====================================================
    // RÉPONSE AU FRONTEND
    // =====================================================

    return NextResponse.json({
      success: true,
      environment:
        process.env.AIRWALLEX_ENV ===
          "production"
          ? "prod"
          : "demo",

      order: {
        id:
          order.id,

        merchant_order_id:
          merchantOrderId,
      },

      payment: {
        id:
          paymentIntent.id,

        client_secret:
          paymentIntent.client_secret,

        amount,

        currency,

        mode:
          paymentMode,

        merchant_order_id:
          merchantOrderId,
      },
    });
  } catch (error) {
    console.error(
      "Erreur create-intent Airwallex :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer le paiement.",
      },
      {
        status: 500,
      }
    );
  }
}