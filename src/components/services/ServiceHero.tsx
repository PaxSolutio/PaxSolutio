import Image from "next/image";
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

  image?: string;
  imageAlt?: string;
  badge?: string;
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
  image,
  imageAlt,
  badge,
}: ServiceHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="pointer-events-none absolute right-[-180px] top-[20px] -z-10 h-[520px] w-[520px] rounded-full bg-[#EAF2FF] blur-[40px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div
          className={
            image
              ? "grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
              : ""
          }
        >
          <div className={image ? "" : "relative z-10 max-w-[920px]"}>
            <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              {eyebrow}
            </div>

            <h1
              className={`font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] ${
                image
                  ? "text-[42px] sm:text-[54px] lg:text-[64px]"
                  : "text-[46px] sm:text-[58px] lg:text-[72px]"
              }`}
            >
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
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
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

          {image && (
            <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-[#DDE5EF] bg-[#F6F8FB] shadow-[0_20px_60px_rgba(7,27,51,0.08)] sm:min-h-[440px] lg:min-h-[520px]">
              <Image
                src={image}
                alt={imageAlt || eyebrow}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-[135%_5%]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#071B33]/45 via-transparent to-transparent" />

              {badge && (
                <div className="absolute bottom-6 left-6">
                  <div className="rounded-full border border-white/15 bg-[#071B33]/65 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] !text-white backdrop-blur-md">
                    {badge}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}