import { compteCourant } from "@/lib/compte";
import { etatCollecte } from "@/lib/vehicules/collecte";

/* Où en est la collecte Leboncoin lancée par une recherche (la page la suit, puis relance la recherche). Benef Pro. */
export async function GET(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  if (!c.offre.recherche) return Response.json({ erreur: "Réservé à Benef Pro." }, { status: 403 });
  const cle = new URL(req.url).searchParams.get("cle") ?? "";
  if (!/^[a-z0-9 ]{2,60}\|[a-z0-9.]{1,30}\|[a-z]{3,12}$/.test(cle)) return Response.json({ erreur: "Clé invalide." }, { status: 400 });
  try {
    const e = await etatCollecte(cle);
    return e ? Response.json(e) : Response.json({ erreur: "Collecte inconnue." }, { status: 404 });
  } catch (e) {
    return Response.json({ erreur: (e as Error).message }, { status: 502 });
  }
}
