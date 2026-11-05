import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const original = ["/api/admin/:path*", "/admin/:path*"].map(source => ({
      source,
      headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
    const tracking = ["/suivi", "/api/suivi/:path*", "/api/admin/suivi/:path*", "/admin/suivi-projets"].map(source => ({source, headers:[{key:"Cache-Control",value:"private, no-store, max-age=0"},{key:"X-Robots-Tag",value:"noindex, nofollow, noarchive"},{key:"Referrer-Policy",value:"no-referrer"},{key:"X-Content-Type-Options",value:"nosniff"},{key:"Content-Security-Policy",value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'; object-src 'none'"}]}));
    return [...original,...tracking];
  },
};

export default nextConfig;
