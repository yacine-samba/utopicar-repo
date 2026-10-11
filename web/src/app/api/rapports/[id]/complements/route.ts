import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Analyse } from "@/lib/analyse/couts";
import { faitsDocuments, type Complement } from "@/lib/analyse/complements";
import { faitsDuTexte } from "@/lib/analyse/texte";
import { IaIndisponible, lireDocuments } from "@/lib/analyse/ia";
import { bilan } from "@/lib/analyse/bilan";
import { ipDe, tropDeDemandes } from "@/lib/limite";

/* Ce qui s'ajoute à un rapport après le premier message : réponse du vendeur (texte), documents photographiés
   (CT, factures, HistoVec, lus par l'IA, 3 photos au plus) et visite (défauts constatés, points vérifiés).
   Le bilan est recalculé avec le profil de la personne ; verdict et note du rapport suivent. */
export const maxDuration = 120;

const Corps = z.discriminatedUnion("type", [
  z.object({ type: z.literal("reponse"), texte: z.string().trim().min(3).max(5000) }),
  z.object({ type: z.literal("document"), photos: z.array(z.object({ media_type: z.enum(["image/jpeg", "image/png", "image/webp"]), data: z.string().max(1_500_000) })).min(1).max(3) }),
  z.object({
    type: z.literal("visite"),
    constats: z.array(z.object({ libelle: z.string().trim().min(1).max(120), montant: z.number().min(0).max(50000) })).max(30),
    coches: z.array(z.string().max(200)).max(80),
    texte: z.string().trim().max(2000).optional(),
  }),
  z.object({ type: z.literal("retirer"), index: z.number().int().min(0).max(100) }),
]);

const erreur = (message: string, status: number) => Response.json({ erreur: message }, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return erreur("Rapport introuvable.", 404);
  const c = await compteCourant();
  if (!c) return erreur("Connectez-vous.", 401);
  if (tropDeDemandes("complements", ipDe(req), 30, 10 * 60_000)) return erreur("Trop d'ajouts d'affilée, réessayez dans quelques minutes.", 429);
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return erreur(r.error.issues[0]?.message ?? "Demande invalide.", 400);
  const sb = await supabaseServeur();
  const { data } = await sb.from("rapports").select("resultat").eq("id", id).maybeSingle();
  if (!data) return erreur("Rapport introuvable.", 404);
  const a = data.resultat as Analyse;
  const liste: Complement[] = [...(a.complements ?? [])];
  const le = new Date().toISOString();
  const d = r.data;

  if (d.type === "retirer") liste.splice(d.index, 1);
  else if (d.type === "reponse") liste.push({ le, type: "reponse", texte: d.texte, faits: faitsDuTexte(d.texte) });
  else if (d.type === "visite") {
    // une seule visite : la nouvelle remplace la précédente
    const i = liste.findIndex((x) => x.type === "visite");
    const v: Complement = { le, type: "visite", texte: d.texte, constats: d.constats, coches: d.coches };
    if (i >= 0) liste[i] = v;
    else liste.push(v);
  } else {
    try {
      const lu = await lireDocuments(d.photos);
      liste.push({ le, type: "document", texte: lu.resume, faits: faitsDocuments(lu) });
    } catch (e) {
      console.error("documents", e);
      return erreur(e instanceof IaIndisponible ? "La lecture des documents n'est pas configurée sur ce serveur." : "Documents illisibles pour le moment. Réessayez, ou collez le texte dans « Réponse du vendeur ».", 502);
    }
  }

  const b = bilan({ ...a, complements: liste }, c.profilAnalyse.rempli ? c.profilAnalyse : (a.profil ?? c.profilAnalyse));
  const { error } = await sb.rpc("rapport_reponses", { p_id: id, p_complements: liste, p_verdict: b.libelle, p_note: b.indice, p_marge: c.profilAnalyse.objectif === "revente" ? b.argent.marge : null });
  if (error) {
    console.error("rapport_reponses", error.message);
    return erreur("Enregistrement impossible pour le moment.", 500);
  }
  return Response.json({ complements: liste, verdict: b.libelle, indice: b.indice });
}
