import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.utopicar.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date();
  return [
    { url: `${SITE}/`, lastModified: maj, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/analyse`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/benef`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/tarifs`, lastModified: maj, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/guide`, lastModified: maj, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/inscription`, lastModified: maj, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE}/legal`, lastModified: maj, changeFrequency: "yearly", priority: 0.2 },
  ];
}
