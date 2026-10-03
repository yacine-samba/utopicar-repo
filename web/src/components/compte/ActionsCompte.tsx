"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { inputCls } from "../ui";

export function BoutonPortail({ children = "Gérer mon abonnement" }: { children?: React.ReactNode }) {
  const [charge, setCharge] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={charge}
        className="btn"
        onClick={async () => {
          setCharge(true);
          const r = await fetch("/api/stripe/portail", { method: "POST" }).catch(() => null);
          const j = await r?.json().catch(() => ({}));
          if (j?.url) return location.assign(j.url);
          setCharge(false);
          setMsg(j?.erreur || "Le portail n'a pas pu s'ouvrir. Réessayez.");
        }}
      >
        {charge ? "Ouverture…" : children}
      </button>
      {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
    </div>
  );
}

export function FormProfil({ id, prenom, ville }: { id: string; prenom: string; ville: string }) {
  const router = useRouter();
  const [p, setP] = useState(prenom);
  const [v, setV] = useState(ville);
  const [etat, setEtat] = useState("");
  return (
    <form
      className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        setEtat("…");
        const { error } = await supabaseNavigateur().from("profils").update({ prenom: p.trim().slice(0, 60), ville: v.trim().slice(0, 80), updated_at: new Date().toISOString() }).eq("id", id);
        setEtat(error ? "Enregistrement impossible, réessayez." : "Enregistré");
        if (!error) router.refresh();
      }}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Prénom</span>
        <input value={p} onChange={(e) => setP(e.target.value)} autoComplete="given-name" className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Votre ville</span>
        <input value={v} onChange={(e) => setV(e.target.value)} autoComplete="address-level2" className={inputCls} />
      </label>
      <button type="submit" className="btn">
        Enregistrer
      </button>
      <p role="status" className="text-sm text-ink-3 sm:col-span-3">
        {etat === "…" ? "" : etat}
      </p>
    </form>
  );
}

export function FormMotDePasse() {
  const [mdp, setMdp] = useState("");
  const [etat, setEtat] = useState("");
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (mdp.length < 8) return setEtat("8 caractères au moins.");
        const { error } = await supabaseNavigateur().auth.updateUser({ password: mdp });
        setEtat(error ? "Mot de passe refusé : choisissez-en un plus long ou plus varié." : "Nouveau mot de passe enregistré.");
        if (!error) setMdp("");
      }}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Nouveau mot de passe</span>
        <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="new-password" minLength={8} className={inputCls} />
      </label>
      <button type="submit" className="btn">
        Changer
      </button>
      <p role="status" className="text-sm text-ink-3 sm:col-span-2">
        {etat}
      </p>
    </form>
  );
}

export function BoutonSupprimer() {
  const router = useRouter();
  const [etape, setEtape] = useState(0);
  const [msg, setMsg] = useState("");
  if (etape === 0)
    return (
      <button type="button" onClick={() => setEtape(1)} className="text-sm text-bad underline-offset-4 hover:underline">
        Supprimer mon compte
      </button>
    );
  return (
    <div role="alertdialog" aria-labelledby="supp-t" className="grid gap-3 rounded-2xl border border-bad/40 bg-bad/10 p-4">
      <p id="supp-t" className="text-sm">
        Votre compte, vos analyses et votre parc seront effacés définitivement, et votre abonnement sera résilié. Confirmer ?
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-sm border-bad/60 text-bad"
          onClick={async () => {
            const r = await fetch("/api/compte/supprimer", { method: "POST" }).catch(() => null);
            if (r?.ok) {
              router.replace("/?compte=supprime");
              router.refresh();
              return;
            }
            setMsg("La suppression a échoué. Écrivez-nous depuis la page Contact.");
          }}
        >
          Oui, tout supprimer
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setEtape(0)}>
          Annuler
        </button>
      </div>
      {msg && <p role="alert" className="text-sm text-warn">{msg}</p>}
    </div>
  );
}

/** Usage de l'espace (formule gratuite) : acheter pour soi, ou achat-revente avec Benef. */
export function ChoixUsage({ id, famille }: { id: string; famille: "particulier" | "benef" }) {
  const router = useRouter();
  const [v, setV] = useState(famille);
  const [etat, setEtat] = useState("");
  const choisir = async (f: "particulier" | "benef") => {
    setV(f);
    setEtat("");
    const { error } = await supabaseNavigateur().from("profils").update({ famille: f, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      setV(famille);
      return setEtat("Enregistrement impossible, réessayez.");
    }
    setEtat("Enregistré : votre espace s'adapte.");
    router.refresh();
  };
  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Votre usage</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["particulier", "J'achète une voiture pour moi", "Verdict, coût réel d'achat, points à vérifier."],
            ["benef", "Je fais de l'achat-revente", "Espace Benef : marge nette, prix d'offre, parc."],
          ] as const
        ).map(([f, t, d]) => (
          <label key={f} className={`carte flex cursor-pointer gap-3 p-4 transition ${v === f ? "border-o/60 bg-o/10" : "hover:border-line-2"}`}>
            <input type="radio" name="usage" checked={v === f} onChange={() => choisir(f)} className="mt-1 size-4 accent-[#ff5a1f]" />
            <span>
              <span className="block font-medium">{t}</span>
              <span className="block text-sm text-ink-3">{d}</span>
            </span>
          </label>
        ))}
      </div>
      <p role="status" className="text-sm text-ink-3">
        {etat}
      </p>
    </fieldset>
  );
}
