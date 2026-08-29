export default function SupplierProfilePreview() {
  const data = [
    ["Type", "Manufacturer"],
    ["Product", "Commercial Furniture"],
    ["MOQ", "10 units"],
    ["Customization", "OEM / ODM"],
    ["Export Market", "Europe"],
    ["Audit", "Available"],
  ];

  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10">
        <div>
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            Comparatif fournisseur
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            Comparez les fournisseurs au-delà
            <span className="text-[#6EA4FF]"> du simple prix unitaire.</span>
          </h2>

          <p className="mt-6 max-w-[580px] text-base leading-8 text-white/60">
            Selon la mission et les informations disponibles, un fournisseur peut être
            comparé sur ses MOQ, ses délais, ses capacités de production, ses options
            OEM/ODM, ses marchés export, ses possibilités de personnalisation et les
            vérifications disponibles.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-7 sm:p-9">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                Example Profile
              </div>

              <div className="mt-2 text-xl font-extrabold">
                Supplier #PS-3821
              </div>
            </div>

            <span className="rounded-full bg-[#176BFF]/20 px-4 py-2 text-xs font-bold text-[#8CB8FF]">
              SHORTLIST
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {data.map(([label, value]) => (
              <div
                key={label}
                className="rounded-[18px] border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                  {label}
                </div>

                <div className="mt-2 text-sm font-bold">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[18px] bg-[#176BFF]/10 p-5">
            <div className="text-xs font-bold text-[#8CB8FF]">
              Exemple uniquement
            </div>

            <p className="mt-2 text-xs leading-6 text-white/45">
              Cette fiche illustre le type d&apos;informations que nous
              pourrons présenter. Elle ne correspond pas à un fournisseur réel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}