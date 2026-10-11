import type { CatGen, CatMarque, CatModele } from "./types";
import type { FiltresRecherche } from "../recherches";

/* Correspondance avec Leboncoin : départements (filtre « Localisation ») et lien vers la même recherche sur leboncoin.fr,
   avec les paramètres d'URL du site (vérifiés le 8 octobre 2026 : u_car_model, regdate, mileage, horse_power_din, gearbox,
   fuel, owner_type, locations=d_76). */

export const DEPARTEMENTS: [string, string][] = [
  ["01", "Ain"], ["02", "Aisne"], ["03", "Allier"], ["04", "Alpes-de-Haute-Provence"], ["05", "Hautes-Alpes"], ["06", "Alpes-Maritimes"], ["07", "Ardèche"], ["08", "Ardennes"],
  ["09", "Ariège"], ["10", "Aube"], ["11", "Aude"], ["12", "Aveyron"], ["13", "Bouches-du-Rhône"], ["14", "Calvados"], ["15", "Cantal"], ["16", "Charente"], ["17", "Charente-Maritime"],
  ["18", "Cher"], ["19", "Corrèze"], ["2A", "Corse-du-Sud"], ["2B", "Haute-Corse"], ["21", "Côte-d'Or"], ["22", "Côtes-d'Armor"], ["23", "Creuse"], ["24", "Dordogne"], ["25", "Doubs"],
  ["26", "Drôme"], ["27", "Eure"], ["28", "Eure-et-Loir"], ["29", "Finistère"], ["30", "Gard"], ["31", "Haute-Garonne"], ["32", "Gers"], ["33", "Gironde"], ["34", "Hérault"],
  ["35", "Ille-et-Vilaine"], ["36", "Indre"], ["37", "Indre-et-Loire"], ["38", "Isère"], ["39", "Jura"], ["40", "Landes"], ["41", "Loir-et-Cher"], ["42", "Loire"], ["43", "Haute-Loire"],
  ["44", "Loire-Atlantique"], ["45", "Loiret"], ["46", "Lot"], ["47", "Lot-et-Garonne"], ["48", "Lozère"], ["49", "Maine-et-Loire"], ["50", "Manche"], ["51", "Marne"], ["52", "Haute-Marne"],
  ["53", "Mayenne"], ["54", "Meurthe-et-Moselle"], ["55", "Meuse"], ["56", "Morbihan"], ["57", "Moselle"], ["58", "Nièvre"], ["59", "Nord"], ["60", "Oise"], ["61", "Orne"],
  ["62", "Pas-de-Calais"], ["63", "Puy-de-Dôme"], ["64", "Pyrénées-Atlantiques"], ["65", "Hautes-Pyrénées"], ["66", "Pyrénées-Orientales"], ["67", "Bas-Rhin"], ["68", "Haut-Rhin"],
  ["69", "Rhône"], ["70", "Haute-Saône"], ["71", "Saône-et-Loire"], ["72", "Sarthe"], ["73", "Savoie"], ["74", "Haute-Savoie"], ["75", "Paris"], ["76", "Seine-Maritime"],
  ["77", "Seine-et-Marne"], ["78", "Yvelines"], ["79", "Deux-Sèvres"], ["80", "Somme"], ["81", "Tarn"], ["82", "Tarn-et-Garonne"], ["83", "Var"], ["84", "Vaucluse"], ["85", "Vendée"],
  ["86", "Vienne"], ["87", "Haute-Vienne"], ["88", "Vosges"], ["89", "Yonne"], ["90", "Territoire de Belfort"], ["91", "Essonne"], ["92", "Hauts-de-Seine"], ["93", "Seine-Saint-Denis"],
  ["94", "Val-de-Marne"], ["95", "Val-d'Oise"], ["971", "Guadeloupe"], ["972", "Martinique"], ["973", "Guyane"], ["974", "La Réunion"], ["976", "Mayotte"],
];

