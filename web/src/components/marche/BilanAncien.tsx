"use client";
import { useState } from "react";
import { cx, inputCls } from "@/lib/cx";

/* Bilan du relevé automatique des cotes au format de l'extension 4.5 (« UTPBALAYAGE » v1) : chaque recherche avec ses
   résultats et ce qui a été enregistré dans la base du marché, la cote de chaque génération lue au moment du relevé, et
   les annonces les plus sous la cote. Les recherches refusées à l'envoi (« Lot invalide ») sont signalées avec leur total. */

export type RechercheAncienne = {
  base: string; nom: string; energie: string; recues: number; total: number | null; gardees: number;
  enregistrees?: number; ecartees?: number; erreur?: string;
  gens: GenAncienne[];
};
export type GenAncienne = {
  gen: string; label: string; nReleve: number; nBase: number; nCote: number; cote: boolean; nCotees: number; nSous: number;
  ref: { annee: number; km: number; P: number; lo: number | null; hi: number | null; parKm: number | null; parAn: number | null } | null;
  top: AnnonceAncienne[];
};
export type AnnonceAncienne = {
  id: string; titre: string; prix: number; annee: number | null; km: number | null; ch: number | null; pro: boolean; lieu: string | null; url: string | null;
  P: number; ecart: number | null; pct: number; conf: string;
};
export type BilanAncien = { v: 1; debut: number; fin: number | null; pages: number; marques: string[]; etapes: number; faites: number; resultats: RechercheAncienne[] };

const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const nb = (v: number) => v.toLocaleString("fr-FR");
const NOM_EN: Record<string, string> = { essence: "essence", diesel: "diesel", hybride: "hybride", electrique: "électrique" };
const MAX_LIGNES = 300;

