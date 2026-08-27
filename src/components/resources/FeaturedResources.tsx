import Link from "next/link";
import { resources } from "@/data/resources";

export default function FeaturedResources() {
    const featured = resources.filter((resource) => resource.featured);

    return (
        <section className="bg-[#F6F8FB] py-24 lg:py-32">
            <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
                <div className="max-w-[700px]">
                    <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                        Featured Guides
                    </div>

                    <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
                        Les sujets essentiels
                        <span className="text-[#176BFF]"> pour mieux décider.</span>
                    </h2>
                </div>

                <div className="mt-14 grid gap-5 lg:grid-cols-3">
                    {featured.map((resource, index) => (
                        <Link
                            key={resource.slug}
                            href={`/ressources/${resource.slug}`}
                            className={`group flex min-h-[360px] flex-col rounded-[28px] border p-8 transition duration-300 hover:-translate-y-1 ${index === 0
                                    ? "border-[#176BFF] bg-[#071B33] text-white"
                                    : "border-[#E2E8F0] bg-white text-[#071B33]"
                                }`}
                        >
                            <div
                                className={`text-[10px] font-black uppercase tracking-[0.18em] ${index === 0 ? "text-[#79A9FF]" : "text-[#176BFF]"
                                    }`}
                            >
                                {resource.category}
                            </div>

                            <div className="mt-auto">
                                <h3
                                    className={`text-2xl font-extrabold leading-tight tracking-[-0.035em] ${index === 0 ? "text-white" : "text-[#071B33]"
                                        }`}
                                >
                                    {resource.title}
                                </h3>

                                <p
                                    className={`mt-4 text-sm leading-7 ${index === 0 ? "text-white/60" : "text-[#657386]"
                                        }`}
                                >
                                    {resource.excerpt}
                                </p>

                                <div className="mt-7 flex items-center justify-between">
                                    <span
                                        className={`text-xs font-bold ${index === 0 ? "text-white/40" : "text-[#8B99AA]"
                                            }`}
                                    >
                                        {resource.readingTime}
                                    </span>

                                    <span
                                        className={`text-sm font-extrabold ${index === 0 ? "text-white" : "text-[#176BFF]"
                                            }`}
                                    >
                                        Lire →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}