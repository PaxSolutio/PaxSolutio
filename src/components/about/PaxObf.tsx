export default function PaxObf() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-14 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            PaxSolutio × OneBillionForwarders
          </div>

          <h2 className="mt-5 text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
            Le sourcing connecté
            <span className="text-[#6EA4FF]"> à la logistique.</span>
          </h2>

          <p className="mt-6 max-w-[600px] text-base leading-8 text-white/60">
            PaxSolutio intervient sur l&apos;approvisionnement, le contrôle et
            la coordination du projet. OneBillionForwarders complète cette
            chaîne sur les besoins de transport et logistique internationale.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["PaxSolutio", "Sourcing & Project Coordination"],
            ["OneBillionForwarders", "Freight & Logistics"],
          ].map(([name, role]) => (
            <div
              key={name}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8"
            >
              <div className="text-xl font-extrabold">{name}</div>
              <div className="mt-3 text-sm text-white/45">{role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}