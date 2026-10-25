"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { emailValide, fonctionCompte } from "@/lib/compte-client";
import { AntiRobot, CLE_TURNSTILE } from "../compte/AntiRobot";
import { inputCls } from "../ui";

/* Analyse offerte sans compte : le visiteur donne son email, l'annonce est gardée par la fonction `compte` (action
   « essai ») et le lien reçu ouvre son espace, où l'analyse démarre toute seule. Pas de mot de passe.
   Une seule demande par appareil (rappel local) ; les vraies limites sont en base, dans la fonction. */
const DEJA = "utp-essai";

export type DemandeEssai = { texte?: string; lien?: string; ville: string };

export function EssaiEmail({ demande, onRetour, onMotDePasse }: { demande: DemandeEssai; onRetour: () => void; onMotDePasse: () => void }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [cgu, setCgu] = useState(false);
  const [jeton, setJeton] = useState("");
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState("");
  const [deja, setDeja] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du rappel local
      setDeja(localStorage.getItem(DEJA));
    } catch {
      /* stockage indisponible */
    }
  }, []);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (!emailValide(email)) return setErreur("Indiquez une adresse email valide, par exemple nom@exemple.fr.");
    if (!cgu) return setErreur("Acceptez les conditions d'utilisation pour recevoir votre analyse.");
    if (CLE_TURNSTILE && !jeton) return setErreur("Patientez une seconde : la vérification anti-robot se termine.");
    setCharge(true);
    const j = await fonctionCompte({ action: "essai", email, cgu, jeton, texte: demande.texte, lien: demande.lien, ville: demande.ville });
    setCharge(false);
    if (!j.ok) return setErreur(j.erreur ?? "L'envoi n'a pas marché. Réessayez dans un instant.");
    try {
      localStorage.setItem(DEJA, email);
    } catch {
      /* stockage indisponible */
    }
    setEnvoye(email);
  }

  if (envoye)
    return (
      <div role="status" className="grid gap-3 rounded-2xl border border-ok/40 bg-ok/10 p-5">
        <b className="font-display text-lg text-ok">Vérifiez votre boîte mail</b>
        <p className="text-ink-2">
          Un lien vient de partir à <b className="text-ink">{envoye}</b>. Cliquez dessus : votre espace s&apos;ouvre et l&apos;analyse démarre toute seule. Il est valable une heure.
        </p>
        <p className="text-sm text-ink-3">Pensez aux courriers indésirables et à l&apos;onglet Promotions.</p>
      </div>
    );

  if (deja)
    return (
      <div className="grid gap-3 rounded-2xl border border-line-2 p-5">
        <b className="font-display text-lg">Votre analyse offerte a déjà été demandée</b>
        <p className="text-ink-2">
          Un lien est parti à <b className="text-ink">{deja}</b>. Ouvrez-le, ou connectez-vous : vos analyses vous attendent dans votre espace.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/connexion?next=/app/analyser" className="btn btn-o btn-sm">
            Me connecter
          </Link>
          <button type="button" onClick={onRetour} className="btn btn-sm">
            Modifier l&apos;annonce
          </button>
        </div>
      </div>
    );

  const err = erreur ? `${id}-err` : undefined;
  return (
    <form onSubmit={envoyer} noValidate className="grid gap-4">
      <div className="grid gap-1">
        <b className="font-display text-xl">Où vous envoyer l&apos;analyse ?</b>
        <p className="text-ink-2">Votre première analyse est offerte. Indiquez votre email : vous recevez un lien qui ouvre votre espace et lance l&apos;analyse. Pas de mot de passe à créer.</p>
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Email</span>
        <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!erreur && /email/i.test(erreur)} aria-describedby={err} className={inputCls} />
      </label>
      <label className="flex items-start gap-3 text-sm text-ink-2">
        <input type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#ff5a1f]" />
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
      <AntiRobot onJeton={setJeton} />
      {erreur && (
        <p id={`${id}-err`} role="alert" className="rounded-xl border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
          {erreur}
        </p>
      )}
      <button type="submit" disabled={charge} className="btn btn-o w-full">
        {charge ? "Un instant…" : "Recevoir mon analyse"}
      </button>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <button type="button" onClick={onRetour} className="text-ink-3 underline-offset-4 hover:text-ink hover:underline">
          Modifier l&apos;annonce
        </button>
        <button type="button" onClick={onMotDePasse} className="text-ink-3 underline-offset-4 hover:text-ink hover:underline">
          Créer un compte avec mot de passe
        </button>
      </div>
    </form>
  );
}
