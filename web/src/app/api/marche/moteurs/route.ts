import { compteCourant } from "@/lib/compte";
import { marcheModele, normEn } from "@/lib/vehicules/marche";

/* Motorisations d'une génération et leurs puissances Leboncoin (apprises des annonces) : une alerte « 325i »
   devient une recherche Leboncoin par puissance DIN (218 ch), qui trouve aussi les annonces qui n'écrivent pas « 325i ». */
export async function GET(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  if (!c.offre.recherche) return Response.json({ erreur: "Réservé à Benef Pro." }, { status: 403 });
  const u = new URL(req.url);
  const marque = (u.searchParams.get("marque") ?? "").slice(0, 40), modele = (u.searchParams.get("modele") ?? "").slice(0, 60);
  const gen = (u.searchParams.get("gen") ?? "").slice(0, 20), energie = (u.searchParams.get("energie") ?? "").slice(0, 12);
  if (!/^[a-z0-9]+$/.test(marque) || !/^[a-z0-9]+$/.test(modele)) return Response.json({ erreur: "Modèle inconnu." }, { status: 400 });
  const mm = await marcheModele(`${marque} ${modele}`).catch(() => null);
  if (!mm) return Response.json({ moteurs: [] });
  const par = new Map<string, { n: number; ch: Map<number, number> }>();
  for (const l of mm.lignes) {
    if (gen && l.gen !== gen) continue;
    if (energie && normEn(l.energie) !== energie) continue;
    const mo = l.moteur ?? l.moteurDeduit;
    if (!mo) continue;
    const x = par.get(mo) ?? { n: 0, ch: new Map<number, number>() };
    x.n++;
    if (l.ch) x.ch.set(l.ch, (x.ch.get(l.ch) ?? 0) + 1);
    par.set(mo, x);
  }
  // puissances qui font au moins 15 % des annonces de la motorisation (une faute de frappe ne compte pas)
  const moteurs = [...par]
    .filter(([, x]) => x.n >= 3)
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 30)
    .map(([l, x]) => {
      const tot = [...x.ch.values()].reduce((s, v) => s + v, 0);
      return { l, n: x.n, ch: [...x.ch].filter(([, v]) => tot && v / tot >= 0.15).map(([p]) => p).sort((p, q) => p - q) };
    });
  return Response.json({ moteurs });
}
