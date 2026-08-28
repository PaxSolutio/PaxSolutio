import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
    title: "Mentions légales",
    description:
        "Mentions légales du site PaxSolutio : informations sur l'éditeur, l'hébergement, la propriété intellectuelle et les responsabilités.",

    alternates: {
        canonical: "/mentions-legales",
    },

    openGraph: {
        title: "Mentions légales | PaxSolutio",
        description:
            "Informations légales relatives au site PaxSolutio.",
        url: "/mentions-legales",
    },
};

export default function LegalNoticePage() {
    return (
        <main>
            <Header />

            <LegalPage title="Mentions légales">
                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Éditeur du site
                    </h2>

                    <div className="mt-4 space-y-2">
                        <p>
                            <strong>Nom commercial :</strong> PaxSolutio
                        </p>

                        <p>
                            <strong>Entrepreneur individuel :</strong> Medhy Desgrugillers
                        </p>

                        <p>
                            <strong>Forme juridique :</strong> Entreprise individuelle
                        </p>

                        <p>
                            <strong>SIREN :</strong> 928162304
                        </p>

                        <p>
                            <strong>SIRET :</strong> 92816230400010
                        </p>

                        <p>
                            <strong>Siège social :</strong> 9 rue des entrepreneurs, Escaudain 59124
                        </p>

                        <p>
                            <strong>TVA intracommunautaire :</strong> FR74928162304
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Contact
                    </h2>

                    <div className="mt-4 space-y-2">
                        <p>
                            <strong>E-mail :</strong> PaxSolutio@gmail.com
                        </p>

                        <p>
                            <strong>Téléphone :</strong> 0743574234
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Directeur de la publication
                    </h2>

                    <p className="mt-3">
                        Le directeur de la publication est : Valentin Olivier.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Hébergement
                    </h2>

                    <p className="mt-3">
                        Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
                        Covina, CA 91723, États-Unis.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Propriété intellectuelle
                    </h2>

                    <p className="mt-3">
                        L&apos;ensemble des contenus présents sur ce site, notamment les
                        textes, éléments graphiques, logos, visuels, interfaces, marques et
                        éléments de présentation, sont protégés par les dispositions
                        applicables en matière de propriété intellectuelle.
                    </p>

                    <p className="mt-3">
                        Toute reproduction, représentation, modification, adaptation ou
                        exploitation, totale ou partielle, sans autorisation préalable du
                        titulaire des droits concernés est interdite, sauf disposition
                        légale contraire.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Responsabilité
                    </h2>

                    <p className="mt-3">
                        PaxSolutio s&apos;efforce de fournir des informations exactes et à
                        jour. Toutefois, les informations disponibles sur le site sont
                        fournies à titre informatif et peuvent évoluer.
                    </p>

                    <p className="mt-3">
                        Les services de sourcing, contrôle, accompagnement et logistique
                        sont étudiés au cas par cas selon les produits, fournisseurs,
                        destinations, réglementations et conditions applicables au projet.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Liens externes
                    </h2>

                    <p className="mt-3">
                        Le site peut contenir des liens vers des sites ou services tiers,
                        notamment OneBillionForwarders. PaxSolutio n&apos;exerce pas de
                        contrôle sur les contenus publiés par ces tiers et ne saurait être
                        tenue responsable de leur disponibilité ou de leur contenu.
                    </p>
                </section>
            </LegalPage>

            <Footer />
        </main>
    );
}