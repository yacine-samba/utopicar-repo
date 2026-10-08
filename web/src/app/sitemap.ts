import type { MetadataRoute } from "next";
import { listeCotes, slugCote } from "@/lib/cotes-publiques";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.utopicar.fr";

/** Pages indexables : le site et une page de cote par modèle relevé (mise à jour avec les relevés Leboncoin).
    /inscription et /connexion sont en noindex : elles n'y figurent pas. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maj = new Date();
  const cotes = await listeCotes();
  return [
    { url: `${SITE}/`, lastModified: maj, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/analyse`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/benef`, lastModified: maj, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/cote`, lastModified: maj, changeFrequency: "daily", priority: 0.8 },
    ...cotes.map((c) => ({ url: `${SITE}/cote/${slugCote(c.nom)}`, lastModified: c.maj ? new Date(c.maj) : maj, changeFrequency: "daily" as const, priority: 0.7 })),
    { url: `${SITE}/tarifs`, lastModified: maj, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/guide`, lastModified: maj, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/legal`, lastModified: maj, changeFrequency: "yearly", priority: 0.2 },
  ];
}
