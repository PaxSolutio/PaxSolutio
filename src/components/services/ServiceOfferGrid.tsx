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
          {offers.map((offer) => (
            <div
              key={offer.title}
              className="rounded-[26px] border border-white/10 bg-white/[0.04] p-7"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#176BFF]/20 text-[#8CB8FF]">
                ✓
              </div>

              <h3 className="mt-8 text-xl font-extrabold">
                {offer.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                {offer.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}