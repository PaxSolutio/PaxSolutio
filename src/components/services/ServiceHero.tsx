import Link from "next/link";

type ServiceHeroProps = {
  eyebrow: string;
  title: string;
  highlightedText?: string;
  description: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta?: string;
  secondaryHref?: string;
};

export default function ServiceHero({
  eyebrow,
  title,
  highlightedText,
  description,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
}: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute right-[-180px] top-[20px] h-[520px] w-[520px] rounded-full bg-[#EAF2FF] blur-[40px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="relative z-10 max-w-[920px]">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            {eyebrow}
          </div>

          <h1 className="text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[72px]">
            {title}
            {highlightedText && (
              <>
                {" "}
                <span className="text-[#176BFF]">{highlightedText}</span>
              </>
            )}
          </h1>

          <p className="mt-7 max-w-[760px] text-lg leading-8 text-[#657386] lg:text-xl">
            {description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              {primaryCta}
              <span className="ml-3">→</span>
            </Link>

            {secondaryCta && secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#DDE5EF] bg-white px-7 text-sm font-extrabold text-[#071B33] transition hover:bg-[#F7F9FC]"
              >
                {secondaryCta}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}