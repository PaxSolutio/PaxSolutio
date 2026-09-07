import Link from "next/link";

const automotiveSteps = [
  "Recherche du véhicule en Chine",
  "Vérification vendeur / véhicule",
  "Comparaison des offres",
  "Coordination export",
  "Transport RoRo ou conteneur",
  "Suivi logistique",
];

export default function AutomotiveSection() {
  return (
    <section className="overflow-hidden bg-[#071B33] py-14 text-white lg:py-24">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-10">
        {/* VISUEL */}
        <div className="group relative overflow-hidden rounded-[30px] border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="group relative overflow-hidden rounded-[30px] border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <img
              src="/sectors/automobile.jpg"
              alt="Sourcing automobile international depuis la Chine"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#071B33]/85 via-[#071B33]/10 to-transparent" />

            <div className="absolute left-5 top-5">
              <span className="inline-flex rounded-full border border-white/20 bg-[#071B33]/55 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur">
                Sourcing automobile Chine
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="max-w-[470px]">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
                  Recherche multi-marques
                </div>

                <div className="mt-2 text-2xl font-extrabold tracking-[-0.03em]">
                  Véhicules neufs ou selon disponibilité marché
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur">
                  Chine
                </span>

                <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur">
                  Export
                </span>

                <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur">
                  RoRo
                </span>

                <span className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur">
                  Conteneur
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU */}
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#74A8FF]">
            Sourcing automobile
          </div>

          <h2 className="mt-4 max-w-[650px] text-[38px] font-extrabold leading-[1.05] tracking-[-0.05em] sm:text-[46px] lg:text-[50px]">
            Recherchez et importez des véhicules
            <span className="text-[#74A8FF]">
              {" "}
              depuis la Chine.
            </span>
          </h2>

          <p className="mt-6 max-w-[620px] text-base leading-8 text-white/65">
            PaxSolutio accompagne la recherche, la comparaison et la
            vérification des offres disponibles sur le marché chinois, puis la
            coordination de l&apos;export et du transport international.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {automotiveSteps.map((step) => (
              <div
                key={step}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition duration-300 hover:border-[#176BFF]/50 hover:bg-white/[0.07]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#176BFF]/20 text-xs font-black text-[#8EB6FF] transition group-hover:bg-[#176BFF] group-hover:text-white">
                  ✓
                </span>

                <span className="text-sm font-semibold text-white/80">
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sourcing-automobile#vehicle-request"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#176BFF] px-7 text-sm font-extrabold !text-white transition hover:-translate-y-0.5 hover:bg-[#2E7BFF]"
            >
              Rechercher un véhicule
              <span className="ml-3">→</span>
            </Link>

            <Link
              href="/sourcing-automobile"
              className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 px-7 text-sm font-extrabold !text-white transition hover:bg-white/5"
            >
              Découvrir le service
            </Link>
          </div>

          <p className="mt-5 max-w-[560px] text-xs leading-6 text-white/40">
            Les disponibilités, prix, configurations et conditions
            d&apos;export varient selon le véhicule, le fournisseur et le
            marché de destination.
          </p>
        </div>
      </div>
    </section>
  );
}