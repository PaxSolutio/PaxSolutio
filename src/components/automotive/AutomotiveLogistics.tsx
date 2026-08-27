import Link from "next/link";

export default function AutomotiveLogistics() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#74A8FF]">
              Automotive Logistics
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
              Le véhicule sélectionné.
              <br />
              <span className="text-[#6EA4FF]">La logistique déjà connectée.</span>
            </h2>

            <p className="mt-6 max-w-[580px] text-base leading-8 text-white/60">
              Selon la route, le véhicule et la destination, nous pouvons
              étudier une solution RoRo ou conteneur avec notre partenaire
              logistique OneBillionForwarders.
            </p>

            <Link
              href="/logistique"
              className="mt-9 inline-flex min-h-14 items-center justify-center rounded-xl bg-white px-7 text-sm font-extrabold text-[#071B33] transition hover:-translate-y-0.5"
            >
              Découvrir la logistique
              <span className="ml-3">→</span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
              <span className="text-xs font-black tracking-[0.18em] text-[#7FAEFF]">
                RORO
              </span>

              <h3 className="mt-12 text-2xl font-extrabold">
                Roll-on / Roll-off
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Transport roulier selon les lignes disponibles, le port de
                départ et la destination.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
              <span className="text-xs font-black tracking-[0.18em] text-[#7FAEFF]">
                CONTAINER
              </span>

              <h3 className="mt-12 text-2xl font-extrabold">
                Container Shipping
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Acheminement conteneurisé selon les dimensions, le volume et
                les contraintes du projet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}