import * as z from "zod/v4";
import { lireAnnonce } from "@/lib/analyse/texte";
import { fiabilite } from "@/lib/analyse/fiabilite";
import { coteMarche } from "@/lib/analyse/cote";
import { iaRegles, marqueModele } from "@/lib/analyse/regles";
import { dealPro, DEFAUTS_PRO, type Analyse } from "@/lib/analyse/couts";
import { compteCourant } from "@/lib/compte";
import { familleEspace } from "@/lib/espace";

/* Tri rapide (comme l'outil Garage) : jusqu'à 10 annonces classées en quelques secondes, sans IA,
   avec la cote sur annonces comparables, les défauts lus et le calcul du deal. Ne consomme pas d'analyse. */
const Corps = z.object({ annonces: z.array(z.string().trim().min(30).max(20000)).min(1).max(10), margeMin: z.number().min(0).max(20000).optional() });

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous pour trier des annonces." }, { status: 401 });
  if (familleEspace(c) !== "benef") return Response.json({ erreur: "Le tri rapide fait partie de l'espace Benef." }, { status: 403 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Collez entre 1 et 10 annonces complètes." }, { status: 400 });
  const reg = { ...DEFAUTS_PRO, margeMin: r.data.margeMin ?? DEFAUTS_PRO.margeMin };
  const lignes = await Promise.all(
    r.data.annonces.map(async (texte) => {
      const faits = lireAnnonce(texte);
      const fiab = fiabilite({ texte, annee: faits.annee, km: faits.km, energie: faits.energie });
      const cote = await coteMarche(texte, faits);
      const a: Analyse = { faits, fiab, ia: iaRegles(texte, faits, fiab, cote), cote };
      const d = dealPro(a, reg, null, null);
      const { marque, modele } = marqueModele(texte, faits);
      return {
        titre: faits.titre || [marque, modele].join(" "),
        lien: texte.match(/https?:\/\/\S+/)?.[0] ?? null,
        annee: faits.annee,
        km: faits.km,
        prix: d.prix,
        cote: a.ia?.marche.realiste ?? null,
        n: cote?.n ?? 0,
        gain: d.gain,
        plafond: d.plafond,
        verdict: d.verdict,
        alertes: [...faits.defauts.filter((x) => x.cat === "piege").map((x) => x.l), ...(fiab.k === "eviter" ? [fiab.pourquoi[0]?.split(" : ")[0] ?? "moteur à éviter"] : [])],
      };
    }),
  );
  return Response.json({ lignes });
}
