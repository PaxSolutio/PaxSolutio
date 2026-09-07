import Image from "next/image";
import Link from "next/link";
import { services } from "@/data/services";

const visualImages: Record<string, string> = {
  "/sourcing": "/solutions/sourcing.webp",
  "/logistique": "/solutions/logistique.jpg",
};

export default function SolutionsGrid() {
  return (
    <section
      id="solutions-list"
      className="scroll-mt-28 bg-[#F6F8FB] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Nos services
            </div>

            <h2 className="max-w-[720px] text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
              Sélectionnez l&apos;étape
              <span className="text-[#176BFF]">
                {" "}
                que vous souhaitez structurer.
              </span>
            </h2>
          </div>

          <p className="max-w-[460px] text-base leading-7 text-[#657386]">
            Chaque solution dispose de son propre périmètre. Vous pouvez nous
            solliciter pour une seule intervention ou relier plusieurs services
            selon l&apos;avancement de votre projet.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          {services.map((service, index) => {
            const isSourcing = service.href === "/sourcing";
            const isLogistics = service.href === "/logistique";
            const isVisual = isSourcing || isLogistics;
            const isQuality = index === 3;

            const layoutClass = isSourcing
              ? "xl:order-1 xl:col-span-4"
              : service.featured
                ? "xl:order-2 xl:col-span-2"
                : isQuality
                  ? "xl:order-3 xl:col-span-2"
                  : isLogistics
                    ? "xl:order-4 xl:col-span-4"
                    : `xl:col-span-2 ${index === 4
                      ? "xl:order-5"
                      : index === 5
                        ? "xl:order-6"
                        : "xl:order-7"
                    }`;

            /*
             * CARTES VISUELLES
             * Sourcing + Logistique
             */
            if (isVisual) {
              return (
                <Link
                  key={service.slug}
                  href={service.href}
                  className={`group relative min-h-[430px] overflow-hidden rounded-[30px] border border-[#D7E1EC] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(7,27,51,0.14)] ${layoutClass}`}
                >
                  <Image
                    src={visualImages[service.href]}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1279px) 50vw, 66vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.035]"
                  />

                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${isSourcing
                        ? "from-[#071B33]/95 via-[#071B33]/55 to-black/10"
                        : "from-[#071B33]/90 via-[#071B33]/50 to-black/10"
                      }`}
                  />

                  <div className="relative z-10 flex min-h-[430px] flex-col p-8 sm:p-9">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8BB7FF]">
                          {service.category}
                        </div>

                        <div className="mt-2 text-xs font-bold text-white/50">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>

                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-[#071B33]">
                        →
                      </span>
                    </div>

                    <div className="mt-auto max-w-[620px]">
                      <h2 className="text-[30px] font-extrabold leading-tight tracking-[-0.04em] !text-white sm:text-[34px]">
                        {service.title}
                      </h2>

                      <p className="mt-4 max-w-[560px] text-sm leading-7 text-white/75">
                        {service.shortDescription}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-bold text-white/85 backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-8 text-sm font-extrabold text-white">
                        Voir cette solution →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }

            /*
             * CARTES CLASSIQUES
             */
            return (
              <Link
                key={service.slug}
                href={service.href}
                className={`group flex min-h-[400px] flex-col rounded-[30px] border p-8 transition duration-300 hover:-translate-y-1 ${layoutClass} ${service.featured
                    ? "border-[#176BFF] bg-[#071B33] text-white shadow-[0_22px_70px_rgba(7,27,51,0.16)]"
                    : "border-[#E2E8F0] bg-white text-[#071B33] hover:border-[#C9D9F1] hover:shadow-[0_20px_60px_rgba(7,27,51,0.07)]"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.18em] ${service.featured
                          ? "text-[#79A9FF]"
                          : "text-[#176BFF]"
                        }`}
                    >
                      {service.category}
                    </div>

                    <div
                      className={`mt-2 text-xs font-bold ${service.featured
                          ? "text-white/30"
                          : "text-[#A0ADBC]"
                        }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition group-hover:translate-x-1 ${service.featured
                        ? "bg-white/10 text-white"
                        : "bg-[#F2F6FB] text-[#176BFF]"
                      }`}
                  >
                    →
                  </span>
                </div>

                <div className="mt-auto">
                  <h2
                    className={`text-[27px] font-extrabold tracking-[-0.035em] ${service.featured
                        ? "!text-white"
                        : "text-[#071B33]"
                      }`}
                  >
                    {service.title}
                  </h2>

                  <p
                    className={`mt-4 text-sm leading-7 ${service.featured
                        ? "text-white/60"
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
                            ? "bg-white/10 text-white/80"
                            : "bg-[#F6F8FB] text-[#52647B]"
                          }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`mt-8 text-sm font-extrabold ${service.featured
                        ? "text-white"
                        : "text-[#176BFF]"
                      }`}
                  >
                    Voir cette solution →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}