"use client";

import { useState } from "react";

type Props = {
    title: string;
    images: string[];
};

export default function OfferGallery({
    title,
    images,
}: Props) {
    const [selectedImage, setSelectedImage] =
        useState(
            images[0] ?? ""
        );

    if (images.length === 0) {
        return (
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white">
                <div className="flex min-h-[480px] items-center justify-center bg-[#eef2f6] text-slate-400">
                    Visuel à venir
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[#eef2f6]">
                <div className="flex min-h-[480px] items-center justify-center">
                    <img
                        src={selectedImage}
                        alt={title}
                        className="max-h-[640px] w-full object-contain transition duration-300"
                    />
                </div>
            </div>

            {images.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {images.map(
                        (
                            image,
                            index
                        ) => {
                            const active =
                                image ===
                                selectedImage;

                            return (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    onClick={() =>
                                        setSelectedImage(
                                            image
                                        )
                                    }
                                    className={`overflow-hidden rounded-2xl border bg-white p-1 transition ${
                                        active
                                            ? "border-[#0d63f3] ring-2 ring-blue-100"
                                            : "border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <img
                                        src={
                                            image
                                        }
                                        alt={`${title} ${index + 1}`}
                                        className="aspect-square w-full object-cover"
                                    />
                                </button>
                            );
                        }
                    )}
                </div>
            ) : null}
        </div>
    );
}