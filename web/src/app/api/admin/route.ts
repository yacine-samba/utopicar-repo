import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { emailCadeau, envoyerGuideLead, noter, type Cadeau } from "@/lib/admin";
import { supabaseService } from "@/lib/supabase/service";
import { urlSite } from "@/lib/stripe";

/* Actions de la page Administration. Réservées aux comptes profils.admin, vérifié à chaque appel. */

const FORMULES = ["gratuit", "essentiel", "serenite", "starter", "croissance", "pro"] as const;
const id = z.uuid();
const guide = z.enum(["premiere-revente", "trier-annonces", "estimer-reprise", "acheter-occasion"]);
const Corps = z.discriminatedUnion("action", [
  z.object({ action: z.literal("formule"), user: id, formule: z.enum(FORMULES).nullable(), jusquAu: z.iso.date().nullable(), prevenir: z.boolean().default(false) }),
  z.object({ action: z.literal("credits"), user: id, n: z.int().min(1, "1 crédit au moins.").max(500, "500 crédits au plus."), prevenir: z.boolean().default(false) }),
  z.object({ action: z.literal("guides"), user: id, guide, prevenir: z.boolean().default(true) }),
  z.object({ action: z.literal("messages"), user: id, actif: z.boolean() }),
  z.object({ action: z.literal("guide_lead"), lead: id, guide }),
]);

const erreur = (t: string, status = 400) => Response.json({ erreur: t }, { status });

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return erreur("Connectez-vous.", 401);
  if (!c.admin) return erreur("Réservé à l'administration.", 403);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return erreur("Clé service Supabase manquante.", 503);
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return erreur(r.error.issues[0]?.message ?? "Demande invalide.");
  const d = r.data;
  const sb = supabaseService();

  if (d.action === "guide_lead") {
    try {
      const email = await envoyerGuideLead(d.lead, d.guide);
      await noter(c.id, "guide_lead", email, { guide: d.guide });
      return Response.json({ ok: true, message: `Guide envoyé à ${email}.` });
    } catch (e) {
      return erreur(e instanceof Error ? e.message : "Envoi impossible.", 502);
    }
  }

  const { data: cible } = await sb.from("profils").select("id, email, prenom").eq("id", d.user).maybeSingle();
  if (!cible) return erreur("Compte introuvable.", 404);
  const dest = { email: cible.email ?? "", prenom: cible.prenom ?? "" };
  let cadeau: Cadeau | null = null;
  let message: string;

  if (d.action === "formule") {
    if (d.jusquAu && d.jusquAu < new Date().toISOString().slice(0, 10)) return erreur("La date de fin est déjà passée.");
    const { error } = await sb.from("profils").update({ formule_offerte: d.formule, offerte_jusqu_au: d.formule ? d.jusquAu : null, updated_at: new Date().toISOString() }).eq("id", d.user);
    if (error) return erreur("Enregistrement impossible.", 500);
    await noter(c.id, d.formule ? "formule_offerte" : "formule_retiree", dest.email, { formule: d.formule, jusquAu: d.jusquAu });
    if (d.formule && d.formule !== "gratuit") cadeau = { type: "formule", offre: d.formule, jusquAu: d.jusquAu };
    message = d.formule ? "Formule offerte enregistrée." : "Formule offerte retirée : le compte revient à sa formule payée (ou Découverte).";
  } else if (d.action === "credits") {
    const { error } = await sb.rpc("credits_ajouter", { p_uid: d.user, p_n: d.n, p_pack: null, p_session: null, p_motif: "offert" });
    if (error) return erreur("Crédits impossibles à ajouter.", 500);
    await noter(c.id, "credits_offerts", dest.email, { n: d.n });
    cadeau = { type: "credits", n: d.n };
    message = `${d.n} crédit${d.n > 1 ? "s" : ""} ajouté${d.n > 1 ? "s" : ""}.`;
  } else if (d.action === "guides") {
    const { count } = await sb.from("achats").select("id", { count: "exact", head: true }).eq("user_id", d.user).eq("produit", "guide");
    if (!count) {
      const { error } = await sb.from("achats").insert({ user_id: d.user, produit: "guide" });
      if (error) return erreur("Accès aux guides impossible à enregistrer.", 500);
    }
    await noter(c.id, "guides_offerts", dest.email, { guide: d.guide });
    cadeau = { type: "guides", guide: d.guide };
    message = count ? "Ce compte avait déjà les guides." : "Accès aux 4 guides ouvert.";
  } else {
    // Le statut reste celui de Stripe : seul le drapeau « offerte » change (une ligne sans abonnement Stripe est créée « offerte »).
    const { data: existe } = await sb.from("options_comptes").select("user_id").eq("user_id", d.user).eq("option", "messages").maybeSingle();
    const { error } = d.actif
      ? existe
        ? await sb.from("options_comptes").update({ offerte: true, updated_at: new Date().toISOString() }).eq("user_id", d.user).eq("option", "messages")
        : await sb.from("options_comptes").insert({ user_id: d.user, option: "messages", offerte: true, statut: "offerte" })
      : await sb.from("options_comptes").update({ offerte: false, updated_at: new Date().toISOString() }).eq("user_id", d.user).eq("option", "messages");
    if (error) return erreur(d.actif ? "Option impossible à activer." : "Option impossible à retirer.", 500);
    await noter(c.id, d.actif ? "messages_offerts" : "messages_retires", dest.email);
    message = d.actif ? "Option Messages offerte (active avec Benef Pro)." : "Option Messages offerte retirée.";
  }

  if (cadeau && "prevenir" in d && d.prevenir && dest.email) {
    try {
      await emailCadeau(urlSite(req), dest, cadeau);
      message += ` E-mail envoyé à ${dest.email}.`;
    } catch (e) {
      console.error("email cadeau", e);
      message += " L'e-mail n'a pas pu partir.";
    }
  }
  return Response.json({ ok: true, message });
}
