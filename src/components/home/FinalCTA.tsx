import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-white px-6 py-20 lg:px-10 lg:py-28">
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[36px] bg-[#071B33] px-7 py-16 text-white sm:px-12 lg:px-16 lg:py-20">
        <div className="absolute right-[-120px] top-[-160px] h-[420px] w-[420px] rounded-full bg-[#176BFF]/20 blur-[30px]" />

        <div className="absolute bottom-[-200px] left-[20%] h-[380px] w-[380px] rounded-full bg-[#3CC7E8]/10 blur-[50px]" />

        <div className="relative z-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#75A8FF]">
              Start a project
            </div>

            <h2 className="max-w-[760px] text-[38px] font-extrabold leading-[1.06] tracking-[-0.05em] sm:text-[48px] lg:text-[58px]">
              Un projet à sourcer ?
              <br />
              Commençons par le comprendre.
            </h2>

            <p className="mt-6 max-w-[680px] text-base leading-8 text-white/60">
              Produit, fournisseur, véhicule ou transport : présentez-nous
              votre besoin afin de déterminer la solution adaptée à votre
              projet.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href="#project"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#2A79FF]"
            >
              Démarrer mon projet
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-extrabold text-white transition hover:bg-white/5"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}