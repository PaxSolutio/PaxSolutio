import type { Resource } from "@/data/resources";

export default function ArticleContent({
  resource,
}: {
  resource: Resource;
}) {
  return (
    <article className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[820px] px-6">
        <p className="text-xl leading-9 text-[#52647B]">
          {resource.introduction}
        </p>

        <div className="mt-16 space-y-16">
          {resource.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[30px] font-extrabold tracking-[-0.035em] text-[#071B33] sm:text-[36px]">
                {section.heading}
              </h2>

              <div className="mt-6 space-y-5">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-[#657386]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.points && (
                <div className="mt-7 space-y-3">
                  {section.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-4 rounded-[18px] bg-[#F6F8FB] px-5 py-4 text-sm font-bold text-[#34465D]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF2FF] text-[10px] text-[#176BFF]">
                        ✓
                      </span>

                      {point}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}