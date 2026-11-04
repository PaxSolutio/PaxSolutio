import {commercialPrice,type CommercialPriceInput} from "@/lib/commercial-pricing";
import styles from "./CommercialOfferCard.module.css";
export default function OfferPrice({offer}:{offer:CommercialPriceInput}){
  const price=commercialPrice(offer);
  return <div className={styles.price} data-price-status={price.amount===null?"quote":"qualified"}>
    {price.amount!==null&&<span className={styles.priceLabel}>{price.label}</span>}
    <strong>{price.text}</strong>
    {price.amount===null&&<span className={styles.priceLabel}>{price.label}</span>}
  </div>;
}
