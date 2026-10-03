"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cx, inputCls } from "@/lib/cx";
import type { CatMarque, CoteAnnonce } from "@/lib/vehicules/types";
import { ChoixVehicule, type Choix } from "./ChoixVehicule";

type Annonce = {
  id: string; titre: string; prix: number; annee: number | null; km: number | null; energie: string | null; boite: string | null; pro: boolean; lieu: string | null;
  source: string; vu: string | null; url: string | null; gen: string | null; genLabel: string; piege: boolean; suspect: boolean; cote: CoteAnnonce | null;
};
type Resultat = { modele: { nom: string; gens: { id: string; label: string; y0: number; y1: number; n: number }[]; incertaines: number }; total: number; trouvees: number; sousLaCote: number; annonces: Annonce[]; ms: number };
type Filtres = { energie: string; boite: string; anneeMin: string; anneeMax: string; prixMin: string; prixMax: string; kmMax: string; vendeur: string; mots: string; exclure: string; sousCote: string; fiables: boolean; tri: string };

const VIDE: Filtres = { energie: "", boite: "", anneeMin: "", anneeMax: "", prixMin: "", prixMax: "", kmMax: "", vendeur: "", mots: "", exclure: "", sousCote: "", fiables: true, tri: "ecart" };
const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const n = (s: string) => (s.trim() && /^\d+$/.test(s.replace(/\s/g, "")) ? Number(s.replace(/\s/g, "")) : null);
const CLE = "utp-recherche";

