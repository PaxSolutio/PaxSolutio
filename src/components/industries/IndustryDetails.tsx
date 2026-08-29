import Link from "next/link";
import type { Industry } from "@/data/industries";

export default function IndustryDetails({
  industry,
}: {
  industry: Industry;
}) {
  return (
    <>
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                Sourcing {industry.name}
              </div>

              <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
                Ce qu&apos;il faut définir avant de rechercher un fournisseur.
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-[#657386]">
                {industry.intro}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {industry.sourcingPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 rounded-[18px] border border-[#E5EAF1] bg-[#FBFCFE] px-5 py-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[10px] font-black text-[#176BFF]">
                      ✓
                    </span>

                    <span className="text-sm font-bold text-[#071B33]">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F8FB] py-24 lg:py-32">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                Catégories
              </div>

              <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
                Exemples de produits à sourcer.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {industry.products.map((product) => (
                <div
                  key={product}
                  className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-5 text-sm font-extrabold text-[#071B33]"
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Points de vigilance
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
              Les éléments à vérifier avant de commander.
            </h2>

            <div className="mt-10 space-y-3">
              {industry.challenges.map((challenge, index) => (
                <div
                  key={challenge}
                  className="flex items-center gap-5 rounded-[20px] border border-[#E2E8F0] bg-[#FBFCFE] px-5 py-5"
                >
                  <span className="text-xs font-black text-[#176BFF]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-sm font-extrabold text-[#071B33]">
                    {challenge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Services PaxSolutio
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
              Les services mobilisables selon votre projet.
            </h2>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {industry.services.map((service) => (
                <div
                  key={service}
                  className="rounded-[20px] border border-[#E2E8F0] bg-white p-5"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF2FF] text-xs font-black text-[#176BFF]">
                    ✓
                  </div>

                  <div className="mt-5 text-sm font-extrabold text-[#071B33]">
                    {service}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#071B33] py-20 text-white lg:py-24">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
                Pour aller plus loin
              </div>

              <h2 className="max-w-[720px] text-[32px] font-extrabold leading-[1.1] tracking-[-0.04em] sm:text-[40px]">
                Reliez votre projet {industry.name.toLowerCase()} aux services
                dont vous avez réellement besoin.
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              {industry.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-12 items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-extrabold text-white transition hover:bg-white/[0.08]"
                >
                  {link.label}
                  <span className="ml-6 text-[#79A9FF]">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}