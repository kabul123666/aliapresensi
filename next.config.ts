import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite dan sharp adalah paket native/WASM — harus dijalankan di Node runtime,
  // bukan di-bundle oleh Turbopack.
  serverExternalPackages: ["@electric-sql/pglite", "sharp"],

  // Header keamanan dasar (PRD §9). CSP diatur lebih ketat di middleware.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), geolocation=(self), microphone=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
