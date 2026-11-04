type OfferImagery = {image_url?: string | null; gallery_urls?: string[] | null};
// Reviewed real photograph from this offer's own gallery. New product images keep their own cover.
export function showroomImage(offer: OfferImagery) {
  const oldCover = "1791310554150-fcfb7b4f-bd18-4b41-aee1-438cf01d783d.jpg";
  const frontView = "1791310603424-e5f2089f-62ef-445d-8e4e-d9ed488f57e0.jpg";
  return offer.image_url?.endsWith(oldCover)
    ? offer.gallery_urls?.find(url => url.endsWith(frontView)) ?? offer.image_url
    : offer.image_url;
}
