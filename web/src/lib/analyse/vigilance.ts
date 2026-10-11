/* Annonce douteuse : signaux d'arnaque ou de vente à risque, par l'outil (jamais par l'IA). Chaque signal a un poids :
   3 = arnaque classique, 2 = à vérifier avant tout déplacement, 1 = à garder en tête. Ce n'est pas une accusation :
   on dit ce qu'on voit et ce qu'il faut demander. */
import type { Analyse } from "./couts";
import { compteurIncoherent } from "./complements";
import { lireHistorique } from "./historique";

export type Signal = { cle: string; t: string; poids: 1 | 2 | 3; conseil: string };
export type Vigilance = { niveau: "aucune" | "prudence" | "alerte"; signaux: Signal[] };

const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

export function vigilance(a: Analyse): Vigilance {
  const f = a.faits;
  const S: Signal[] = [];
  const sig = new Set(f.signaux ?? []);
  const prix = f.prix ?? a.ia?.vehicule.prix ?? null;
  const particulier = !f.pro && a.ia?.vehicule.vendeur !== "professionnel";

  if (sig.has("paiement")) S.push({ cle: "paiement", poids: 3, t: "Paiement par coupon, mandat ou crypto évoqué", conseil: "Arnaque classique : ne payez jamais par coupon ou mandat. Paiement par virement bancaire ou chèque de banque vérifié, à la remise des clés." });
  if (sig.has("etranger")) S.push({ cle: "etranger", poids: 2, t: "Vendeur à l'étranger ou en déplacement", conseil: "Si la voiture ne peut pas être vue et essayée, n'envoyez rien. Exigez une visite sur place." });
  if (sig.has("acompte")) S.push({ cle: "acompte", poids: 2, t: "Acompte ou virement demandé avant la visite", conseil: "Ne versez rien avant d'avoir vu la voiture, la carte grise et la pièce d'identité du vendeur." });
  if (sig.has("contact")) S.push({ cle: "contact", poids: 1, t: "Contact demandé hors de la messagerie du site", conseil: "Restez sur la messagerie du site : elle garde une trace et filtre les escrocs connus." });
  if (sig.has("livraison") && particulier) S.push({ cle: "livraison", poids: 1, t: "Livraison proposée par un particulier", conseil: "Une livraison sans visite est un scénario d'arnaque fréquent. Allez voir la voiture." });

  // prix anormalement bas, sans défaut annoncé qui l'explique
  const ref = a.cote && a.cote.n >= 8 ? a.cote.mediane : null;
  const defautsLourds = f.defauts.some((d) => d.cat === "piege" || d.cat === "lourd");
  if (ref && prix != null && prix < ref * 0.7 && !defautsLourds) {
    const pct = Math.round((1 - prix / ref) * 100);
    S.push({ cle: "prix", poids: prix < ref * 0.55 ? 3 : 2, t: `Prix ${pct} % sous le marché sans défaut annoncé (marché ≈ ${eur(ref)})`, conseil: "Trop beau ? Demandez pourquoi ce prix, le contrôle technique et la carte grise avant de vous déplacer." });
    if (sig.has("urgence")) S.push({ cle: "urgence", poids: 1, t: "Vente « urgente » avec un prix très bas", conseil: "La pression du temps sert souvent à vous faire décider sans vérifier." });
  }

  // compteur lu sur les photos différent de l'annonce
  const lu = a.ia?.photos.compteurLu ?? null;
  const km = f.km ?? a.ia?.vehicule.km ?? null;
  if (lu != null && km != null && lu > 1000 && Math.abs(lu - km) > Math.max(5000, km * 0.1))
    S.push({ cle: "compteur", poids: 3, t: `Le compteur en photo indique ${lu.toLocaleString("fr-FR")} km, l'annonce ${km.toLocaleString("fr-FR")} km`, conseil: "Demandez une explication et le rapport HistoVec : un compteur trafiqué fait perdre beaucoup à la revente." });
  const recul = compteurIncoherent(a);
  if (recul) S.push({ cle: "recul", poids: 3, t: recul, conseil: "Un kilométrage qui recule est un motif de refus." });

  // même voiture vue ailleurs (même année, même kilométrage exact, même modèle)
  const h = lireHistorique(a.historique, prix);
  if (h?.autres.length) {
    const lieux = [...new Set(h.autres.map((x) => x.lieu).filter(Boolean))].slice(0, 2);
    const prixAutres = h.autres.map((x) => x.prix).filter((x): x is number => x != null);
    const ecart = prix != null && prixAutres.length ? Math.max(...prixAutres.map((x) => Math.abs(x - prix))) : 0;
    S.push({
      cle: "doublon",
      poids: ecart > 1500 || lieux.length > 1 ? 2 : 1,
      t: `La même voiture (même année, même kilométrage) apparaît dans ${h.autres.length} autre${h.autres.length > 1 ? "s" : ""} annonce${h.autres.length > 1 ? "s" : ""}${lieux.length ? ` (${lieux.join(", ")})` : ""}${ecart > 500 ? `, à des prix différents` : ""}`,
      conseil: "Remise en vente, ou photos et texte copiés d'une vraie annonce. Demandez pourquoi elle revient, et vérifiez que le vendeur est bien le titulaire de la carte grise.",
    });
  }

  const total = S.reduce((s, x) => s + x.poids, 0);
  const niveau = S.some((x) => x.poids === 3) || total >= 4 ? "alerte" : total >= 2 ? "prudence" : "aucune";
  return { niveau, signaux: S.sort((x, y) => y.poids - x.poids) };
}
