"use client";

import { useState } from "react";

export default function FounderVideoSection() {
    const [playing, setPlaying] = useState(false);

    const scrollToProject = () => {
        const section = document.getElementById("project-form");

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <section className="border-t border-[#E2E8F0] bg-[#F3F6FA] py-14 lg:py-16">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">

                <div className="grid items-center gap-12 md:grid-cols-[1fr_360px] md:gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">

                    {/* TEXTE */}
                    <div className="max-w-[650px]">

                        <p className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#1F5EFF]">
                            Derrière PaxSolutio
                        </p>

                        <h2 className="text-[40px] font-black leading-[0.98] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[62px]">
                            Plus qu&apos;un intermédiaire.
                            <span className="block text-[#1F5EFF]">
                                Une présence sur le terrain.
                            </span>
                        </h2>

                        <p className="mt-7 max-w-[580px] text-[15px] leading-7 text-[#52647B] sm:text-base">
                            Découvrez PaxSolutio, notre approche du sourcing international
                            et la manière dont nous accompagnons chaque projet, de la
                            recherche fournisseur jusqu&apos;à l&apos;acheminement.
                        </p>

                        {/* BOUTONS */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <button
                                type="button"
                                onClick={() => setPlaying(true)}
                                className="group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl bg-[#1F5EFF] px-6 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(31,94,255,.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#174FE0]"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[12px] text-[#1F5EFF]">
                                    ▶
                                </span>

                                Voir la présentation
                            </button>

                            <button
                                type="button"
                                onClick={scrollToProject}
                                className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl border border-[#D5DDEA] bg-white px-6 text-sm font-extrabold text-[#071B33] transition duration-300 hover:border-[#1F5EFF] hover:text-[#1F5EFF]"
                            >
                                <span className="text-lg text-[#1F5EFF]">
                                    ↗
                                </span>

                                Réserver un appel
                            </button>

                        </div>

                        {/* PREUVES */}
                        <div className="mt-10 grid max-w-[620px] grid-cols-1 gap-5 border-t border-[#E0E6EF] pt-7 sm:grid-cols-3">

                            <div>
                                <p className="text-xl font-black text-[#071B33]">
                                    +10 000
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#708096]">
                                    Contacts fournisseurs
                                </p>
                            </div>

                            <div>
                                <p className="text-xl font-black text-[#071B33]">
                                    5+ ans
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#708096]">
                                    Présence en Asie
                                </p>
                            </div>

                            <div>
                                <p className="text-xl font-black text-[#071B33]">
                                    France ↔ Chine
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#708096]">
                                    Présence opérationnelle
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* VIDEO VERTICALE */}
                    <div className="mx-auto w-full max-w-[360px] md:mx-0 md:justify-self-end lg:max-w-[400px]">

                        <div
                            className="relative w-full overflow-hidden rounded-[30px] bg-[#071B33] shadow-[0_30px_70px_rgba(7,27,51,0.20)]"
                            style={{ aspectRatio: "9 / 16" }}
                        >

                            {!playing ? (
                                <>
                                    {/* MINIATURE TEMPORAIRE */}
                                    <img
                                        src="/videos/paxsolutio-video-cover.webp"
                                        alt=""
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />

                                    {/* GRILLE */}
                                    <div
                                        className="absolute inset-0 opacity-[0.08]"
                                        style={{
                                            backgroundImage:
                                                "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
                                            backgroundSize: "42px 42px",
                                        }}
                                    />

                                    {/* OVERLAY */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#071B33]/95 via-[#071B33]/25 to-[#071B33]/20" />

                                    {/* HAUT */}
                                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">

                                        <div className="flex items-center gap-2">

                                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                                                Présentation
                                            </span>

                                            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
                                                PaxSolutio
                                            </span>

                                        </div>

                                        <span className="text-xs font-bold text-white/70">
                                            01:35
                                        </span>

                                    </div>

                                    {/* CENTRE PLAY */}
                                    <button
                                        type="button"
                                        onClick={() => setPlaying(true)}
                                        aria-label="Lire la présentation de PaxSolutio"
                                        className="group absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4"
                                    >
                                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1F5EFF] text-xl text-white shadow-[0_14px_45px_rgba(31,94,255,.5)] transition duration-300 group-hover:scale-105">
                                            ▶
                                        </span>

                                        <span className="text-sm font-extrabold text-white">
                                            Voir la vidéo
                                        </span>
                                    </button>

                                    {/* BAS */}
                                    <div className="absolute inset-x-0 bottom-0 p-7">

                                        <p className="text-[28px] font-black leading-[1.05] tracking-[-0.035em] text-white">
                                            De la Chine jusqu&apos;à votre marché.
                                        </p>

                                        <p className="mt-3 max-w-[330px] text-sm leading-6 text-white/65">
                                            Sourcing, contrôle qualité et logistique internationale.
                                        </p>

                                        <div className="mt-6 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                                            <span>Sourcing</span>
                                            <span>·</span>
                                            <span>Qualité</span>
                                            <span>·</span>
                                            <span>Logistique</span>
                                        </div>

                                    </div>
                                </>
                            ) : (
                                <video
                                    src="/videos/paxsolutio-presentation.mp4"
                                    className="absolute inset-0 h-full w-full bg-black object-cover"
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="metadata"
                                >
                                    Votre navigateur ne permet pas la lecture de cette vidéo.
                                </video>
                            )}

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}