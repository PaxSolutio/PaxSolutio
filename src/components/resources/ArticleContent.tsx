import Link from "next/link";
import type { Resource } from "@/data/resources";

export default function ArticleContent({
  resource,
}: {
  resource: Resource;
}) {
  return (
    <article className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[860px] px-6">
        <div className="rounded-[26px] border border-[#E2E8F0] bg-[#F8FAFD] p-7 sm:p-8">
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#176BFF]">
            À retenir
          </div>

          <p className="mt-4 text-lg font-semibold leading-8 text-[#34465D]">
            {resource.introduction}
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {resource.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-[#071B33] sm:text-[36px]">
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
                <div className="mt-8 space-y-3">
                  {section.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-4 rounded-[18px] border border-[#E9EEF5] bg-[#F8FAFD] px-5 py-4 text-sm font-bold leading-6 text-[#34465D]"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF2FF] text-[10px] font-black text-[#176BFF]">
                        ✓
                      </span>

                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {resource.relatedLinks.length > 0 && (
          <section className="mt-20 border-t border-[#E5EAF1] pt-12">
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#176BFF]">
              Continuer votre recherche
            </div>

            <h2 className="mt-4 text-[28px] font-extrabold tracking-[-0.035em] text-[#071B33]">
              Ressources et services associés
            </h2>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {resource.relatedLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="group flex min-h-16 items-center justify-between rounded-[18px] border border-[#E2E8F0] px-5 text-sm font-extrabold text-[#071B33] transition hover:border-[#BFD0EA] hover:bg-[#F8FAFD]"
                >
                  {link.label}

                  <span className="ml-4 text-[#176BFF] transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 rounded-[24px] bg-[#071B33] p-7 text-white sm:p-8">
          <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#79A9FF]">
            Besoin d&apos;aller plus loin ?
          </div>

          <p className="mt-4 text-base leading-7 text-white/60">
            Un guide présente les principes généraux. Le coût, les contraintes
            et la méthode peuvent varier selon votre produit, votre fournisseur,
            vos volumes et votre pays de destination.
          </p>

          <Link
            href="/#project"
            className="mt-6 inline-flex items-center text-sm font-extrabold text-white"
          >
            Présenter mon projet
            <span className="ml-3 text-[#79A9FF]">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}