"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "../ui";

type Ligne = { l: string; s: string; v: number | null; sens?: "up" | "dn" | "cle"; avant?: string; sinon?: string };
type Exemple = {
  onglet: string;
  titre: string;
  prix: number;
  infos: string;
  lieu: string;
  nbPhotos: number;
  photos: string[];
  citation: { t: string; m?: "bad" | "ok" }[];
  fiab: { note: number; moteur: string };
  ton: "ok" | "warn" | "bad";
  verdict: string;
  phrase: string;
  lignes: Ligne[];
  message: string;
};

/* Trois vraies annonces Leboncoin relevées le 3 octobre 2026 (une recherche par modèle) et passées dans l'outil :
   cote, défauts, fiabilité, prix à proposer et message sont ceux qu'il a rendus. Photos de l'annonce, sans plaque lisible. */
const EXEMPLES: Record<string, Exemple> = {
  clio: {
    onglet: "Clio IV", titre: "Renault Clio IV 0.9 TCe 90", prix: 6700, infos: "2013 · 57 840 km · Essence · Manuelle", lieu: "Particulier · Barcelonnette (04)", nbPhotos: 3,
    photos: ["/images/demo/clio-1.webp", "/images/demo/clio-2.webp", "/images/demo/clio-3.webp"],
    citation: [{ t: "« Seulement 57 840 km, 2 pneus avant neufs. " }, { t: "Distribution à contrôler", m: "bad" }, { t: ". À signaler : " }, { t: "un choc sur le passage de roue avant gauche", m: "bad" }, { t: ". Vendu en l'état. »" }],
    fiab: { note: 8, moteur: "0.9 TCe 90" },
    ton: "ok", verdict: "Bon prix", phrase: "Moins chère que les Clio comparables, choc compris. Moteur de la liste fiable.",
    lignes: [
      { l: "Cote du marché", s: "174 Clio IV comparables en vente", v: 7550 },
      { l: "Défauts repérés dans le texte", s: "Choc de carrosserie (150 à 700 €)", v: 425, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + réparations)", s: "Sous la cote", v: 7125, sens: "dn" },
      { l: "Prix à proposer", s: "Ouverture conseillée, sans vexer le vendeur", v: 6250, sens: "cle" },
    ],
    message: "Bonjour, votre Renault Clio m'intéresse. Est-elle toujours disponible, et pourriez-vous m'envoyer le contrôle technique et les factures d'entretien ?",
  },
  p208: {
    onglet: "208", titre: "Peugeot 208 1.2 PureTech 110 Allure", prix: 7190, infos: "2016 · 116 789 km · Essence · Manuelle", lieu: "Professionnel · Vitrolles (13)", nbPhotos: 12,
    photos: ["/images/demo/208-1.webp", "/images/demo/208-2.webp", "/images/demo/208-3.webp", "/images/demo/208-4.webp"],
    citation: [{ t: "« Peugeot 208 " }, { t: "1.2 PureTech", m: "bad" }, { t: " Allure 5P 110 ch. Mise en circulation 2016. 116 789 km. » Aucun mot sur l'entretien ni sur la courroie." }],
    fiab: { note: 4, moteur: "1.2 PureTech 110" },
    ton: "bad", verdict: "Déconseillée", phrase: "Moteur à éviter (courroie dans l'huile, consommation d'huile) et prix au-dessus du marché.",
    lignes: [
      { l: "Cote du marché", s: "21 annonces comparables", v: 5950 },
      { l: "Travaux à prévoir", s: "Pneus, freins, révision, contrôle de la courroie", v: 1650, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + travaux)", s: "Bien au-dessus de la cote", v: 8840, sens: "up" },
      { l: "Prix à proposer", s: "Moteur réputé fragile : mieux vaut passer", v: null, sens: "cle", sinon: "Passez" },
    ],
    message: "Bonjour, avez-vous le carnet d'entretien complet ? La courroie de distribution et la consommation d'huile ont-elles été vérifiées ?",
  },
  yaris: {
    onglet: "Yaris", titre: "Toyota Yaris III 100 VVT-i Dynamic", prix: 10999, infos: "2014 · 97 959 km · Essence · Manuelle", lieu: "Professionnel · Paris (75)", nbPhotos: 12,
    photos: ["/images/demo/yaris-1.webp", "/images/demo/yaris-2.webp", "/images/demo/yaris-3.webp", "/images/demo/yaris-4.webp"],
    citation: [{ t: "« Toyota Yaris 100 VVT-i Dynamic 5p, " }, { t: "garantie Label Toyota Occasions 12 mois", m: "ok" }, { t: ". Caméra de recul, régulateur, écran tactile. »" }],
    fiab: { note: 8, moteur: "1.33 VVT-i" },
    ton: "warn", verdict: "Trop cher", phrase: "Moteur fiable et garantie 12 mois, mais près de 3 000 € au-dessus des Yaris comparables.",
    lignes: [
      { l: "Cote du marché", s: "Estimation Leboncoin : 7 930 à 8 770 €", v: 8350 },
      { l: "Défauts vus sur les photos", s: "Pneus avant usés (250 à 350 €)", v: 300, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + réparations)", s: "Au-dessus de la cote", v: 11299, sens: "up" },
      { l: "Prix à proposer", s: "À négocier fermement, ou comparer d'autres Yaris", v: 8050, sens: "cle" },
    ],
    message: "Bonjour, je suis intéressé par cette Yaris Dynamic. Avez-vous le CT et l'HistoVec à jour ? Je souhaite valider l'historique d'entretien avant de me déplacer.",
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
  const v = useCompte(Math.abs(ligne.v ?? 0), go);
  return (
    <span className={cx("num font-display text-lg font-semibold", ligne.sens === "up" && "text-bad", ligne.sens === "dn" && "text-ok", ligne.sens === "cle" && "text-o2")}>
      {ligne.v == null ? ligne.sinon : (ligne.avant ?? "") + (ligne.v < 0 ? "−\u00a0" : "") + Math.round(v).toLocaleString("fr-FR") + "\u00a0€"}
    </span>
  );
}

export function Demo() {
  const [cle, setCle] = useState("clio");
  const [etape, setEtape] = useState(4); // 0-3 : analyse en cours ; 4 : résultat
  const [copie, setCopie] = useState(false);
  const [photo, setPhoto] = useState(0);
  const boite = useRef<HTMLDivElement>(null);
  const onglets = useRef<(HTMLButtonElement | null)[]>([]);
  const minuteurs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ex = EXEMPLES[cle];

  function lancer(k: string) {
    minuteurs.current.forEach(clearTimeout);
    minuteurs.current = [];
    setCle(k);
    setPhoto(0);
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
  const score = useCompte(ex.fiab.note, fini, 1300);
  const p = Math.min(photo, ex.photos.length - 1);
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
          <div className="relative overflow-hidden rounded-2xl bg-[#1d1814]">
            {/* eslint-disable-next-line @next/next/no-img-element -- photos de l'annonce, déjà au bon format */}
            <img key={ex.photos[p]} src={ex.photos[p]} alt={`${ex.titre}, photo ${p + 1} de l'annonce`} width={800} height={600} className="aspect-[4/3] w-full object-cover" />
            <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-ink">{ex.nbPhotos} photos</span>
            {!fini && <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 animate-pulse bg-gradient-to-b from-o/25 to-transparent" aria-hidden="true" />}
          </div>
          <ul className="mt-2 grid grid-cols-4 gap-2" aria-label="Photos de l'annonce">
            {ex.photos.map((src, i) => (
              <li key={src}>
                <button type="button" onClick={() => setPhoto(i)} aria-label={`Voir la photo ${i + 1}`} aria-pressed={i === p} className={cx("block w-full overflow-hidden rounded-lg border-2 transition", i === p ? "border-o" : "border-transparent opacity-70 hover:opacity-100")}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- vignette */}
                  <img src={src} alt="" width={200} height={150} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 font-display text-lg font-semibold">{ex.titre}</h3>
          <p className="num font-display text-2xl font-semibold text-o2">{euros(ex.prix)}</p>
          <p className="text-sm text-ink-3">{ex.infos}</p>
          <blockquote className="mt-3 border-l-2 border-line-2 pl-3 text-sm text-ink-2">
            {ex.citation.map((c, i) => (c.m ? <mark key={i} className={cx("rounded px-1 text-ink", c.m === "ok" ? "bg-ok/20" : "bg-bad/20")}>{c.t}</mark> : <span key={i}>{c.t}</span>))}
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
            <span>{fini ? "Analyse terminée" : "Analyse en cours…"}</span>
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
                    <circle cx="43" cy="43" r={r} fill="none" stroke={ANNEAU[ex.ton]} strokeWidth="7" strokeLinecap="round" strokeDasharray={tour} strokeDashoffset={tour * (1 - score / 10)} />
                  </svg>
                  <span className="absolute inset-0 grid place-content-center text-center leading-none">
                    <b className="num font-display text-2xl">{Math.round(score)}<small className="text-sm text-ink-3">/10</small></b>
                    <small className="mt-1 text-[10px] text-ink-3">fiabilité</small>
                  </span>
                </div>
                <div>
                  <span className={cx("inline-block rounded-full border px-3 py-1 text-sm font-semibold", TON[ex.ton])}>{ex.verdict}</span>
                  <p className="mt-1.5 text-sm text-ink-2">{ex.phrase}</p>
                  <p className="mt-1 text-xs text-ink-3">Moteur {ex.fiab.moteur} : {ex.fiab.note} / 10</p>
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
      <p className="mt-5 text-center text-xs text-ink-3">Trois vraies annonces Leboncoin relevées le 3 octobre 2026 et analysées par l&apos;outil. Chiffres arrondis.</p>
    </div>
  );
}
