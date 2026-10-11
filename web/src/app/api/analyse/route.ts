import Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import { lireAnnonce } from "@/lib/analyse/texte";
import { fiabilite } from "@/lib/analyse/fiabilite";
import { analyseIA, IaIndisponible } from "@/lib/analyse/ia";
import { filtrer } from "@/lib/analyse/filtre";
import { coteMarche, marcheDepuisCote } from "@/lib/analyse/cote";
import { iaRegles } from "@/lib/analyse/regles";
import { filtrerRapport } from "@/lib/analyse/sections";
import { depuisIa } from "@/lib/analyse/rapport";
import type { Analyse } from "@/lib/analyse/couts";
import { bilan } from "@/lib/analyse/bilan";
import { profilParDefaut } from "@/lib/analyse/profil";
import { projectionMarche } from "@/lib/analyse/projection";
import { numeroLeboncoin, type Historique } from "@/lib/analyse/historique";
import { marqueModele } from "@/lib/analyse/regles";
import { compteCourant } from "@/lib/compte";
import { OFFRES, type Offre } from "@/lib/offres";
import { comptesActifs } from "@/lib/supabase/config";
import { titreVehicule } from "@/lib/titre";
import { vendeurDe } from "@/lib/analyse/vendeur";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { ipDe, tropDeDemandes } from "@/lib/limite";

export const maxDuration = 300;

