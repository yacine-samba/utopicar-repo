"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";

export type Fournisseur = "google" | "apple";

const LOGO: Record<Fournisseur, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.7c0-2.5 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-2c-1.5-.2-3 .9-3.7.9-.8 0-2-.9-3.2-.8a4.8 4.8 0 0 0-4 2.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4a10 10 0 0 0 1.4-2.8 4.3 4.3 0 0 1-2.5-3.8ZM14 5.3c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4Z" />
    </svg>
  ),
};
const NOM: Record<Fournisseur, string> = { google: "Google", apple: "Apple" };

/** « Continuer avec Google / Apple » : affiché seulement pour les fournisseurs activés dans Supabase. */
export function ConnexionSociale({ fournisseurs, suite, inscription }: { fournisseurs: Fournisseur[]; suite: string; inscription: boolean }) {
  const [charge, setCharge] = useState<Fournisseur | null>(null);
  const [erreur, setErreur] = useState("");
  if (!fournisseurs.length) return null;
  const aller = async (f: Fournisseur) => {
    setErreur("");
    setCharge(f);
    const { error } = await supabaseNavigateur().auth.signInWithOAuth({
      provider: f,
      options: { redirectTo: `${location.origin}/auth/confirm?next=${encodeURIComponent(suite)}`, queryParams: f === "google" ? { prompt: "select_account" } : undefined },
    });
    if (error) {
      setCharge(null);
      setErreur(`La connexion avec ${NOM[f]} n'a pas marché. Réessayez, ou utilisez votre e-mail.`);
    }
  };
  return (
    <div className="grid gap-3">
      {fournisseurs.map((f) => (
        <button key={f} type="button" disabled={!!charge} onClick={() => aller(f)} className="btn w-full gap-3 bg-white! text-[#1f1f1f]! hover:bg-white/90!">
          {LOGO[f]}
          {charge === f ? "Redirection…" : `Continuer avec ${NOM[f]}`}
        </button>
      ))}
      {inscription && (
        <p className="text-xs text-ink-3">
          En continuant avec {fournisseurs.map((f) => NOM[f]).join(" ou ")}, vous acceptez les <Link href="/legal#conditions" className="underline underline-offset-4">conditions d&apos;utilisation</Link> et la{" "}
          <Link href="/legal#confidentialite" className="underline underline-offset-4">politique de confidentialité</Link>.
        </p>
      )}
      {erreur && <p role="alert" className="text-sm text-warn">{erreur}</p>}
      <p className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-ink-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" /> ou avec votre e-mail <span className="h-px flex-1 bg-line" />
      </p>
    </div>
  );
}
