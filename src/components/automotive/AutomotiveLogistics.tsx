import Link from "next/link";

export default function AutomotiveLogistics() {
  return (
    <section className="bg-[#071B33] py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#74A8FF]">
              Logistique automobile internationale
            </div>

            <h2 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[48px] lg:text-[54px]">
              Le véhicule est sélectionné.
              <br />
              <span className="text-[#6EA4FF]">
                Il faut maintenant organiser son acheminement.
              </span>
            </h2>

            <p className="mt-6 max-w-[580px] text-base leading-8 text-white/60">
              Selon le véhicule, le port de départ, les lignes disponibles et le pays
              de destination, PaxSolutio peut étudier avec OneBillionForwarders une
              solution de transport RoRo ou en conteneur.
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
                Transport RoRo
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Le véhicule est chargé et déchargé en roulant sur un navire roulier,
                lorsque des lignes adaptées sont disponibles entre les ports concernés.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
              <span className="text-xs font-black tracking-[0.18em] text-[#7FAEFF]">
                CONTAINER
              </span>

              <h3 className="mt-12 text-2xl font-extrabold">
                Transport en conteneur
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Le véhicule est acheminé dans un conteneur lorsque cette solution est
                compatible avec ses dimensions, la route disponible et les contraintes
                de l'opération.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}