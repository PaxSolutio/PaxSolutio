const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const unsafe = new Set(["__proto__", "prototype", "constructor"]);

function reject(status: number, error: string): Response {
  return Response.json({ success: false, error }, { status, headers: { "Cache-Control": "private, no-store" } });
}

function validTree(value: unknown, depth = 0): boolean {
  if (depth > 12) return false;
  if (typeof value === "string") return value.length <= 100_000;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 1000 && value.every(v => validTree(v, depth + 1));
  if (value && typeof value === "object") return Object.entries(value).every(([key, child]) =>
    !unsafe.has(key) && key.length <= 200 && validTree(child, depth + 1));
  return value === null || typeof value === "boolean";
}

/** Check the bytes, including chunked bodies; never trust Content-Length alone. */
export async function boundedBody(request: Request, limit: number): Promise<Uint8Array | null> {
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > limit)) return null;
  const reader = request.clone().body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) { void reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

function validOffer(body: Record<string, unknown>): boolean {
  const booleans = ["payment_enabled", "full_payment_enabled", "deposit_enabled", "featured", "homepage"];
  if (booleans.some(k => k in body && typeof body[k] !== "boolean")) return false;
  const numbers = ["price_from", "market_price", "payment_price", "deposit_percent", "deposit_amount"];
  if (numbers.some(k => {
    const v = body[k];
    return v != null && v !== "" && (!(typeof v === "number" || typeof v === "string" && /^\d+(\.\d{1,2})?$/.test(v)) || !Number.isFinite(Number(v)) || Number(v) < 0);
  })) return false;
  const strings = ["title", "slug", "subtitle", "short_description", "description", "category", "product_type", "conditions", "delivery_information", "seo_title", "seo_description", "price_label", "cta_label"];
  if (strings.some(k => body[k] != null && typeof body[k] !== "string")) return false;
  if (typeof body.title !== "string" || !body.title.trim() || body.title.length > 300) return false;
  if (body.currency != null && (typeof body.currency !== "string" || !/^[A-Z]{3}$/.test(body.currency))) return false;
  if (body.status != null && !["draft", "published", "archived"].includes(String(body.status))) return false;
  for (const key of ["tags", "gallery_urls", "selling_points", "placement_pages"]) {
    if (body[key] != null && (!Array.isArray(body[key]) || !(body[key] as unknown[]).every(v => typeof v === "string"))) return false;
  }
  const urls = ["image_url", "video_url", "cta_url", "stripe_full_payment_url", "stripe_deposit_url", "paypal_full_payment_url", "paypal_deposit_url"];
  const candidates = [...urls.map(k => body[k]), ...((body.gallery_urls as unknown[]) || [])];
  if (candidates.some(v => {
    if (v == null || v === "") return false;
    if (typeof v !== "string") return true;
    if (/^\/(?!\/)/.test(v)) return false;
    try { return new URL(v).protocol !== "https:"; } catch { return true; }
  })) return false;
  return body.specifications == null || typeof body.specifications === "object" && !Array.isArray(body.specifications);
}

export async function validateAdminRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const segments = url.pathname.split("/");
  for (const key of ["execution", "opportunity"]) {
    const position = segments.indexOf(key);
    if (position >= 0 && segments[position + 1] && !UUID.test(segments[position + 1])) return reject(400, "Identifiant invalide.");
  }
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return null;
  // Cookie-authenticated changes must originate from this exact application.
  const origin = request.headers.get("origin");
  if (origin !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") return reject(403, "Origine de la requête refusée.");
  const upload = url.pathname === "/api/admin/offers/upload";
  const type = request.headers.get("content-type") || "";
  // Existing action buttons send an empty POST. Keep this narrow contract
  // after identity, membership, route identifier and CSRF checks.
  const emptyAction = request.method === "POST" && (
    url.pathname === "/api/admin/intelligence/brief" ||
    /^\/api\/admin\/intelligence\/opportunity\/[^/]+\/(actions|execute|reassess|study)$/.test(url.pathname) ||
    /^\/api\/admin\/intelligence\/execution\/[^/]+\/compliance\/generate$/.test(url.pathname)
  );
  if (emptyAction && !type) {
    const body = await boundedBody(request, 0);
    return body?.length === 0 ? null : reject(400, "Corps de requête inattendu.");
  }
  if (!(upload ? type.startsWith("multipart/form-data;") : /^application\/json(?:;|$)/i.test(type))) return reject(415, "Format de requête non pris en charge.");
  const bytes = await boundedBody(request, upload ? 9 * 1024 * 1024 : 256 * 1024);
  if (!bytes) return reject(413, "Requête trop volumineuse.");
  if (upload) return null;
  let body: Record<string, unknown>;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reject(400, "JSON invalide."); }
  if (!body || typeof body !== "object" || Array.isArray(body) || !validTree(body)) return reject(400, "Données invalides.");
  for (const [key, value] of Object.entries(body)) {
    if ((key === "id" || key.endsWith("_id")) && value != null && value !== "" && (typeof value !== "string" || !UUID.test(value))) return reject(400, "Identifiant invalide.");
  }
  if (url.pathname === "/api/admin/offers" && !validOffer(body)) return reject(400, "Champs de l'offre invalides.");
  return null;
}

/** Canonical extension from verified bytes, never from the user-controlled filename. */
export function imageExtension(bytes: Uint8Array, mime: string): string | null {
  const hex = (n: number) => Array.from(bytes.slice(0, n), b => b.toString(16).padStart(2, "0")).join("");
  const ascii = (a: number, b: number) => new TextDecoder().decode(bytes.slice(a, b));
  if (mime === "image/jpeg" && bytes.length >= 4 && hex(3) === "ffd8ff") return "jpg";
  if (mime === "image/png" && bytes.length >= 24 && hex(8) === "89504e470d0a1a0a") return "png";
  if (mime === "image/webp" && bytes.length >= 20 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (mime === "image/avif" && bytes.length >= 24 && ascii(4, 8) === "ftyp" && /avif|avis/.test(ascii(8, Math.min(bytes.length, 32)))) return "avif";
  return null;
}
