/* Vendeur d'une annonce : prénom et type donnés par Leboncoin, numéro de téléphone seulement s'il est écrit dans
   l'annonce elle-même (Leboncoin ne le donne qu'à une personne connectée qui clique sur « Voir le numéro »). */

export type Vendeur = { nom: string | null; type: "particulier" | "pro" | null; aTel: boolean; telephone: string | null };

/** Numéros français écrits dans le texte (06 12 34 56 78, 06.12.34.56.78, +33 6 12 34 56 78…), mis au format 06 12 34 56 78. */
export function telephonesDans(texte: string): string[] {
  const out = new Set<string>();
  for (const m of texte.matchAll(/(?<![\d])(?:\+33[\s.-]?|0033[\s.-]?|0)([1-79])(?:[\s.-]?\d{2}){4}(?![\d])/g)) {
    const chiffres = m[0].replace(/\D/g, "").replace(/^(0033|33)/, "0");
    if (chiffres.length === 10) out.add(chiffres.replace(/(\d{2})(?=\d)/g, "$1 ").trim());
  }
  return [...out].slice(0, 3);
}

export function vendeurDe(brut: unknown, texte: string): Vendeur | null {
  const v = brut && typeof brut === "object" ? (brut as Record<string, unknown>) : {};
  const tel = telephonesDans(texte)[0] ?? (typeof v.telephone === "string" ? telephonesDans(v.telephone)[0] ?? null : null);
  const nom = typeof v.nom === "string" && v.nom.trim() ? v.nom.trim().slice(0, 60) : null;
  const type = v.type === "pro" || v.type === "particulier" ? v.type : /vendeur professionnel/i.test(texte) ? "pro" : /vendeur\s*:\s*particulier/i.test(texte) ? "particulier" : null;
  if (!nom && !type && !tel && !v.aTel) return null;
  return { nom, type, aTel: Boolean(v.aTel) || !!tel, telephone: tel };
}
