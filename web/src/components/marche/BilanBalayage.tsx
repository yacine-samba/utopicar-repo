"use client";
import { useState } from "react";
import { cx, inputCls } from "@/lib/cx";

/* Bilan du relevé automatique des cotes (extension « Relever toutes les cotes ») : chaque modèle, en essence, diesel
   et hybride, avec la cote de référence de chaque génération et les annonces relevées sous leur cote. */

type AnnonceSous = { id: string; titre: string; prix: number; annee: number | null; km: number | null; ch: number | null; pro: boolean; lieu: string | null; url: string | null; P: number; lo: number | null; hi: number | null; ecart: number | null; pct: number; conf: string };
type GenBal = {
  gen: string; label: string; y0: number; y1: number; nReleve: number; nBase: number; nCote: number; cote: boolean;
  ref: { annee: number; km: number; P: number; lo: number | null; hi: number | null; parKm: number | null; parAn: number | null } | null;
  nCotees: number; nSous: number; top: AnnonceSous[];
};
type Etape = { base: string; nom: string; energie: string; recues: number; gardees: number; ecartees?: number; incertaines?: number; total?: number | null; gens: GenBal[]; erreur?: string };
export type Bilan = { v: number; debut: number; fin: number | null; pages: number; marques: string[] | null; etapes: number; faites: number; resultats: Etape[] };

const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const nb = (v: number) => v.toLocaleString("fr-FR");
const MAX_LIGNES = 300;

/** Bilan lu dans l'envoi de l'extension (« UTPBALAYAGE{…} ») ; null s'il est illisible. */
export function lireBilan(brut: string): Bilan | null {
  try {
    const o = JSON.parse(brut.trim().slice("UTPBALAYAGE".length)) as Bilan;
    return Array.isArray(o?.resultats) ? o : null;
  } catch {
    return null;
  }
}

