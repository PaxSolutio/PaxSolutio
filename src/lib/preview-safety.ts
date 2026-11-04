/** Preview deployments are read-only. This never changes the Production flow. */
export function isReadOnlyPreview(environment = process.env.VERCEL_ENV) { return environment === "preview"; }
export function previewRequestAllowed(method: string, pathname: string, administrativeReads = false) {
  if (!["GET", "HEAD"].includes(method.toUpperCase())) return false;
  // Explicitly enabled only for a protected final-review deployment. The
  // published DAL still verifies identity and current role in every handler.
  if (administrativeReads && /^\/(admin|api\/admin)(\/|$)/i.test(pathname)) return true;
  return !/^\/(api|admin|auth|login)(\/|$)/i.test(pathname);
}
