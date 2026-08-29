import Link from "next/link";

export default function SuppliersHero() {
  return (
    <section className="relative overflow-hidden bg-white pb-24 pt-40 lg:pb-32 lg:pt-48">
      <div className="absolute right-[-180px] top-[-100px] h-[560px] w-[560px] rounded-full bg-[#EAF2FF] blur-[50px]" />
      <div className="absolute bottom-[-220px] left-[10%] h-[480px] w-[480px] rounded-full bg-[#E8F8FC] blur-[60px]" />

      <div className="mx-auto grid max-w-[1320px] gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
        <div className="relative z-10">
          <div className="mb-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            Recherche fournisseurs en Chine
          </div>

          <h1 className="max-w-[800px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[#071B33] sm:text-[58px] lg:text-[70px]">
            Trouvez un fournisseur en Chine
            <span className="text-[#176BFF]"> adapté à votre produit et à votre marché.</span>
          </h1>

          <p className="mt-7 max-w-[720px] text-lg leading-8 text-[#657386] lg:text-xl">
            PaxSolutio recherche, présélectionne et compare des fabricants et fournisseurs
            en Chine selon votre produit, vos volumes, votre budget, vos exigences qualité
            et les critères définis dans votre cahier des charges.
          </p>

          <p className="mt-7 max-w-[720px] text-lg leading-8 text-[#657386] lg:text-xl">
            PaxSolutio recherche et présélectionne des fabricants selon votre
            produit, vos volumes, votre budget, votre marché et les critères
            définis dans votre cahier des charges.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#supplier-request"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0F5BE0]"
            >
              Rechercher des fournisseurs
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="#supplier-process"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#DDE5EF] bg-white px-7 text-sm font-extrabold text-[#071B33] transition hover:bg-[#F7F9FC]"
            >
              Voir notre méthode
            </Link>
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <div className="absolute inset-0 rounded-[36px] border border-[#E2E9F2] bg-[#F7F9FC]" />

          <div className="absolute left-[8%] right-[8%] top-[9%] rounded-[26px] border border-[#E2E8F0] bg-white p-6 shadow-[0_25px_70px_rgba(7,27,51,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#176BFF]">
                  Supplier Match
                </div>

                <div className="mt-3 text-xl font-extrabold text-[#071B33]">
                  Manufacturer #PS-3821
                </div>
              </div>

              <span className="rounded-full bg-[#E9F8EF] px-3 py-2 text-[10px] font-extrabold text-[#247B46]">
                QUALIFIED
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Category", "Furniture"],
                ["MOQ", "10 units"],
                ["Market", "EU"],
                ["OEM / ODM", "Available"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#F6F8FB] p-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[#8A99AC]">
                    {label}
                  </div>

                  <div className="mt-1 text-sm font-extrabold text-[#071B33]">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-[9%] left-[8%] right-[8%] grid grid-cols-3 gap-3">
            {["Search", "Compare", "Select"].map((item, index) => (
              <div
                key={item}
                className="rounded-[20px] border border-[#E1E8F0] bg-white p-5"
              >
                <div className="text-[10px] font-black text-[#176BFF]">
                  0{index + 1}
                </div>

                <div className="mt-3 text-sm font-extrabold text-[#071B33]">
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}