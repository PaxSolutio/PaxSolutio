import Link from "next/link";
import {showroomImage} from "@/lib/offer-imagery";
import OfferPrice from "./OfferPrice";
import {type CommercialPriceInput} from "@/lib/commercial-pricing";
import styles from "./CommercialOfferCard.module.css";
export type CommercialOffer = CommercialPriceInput & {
  id:string; title:string; slug:string; subtitle?:string|null; short_description?:string|null;
  category?:string|null; image_url?:string|null; gallery_urls?:string[]|null; selling_points?:string[]|null;
  cta_type?:string|null; featured?:boolean|null;
};
export default function CommercialOfferCard({offer,variant="standard"}:{offer:CommercialOffer;variant?:"featured"|"secondary"|"standard"}){
  const image=showroomImage(offer);
  const href="/offres/"+encodeURIComponent(offer.slug);
  const facts=Object.entries(offer.specifications??{}).filter(([key,value])=>key!=="Base fiscale"&&typeof value==="string"&&value.length<90).slice(0,2);
  const points=(offer.selling_points??[]).filter(x=>typeof x==="string"&&x.length<100).slice(0,2);
  const quote=offer.cta_type==="quote";
  return <article className={styles.card+" "+styles[variant]}>
    <Link href={href} className={styles.media} aria-label={"Découvrir "+offer.title}>
      {image?<img src={image} alt={offer.title} loading="lazy" decoding="async"/>:<span>Photographie à venir</span>}
      <span className={styles.imageArrow} aria-hidden="true">↗</span>
    </Link>
    <div className={styles.content}>
      <p className={styles.category}>{offer.category||"Sélection de produits"}</p>
      <h3><Link href={href}>{offer.title}</Link></h3>
      {(offer.subtitle||offer.short_description)&&<p className={styles.description}>{offer.subtitle||offer.short_description}</p>}
      {facts.length>0?<dl className={styles.facts}>{facts.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl>:points.length>0?<ul className={styles.points}>{points.map(point=><li key={point}>{point}</li>)}</ul>:null}
      <div className={styles.bottom}><OfferPrice offer={offer}/><Link className={styles.cta} href={href+(quote?"#demande-devis":"")}>{quote?"Demander un devis":"Découvrir l’offre"}<span aria-hidden="true">↗</span></Link></div>
    </div>
  </article>;
}
