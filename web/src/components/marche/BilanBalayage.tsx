"use client";
import { useState } from "react";
import { cx, inputCls } from "@/lib/cx";
import type { CatMarque } from "@/lib/vehicules/types";
import type { BilanAncien } from "./BilanAncien";

/* Bilan du relevé automatique des cotes (extension « Relever toutes les cotes ») : toutes les marques et tous les modèles
   de Leboncoin, en essence, diesel, hybride et électrique. Chaque recherche avec son nombre de résultats ; celles que
   Leboncoin coupe à 100 pages (3 500 annonces) sont signalées avec leur total. Puis, pour les modèles du catalogue,
   la cote de chaque génération recalculée avec les annonces du relevé. */

export type LigneReleve = {
  mq: string; mql: string; md: string; mdl: string; en: string; total: number; lus: number; complet: boolean;
  /** ligne d'une marque ou d'un modèle entier (sinon : un modèle dans une énergie) */
  niveau?: "marque" | "modele"; decoupee?: boolean; raison?: string;
};
export type Bilan = {
  v: 2; id: string; debut: number; fin: number | null; grand: number; source: string; filtre: string[] | null;
  marques: number; recherches: number; lues: number; coupees: number; termine: boolean; lignes: LigneReleve[];
};
type AnnonceSous = { id: string; titre: string; prix: number; annee: number | null; km: number | null; ch: number | null; pro: boolean; lieu: string | null; url: string | null; P: number; ecart: number | null; pct: number; conf: string };
type GenCote = {
  gen: string; label: string; y0: number; y1: number; nReleve: number; nBase: number; cote: boolean;
  ref: { annee: number; km: number; P: number; lo: number | null; hi: number | null; parKm: number | null } | null;
  nCotees: number; nSous: number; top: AnnonceSous[];
};
type CoteModele = { base: string; nom: string; energie: string; gens: GenCote[] };

const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const nb = (v: number) => v.toLocaleString("fr-FR");
const NOM_EN: Record<string, string> = { essence: "essence", diesel: "diesel", hybride: "hybride", electrique: "électrique" };
const MAX_LIGNES = 300;
const date = (t: number) => new Date(t).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

/** Bilan lu dans l'envoi de l'extension (« UTPBALAYAGE{…} ») : format 2 (4.6) ou 1 (4.5) ; null s'il est illisible. */
export function lireBilan(brut: string): Bilan | BilanAncien | null {
  try {
    const o = JSON.parse(brut.trim().slice("UTPBALAYAGE".length)) as Bilan | BilanAncien;
    if (o?.v === 2 && Array.isArray((o as Bilan).lignes)) return o as Bilan;
    if (o?.v === 1 && Array.isArray((o as BilanAncien).resultats)) return o as BilanAncien;
    return null;
  } catch {
    return null;
  }
}
export const estAncien = (b: Bilan | BilanAncien): b is BilanAncien => "resultats" in b;

