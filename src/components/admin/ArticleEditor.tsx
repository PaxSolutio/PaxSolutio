"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createAuthBrowserClient } from "@/lib/supabase/auth-client";

type ArticleEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

type EditorMode =
  | "edit"
  | "preview";

export default function ArticleEditor({
  value,
  onChange,
}: ArticleEditorProps) {
  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const [mode, setMode] =
    useState<EditorMode>("edit");

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [
    uploadError,
    setUploadError,
  ] = useState("");

  function insertText(
    before: string,
    after = "",
    placeholder = ""
  ) {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      onChange(
        `${value}${before}${placeholder}${after}`
      );

      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selected =
      value.substring(start, end);

    const text =
      selected || placeholder;

    const newValue =
      value.substring(0, start) +
      before +
      text +
      after +
      value.substring(end);

    onChange(newValue);

    requestAnimationFrame(() => {
      textarea.focus();

      const newCursorPosition =
        start +
        before.length +
        text.length +
        after.length;

      textarea.setSelectionRange(
        newCursorPosition,
        newCursorPosition
      );
    });
  }

  function insertLinePrefix(
    prefix: string
  ) {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      onChange(
        `${value}\n${prefix}`
      );

      return;
    }

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const selected =
      value.substring(start, end);

    if (!selected) {
      const newValue =
        value.substring(0, start) +
        prefix +
        value.substring(end);

      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();

        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length
        );
      });

      return;
    }

    const transformed =
      selected
        .split("\n")
        .map(
          (line) =>
            `${prefix}${line}`
        )
        .join("\n");

    const newValue =
      value.substring(0, start) +
      transformed +
      value.substring(end);

    onChange(newValue);
  }

  async function uploadInlineImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError("");

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setUploadError(
        "Le fichier sélectionné n'est pas une image."
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setUploadError(
        "L'image ne doit pas dépasser 10 Mo."
      );

      return;
    }

    setUploadingImage(true);

    try {
      const supabase =
        createAuthBrowserClient();

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `articles/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const {
        error: storageError,
      } = await supabase.storage
        .from("news-media")
        .upload(
          filePath,
          file,
          {
            cacheControl:
              "3600",
            upsert: false,
          }
        );

      if (storageError) {
        console.error(
          storageError
        );

        setUploadError(
          "Impossible d'envoyer l'image."
        );

        return;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("news-media")
        .getPublicUrl(filePath);

      const imageMarkdown =
        `\n\n![${file.name}](${publicUrlData.publicUrl})\n\n`;

      insertText(
        imageMarkdown
      );
    } catch (error) {
      console.error(error);

      setUploadError(
        "Une erreur est survenue pendant l'envoi de l'image."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  const toolbarButton =
    "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#071321]">
      {/* HEADER */}

      <div className="flex flex-col gap-4 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            title="Titre de section"
            className={
              toolbarButton
            }
            onClick={() =>
              insertText(
                "\n\n## ",
                "\n\n",
                "Titre de section"
              )
            }
          >
            H2
          </button>

          <button
            type="button"
            title="Sous-titre"
            className={
              toolbarButton
            }
            onClick={() =>
              insertText(
                "\n\n### ",
                "\n\n",
                "Sous-titre"
              )
            }
          >
            H3
          </button>

          <button
            type="button"
            title="Gras"
            className={
              toolbarButton
            }
            onClick={() =>
              insertText(
                "**",
                "**",
                "texte important"
              )
            }
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            title="Italique"
            className={
              toolbarButton
            }
            onClick={() =>
              insertText(
                "*",
                "*",
                "texte"
              )
            }
          >
            <em>I</em>
          </button>

          <button
            type="button"
            title="Liste à puces"
            className={
              toolbarButton
            }
            onClick={() =>
              insertLinePrefix(
                "- "
              )
            }
          >
            • Liste
          </button>

          <button
            type="button"
            title="Liste numérotée"
            className={
              toolbarButton
            }
            onClick={() =>
              insertLinePrefix(
                "1. "
              )
            }
          >
            1. Liste
          </button>

          <button
            type="button"
            title="Citation"
            className={
              toolbarButton
            }
            onClick={() =>
              insertLinePrefix(
                "> "
              )
            }
          >
            Citation
          </button>

          <button
            type="button"
            title="Lien"
            className={
              toolbarButton
            }
            onClick={() =>
              insertText(
                "[",
                "](https://)",
                "texte du lien"
              )
            }
          >
            Lien
          </button>

          <label
            className={`${toolbarButton} cursor-pointer`}
          >
            {uploadingImage
              ? "Envoi..."
              : "Image"}

            <input
              type="file"
              accept="image/*"
              disabled={
                uploadingImage
              }
              onChange={
                uploadInlineImage
              }
              className="hidden"
            />
          </label>
        </div>

        <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() =>
              setMode("edit")
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "edit"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Écrire
          </button>

          <button
            type="button"
            onClick={() =>
              setMode(
                "preview"
              )
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "preview"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Aperçu
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">
          {uploadError}
        </div>
      )}

      {/* ÉDITION */}

      {mode === "edit" && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          rows={24}
          placeholder={`Rédigez votre article...

Exemple :

## Une nouvelle opportunité sur le marché

Nous avons identifié une nouvelle tendance intéressante...

### Pourquoi ce produit est intéressant ?

- Demande croissante
- Prix compétitif
- Possibilité de personnalisation

Vous pouvez également ajouter des images directement avec le bouton Image.`}
          className="min-h-[600px] w-full resize-y bg-[#091728] px-6 py-6 font-mono text-[15px] leading-7 text-slate-200 outline-none placeholder:text-slate-600"
        />
      )}

      {/* APERÇU */}

      {mode === "preview" && (
        <div className="min-h-[600px] bg-white px-7 py-10 text-[#081426] md:px-10">
          {value.trim() ? (
            <article className="article-content">
              <ReactMarkdown
                remarkPlugins={[
                  remarkGfm,
                ]}
                components={{
                  h2: ({
                    children,
                  }) => (
                    <h2 className="mb-5 mt-12 text-3xl font-semibold tracking-tight text-[#081426] first:mt-0">
                      {children}
                    </h2>
                  ),

                  h3: ({
                    children,
                  }) => (
                    <h3 className="mb-4 mt-9 text-2xl font-semibold text-[#081426]">
                      {children}
                    </h3>
                  ),

                  p: ({
                    children,
                  }) => (
                    <p className="my-5 text-[17px] leading-8 text-slate-700">
                      {children}
                    </p>
                  ),

                  strong: ({
                    children,
                  }) => (
                    <strong className="font-semibold text-[#081426]">
                      {children}
                    </strong>
                  ),

                  ul: ({
                    children,
                  }) => (
                    <ul className="my-6 list-disc space-y-2 pl-6 text-[17px] leading-8 text-slate-700">
                      {children}
                    </ul>
                  ),

                  ol: ({
                    children,
                  }) => (
                    <ol className="my-6 list-decimal space-y-2 pl-6 text-[17px] leading-8 text-slate-700">
                      {children}
                    </ol>
                  ),

                  blockquote: ({
                    children,
                  }) => (
                    <blockquote className="my-8 border-l-4 border-[#0b5cff] bg-blue-50 px-6 py-4 text-lg italic leading-8 text-slate-700">
                      {children}
                    </blockquote>
                  ),

                  a: ({
                    children,
                    href,
                  }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#0b5cff] underline decoration-blue-200 underline-offset-4 transition hover:decoration-[#0b5cff]"
                    >
                      {children}
                    </a>
                  ),

                  img: ({
                    src,
                    alt,
                  }) => (
                    <figure className="my-10">
                      <img
                        src={src || ""}
                        alt={
                          alt || ""
                        }
                        className="max-h-[680px] w-full rounded-2xl object-cover shadow-sm"
                      />

                      {alt && (
                        <figcaption className="mt-3 text-center text-sm text-slate-500">
                          {alt}
                        </figcaption>
                      )}
                    </figure>
                  ),

                  hr: () => (
                    <hr className="my-12 border-slate-200" />
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            </article>
          ) : (
            <div className="flex min-h-[450px] items-center justify-center text-slate-400">
              Commencez à rédiger
              pour afficher
              l&apos;aperçu.
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 bg-black/10 px-5 py-3 text-xs text-slate-500">
        <span>
          {value.length} caractères
        </span>

        <span>
          Images, titres, listes,
          citations et liens pris en
          charge
        </span>
      </div>
    </div>
  );
}