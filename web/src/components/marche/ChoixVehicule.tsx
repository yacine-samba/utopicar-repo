"use client";
import { inputCls } from "@/lib/cx";
import type { CatMarque } from "@/lib/vehicules/types";

export type Choix = { marque: string; modele: string; gen: string };

/** Marque → modèle → génération, comme le sélecteur de l'outil Garage. */
export function ChoixVehicule({ cat, v, onChange, genOptionnelle = true, idPrefixe = "cv" }: { cat: CatMarque[]; v: Choix; onChange: (v: Choix) => void; genOptionnelle?: boolean; idPrefixe?: string }) {
  const marque = cat.find((b) => b.k === v.marque);
  const modele = marque?.m.find((m) => m.k === v.modele);
  return (
    <>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Marque</span>
        <select id={`${idPrefixe}-marque`} value={v.marque} onChange={(e) => onChange({ marque: e.target.value, modele: "", gen: "" })} className={inputCls}>
          <option value="">Choisir…</option>
          {cat.map((b) => (
            <option key={b.k} value={b.k}>
              {b.n}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Modèle</span>
        <select id={`${idPrefixe}-modele`} value={v.modele} disabled={!marque} onChange={(e) => {
          const m = marque?.m.find((x) => x.k === e.target.value);
          onChange({ ...v, modele: e.target.value, gen: m && m.g.length === 1 ? m.g[0].id : "" });
        }} className={inputCls}>
          <option value="">{marque ? "Choisir…" : "Marque d'abord"}</option>
          {marque?.m.map((m) => (
            <option key={m.k} value={m.k}>
              {m.n}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Génération</span>
        <select id={`${idPrefixe}-gen`} value={v.gen} disabled={!modele} onChange={(e) => onChange({ ...v, gen: e.target.value })} className={inputCls}>
          <option value="">{!modele ? "Modèle d'abord" : genOptionnelle ? "Toutes" : "Choisir…"}</option>
          {modele?.g.map((g) => (
            <option key={g.id} value={g.id}>
              {g.l} ({g.y0} – {g.y1})
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
