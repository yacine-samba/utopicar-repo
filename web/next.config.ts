import type { NextConfig } from "next";

/* Sources utilisées par le site : Supabase (données, connexion, photos), Stripe (paiement), Vercel (statistiques),
   photos Leboncoin, La Centrale et AutoScout24, axe-core en développement. Observée seulement, pour l'instant. */
const CSP_OBSERVEE = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.leboncoin.fr https://*.lacentrale.fr https://*.autoscout24.net https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com https://api.stripe.com",
  "frame-src https://js.stripe.com https://checkout.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
].join("; ");

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
          // caméra, micro, position, paiement par le navigateur : jamais demandés par le site
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // règles sûres appliquées tout de suite ; la liste complète des sources est observée (Report-Only) avant d'être imposée
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" },
          { key: "Content-Security-Policy-Report-Only", value: CSP_OBSERVEE },
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
