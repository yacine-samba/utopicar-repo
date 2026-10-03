"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../ui";

type Ligne = { l: string; s: string; v: number; sens?: "up" | "dn" | "cle"; avant?: string; apres?: string };
type Exemple = {
  onglet: string;
  titre: string;
  prix: number;
  infos: string;
  lieu: string;
  photos: string;
  couleur: string;
  citation: { t: string; m?: boolean }[];
  score: number;
  ton: "ok" | "warn" | "bad";
  verdict: string;
  phrase: string;
  lignes: Ligne[];
  message: string;
};

const EXEMPLES: Record<string, Exemple> = {
  clio: {
    onglet: "Clio IV", titre: "Renault Clio IV 1.5 dCi 90 Intens", prix: 7400, infos: "2015 · 142 000 km · Diesel · Manuelle", lieu: "Particulier · Melun (77)", photos: "12 photos", couleur: "#3a342e",
    citation: [{ t: "« Très bon état, CT ok, " }, { t: "petit bruit à l'embrayage", m: true }, { t: ", " }, { t: "pneus à prévoir", m: true }, { t: ". Prix ferme, affaire à saisir. »" }],
    score: 48, ton: "bad", verdict: "Fausse bonne affaire", phrase: "18 % au-dessus de la cote une fois les travaux comptés.",
    lignes: [
      { l: "Cote du marché", s: "Même version, même âge, même kilométrage", v: 6950 },
      { l: "Défauts repérés dans le texte", s: "Embrayage (500 à 900 €) · pneus (150 à 350 €)", v: 800, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + travaux)", s: "Au-dessus de la cote", v: 8200, sens: "up" },
      { l: "Prix à proposer", s: "Pour garder le prix réel sous la cote", v: 6100, sens: "cle" },
    ],
    message: "Bonjour, votre Clio est-elle toujours disponible ? Vous parlez d'un bruit à l'embrayage : a-t-il été diagnostiqué ?",
  },
  p208: {
    onglet: "208", titre: "Peugeot 208 1.6 BlueHDi 100 Active", prix: 7900, infos: "2016 · 118 000 km · Diesel · Manuelle", lieu: "Particulier · Évry (91)", photos: "18 photos", couleur: "#2f3a44",
    citation: [{ t: "« Entretien Peugeot, " }, { t: "courroie faite à 110 000 km", m: true }, { t: ", factures, CT vierge. Vente cause achat familiale. »" }],
    score: 82, ton: "ok", verdict: "Bonne affaire", phrase: "Sous la cote, entretien prouvé : à appeler vite.",
    lignes: [
      { l: "Cote du marché", s: "Même version, même âge, même kilométrage", v: 8450 },
      { l: "Défauts repérés dans le texte", s: "Aucun défaut coûteux signalé", v: 0, sens: "dn" },
      { l: "Écart avec la cote", s: "Prix sous le marché", v: -550, sens: "dn" },
      { l: "Prix à proposer", s: "Ouverture polie, marge de négociation", v: 7500, sens: "cle" },
    ],
    message: "Bonjour, votre 208 est-elle toujours disponible ? Je peux passer la voir cette semaine : les factures d'entretien sont-elles disponibles ?",
  },
  yaris: {
    onglet: "Yaris", titre: "Toyota Yaris III 1.33 VVT-i Dynamic", prix: 8900, infos: "2014 · 96 000 km · Essence · Manuelle", lieu: "Professionnel · Meaux (77)", photos: "9 photos", couleur: "#44322b",
    citation: [{ t: "« Première main, " }, { t: "carnet partiel", m: true }, { t: ", " }, { t: "plaquettes à changer", m: true }, { t: ". Garantie 3 mois. »" }],
    score: 61, ton: "warn", verdict: "À négocier", phrase: "Moteur fiable, mais prix au-dessus de la cote.",
    lignes: [
      { l: "Cote du marché", s: "Même version, même âge, même kilométrage", v: 8300 },
      { l: "Défauts repérés dans le texte", s: "Plaquettes (150 à 400 €) · carnet incomplet", v: 275, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + travaux)", s: "Au-dessus de la cote", v: 9175, sens: "up" },
      { l: "Prix à proposer", s: "Demander les factures manquantes", v: 8000, sens: "cle" },
    ],
    message: "Bonjour, la Yaris est-elle toujours disponible ? Pouvez-vous m'envoyer les factures d'entretien manquantes ?",
  },
};
const CLES = Object.keys(EXEMPLES);
const ETAPES = ["Lecture du texte et des photos", "Estimation de la cote du marché", "Recherche des 38 défauts qui coûtent cher", "Calcul du prix à proposer"];
const euros = (v: number) => (v < 0 ? "−\u00a0" : "") + Math.abs(Math.round(v)).toLocaleString("fr-FR") + "\u00a0€";
const TON = { ok: "text-ok border-ok/40 bg-ok/10", warn: "text-warn border-warn/40 bg-warn/10", bad: "text-bad border-bad/40 bg-bad/10" };
const ANNEAU = { ok: "#3ecb7f", warn: "#ffc53d", bad: "#ff7a7a" };

