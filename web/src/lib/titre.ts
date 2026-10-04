/** « Audi A3 Audi A3 Sportback » → « Audi A3 Sportback » : retire une suite de mots répétée juste après elle-même
    (la marque et le modèle sont souvent repris au début de la version). */
export function titreVehicule(s: string | null | undefined): string {
  const m = (s ?? "").trim().split(/\s+/).filter(Boolean);
  const eg = (a: string, b: string) => a.localeCompare(b, "fr", { sensitivity: "base" }) === 0;
  for (let i = 0; i < m.length; i++)
    for (let k = Math.floor((m.length - i) / 2); k >= 1; k--)
      if (m.slice(i, i + k).every((x, j) => eg(x, m[i + k + j]))) {
        m.splice(i + k, k);
        k = Math.floor((m.length - i) / 2) + 1;
      }
  return m.join(" ");
}
