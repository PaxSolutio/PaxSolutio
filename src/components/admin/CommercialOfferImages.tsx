"use client";

import {
    ChangeEvent,
    useState,
} from "react";

type Props = {
    imageUrl: string;
    galleryUrls: string[];

    onImageChange: (
        url: string
    ) => void;

    onGalleryChange: (
        urls: string[]
    ) => void;
};

export default function CommercialOfferImages({
    imageUrl,
    galleryUrls,
    onImageChange,
    onGalleryChange,
}: Props) {
    const [uploadingMain, setUploadingMain] =
        useState(false);

    const [
        uploadingGallery,
        setUploadingGallery,
    ] = useState(false);

    const [error, setError] =
        useState<string | null>(
            null
        );

    async function uploadFile(
        file: File
    ) {
        const body =
            new FormData();

        body.append(
            "file",
            file
        );

        const response =
            await fetch(
                "/api/admin/offers/upload",
                {
                    method: "POST",
                    body,
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                    "Upload impossible."
            );
        }

        return data.url as string;
    }

    async function handleMainImage(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setUploadingMain(true);
        setError(null);

        try {
            const url =
                await uploadFile(
                    file
                );

            onImageChange(
                url
            );
        } catch (uploadError) {
            setError(
                uploadError instanceof
                    Error
                    ? uploadError.message
                    : "Erreur d'upload."
            );
        } finally {
            setUploadingMain(false);

            event.target.value =
                "";
        }
    }

    async function handleGallery(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const files =
            Array.from(
                event.target.files ??
                    []
            );

        if (
            files.length === 0
        ) {
            return;
        }

        setUploadingGallery(true);
        setError(null);

        try {
            const newUrls: string[] =
                [];

            for (
                const file of files
            ) {
                const url =
                    await uploadFile(
                        file
                    );

                newUrls.push(
                    url
                );
            }

            onGalleryChange([
                ...galleryUrls,
                ...newUrls,
            ]);
        } catch (uploadError) {
            setError(
                uploadError instanceof
                    Error
                    ? uploadError.message
                    : "Erreur d'upload."
            );
        } finally {
            setUploadingGallery(false);

            event.target.value =
                "";
        }
    }

    function removeGalleryImage(
        url: string
    ) {
        onGalleryChange(
            galleryUrls.filter(
                (item) =>
                    item !== url
            )
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-[#081321] p-5">
            <div>
                <h2 className="text-sm font-semibold text-white">
                    Visuels de l'offre
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                    Ajoutez l'image
                    principale puis les
                    autres photos du
                    produit.
                </p>
            </div>

            <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                    Image principale
                </div>

                <div className="mt-3">
                    {imageUrl ? (
                        <div className="max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                            <img
                                src={
                                    imageUrl
                                }
                                alt="Image principale"
                                className="max-h-[500px] w-full object-contain bg-black/20"
                            />

                            <div className="flex items-center justify-between gap-3 border-t border-white/10 p-3">
                                <span className="text-xs text-emerald-300">
                                    Image chargée
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onImageChange(
                                            ""
                                        )
                                    }
                                    className="text-xs text-red-300 hover:text-red-200"
                                >
                                    Retirer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex max-w-xl cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-950/40 px-6 py-10 text-center transition hover:border-blue-500/40 hover:bg-blue-500/[0.03]">
                            <span className="text-sm font-medium text-white">
                                Choisir une image
                            </span>

                            <span className="mt-1 text-xs text-slate-500">
                                JPG, PNG, WEBP
                                ou AVIF — 8 Mo
                                max.
                            </span>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                onChange={
                                    handleMainImage
                                }
                                disabled={
                                    uploadingMain
                                }
                                className="hidden"
                            />
                        </label>
                    )}

                    {uploadingMain ? (
                        <div className="mt-3 text-xs text-blue-300">
                            Envoi de
                            l'image...
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                            Galerie
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            {
                                galleryUrls.length
                            }{" "}
                            image(s)
                        </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20">
                        {uploadingGallery
                            ? "Envoi..."
                            : "+ Ajouter des photos"}

                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={
                                handleGallery
                            }
                            disabled={
                                uploadingGallery
                            }
                            className="hidden"
                        />
                    </label>
                </div>

                {galleryUrls.length >
                0 ? (
                    <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                        {galleryUrls.map(
                            (
                                url,
                                index
                            ) => (
                                <div
                                    key={
                                        url
                                    }
                                    className="overflow-hidden rounded-xl border border-white/10 bg-black/20"
                                >
                                    <img
                                        src={
                                            url
                                        }
                                        alt={`Galerie ${
                                            index +
                                            1
                                        }`}
                                        className="aspect-[4/3] w-full object-contain bg-black/20"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeGalleryImage(
                                                url
                                            )
                                        }
                                        className="w-full border-t border-white/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                                    >
                                        Retirer
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-slate-600">
                        Aucune photo
                        supplémentaire.
                    </div>
                )}
            </div>

            {error ? (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            ) : null}
        </div>
    );
}