import Link from "next/link";
import CommercialOfferCard from "@/components/offers/CommercialOfferCard";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import styles from "./FeaturedOffersSection.module.css";
export default async function FeaturedOffersSection(){
  const {data:offers,error}=await createServerSupabaseClient().from("commercial_offers")
    .select("id,title,slug,subtitle,short_description,category,image_url,gallery_urls,price_from,currency,price_label,conditions,selling_points,specifications,cta_type,featured")
    .eq("status","published").eq("homepage",true)
    .order("featured",{ascending:false}).order("published_at",{ascending:false,nullsFirst:false}).limit(3);
  return <section id="offres" className={styles.section} aria-labelledby="showroom-title">
    <div className={styles.container}>
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}><span aria-hidden="true"/>LE SHOWROOM PAXSOLUTIO</p><h2 id="showroom-title">Des produits.<br/><span>Des projets concrets.</span></h2></div>
        <div className={styles.intro}><p>Une sélection de produits et d’équipements à découvrir. Configuration, sourcing et transport : construisons une offre adaptée à votre projet.</p><Link href="/offres">Explorer toutes les offres <span aria-hidden="true">↗</span></Link></div>
      </div>
      {!error&&offers?.length?<div className={styles.grid}>{offers.map((offer,index)=><CommercialOfferCard key={offer.id} offer={offer} variant={index===0?"featured":"secondary"}/>)}</div>:<div className={styles.empty}><p>Notre sélection est momentanément indisponible.</p><Link href="/#project">Parlons de votre recherche <span aria-hidden="true">↗</span></Link></div>}
      <div className={styles.note}><span>VOTRE PROJET, VOTRE CONFIGURATION</span><p>Prix, fiscalité, disponibilité et conditions logistiques sont précisés avant toute commande.</p></div>
    </div>
  </section>;
}
