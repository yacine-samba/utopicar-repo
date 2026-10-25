"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { retenirAchat } from "./RepriseAchat";

/** Ouvre le paiement Stripe tout de suite (une seule fois, même en double rendu), avec un bouton si la redirection échoue. */
export function LancerPaiement({ produit, libelle }: { produit: string; libelle: string }) {
  const lance = useRef(false);
  const [erreur, setErreur] = useState("");
  const aller = async () => {
    setErreur("");
    retenirAchat(produit);
    track("paiement_lance", { produit, depuis: "reprise" });
    const r = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ produit }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (j.url) return location.assign(j.url);
    setErreur(j.erreur || "Le paiement n'a pas pu démarrer. Réessayez dans un instant.");
  };
  useEffect(() => {
    if (lance.current) return;
    lance.current = true;
    void aller();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="carte mx-auto mt-10 grid max-w-md gap-4 p-7 text-center" aria-live="polite">
      {!erreur && <span className="mx-auto size-8 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" />}
      <h1 className="font-display text-xl font-semibold">{erreur ? "Le paiement n'a pas démarré" : "Ouverture du paiement sécurisé"}</h1>
      <p className="text-ink-2">{libelle}</p>
      {erreur ? (
        <p role="alert" className="text-sm text-warn">{erreur}</p>
      ) : (
        <p className="text-sm text-ink-3">Vous allez être redirigé vers Stripe. Votre carte n&apos;est jamais vue ni gardée par Utopicar.</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => void aller()} className="btn btn-o btn-sm">
          {erreur ? "Réessayer" : "Continuer vers le paiement"}
        </button>
        <Link href="/tarifs" className="btn btn-sm">Revoir les formules</Link>
      </div>
    </section>
  );
}
