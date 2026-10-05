import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  // extension (compte illimité) : servie par /api/extension, jamais dans public/
  outputFileTracingIncludes: { "/api/extension": ["./prive/utopicar-extension.zip"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      // Liens personnels reçus par email (?t= lecture, ?stop= désinscription) : jamais en cache, jamais indexés, jamais transmis en référent.
      ...["/guide", "/benef/guide"].flatMap((source) => ["t", "stop"].map((key) => ({
        source,
        has: [{ type: "query" as const, key }],
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      }))),
    ];
  },
  // Adresses de l'ancien site statique (emails déjà envoyés pour Bénef) : mêmes pages, query conservée.
  async rewrites() {
    return [
      { source: "/benef/guide", destination: "/guide" },
      { source: "/benef/legal", destination: "/legal" },
    ];
  },
};

export default nextConfig;
