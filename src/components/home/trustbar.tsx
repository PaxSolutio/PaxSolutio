const steps = [
  "Sourcing",
  "Inspection",
  "Consolidation",
  "Freight",
  "Customs",
  "Delivery",
];

export default function TrustBar() {
  return (
    <section className="border-y border-[#E8EDF4] bg-[#FBFCFE]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-7 lg:flex-row lg:px-10">
        <p className="max-w-[360px] text-sm font-semibold leading-6 text-[#657386]">
          Une chaîne d&apos;approvisionnement coordonnée depuis un seul
          interlocuteur.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#34465D]">
                {step}
              </span>

              {index < steps.length - 1 && (
                <span className="hidden text-[#9FB0C4] sm:block">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}