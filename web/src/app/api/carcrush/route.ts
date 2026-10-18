import { compteCourant } from "@/lib/compte";
import { coutRecherche, credits, Criteres, MIN_CRITERES, nbCriteres, actif } from "@/lib/carcrush";
import { chercher } from "@/lib/carcrush-recherche";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { supabaseService } from "@/lib/supabase/service";

// lecture d'un gros modèle quand la base doit le relire sur le disque : jusqu'à une dizaine de secondes
export const maxDuration = 60;

/* CarCrush : lancer une recherche (crédits débités, rendus si aucune annonce) et rouvrir une recherche déjà payée. */

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous pour lancer la recherche." }, { status: 401 });
  const r = Criteres.safeParse(await req.json().catch(() => null));
  if (!r.success || !actif(r.data, "modele")) return Response.json({ erreur: "Choisissez au moins une marque et un modèle." }, { status: 400 });
  const f = r.data;
  const nb = nbCriteres(f);
  if (nb < MIN_CRITERES) return Response.json({ erreur: `Ajoutez au moins ${MIN_CRITERES} critères.` }, { status: 400 });
  const cout = coutRecherche(nb);
  if (!c.illimite && c.credits < cout) {
    return Response.json({ erreur: `Cette recherche coûte ${credits(cout)} et il vous en reste ${c.credits}.`, solde: c.credits, cout }, { status: 402 });
  }

  const sb = supabaseService();
  const { data: id, error } = await sb.rpc("carcrush_lancer", { p_uid: c.id, p_criteres: f, p_nb: nb, p_cout: cout });
  if (error || typeof id !== "string") {
    if (error?.message.includes("solde insuffisant")) return Response.json({ erreur: `Cette recherche coûte ${credits(cout)} : votre solde ne suffit pas.`, cout }, { status: 402 });
    console.error("carcrush lancer", error?.message);
    return Response.json({ erreur: "La recherche n'a pas pu démarrer. Rien n'a été débité." }, { status: 502 });
  }

  // la recherche échoue (base indisponible, modèle inconnu) : la fin sans annonces rend les crédits
  let res: Awaited<ReturnType<typeof chercher>> = null;
  let panne = false;
  try {
    res = await chercher(f);
  } catch (e) {
    console.error("carcrush recherche", (e as Error).message);
    panne = true;
  }
  const annonces = res?.annonces ?? [];
  const { data: rendus, error: et } = await sb.rpc("carcrush_terminer", { p_uid: c.id, p_id: id, p_annonces: annonces.length ? annonces : null });
  if (et) console.error("carcrush terminer", et.message);
  const { data: solde } = await sb.rpc("credits_solde", { p_uid: c.id });

  if (panne) return Response.json({ erreur: "La base d'annonces ne répond pas. Vos crédits vous ont été rendus.", rendus: rendus ?? 0, solde }, { status: 502 });
  return Response.json({ id, annonces, total: res?.total ?? 0, cout: c.illimite ? 0 : cout, rendus: typeof rendus === "number" ? rendus : 0, solde: typeof solde === "number" ? solde : null });
}

/** Rouvrir une recherche déjà lancée : ses annonces et les choix déjà faits, sans rien débiter. */
export async function GET(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  const id = new URL(req.url).searchParams.get("r") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return Response.json({ erreur: "Recherche inconnue." }, { status: 400 });
  const sb = await supabaseServeur();
  const [{ data: r }, { data: choix }] = await Promise.all([
    sb.from("carcrush_recherches").select("id, criteres, cout, trouvees, annonces, rembourse, created_at").eq("id", id).maybeSingle(),
    sb.from("carcrush_choix").select("annonce_id, choix").eq("recherche_id", id),
  ]);
  if (!r) return Response.json({ erreur: "Recherche introuvable." }, { status: 404 });
  return Response.json({ ...r, annonces: r.annonces ?? [], choix: Object.fromEntries((choix ?? []).map((x) => [x.annonce_id, x.choix])) });
}
