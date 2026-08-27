import Link from "next/link";
import { services } from "@/data/services";

export default function SolutionsGrid() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Link
              key={service.slug}
              href={service.href}
              className={`group flex min-h-[380px] flex-col rounded-[30px] border p-8 transition duration-300 hover:-translate-y-1 ${
                service.featured
                  ? "border-[#176BFF] bg-[#071B33] text-white"
                  : "border-[#E2E8F0] bg-white text-[#071B33]"
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
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    service.featured
                      ? "bg-white/10"
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
                          ? "bg-white/10"
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
                  Découvrir la solution →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}