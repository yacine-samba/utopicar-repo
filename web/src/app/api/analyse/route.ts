import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import { lireAnnonce } from "@/lib/analyse/texte";
import { fiabilite } from "@/lib/analyse/fiabilite";
import { analyseIA, IaIndisponible } from "@/lib/analyse/ia";
import type { Analyse } from "@/lib/analyse/couts";

export const maxDuration = 120;

const Corps = z.object({
  texte: z.string().trim().min(30, "Collez le texte complet de l'annonce.").max(20000, "Texte trop long."),
  ville: z.string().trim().max(80).default(""),
  photos: z
    .array(z.object({ media_type: z.enum(["image/jpeg", "image/png", "image/webp"]), data: z.string().max(1_500_000) }))
    .max(6, "6 photos maximum.")
    .default([]),
});

// Limite simple par adresse IP (par instance) : protège la clé API des abus.
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

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (tropDeDemandes(ip)) return Response.json({ erreur: "Trop d'analyses d'affilée. Réessayez dans quelques minutes." }, { status: 429 });

  let corps: z.infer<typeof Corps>;
  try {
    const r = Corps.safeParse(await req.json());
    if (!r.success) return Response.json({ erreur: r.error.issues[0]?.message ?? "Demande invalide." }, { status: 400 });
    corps = r.data;
  } catch {
    return Response.json({ erreur: "Demande invalide." }, { status: 400 });
  }

  const faits = lireAnnonce(corps.texte);
  const fiab = fiabilite({ texte: corps.texte, annee: faits.annee, km: faits.km, energie: faits.energie });
  const out: Analyse = { faits, fiab, ia: null };

  try {
    out.ia = await analyseIA({ texte: corps.texte, faits, fiab, ville: corps.ville, photos: corps.photos });
  } catch (e) {
    if (e instanceof IaIndisponible) out.iaErreur = "L'estimation du marché n'est pas configurée sur ce serveur.";
    else if (e instanceof Anthropic.RateLimitError) out.iaErreur = "Trop de demandes en ce moment, réessayez dans une minute.";
    else if (e instanceof Anthropic.BadRequestError) out.iaErreur = "Une photo ou le texte a été refusé. Retirez les photos et relancez.";
    else if (e instanceof Anthropic.APIError) out.iaErreur = "Le service d'analyse ne répond pas, réessayez.";
    else out.iaErreur = e instanceof Error ? e.message : "Erreur inconnue.";
    console.error("analyse IA", e);
  }
  return Response.json(out);
}
