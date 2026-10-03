import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import { lireAnnonce } from "@/lib/analyse/texte";
import { fiabilite } from "@/lib/analyse/fiabilite";
import { analyseIA, IaIndisponible } from "@/lib/analyse/ia";
import { filtrer } from "@/lib/analyse/filtre";
import { coutParticulier, dealPro, DEFAUTS_PART, DEFAUTS_PRO, type Analyse } from "@/lib/analyse/couts";
import { compteCourant } from "@/lib/compte";
import { OFFRES, type Offre } from "@/lib/offres";
import { comptesActifs } from "@/lib/supabase/config";
import { supabaseService } from "@/lib/supabase/service";

export const maxDuration = 120;

const Corps = z.object({
  mode: z.enum(["particulier", "benef"]),
  texte: z.string().trim().min(30, "Collez le texte complet de l'annonce.").max(20000, "Texte trop long."),
  ville: z.string().trim().max(80).default(""),
  photos: z
    .array(z.object({ media_type: z.enum(["image/jpeg", "image/png", "image/webp"]), data: z.string().max(1_500_000) }))
    .max(6, "6 photos maximum.")
    .default([]),
});

// Limite par adresse IP (par instance), en plus des quotas de chaque formule.
const FENETRE = 10 * 60 * 1000;
const MAX = 12;
const vus = new Map<string, number[]>();
function tropDeDemandes(ip: string) {
  const now = Date.now();
  const l = (vus.get(ip) ?? []).filter((t) => now - t < FENETRE);
  l.push(now);
  vus.set(ip, l);
  return l.length > MAX;
}

const erreur = (message: string, status: number, extra: Record<string, unknown> = {}) => Response.json({ erreur: message, ...extra }, { status });

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (tropDeDemandes(ip)) return erreur("Trop d'analyses d'affilée. Réessayez dans quelques minutes.", 429);

  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return erreur(r.error.issues[0]?.message ?? "Demande invalide.", 400);
  const { mode, texte, ville } = r.data;

  // Mode démonstration (UTOPICAR_DEMO=1) : seulement quand les comptes ne sont pas configurés, pour tester le site.
  const demo = !comptesActifs() && process.env.UTOPICAR_DEMO === "1";
  if (!comptesActifs() && !demo) return erreur("Les comptes ne sont pas encore ouverts. Revenez très bientôt.", 503);
  // Sans clé d'analyse, on s'arrête avant tout décompte : rien n'est consommé.
  if (!demo && (!process.env.ANTHROPIC_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY)) return erreur("L'analyse ouvre dans quelques instants. Réessayez un peu plus tard.", 503);

  const compte = demo ? null : await compteCourant();
  if (!demo && !compte) return erreur("Créez votre compte gratuit pour voir le résultat.", 401, { connexion: true });
  const o: Offre = compte ? compte.offre : mode === "benef" ? OFFRES.starter : OFFRES.gratuit;
  if (compte && mode === "benef" && o.famille !== "benef") return erreur("Les analyses de rentabilité sont réservées aux formules Benef.", 403, { offres: "benef" });
  if (compte && compte.restantes <= 0)
    return erreur(
      o.prix === 0
        ? "Votre analyse gratuite a déjà servi. Avec Essentiel, vous analysez 10 annonces par mois."
        : `Vous avez utilisé vos ${o.analyses} analyses du mois. Elles reviennent le 1er du mois, ou passez à la formule supérieure.`,
      402,
      { offres: o.famille },
    );

  const photos = r.data.photos.slice(0, o.photos);
  const faits = lireAnnonce(texte);
  const fiab = fiabilite({ texte, annee: faits.annee, km: faits.km, energie: faits.energie });
  const detail = mode === "benef" ? "complet" : o.detail;
  const out: Analyse = { faits, fiab, ia: null };

  try {
    out.ia = filtrer(await analyseIA({ texte, faits, fiab, ville, photos }), detail);
  } catch (e) {
    if (e instanceof IaIndisponible) out.iaErreur = "L'estimation du marché n'est pas configurée sur ce serveur.";
    else if (e instanceof Anthropic.RateLimitError) out.iaErreur = "Trop de demandes en ce moment, réessayez dans une minute.";
    else if (e instanceof Anthropic.BadRequestError) out.iaErreur = "Une photo ou le texte a été refusé. Retirez les photos et relancez.";
    else if (e instanceof Anthropic.APIError) out.iaErreur = "Le service d'analyse ne répond pas, réessayez.";
    else out.iaErreur = e instanceof Error ? e.message : "Erreur inconnue.";
    console.error("analyse IA", e);
  }

  let rapportId: string | null = null;
  // Une analyse n'est décomptée et enregistrée que si elle a abouti.
  if (compte && out.ia) {
    const svc = supabaseService();
    const v = out.ia.vehicule;
    const titre = [v.marque, v.modele, v.version].filter(Boolean).join(" ").slice(0, 140) || faits.titre || "Annonce";
    const resume =
      mode === "benef"
        ? (() => {
            const d = dealPro(out, { ...DEFAUTS_PRO, ville: ville || DEFAUTS_PRO.ville }, null, null);
            return { verdict: d.verdict, marge: d.gain, note: d.note, prix: d.prix };
          })()
        : (() => {
            const c = coutParticulier(out, { ...DEFAUTS_PART, ville }, null);
            return { verdict: c.niveau, marge: null, note: c.etat.score, prix: c.prix };
          })();
    await svc.from("usages").insert({ user_id: compte.id, mode });
    const { data } = await svc
      .from("rapports")
      .insert({ user_id: compte.id, mode, titre, marque: v.marque || null, ...resume, annonce: texte.slice(0, 8000), resultat: { ...out, ville } })
      .select("id")
      .single();
    rapportId = data?.id ?? null;
  }

  return Response.json({ ...out, rapportId, detail, offre: o.id, restantes: compte ? Math.max(0, compte.restantes - (out.ia ? 1 : 0)) : null, demo });
}
