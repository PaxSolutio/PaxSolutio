import Link from "next/link";

export default function SupplierNetwork() {
  return (
    <section className="bg-[#F6F8FB] py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
        <div>
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Recherche fournisseurs Chine
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Vous avez le produit.
            <span className="text-[#176BFF]">
              {" "}
              Trouvons les fabricants à comparer.
            </span>
          </h2>

          <p className="mt-6 max-w-[600px] text-lg leading-8 text-[#657386]">
            Confiez-nous votre recherche pour identifier des fabricants et
            fournisseurs correspondant à votre produit, vos volumes, vos
            spécifications, votre budget et votre marché.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Fabricants",
              "Grossistes",
              "Private Label",
              "OEM / ODM",
              "Multi-secteurs",
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
            Rechercher des fournisseurs
            <span className="ml-3">→</span>
          </Link>
        </div>

        <div className="relative">
          <div className="rounded-[32px] border border-[#E0E7F0] bg-white p-6 shadow-[0_25px_80px_rgba(7,27,51,0.08)] sm:p-8">
            <div className="flex items-start justify-between border-b border-[#EBEFF4] pb-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Exemple fournisseur
                </div>

                <div className="mt-2 text-xl font-extrabold text-[#071B33]">
                  Fabricant #PS-3821
                </div>
              </div>

              <span className="rounded-full bg-[#E9F8EF] px-4 py-2 text-xs font-extrabold text-[#247B46]">
                Vérifié ✓
              </span>
            </div>

            <div className="grid gap-4 py-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Catégorie
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  Mobilier professionnel
                </div>
              </div>

              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  MOQ
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  Selon produit
                </div>
              </div>

              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Marchés export
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  Europe / International
                </div>
              </div>

              <div className="rounded-2xl bg-[#F6F8FB] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                  Audit usine
                </div>
                <div className="mt-2 font-extrabold text-[#071B33]">
                  Selon besoin
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE8F8] bg-[#F4F8FF] p-5">
              <div className="text-xs font-extrabold text-[#176BFF]">
                Exemple de présentation
              </div>

              <p className="mt-2 text-xs leading-6 text-[#657386]">
                Les critères et informations disponibles varient selon le
                fournisseur, le produit et le niveau de vérification demandé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}