import { Resend } from "resend";
import type { LeadType } from "@/types/lead";

type LeadNotificationData = {
  id: string;

  type: LeadType;

  name?: string | null;
  company?: string | null;

  email: string;
  phone?: string | null;

  message?: string | null;

  sourcePage?: string | null;

  payload?: Record<string, unknown>;
};

const typeLabels: Record<LeadType, string> = {
  general: "Demande générale",
  sourcing: "Sourcing international",
  automotive: "Sourcing automobile",
  logistics: "Logistique",
  quality: "Audit / Contrôle qualité",
  supplier: "Recherche fournisseur",
  dropshipping: "Dropshipping / Fulfillment",
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPayload(
  payload?: Record<string, unknown>
) {
  if (!payload) {
    return "";
  }

  const entries = Object.entries(payload).filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

  if (entries.length === 0) {
    return "";
  }

  return entries
    .map(
      ([key, value]) => `
        <tr>
          <td
            style="
              padding: 8px 12px;
              border-bottom: 1px solid #e5e7eb;
              color: #657386;
              font-size: 13px;
            "
          >
            ${escapeHtml(key)}
          </td>

          <td
            style="
              padding: 8px 12px;
              border-bottom: 1px solid #e5e7eb;
              color: #071b33;
              font-size: 13px;
              font-weight: 600;
            "
          >
            ${escapeHtml(value)}
          </td>
        </tr>
      `
    )
    .join("");
}

export async function sendLeadNotification(
  lead: LeadNotificationData
) {
  const apiKey =
    process.env.RESEND_API_KEY;

  const recipient =
    process.env.LEAD_NOTIFICATION_EMAIL;

  if (!apiKey || !recipient) {
    console.warn(
      "Notification e-mail non configurée."
    );

    return;
  }

  const resend = new Resend(apiKey);

  const typeLabel =
    typeLabels[lead.type] || lead.type;

  await resend.emails.send({
    /*
     * Adresse temporaire pour les tests.
     * Nous utiliserons ensuite un domaine PaxSolutio vérifié.
     */
    from:
      "PaxSolutio Leads <onboarding@resend.dev>",

    to: recipient,

    subject:
      `Nouveau lead PaxSolutio — ${typeLabel}`,

    html: `
      <div
        style="
          background: #f6f8fb;
          padding: 40px 20px;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div
          style="
            max-width: 680px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
          "
        >
          <div
            style="
              background: #071b33;
              padding: 28px 32px;
              color: white;
            "
          >
            <div
              style="
                font-size: 12px;
                color: #74a8ff;
                font-weight: 700;
                text-transform: uppercase;
              "
            >
              Nouveau lead
            </div>

            <h1
              style="
                margin: 8px 0 0;
                font-size: 24px;
              "
            >
              ${escapeHtml(typeLabel)}
            </h1>
          </div>

          <div style="padding: 32px;">
            <table
              width="100%"
              cellspacing="0"
              cellpadding="0"
              style="border-collapse: collapse;"
            >
              <tr>
                <td style="padding: 8px 12px; color: #657386;">
                  Nom
                </td>

                <td style="padding: 8px 12px; font-weight: 600;">
                  ${escapeHtml(lead.name || "Non renseigné")}
                </td>
              </tr>

              <tr>
                <td style="padding: 8px 12px; color: #657386;">
                  Société
                </td>

                <td style="padding: 8px 12px; font-weight: 600;">
                  ${escapeHtml(lead.company || "Non renseignée")}
                </td>
              </tr>

              <tr>
                <td style="padding: 8px 12px; color: #657386;">
                  E-mail
                </td>

                <td style="padding: 8px 12px; font-weight: 600;">
                  ${escapeHtml(lead.email)}
                </td>
              </tr>

              <tr>
                <td style="padding: 8px 12px; color: #657386;">
                  Téléphone
                </td>

                <td style="padding: 8px 12px; font-weight: 600;">
                  ${escapeHtml(lead.phone || "Non renseigné")}
                </td>
              </tr>

              <tr>
                <td style="padding: 8px 12px; color: #657386;">
                  Page
                </td>

                <td style="padding: 8px 12px; font-weight: 600;">
                  ${escapeHtml(lead.sourcePage || "Non renseignée")}
                </td>
              </tr>
            </table>

            ${
              lead.message
                ? `
                  <div style="margin-top: 28px;">
                    <div
                      style="
                        font-size: 12px;
                        font-weight: 700;
                        color: #176bff;
                        text-transform: uppercase;
                      "
                    >
                      Message
                    </div>

                    <p
                      style="
                        margin-top: 10px;
                        color: #52647b;
                        line-height: 1.7;
                      "
                    >
                      ${escapeHtml(lead.message)}
                    </p>
                  </div>
                `
                : ""
            }

            <div style="margin-top: 28px;">
              <div
                style="
                  font-size: 12px;
                  font-weight: 700;
                  color: #176bff;
                  text-transform: uppercase;
                "
              >
                Informations du projet
              </div>

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="
                  margin-top: 10px;
                  border-collapse: collapse;
                  background: #f6f8fb;
                "
              >
                ${renderPayload(lead.payload)}
              </table>
            </div>

            <div
              style="
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #8a99ac;
                font-size: 12px;
              "
            >
              Lead ID : ${escapeHtml(lead.id)}
            </div>
          </div>
        </div>
      </div>
    `,
  });
}