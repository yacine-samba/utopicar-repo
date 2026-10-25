"use client";
/* Reprise d'un paiement abandonné : le produit choisi est gardé dans le navigateur au lancement du paiement.
   De retour dans l'espace sans avoir payé (Stripe fermé, retour arrière, carte refusée…), un bandeau propose
   de reprendre là où on s'était arrêté. Effacé au retour d'un paiement réussi, sur fermeture, ou après 7 jours. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GUIDE, OFFRES, OPTION_MESSAGES, PACKS, prixTxt, type OffreId } from "@/lib/offres";
import { Ico } from "./Icones";

const CLE = "utp-achat";
const DUREE = 7 * 864e5;

export function retenirAchat(produit: string) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ p: produit, t: Date.now() }));
  } catch {}
}
export function oublierAchat() {
  try {
    localStorage.removeItem(CLE);
  } catch {}
}
function lire(): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || "null") as { p?: string; t?: number } | null;
    return v?.p && v.t && Date.now() - v.t < DUREE ? v.p : null;
  } catch {
    return null;
  }
}
function nom(p: string) {
  if (p in OFFRES) {
    const o = OFFRES[p as OffreId];
    return `${o.famille === "benef" ? "Benef " : ""}${o.nom} (${prixTxt(o.prix)} par mois)`;
  }
  const k = PACKS.find((x) => x.id === p);
  if (k) return `${k.nom} (${prixTxt(k.prix)})`;
  if (p === "guide") return `${GUIDE.nom} (${prixTxt(GUIDE.prix)})`;
  if (p === "messages") return `l'option ${OPTION_MESSAGES.nom}`;
  return null;
}

export function RepriseAchat({ actuelle, abonne }: { actuelle: string; abonne: boolean }) {
  const chemin = usePathname();
  const [p, setP] = useState<string | null>(null);
  useEffect(() => {
    const q = location.search;
    // retour d'un paiement réussi (visite de bienvenue, crédits, guides) : plus rien à reprendre
    if (/paiement=ok|bienvenue=1/.test(q)) return oublierAchat();
    const v = lire();
    // formule déjà prise, ou abonnement en cours pour une formule (le changement passe par le portail) : on oublie
    if (!v || v === actuelle || (abonne && v in OFFRES)) return oublierAchat();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture du navigateur après le rendu serveur
    setP(v);
  }, [chemin, actuelle, abonne]);
  const n = p ? nom(p) : null;
  if (!p || !n || chemin === "/app/payer") return null;
  return (
    <div role="region" aria-label="Paiement à reprendre" className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-o/40 bg-o/10 px-4 py-3 text-sm">
      <p className="min-w-0 flex-1 text-ink">
        Vous alliez prendre <b>{n}</b>. Rien n&apos;a été débité.
      </p>
      <Link href={`/app/payer?produit=${encodeURIComponent(p)}`} className="btn btn-o btn-sm">
        Reprendre le paiement
      </Link>
      <button type="button" onClick={() => (oublierAchat(), setP(null))} aria-label="Ne plus proposer" className="grid size-8 place-items-center rounded-full text-ink-3 hover:text-ink">
        <Ico nom="fermer" className="size-4" />
      </button>
    </div>
  );
}
