import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/Footer";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de PaxSolutio : collecte, utilisation, conservation et protection des données personnelles.",

  alternates: {
    canonical: "/confidentialite",
  },

  openGraph: {
    title: "Politique de confidentialité | PaxSolutio",
    description:
      "Informations sur la collecte, l'utilisation et la protection des données personnelles sur le site PaxSolutio.",
    url: "/confidentialite",
  },
};

export default function PrivacyPage() {
    return (
        <main>
            <Header />

            <LegalPage title="Politique de confidentialité">
                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Responsable du traitement
                    </h2>

                    <p className="mt-3">
                        Les données personnelles collectées sur le site PaxSolutio sont
                        traitées par l&apos;exploitant de PaxSolutio, identifié dans les
                        mentions légales du site.
                    </p>

                    <p className="mt-3">
                        Pour toute question concernant vos données personnelles ou
                        l&apos;exercice de vos droits, vous pouvez utiliser les coordonnées
                        indiquées sur la page Contact ou dans les mentions légales.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Données collectées
                    </h2>

                    <p className="mt-3">
                        Lorsque vous utilisez un formulaire du site, PaxSolutio peut
                        notamment collecter les informations suivantes :
                    </p>

                    <ul className="mt-4 list-disc space-y-2 pl-6">
                        <li>nom et société ;</li>
                        <li>adresse e-mail ;</li>
                        <li>numéro de téléphone lorsqu&apos;il est communiqué ;</li>
                        <li>type de demande ;</li>
                        <li>informations relatives au produit ou au projet ;</li>
                        <li>
                            informations logistiques, techniques ou commerciales transmises
                            volontairement ;
                        </li>
                        <li>contenu des messages envoyés via les formulaires.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Finalités du traitement
                    </h2>

                    <p className="mt-3">
                        Les données collectées sont utilisées pour :
                    </p>

                    <ul className="mt-4 list-disc space-y-2 pl-6">
                        <li>recevoir et analyser les demandes adressées à PaxSolutio ;</li>
                        <li>recontacter les prospects ou clients ;</li>
                        <li>
                            étudier les projets de sourcing, recherche fournisseur,
                            automobile, contrôle qualité, logistique ou e-commerce ;
                        </li>
                        <li>préparer les échanges commerciaux ;</li>
                        <li>assurer le suivi des demandes et projets.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Base légale
                    </h2>

                    <p className="mt-3">
                        Le traitement des données transmises au moyen des formulaires repose
                        principalement sur les mesures précontractuelles prises à votre
                        demande lorsque vous sollicitez PaxSolutio pour l&apos;étude
                        d&apos;un projet ou d&apos;une prestation.
                    </p>

                    <p className="mt-3">
                        Certains traitements nécessaires à la gestion, à la sécurité et au
                        suivi des demandes peuvent également reposer sur l&apos;intérêt
                        légitime de PaxSolutio à assurer le fonctionnement de son activité
                        et de ses outils professionnels.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Destinataires des données
                    </h2>

                    <p className="mt-3">
                        Les informations sont accessibles aux personnes habilitées au sein
                        de PaxSolutio dans la mesure nécessaire au traitement de votre
                        demande.
                    </p>

                    <p className="mt-3">
                        Selon la nature du projet, certaines informations peuvent également
                        être utilisées dans le cadre de la coordination avec des
                        partenaires ou prestataires nécessaires à l&apos;opération,
                        notamment pour les besoins logistiques.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Prestataires techniques
                    </h2>

                    <p className="mt-3">
                        PaxSolutio utilise actuellement des prestataires techniques pour le
                        fonctionnement du site et la gestion des demandes.
                    </p>

                    <div className="mt-5 space-y-4">
                        <div className="rounded-[18px] bg-[#F6F8FB] p-5">
                            <div className="font-extrabold text-[#071B33]">
                                Supabase
                            </div>

                            <p className="mt-2 text-sm leading-7 text-[#657386]">
                                Utilisé pour l&apos;hébergement et le stockage des demandes
                                transmises par les formulaires du site.
                            </p>
                        </div>

                        <div className="rounded-[18px] bg-[#F6F8FB] p-5">
                            <div className="font-extrabold text-[#071B33]">
                                Resend
                            </div>

                            <p className="mt-2 text-sm leading-7 text-[#657386]">
                                Utilisé pour transmettre des notifications internes lors de la
                                réception de certaines demandes.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Durée de conservation
                    </h2>

                    <p className="mt-3">
                        Les données relatives aux prospects n&apos;ayant pas donné lieu à une
                        relation commerciale peuvent être conservées pendant une durée maximale
                        de trois ans à compter de leur collecte ou du dernier contact émanant du
                        prospect.
                    </p>

                    <p className="mt-3">
                        Lorsqu&apos;une relation commerciale est engagée, certaines données peuvent
                        être conservées pendant la durée nécessaire à l&apos;exécution et au suivi
                        de cette relation, puis archivées pendant les durées requises par les
                        obligations légales, comptables ou liées à la défense des droits de
                        PaxSolutio.
                    </p>

                    <p className="mt-3">
                        Les données qui ne sont plus nécessaires aux finalités pour lesquelles
                        elles ont été collectées sont supprimées ou archivées conformément aux
                        règles applicables.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Vos droits
                    </h2>

                    <p className="mt-3">
                        Conformément à la réglementation applicable, vous pouvez notamment
                        demander l&apos;accès à vos données personnelles, leur rectification
                        ou leur effacement, ainsi que la limitation de certains traitements.
                    </p>

                    <p className="mt-3">
                        Selon la base légale applicable au traitement concerné, vous pouvez
                        également disposer d&apos;un droit d&apos;opposition ou d&apos;un
                        droit à la portabilité.
                    </p>

                    <p className="mt-3">
                        Vous pouvez exercer vos droits en contactant PaxSolutio via les
                        coordonnées indiquées dans les mentions légales ou sur la page
                        Contact.
                    </p>

                    <p className="mt-3">
                        Si vous estimez que le traitement de vos données personnelles ne
                        respecte pas la réglementation applicable, vous pouvez également
                        introduire une réclamation auprès de la CNIL.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Sécurité
                    </h2>

                    <p className="mt-3">
                        PaxSolutio met en œuvre des mesures techniques et organisationnelles
                        destinées à limiter l&apos;accès non autorisé, la perte,
                        l&apos;altération ou l&apos;utilisation abusive des données
                        personnelles.
                    </p>

                    <p className="mt-3">
                        Les formulaires du site font notamment l&apos;objet de contrôles
                        côté serveur et de dispositifs destinés à limiter les soumissions
                        automatisées.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Cookies et traceurs
                    </h2>

                    <p className="mt-3">
                        Le site peut utiliser des technologies strictement nécessaires à son
                        fonctionnement.
                    </p>

                    <p className="mt-3">
                        Si des outils de mesure d&apos;audience, de publicité, de réseaux
                        sociaux ou d&apos;autres traceurs nécessitant un consentement sont
                        ajoutés ultérieurement, le site mettra en place un dispositif
                        permettant aux utilisateurs d&apos;être informés et de faire leur
                        choix avant le dépôt des traceurs concernés.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-extrabold text-[#071B33]">
                        Modification de la politique
                    </h2>

                    <p className="mt-3">
                        La présente politique de confidentialité pourra être mise à jour en
                        fonction de l&apos;évolution du site, des services proposés et des
                        outils utilisés par PaxSolutio.
                    </p>
                </section>
            </LegalPage>

            <Footer />
        </main>
    );
}