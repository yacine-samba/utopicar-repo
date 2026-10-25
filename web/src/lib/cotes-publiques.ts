import "server-only";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";

/* Pages publiques « Cote d'un modèle » : statistiques agrégées de la base du marché (fonctions SQL cotes_publiques
   et cote_publique), mises en cache une heure. Une page par génération et énergie relevée sur Leboncoin. */

export type CoteResume = { cle: string; nom: string; base: string; energie: string; y0: number; y1: number; maj: string | null; n: number; mediane: number };
type Groupe = { n: number; mediane: number };
export type CoteDetail = Omit<CoteResume, "mediane"> & {
  mediane: number;
  p25: number;
  p75: number;
  km: number | null;
  par_annee: (Groupe & { annee: number; km: number | null })[];
  par_km: (Groupe & { t: number })[];
  par_boite: (Groupe & { boite: string })[];
  par_ch: (Groupe & { ch: number })[];
};

export const TRANCHES_KM = ["Moins de 50 000 km", "50 000 à 100 000 km", "100 000 à 150 000 km", "150 000 à 200 000 km", "Plus de 200 000 km"];

/** « Renault Clio 4 diesel (2012 – 2019) » → « Renault Clio 4 diesel ». */
export const libelle = (nom: string) => nom.replace(/\s*\(\d{4}\s*[–-]\s*\d{4}\)\s*$/, "").trim();

/** Adresse de la page : « renault-clio-4-diesel ». */
export const slugCote = (nom: string) =>
  libelle(nom)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Marque en clair d'une base du catalogue (« renault clio » → « renault »). */
export const marqueDe = (base: string) => base.split(" ")[0];

// une erreur (base froide, coupure à 8 s) est levée pour ne pas être gardée une heure en cache : la page suivante réessaie
const listeEnCache = unstable_cache(
  async (): Promise<CoteResume[]> => {
    const { data, error } = await supabasePublic().rpc("cotes_publiques");
    if (error) throw new Error(error.message);
    return (data ?? []) as CoteResume[];
  },
  ["cotes-publiques"],
  { revalidate: 3600, tags: ["cotes"] },
);
export const listeCotes = () =>
  listeEnCache().catch((e: Error) => {
    console.error("cotes_publiques", e.message);
    return [] as CoteResume[];
  });

const detailEnCache = unstable_cache(
  async (cle: string): Promise<CoteDetail | null> => {
    const { data, error } = await supabasePublic().rpc("cote_publique", { p_cle: cle });
    if (error) throw new Error(error.message);
    return (data as CoteDetail | null) ?? null;
  },
  ["cote-publique"],
  { revalidate: 3600, tags: ["cotes"] },
);
const detail = (cle: string) =>
  detailEnCache(cle).catch((e: Error) => {
    console.error("cote_publique", e.message);
    return null;
  });

/** Cote d'une page, par son adresse ; null si inconnue ou trop peu d'annonces. */
export async function coteParSlug(slug: string) {
  const liste = await listeCotes();
  const r = liste.find((c) => slugCote(c.nom) === slug);
  if (!r) return { cote: null, liste };
  return { cote: await detail(r.cle), liste };
}

/** Nombre à la française avec une espace insécable normale (l'espace fine U+202F manque dans la police Satoshi). */
export const nb = (v: number) => Math.round(v).toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0");
export const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0")}\u00a0€`;
export const kmTxt = (v: number) => `${(Math.round(v / 500) * 500).toLocaleString("fr-FR").replace(/\u202f/g, "\u00a0")}\u00a0km`;
export const dateTxt = (d: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }) : null);
