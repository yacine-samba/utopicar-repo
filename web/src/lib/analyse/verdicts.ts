/* Verdicts de l'analyse, en mots simples, et lecture des anciens verdicts enregistrés (GO / NO GO, bon / cher…). */

export type VerdictCode = "excellente" | "bonne" | "negocier" | "creuser" | "eviter";
export type TonVerdict = "ok" | "o" | "warn" | "bad" | "neutre";

export const VERDICTS: Record<VerdictCode, { l: string; ton: TonVerdict; ordre: number }> = {
  excellente: { l: "Très bonne affaire", ton: "ok", ordre: 0 },
  bonne: { l: "Bonne affaire", ton: "ok", ordre: 1 },
  negocier: { l: "À négocier", ton: "o", ordre: 2 },
  creuser: { l: "À creuser", ton: "warn", ordre: 3 },
  eviter: { l: "À éviter", ton: "bad", ordre: 4 },
};

/** Anciens verdicts (avant l'analyse 2027), pour les listes de rapports déjà enregistrés. */
const ANCIENS: Record<string, VerdictCode> = {
  GO: "bonne", "GO SI NÉGOCIÉ": "negocier", "GO EN MANDAT UNIQUEMENT": "creuser", "À SURVEILLER": "creuser", "NO GO": "eviter",
  bon: "bonne", correct: "bonne", cher: "negocier", prudence: "creuser", eviter: "eviter", inconnu: "creuser",
};

/** Code d'un verdict enregistré : nouveau libellé, code, ou ancien verdict. */
export function codeVerdict(v: string | null | undefined): VerdictCode | null {
  if (!v) return null;
  if (v in VERDICTS) return v as VerdictCode;
  const parLibelle = (Object.keys(VERDICTS) as VerdictCode[]).find((k) => VERDICTS[k].l === v);
  return parLibelle ?? ANCIENS[v] ?? null;
}

export const infoVerdict = (v: string | null | undefined) => {
  const c = codeVerdict(v);
  return c ? { code: c, ...VERDICTS[c] } : { code: null, l: v || "—", ton: "neutre" as TonVerdict, ordre: 5 };
};

/** Verdicts qui valent un contact avec le vendeur (tableaux de bord, « meilleures affaires »). */
export const estFavorable = (v: string | null | undefined) => {
  const c = codeVerdict(v);
  return c === "excellente" || c === "bonne" || c === "negocier";
};

/** Valeurs enregistrées en base pour un verdict (filtre SQL `in`) : son libellé et les anciens verdicts équivalents. */
export const valeursStockees = (c: VerdictCode) => [VERDICTS[c].l, ...Object.keys(ANCIENS).filter((k) => ANCIENS[k] === c)];

/** Valeurs enregistrées des verdicts favorables, anciens compris. */
export const VERDICTS_FAVORABLES = (["excellente", "bonne", "negocier"] as VerdictCode[]).flatMap(valeursStockees);

export const CONSEILS: Record<VerdictCode, string> = {
  excellente: "Écrivez au vendeur sans tarder.",
  bonne: "À confirmer pendant la visite.",
  negocier: "Intéressante si le prix baisse.",
  creuser: "Des réponses manquent : questions à poser.",
  eviter: "Risque ou prix trop élevé.",
};

/** Classes d'une pastille de verdict (listes, cartes). */
export const PASTILLE: Record<TonVerdict, string> = {
  ok: "border-ok/35 bg-ok/10 text-ok",
  o: "border-o/40 bg-o/10 text-o2",
  warn: "border-warn/35 bg-warn/10 text-warn",
  bad: "border-bad/35 bg-bad/10 text-bad",
  neutre: "border-line-2 bg-glass text-ink-2",
};
export const TEXTE_TON: Record<TonVerdict, string> = { ok: "text-ok", o: "text-o2", warn: "text-warn", bad: "text-bad", neutre: "text-ink-3" };
