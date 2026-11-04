import { businessClubUrl } from "@/data/businessClub";
import styles from "./BusinessClubSection.module.css";

export default function BusinessClubSection() {
  return <section className={styles.section} aria-labelledby="business-club-title" id="business-club">
    <div className={styles.inner}>
      <div className={styles.symbol}><img src="/branding/psbc-embleme.svg" width="104" height="104" alt="Emblème du PaxSolutio Business Club" /></div>
      <div className={styles.copy}>
        <p className={styles.kicker}>PaxSolutio Business Club</p>
        <h2 id="business-club-title">Entreprendre avec un collectif<br/> auquel contribuer.</h2>
        <p>Un cercle d’entrepreneurs en Hauts-de-France, où les expériences se rencontrent, les compétences se complètent et les ambitions deviennent collectives.</p>
        <p className={styles.status}>Association en cours de constitution · Candidatures fermées</p>
      </div>
      <a href={businessClubUrl} className={styles.cta}>Découvrir le club <span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
