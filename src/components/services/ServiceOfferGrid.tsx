type Offer = {
  title: string;
  description: string;
};

type ServiceOfferGridProps = {
  eyebrow?: string;
  title: string;
  offers: Offer[];
};

export default function ServiceOfferGrid({
  eyebrow,
  title,
  offers,
}: ServiceOfferGridProps) {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[760px]">
          {eyebrow && (
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#74A8FF]">
              {eyebrow}
            </div>
          )}

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            {title}
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, index) => {
            const isQualityVisual = index === 7;

            if (isQualityVisual) {
              return (
                <div
                  key={offer.title}
                  className="group relative min-h-[250px] overflow-hidden rounded-[26px] border border-white/10 transition duration-300 hover:-translate-y-1"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-[1.03]"
                    style={{
                      backgroundImage: "url('/sourcing/controle-qualite-terrain.jpg')",
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#071B33]/95 via-[#071B33]/65 to-[#071B33]/20" />

                  <div className="relative z-10 flex min-h-[250px] flex-col p-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#176BFF] text-[11px] font-black text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-xl font-extrabold !text-white">
                        {offer.title}
                      </h3>

                      <p className="mt-4 text-sm leading-7 text-white/70">
                        {offer.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={offer.title}
                className={`group rounded-[26px] border p-7 transition duration-300 hover:-translate-y-1 ${index < 3
                    ? "border-[#176BFF]/50 bg-[#0D2949] shadow-[0_18px_50px_rgba(0,0,0,0.12)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-black ${index < 3
                      ? "bg-[#176BFF] text-white"
                      : "bg-white/[0.06] text-[#8CB8FF]"
                    }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3 className="mt-8 text-xl font-extrabold">
                  {offer.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  {offer.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}