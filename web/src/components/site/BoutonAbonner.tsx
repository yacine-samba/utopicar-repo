"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Lance le paiement Stripe ; renvoie vers l'inscription si personne n'est connecté. */
export function BoutonAbonner({ produit, children, className = "btn btn-o w-full" }: { produit: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const [charge, setCharge] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={charge}
        className={className}
        onClick={async () => {
          setCharge(true);
          setMsg("");
          try {
            const r = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ produit }) });
            const j = await r.json().catch(() => ({}));
            if (r.status === 401) return router.push(`/inscription?next=${encodeURIComponent(location.pathname + location.hash)}&offre=${produit}`);
            if (j.url) return location.assign(j.url);
            setMsg(j.erreur || "Le paiement n'a pas pu démarrer. Réessayez.");
          } catch {
            setMsg("Connexion impossible. Réessayez dans un instant.");
          } finally {
            setCharge(false);
          }
        }}
      >
        {charge ? "Un instant…" : children}
      </button>
      {msg && (
        <p role="alert" className="text-center text-sm text-warn">
          {msg}
        </p>
      )}
    </div>
  );
}
