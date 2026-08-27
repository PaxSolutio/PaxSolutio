import { sendLeadNotification } from "@/lib/notifications/sendLeadNotification";

import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import type {
  LeadPayload,
  LeadType,
} from "@/types/lead";

const allowedTypes: LeadType[] = [
  "general",
  "sourcing",
  "automotive",
  "logistics",
  "quality",
  "supplier",
  "dropshipping",
];

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(
  value: unknown,
  maxLength: number
) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();

  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    /*
     * On refuse les requêtes anormalement grosses.
     */

    const contentLength =
      request.headers.get("content-length");

    if (
      contentLength &&
      Number(contentLength) > 50_000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Requête trop volumineuse.",
        },
        {
          status: 413,
        }
      );
    }

    const body: LeadPayload =
      await request.json();

    /*
     * HONEYPOT
     *
     * Un utilisateur normal ne voit jamais ce champ.
     * S'il contient quelque chose, on considère
     * la requête comme potentiellement automatisée.
     */

    if (body.website) {
      console.warn(
        "Lead blocked by honeypot."
      );

      /*
       * On renvoie volontairement un succès.
       *
       * Cela évite d'indiquer au bot qu'il
       * vient d'être détecté.
       */
      return NextResponse.json({
        success: true,
        message: "Demande reçue.",
      });
    }

    /*
     * TYPE
     */

    if (
      !body.type ||
      !allowedTypes.includes(body.type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Type de demande invalide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * EMAIL
     */

    const email =
      cleanString(body.email, 254);

    if (
      !email ||
      !emailRegex.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veuillez saisir une adresse e-mail valide.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * NETTOYAGE
     */

    const name =
      cleanString(body.name, 120);

    const company =
      cleanString(body.company, 160);

    const phone =
      cleanString(body.phone, 50);

    const message =
      cleanString(body.message, 5000);

    const sourcePage =
      cleanString(body.sourcePage, 250);

    /*
     * Vérification du payload
     */

    const payload =
      body.payload &&
      typeof body.payload === "object" &&
      !Array.isArray(body.payload)
        ? body.payload
        : {};

    const payloadSize =
      JSON.stringify(payload).length;

    if (payloadSize > 20_000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Les informations transmises sont trop volumineuses.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * SUPABASE
     */

    const supabase =
      createServerSupabaseClient();

    const { data, error } =
      await supabase
        .from("leads")
        .insert({
          type: body.type,

          name,
          company,

          email,
          phone,

          message,

          source_page: sourcePage,

          payload,

          status: "new",
        })
        .select("id")
        .single();

    if (error) {
  console.error(
    "Supabase lead error:",
    error
  );

  return NextResponse.json(
    {
      success: false,
      message:
        "Impossible d'enregistrer la demande.",
    },
    {
      status: 500,
    }
  );
}

try {
  await sendLeadNotification({
    id: data.id,

    type: body.type,

    name,
    company,

    email,
    phone,

    message,

    sourcePage,

    payload,
  });
} catch (notificationError) {
  console.error(
    "Lead notification error:",
    notificationError
  );
}

return NextResponse.json({
  success: true,

  message:
    "Votre demande a bien été enregistrée.",

  leadId: data.id,
});
  } catch (error) {
    console.error(
      "Lead API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de traiter la demande.",
      },
      {
        status: 500,
      }
    );
  }
}