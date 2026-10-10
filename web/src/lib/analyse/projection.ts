import "server-only";
import { marcheModele } from "../vehicules/marche";
import { generationDe, reconnaitre } from "../vehicules/moteur";
import type { Faits } from "./texte";
import type { Analyse } from "./couts";

/** Projection de la valeur de la voiture par le moteur de cote de l'outil (régression sur les annonces de sa génération) :
    valeur dans un an, perte par an d'âge et pour 10 000 km. Sert au coût d'usage du bilan. Sans assez d'annonces : null. */
export async function projectionMarche(texte: string, f: Faits): Promise<Analyse["projection"]> {
  if (!f.annee || f.km == null) return null;
  const champ = (nom: string) => texte.match(new RegExp(`^\\s*-?\\s*${nom}\\s*:\\s*(.+)$`, "im"))?.[1].trim() ?? "";
  const titre = [champ("Marque"), champ("Mod[eè]le"), f.titre].filter(Boolean).join(" ");
  const r = reconnaitre({ titre, annee: f.annee, energie: f.energie });
  if (!r.base) return null;
  const mm = await marcheModele(r.base, f.annee - 3, f.annee + 3, true);
  if (!mm) return null;
  const a = { titre, texte: texte.slice(0, 2500), annee: f.annee, km: f.km, energie: f.energie, boite: f.boite, pro: f.pro };
  const g = generationDe(mm.m.base, a);
  if (!g?.id) return null;
  const ligne = { ...a, id: "annonce", source: "", prix: f.prix ?? 0, ch: null, gen: g.id, genLabel: "", variant: g.variant, varianteEcrite: g.varianteEcrite } as unknown as Parameters<typeof mm.cotes.estimer>[0];
  const e = mm.cotes.estimer(ligne, f.prix ?? null);
  if (!e?.P) return null;
  return { P: e.P, dans1an: e.dans1an, parAn: e.parAn, parKm: e.parKm, n: e.nClean, conf: e.conf };
}
