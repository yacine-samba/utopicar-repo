"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { connecter, emailValide, fonctionCompte, inscrire } from "@/lib/compte-client";
import { inputCls } from "../ui";

type Mode = "inscription" | "connexion";

export function FormulaireCompte({ mode, suite, actif }: { mode: Mode; suite: string; actif: boolean }) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  // en cas d'erreur, le focus va sur le champ concerné (le message, lui, est annoncé par role="alert")
  const refEmail = useRef<HTMLInputElement>(null);
  const refMdp = useRef<HTMLInputElement>(null);
  const refCgu = useRef<HTMLInputElement>(null);
  const fautif = (m: string, champ: { current: HTMLInputElement | null }) => {
    setErreur(m);
    champ.current?.focus();
  };
  const [envoye, setEnvoye] = useState("");

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
    if (!emailValide(email)) return fautif("Indiquez une adresse email valide, par exemple nom@exemple.fr.", refEmail);
    if (mdp.length < 8) return fautif("Le mot de passe doit contenir au moins 8 caractères.", refMdp);
    if (mode === "inscription" && !cgu) return fautif("Acceptez les conditions d'utilisation pour créer votre compte.", refCgu);
    setCharge(true);
    try {
      const err = mode === "inscription" ? await inscrire(email, mdp) : await connecter(email, mdp);
      if (err) return setErreur(err);
      router.replace(suite);
      router.refresh();
    } finally {
      setCharge(false);
    }
  }

  async function lienMagique() {
    setErreur("");
    if (!emailValide(email)) return setErreur("Indiquez d'abord votre adresse email.");
    setCharge(true);
    const j = await fonctionCompte({ action: "lien", email, suite });
    setCharge(false);
    if (!j.ok) return setErreur(j.erreur ?? "L'envoi n'a pas marché. Réessayez dans un instant.");
    setEnvoye(`Si un compte existe pour ${email}, un lien de connexion vient de partir. Il est valable une heure.`);
  }

  async function oubli() {
    setErreur("");
    if (!emailValide(email)) return setErreur("Indiquez d'abord votre adresse email.");
    setCharge(true);
    const j = await fonctionCompte({ action: "oubli", email });
    setCharge(false);
    if (!j.ok) return setErreur(j.erreur ?? "L'envoi n'a pas marché. Réessayez dans un instant.");
    setEnvoye(`Si un compte existe pour ${email}, un lien pour choisir un nouveau mot de passe vient de partir.`);
  }

  const err = erreur ? `${id}-err` : undefined;
  return (
    <form onSubmit={envoyer} noValidate className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">
          Email <span className="text-ink-3">(obligatoire)</span>
        </span>
        <input ref={refEmail} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!erreur && /email/i.test(erreur)} aria-describedby={err} className={inputCls} />
      </label>
      <div className="grid gap-1.5 text-sm">
        <label htmlFor={`${id}-mdp`} className="text-ink-2">
          Mot de passe
        </label>
        <div className="relative">
          <input
            ref={refMdp}
            id={`${id}-mdp`}
            type={voir ? "text" : "password"}
            required
            minLength={8}
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            autoComplete={mode === "inscription" ? "new-password" : "current-password"}
            aria-invalid={!!erreur && /mot de passe/i.test(erreur)}
            aria-describedby={[`${id}-regle`, err].filter(Boolean).join(" ")}
            className={`${inputCls} pr-28`}
          />
          <button type="button" onClick={() => setVoir((v) => !v)} aria-pressed={voir} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-sm text-ink-3 hover:text-ink">
            {voir ? "Masquer" : "Afficher"}
          </button>
        </div>
        {/* la règle se coche pendant la frappe, au lieu d'une erreur après l'envoi */}
        <span id={`${id}-regle`} className={`flex items-center gap-1.5 text-xs transition ${mdp.length >= 8 ? "text-ok" : "text-ink-3"}`} aria-live="polite">
          <span aria-hidden="true">{mdp.length >= 8 ? "✓" : "○"}</span> 8 caractères au moins{mdp.length > 0 && mdp.length < 8 ? ` (encore ${8 - mdp.length})` : ""}
        </span>
      </div>
      {mode === "inscription" && (
        <label className="flex items-start gap-3 text-sm text-ink-2">
          <input ref={refCgu} type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#ff5a1f]" />
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
