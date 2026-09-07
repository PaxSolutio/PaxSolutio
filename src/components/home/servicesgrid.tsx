import Image from "next/image";
import Link from "next/link";
import { services } from "@/data/services";

export default function ServicesGrid() {
  return (
    <section
      id="solutions"
      className="bg-[#F6F8FB] py-14 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Sourcing & import
            </div>

            <h2 className="mt-4 max-w-[760px] text-[36px] font-extrabold leading-[1.06] tracking-[-0.045em] text-[#071B33] sm:text-[44px] lg:text-[48px]">
              Des solutions pour chaque étape
              <span className="text-[#176BFF]">
                {" "}
                de votre projet.
              </span>
            </h2>
          </div>

          <p className="max-w-[500px] text-base leading-8 text-[#657386] lg:justify-self-end">
            Recherche fournisseur, développement produit, contrôle qualité,
            automobile, logistique ou fulfillment : activez uniquement les
            services utiles à votre opération.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={service.href}
              className={`group relative flex min-h-[430px] flex-col overflow-hidden rounded-[24px] border transition duration-300 hover:-translate-y-1 ${service.featured
                ? "border-[#176BFF] bg-[#071B33] shadow-[0_24px_65px_rgba(7,27,51,0.16)]"
                : "border-[#E1E8F0] bg-white hover:border-[#C9D9F1] hover:shadow-[0_20px_55px_rgba(7,27,51,0.07)]"
                }`}
            >
              <div className="relative h-[180px] w-full shrink-0 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />

                <div
                  className={`absolute inset-0 ${service.featured
                    ? "bg-gradient-to-t from-[#071B33]/70 via-transparent to-transparent"
                    : "bg-gradient-to-t from-black/10 to-transparent"
                    }`}
                />
              </div>

              <div className="relative flex flex-1 flex-col p-6">

                <div
                  className={`absolute right-[-45px] top-[-45px] h-[130px] w-[130px] rounded-full transition duration-500 group-hover:scale-110 ${service.featured
                    ? "bg-[#176BFF]/20"
                    : "bg-[#F0F5FF]"
                    }`}
                />

                <div className="relative z-10 flex items-start justify-between gap-5">
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.18em] ${service.featured
                      ? "text-[#7EAEFF]"
                      : "text-[#176BFF]"
                      }`}
                  >
                    {service.category}
                  </span>

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition duration-300 ${service.featured
                      ? "bg-white/10 text-white group-hover:bg-white group-hover:text-[#071B33]"
                      : "bg-[#F0F5FF] text-[#176BFF] group-hover:bg-[#176BFF] group-hover:text-white"
                      }`}
                  >
                    →
                  </span>
                </div>

                <div className="relative z-10 pt-7">
                  <h3
                    className={`text-[24px] font-extrabold leading-tight tracking-[-0.035em] ${service.featured
                      ? "!text-white"
                      : "text-[#071B33]"
                      }`}
                  >
                    {service.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-7 ${service.featured
                      ? "text-white/70"
                      : "text-[#657386]"
                      }`}
                  >
                    {service.shortDescription}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${service.featured
                          ? "bg-white/10 text-white/90"
                          : "bg-[#F6F8FB] text-[#52647B]"
                          }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`mt-6 flex items-center gap-2 text-xs font-extrabold ${service.featured
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section >
  );
}