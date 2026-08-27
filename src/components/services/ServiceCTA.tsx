import Link from "next/link";

type ServiceCTAProps = {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
};

export default function ServiceCTA({
  title,
  description,
  buttonLabel,
  href,
}: ServiceCTAProps) {
  return (
    <section className="bg-white px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1320px] rounded-[36px] bg-[#F1F6FF] px-7 py-14 sm:px-12 lg:px-16 lg:py-18">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="max-w-[720px] text-[36px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[46px]">
              {title}
            </h2>

            <p className="mt-5 max-w-[650px] text-base leading-8 text-[#657386]">
              {description}
            </p>
          </div>

          <Link
            href={href}
            className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
          >
            {buttonLabel}
            <span className="ml-3">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}