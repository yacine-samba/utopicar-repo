"use client";
import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";

/* Écran d'attente de l'analyse : étapes qui avancent, barre de progression, aperçu instantané calculé par l'outil
   (cote, défauts lus, fiabilité du moteur) pendant que l'IA rédige le rapport, et conseils pour patienter utilement. */

export type Apercu = {
  titre: string; prix: number | null; annee: number | null; km: number | null; energie: string; boite: string; ville: string;
  cote: { n: number; mediane: number; p25: number; p75: number } | null; ecart: number | null;
  fiab: { k: "fiable" | "limite" | "eviter" | "hors"; modele: string | null; pourquoi: string[] };
  defauts: { l: string; piege: boolean }[]; papiers: string[];
};

const CONSEILS = [
  "Demandez toujours la carte grise avant de vous déplacer : le nom et l'adresse doivent correspondre à la pièce d'identité du vendeur.",
  "Le certificat de non-gage est gratuit sur HistoVec : exigez-le de moins de 15 jours.",
  "Essayez la voiture moteur froid : un démarrage difficile ou de la fumée se cachent mal à froid.",
  "Une distribution non faite coûte souvent 500 à 900 € : vérifiez la facture et le kilométrage du remplacement.",
  "Une différence de teinte entre deux éléments trahit souvent une réparation de carrosserie : regardez en lumière rasante.",
  "Ne versez jamais d'acompte avant d'avoir vu la voiture et ses papiers.",
  "Un contrôle technique de moins de 6 mois est obligatoire pour vendre : c'est au vendeur de le fournir.",
  "Payez par virement instantané ou chèque de banque vérifié, jamais en espèces pour une grosse somme.",
  "Un prix très en dessous du marché cache souvent un problème : la cote vous dit de combien.",
  "Vérifiez que tous les voyants s'allument puis s'éteignent au démarrage.",
];

const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

export function Patience({ phase, sec, apercu, nbPhotos, benef }: { phase: "import" | "analyse"; sec: number; apercu: Apercu | null; nbPhotos: number; benef: boolean }) {
  const [conseil, setConseil] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setConseil((c) => (c + 1) % CONSEILS.length), 8000);
    return () => clearInterval(i);
  }, []);

  const etapes =
    phase === "import"
      ? [["Lecture de l'annonce sur Leboncoin", 0], ["Récupération des photos", 25]]
      : ([
          ["Lecture du texte de l'annonce", 0],
          ["Cote sur les annonces comparables", 3],
          ...(nbPhotos ? [[`Examen des ${nbPhotos} photo${nbPhotos > 1 ? "s" : ""} : carrosserie, jantes, intérieur`, 8]] : []),
          ["Contrôles : kilométrage, papiers, moteur", 20],
          [benef ? "Calcul du deal : marge, offre, plafond" : "Coût réel, questions et points à vérifier", 35],
          ["Rédaction du rapport", 50],
        ] as [string, number][]);
  const actuelle = etapes.reduce((k, [, t], i) => (sec >= (t as number) ? i : k), 0);
  // progression ressentie : rapide au début, jamais 100 % avant la fin réelle
  const duree = phase === "import" ? 45 : 60;
  const pct = Math.min(95, Math.round((1 - Math.exp(-sec / (duree / 2))) * 100));

  return (
    <div className="grid gap-5" role="status" aria-live="polite">
      <div className="grid gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-xl font-semibold">{phase === "import" ? "Lecture de l'annonce…" : "Analyse en cours…"}</p>
          <span className="num text-sm text-ink-3">{sec} s</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full rounded-full bg-gradient-to-r from-o to-o2 transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
        <ol className="grid gap-1.5 text-sm">
          {etapes.map(([l], i) => (
            <li key={l as string} className={cx("flex items-center gap-2.5", i < actuelle ? "text-ink-3" : i === actuelle ? "text-ink" : "text-ink-3/60")}>
              {i < actuelle ? (
                <span className="grid size-5 place-items-center rounded-full bg-ok/20 text-[11px] text-ok" aria-hidden="true">✓</span>
              ) : i === actuelle ? (
                <span className="size-5 animate-spin rounded-full border-2 border-o/30 border-t-o" aria-hidden="true" />
              ) : (
                <span className="size-5 rounded-full border border-line-2" aria-hidden="true" />
              )}
              {l}
            </li>
          ))}
        </ol>
        <p className="text-xs text-ink-3">{phase === "import" ? "Environ 30 à 60 secondes, puis l'analyse démarre toute seule." : "Environ une minute. Le rapport s'enregistre tout seul dans vos rapports."}</p>
      </div>

      {apercu && (
        <section className="grid gap-3 rounded-2xl border border-o/30 bg-o/5 p-4" aria-label="Premier aperçu">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-o2">Premier aperçu, en attendant le rapport</p>
          <p className="font-medium">
            {apercu.titre || "Votre annonce"}
            <span className="block text-sm font-normal text-ink-3">{[apercu.annee, apercu.km != null ? `${apercu.km.toLocaleString("fr-FR")} km` : null, apercu.energie, apercu.boite, apercu.ville].filter(Boolean).join(" · ")}</span>
          </p>
          {apercu.cote && apercu.prix ? (
            <div className="grid gap-1">
              <p>
                Prix <b className="num">{eur(apercu.prix)}</b> · cote <b className="num">{eur(apercu.cote.mediane)}</b>
                <span className="text-sm text-ink-3"> ({apercu.cote.n} annonces comparables, moitié entre {eur(apercu.cote.p25)} et {eur(apercu.cote.p75)})</span>
              </p>
              {apercu.ecart != null && (
                <p className={cx("font-semibold", apercu.ecart >= apercu.cote.mediane * 0.05 ? "text-ok" : apercu.ecart <= -apercu.cote.mediane * 0.05 ? "text-warn" : "text-ink-2")}>
                  {Math.abs(apercu.ecart) < apercu.cote.mediane * 0.03 ? "Au prix du marché" : apercu.ecart > 0 ? `${eur(apercu.ecart)} sous la cote` : `${eur(-apercu.ecart)} au-dessus de la cote`}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-3">Cote en cours de calcul par l&apos;IA (pas assez d&apos;annonces comparables en base pour ce modèle).</p>
          )}
          {apercu.fiab.k === "eviter" ? (
            <p className="text-sm text-warn">Moteur ou boîte à surveiller : {apercu.fiab.pourquoi[0]}</p>
          ) : apercu.fiab.k === "fiable" ? (
            <p className="text-sm text-ok">{apercu.fiab.modele ?? "Modèle"} : réputé fiable dans cette tranche.</p>
          ) : null}
          {apercu.defauts.length > 0 && (
            <ul className="grid gap-1 text-sm">
              {apercu.defauts.map((d) => (
                <li key={d.l} className={d.piege ? "text-bad" : "text-ink-2"}>• {d.l}</li>
              ))}
            </ul>
          )}
          {apercu.papiers.length > 0 && <p className="text-xs text-ink-3">{apercu.papiers.join(" · ")}</p>}
        </section>
      )}

      <div className="rounded-2xl border border-line p-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-3">Le conseil du moment</p>
        <p key={conseil} className="mt-1 text-ink-2">{CONSEILS[conseil]}</p>
      </div>
    </div>
  );
}
