import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#071B33] text-white">
      <div className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.85fr_0.85fr_0.85fr]">
          <div>
            <Link
              href="/"
              className="text-[22px] font-extrabold tracking-[-0.04em] text-white"
            >
              PAX
              <span className="text-[#176BFF]">
                SOLUTIO
              </span>
            </Link>

            <p className="mt-5 max-w-[380px] text-sm leading-7 text-white/55">
              Sourcing en Chine, recherche fournisseurs,
              développement produit, contrôle qualité et
              accompagnement logistique pour les entreprises
              développant leurs approvisionnements à
              l&apos;international.
            </p>

            <div className="mt-9">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#79A9FF]">
                Partenaire logistique
              </div>

              <a
                href="https://www.obforwarders.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold !text-white transition hover:!text-[#79A9FF]"
              >
                OneBillionForwarders
                <span>↗</span>
              </a>

              <p className="mt-2 max-w-[340px] text-xs leading-6 text-white/40">
                Solutions de transport maritime,
                aérien, ferroviaire et routier pour
                les opérations internationales.
              </p>
            </div>

            <div className="mt-9">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#79A9FF]">
                Suivez PaxSolutio
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/paxsolutiofr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold !text-white/70 transition hover:border-white/20 hover:!text-white"
                >
                  Instagram
                </a>

                <a
                  href="https://www.linkedin.com/in/medhy-desgrugillers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold !text-white/70 transition hover:border-white/20 hover:!text-white"
                >
                  LinkedIn
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61582208032908"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold !text-white/70 transition hover:border-white/20 hover:!text-white"
                >
                  Facebook
                </a>

                <a
                  href="https://www.tiktok.com/@paxsolutio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold !text-white/70 transition hover:border-white/20 hover:!text-white"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold">
              Solutions
            </h3>

            <div className="mt-6 space-y-4 text-sm">
              <Link
                href="/sourcing"
                className="block !text-white/65 transition hover:!text-white"
              >
                Sourcing en Chine
              </Link>

              <Link
                href="/fournisseurs"
                className="block !text-white/65 transition hover:!text-white"
              >
                Recherche fournisseurs
              </Link>

              <Link
                href="/developpement-produit"
                className="block !text-white/65 transition hover:!text-white"
              >
                Développement produit
              </Link>

              <Link
                href="/controle-qualite"
                className="block !text-white/65 transition hover:!text-white"
              >
                Contrôle qualité
              </Link>

              <Link
                href="/logistique"
                className="block !text-white/65 transition hover:!text-white"
              >
                Logistique internationale
              </Link>

              <Link
                href="/dropshipping"
                className="block !text-white/65 transition hover:!text-white"
              >
                Dropshipping & Fulfillment
              </Link>

              <Link
                href="/sourcing-automobile"
                className="block !text-white/65 transition hover:!text-white"
              >
                Sourcing automobile
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold">
              Secteurs
            </h3>

            <div className="mt-6 space-y-4 text-sm">
              <Link
                href="/secteurs/automobile"
                className="block !text-white/65 transition hover:!text-white"
              >
                Automobile
              </Link>

              <Link
                href="/secteurs/construction"
                className="block !text-white/65 transition hover:!text-white"
              >
                Machines & Construction
              </Link>

              <Link
                href="/secteurs/mobilier"
                className="block !text-white/65 transition hover:!text-white"
              >
                Mobilier
              </Link>

              <Link
                href="/secteurs/beaute"
                className="block !text-white/65 transition hover:!text-white"
              >
                Beauté & Esthétique
              </Link>

              <Link
                href="/secteurs/electronique"
                className="block !text-white/65 transition hover:!text-white"
              >
                Électronique
              </Link>

              <Link
                href="/secteurs"
                className="block font-extrabold !text-[#79A9FF] transition hover:!text-white"
              >
                Tous les secteurs →
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold">
              Explorer
            </h3>

            <div className="mt-6 space-y-4 text-sm">
              <Link
                href="/ressources"
                className="block !text-white/65 transition hover:!text-white"
              >
                Guides & ressources
              </Link>

              <Link
                href="/ressources/trouver-fournisseur-fiable-chine"
                className="block !text-white/65 transition hover:!text-white"
              >
                Trouver un fournisseur
              </Link>

              <Link
                href="/ressources/calculer-cout-revient-import"
                className="block !text-white/65 transition hover:!text-white"
              >
                Calculer un coût d&apos;import
              </Link>

              <Link
                href="/ressources/importer-voiture-chine"
                className="block !text-white/65 transition hover:!text-white"
              >
                Import automobile
              </Link>

              <Link
                href="/a-propos"
                className="block !text-white/65 transition hover:!text-white"
              >
                À propos
              </Link>

              <Link
                href="/contact"
                className="block !text-white/65 transition hover:!text-white"
              >
                Contact
              </Link>
            </div>

            <div className="mt-9 rounded-[18px] border border-white/10 bg-white/[0.035] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#79A9FF]">
                Ressources
              </div>

              <p className="mt-3 text-xs leading-6 text-white/45">
                Guides, analyses et futures nouveautés
                autour du sourcing, de l&apos;import et
                des opportunités internationales.
              </p>

              <Link
                href="/ressources"
                className="mt-4 inline-flex text-xs font-extrabold !text-white"
              >
                Explorer les contenus →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-7">
          <div className="flex flex-col gap-5 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
            <div>
              © 2024–{new Date().getFullYear()} PaxSolutio.
              Tous droits réservés.
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Link
                href="/mentions-legales"
                className="!text-white/40 transition hover:!text-white"
              >
                Mentions légales
              </Link>

              <Link
                href="/confidentialite"
                className="!text-white/40 transition hover:!text-white"
              >
                Politique de confidentialité
              </Link>

              <Link
                href="/contact"
                className="!text-white/40 transition hover:!text-white"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}