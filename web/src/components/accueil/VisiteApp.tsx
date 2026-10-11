"use client";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import { Compteur } from "@/components/site/Compteur";

/* Visite interactive de l'app : quatre écrans clés, un par onglet, qui s'animent à chaque ouverture
   (classes « scene », « pas », « jauge », « monte », « anneau » de globals.css). Onglets accessibles (flèches,
   Début, Fin), pas de défilement automatique. Écrans d'illustration : le rapport reprend la vraie annonce Clio
   de la démonstration ; les autres valeurs sont des exemples, signalés comme tels. */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const ONGLETS = [
  { id: "rapport", l: "Le rapport" },
  { id: "marche", l: "Sous la cote" },
  { id: "tableau", l: "Tableau de bord" },
  { id: "message", l: "Message" },
] as const;
type Onglet = (typeof ONGLETS)[number]["id"];

function Rapport() {
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="pas relative mx-auto grid size-36 place-items-center" style={d(0.05)}>
        <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="20" cy="20" r="16" fill="none" className="stroke-line" strokeWidth="4" />
          <circle cx="20" cy="20" r="16" fill="none" className="anneau stroke-ok" strokeWidth="4" strokeLinecap="round" pathLength={100} strokeDasharray="100" style={{ strokeDashoffset: 20, ...d(0.2) }} />
        </svg>
        <span className="text-center">
          <span className="num block font-display text-4xl font-semibold">8</span>
          <span className="text-xs text-ink-3">sur 10</span>
        </span>
      </div>
      <div className="grid gap-2">
        <p className="pas flex items-center gap-2" style={d(0.4)}>
          <span className="rounded-full bg-ok/15 px-3 py-1 text-sm font-bold text-ok">✓ Bon prix</span>
          <span className="text-sm text-ink-3">Renault Clio IV 0.9 TCe 90 · 6 700 €</span>
        </p>
        <dl className="grid gap-1.5 text-sm">
          {(
            [
              ["Cote du marché", "7 550 €", ""],
              ["Défauts repérés (choc)", "+ 425 €", "text-bad"],
              ["Prix réel", "7 125 €", "text-ok"],
              ["Prix à proposer", "6 250 €", "font-display text-lg text-o2"],
            ] as const
          ).map(([l, v, cls], i) => (
            <div key={l} className="pas flex items-baseline justify-between border-b border-line py-1.5" style={d(0.6 + i * 0.15)}>
              <dt className="text-ink-2">{l}</dt>
              <dd className={cx("num font-semibold", cls)}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

const ANNONCES = [
  { t: "Clio IV 1.5 dCi · 2018 · 194 000 km", p: 4500, pct: 30 },
  { t: "Clio IV 1.5 dCi · 2012 · 158 000 km", p: 5000, pct: 24 },
  { t: "Clio IV 1.5 dCi · 2017 · 95 000 km", p: 6900, pct: 19 },
  { t: "Clio IV 1.5 dCi · 2016 · 175 000 km", p: 6000, pct: 17 },
];

function Marche() {
  const [tri, setTri] = useState<"ecart" | "prix">("ecart");
  const liste = [...ANNONCES].sort((a, b) => (tri === "ecart" ? b.pct - a.pct : a.p - b.p));
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-3">Recherche : Renault Clio IV · exemple</p>
        <div role="group" aria-label="Trier" className="flex gap-1 rounded-full border border-line p-1 text-xs">
          {(
            [
              ["ecart", "Les plus sous la cote"],
              ["prix", "Prix croissant"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={tri === k} onClick={() => setTri(k)} className={cx("min-h-8 rounded-full px-3", tri === k ? "bg-o text-[#160904]" : "text-ink-2 hover:text-ink")}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {/* la clé change avec le tri : la liste se rejoue en cascade */}
      <ul key={tri} className="grid gap-2">
        {liste.map((a, i) => (
          <li key={a.t} className="pas flex items-center justify-between gap-3 rounded-2xl border border-line bg-creux px-4 py-3 transition hover:border-o/40" style={d(0.05 + i * 0.1)}>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{a.t}</span>
              <span className="num text-sm text-ink-3">{a.p.toLocaleString("fr-FR")} €</span>
            </span>
            <span className="shrink-0 rounded-full bg-ok/15 px-2.5 py-1 text-xs font-bold text-ok">−{a.pct} % sous la cote</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tableau() {
  return (
    <div className="grid gap-5">
      <dl className="grid grid-cols-3 gap-3">
        {(
          [
            ["Marge du mois", 1820, " €"],
            ["Voitures vendues", 3, ""],
            ["Jours en stock", 21, " j"],
          ] as const
        ).map(([l, v, u], i) => (
          <div key={l} className="pas rounded-2xl border border-line bg-creux p-3" style={d(0.05 + i * 0.1)}>
            <dt className="text-xs text-ink-3">{l}</dt>
            <dd className="num font-display text-2xl font-semibold">
              <Compteur valeur={v} />
              {u}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex h-28 items-end gap-2" aria-hidden="true">
        {[34, 48, 41, 62, 55, 78, 70, 92].map((h, i) => (
          <span key={i} className="flex h-full flex-1 items-end">
            <span className={cx("monte w-full rounded-t-md", i === 7 ? "bg-o" : "bg-o/35")} style={{ height: `${h}%`, ...d(0.2 + i * 0.06) }} />
          </span>
        ))}
      </div>
      <p className="text-xs text-ink-3">Exemple : marges des 8 derniers mois.</p>
    </div>
  );
}

function Message() {
  return (
    <div className="grid gap-3">
      <div className="pas ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-o px-4 py-3 text-sm text-[#160904]" style={d(0.1)}>
        Bonjour, votre Renault Clio m&apos;intéresse. Est-elle toujours disponible, et pourriez-vous m&apos;envoyer le contrôle technique et les factures d&apos;entretien ?
      </div>
      <p className="pas ml-auto text-xs text-ink-3" style={d(0.7)}>
        Envoyé · rédigé par Utopicar
      </p>
      <div className="grid">
        <span className="passe frappe col-start-1 row-start-1 flex w-fit gap-1 self-start rounded-2xl rounded-bl-md bg-glass px-4 py-3 text-ink-3" style={d(0.9)} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="pas col-start-1 row-start-1 max-w-[85%] rounded-2xl rounded-bl-md bg-glass px-4 py-3 text-sm text-ink-2" style={d(2)}>
          Oui toujours dispo ! CT de 3 mois, je vous envoie les photos des factures.
        </div>
      </div>
      <p className="pas rounded-2xl border border-o/40 bg-o/10 px-4 py-2 text-sm" style={d(2.4)}>
        <b>Prix d&apos;ouverture conseillé :</b> <span className="num font-semibold text-o2">6 250 €</span>
      </p>
    </div>
  );
}

const ECRANS: Record<Onglet, () => React.ReactNode> = { rapport: Rapport, marche: Marche, tableau: Tableau, message: Message };

export function VisiteApp() {
  const [actif, setActif] = useState<Onglet>("rapport");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const i = ONGLETS.findIndex((o) => o.id === actif);
  const aller = (k: number) => {
    const n = (k + ONGLETS.length) % ONGLETS.length;
    setActif(ONGLETS[n].id);
    refs.current[n]?.focus();
  };
  const clavier = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") aller(i + 1);
    else if (e.key === "ArrowLeft") aller(i - 1);
    else if (e.key === "Home") aller(0);
    else if (e.key === "End") aller(ONGLETS.length - 1);
    else return;
    e.preventDefault();
  };
  const Ecran = ECRANS[actif];
  return (
    <div className="carte overflow-hidden">
      {/* barre d'onglets, comme une fenêtre de l'app */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="hidden gap-1.5 sm:flex" aria-hidden="true">
          <i className="size-2.5 rounded-full bg-bad/60" />
          <i className="size-2.5 rounded-full bg-warn/60" />
          <i className="size-2.5 rounded-full bg-ok/60" />
        </span>
        <div role="tablist" aria-label="Écrans de l'app" onKeyDown={clavier} className="-mx-1 flex flex-1 gap-1 overflow-x-auto px-1">
          {ONGLETS.map((o, k) => (
            <button
              key={o.id}
              ref={(el) => {
                refs.current[k] = el;
              }}
              role="tab"
              id={`visite-${o.id}`}
              aria-selected={actif === o.id}
              aria-controls="visite-ecran"
              tabIndex={actif === o.id ? 0 : -1}
              type="button"
              onClick={() => setActif(o.id)}
              className={cx("min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm transition", actif === o.id ? "bg-o text-[#160904] font-semibold" : "text-ink-2 hover:bg-glass hover:text-ink")}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      {/* la clé change avec l'onglet : l'écran se rejoue à chaque ouverture */}
      <div key={actif} id="visite-ecran" role="tabpanel" aria-labelledby={`visite-${actif}`} tabIndex={0} className="scene min-h-[22rem] p-5 sm:p-7">
        <Ecran />
      </div>
    </div>
  );
}
