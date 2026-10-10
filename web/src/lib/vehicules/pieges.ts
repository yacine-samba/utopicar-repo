/** Mots qui signalent une annonce piège (rédhibitoire ou hors cote) : pièces, moteur ou boîte HS, épave, accident, grêle…
    À tester sur un texte en minuscules et sans accents. */
export const PIEGES = /\b(pour pieces|moteur hs|boite hs|joint de culasse|non roulant|epave|accidente|sinistree?|grelee?s?|sans ct|export|marchand|vendu en l.etat)\b/;

/** Vrai si le texte (titre, description) annonce un piège. */
export const estPiege = (texte: string | null | undefined) =>
  !!texte && PIEGES.test(texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase());
