import Link from "next/link";
import { industries } from "@/data/industries";

export default function IndustriesGrid() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/secteurs/${industry.slug}`}
              className="group flex min-h-[320px] flex-col rounded-[28px] border border-[#E2E8F0] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-[#C9D9F1] hover:shadow-[0_22px_65px_rgba(7,27,51,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                  {industry.code}
                </span>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F6FB] text-[#176BFF] transition group-hover:bg-[#176BFF] group-hover:text-white">
                  →
                </span>
              </div>

              <div className="mt-auto">
                <h2 className="text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                  {industry.name}
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#657386]">
                  {industry.shortDescription}
                </p>

                <div className="mt-6 text-sm font-extrabold text-[#176BFF]">
                  Explorer le secteur →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}