export function RechercheMarche({ cat, alertes }: { cat: CatMarque[]; alertes: boolean }) {
  const [choix, setChoix] = useState<Choix>({ marque: "", modele: "", gen: "" });
  const [f, setF] = useState<Filtres>(VIDE);
  const [res, setRes] = useState<Resultat | null>(null);
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);

  // dernière recherche retrouvée au retour sur la page
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(CLE) || "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local
      if (s?.choix) { setChoix(s.choix); setF({ ...VIDE, ...s.f }); }
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const maj = (k: keyof Filtres) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((x) => ({ ...x, [k]: e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function chercher(e?: React.FormEvent) {
    e?.preventDefault();
    if (!choix.marque || !choix.modele) return setEtat("Choisissez une marque et un modèle.");
    setCharge(true);
    setEtat("Recherche et calcul de la cote de chaque annonce…");
    try {
      localStorage.setItem(CLE, JSON.stringify({ choix, f }));
    } catch {
      /* rien */
    }
    try {
      const r = await fetch("/api/marche/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marque: choix.marque, modele: choix.modele, gen: choix.gen || undefined, energie: f.energie, boite: f.boite,
          anneeMin: n(f.anneeMin), anneeMax: n(f.anneeMax), prixMin: n(f.prixMin), prixMax: n(f.prixMax), kmMax: n(f.kmMax),
          vendeur: f.vendeur, mots: f.mots, exclure: f.exclure, sousCote: n(f.sousCote) ?? 0, fiables: f.fiables, tri: f.tri,
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) return setEtat(j?.erreur ?? "La recherche n'a pas abouti. Réessayez.");
      setRes(j);
      setEtat("");
    } finally {
      setCharge(false);
    }
  }

  const alerteHref = choix.marque && choix.modele
    ? `/app/alertes?${new URLSearchParams({ marque: choix.marque, modele: choix.modele, gen: choix.gen, energie: f.energie, boite: f.boite, anneeMin: f.anneeMin, anneeMax: f.anneeMax, prixMin: f.prixMin, prixMax: f.prixMax, kmMax: f.kmMax, mots: f.mots, exclure: f.exclure, sousCote: f.sousCote }).toString()}`
    : "/app/alertes";

  return (
    <div className="grid gap-6">
      <form onSubmit={chercher} className="carte grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <ChoixVehicule cat={cat} v={choix} onChange={setChoix} idPrefixe="rm" />
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Énergie</span>
          <select value={f.energie} onChange={maj("energie")} className={inputCls}>
            <option value="">Toutes</option>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
            <option value="gpl">GPL</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Boîte</span>
          <select value={f.boite} onChange={maj("boite")} className={inputCls}>
            <option value="">Toutes</option>
            <option value="manuelle">Manuelle</option>
            <option value="auto">Automatique</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Vendeur</span>
          <select value={f.vendeur} onChange={maj("vendeur")} className={inputCls}>
            <option value="">Tous</option>
            <option value="particulier">Particuliers</option>
            <option value="pro">Professionnels</option>
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Année min.</span>
            <input inputMode="numeric" value={f.anneeMin} onChange={maj("anneeMin")} placeholder="2010" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Année max.</span>
            <input inputMode="numeric" value={f.anneeMax} onChange={maj("anneeMax")} placeholder="2016" className={inputCls} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Prix min. (€)</span>
            <input inputMode="numeric" value={f.prixMin} onChange={maj("prixMin")} className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Prix max. (€)</span>
            <input inputMode="numeric" value={f.prixMax} onChange={maj("prixMax")} className={inputCls} />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Kilométrage max.</span>
          <input inputMode="numeric" value={f.kmMax} onChange={maj("kmMax")} placeholder="150000" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Moteur, finition, mots-clés</span>
          <input value={f.mots} onChange={maj("mots")} placeholder="ex. 1.2 tce, intens" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Exclure les mots</span>
          <input value={f.exclure} onChange={maj("exclure")} placeholder="ex. société, utilitaire" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Sous la cote d&apos;au moins (%)</span>
          <input inputMode="numeric" value={f.sousCote} onChange={maj("sousCote")} placeholder="ex. 10" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Trier par</span>
          <select value={f.tri} onChange={maj("tri")} className={inputCls}>
            <option value="ecart">Les plus sous la cote</option>
            <option value="prix">Prix croissant</option>
            <option value="km">Kilométrage croissant</option>
            <option value="annee">Les plus récentes</option>
            <option value="recent">Vues en dernier</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-ink-2">
          <input type="checkbox" checked={f.fiables} onChange={maj("fiables")} className="size-4 accent-[#ff5a1f]" /> Masquer les pièges (pour pièces, moteur HS, prix suspects…)
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={charge} className="btn btn-o btn-sm">
            {charge ? "Recherche…" : "Rechercher"}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => { setChoix({ marque: "", modele: "", gen: "" }); setF(VIDE); setRes(null); }}>
            Effacer
          </button>
          {alertes && choix.modele && (
            <Link href={alerteHref} className="btn btn-sm">
              Créer une alerte e-mail avec ces critères
            </Link>
          )}
          <p className="text-sm text-ink-3" role="status">{etat}</p>
        </div>
      </form>

      {res && (
        <section aria-labelledby="rm-res" className="grid gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="rm-res" className="font-display text-xl font-semibold">
              {res.trouvees} annonce{res.trouvees > 1 ? "s" : ""} · {res.modele.nom}
            </h2>
            <p className="text-sm text-ink-3">
              {res.total} annonces de ce modèle en base · {res.sousLaCote} à 5 % ou plus sous la cote
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {res.modele.gens.filter((g) => g.n).map((g) => (
              <button key={g.id} type="button" onClick={() => { setChoix((c) => ({ ...c, gen: c.gen === g.id ? "" : g.id })); }}
                className={cx("rounded-full border px-3 py-1", choix.gen === g.id ? "border-o/60 bg-o/12 text-ink" : "border-line-2 text-ink-2")}>
                {g.label} <span className="num text-ink-3">{g.n}</span>
              </button>
            ))}
            {res.modele.incertaines > 0 && <span className="rounded-full border border-line px-3 py-1 text-ink-3">génération incertaine {res.modele.incertaines}</span>}
          </div>
          {res.annonces.length ? (
            <ul className="grid gap-3">
              {res.annonces.map((a) => <LigneAnnonce key={a.id} a={a} />)}
            </ul>
          ) : (
            <p className="carte p-6 text-ink-2">Aucune annonce ne correspond. Élargissez les années, le prix ou le kilométrage.</p>
          )}
          {res.trouvees > res.annonces.length && <p className="text-sm text-ink-3">Les 300 premières sont affichées : affinez les filtres pour voir les autres.</p>}
          <p className="text-xs text-ink-3">
            Cote : régression de l&apos;outil Garage sur les annonces de la même génération et de la même énergie (âge, kilométrage, boîte, version, puissance, équipements), annonces aberrantes écartées. Ce sont des prix demandés, pas des prix de vente.
          </p>
        </section>
      )}
    </div>
  );
}

function LigneAnnonce({ a }: { a: Annonce }) {
  const c = a.cote;
  const bon = c?.pct != null && c.pct >= 0.05, cher = c?.pct != null && c.pct <= -0.05;
  return (
    <li className="carte grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">{a.titre || "Annonce"}</p>
        <p className="mt-0.5 text-sm text-ink-3">
          {[a.annee, a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null, a.energie, a.boite, a.genLabel].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs text-ink-3">
          {[a.lieu, a.pro ? "professionnel" : "particulier", a.vu ? `vue le ${new Date(a.vu).toLocaleDateString("fr-FR")}` : null].filter(Boolean).join(" · ")}
          {a.piege && <span className="ml-2 text-bad">{a.suspect ? "prix suspect (pièces, location, acompte ?)" : "piège possible"}</span>}
        </p>
      </div>
      <div className="flex items-baseline gap-4 sm:block sm:text-right">
        <p className="num font-display text-xl font-semibold">{eur(a.prix)}</p>
        <p className="text-xs text-ink-3">{c ? `cote ${eur(c.P)}` : "pas de cote"}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:block sm:min-w-36 sm:text-right">
        {c && c.ecart != null ? (
          <div>
            <p className={cx("num font-semibold", bon ? "text-ok" : cher ? "text-bad" : "text-ink-2")}>
              {c.ecart >= 0 ? `${eur(c.ecart)} sous` : `${eur(-c.ecart)} au-dessus`}
            </p>
            <p className="text-xs text-ink-3">
              {Math.round(Math.abs(c.pct ?? 0) * 100)} % · confiance {c.conf}
              {c.moinsCherQue != null ? ` · moins chère que ${c.moinsCherQue} %` : ""}
            </p>
          </div>
        ) : (
          <p className="text-xs text-ink-3">{a.gen ? "pas assez de comparables" : "génération incertaine"}</p>
        )}
        {a.url && (
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-2">
            Ouvrir
          </a>
        )}
      </div>
    </li>
  );
}
