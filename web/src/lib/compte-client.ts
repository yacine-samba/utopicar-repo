"use client";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import { lireProfil } from "./orientation";

/* Création de compte et connexion depuis le navigateur, partagées par la page d'inscription et le bloc d'inscription
   de l'accueil. La fonction `compte` (Supabase) crée les comptes déjà confirmés et envoie les e-mails depuis utopicar.fr. */

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  user_already_exists: "Un compte existe déjà avec cet email. Connectez-vous.",
  email_exists: "Un compte existe déjà avec cet email. Connectez-vous.",
  email_not_confirmed: "Ce compte n'est pas encore activé. Utilisez « Recevoir un lien de connexion » ci-dessous.",
  over_email_send_rate_limit: "Trop d'emails envoyés. Patientez une minute puis réessayez.",
  over_request_rate_limit: "Trop de tentatives. Patientez une minute puis réessayez.",
  weak_password: "Mot de passe trop simple : 8 caractères au moins, avec des lettres et des chiffres.",
};
export const traduire = (e: { code?: string; message: string }) => MESSAGES[e.code ?? ""] ?? "Une erreur est survenue. Réessayez dans un instant.";

export const emailValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function fonctionCompte(corps: Record<string, unknown>): Promise<{ ok?: boolean; erreur?: string }> {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/compte`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_CLE },
    body: JSON.stringify(corps),
  }).catch(() => null);
  if (!r) return { erreur: "Connexion impossible. Vérifiez votre réseau et réessayez." };
  return r.json().catch(() => ({ erreur: "Le service ne répond pas. Réessayez dans un instant." }));
}

/** Crée le compte (profil du site joint) puis ouvre la session. Renvoie un message d'erreur, ou null. */
export async function inscrire(email: string, mdp: string, prenom = ""): Promise<string | null> {
  const j = await fonctionCompte({ action: "inscription", email, password: mdp, prenom: prenom.trim(), onboarding: lireProfil() });
  if (!j.ok) return j.erreur ?? "L'inscription n'a pas marché. Réessayez dans un instant.";
  const { error } = await supabaseNavigateur().auth.signInWithPassword({ email, password: mdp });
  return error ? traduire(error) : null;
}

/** Ouvre la session. Renvoie un message d'erreur, ou null. */
export async function connecter(email: string, mdp: string): Promise<string | null> {
  const { error } = await supabaseNavigateur().auth.signInWithPassword({ email, password: mdp });
  return error ? traduire(error) : null;
}
