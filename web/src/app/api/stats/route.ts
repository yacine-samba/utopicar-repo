import { supabaseService } from "@/lib/supabase/service";

/* Chiffres publics du site : nombre d'inscrits (sans les comptes de l'équipe ni ceux de test), lu par la fonction
   stats_publiques réservée au serveur. Rien d'autre qu'un nombre ne sort. Gardé 30 s en mémoire et 30 s au CDN :
   le compteur « en direct » peut interroger souvent sans jamais charger la base. */

type Stats = { inscrits: number; semaine: number };
let memo: { t: number; v: Stats } | null = null;
const DUREE = 30_000;

export async function GET() {
  if (!memo || Date.now() - memo.t > DUREE) {
    try {
      const { data, error } = await supabaseService().rpc("stats_publiques");
      if (error || !data) throw error ?? new Error("vide");
      const d = data as Partial<Stats>;
      memo = { t: Date.now(), v: { inscrits: Number(d.inscrits) || 0, semaine: Number(d.semaine) || 0 } };
    } catch (e) {
      console.error("stats_publiques", e);
      if (!memo) return Response.json({ erreur: "indisponible" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
  }
  return Response.json(memo.v, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } });
}