export function BilanBalayage({ bilan }: { bilan: Bilan }) {
  const [filtre, setFiltre] = useState("");
  const [energie, setEnergie] = useState("");
  const [cotees, setCotees] = useState(false);
  const res = bilan.resultats;
  const annonces = res.reduce((s, x) => s + (x.gardees || 0), 0);
  const gens = res.flatMap((x) => x.gens.map((g) => ({ ...g, nom: x.nom, energie: x.energie })));
  const nCotees = gens.filter((g) => g.cote).length;
  const sous = gens.flatMap((g) => g.top.map((a) => ({ ...a, nom: g.nom, energie: g.energie, label: g.label }))).sort((a, b) => b.pct - a.pct);
  const nSous = gens.reduce((s, g) => s + g.nSous, 0);
  const erreurs = res.filter((x) => x.erreur);
  const q = filtre.trim().toLowerCase();
  const lignes = gens.filter((g) => (!q || `${g.nom} ${g.label}`.toLowerCase().includes(q)) && (!energie || g.energie === energie) && (!cotees || g.cote));
  const duree = bilan.fin ? Math.round((bilan.fin - bilan.debut) / 60000) : null;

  return (
    <section aria-labelledby="bal-titre" className="grid gap-5">
      <div className="grid gap-1">
        <h2 id="bal-titre" className="font-display text-xl font-semibold">Relevé automatique des cotes</h2>
        <p className="text-sm text-ink-2">
          {bilan.faites < bilan.etapes ? `En cours ou en pause : ${nb(bilan.faites)} recherches sur ${nb(bilan.etapes)}.` : `Terminé : ${nb(bilan.etapes)} recherches${duree != null ? ` en ${duree < 90 ? `${duree} min` : `${Math.round(duree / 6) / 10} h`}` : ""}.`}{" "}
          Chaque modèle en essence, diesel puis hybride, {bilan.pages >= 100 ? "toutes les annonces" : `jusqu'à ${nb(bilan.pages * 35)} annonces`} par recherche ; les annonces relevées ont rejoint la base du marché.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Chiffre l="Recherches" v={`${nb(bilan.faites)} / ${nb(bilan.etapes)}`} s={erreurs.length ? `${erreurs.length} non enregistrée${erreurs.length > 1 ? "s" : ""}` : "marque × modèle × énergie"} />
        <Chiffre l="Annonces relevées" v={nb(annonces)} s="ajoutées à la base du marché" />
        <Chiffre l="Générations cotées" v={nb(nCotees)} s={`sur ${nb(gens.length)} rencontrées`} />
        <Chiffre l="Sous la cote (5 % et +)" v={nb(nSous)} s="parmi les annonces relevées" bon={nSous > 0} />
      </div>

      {sous.length > 0 && (
        <div className="grid gap-2">
          <h3 className="font-display font-semibold">Les plus sous la cote</h3>
          <ul className="grid gap-2">
            {sous.slice(0, 30).map((a) => (
              <li key={`${a.id}-${a.energie}`} className="carte grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{a.titre || "Annonce"}</a> : a.titre}
                  </p>
                  <p className="text-xs text-ink-3">{[`${a.nom} ${a.label}`, a.energie, a.annee, a.km != null ? `${nb(a.km)} km` : null, a.ch ? `${a.ch} ch` : null, a.lieu, a.pro ? "pro" : "particulier"].filter(Boolean).join(" · ")}</p>
                </div>
                <p className="num text-sm sm:text-right">
                  <b className="font-display text-lg">{eur(a.prix)}</b>
                  <span className="block text-xs text-ink-3">cote {eur(a.P)}</span>
                </p>
                <p className="num text-sm sm:min-w-32 sm:text-right">
                  <b className="text-ok">{eur(a.ecart)} sous</b>
                  <span className="block text-xs text-ink-3">{Math.round(a.pct * 100)} % · confiance {a.conf}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3">
        <h3 className="font-display font-semibold">Cotes par modèle, énergie et génération</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Modèle</span>
            <input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="ex. Audi A1, Clio" className={cx(inputCls, "w-56")} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Énergie</span>
            <select value={energie} onChange={(e) => setEnergie(e.target.value)} className={inputCls}>
              <option value="">Toutes</option>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="hybride">Hybride</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink-2">
            <input type="checkbox" checked={cotees} onChange={(e) => setCotees(e.target.checked)} className="size-4 accent-[#ff5a1f]" /> Cotées seulement
          </label>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                {["Modèle", "Énergie", "Génération", "Relevées", "En base", "Cote de référence", "Sous la cote"].map((t) => (
                  <th key={t} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.slice(0, MAX_LIGNES).map((g) => (
                <tr key={`${g.nom}|${g.energie}|${g.gen}`} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-3 py-2">{g.nom}</td>
                  <td className="px-3 py-2">{g.energie}</td>
                  <td className="whitespace-nowrap px-3 py-2">{g.label} <span className="text-ink-3">({g.y0} – {g.y1})</span></td>
                  <td className="num px-3 py-2">{nb(g.nReleve)}</td>
                  <td className="num px-3 py-2">{nb(g.nBase)}</td>
                  <td className="num whitespace-nowrap px-3 py-2">
                    {g.ref ? (
                      <>
                        <b>{eur(g.ref.P)}</b>
                        <span className="block text-xs text-ink-3">{g.ref.annee} · {nb(g.ref.km)} km{g.ref.parKm ? ` · ${eur(g.ref.parKm)} / 10 000 km` : ""}</span>
                      </>
                    ) : (
                      <span className="text-xs text-ink-3">{g.cote ? "—" : `pas de cote (${nb(g.nBase)} / 20 annonces)`}</span>
                    )}
                  </td>
                  <td className={cx("num px-3 py-2", g.nSous > 0 && "text-ok")}>{g.cote ? `${nb(g.nSous)} / ${nb(g.nCotees)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3">
          {lignes.length > MAX_LIGNES ? `${nb(MAX_LIGNES)} lignes affichées sur ${nb(lignes.length)} : affinez avec le modèle ou l'énergie. ` : ""}
          Cote de référence : la voiture médiane de la génération (année et kilométrage), calculée sur les annonces de la base de cette énergie.
        </p>
      </div>

      {erreurs.length > 0 && (
        <details className="carte p-4 text-sm">
          <summary className="cursor-pointer text-ink-2">{erreurs.length} recherche{erreurs.length > 1 ? "s" : ""} non enregistrée{erreurs.length > 1 ? "s" : ""}</summary>
          <ul className="mt-3 grid gap-1 text-ink-3">
            {erreurs.map((x) => (
              <li key={`${x.base}|${x.energie}`}>{x.nom} {x.energie} : {x.erreur}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function Chiffre({ l, v, s, bon }: { l: string; v: string; s?: string; bon?: boolean }) {
  return (
    <div className="carte p-4">
      <p className="text-xs text-ink-3">{l}</p>
      <p className={cx("num mt-1 font-display text-2xl font-semibold", bon && "text-ok")}>{v}</p>
      {s && <p className="text-xs text-ink-3">{s}</p>}
    </div>
  );
}
