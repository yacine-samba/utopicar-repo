import type { MetadataRoute } from "next";
import { MOTEURS } from "@/lib/moteurs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.utopicar.fr";

/** Pages indexables du site. Les cotes détaillées (/cote) sont réservées aux abonnés : elles n'y figurent pas.
    /inscription et /connexion sont en noindex : elles n'y figurent pas. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maj = new Date();
  return [
    { url: `${SITE}/`, lastModified: maj, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/analyse`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/benef`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/moteur`, lastModified: maj, changeFrequency: "monthly", priority: 0.7 },
    ...MOTEURS.map((m) => ({ url: `${SITE}/moteur/${m.slug}`, lastModified: maj, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE}/tarifs`, lastModified: maj, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/guide`, lastModified: maj, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/legal`, lastModified: maj, changeFrequency: "yearly", priority: 0.2 },
  ];
}