const Corps = z.object({
  mode: z.enum(["particulier", "benef"]),
  texte: z.string().trim().min(30, "Collez le texte complet de l'annonce.").max(20000, "Texte trop long."),
  ville: z.string().trim().max(80).default(""),
  photos: z
    .array(z.object({ media_type: z.enum(["image/jpeg", "image/png", "image/webp"]), data: z.string().max(1_500_000) }))
    .max(6, "6 photos maximum.")
    .default([]),
  // photos d'origine de l'annonce (Leboncoin, extension) et vendeur : gardés avec le rapport
  photosLiens: z.array(z.string().max(1000).regex(/^https:\/\//)).max(30).default([]),
  lienAnnonce: z.string().trim().max(500).regex(/^https?:\/\//).optional(),
  vendeur: z.object({ nom: z.string().max(80).nullish(), type: z.string().max(20).nullish(), aTel: z.boolean().nullish(), telephone: z.string().max(40).nullish() }).nullish(),
});

/** Photos envoyées (pas de lien d'origine) : stockées dans le dossier de la personne, pour les cartes et le rapport. */
async function stockerPhotos(uid: string, photos: { media_type: string; data: string }[]) {
  const sb = await supabaseServeur();
  const dossier = `${uid}/${crypto.randomUUID()}`;
  const urls = await Promise.all(
    photos.slice(0, 6).map(async (p, i) => {
      const ext = p.media_type === "image/png" ? "png" : p.media_type === "image/webp" ? "webp" : "jpg";
      const { error } = await sb.storage.from("photos").upload(`${dossier}/${i + 1}.${ext}`, Buffer.from(p.data, "base64"), { contentType: p.media_type });
      if (error) {
        console.error("photo stockée", error.message);
        return null;
      }
      return sb.storage.from("photos").getPublicUrl(`${dossier}/${i + 1}.${ext}`).data.publicUrl;
    }),
  );
  return urls.filter((u): u is string => !!u);
}

// Limite par adresse IP (par instance), en plus des quotas de chaque formule : 12 analyses par 10 minutes.
const erreur = (message: string, status: number, extra: Record<string, unknown> = {}) => Response.json({ erreur: message, ...extra }, { status });

export async function POST(req: Request) {
  if (tropDeDemandes("analyse", ipDe(req), 12, 10 * 60_000)) return erreur("Trop d'analyses d'affilée. Réessayez dans quelques minutes.", 429);

  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return erreur(r.error.issues[0]?.message ?? "Demande invalide.", 400);
  const { mode, texte, ville } = r.data;

  // Mode démonstration (UTOPICAR_DEMO=1) : seulement quand les comptes ne sont pas configurés, pour tester le site.
  const demo = !comptesActifs() && process.env.UTOPICAR_DEMO === "1";
  if (!comptesActifs() && !demo) return erreur("Les comptes ne sont pas encore ouverts. Revenez très bientôt.", 503);

  const compte = demo ? null : await compteCourant();
  if (!demo && !compte) return erreur("Créez votre compte gratuit pour voir le résultat.", 401, { connexion: true });
  const o: Offre = compte ? compte.offre : mode === "benef" ? OFFRES.starter : OFFRES.gratuit;
  if (compte && mode === "benef" && o.famille !== "benef") return erreur("Les analyses de rentabilité sont réservées aux formules Benef.", 403, { offres: "benef" });
  if (compte && compte.restantes <= 0)
    return erreur(
      o.prix === 0
        ? "Votre analyse gratuite a déjà servi. Continuez avec des crédits à l'unité, sans abonnement, ou avec Essentiel : 10 analyses par mois."
        : `Vous avez utilisé vos ${o.analyses} analyses du mois. Elles reviennent le 1er du mois. En attendant, continuez avec des crédits à l'unité.`,
      402,
      { offres: o.famille },
    );

  const photos = r.data.photos.slice(0, o.photos);
  const faits = lireAnnonce(texte);
  const fiab = fiabilite({ texte, annee: faits.annee, km: faits.km, energie: faits.energie });
  const detail = mode === "benef" ? "complet" : o.detail;
  // Profil d'analyse : celui du compte (questionnaire), sinon celui de l'espace ; la ville saisie fait foi pour le trajet.
  const base = compte?.profilAnalyse ?? profilParDefaut(mode === "benef" ? "benef" : "particulier", ville);
  const profil = { ...(base.rempli ? base : profilParDefaut(mode === "benef" ? "benef" : "particulier", base.ville)), ville: ville || base.ville };
  // Cote calculée par l'outil sur les annonces en ligne : elle fait foi pour le prix du marché.
  // Projection de valeur (décote) en parallèle de l'IA : facultative, jamais bloquante.
  const projectionP = compte
    ? Promise.race([projectionMarche(texte, faits), new Promise<null>((ok) => setTimeout(() => ok(null), 15000))]).catch((e) => (console.error("projection", e), null))
    : Promise.resolve(null);
  // Historique de l'annonce et même voiture vue ailleurs (base du marché) : facultatif, jamais bloquant.
  const historiqueP: Promise<Historique | null> = compte
    ? (async () => {
        const { data, error } = await (await supabaseServeur()).rpc("historique_annonce", { p_id: numeroLeboncoin(r.data.lienAnnonce ?? texte.match(/https?:\/\/\S+/)?.[0]), p_annee: faits.annee, p_km: faits.km, p_modele: marqueModele(texte, faits).modele });
        if (error) console.error("historique_annonce", error.message);
        return error ? null : (data as Historique | null);
      })().catch(() => null)
    : Promise.resolve(null);
  const cote = compte ? await coteMarche(texte, faits) : null;
  const out: Analyse = { faits, fiab, ia: null, cote, profil };

  try {
    const { ia: brut, rapport } = await analyseIA({ texte, faits, fiab, profil, photos, offre: o.id, cote });
    // La cote de l'outil (annonces comparables) fait foi pour le prix du marché, dans les deux vues.
    if (cote) {
      const mc = marcheDepuisCote(cote);
      brut.marche = { ...brut.marche, ...mc };
      rapport.marche = { ...rapport.marche, bas: mc.bas ?? undefined, realiste: mc.realiste ?? undefined, reventeRapide: mc.reventeRapide ?? undefined, confiance: mc.confiance, commentaire: mc.commentaire };
    }
    out.ia = filtrer(brut, detail);
    if (mode === "benef") out.rapport = filtrerRapport(rapport, o.id);
  } catch (e) {
    if (e instanceof IaIndisponible) out.iaErreur = "L'estimation du marché n'est pas configurée sur ce serveur.";
    else if (e instanceof Anthropic.RateLimitError) out.iaErreur = "Trop de demandes en ce moment, réessayez dans une minute.";
    else if (e instanceof Anthropic.BadRequestError)
      out.iaErreur = /image|photo|media/i.test(e.message) ? "Une photo a été refusée. Retirez les photos et relancez." : "Le service d'analyse est en cours de réglage. Réessayez dans quelques minutes.";
    else if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) out.iaErreur = "Le service d'analyse est en cours de réglage. Réessayez dans quelques minutes.";
    else if (e instanceof Anthropic.APIError) out.iaErreur = "Le service d'analyse ne répond pas, réessayez.";
    else out.iaErreur = e instanceof Error ? e.message : "Erreur inconnue.";
    console.error("analyse IA", e);
    // L'IA ne répond pas : l'analyse reste complète avec les règles et la cote de l'outil, comme l'outil Garage.
    const regles = iaRegles(texte, faits, fiab, cote);
    out.ia = filtrer(regles, detail);
    if (mode === "benef") out.rapport = filtrerRapport(depuisIa(regles), o.id);
    out.regles = true;
    delete out.iaErreur;
  }

  out.projection = await projectionP;
  out.historique = await historiqueP;
  out.offre = o.id;
  out.lien = r.data.lienAnnonce ?? texte.match(/https?:\/\/\S+/)?.[0];
  out.vendeur = vendeurDe(r.data.vendeur, texte);
  if (compte) out.photosUrls = r.data.photosLiens.length ? r.data.photosLiens : photos.length ? await stockerPhotos(compte.id, photos) : [];
  let rapportId: string | null = null;
  // Une analyse n'est décomptée et enregistrée que si elle a abouti.
  if (compte && out.ia) {
    const v = out.ia.vehicule;
    const titre = titreVehicule([v.marque, v.modele, v.version].filter(Boolean).join(" ")).slice(0, 140) || faits.titre || "Annonce";
    // Verdict et note du bilan (profil de la personne) : ce que montrent les listes de rapports.
    const b = bilan(out, profil);
    out.bilan = { verdict: b.libelle, indice: b.indice, version: 2 };
    const resume = { verdict: b.libelle, marge: profil.objectif === "revente" ? b.argent.marge : null, note: b.indice, prix: b.argent.prix };
    // Décompte et rapport en une fois, avec la session de la personne (fonction enregistrer_analyse).
    const { data, error } = await (await supabaseServeur()).rpc("enregistrer_analyse", {
      p_mode: mode,
      p_titre: titre,
      p_marque: v.marque || null,
      p_prix: resume.prix == null ? null : Math.round(resume.prix),
      p_verdict: resume.verdict ?? null,
      p_marge: resume.marge == null ? null : Math.round(resume.marge),
      p_note: resume.note == null ? null : Math.round(resume.note),
      p_annonce: texte.slice(0, 8000),
      p_resultat: { ...out, ville },
    });
    if (error) console.error("enregistrer_analyse", error);
    rapportId = (data as string | null) ?? null;
    if (rapportId) {
      const { error: e2 } = await (await supabaseServeur()).rpc("rapport_completer", { p_id: rapportId, p_photos: out.photosUrls ?? [], p_lien: out.lien ?? null, p_vendeur: out.vendeur ?? null });
      if (e2) console.error("rapport_completer", e2);
    }
  }

  return Response.json({ ...out, rapportId, detail, offre: o.id, restantes: compte ? Math.max(0, compte.restantes - (out.ia ? 1 : 0)) : null, demo });
}
