"use client";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { inputCls } from "../ui";
import { useNotification } from "../espace/Notification";

/* Codes offerts (TIKTOK…). Saisi à l'inscription ou arrivé par un lien (?code=), le code est gardé dans le navigateur
   jusqu'à l'ouverture de l'espace, qui l'enregistre sur le compte (CodeEnAttente) : ainsi il marche aussi avec
   Google, Apple ou un lien de connexion. Dans le compte, ChampCode l'enregistre tout de suite. */

const CLE = "utp-code";
const propre = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30);

export function retenirCode(code: string) {
  try {
    const c = propre(code);
    if (c) localStorage.setItem(CLE, c);
    else localStorage.removeItem(CLE);
  } catch {}
}
export function codeRetenu(): string {
  try {
    return localStorage.getItem(CLE) ?? "";
  } catch {
    return "";
  }
}

async function envoyer(code: string): Promise<{ ok?: boolean; analyses?: number; erreur?: string; statut: number }> {
  const r = await fetch("/api/code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }).catch(() => null);
  if (!r) return { erreur: "Connexion impossible. Vérifiez votre réseau et réessayez.", statut: 0 };
  return { ...(await r.json().catch(() => ({}))), statut: r.status };
}

const merci = (n?: number) => `${n ?? 3} analyses Benef offertes : marge nette, prix d'offre et prix max.`;

/** Champ facultatif du formulaire d'inscription : prérempli par le lien (?code=TIKTOK) ou un passage précédent. */
export function CodeInscription({ initial }: { initial?: string }) {
  const id = useId();
  const [code, setCode] = useState(() => propre(initial ?? ""));
  const [ouvert, setOuvert] = useState(!!initial);
  // un code déjà gardé (lien ?code= ouvert avant) sera enregistré de toute façon par l'espace ; il préremplit le champ à l'ouverture
  useEffect(() => {
    if (initial) retenirCode(initial);
  }, [initial]);
  if (!ouvert)
    return (
      <button type="button" onClick={() => { setCode((c) => c || codeRetenu()); setOuvert(true); }} className="w-fit text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
        J&apos;ai un code
      </button>
    );
  return (
    <label htmlFor={id} className="grid gap-1.5 text-sm">
      <span className="text-ink-2">
        Code <span className="text-ink-3">(facultatif)</span>
      </span>
      <input id={id} value={code} onChange={(e) => { const c = propre(e.target.value); setCode(c); retenirCode(c); }} autoCapitalize="characters" autoComplete="off" spellCheck={false} className={`${inputCls} font-semibold tracking-[0.08em]`} />
      {code && <span className="text-xs text-ink-3">Il sera ajouté à votre compte dès sa création.</span>}
    </label>
  );
}

/** Dans l'espace : enregistre le code gardé dans le navigateur, une seule fois, et l'annonce. */
export function CodeEnAttente() {
  const router = useRouter();
  const { notifier, element } = useNotification();
  const fait = useRef(false);
  useEffect(() => {
    if (fait.current) return;
    fait.current = true;
    const code = codeRetenu();
    if (!code) return;
    envoyer(code).then((j) => {
      if (j.statut === 0 || j.statut === 429 || j.statut >= 500) return;   // réseau ou serveur : on réessaiera à la prochaine visite
      retenirCode("");
      if (j.ok) {
        notifier({ titre: `Code ${code} activé`, texte: merci(j.analyses), ton: "ok" });
        router.refresh();
      } else if (j.erreur) notifier({ titre: `Code ${code}`, texte: j.erreur, ton: "warn" });
    });
  }, [notifier, router]);
  return element;
}

/** Profil et paramètres : saisir un code. */
export function ChampCode() {
  const router = useRouter();
  const id = useId();
  const [code, setCode] = useState("");
  const [charge, setCharge] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function valider(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return;
    setCharge(true);
    setMsg(null);
    const j = await envoyer(code);
    setCharge(false);
    if (j.ok) {
      setMsg({ ok: true, t: `Code ${code} activé : ${merci(j.analyses)}` });
      setCode("");
      router.refresh();
    } else setMsg({ ok: false, t: j.erreur ?? "Le code n'a pas pu être enregistré." });
  }
  return (
    <form onSubmit={valider} className="grid gap-2">
      <label htmlFor={id} className="text-sm text-ink-2">
        Vous avez un code ?
      </label>
      <div className="flex flex-wrap gap-2">
        <input id={id} value={code} onChange={(e) => setCode(propre(e.target.value))} placeholder="TIKTOK" autoCapitalize="characters" autoComplete="off" spellCheck={false} className={`${inputCls} max-w-[220px] font-semibold tracking-[0.08em]`} />
        <button type="submit" disabled={charge || !code} className="btn btn-sm">
          {charge ? "Un instant…" : "Valider"}
        </button>
      </div>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-ok" : "text-bad"}`}>
          {msg.t}
        </p>
      )}
    </form>
  );
}
