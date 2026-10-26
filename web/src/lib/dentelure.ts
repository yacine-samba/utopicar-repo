/** Bord découpé en dents de scie, comme un ticket arraché : un polygone pour `clip-path`.
    `haut` / `bas` : les bords à découper ; `dents` : nombre de dents sur la largeur ; `profondeur` en pixels. */
export function dentelure({ haut = false, bas = true, dents = 28, profondeur = 10 }: { haut?: boolean; bas?: boolean; dents?: number; profondeur?: number } = {}) {
  const pts: string[] = [];
  const pas = 100 / dents;
  if (haut) for (let i = 0; i <= dents * 2; i++) pts.push(`${(i * pas) / 2}% ${i % 2 ? `${profondeur}px` : "0px"}`);
  else pts.push("0% 0%", "100% 0%");
  if (bas) for (let i = dents * 2; i >= 0; i--) pts.push(`${(i * pas) / 2}% ${i % 2 ? `calc(100% - ${profondeur}px)` : "100%"}`);
  else pts.push("100% 100%", "0% 100%");
  return `polygon(${pts.join(", ")})`;
}