const plat = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const PAR_NOM = new Map(DEPARTEMENTS.map(([c, n]) => [plat(n), c]));
const CODES = new Set(DEPARTEMENTS.map(([c]) => c));

/** Départements saisis (« 76, 27 », « Calvados », « 2A ») : leurs numéros, les inconnus ignorés. */
export function departementsDe(s: string | null | undefined): string[] {
  const out = new Set<string>();
  for (const brut of String(s ?? "").split(/[,;/]+/)) {
    const t = brut.trim().toUpperCase().replace(/^0(?=\d$)/, "");
    const num = /^\d$/.test(t) ? `0${t}` : t;
    if (CODES.has(num)) out.add(num);
    else if (PAR_NOM.has(plat(brut))) out.add(PAR_NOM.get(plat(brut))!);
  }
  return [...out];
}

/** Le lieu d'une annonce de la base (nom du département, ou « ville 76000 », ou code postal) est-il dans ces départements ? */
export function dansDepartements(lieu: string | null, codes: string[]): boolean {
  if (!codes.length) return true;
  if (!lieu) return false;
  const cp = lieu.match(/\b(\d{5})\b/)?.[1];
  if (cp) {
    const d = cp.startsWith("97") ? cp.slice(0, 3) : cp.startsWith("20") ? (Number(cp) < 20200 ? "2A" : "2B") : cp.slice(0, 2);
    return codes.includes(d);
  }
  const c = PAR_NOM.get(plat(lieu));
  return !!c && codes.includes(c);
}

const FUEL: Record<string, string> = { essence: "1", diesel: "2", gpl: "3", electrique: "4", hybride: "6,8" };
const entier = (s: string | undefined) => (s && /^\d+$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);
const plage = (a: number | null, b: number | null) => (a == null && b == null ? null : `${a ?? "min"}-${b ?? "max"}`);

/** Lien vers la même recherche sur leboncoin.fr (génération = ses années, comme Leboncoin ne connaît pas les générations). */
export function lienRechercheLeboncoin(marque: CatMarque | undefined, modele: CatModele | undefined, gen: CatGen | undefined, f: Partial<FiltresRecherche>): string | null {
  if (!marque?.lbc || !modele) return null;
  const p = new URLSearchParams({ category: "2", u_car_brand: marque.lbc });
  if (modele.lbc) p.set("u_car_model", modele.lbc);
  const mots = [modele.lbc ? "" : modele.n, f.mots ?? ""].join(" ").trim();
  if (mots) p.set("text", mots);
  const a0 = Math.max(entier(f.anneeMin) ?? 0, gen?.y0 ?? 0) || null;
  const a1 = Math.min(entier(f.anneeMax) ?? 9999, gen?.y1 || 9999);
  const r = plage(a0, a1 < 9999 ? a1 : null);
  if (r) p.set("regdate", r);
  const prix = plage(entier(f.prixMin), entier(f.prixMax));
  if (prix) p.set("price", prix);
  const km = plage(entier(f.kmMin), entier(f.kmMax));
  if (km) p.set("mileage", km);
  const ch = plage(entier(f.chMin), entier(f.chMax));
  if (ch) p.set("horse_power_din", ch);
  if (f.energie && FUEL[f.energie]) p.set("fuel", FUEL[f.energie]);
  if (f.boite) p.set("gearbox", f.boite === "auto" ? "2" : "1");
  if (f.vendeur) p.set("owner_type", f.vendeur === "pro" ? "pro" : "private");
  const deps = departementsDe(f.dep);
  if (deps.length) p.set("locations", deps.map((d) => `d_${d}`).join(","));
  const tri = f.tri === "prix" ? ["price", "asc"] : f.tri === "recent" ? ["time", "desc"] : null;
  if (tri) {
    p.set("sort", tri[0]);
    p.set("order", tri[1]);
  }
  return `https://www.leboncoin.fr/recherche?${p.toString().replace(/%2C/g, ",")}`;
}