export function BilanBalayage({ bilan, cat }: { bilan: Bilan; cat: CatMarque[] }) {
  const [filtre, setFiltre] = useState("");
  const [energie, setEnergie] = useState("");
  const [incomplets, setIncomplets] = useState(false);
  const releves = bilan.lignes.filter((l) => l.en);
  const marques = bilan.lignes.filter((l) => l.niveau === "marque");
  const coupees = releves.filter((l) => !l.complet);
  const q = filtre.trim().toLowerCase();
  const lignes = releves.filter((l) => (!q || `${l.mql} ${l.mdl}`.toLowerCase().includes(q)) && (!energie || l.en === energie) && (!incomplets || !l.complet));
  const duree = bilan.fin ? Math.round((bilan.fin - bilan.debut) / 60000) : null;

  return (
    <section aria-labelledby="bal-titre" className="grid gap-5">
      <div className="grid gap-1">
        <h2 id="bal-titre" className="font-display text-xl font-semibold">Relevé automatique des cotes</h2>
        <p className="text-sm text-ink-2">
          Commencé le {date(bilan.debut)}{bilan.termine ? `, terminé${duree != null ? ` en ${duree < 90 ? `${duree} min` : `${Math.round(duree / 6) / 10} h`}` : ""}` : ", pas terminé (en pause ou arrêté)"}.{" "}
          {bilan.filtre ? `Marques choisies : ${bilan.filtre.join(", ")}. ` : "Toutes les marques de Leboncoin. "}
          Chaque modèle en essence, diesel, hybride et électrique, annonces de 500 € et plus, 250 000 km au plus.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Chiffre l="Marques relevées" v={nb(bilan.marques)} s={`${nb(bilan.recherches)} recherches`} />
        <Chiffre l="Annonces relevées" v={nb(releves.reduce((s, l) => s + l.lus, 0))} s={bilan.grand ? `sur ${nb(bilan.grand)} sur Leboncoin` : "ajoutées à la base du marché"} />
        <Chiffre l="Modèles × énergies" v={nb(releves.length)} s={`${nb(releves.filter((l) => l.complet).length)} relevés en entier`} />
        <Chiffre l="Coupés à 100 pages" v={nb(coupees.length)} s={coupees.length ? "voir le détail ci-dessous" : "tout a pu être lu"} alerte={coupees.length > 0} />
      </div>

      {coupees.length > 0 && (
        <div className="carte grid gap-2 p-4 text-sm">
          <h3 className="font-display font-semibold">Relevés incomplets</h3>
          <p className="text-ink-3">Leboncoin n&apos;affiche pas plus de 100 pages (3 500 annonces) pour une recherche : la suite n&apos;a pas pu être lue.</p>
          <ul className="grid gap-1 text-ink-2">
            {coupees.map((l) => (
              <li key={`${l.md}|${l.en}`}>
                <b className="text-ink">{l.mql} {l.mdl} {NOM_EN[l.en] ?? l.en}</b> : {nb(l.total)} résultats, {nb(l.lus)} relevés.{" "}
                {l.raison === "erreur" ? "Lecture interrompue par une erreur de Leboncoin." : `Les ${nb(Math.max(0, l.total - l.lus))} autres étaient après la 100ᵉ page.`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Cotes bilan={bilan} cat={cat} releves={releves} />

      <div className="grid gap-3">
        <h3 className="font-display font-semibold">Toutes les recherches</h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Marque ou modèle</span>
            <input value={filtre} onChange={(e) => setFiltre(e.target.value)} placeholder="ex. Renault Clio" className={cx(inputCls, "w-56")} />
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
            <input type="checkbox" checked={incomplets} onChange={(e) => setIncomplets(e.target.checked)} className="size-4 accent-o" /> Incomplets seulement
          </label>
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                {["Marque", "Modèle", "Énergie", "Résultats", "Relevés", "Relevé"].map((t) => (
                  <th key={t} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.slice(0, MAX_LIGNES).map((l, i) => (
                <tr key={`${l.mq}|${l.md}|${l.en}|${i}`} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-3 py-2">{l.mql}</td>
                  <td className="px-3 py-2">{l.mdl}</td>
                  <td className="px-3 py-2">{NOM_EN[l.en] ?? l.en}</td>
                  <td className="num px-3 py-2">{nb(l.total)}</td>
                  <td className="num px-3 py-2">{nb(l.lus)}</td>
                  <td className={cx("px-3 py-2", !l.complet && "text-warn")}>{l.complet ? "en entier" : l.raison === "erreur" ? "interrompu" : "coupé à 100 pages"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lignes.length > MAX_LIGNES && <p className="text-xs text-ink-3">{nb(MAX_LIGNES)} lignes affichées sur {nb(lignes.length)} : affinez avec la marque, le modèle ou l&apos;énergie.</p>}
      </div>

      {marques.length > 0 && (
        <details className="carte p-4 text-sm">
          <summary className="cursor-pointer text-ink-2">Par marque ({nb(marques.length)})</summary>
          <ul className="mt-3 grid gap-1 text-ink-3 sm:grid-cols-2">
            {marques.map((l) => (
              <li key={l.mq}>
                <b className="text-ink-2">{l.mql}</b> : {nb(l.total)} annonces, {l.decoupee ? "découpée par modèle (plus de 100 pages)" : "lue en entier"}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

/** Cotes des modèles du catalogue présents dans le relevé : calculées à la demande, modèle par modèle, énergie par énergie. */
function Cotes({ bilan, cat, releves }: { bilan: Bilan; cat: CatMarque[]; releves: LigneReleve[] }) {
  const [res, setRes] = useState<CoteModele[]>([]);
  const [etat, setEtat] = useState("");
  const [charge, setCharge] = useState(false);
  // modèle Leboncoin (« AUDI_A1 ») → modèle du catalogue (« audi a1 »)
  const parCode = new Map(cat.flatMap((b) => b.m.filter((m) => m.lbc).map((m) => [m.lbc, `${b.k} ${m.k}`] as const)));
  const vus = new Set<string>();
  const travail = releves
    .filter((l) => l.lus > 0 && parCode.has(l.md))
    .map((l) => ({ base: parCode.get(l.md)!, energie: l.en }))
    .filter((x) => !vus.has(`${x.base}|${x.energie}`) && !!vus.add(`${x.base}|${x.energie}`));

  async function calculer() {
    setCharge(true);
    setRes([]);
    const out: CoteModele[] = [];
    try {
      for (let i = 0; i < travail.length; i++) {
        setEtat(`Calcul des cotes : ${i + 1} sur ${travail.length}…`);
        const r = await fetch("/api/marche/balayage/cotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...travail[i], depuis: bilan.debut }) });
        const j = await r.json().catch(() => null);
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) return setEtat(j?.erreur ?? "Calcul refusé.");
          continue;
        }
        out.push(j);
        setRes([...out]);
      }
      setEtat("");
    } finally {
      setCharge(false);
    }
  }

  const gens = res.flatMap((m) => m.gens.map((g) => ({ ...g, nom: m.nom, energie: m.energie })));
  const sous = gens.flatMap((g) => g.top.map((a) => ({ ...a, nom: g.nom, energie: g.energie, label: g.label }))).sort((a, b) => b.pct - a.pct);

  return (
    <div className="carte grid gap-4 p-4 sm:p-5">
      <div className="grid gap-1">
        <h3 className="font-display font-semibold">Cotes recalculées</h3>
        <p className="text-sm text-ink-2">
          {travail.length
            ? `${nb(travail.length)} modèles du catalogue Utopicar (par énergie) sont dans ce relevé : leur cote est recalculée génération par génération avec les annonces relevées, et chaque annonce du relevé est placée sur sa cote. Les autres modèles enrichissent la base du marché.`
            : "Aucun modèle du catalogue Utopicar dans ce relevé : ses annonces enrichissent la base du marché."}
        </p>
      </div>
      {travail.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={charge} onClick={calculer} className="btn btn-o btn-sm">
            {charge ? "Calcul…" : res.length ? "Recalculer les cotes" : "Calculer les cotes"}
          </button>
          <p className="text-sm text-ink-3" role="status">{etat}</p>
        </div>
      )}
      {sous.length > 0 && (
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold">Les plus sous la cote</h4>
          <ul className="grid gap-2">
            {sous.slice(0, 30).map((a) => (
              <li key={`${a.id}-${a.energie}`} className="grid gap-1 rounded-xl border border-line p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">{a.titre || "Annonce"}</a> : a.titre}
                  </p>
                  <p className="text-xs text-ink-3">{[`${a.nom} ${a.label}`, NOM_EN[a.energie], a.annee, a.km != null ? `${nb(a.km)} km` : null, a.ch ? `${a.ch} ch` : null, a.lieu, a.pro ? "pro" : "particulier"].filter(Boolean).join(" · ")}</p>
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
      {gens.length > 0 && (
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
              {gens.map((g) => (
                <tr key={`${g.nom}|${g.energie}|${g.gen}`} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-3 py-2">{g.nom}</td>
                  <td className="px-3 py-2">{NOM_EN[g.energie] ?? g.energie}</td>
                  <td className="whitespace-nowrap px-3 py-2">{g.label} <span className="text-ink-3">({g.y0} – {g.y1})</span></td>
                  <td className="num px-3 py-2">{nb(g.nReleve)}</td>
                  <td className="num px-3 py-2">{nb(g.nBase)}</td>
                  <td className="num whitespace-nowrap px-3 py-2">
                    {g.ref ? (
                      <>
                        <b>{eur(g.ref.P)}</b>
                        <span className="block text-xs text-ink-3">{g.ref.annee} · {nb(g.ref.km)} km</span>
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
      )}
    </div>
  );
}

function Chiffre({ l, v, s, alerte }: { l: string; v: string; s?: string; alerte?: boolean }) {
  return (
    <div className="carte p-4">
      <p className="text-xs text-ink-3">{l}</p>
      <p className={cx("num mt-1 font-display text-2xl font-semibold", alerte && "text-warn")}>{v}</p>
      {s && <p className="text-xs text-ink-3">{s}</p>}
    </div>
  );
}
