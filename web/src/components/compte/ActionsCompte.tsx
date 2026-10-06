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

/** Envoi au serveur (route /api/compte/profil) avec un message clair dans tous les cas. */
async function envoyerCompte(corps: Record<string, unknown>): Promise<string | null> {
  try {
    const r = await fetch("/api/compte/profil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
    const j = await r.json().catch(() => ({}));
    return r.ok ? null : j.erreur || "Enregistrement impossible, réessayez.";
  } catch {
    return "Connexion impossible. Vérifiez votre réseau et réessayez.";
  }
}

export function FormProfil({ prenom, nom, ville }: { prenom: string; nom: string; ville: string }) {
  const router = useRouter();
  const [f, setF] = useState({ prenom, nom, ville });
  const [etat, setEtat] = useState<{ ok: boolean; t: string } | null>(null);
  const [charge, setCharge] = useState(false);
  const maj = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <form
      className="grid gap-4 sm:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setCharge(true);
        const err = await envoyerCompte({ action: "profil", ...f });
        setCharge(false);
        setEtat(err ? { ok: false, t: err } : { ok: true, t: "Profil enregistré." });
        if (!err) router.refresh();
      }}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Prénom</span>
        <input value={f.prenom} onChange={maj("prenom")} autoComplete="given-name" maxLength={60} className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Nom</span>
        <input value={f.nom} onChange={maj("nom")} autoComplete="family-name" maxLength={80} className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Votre ville</span>
        <input value={f.ville} onChange={maj("ville")} autoComplete="address-level2" maxLength={80} className={inputCls} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <button type="submit" disabled={charge} className="btn">
          {charge ? "Enregistrement…" : "Enregistrer"}
        </button>
        <p role="status" className={`text-sm ${etat?.ok ? "text-ok" : "text-warn"}`}>
          {etat?.t}
        </p>
      </div>
    </form>
  );
}

export function FormEmail({ email }: { email: string }) {
  const [v, setV] = useState(email);
  const [etat, setEtat] = useState<{ ok: boolean; t: string } | null>(null);
  const [charge, setCharge] = useState(false);
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        setCharge(true);
        const err = await envoyerCompte({ action: "email", email: v.trim() });
        setCharge(false);
        setEtat(err ? { ok: false, t: err } : { ok: true, t: `Un lien de confirmation vient de partir à ${v.trim()}. Cliquez dessus pour terminer le changement.` });
      }}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Adresse e-mail</span>
        <input type="email" value={v} onChange={(e) => setV(e.target.value)} autoComplete="email" required className={inputCls} />
      </label>
      <button type="submit" disabled={charge || v.trim() === email} className="btn">
        {charge ? "Envoi…" : "Changer"}
      </button>
      <p role="status" className={`text-sm sm:col-span-2 ${etat?.ok ? "text-ok" : "text-warn"}`}>
        {etat?.t}
      </p>
    </form>
  );
}

export function FormMotDePasse() {
  const [actuel, setActuel] = useState("");
  const [mdp, setMdp] = useState("");
  const [etat, setEtat] = useState<{ ok: boolean; t: string } | null>(null);
  const [charge, setCharge] = useState(false);
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        if (mdp.length < 8) return setEtat({ ok: false, t: "8 caractères au moins." });
        setCharge(true);
        const err = await envoyerCompte({ action: "motdepasse", actuel, nouveau: mdp });
        setCharge(false);
        setEtat(err ? { ok: false, t: err } : { ok: true, t: "Nouveau mot de passe enregistré." });
        if (!err) {
          setMdp("");
          setActuel("");
        }
      }}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Mot de passe actuel</span>
        <input type="password" value={actuel} onChange={(e) => setActuel(e.target.value)} autoComplete="current-password" placeholder="si vous en avez un" className={inputCls} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Nouveau mot de passe</span>
        <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="new-password" minLength={8} required className={inputCls} />
      </label>
      <button type="submit" disabled={charge} className="btn">
        {charge ? "…" : "Changer"}
      </button>
      <p role="status" className={`text-sm sm:col-span-3 ${etat?.ok ? "text-ok" : "text-warn"}`}>
        {etat?.t}
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

/** Accessibilité : options d'affichage de l'espace (enregistrées dans profils.reglages). Les favoris sont désactivés par défaut. */
export function ChoixAccessibilite({ id, reglages }: { id: string; reglages: Record<string, unknown> }) {
  const router = useRouter();
  const [favoris, setFavoris] = useState(reglages.favoris === true);
  const [etat, setEtat] = useState("");
  const basculer = async () => {
    const suivant = !favoris;
    setFavoris(suivant);
    setEtat("");
    const { error } = await supabaseNavigateur().from("profils").update({ reglages: { ...reglages, favoris: suivant }, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      setFavoris(!suivant);
      return setEtat("Enregistrement impossible, réessayez.");
    }
    setEtat(suivant ? "Favoris activés : l'étoile apparaît sur les annonces et les rapports." : "Favoris désactivés.");
    router.refresh();
  };
  return (
    <div className="grid gap-3">
      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-line p-4">
        <span>
          <span className="block font-medium">Favoris</span>
          <span className="block text-sm text-ink-3">Une étoile sur les annonces, les recherches et les rapports, et une page Favoris dans le menu, pour mettre des voitures de côté.</span>
        </span>
        <input type="checkbox" role="switch" checked={favoris} onChange={basculer} className="mt-1 size-5 shrink-0 accent-[#ff5a1f]" />
      </label>
      <p role="status" className="text-sm text-ink-3">{etat}</p>
    </div>
  );
}
