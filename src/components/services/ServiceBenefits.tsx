type Benefit = {
  number: string;
  title: string;
  description: string;
};

type ServiceBenefitsProps = {
  title: string;
  intro?: string;
  benefits: Benefit[];
};

export default function ServiceBenefits({
  title,
  intro,
  benefits,
}: ServiceBenefitsProps) {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[760px]">
          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            {title}
          </h2>

          {intro && (
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-[#657386]">
              {intro}
            </p>
          )}
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.number}
              className="rounded-[28px] border border-[#E4EAF2] bg-white p-8"
            >
              <span className="text-xs font-black tracking-[0.18em] text-[#176BFF]">
                {benefit.number}
              </span>

              <h3 className="mt-12 text-2xl font-extrabold tracking-[-0.035em] text-[#071B33]">
                {benefit.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#657386]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}