import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.utopicar.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/analyse`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/benef`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/tarifs`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/guide`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/inscription`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE}/legal`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
