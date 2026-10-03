import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Ia } from "./ia-schema";
import type { Faits } from "./texte";
import type { Fiabilite } from "./fiabilite";
import type { OffreId } from "../offres";
import type { Cote } from "./cote";
import { consigneGarage } from "./garage";
import { lireRapport, versIa, type Rapport } from "./rapport";

export type Photo = { media_type: "image/jpeg" | "image/png" | "image/webp"; data: string };

/* Un seul modèle pour toutes les formules : Claude Haiku 4.5, le moins cher, pour garder une bonne marge.
   Consigne et format de rapport de l'outil Garage ; les montants (marge, offre, plafond) restent calculés par l'outil.
   ANTHROPIC_MODEL permet d'en changer sans toucher au code ; ANTHROPIC_BASE_URL, de passer par une passerelle compatible. */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

function faitsLignes(f: Faits, fiab: Fiabilite): string[] {
  const L: string[] = [];
  const n = (v: number) => v.toLocaleString("fr-FR");
  if (f.prix != null) L.push(`Prix affiché : ${n(f.prix)} €`);
  if (f.km != null) L.push(`Kilométrage : ${n(f.km)} km`);
  if (f.annee) L.push(`Année : ${f.annee}`);
  if (f.cv != null) L.push(`Puissance fiscale : ${f.cv} CV`);
  if (f.estimSite) L.push(`Estimation de prix affichée par le site : ${n(f.estimSite.min)} à ${n(f.estimSite.max)} €`);
  if (f.ct) L.push(`Contrôle technique : ${f.ct.statut}${f.ct.dateTxt ? ", du " + f.ct.dateTxt : ""} (« ${f.ct.extrait} »)`);
  if (f.distribution) L.push(`Distribution : ${f.distribution.statut}${f.distribution.km ? " à " + n(f.distribution.km) + " km" : ""} (« ${f.distribution.extrait} »)`);
  if (f.proprietaires) L.push(`Propriétaires annoncés : ${f.proprietaires}`);
  if (f.carnet || f.factures) L.push(`Entretien déclaré : ${[f.carnet && "carnet", f.factures && "factures"].filter(Boolean).join(" et ")}`);
  if (f.importe) L.push("Véhicule importé");
  f.defauts.forEach((d) =>
    L.push(`Défaut déjà lu et compté par l'outil : ${d.l}${d.cat === "piege" ? " (RÉDHIBITOIRE)" : d.nc ? " (non chiffrable)" : `, ${d.min} à ${d.max} €`} (« ${d.extrait} »)`),
  );
  if (fiab.k === "eviter") L.push(`Moteur ou boîte à éviter selon l'outil : ${fiab.pourquoi.join(" ; ")}`);
  else if (fiab.modele) L.push(`Modèle de la liste fiable de l'outil : ${fiab.modele} (bons moteurs : ${fiab.bonsMoteurs})`);
  return L;
}

export class IaIndisponible extends Error {}

/** Analyse complète au format de l'outil Garage : rapport complet + vue simplifiée pour les écrans particulier. */
export async function analyseIA(p: { texte: string; faits: Faits; fiab: Fiabilite; ville: string; photos: Photo[]; offre: OffreId; cote: Cote | null; margeMin: number }): Promise<{ ia: Ia; rapport: Rapport }> {
  if (!process.env.ANTHROPIC_API_KEY) throw new IaIndisponible("ANTHROPIC_API_KEY manquante");
  // Clé créée hors d'un espace de travail Anthropic : l'API demande l'identifiant de l'espace (ANTHROPIC_WORKSPACE_ID, wrkspc_…).
  const espace = process.env.ANTHROPIC_BASE_URL ? undefined : process.env.ANTHROPIC_WORKSPACE_ID;
  const client = new Anthropic(espace ? { defaultHeaders: { "anthropic-workspace-id": espace } } : {});
  const c = p.cote;
  const consigne = consigneGarage({
    ville: p.ville || "Paris",
    margeMin: p.margeMin,
    nbPhotos: p.photos.length,
    faits: faitsLignes(p.faits, p.fiab),
    cote: c ? `ANNONCES COMPARABLES ACTUELLEMENT EN LIGNE, relevées par l'outil : ${c.n} annonces du même modèle (±2 ans, même énergie, kilométrage proche), prix ramenés à cette année et ce kilométrage : médiane ${c.mediane} €, moitié centrale ${c.p25} à ${c.p75} €.` : null,
    prix: p.faits.prix,
    lien: p.texte.match(/https?:\/\/\S+/)?.[0] ?? "",
    texte: p.texte,
  });
  const content: Anthropic.ContentBlockParam[] = [
    ...p.photos.map((ph) => ({ type: "image" as const, source: { type: "base64" as const, media_type: ph.media_type, data: ph.data } })),
    { type: "text", text: consigne },
  ];
  const r = await client.messages.create({ model: MODEL, max_tokens: 16000, messages: [{ role: "user", content }] });
  console.info("analyse IA", p.offre, MODEL, r.usage?.input_tokens, r.usage?.output_tokens);
  if (r.stop_reason === "refusal") throw new Error("L'IA a refusé d'analyser cette annonce.");
  const txt = r.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  if (r.stop_reason === "max_tokens") throw new Error("Réponse de l'IA coupée, relancez.");
  const rapport = lireRapport(txt);
  return { ia: versIa(rapport), rapport };
}
