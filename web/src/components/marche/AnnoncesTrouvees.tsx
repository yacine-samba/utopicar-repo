"use client";
import { useMemo, useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx, inputCls } from "@/lib/cx";
import { BoutonFavori } from "../espace/BoutonFavori";
import { BoutonAnalyserAnnonce } from "../espace/BoutonAnalyserAnnonce";
import type { NomsCatalogue } from "./DernieresRecherches";

export type AnnonceTrouvee = {
  cle: string; titre: string; prix: number | null; annee: number | null; km: number | null; ch: number | null; energie: string | null; boite: string | null;
  moteur: string | null; version: string | null; lieu: string | null; url: string | null; marque: string; modele: string; gen: string | null; gen_label: string | null;
  pro: boolean | null; cote: { P: number | null; ecart: number | null; pct: number | null } | null; recherche: string | null; premiere_le: string; derniere_le: string;
  photo?: string | null;
};

const TRIS = { recentes: "Vues en dernier", affaires: "Les plus sous la cote", prix: "Prix croissant", km: "Kilométrage croissant", anciennes: "Trouvées en premier" } as const;
type Tri = keyof typeof TRIS;
const PAGE = 50;
const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const jour = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** Toutes les annonces remontées par ses recherches : gardées même si la recherche est supprimée, et toujours comptées dans la cote. */
export function AnnoncesTrouvees({ annonces, noms, favoris }: { annonces: AnnonceTrouvee[]; noms: NomsCatalogue; favoris: string[] }) {
  const [liste, setListe] = useState(annonces);
  const [favs] = useState(() => new Set(favoris));
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [gen, setGen] = useState("");
  const [q, setQ] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [tri, setTri] = useState<Tri>("recentes");
  const [vus, setVus] = useState(PAGE);

  const options = useMemo(() => {
    const marques = [...new Set(liste.map((a) => a.marque))].sort((a, b) => (noms.marques[a] ?? a).localeCompare(noms.marques[b] ?? b, "fr"));
    const modeles = [...new Set(liste.filter((a) => !marque || a.marque === marque).map((a) => `${a.marque} ${a.modele}`))].sort((a, b) => (noms.modeles[a] ?? a).localeCompare(noms.modeles[b] ?? b, "fr", { numeric: true }));
    const gens = [...new Set(liste.filter((a) => a.gen && (!marque || a.marque === marque) && (!modele || `${a.marque} ${a.modele}` === modele)).map((a) => `${a.marque} ${a.modele} ${a.gen}`))];
    return { marques, modeles, gens };
  }, [liste, marque, modele, noms]);

  const vues = useMemo(() => {
    const mots = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const pm = Number(prixMax.replace(/\s/g, "")) || 0;
    const L = liste.filter((a) =>
      (!marque || a.marque === marque) && (!modele || `${a.marque} ${a.modele}` === modele) && (!gen || `${a.marque} ${a.modele} ${a.gen}` === gen)
      && (!pm || (a.prix ?? 0) <= pm) && mots.every((w) => `${a.titre} ${a.moteur ?? ""} ${a.lieu ?? ""}`.toLowerCase().includes(w)),
    );
    return L.sort(
      tri === "affaires" ? (a, b) => (b.cote?.pct ?? -9) - (a.cote?.pct ?? -9)
      : tri === "prix" ? (a, b) => (a.prix ?? 1e9) - (b.prix ?? 1e9)
      : tri === "km" ? (a, b) => (a.km ?? 1e9) - (b.km ?? 1e9)
      : tri === "anciennes" ? (a, b) => a.premiere_le.localeCompare(b.premiere_le)
      : (a, b) => b.derniere_le.localeCompare(a.derniere_le),
    );
  }, [liste, marque, modele, gen, q, prixMax, tri]);

  async function retirer(a: AnnonceTrouvee) {
    const { error } = await supabaseNavigateur().from("annonces_trouvees").delete().eq("cle", a.cle);
    if (!error) setListe((l) => l.filter((x) => x.cle !== a.cle));
  }

  const raz = () => setVus(PAGE);
  return (
    <section aria-labelledby="at-t" className="grid gap-4">
      <div>
        <h2 id="at-t" className="font-display text-xl font-semibold">Annonces trouvées</h2>
        <p className="text-sm text-ink-3">
          Toutes les annonces remontées par vos recherches, gardées même si vous supprimez la recherche. Elles restent dans la base du marché et comptent dans la cote.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Marque</span>
          <select value={marque} onChange={(e) => { setMarque(e.target.value); setModele(""); setGen(""); raz(); }} className={inputCls}>
            <option value="">Toutes</option>
            {options.marques.map((k) => <option key={k} value={k}>{noms.marques[k] ?? k}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Modèle</span>
          <select value={modele} onChange={(e) => { setModele(e.target.value); setGen(""); raz(); }} className={inputCls}>
            <option value="">Tous</option>
            {options.modeles.map((k) => <option key={k} value={k}>{noms.modeles[k] ?? k}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Génération</span>
          <select value={gen} onChange={(e) => { setGen(e.target.value); raz(); }} className={inputCls}>
            <option value="">Toutes</option>
            {options.gens.map((k) => <option key={k} value={k}>{noms.gens[k] ?? k.split(" ").pop()!.toUpperCase()}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Prix max. (€)</span>
          <input inputMode="numeric" value={prixMax} onChange={(e) => { setPrixMax(e.target.value); raz(); }} className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Mots</span>
          <input value={q} onChange={(e) => { setQ(e.target.value); raz(); }} placeholder="ex. 320i, Lyon" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink-2">Trier par</span>
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)} className={inputCls}>
            {Object.entries(TRIS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm text-ink-3" role="status">{vues.length} annonce{vues.length > 1 ? "s" : ""}{vues.length !== liste.length ? ` sur ${liste.length}` : ""}</p>
      {vues.length ? (
        <ul className="grid gap-2">
          {vues.slice(0, vus).map((a) => {
            const c = a.cote;
            const bon = c?.pct != null && c.pct >= 0.05, cher = c?.pct != null && c.pct <= -0.05;
            return (
              <li key={a.cle} className="carte grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center">
                {a.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vignette servie par Leboncoin
                  <img src={a.photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-28 w-40 rounded-xl border border-line object-cover max-sm:h-44 max-sm:w-full" />
                ) : (
                  <span className="hidden h-28 w-40 place-items-center rounded-xl border border-dashed border-line-2 text-xs text-ink-3 sm:grid">Sans photo</span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.titre}</p>
                  <p className="mt-0.5 text-sm text-ink-3">
                    {[a.annee, a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null, a.moteur, a.ch ? `${a.ch} ch` : null, a.energie, a.boite, a.version ?? a.gen_label].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-xs text-ink-3" suppressHydrationWarning>
                    {[a.lieu, a.pro ? "professionnel" : a.pro === false ? "particulier" : null, `trouvée le ${jour(a.premiere_le)}`, a.recherche ? `par « ${a.recherche} »` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-baseline gap-4 sm:block sm:text-right">
                  <p className="num font-display text-xl font-semibold">{eur(a.prix)}</p>
                  <p className="text-xs text-ink-3">{c?.P ? `cote ${eur(c.P)}` : "pas de cote"}</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block sm:min-w-36 sm:text-right">
                  {c?.ecart != null ? (
                    <p className={cx("num text-sm font-semibold", bon ? "text-ok" : cher ? "text-bad" : "text-ink-2")}>
                      {c.ecart >= 0 ? `${eur(c.ecart)} sous` : `${eur(-c.ecart)} au-dessus`} <span className="font-normal text-ink-3">({Math.round(Math.abs(c.pct ?? 0) * 100)} %)</span>
                    </p>
                  ) : <span />}
                  <div className="mt-2 flex items-center gap-2 sm:justify-end">
                    <BoutonFavori
                      compact
                      initial={favs.has(a.cle)}
                      onChange={(on) => (on ? favs.add(a.cle) : favs.delete(a.cle))}
                      f={{ cle: a.cle, titre: a.titre, prix: a.prix, annee: a.annee, km: a.km, energie: a.energie, boite: a.boite, lieu: a.lieu, url: a.url, photo: a.photo ?? null, source: "recherche", cote: c ?? null }}
                    />
                    <BoutonAnalyserAnnonce url={a.url} />
                    {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">Ouvrir</a>}
                    <button type="button" onClick={() => retirer(a)} className="grid size-9 place-items-center rounded-full border border-line-2 text-ink-3 hover:text-ink" aria-label={`Retirer ${a.titre} de la liste (elle reste dans la cote)`} title="Retirer de la liste (reste dans la cote)">
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="carte p-5 text-ink-2">{liste.length ? "Aucune annonce ne correspond à ces filtres." : "Aucune annonce pour l'instant : elles s'ajoutent ici à chaque recherche."}</p>
      )}
      {vues.length > vus && (
        <button type="button" onClick={() => setVus((v) => v + PAGE)} className="btn btn-sm justify-self-center">
          Voir {Math.min(PAGE, vues.length - vus)} de plus
        </button>
      )}
    </section>
  );
}
