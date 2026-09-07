import Link from "next/link";

const categories = [
    {
        title: "Construction",
        href: "/secteurs/construction",
        image: "/categories/construction.jpg",
        className:
            "md:col-span-2 md:row-span-2",
    },
    {
        title: "Automobile",
        href: "/secteurs/automobile",
        image: "/categories/automobile.jpg",
        className: "",
    },
    {
        title: "Équipements professionnels",
        href: "/secteurs/equipements-professionnels",
        image: "/categories/equipements-professionnels.jpg",
        className: "",
    },
    {
        title: "Mobilier",
        href: "/secteurs/mobilier",
        image: "/categories/mobilier.jpg",
        className: "",
    },
    {
        title: "Électronique & e-commerce",
        href: "/secteurs/electronique",
        image: "/categories/electronique.jpg",
        className: "",
    },
];

export default function VisualCategoriesSection() {
    return (
        <section className="bg-white py-20 lg:py-24">
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
                        De l’équipement de chantier à
                        l’automobile, PaxSolutio accompagne
                        des projets dans plusieurs secteurs
                        grâce à son réseau international de
                        fournisseurs.
                    </p>
                </div>

                <div className="mt-10 grid auto-rows-[250px] gap-5 md:grid-cols-4">
                    {categories.map(
                        (category) => (
                            <Link
                                key={
                                    category.title
                                }
                                href={
                                    category.href
                                }
                                className={`group relative overflow-hidden rounded-[28px] bg-[#E9EEF4] ${category.className}`}
                            >
                                <img
                                    src={
                                        category.image
                                    }
                                    alt={
                                        category.title
                                    }
                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                                    <h3 className="max-w-[80%] text-xl font-extrabold tracking-[-0.025em] text-white md:text-2xl">
                                        {
                                            category.title
                                        }
                                    </h3>

                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/10 text-lg text-white backdrop-blur transition group-hover:bg-white group-hover:text-[#071B33]">
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