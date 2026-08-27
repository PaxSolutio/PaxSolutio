import Link from "next/link";

export default function SupplierNetwork() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
        <div>
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Supplier Network
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Vous cherchez un fournisseur,
            <span className="text-[#176BFF]"> pas forcément une agence complète ?</span>
          </h2>

          <p className="mt-6 max-w-[590px] text-lg leading-8 text-[#657386]">
            Confiez-nous votre recherche et recevez une sélection de
            fournisseurs correspondant à votre produit, vos volumes, votre
            budget et votre marché cible.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Fabricants",
              "Grossistes",
              "Private Label",
              "OEM / ODM",
              "Multi-sector",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#52647B]"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href="/fournisseurs"
            className="mt-9 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
          >
            Lancer une recherche fournisseur
            <span className="ml-3">→</span>
          </Link>
        </div>

        <div className="relative">
          <div className="rounded-[32px] border border-[#E0E7F0] bg-white p-6 shadow-[0_25px_80px_rgba(7,27,51,0.08)] sm:p-8">
            <div className="flex items-start justify-between border-b border-[#EBEFF4] pb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Supplier Profile
                </div>

                <div className="mt-2 text-xl font-extrabold text-[#071B33]">
                  Manufacturer #PS-3821
                </div>
              </div>

              <span className="rounded-full bg-[#E9F8EF] px-4 py-2 text-xs font-extrabold text-[#247B46]">
                Verified ✓
              </span>
            </div>

            <div className="grid gap-4 py-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Category
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  Commercial Furniture
                </div>
              </div>

              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  MOQ
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  10 units
                </div>
              </div>

              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Export Markets
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  EU / Middle East
                </div>
              </div>

              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Factory Audit
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  Available
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE8F8] bg-[#F4F8FF] p-5">
              <div className="text-xs font-extrabold text-[#176BFF]">
                Exemple d&apos;interface
              </div>

              <p className="mt-2 text-xs leading-6 text-[#657386]">
                Les informations réelles seront adaptées aux fournisseurs et
                aux critères disponibles lors de chaque recherche.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}