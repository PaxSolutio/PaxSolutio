"use client";

import { useState } from "react";

type OpportunityEntry = {
  title: string;
  summary: string;
  rationale: string;

  priority_score: number;
  confidence_score: number;

  source_item_ids: string[];

  product_name?: string;
  opportunity_type?: string;
};

type Props = {
  briefId: string;

  section:
    | "opportunities"
    | "product_opportunities";

  entryIndex: number;

  entry: OpportunityEntry;
};

type ApiResponse = {
  success: boolean;
  error?: string;

  opportunity?: {
    id: string;
    status: string;
  };
};

export default function CreateIntelligenceOpportunityButton({
  briefId,
  section,
  entryIndex,
  entry,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [created, setCreated] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function createOpportunity() {
    if (loading || created) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/admin/intelligence/opportunity",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            briefId,
            section,
            entryIndex,
            entry,
          }),
        }
      );

      const data =
        (await response.json()) as ApiResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Impossible de créer le dossier."
        );
      }

      setCreated(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erreur inconnue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={createOpportunity}
        disabled={loading || created}
        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
          created
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
        } disabled:cursor-default`}
      >
        {loading
          ? "Création..."
          : created
            ? "✓ Dossier créé"
            : "Étudier cette opportunité"}
      </button>

      {error && (
        <div className="mt-2 text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}