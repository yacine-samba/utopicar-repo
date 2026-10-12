"use client";
import { inputCls } from "@/lib/cx";
import { COULEURS, MAX_ANNONCES, eur, kmTxt, type Criteres } from "@/lib/carcrush";
import type { CatMarque } from "@/lib/vehicules/types";
import { Choix, ENERGIES, Legende } from "./commun";

type P = { c: Criteres; maj: (p: Partial<Criteres>) => void };

export function Accueil() {
  const etapes = [
    { t: "Décrivez la voiture", d: "Le modèle et au moins un autre critère. Vous relisez tout avant de lancer." },
    { t: `Utopicar trouve jusqu'à ${MAX_ANNONCES} annonces`, d: "Dans sa base d'annonces, chacune comparée à la cote." },
    { t: "Vous swipez", d: "À droite vous gardez, à gauche vous passez." },
  ];
  return (
    <div className="grid gap-7">
      <div aria-hidden="true" className="relative mx-auto h-44 w-full max-w-xs">
        <div className="absolute left-4 top-6 h-36 w-44 -rotate-[9deg] rounded-[26px] border border-line bg-[#1d1611]" />
        <div className="absolute right-6 top-1 h-40 w-48 rotate-[6deg] overflow-hidden rounded-[26px] border border-line-2 bg-[#241b14]">
          <div className="grid h-24 place-items-center bg-[#2e231a]">
            <svg viewBox="282 812 1370 305" className="w-28 text-ink">
              <path d="M292 1102 C380 1020 500 975 628 970 C760 880 880 828 1030 828 C1160 828 1280 868 1393 912 L1277 972 C1100 1000 880 1015 700 1017 C560 1019 450 1040 388 1102 Z" fill="currentColor" />
              <path d="M1102 1102 L1297 1102 L1640 830 L1425 862 L1503 896 Z" fill="#ff5a1f" />
            </svg>
          </div>
          <div className="grid gap-1.5 p-3">
            <span className="w-fit rounded-full border border-ok/45 px-2 text-[11px] font-bold text-ok">Bonne affaire</span>
            <span className="h-2.5 w-28 rounded-full bg-line-2" />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 grid size-14 place-items-center rounded-full bg-o text-[#160904] shadow-[0_12px_34px_-12px_rgb(255_90_31/0.85)]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 5.2 3 1.6-1.8 3-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
          </svg>
        </div>
      </div>

      <h1 className="font-display text-[clamp(34px,10vw,44px)] font-semibold leading-[1.03] tracking-[-0.02em]">
        Votre prochaine voiture, <span className="it">au coup de cœur.</span>
      </h1>

      <ol className="grid gap-4">
        {etapes.map((e, i) => (
          <li key={e.t} className="flex items-start gap-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-o/50 bg-o/15 font-display font-semibold text-o2">{i + 1}</span>
            <span className="grid gap-0.5">
              <b className="font-bold">{e.t}</b>
              <span className="text-sm text-ink-3">{e.d}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className="carte flex items-start gap-3 p-4 text-sm leading-relaxed text-ink-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ok">
          <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" />
          <path d="M8.5 12l2.5 2.5 4.5-5" />
        </svg>
        <span>
          Une recherche coûte <b className="text-ink">1 à 3 crédits</b> selon sa précision. Aucune annonce trouvée ? <b className="text-ink">Vos crédits sont rendus.</b>
        </span>
      </p>
    </div>
  );
}

export function Voiture({ c, maj, cat }: P & { cat: CatMarque[] | null }) {
  const marque = cat?.find((b) => b.k === c.marque);
  const modele = marque?.m.find((m) => m.k === c.modele);
  const gen = modele?.g.find((g) => g.id === c.gen);
  return (
    <div className="grid gap-6">
      <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em]">
        Quelle voiture <span className="it">vous fait envie ?</span>
      </h1>
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-[13px] font-bold text-ink-3">
          Marque
          <select value={c.marque} disabled={!cat} onChange={(e) => maj({ marque: e.target.value, modele: "", gen: "", phase: "" })} className={inputCls + " min-h-12 text-base font-medium"}>
            <option value="">{cat ? "Choisir une marque" : "Chargement…"}</option>
            {cat?.map((b) => (
              <option key={b.k} value={b.k}>
                {b.n}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-[13px] font-bold text-ink-3">
          Modèle
          <select
            value={c.modele}
            disabled={!marque}
            onChange={(e) => {
              const m = marque?.m.find((x) => x.k === e.target.value);
              maj({ modele: e.target.value, gen: m && m.g.length === 1 ? m.g[0].id : "", phase: "" });
            }}
            className={inputCls + " min-h-12 text-base font-medium"}
          >
            <option value="">{marque ? "Choisir un modèle" : "La marque d'abord"}</option>
            {marque?.m.map((m) => (
              <option key={m.k} value={m.k}>
                {m.n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {modele && modele.g.length > 1 && (
        <fieldset className="grid gap-2">
          <Legende>Génération</Legende>
          <Choix actif={!c.gen} onClick={() => maj({ gen: "", phase: "" })} className="justify-between rounded-2xl">
            Toutes les générations
          </Choix>
          {modele.g.map((g) => (
            <Choix key={g.id} actif={c.gen === g.id} onClick={() => maj({ gen: g.id, phase: "" })} className="justify-between rounded-2xl py-2">
              <span className="font-display">{g.l}</span>
              <span className="text-sm font-medium text-ink-3">
                {g.y0} – {g.y1}
              </span>
            </Choix>
          ))}
        </fieldset>
      )}

      {gen?.ph && gen.ph.length > 1 && (
        <fieldset>
          <Legende>Phase</Legende>
          <div className="flex flex-wrap gap-2">
            <Choix actif={!c.phase} onClick={() => maj({ phase: "" })}>
              Toutes
            </Choix>
            {gen.ph.map((p) => (
              <Choix key={p.id} actif={c.phase === p.id} onClick={() => maj({ phase: p.id })}>
                {p.l}
              </Choix>
            ))}
          </div>
        </fieldset>
      )}

      {modele && (
        <label className="grid gap-1.5 text-[13px] font-bold text-ink-3">
          Version ou finition <span className="font-medium">(facultatif)</span>
          <input value={c.finition} maxLength={40} onChange={(e) => maj({ finition: e.target.value })} placeholder="GTI, R, Pack M, Business…" className={inputCls + " min-h-12 text-base font-medium"} />
          <span className="font-medium">Cherchée telle quelle dans le titre et la description des annonces.</span>
        </label>
      )}
    </div>
  );
}

export function Budget({ c, maj }: P) {
  const annees = Array.from({ length: 2026 - 1995 + 1 }, (_, i) => 2026 - i);
  return (
    <div className="grid gap-5">
      <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em]">
        Votre <span className="it">budget</span>, et le reste.
      </h1>
      <Curseur
        id="cc-prix"
        label="Budget maximum"
        valeur={c.prixMax}
        defaut={15000}
        min={1000}
        max={80000}
        pas={500}
        texte={eur}
        onChange={(v) => maj({ prixMax: v })}
      />
      <Curseur id="cc-km" label="Kilométrage maximum" valeur={c.kmMax} defaut={120000} min={10000} max={300000} pas={5000} texte={kmTxt} onChange={(v) => maj({ kmMax: v })} />
      <div className="carte grid gap-4 p-5">
        <label className="grid gap-1.5 text-[13px] font-bold text-ink-3">
          Année minimum
          <select value={c.anneeMin ?? ""} onChange={(e) => maj({ anneeMin: e.target.value ? Number(e.target.value) : null })} className={inputCls + " min-h-12 text-base font-medium"}>
            <option value="">Peu importe</option>
            {annees.map((a) => (
              <option key={a} value={a}>
                {a} ou plus récente
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-[13px] font-bold text-ink-3">
          Départements
          <input value={c.dep} maxLength={60} onChange={(e) => maj({ dep: e.target.value })} placeholder="Toute la France, ou par exemple 69, 38" inputMode="text" className={inputCls + " min-h-12 text-base font-medium"} />
          <span className="font-medium">Numéros ou noms, séparés par des virgules.</span>
        </label>
      </div>
    </div>
  );
}

function Curseur({ id, label, valeur, defaut, min, max, pas, texte, onChange }: {
  id: string; label: string; valeur: number | null; defaut: number; min: number; max: number; pas: number; texte: (n: number) => string; onChange: (v: number | null) => void;
}) {
  return (
    <div className="carte grid gap-2.5 p-5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-bold text-ink-3">
          {label}
        </label>
        <button type="button" aria-pressed={valeur == null} onClick={() => onChange(valeur == null ? defaut : null)} className="min-h-9 rounded-full border border-line-2 px-3 text-[13px] font-semibold hover:border-o/50">
          {valeur == null ? "Fixer un maximum" : "Peu importe"}
        </button>
      </div>
      <output htmlFor={id} className={"num font-display text-[32px] font-semibold " + (valeur == null ? "text-ink-3" : "")}>
        {valeur == null ? "Peu importe" : texte(valeur)}
      </output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur ?? defaut}
        aria-valuetext={valeur == null ? "Peu importe" : texte(valeur)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-full accent-[#ff5a1f]"
      />
    </div>
  );
}

export function Details({ c, maj }: P) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em]">
          Les <span className="it">détails</span> qui comptent.
        </h1>
        <p className="text-ink-3">Facultatif. Chaque détail affine la recherche.</p>
      </div>
      <fieldset>
        <Legende>Énergie</Legende>
        <div className="flex flex-wrap gap-2">
          <Choix actif={!c.energie} onClick={() => maj({ energie: "" })}>
            Peu importe
          </Choix>
          {(Object.keys(ENERGIES) as Criteres["energie"][]).map((e) => (
            <Choix key={e} actif={c.energie === e} onClick={() => maj({ energie: e })}>
              {ENERGIES[e]}
            </Choix>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <Legende>Boîte de vitesses</Legende>
        <div className="flex flex-wrap gap-2">
          {([["", "Peu importe"], ["auto", "Automatique"], ["manuelle", "Manuelle"]] as const).map(([v, l]) => (
            <Choix key={v} actif={c.boite === v} onClick={() => maj({ boite: v })}>
              {l}
            </Choix>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <Legende>Portes</Legende>
        <div className="flex flex-wrap gap-2">
          {([["", "Peu importe"], ["3", "3 portes"], ["5", "5 portes"]] as const).map(([v, l]) => (
            <Choix key={v} actif={c.portes === v} onClick={() => maj({ portes: v })}>
              {l}
            </Choix>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <Legende>
          Couleur · <span className="text-ink">{COULEURS.find((x) => x.id === c.couleur)?.l ?? "Peu importe"}</span>
        </Legende>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" aria-pressed={!c.couleur} onClick={() => maj({ couleur: "" })} className={"grid size-12 place-items-center rounded-full border-2 text-[11px] font-bold " + (!c.couleur ? "border-o" : "border-line-2")}>
            Tout
          </button>
          {COULEURS.map((x) => (
            <button key={x.id} type="button" aria-pressed={c.couleur === x.id} aria-label={x.l} title={x.l} onClick={() => maj({ couleur: x.id })} className={"size-12 rounded-full border-2 p-1 " + (c.couleur === x.id ? "border-o" : "border-transparent")}>
              <span className="block size-full rounded-full border border-line-2" style={{ background: x.hex }} />
            </button>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-ink-3">Les annonces d&apos;une autre couleur sont écartées ; celles qui ne la précisent pas restent, signalées « à vérifier ».</p>
      </fieldset>
      <fieldset>
        <Legende>Vendeur</Legende>
        <div className="flex flex-wrap gap-2">
          {([["", "Peu importe"], ["particulier", "Particulier"], ["pro", "Professionnel"]] as const).map(([v, l]) => (
            <Choix key={v} actif={c.vendeur === v} onClick={() => maj({ vendeur: v })}>
              {l}
            </Choix>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
