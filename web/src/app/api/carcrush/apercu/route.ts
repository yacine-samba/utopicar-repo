import { Criteres, actif } from "@/lib/carcrush";
import { chercher } from "@/lib/carcrush-recherche";
import { ipDe, tropDeDemandes } from "@/lib/limite";

/* CarCrush : nombre d'annonces qui répondent aux critères, avant de lancer (rien n'est débité, aucune annonce n'est renvoyée). */
export async function POST(req: Request) {
  if (tropDeDemandes("carcrush-apercu", ipDe(req), 40, 10 * 60e3)) return Response.json({ erreur: "Trop de demandes, réessayez dans quelques minutes." }, { status: 429 });
  const r = Criteres.safeParse(await req.json().catch(() => null));
  if (!r.success || !actif(r.data, "modele")) return Response.json({ erreur: "Choisissez une marque et un modèle." }, { status: 400 });
  try {
    const res = await chercher(r.data, 0);
    if (!res) return Response.json({ erreur: "Modèle inconnu." }, { status: 400 });
    return Response.json({ total: res.total });
  } catch (e) {
    console.error("carcrush aperçu", (e as Error).message);
    return Response.json({ erreur: "Estimation indisponible." }, { status: 502 });
  }
}
