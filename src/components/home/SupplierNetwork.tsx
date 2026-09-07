import Link from "next/link";

const supplierCriteria = [
  {
    label: "Catégorie",
    value: "Mobilier professionnel",
  },
  {
    label: "MOQ",
    value: "Selon produit",
  },
  {
    label: "Marchés export",
    value: "Europe / International",
  },
  {
    label: "Audit usine",
    value: "Selon besoin",
  },
];

export default function SupplierNetwork() {
  return (
    <section className="bg-[#F6F8FB] py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-10">

        {/* CONTENU */}

        <div>
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Recherche fournisseurs Chine
          </div>

          <h2 className="mt-4 max-w-[590px] text-[36px] font-extrabold leading-[1.06] tracking-[-0.045em] text-[#071B33] sm:text-[44px] lg:text-[48px]">
            Vous avez le produit.
            <span className="text-[#176BFF]">
              {" "}
              Trouvons les fabricants à comparer.
            </span>
          </h2>

          <p className="mt-6 max-w-[570px] text-base leading-8 text-[#657386]">
            Nous recherchons des fabricants correspondant à votre produit,
            vos volumes, vos spécifications et votre marché afin de construire
            une première sélection à comparer.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {[
              "Fabricants",
              "Grossistes",
              "Private Label",
              "OEM / ODM",
              "Multi-secteurs",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#E1E8F0] bg-white px-3 py-2 text-[11px] font-bold text-[#52647B]"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href="/fournisseurs"
            className="mt-8 inline-flex min-h-13 items-center justify-center rounded-xl bg-[#176BFF] px-6 text-sm font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
          >
            Rechercher des fournisseurs

            <span className="ml-3">
              →
            </span>
          </Link>
        </div>

        {/* EXEMPLE FOURNISSEUR */}

        <div className="group relative">
          <div className="rounded-[30px] border border-[#DDE5EE] bg-white p-7 shadow-[0_20px_60px_rgba(7,27,51,0.06)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_75px_rgba(7,27,51,0.09)] sm:p-8">

            <div className="flex items-start justify-between gap-5 border-b border-[#EBEFF4] pb-6">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A99AC]">
                  Exemple fournisseur
                </div>

                <div className="mt-2 text-xl font-extrabold tracking-[-0.025em] text-[#071B33]">
                  Fabricant #PS-3821
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-[#E9F8EF] px-4 py-2 text-[11px] font-extrabold text-[#247B46]">
                Vérifié ✓
              </span>
            </div>

            <div className="grid gap-3 py-6 sm:grid-cols-2">
              {supplierCriteria.map((criterion) => (
                <div
                  key={criterion.label}
                  className="rounded-2xl bg-[#F6F8FB] p-5 transition duration-300 group-hover:bg-[#F2F7FF]"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A99AC]">
                    {criterion.label}
                  </div>

                  <div className="mt-2 text-sm font-extrabold text-[#071B33]">
                    {criterion.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#D9E6FA] bg-[#F4F8FF] p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#176BFF]/10 text-xs font-black text-[#176BFF]">
                  i
                </span>

                <div className="text-xs font-extrabold text-[#176BFF]">
                  Exemple de présentation fournisseur
                </div>
              </div>

              <p className="mt-3 text-xs leading-6 text-[#657386]">
                Les informations disponibles et le niveau de vérification
                dépendent du fournisseur, du produit et des contrôles demandés.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#EBEFF4] pt-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#64758A]">
              <span>Recherche</span>
              <span className="text-[#A7B3C1]">→</span>
              <span>Comparaison</span>
              <span className="text-[#A7B3C1]">→</span>
              <span>Vérification</span>
              <span className="text-[#A7B3C1]">→</span>
              <span>Sélection</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}