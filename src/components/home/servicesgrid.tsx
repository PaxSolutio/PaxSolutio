import Link from "next/link";
import { services } from "@/data/services";

export default function ServicesGrid() {
  return (
    <section id="solutions" className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Nos solutions
            </div>

            <h2 className="max-w-[700px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[56px]">
              Tout ce dont votre projet
              <span className="text-[#176BFF]">
                {" "}
                d&apos;import a besoin.
              </span>
            </h2>
          </div>

          <p className="max-w-[420px] text-base leading-7 text-[#657386]">
            Sélectionnez une solution ou confiez-nous l&apos;ensemble du
            parcours, depuis votre besoin initial jusqu&apos;à la livraison.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={service.href}
              className={`group relative flex min-h-[380px] flex-col overflow-hidden rounded-[28px] border p-8 transition duration-300 hover:-translate-y-1 ${service.featured
                ? "border-[#176BFF] bg-[#071B33] text-white shadow-[0_25px_80px_rgba(7,27,51,0.18)]"
                : "border-[#E5EAF1] bg-white text-[#071B33] hover:shadow-[0_25px_70px_rgba(7,27,51,0.08)]"
                }`}
            >
              <div
                className={`absolute right-[-60px] top-[-60px] h-[180px] w-[180px] rounded-full ${service.featured
                  ? "bg-[#176BFF]/20"
                  : "bg-[#EAF2FF]"
                  }`}
              />

              <div className="relative z-10">
                <span
                  className={`text-[11px] font-black uppercase tracking-[0.18em] ${service.featured
                    ? "text-[#74A8FF]"
                    : "text-[#176BFF]"
                    }`}
                >
                  {service.category}
                </span>
              </div>

              <div className="relative z-10 mt-auto">
                <h3
                  className={`text-[27px] font-extrabold leading-tight tracking-[-0.035em] ${service.featured
                    ? "text-white"
                    : "text-[#071B33]"
                    }`}
                >
                  {service.title}
                </h3>

                <p
                  className={`mt-4 text-sm leading-7 ${service.featured
                    ? "text-white/70"
                    : "text-[#657386]"
                    }`}
                >
                  {service.shortDescription}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-3 py-2 text-[11px] font-bold ${service.featured
                        ? "bg-white/10 text-white"
                        : "bg-[#F6F8FB] text-[#52647B]"
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  className={`mt-8 flex items-center gap-3 text-sm font-extrabold ${service.featured
                      ? "text-white"
                      : "text-[#176BFF]"
                    }`}
                >
                  Découvrir

                  <span className="transition duration-200 group-hover:translate-x-1">
                    →
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