export function BilanAncienView({ bilan }: { bilan: BilanAncien }) {
  const [filtre, setFiltre] = useState("");
  const [energie, setEnergie] = useState("");
  const [echecs, setEchecs] = useState(false);
  const res = bilan.resultats;
  const ratees = res.filter((r) => r.erreur);
  const ok = res.filter((r) => !r.erreur);
  const q = filtre.trim().toLowerCase();
  const lignes = res.filter((r) => (!q || `${r.nom} ${r.base}`.toLowerCase().includes(q)) && (!energie || r.energie === energie) && (!echecs || !!r.erreur));
  const gens = res.flatMap((r) => r.gens.map((g) => ({ ...g, nom: r.nom, energie: r.energie })));
  const sous = gens.flatMap((g) => g.top.map((a) => ({ ...a, nom: g.nom, energie: g.energie, label: g.label }))).sort((a, b) => b.pct - a.pct);
  const enregistrees = ok.reduce((s, r) => s + (r.enregistrees ?? r.gardees), 0);
  const coupees = res.filter((r) => (r.total ?? 0) > 3500).length;
  const duree = bilan.fin ? Math.round((bilan.fin - bilan.debut) / 60000) : null;

  return (
    <section aria-labelledby="bal-ancien" className="grid gap-5">
      <div className="grid gap-1">
        <h2 id="bal-ancien" className="font-display text-xl font-semibold">Relevé automatique des cotes</h2>
        <p className="text-sm text-ink-2">
          Relevé avec l&apos;extension 4.5 : {nb(bilan.faites)} recherches sur {nb(bilan.etapes)}{duree != null ? `, en ${duree < 90 ? `${duree} min` : `${Math.round(duree / 6) / 10} h`}` : ""}, {bilan.marques.length} marques.
          Les annonces enregistrées sont dans la base du marché ; les cotes ci-dessous sont celles calculées au moment du relevé.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Chiffre l="Annonces enregistrées" v={nb(enregistrees)} s="dans la base du marché" bon />
        <Chiffre l="Recherches enregistrées" v={nb(ok.length)} s={`sur ${nb(res.length)}`} />
        <Chiffre l="Recherches refusées" v={nb(ratees.length)} s={ratees.length ? `${nb(ratees.reduce((s, r) => s + r.recues, 0))} annonces à relancer` : "aucune"} alerte={ratees.length > 0} />
        <Chiffre l="Coupées à 100 pages" v={nb(coupees)} s="plus de 3 500 résultats" />
      </div>

      {ratees.length > 0 && (
        <div className="carte grid gap-2 p-4 text-sm">
          <h3 className="font-display font-semibold">Recherches refusées</h3>
          <p className="text-ink-3">
            L&apos;envoi de ces recherches a été refusé (« Lot invalide ») : le site venait de changer de format d&apos;envoi pendant le relevé. Leurs annonces ne sont pas dans la base ; relancez le relevé avec l&apos;extension à jour (4.6) pour les obtenir.
          </p>
          <details>
            <summary className="cursor-pointer text-ink-2">Voir les {nb(ratees.length)} recherches refusées</summary>
            <ul className="mt-2 grid gap-1 text-ink-2 sm:grid-cols-2">
              {ratees.map((r) => (
                <li key={`${r.base}|${r.energie}`}>{r.nom} {NOM_EN[r.energie] ?? r.energie} : {nb(r.recues)} annonces</li>
              ))}
            </ul>
          </details>
        </div>
      )}

      {sous.length > 0 && (
        <div className="grid gap-2">
          <h3 className="font-display font-semibold">Les plus sous la cote</h3>
          <ul className="grid gap-2">
            {sous.slice(0, 30).map((a) => (
              <li key={`${a.id}-${a.energie}`} className="carte grid gap-1 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{a.titre || "Annonce"}</a> : a.titre}
                  </p>
                  <p className="text-xs text-ink-3">{[`${a.nom} ${a.label}`, NOM_EN[a.energie] ?? a.energie, a.annee, a.km != null ? `${nb(a.km)} km` : null, a.ch ? `${a.ch} ch` : null, a.lieu, a.pro ? "pro" : "particulier"].filter(Boolean).join(" · ")}</p>
                </div>
                <p className="num text-sm sm:text-right"><b className="font-display text-lg">{eur(a.prix)}</b><span className="block text-xs text-ink-3">cote {eur(a.P)}</span></p>
                <p className="num text-sm sm:min-w-32 sm:text-right"><b className="text-ok">{eur(a.ecart)} sous</b><span className="block text-xs text-ink-3">{Math.round(a.pct * 100)} % · confiance {a.conf}</span></p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3">
        <h3 className="font-display font-semibold">Recherches</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Modèle</span>
            <input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="ex. Clio, Audi A1" className={cx(inputCls, "w-56")} />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Énergie</span>
            <select value={energie} onChange={(e) => setEnergie(e.target.value)} className={inputCls}>
              <option value="">Toutes</option>
              {Object.entries(NOM_EN).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-ink-2">
            <input type="checkbox" checked={echecs} onChange={(e) => setEchecs(e.target.checked)} className="size-4 accent-o" /> Refusées seulement
          </label>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                {["Modèle", "Énergie", "Résultats", "Relevées", "Enregistrées", "Statut"].map((t) => (
                  <th key={t} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.slice(0, MAX_LIGNES).map((r) => (
                <tr key={`${r.base}|${r.energie}`} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-3 py-2">{r.nom}</td>
                  <td className="px-3 py-2">{NOM_EN[r.energie] ?? r.energie}</td>
                  <td className="num px-3 py-2">{r.total != null ? nb(r.total) : "—"}</td>
                  <td className="num px-3 py-2">{nb(r.recues)}</td>
                  <td className="num px-3 py-2">{nb(r.enregistrees ?? r.gardees)}</td>
                  <td className={cx("px-3 py-2", r.erreur ? "text-bad" : (r.total ?? 0) > 3500 ? "text-warn" : "")}>
                    {r.erreur ? "refusée à l'envoi" : (r.total ?? 0) > 3500 ? "coupée à 100 pages" : "enregistrée"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lignes.length > MAX_LIGNES && <p className="text-xs text-ink-3">{nb(MAX_LIGNES)} lignes affichées sur {nb(lignes.length)} : affinez avec le modèle ou l&apos;énergie.</p>}
      </div>

      {gens.length > 0 && (
        <div className="grid gap-3">
          <h3 className="font-display font-semibold">Cotes par génération</h3>
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
                {gens.filter((g) => !q || `${g.nom} ${g.label}`.toLowerCase().includes(q)).filter((g) => !energie || g.energie === energie).slice(0, MAX_LIGNES).map((g) => (
                  <tr key={`${g.nom}|${g.energie}|${g.gen}`} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-3 py-2">{g.nom}</td>
                    <td className="px-3 py-2">{NOM_EN[g.energie] ?? g.energie}</td>
                    <td className="whitespace-nowrap px-3 py-2">{g.label}</td>
                    <td className="num px-3 py-2">{nb(g.nReleve)}</td>
                    <td className="num px-3 py-2">{nb(g.nBase)}</td>
                    <td className="num whitespace-nowrap px-3 py-2">
                      {g.ref ? <><b>{eur(g.ref.P)}</b><span className="block text-xs text-ink-3">{g.ref.annee} · {nb(g.ref.km)} km</span></> : <span className="text-xs text-ink-3">{g.cote ? "—" : `pas de cote (${nb(g.nBase)} / 20)`}</span>}
                    </td>
                    <td className={cx("num px-3 py-2", g.nSous > 0 && "text-ok")}>{g.cote ? `${nb(g.nSous)} / ${nb(g.nCotees)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Chiffre({ l, v, s, bon, alerte }: { l: string; v: string; s?: string; bon?: boolean; alerte?: boolean }) {
  return (
    <div className="carte p-4">
      <p className="text-xs text-ink-3">{l}</p>
      <p className={cx("num mt-1 font-display text-2xl font-semibold", bon && "text-ok", alerte && "text-bad")}>{v}</p>
      {s && <p className="text-xs text-ink-3">{s}</p>}
    </div>
  );
}
