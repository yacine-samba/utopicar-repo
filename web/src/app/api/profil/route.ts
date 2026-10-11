import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { ProfilSchema } from "@/lib/analyse/profil";

/* Profil du compte, écrit depuis le navigateur :
   - POST { onboarding } : réponses données sur le site avant l'inscription (pastille « pour moi / je revends »),
     récupérées après une inscription Google ou Apple ; seulement si le profil est encore vide.
   - PATCH { premiers_pas } : la carte « Premiers pas » du tableau de bord, masquée ou finie.
   - PUT { analyse } : le profil d'analyse (questionnaire de la première analyse, Profil › Mon profil d'analyse). */

const Onboarding = z.record(z.string().max(20), z.string().max(40).nullable()).refine((o) => Object.keys(o).length <= 8, "trop de clés");
const CLES = new Set(["but", "ou", "budget", "volume", "famille"]);

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "connexion" }, { status: 401 });
  const corps = (await req.json().catch(() => null)) as { onboarding?: unknown } | null;
  const r = Onboarding.safeParse(corps?.onboarding);
  if (!r.success) return Response.json({ erreur: "onboarding" }, { status: 400 });
  const onboarding = Object.fromEntries(Object.entries(r.data).filter(([k, v]) => CLES.has(k) && v != null));
  if (!Object.keys(onboarding).length) return Response.json({ ok: true, ecrit: false });
  const sb = await supabaseServeur();
  const { data: p } = await sb.from("profils").select("onboarding, famille").eq("id", c.id).maybeSingle();
  const vide = !p?.onboarding || typeof p.onboarding !== "object" || !Object.keys(p.onboarding as object).length;
  if (!vide) return Response.json({ ok: true, ecrit: false });
  const famille = onboarding.famille === "benef" || onboarding.famille === "particulier" ? onboarding.famille : null;
  const { error } = await sb.from("profils").update({ onboarding, ...(famille && !p?.famille ? { famille } : {}) }).eq("id", c.id);
  if (error) return Response.json({ erreur: "ecriture" }, { status: 500 });
  return Response.json({ ok: true, ecrit: true });
}

export async function PATCH(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "connexion" }, { status: 401 });
  const corps = (await req.json().catch(() => null)) as { premiers_pas?: unknown } | null;
  const v = corps?.premiers_pas;
  if (v !== "masque" && v !== "fini") return Response.json({ erreur: "premiers_pas" }, { status: 400 });
  const sb = await supabaseServeur();
  const { data: p } = await sb.from("profils").select("reglages").eq("id", c.id).maybeSingle();
  const reglages = { ...((p?.reglages as Record<string, unknown> | null) ?? {}), premiers_pas: v };
  const { error } = await sb.from("profils").update({ reglages }).eq("id", c.id);
  if (error) return Response.json({ erreur: "ecriture" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function PUT(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "connexion" }, { status: 401 });
  const corps = (await req.json().catch(() => null)) as { analyse?: unknown } | null;
  const r = ProfilSchema.safeParse(corps?.analyse);
  if (!r.success) return Response.json({ erreur: "profil" }, { status: 400 });
  const sb = await supabaseServeur();
  const { data: p } = await sb.from("profils").select("reglages").eq("id", c.id).maybeSingle();
  const reglages = { ...((p?.reglages as Record<string, unknown> | null) ?? {}), analyse: { ...r.data, rempli: true } };
  const { error } = await sb.from("profils").update({ reglages }).eq("id", c.id);
  if (error) return Response.json({ erreur: "ecriture" }, { status: 500 });
  return Response.json({ ok: true, profil: reglages.analyse });
}
