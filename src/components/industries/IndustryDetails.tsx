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
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
                Products
              </div>

              <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
                Catégories de produits.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {industry.products.map((product) => (
                <div
                  key={product}
                  className="rounded-2xl border border-[#E5EAF1] bg-[#FBFCFE] px-5 py-5 text-sm font-extrabold text-[#071B33]"
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F8FB] py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Challenges
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
              Les points à surveiller.
            </h2>

            <div className="mt-10 space-y-3">
              {industry.challenges.map((challenge, index) => (
                <div
                  key={challenge}
                  className="flex items-center gap-5 rounded-[20px] border border-[#E2E8F0] bg-white px-5 py-5"
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
              PaxSolutio Services
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px]">
              Les services mobilisables.
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
    </>
  );
}