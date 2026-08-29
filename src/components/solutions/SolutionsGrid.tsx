import Link from "next/link";
import { services } from "@/data/services";

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

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Link
              key={service.slug}
              href={service.href}
              className={`group flex min-h-[400px] flex-col rounded-[30px] border p-8 transition duration-300 hover:-translate-y-1 ${
                service.featured
                  ? "border-[#176BFF] bg-[#071B33] text-white shadow-[0_22px_70px_rgba(7,27,51,0.16)]"
                  : "border-[#E2E8F0] bg-white text-[#071B33] hover:border-[#C9D9F1] hover:shadow-[0_20px_60px_rgba(7,27,51,0.07)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                      service.featured
                        ? "text-[#79A9FF]"
                        : "text-[#176BFF]"
                    }`}
                  >
                    {service.category}
                  </div>

                  <div
                    className={`mt-2 text-xs font-bold ${
                      service.featured
                        ? "text-white/30"
                        : "text-[#A0ADBC]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full transition group-hover:translate-x-1 ${
                    service.featured
                      ? "bg-white/10 text-white"
                      : "bg-[#F2F6FB] text-[#176BFF]"
                  }`}
                >
                  →
                </span>
              </div>

              <div className="mt-auto">
                <h2 className="text-[27px] font-extrabold tracking-[-0.035em]">
                  {service.title}
                </h2>

                <p
                  className={`mt-4 text-sm leading-7 ${
                    service.featured
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
                      className={`rounded-full px-3 py-2 text-[11px] font-bold ${
                        service.featured
                          ? "bg-white/10 text-white/80"
                          : "bg-[#F6F8FB] text-[#52647B]"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  className={`mt-8 text-sm font-extrabold ${
                    service.featured
                      ? "text-white"
                      : "text-[#176BFF]"
                  }`}
                >
                  Voir cette solution →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}