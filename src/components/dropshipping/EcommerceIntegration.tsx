export default function EcommerceIntegration() {
  const platforms = [
    "Shopify",
    "WooCommerce",
    "Amazon",
    "Marketplace",
    "Custom Store",
  ];

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
        <div>
          <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#176BFF]">
            E-commerce Integration
          </div>

          <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#071B33] sm:text-[48px] lg:text-[54px]">
            Une infrastructure pensée pour
            <span className="text-[#176BFF]"> évoluer avec vos commandes.</span>
          </h2>

          <p className="mt-6 max-w-[590px] text-base leading-8 text-[#657386]">
            À terme, les flux pourront être reliés à votre boutique ou à vos
            outils afin d&apos;automatiser davantage la transmission des
            commandes et des informations logistiques.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="rounded-full bg-[#F2F6FB] px-4 py-2 text-xs font-bold text-[#52647B]"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#E1E8F0] bg-[#F7F9FC] p-7 sm:p-9">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#176BFF]">
            Order Flow
          </div>

          <div className="mt-7 space-y-3">
            {[
              ["01", "Customer Order"],
              ["02", "Order Received"],
              ["03", "Warehouse Processing"],
              ["04", "Pick & Pack"],
              ["05", "Carrier"],
              ["06", "Tracking"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="flex items-center gap-5 rounded-[20px] border border-[#E2E8F0] bg-white px-5 py-5"
              >
                <span className="text-xs font-black text-[#176BFF]">
                  {number}
                </span>

                <span className="font-extrabold text-[#071B33]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[18px] bg-[#EAF2FF] p-5">
            <div className="text-xs font-extrabold text-[#176BFF]">
              Future feature
            </div>

            <p className="mt-2 text-xs leading-6 text-[#657386]">
              Les intégrations API et automatisations seront proposées selon
              les plateformes et les services effectivement disponibles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}