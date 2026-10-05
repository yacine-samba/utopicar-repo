import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.utopicar.fr";

/** Pages publiques indexables ; l'espace connecté, l'API et l'authentification ne le sont pas. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/api", "/auth", "/compte", "/benefapp"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
