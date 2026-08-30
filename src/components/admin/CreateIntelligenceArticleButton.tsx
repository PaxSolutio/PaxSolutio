"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  intelligenceItemId: string;
  generatedNewsPostId?: string | null;
};

type GenerateResponse = {
  success: boolean;

  alreadyExists?: boolean;

  error?: string;

  post?: {
    id: string;
    slug: string;
    status: string;
  };
};

export default function CreateIntelligenceArticleButton({
  intelligenceItemId,
  generatedNewsPostId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleClick() {
    if (loading) {
      return;
    }

    if (generatedNewsPostId) {
      router.push(
        `/admin/nouveautes/${generatedNewsPostId}`
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/intelligence/article",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            intelligenceItemId,
          }),
        }
      );

      const data =
        (await response.json()) as GenerateResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.post?.id
      ) {
        throw new Error(
          data.error ||
            "Impossible de créer l'article."
        );
      }

      router.push(
        `/admin/nouveautes/${data.post.id}`
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          generatedNewsPostId
            ? "inline-flex items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
            : "inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading
          ? "Génération..."
          : generatedNewsPostId
            ? "Modifier l'article"
            : "Créer un article"}
      </button>

      {error && (
        <div className="mt-2 max-w-xs text-xs leading-5 text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}