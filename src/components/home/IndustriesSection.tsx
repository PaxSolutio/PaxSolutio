import Link from "next/link";

const industries = [
  {
    title: "Maison & Électroménager",
    href: "/secteurs/maison",
    code: "01",
  },
  {
    title: "Textile & Mode",
    href: "/secteurs/textile",
    code: "02",
  },
  {
    title: "E-commerce",
    href: "/secteurs/ecommerce",
    code: "03",
  },
];

export default function IndustriesSection() {
  return (
    <section className="bg-[#F6F8FB] py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          {/* INTRO */}
          <div>
            <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
              Et au-delà
            </div>

            <h2 className="max-w-[520px] text-[32px] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#071B33] sm:text-[38px]">
              Votre produit ne rentre pas
              <span className="text-[#176BFF]"> dans une seule catégorie.</span>
            </h2>

            <p className="mt-5 max-w-[500px] text-sm leading-7 text-[#657386]">
              Notre réseau permet également d&apos;étudier des projets dans
              d&apos;autres univers selon le produit, les volumes recherchés et
              le marché de destination.
            </p>

            <Link
              href="/secteurs"
              className="mt-6 inline-flex items-center gap-3 text-sm font-extrabold !text-[#071B33] transition hover:text-[#176BFF]"
            >
              Découvrir tous les secteurs
              <span>→</span>
            </Link>
          </div>

          {/* AUTRES SECTEURS */}
          <div className="overflow-hidden rounded-[26px] border border-[#E1E7EF] bg-white">
            {industries.map((industry, index) => (
              <Link
                key={industry.title}
                href={industry.href}
                className={`group flex min-h-[92px] items-center gap-5 px-6 transition hover:bg-[#F8FAFD] sm:px-8 ${
                  index !== industries.length - 1
                    ? "border-b border-[#E6ECF3]"
                    : ""
                }`}
              >
                <span className="w-8 text-[10px] font-black tracking-[0.16em] text-[#176BFF]">
                  {industry.code}
                </span>

                <span className="flex-1 text-base font-extrabold tracking-[-0.02em] text-[#071B33] sm:text-lg">
                  {industry.title}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F6FB] text-[#176BFF] transition duration-300 group-hover:bg-[#176BFF] group-hover:text-white">
                  →
                </span>
              </Link>
            ))}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E6ECF3] bg-[#FBFCFE] px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#8A96A5] sm:px-8">
              <span>Produit</span>
              <span className="text-[#176BFF]">→</span>
              <span>Contraintes</span>
              <span className="text-[#176BFF]">→</span>
              <span>Fournisseurs</span>
              <span className="text-[#176BFF]">→</span>
              <span>Marché cible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}