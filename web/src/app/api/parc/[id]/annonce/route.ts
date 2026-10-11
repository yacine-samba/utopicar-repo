import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import type { Analyse } from "@/lib/analyse/couts";
import type { Vehicule } from "@/lib/parc";
import { bilan } from "@/lib/analyse/bilan";
import { avecComplements } from "@/lib/analyse/complements";
import { IaIndisponible, redigerAnnonce } from "@/lib/analyse/ia";
import { ipDe, tropDeDemandes } from "@/lib/limite";

/* Annonce de revente d'une voiture du parc (Benef Pro) : prix d'affichage selon le délai visé (tirés de la cote,
   avec une marge de négociation), texte rédigé par l'IA à partir des seuls faits connus, photos à faire. */
export const maxDuration = 60;

const r50 = (v: number) => Math.round(v / 50) * 50;
const PHOTOS = ["Trois quarts avant, en plein jour, fond dégagé", "Trois quarts arrière", "Profil complet", "Intérieur avant, depuis la porte conducteur", "Banquette arrière", "Tableau de bord allumé (kilométrage lisible, aucun voyant)", "Coffre", "Moteur propre (sans le laver juste avant)", "Pneus avant (usure visible)", "Carnet, factures et CT posés ensemble"];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return Response.json({ erreur: "Voiture introuvable." }, { status: 404 });
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  if (!c.offre.parc) return Response.json({ erreur: "L'annonce de revente fait partie de Benef Pro." }, { status: 403 });
  if (tropDeDemandes("annonce-revente", ipDe(req), 15, 60 * 60_000)) return Response.json({ erreur: "Trop de demandes, réessayez dans un moment." }, { status: 429 });
  const sb = await supabaseServeur();
  const { data: v } = await sb.from("parc").select("*").eq("id", id).maybeSingle();
  if (!v) return Response.json({ erreur: "Voiture introuvable." }, { status: 404 });
  const veh = v as Vehicule & { finition?: string | null; couleur?: string | null; cv?: number | null; annee?: number | null; km?: number | null; energie?: string | null; boite?: string | null; ct_date?: string | null; frais_detail?: unknown };
  const { data: r } = veh.rapport_id ? await sb.from("rapports").select("resultat").eq("id", veh.rapport_id).maybeSingle() : { data: null };
  const a0 = (r?.resultat ?? null) as Analyse | null;

  // prix d'affichage : la vente visée + environ 4 % de marge de négociation
  let prix: { cle: string; l: string; delai: string; affiche: number; vente: number }[] = [];
  if (a0) {
    const b = bilan(a0, { ...c.profilAnalyse, objectif: "revente" });
    prix = b.argent.scenarios.filter((s) => s.revente != null).map((s) => ({ cle: s.cle, l: s.l, delai: s.delai, vente: s.revente!, affiche: r50(s.revente! / 0.96) }));
  }

  const a = a0 ? avecComplements(a0) : null;
  const rv = a?.rapport?.vehicule;
  const faits = [
    `Voiture : ${[veh.titre, veh.finition].filter(Boolean).join(" ")}`,
    rv?.versionExacte ? `Version : ${rv.versionExacte}` : null,
    veh.annee ?? a?.faits.annee ? `Année : ${veh.annee ?? a?.faits.annee}` : null,
    (veh.km ?? a?.faits.km) != null ? `Kilométrage : ${(veh.km ?? a?.faits.km)!.toLocaleString("fr-FR")} km` : null,
    veh.energie || a?.faits.energie ? `Énergie : ${veh.energie || a?.faits.energie}` : null,
    veh.boite || a?.faits.boite ? `Boîte : ${veh.boite || a?.faits.boite}` : null,
    veh.cv ? `Puissance fiscale : ${veh.cv} CV` : null,
    veh.couleur ? `Couleur : ${veh.couleur}` : null,
    rv?.options?.length ? `Équipements annoncés à l'achat : ${rv.options.slice(0, 12).join(", ")}` : null,
    a?.faits.recents?.length ? `Pièces neuves ou refaites : ${a.faits.recents.join(", ")}` : null,
    a?.faits.distribution?.statut === "faite" ? `Distribution faite${a.faits.distribution.km ? ` à ${a.faits.distribution.km.toLocaleString("fr-FR")} km` : ""}` : null,
    a?.faits.carnet || a?.faits.factures ? "Factures d'entretien disponibles" : null,
    veh.ct_date ? `Contrôle technique du ${new Date(veh.ct_date).toLocaleDateString("fr-FR")}` : null,
    veh.notes ? `Notes du vendeur : ${veh.notes.slice(0, 500)}` : null,
  ].filter((x): x is string => !!x);

  try {
    const t = await redigerAnnonce(faits);
    return Response.json({ ...t, prix, photos: PHOTOS, ia: true });
  } catch (e) {
    if (!(e instanceof IaIndisponible)) console.error("annonce revente", e);
    // sans IA : un modèle simple avec les seuls faits connus
    const texte = [`${faits[0].replace("Voiture : ", "")}, ${[veh.annee, veh.km != null ? `${veh.km.toLocaleString("fr-FR")} km` : null].filter(Boolean).join(", ")}.`, "", "Points forts :", ...faits.slice(1).map((x) => `- ${x}`), "", "Modalités : essai possible, carte grise, contrôle technique et factures disponibles, paiement sécurisé."].join("\n");
    return Response.json({ titre: veh.titre.slice(0, 60), texte, prix, photos: PHOTOS, ia: false });
  }
}
