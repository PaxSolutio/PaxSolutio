export default function CredibilitySection() {
    const stats = [
        {
            value: "5+ ans",
            label: "Présence opérationnelle en Asie",
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />

                    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                </svg>
            ),
        },
        {
            value: "10 000+",
            label: "Contacts fournisseurs",
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                >
                    <circle
                        cx="8"
                        cy="8"
                        r="3"
                    />

                    <circle
                        cx="16"
                        cy="8"
                        r="3"
                    />

                    <path d="M3 20v-2a5 5 0 0 1 5-5" />
                    <path d="M21 20v-2a5 5 0 0 0-5-5" />
                    <path d="M8 13h8" />
                </svg>
            ),
        },
        {
            value: "500 000 €+",
            label: "Volume sourcing & e-commerce",
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                >
                    <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                    />

                    <path d="M3 9h18" />
                    <path d="M7 15h4" />
                </svg>
            ),
        },
        {
            value: "France + Chine",
            label: "Présence opérationnelle",
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                >
                    <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />

                    <circle
                        cx="12"
                        cy="10"
                        r="2"
                    />
                </svg>
            ),
        },
    ];

    return (
        <section className="bg-white py-12 lg:py-20">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">

                {/* INTRODUCTION */}

                <div className="grid items-end gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                            Présence & réseau
                        </div>

                        <h2 className="mt-4 max-w-[520px] text-[34px] font-extrabold leading-[1.05] tracking-[-0.045em] text-[#071B33] sm:text-[42px]">
                            Le sourcing se
                            construit{" "}
                            <span className="text-[#176BFF]">
                                aussi sur le
                                terrain.
                            </span>
                        </h2>
                    </div>

                    <p className="max-w-[610px] text-sm leading-7 text-[#657386] lg:justify-self-end">
                        PaxSolutio associe
                        présence en Chine,
                        réseau fournisseurs et
                        coordination en France
                        afin d&apos;accompagner
                        les opérations de
                        sourcing, de contrôle
                        qualité et
                        d&apos;importation
                        internationale.
                    </p>
                </div>

                {/* RÉASSURANCES COMPACTES */}

                <div className="mt-10 border-y border-[#E2E8F0]">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map(
                            (
                                stat,
                                index
                            ) => (
                                <div
                                    key={
                                        stat.value
                                    }
                                    className={`flex items-center gap-4 px-2 py-7 sm:px-5 lg:px-7 ${
                                        index !==
                                        stats.length -
                                            1
                                            ? "lg:border-r lg:border-[#E2E8F0]"
                                            : ""
                                    }`}
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F2F7FF] text-[#176BFF]">
                                        {
                                            stat.icon
                                        }
                                    </div>

                                    <div>
                                        <div className="text-xl font-extrabold tracking-[-0.025em] text-[#071B33] sm:text-2xl">
                                            {
                                                stat.value
                                            }
                                        </div>

                                        <div className="mt-1 text-xs font-semibold leading-5 text-[#657386]">
                                            {
                                                stat.label
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}