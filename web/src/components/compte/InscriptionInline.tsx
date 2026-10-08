"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { connecter, emailValide, inscrire } from "@/lib/compte-client";
import { inputCls } from "../ui";
import { ConnexionSociale, type Fournisseur } from "./ConnexionSociale";

/* Inscription dans la carte de l'accueil, sans changer de page : e-mail, mot de passe, conditions, Google/Apple.
   Le prénom est demandé plus tard, dans le profil. `onSucces` est appelé une fois la session ouverte. */
export function InscriptionInline({ fournisseurs, suite, onSucces, bouton = "Voir mon rapport", avantSocial }: { fournisseurs: Fournisseur[]; suite: string; onSucces: () => void; bouton?: string; avantSocial?: () => void }) {
  const id = useId();
  const [mode, setMode] = useState<"inscription" | "connexion">("inscription");
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [voir, setVoir] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const err = erreur ? `${id}-err` : undefined;

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (!emailValide(email)) return setErreur("Indiquez une adresse email valide, par exemple nom@exemple.fr.");
    if (mdp.length < 8) return setErreur("Le mot de passe doit contenir au moins 8 caractères.");
    if (mode === "inscription" && !cgu) return setErreur("Acceptez les conditions d'utilisation pour créer votre compte.");
    setCharge(true);
    try {
      const m = mode === "inscription" ? await inscrire(email, mdp) : await connecter(email, mdp);
      if (m) return setErreur(m);
      onSucces();
    } finally {
      setCharge(false);
    }
  }

  return (
    <div className="grid gap-4">
      {fournisseurs.length > 0 && (
        <div onClickCapture={avantSocial}>
          <ConnexionSociale fournisseurs={fournisseurs} suite={suite} inscription={mode === "inscription"} />
        </div>
      )}
      <form onSubmit={envoyer} noValidate className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Email</span>
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
                className={`${inputCls} pr-20`}
              />
              <button type="button" onClick={() => setVoir((v) => !v)} aria-pressed={voir} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-xs text-ink-3 hover:text-ink">
                {voir ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>
        </div>
        {mode === "inscription" && (
          <label className="flex items-start gap-2.5 text-sm text-ink-2">
            <input type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} className="mt-1 size-4 accent-[#ff5a1f]" aria-describedby={err} />
            <span>
              J&apos;accepte les{" "}
              <Link href="/legal#conditions" className="underline underline-offset-4">
                conditions d&apos;utilisation
              </Link>{" "}
              et la{" "}
              <Link href="/legal#confidentialite" className="underline underline-offset-4">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
        )}
        {erreur && (
          <p id={err} role="alert" className="text-sm text-warn">
            {erreur}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={charge} className="btn btn-o">
            {charge ? "Un instant…" : mode === "inscription" ? bouton : "Se connecter et voir mon rapport"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "inscription" ? "connexion" : "inscription"));
              setErreur("");
            }}
            className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline"
          >
            {mode === "inscription" ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? En créer un"}
          </button>
        </div>
      </form>
    </div>
  );
}
