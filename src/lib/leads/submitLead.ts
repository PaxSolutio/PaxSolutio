import type { LeadPayload } from "@/types/lead";

export async function submitLead(data: LeadPayload) {
  const response = await fetch("/api/leads", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Impossible d'envoyer la demande."
    );
  }

  return result;
}