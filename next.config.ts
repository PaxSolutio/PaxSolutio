import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ["/api/admin/:path*", "/admin/:path*"].map(source => ({
      source,
      headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
};

export default nextConfig;
