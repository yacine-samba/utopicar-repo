import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { lireAnnonce } from "@/lib/analyse/texte";
import { fiabilite } from "@/lib/analyse/fiabilite";
import { coteMarche } from "@/lib/analyse/cote";

/* Aperçu instantané (2 à 3 s, sans IA, sans consommer d'analyse) montré pendant que l'analyse complète tourne :
   ce que l'outil calcule seul — prix face à la cote des annonces comparables, défauts lus dans le texte, fiabilité du moteur. */
const Corps = z.object({ texte: z.string().trim().min(30).max(20000) });

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "connexion" }, { status: 401 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "texte" }, { status: 400 });
  const texte = r.data.texte;
  const f = lireAnnonce(texte);
  const fiab = fiabilite({ texte, annee: f.annee, km: f.km, energie: f.energie });
  const cote = await coteMarche(texte, f).catch(() => null);
  return Response.json({
    titre: f.titre, prix: f.prix, annee: f.annee, km: f.km, energie: f.energie, boite: f.boite, ville: f.ville,
    cote: cote ? { n: cote.n, mediane: cote.mediane, p25: cote.p25, p75: cote.p75 } : null,
    ecart: cote && f.prix ? cote.mediane - f.prix : null,
    fiab: { k: fiab.k, modele: fiab.modele, pourquoi: fiab.pourquoi.slice(0, 2) },
    defauts: f.defauts.slice(0, 5).map((d) => ({ l: d.l, piege: d.cat === "piege" })),
    papiers: [f.ct ? `Contrôle technique : ${f.ct.statut}` : "Contrôle technique non mentionné", f.carnet ? "Carnet d'entretien annoncé" : null, f.factures ? "Factures annoncées" : null, f.distribution ? `Distribution ${f.distribution.statut}` : null].filter(Boolean),
  });
}