const reduit = () => typeof window !== "undefined" && (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme"));

/** Compte de 0 à la valeur (instantané si les animations sont réduites). */
function useCompte(cible: number, actif: boolean, ms = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!actif) return;
    if (reduit()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- valeur finale immédiate sans animation
      setV(cible);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const pas = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(cible * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [cible, actif, ms]);
  return actif ? v : 0;
}

function Valeur({ ligne, actif, delai }: { ligne: Ligne; actif: boolean; delai: number }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (!actif) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- remise à zéro quand l'analyse repart
      setGo(false);
      return;
    }
    const t = setTimeout(() => setGo(true), reduit() ? 0 : delai);
    return () => clearTimeout(t);
  }, [actif, delai]);
  const v = useCompte(Math.abs(ligne.v), go);
  return (
    <span className={cx("num font-display text-lg font-semibold", ligne.sens === "up" && "text-bad", ligne.sens === "dn" && "text-ok", ligne.sens === "cle" && "text-o2")}>
      {(ligne.avant ?? "") + (ligne.v < 0 ? "−\u00a0" : "") + Math.round(v).toLocaleString("fr-FR") + "\u00a0€"}
    </span>
  );
}

export function Demo() {
  const [cle, setCle] = useState("clio");
  const [etape, setEtape] = useState(4); // 0-3 : analyse en cours ; 4 : résultat
  const [copie, setCopie] = useState(false);
  const boite = useRef<HTMLDivElement>(null);
  const onglets = useRef<(HTMLButtonElement | null)[]>([]);
  const minuteurs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ex = EXEMPLES[cle];

  function lancer(k: string) {
    minuteurs.current.forEach(clearTimeout);
    minuteurs.current = [];
    setCle(k);
    setCopie(false);
    if (reduit()) return setEtape(4);
    setEtape(0);
    [1, 2, 3, 4].forEach((n) => minuteurs.current.push(setTimeout(() => setEtape(n), 650 * n + (n === 4 ? 250 : 0))));
  }

  // L'analyse démarre la première fois que la démo entre dans l'écran.
  useEffect(() => {
    const el = boite.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          lancer("clio");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      minuteurs.current.forEach(clearTimeout);
    };
  }, []);

  function clavier(e: KeyboardEvent, i: number) {
    const n = e.key === "ArrowRight" ? (i + 1) % CLES.length : e.key === "ArrowLeft" ? (i + CLES.length - 1) % CLES.length : e.key === "Home" ? 0 : e.key === "End" ? CLES.length - 1 : -1;
    if (n < 0) return;
    e.preventDefault();
    onglets.current[n]?.focus();
    lancer(CLES[n]);
  }

  const fini = etape >= 4;
  const score = useCompte(ex.score, fini, 1300);
  const r = 38;
  const tour = 2 * Math.PI * r;

  return (
    <div ref={boite}>
      <div role="tablist" aria-label="Annonce à analyser" className="mx-auto mb-8 flex w-fit gap-1 rounded-full border border-line-2 bg-glass p-1">
        {CLES.map((k, i) => (
          <button
            key={k}
            ref={(el) => {
              onglets.current[i] = el;
            }}
            role="tab"
            id={`demo-onglet-${k}`}
            aria-selected={cle === k}
            aria-controls="demo-panneau"
            tabIndex={cle === k ? 0 : -1}
            onClick={() => lancer(k)}
            onKeyDown={(e) => clavier(e, i)}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-2 transition aria-selected:bg-o aria-selected:text-[#160904]"
          >
            {EXEMPLES[k].onglet}
            <span className="max-sm:hidden"> · {euros(EXEMPLES[k].prix)}</span>
          </button>
        ))}
      </div>

      <div id="demo-panneau" role="tabpanel" aria-labelledby={`demo-onglet-${cle}`} className="grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1.15fr]">
        <article className="carte p-5">
          <div className="mb-3 flex justify-between text-xs text-ink-3">
            <span>Annonce Leboncoin</span>
            <span>{ex.lieu}</span>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#1d1814] p-4">
            <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-ink-2">{ex.photos}</span>
            <svg viewBox="0 0 320 130" className="w-full" aria-hidden="true">
              <path d="M18 96c0-10 6-16 16-18l38-8 36-30c8-6 16-9 26-9h72c12 0 22 5 30 13l24 26 32 6c12 2 20 10 20 22v10c0 4-3 7-7 7H25c-4 0-7-3-7-7V96z" fill={ex.couleur} />
              <path d="M118 44c6-5 12-7 20-7h36v33h-86l30-26zm66-7h32c9 0 17 4 23 10l20 23h-75V37z" fill="#221e1b" />
              <circle cx="82" cy="108" r="19" fill="#0e0c0b" />
              <circle cx="82" cy="108" r="8" fill="#55504a" />
              <circle cx="252" cy="108" r="19" fill="#0e0c0b" />
              <circle cx="252" cy="108" r="8" fill="#55504a" />
            </svg>
            {!fini && <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 animate-pulse bg-gradient-to-b from-o/25 to-transparent" aria-hidden="true" />}
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">{ex.titre}</h3>
          <p className="num font-display text-2xl font-semibold text-o2">{euros(ex.prix)}</p>
          <p className="text-sm text-ink-3">{ex.infos}</p>
          <blockquote className="mt-3 border-l-2 border-line-2 pl-3 text-sm text-ink-2">
            {ex.citation.map((c, i) => (c.m ? <mark key={i} className="rounded bg-bad/20 px-1 text-ink">{c.t}</mark> : <span key={i}>{c.t}</span>))}
          </blockquote>
        </article>

        <div className="hidden items-center text-o2 lg:flex" aria-hidden="true">
          <svg width="54" height="24" viewBox="0 0 54 24">
            <path d="M2 12h44" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 6" />
            <path d="M40 5l8 7-8 7" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <article className="carte p-5" aria-live="polite" aria-busy={!fini}>
          <div className="mb-4 flex justify-between text-xs text-ink-3">
            <span>Fiche Utopicar</span>
            <span>{fini ? "Calculée en 9 s" : "Analyse en cours…"}</span>
          </div>
          {!fini ? (
            <ol className="grid gap-3">
              {ETAPES.map((e, i) => (
                <li key={e} className={cx("flex items-center gap-3 text-sm transition", i < etape ? "text-ink-2" : i === etape ? "text-ink" : "text-ink-3/60")}>
                  <span className={cx("grid size-5 shrink-0 place-items-center rounded-full border text-[10px]", i < etape ? "border-ok bg-ok/20 text-ok" : i === etape ? "animate-pulse border-o" : "border-line-2")} aria-hidden="true">
                    {i < etape ? "✓" : ""}
                  </span>
                  {e}
                </li>
              ))}
            </ol>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="relative size-[86px] shrink-0">
                  <svg viewBox="0 0 86 86" className="size-full -rotate-90" aria-hidden="true">
                    <circle cx="43" cy="43" r={r} fill="none" stroke="rgb(244 241 236 / .1)" strokeWidth="7" />
                    <circle cx="43" cy="43" r={r} fill="none" stroke={ANNEAU[ex.ton]} strokeWidth="7" strokeLinecap="round" strokeDasharray={tour} strokeDashoffset={tour * (1 - score / 100)} />
                  </svg>
                  <b className="num absolute inset-0 grid place-items-center font-display text-2xl">{Math.round(score)}</b>
                </div>
                <div>
                  <span className={cx("inline-block rounded-full border px-3 py-1 text-sm font-semibold", TON[ex.ton])}>{ex.verdict}</span>
                  <p className="mt-1.5 text-sm text-ink-2">{ex.phrase}</p>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {ex.lignes.map((l, i) => (
                  <li key={l.l} className={cx("flex items-center justify-between gap-3 py-2.5", l.sens === "cle" && "rounded-xl bg-o/10 px-3")}>
                    <span className="text-sm">
                      {l.l}
                      <small className="block text-xs text-ink-3">{l.s}</small>
                    </span>
                    <Valeur ligne={l} actif={fini} delai={200 + 110 * i} />
                  </li>
                ))}
              </ul>
              <div className="flex items-start gap-3 rounded-2xl border border-line bg-black/25 p-3 text-sm">
                <p className="flex-1 text-ink-2">
                  Message prêt à envoyer : <em className="text-ink">« {ex.message} »</em>
                </p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(ex.message).then(() => setCopie(true), () => undefined)}
                  className="shrink-0 rounded-full border border-line-2 px-3 py-1 text-xs text-ink-2 hover:text-ink"
                >
                  {copie ? "Copié ✓" : "Copier"}
                </button>
              </div>
              <button type="button" onClick={() => lancer(cle)} className="w-fit text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                ↻ Relancer l&apos;analyse
              </button>
            </div>
          )}
        </article>
      </div>
      <p className="mt-5 text-center text-xs text-ink-3">Exemples construits à partir d&apos;annonces réelles. Chiffres arrondis.</p>
    </div>
  );
}
