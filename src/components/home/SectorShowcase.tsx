import Link from "next/link";

const sectors = [
    {
        title: "Construction",
        href: "/secteurs/construction",
        image: "/sectors/construction.webp",
        className:
            "md:col-span-2 md:row-span-2",
    },
    {
        title: "Automobile",
        href: "/secteurs/automobile",
        image: "/sectors/automobile.webp",
        className: "",
    },
    {
        title: "Beauté & esthétique",
        href: "/secteurs/beaute",
        image: "/sectors/beaute.webp",
        className: "",
    },
    {
        title: "Mobilier",
        href: "/secteurs/mobilier",
        image: "/sectors/mobilier.webp",
        className: "",
    },
    {
        title: "Électronique & e-commerce",
        href: "/secteurs/electronique",
        image: "/sectors/electronique.webp",
        className: "",
    },
];

export default function SectorShowcase() {
    return (
        <section className="bg-white pt-12 pb-20 lg:pt-14 lg:pb-24">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
                <div className="max-w-4xl">
                    <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                        Nos univers
                    </div>

                    <h2 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[42px]">
                        Explorez nos principaux
                        univers de sourcing.
                    </h2>

                    <p className="mt-5 max-w-2xl text-base leading-7 text-[#657386]">
                        Construction, automobile,
                        mobilier, équipements
                        professionnels ou produits
                        technologiques : PaxSolutio
                        accompagne des projets dans
                        plusieurs secteurs grâce à
                        son réseau international.
                    </p>
                </div>

                <div className="mt-10 grid auto-rows-[240px] gap-5 md:grid-cols-4 lg:auto-rows-[270px]">
                    {sectors.map(
                        (sector) => (
                            <Link
                                key={
                                    sector.title
                                }
                                href={
                                    sector.href
                                }
                                className={`group relative overflow-hidden rounded-[28px] bg-[#E8EDF3] shadow-[0_14px_40px_rgba(15,23,42,0.06)] ${sector.className}`}
                            >
                                <img
                                    src={
                                        sector.image
                                    }
                                    alt={
                                        sector.title
                                    }
                                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                                    <h3 className="max-w-[78%] text-xl font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-2xl">
                                        {
                                            sector.title
                                        }
                                    </h3>

                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-black/10 text-lg font-medium text-white backdrop-blur-sm transition duration-300 group-hover:bg-white group-hover:text-[#071B33]">
                                        →
                                    </span>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}