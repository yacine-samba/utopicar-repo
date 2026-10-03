"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { inputCls } from "../ui";

type Mode = "inscription" | "connexion";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  user_already_exists: "Un compte existe déjà avec cet email. Connectez-vous.",
  email_exists: "Un compte existe déjà avec cet email. Connectez-vous.",
  email_not_confirmed: "Confirmez d'abord votre email : le lien vous a été envoyé à l'inscription.",
  over_email_send_rate_limit: "Trop d'emails envoyés. Patientez une minute puis réessayez.",
  over_request_rate_limit: "Trop de tentatives. Patientez une minute puis réessayez.",
  weak_password: "Mot de passe trop simple : 8 caractères au moins, avec des lettres et des chiffres.",
  otp_disabled: "Aucun compte n'existe avec cet email.",
};
const traduire = (e: { code?: string; message: string }) => MESSAGES[e.code ?? ""] ?? "Une erreur est survenue. Réessayez dans un instant.";

function profilOnboarding() {
  try {
    return JSON.parse(localStorage.getItem("utp-profil") || "{}") as Record<string, string | null>;
  } catch {
    return {};
  }
}

export function FormulaireCompte({ mode, suite, actif }: { mode: Mode; suite: string; actif: boolean }) {
  const router = useRouter();
  const id = useId();
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState("");

  const retour = () => `${location.origin}/auth/confirm?next=${encodeURIComponent(suite)}`;

  if (!actif)
    return (
      <p role="status" className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-warn">
        Les comptes ouvrent très bientôt. Revenez dans quelques jours.
      </p>
    );

  if (envoye)
    return (
      <div role="status" className="grid gap-3 rounded-2xl border border-ok/40 bg-ok/10 p-5">
        <b className="font-display text-lg text-ok">Vérifiez votre boîte mail</b>
        <p className="text-ink-2">{envoye}</p>
        <p className="text-sm text-ink-3">Pensez aux courriers indésirables et à l&apos;onglet Promotions.</p>
      </div>
    );

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErreur("Indiquez une adresse email valide, par exemple nom@exemple.fr.");
    if (mdp.length < 8) return setErreur("Le mot de passe doit contenir au moins 8 caractères.");
    if (mode === "inscription" && !cgu) return setErreur("Acceptez les conditions d'utilisation pour créer votre compte.");
    setCharge(true);
    const sb = supabaseNavigateur();
    try {
      if (mode === "inscription") {
        const p = profilOnboarding();
        // Inscription par le serveur : compte prêt tout de suite, sans email de confirmation à attendre.
        const r = await fetch("/api/compte/inscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: mdp, prenom: prenom.trim(), onboarding: p }),
        }).catch(() => null);
        if (r && r.status !== 501) {
          const j = await r.json().catch(() => null);
          if (!r.ok) return setErreur(j?.erreur ?? "L'inscription n'a pas marché. Réessayez dans un instant.");
          if (!j?.connecte) {
            const { error } = await sb.auth.signInWithPassword({ email, password: mdp });
            if (error) return setErreur(traduire(error));
          }
          router.replace(suite);
          router.refresh();
          return;
        }
        const { data, error } = await sb.auth.signUp({
          email,
          password: mdp,
          options: { emailRedirectTo: retour(), data: { prenom: prenom.trim(), famille: p.famille ?? null, onboarding: p } },
        });
        if (error) return setErreur(traduire(error));
        if (!data.session) return setEnvoye(`Un lien de confirmation vient de partir à ${email}. Cliquez dessus pour activer votre compte.`);
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password: mdp });
        if (error) return setErreur(traduire(error));
      }
      router.replace(suite);
      router.refresh();
    } finally {
      setCharge(false);
    }
  }

  async function lienMagique() {
    setErreur("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErreur("Indiquez d'abord votre adresse email.");
    setCharge(true);
    const { error } = await supabaseNavigateur().auth.signInWithOtp({ email, options: { emailRedirectTo: retour(), shouldCreateUser: false } });
    setCharge(false);
    if (error) return setErreur(traduire(error));
    setEnvoye(`Un lien de connexion vient de partir à ${email}. Il est valable une heure.`);
  }

  async function oubli() {
    setErreur("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErreur("Indiquez d'abord votre adresse email.");
    setCharge(true);
    const { error } = await supabaseNavigateur().auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/confirm?next=/compte` });
    setCharge(false);
    if (error) return setErreur(traduire(error));
    setEnvoye(`Si un compte existe pour ${email}, un lien pour choisir un nouveau mot de passe vient de partir.`);
  }

  const err = erreur ? `${id}-err` : undefined;
  return (
    <form onSubmit={envoyer} noValidate className="grid gap-4">
      {mode === "inscription" && (
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Prénom</span>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" maxLength={60} className={inputCls} />
        </label>
      )}
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">
          Email <span className="text-ink-3">(obligatoire)</span>
        </span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!erreur && /email/i.test(erreur)} aria-describedby={err} className={inputCls} />
      </label>
      <div className="grid gap-1.5 text-sm">
        <label htmlFor={`${id}-mdp`} className="text-ink-2">
          Mot de passe <span className="text-ink-3">(8 caractères au moins)</span>
        </label>
        <div className="relative">
          <input
            id={`${id}-mdp`}
            type={voir ? "text" : "password"}
            required
            minLength={8}
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            autoComplete={mode === "inscription" ? "new-password" : "current-password"}
            aria-invalid={!!erreur && /mot de passe/i.test(erreur)}
            aria-describedby={err}
            className={`${inputCls} pr-28`}
          />
          <button type="button" onClick={() => setVoir((v) => !v)} aria-pressed={voir} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-sm text-ink-3 hover:text-ink">
            {voir ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>
      {mode === "inscription" && (
        <label className="flex items-start gap-3 text-sm text-ink-2">
          <input type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} className="mt-1 size-4 accent-[#ff5a1f]" />
          <span>
            J&apos;accepte les{" "}
            <Link href="/legal#conditions" className="text-o2 underline underline-offset-4">
              conditions d&apos;utilisation
            </Link>{" "}
            et la{" "}
            <Link href="/legal#confidentialite" className="text-o2 underline underline-offset-4">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
      )}
      {erreur && (
        <p id={`${id}-err`} role="alert" className="rounded-xl border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
          {erreur}
        </p>
      )}
      <button type="submit" disabled={charge} className="btn btn-o mt-1 w-full">
        {charge ? "Un instant…" : mode === "inscription" ? "Créer mon compte gratuit" : "Me connecter"}
      </button>
      {mode === "connexion" && (
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <button type="button" onClick={lienMagique} className="text-ink-3 underline-offset-4 hover:text-ink hover:underline">
            Recevoir un lien de connexion
          </button>
          <button type="button" onClick={oubli} className="text-ink-3 underline-offset-4 hover:text-ink hover:underline">
            Mot de passe oublié ?
          </button>
        </div>
      )}
    </form>
  );
}
