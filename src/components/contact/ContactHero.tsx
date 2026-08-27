export default function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-[#071B33] pb-20 pt-40 text-white lg:pb-24 lg:pt-48">
      <div className="absolute right-[-180px] top-[-100px] h-[520px] w-[520px] rounded-full bg-[#176BFF]/20 blur-[50px]" />

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="max-w-[880px]">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#79A9FF]">
            Contact
          </div>

          <h1 className="mt-6 text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-[58px] lg:text-[68px]">
            Parlons de
            <span className="text-[#6EA4FF]"> votre projet.</span>
          </h1>

          <p className="mt-7 max-w-[720px] text-lg leading-8 text-white/60">
            Sourcing, fournisseur, automobile, contrôle ou logistique :
            transmettez-nous les informations disponibles.
          </p>
        </div>
      </div>
    </section>
  );
}