import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{
      orderId: string;
    }>;
  }
) {
  try {
    const { orderId } =
      await context.params;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Identifiant de commande manquant.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createServerSupabaseClient();

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(`
        id,
        merchant_order_id,
        payment_mode,
        amount,
        currency,
        status,
        created_at,
        updated_at
      `)
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Erreur lecture statut commande :",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de vérifier la commande.",
        },
        {
          status: 500,
        }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Commande introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: payment,
      error: paymentError,
    } = await supabase
      .from("payments")
      .select(`
        id,
        provider,
        payment_mode,
        amount,
        currency,
        status,
        created_at,
        updated_at
      `)
      .eq(
        "order_id",
        order.id
      )
      .eq(
        "provider",
        "airwallex"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      console.error(
        "Erreur lecture statut paiement :",
        paymentError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Impossible de vérifier le paiement.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,

      order: {
        id:
          order.id,

        merchant_order_id:
          order.merchant_order_id,

        payment_mode:
          order.payment_mode,

        amount:
          Number(
            order.amount
          ),

        currency:
          order.currency,

        status:
          order.status,
      },

      payment: payment
        ? {
            id:
              payment.id,

            provider:
              payment.provider,

            status:
              payment.status,

            amount:
              Number(
                payment.amount
              ),

            currency:
              payment.currency,
          }
        : null,

      confirmed:
        order.status ===
          "paid" ||
        order.status ===
          "partially_paid",
    });
  } catch (error) {
    console.error(
      "Erreur status paiement :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Impossible de vérifier le statut du paiement.",
      },
      {
        status: 500,
      }
    );
  }
}