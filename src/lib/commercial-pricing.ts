export type CommercialPriceInput = {
  price_from?: number | null; currency?: string | null; price_label?: string | null;
  conditions?: string | null; specifications?: Record<string, unknown> | null;
};
/** Owner decision, 4 Nov 2026: current EUR catalogue amounts are TTC, unchanged. */
export function commercialPrice(offer: CommercialPriceInput) {
  const amount = typeof offer.price_from === "number" && Number.isFinite(offer.price_from) && offer.price_from > 0 ? offer.price_from : null;
  const tax = "TTC";
  const currency = offer.currency?.toUpperCase();
  const missing = [...(amount === null ? ["amount"] : []), ...(currency !== "EUR" ? ["currency"] : [])];
  if (missing.length) return {amount:null, text:"Sur devis", label:"Configuration et conditions à préciser", tax:null, missing};
  try {
    const text = new Intl.NumberFormat("fr-FR", {style:"currency",currency:currency!,maximumFractionDigits:2}).format(amount!);
    return {amount, text:text+" "+tax,label:"À partir de",tax,missing};
  } catch { return {amount:null,text:"Sur devis",label:"Configuration et conditions à préciser",tax:null,missing:["currency"]}; }
}

/** The catalogue field is authoritative; prose must not reintroduce a stale price. */
export function commercialCopy(text: string | null | undefined, priceQualified: boolean) {
  if (!text) return text;
  return text.replace(/(?:[ÀàAa] partir de\s*)?\d[\d\s\u00a0\u202f.,]*\s*(?:€|\bEUR\b)(?:\s*(?:TTC|HT))?/giu, priceQualified ? "Tarif du catalogue ci-dessus" : "Sur devis");
}
