import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#071B33] text-white">
      <div className="mx-auto max-w-[1320px] px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr]">

          {/* PAXSOLUTIO */}

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

            <p className="mt-5 max-w-[360px] text-sm leading-7 text-white/55">
              Solutions de sourcing, contrôle qualité et accompagnement
              logistique pour les entreprises et entrepreneurs développant
              leurs approvisionnements à l&apos;international.
            </p>

            {/* PARTENAIRE LOGISTIQUE */}

            <div className="mt-9">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#79A9FF]">
                Logistics Partner
              </div>

              <a
                href="https://www.obforwarders.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold !text-white transition hover:text-[#79A9FF]"
              >
                OneBillionForwarders
                <span>↗</span>
              </a>

              <p className="mt-2 max-w-[320px] text-xs leading-6 text-white/40">
                Solutions internationales de transport maritime, aérien,
                ferroviaire et routier.
              </p>
            </div>
            <div className="mt-9">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#79A9FF]">
                Suivez-nous
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

          {/* SOURCING */}

          <div>
            <h3 className="text-sm font-extrabold">
              Sourcing
            </h3>

            <div className="mt-6 space-y-4 text-sm">
              <Link
                href="/sourcing"
                className="block !text-white/65 transition hover:!text-white"
              >
                Sourcing international
              </Link>

              <Link
                href="/sourcing-automobile"
                className="block !text-white/65 transition hover:!text-white"
              >
                Sourcing automobile
              </Link>

              <Link
                href="/fournisseurs"
                className="block !text-white/65 transition hover:!text-white"
              >
                Recherche fournisseur
              </Link>

              <Link
                href="/developpement-produit"
                className="block !text-white/65 transition hover:!text-white"
              >
                Développement produit
              </Link>
            </div>
          </div>

          {/* SERVICES */}

          <div>
            <h3 className="text-sm font-extrabold">
              Services
            </h3>

            <div className="mt-6 space-y-4 text-sm">
              <Link
                href="/logistique"
                className="block !text-white/65 transition hover:!text-white"
              >
                Logistique
              </Link>

              <Link
                href="/controle-qualite"
                className="block !text-white/65 transition hover:!text-white"
              >
                Contrôle qualité
              </Link>

              <Link
                href="/controle-qualite"
                className="block !text-white/65 transition hover:!text-white"
              >
                Audit usine
              </Link>

              <Link
                href="/dropshipping"
                className="block !text-white/65 transition hover:!text-white"
              >
                Dropshipping
              </Link>
            </div>
          </div>

          {/* ENTREPRISE */}

          <div>
            <h3 className="text-sm font-extrabold">
              Entreprise
            </h3>

            <div className="mt-6 space-y-4 text-sm">
              <Link
                href="/a-propos"
                className="block !text-white/65 transition hover:!text-white"
              >
                À propos
              </Link>

              <Link
                href="/secteurs"
                className="block !text-white/65 transition hover:!text-white"
              >
                Secteurs
              </Link>

              <Link
                href="/ressources"
                className="block !text-white/65 transition hover:!text-white"
              >
                Ressources
              </Link>

              <Link
                href="/contact"
                className="block !text-white/65 transition hover:!text-white"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* BAS DU FOOTER */}

        <div className="mt-16 border-t border-white/10 pt-7">
          <div className="flex flex-col gap-5 text-xs text-white/40 md:flex-row md:items-center md:justify-between">

            <div>
              © 2024–{new Date().getFullYear()} PaxSolutio. Tous droits réservés.
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