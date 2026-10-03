"use client";
import { useMemo, useState } from "react";
import { cx } from "@/lib/cx";
import type { PointCote } from "@/lib/vehicules/types";

/* Nuage des annonces d'une génération (prix selon le kilométrage ou l'année), coloré par année, version, boîte, vendeur ou options,
   avec la voiture placée, les annonces du relevé et la courbe de cote. Dessin SVG, sans bibliothèque. */

export type Repere = { km: number | null; annee: number | null; prix: number; label: string; ton?: "voiture" | "releve" };
type Axe = "km" | "annee";
type Couleur = "annee" | "version" | "boite" | "vendeur" | "options";

const PALETTE = ["#ff8a4c", "#3ecb7f", "#5aa9ff", "#ffc53d", "#c084fc", "#ff7a7a", "#2dd4bf", "#9ca3af"];
const W = 800, H = 420, G = 56, D = 16, HT = 14, B = 40;
const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
const kmTxt = (v: number) => `${Math.round(v / 1000).toLocaleString("fr-FR")} k km`;

function graduations(lo: number, hi: number, n = 5) {
  const pas0 = (hi - lo) / n;
  const p = Math.pow(10, Math.floor(Math.log10(pas0 || 1)));
  const pas = [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= pas0) ?? p * 10;
  const out: number[] = [];
  for (let x = Math.ceil(lo / pas) * pas; x <= hi; x += pas) out.push(Math.round(x * 100) / 100);
  return out;
}

export function NuageCote({ points, reperes = [], courbe = [], titre }: { points: PointCote[]; reperes?: Repere[]; courbe?: { km: number; P: number | null }[]; titre: string }) {
  const [axe, setAxe] = useState<Axe>("km");
  const [coul, setCoul] = useState<Couleur>("annee");
  const [masques, setMasques] = useState<Set<string>>(new Set());
  const [survol, setSurvol] = useState<number | null>(null);

  const cat = (p: PointCote): string =>
    coul === "version" ? p.segs[0] ?? "Classique"
    : coul === "boite" ? (p.auto ? "Automatique" : "Manuelle")
    : coul === "vendeur" ? (p.pro ? "Professionnel" : "Particulier")
    : coul === "options" ? (p.eq >= 2 ? "Bien équipée" : p.eq === 1 ? "Quelques options" : "Sans option relevée")
    : String(p.annee);

  const annees = useMemo(() => points.map((p) => p.annee), [points]);
  const aMin = Math.min(...annees), aMax = Math.max(...annees);
  const categories = useMemo(() => {
    if (coul === "annee") return [];
    const n = new Map<string, number>();
    points.forEach((p) => n.set(cat(p), (n.get(cat(p)) ?? 0) + 1));
    return [...n.entries()].sort((a, b) => b[1] - a[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, coul]);
  const couleurDe = (p: PointCote) => {
    if (coul === "annee") {
      const t = aMax > aMin ? (p.annee - aMin) / (aMax - aMin) : 0.5;
      return `hsl(${Math.round(200 - t * 180)} 85% 60%)`;
    }
    const i = categories.findIndex(([k]) => k === cat(p));
    return PALETTE[Math.min(i, PALETTE.length - 1)];
  };
  const visibles = points.filter((p) => coul === "annee" || !masques.has(cat(p)));

  const xs = [...visibles.map((p) => (axe === "km" ? p.km : p.annee)), ...reperes.map((r) => (axe === "km" ? r.km : r.annee)).filter((x): x is number => x != null)];
  const ys = [...visibles.map((p) => p.prix), ...reperes.map((r) => r.prix), ...courbe.map((c) => c.P ?? 0).filter(Boolean)];
  if (!xs.length || !ys.length) return <p className="text-sm text-ink-3">Pas de point à afficher.</p>;
  const x0 = axe === "km" ? 0 : Math.min(...xs) - 0.5, x1 = Math.max(...xs) * (axe === "km" ? 1.04 : 1) + (axe === "km" ? 0 : 0.5);
  const y0 = Math.max(0, Math.min(...ys) * 0.9), y1 = Math.max(...ys) * 1.06;
  const px = (x: number) => G + ((x - x0) / (x1 - x0 || 1)) * (W - G - D);
  const py = (y: number) => H - B - ((y - y0) / (y1 - y0 || 1)) * (H - B - HT);
  const gx = axe === "km" ? graduations(x0, x1) : graduations(x0, x1, Math.min(10, Math.ceil(x1 - x0)));
  const gy = graduations(y0, y1);
  const courbeOk = axe === "km" && courbe.filter((c) => c.P).length >= 2;
  const p = survol != null ? visibles[survol] : null;

  return (
    <figure className="grid gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-display font-semibold">{titre}</span>
        <span className="flex flex-wrap gap-2 text-sm">
          <select aria-label="Axe horizontal" value={axe} onChange={(e) => setAxe(e.target.value as Axe)} className="rounded-lg border border-line-2 bg-black/30 px-2 py-1.5">
            <option value="km">Prix selon le kilométrage</option>
            <option value="annee">Prix selon l&apos;année</option>
          </select>
          <select aria-label="Couleur des points" value={coul} onChange={(e) => { setCoul(e.target.value as Couleur); setMasques(new Set()); }} className="rounded-lg border border-line-2 bg-black/30 px-2 py-1.5">
            <option value="annee">Couleur : année</option>
            <option value="version">Couleur : version</option>
            <option value="options">Couleur : options</option>
            <option value="boite">Couleur : boîte</option>
            <option value="vendeur">Couleur : vendeur</option>
          </select>
        </span>
      </figcaption>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img" aria-label={`${titre} : ${visibles.length} annonces, prix de ${eur(Math.min(...visibles.map((v) => v.prix)))} à ${eur(Math.max(...visibles.map((v) => v.prix)))}`} onMouseLeave={() => setSurvol(null)}>
          {gy.map((y) => (
            <g key={"y" + y}>
              <line x1={G} x2={W - D} y1={py(y)} y2={py(y)} stroke="currentColor" className="text-line" />
              <text x={G - 6} y={py(y) + 4} textAnchor="end" className="fill-ink-3 text-[11px]">{y >= 1000 ? `${Math.round(y / 1000)} k€` : `${y} €`}</text>
            </g>
          ))}
          {gx.map((x) => (
            <text key={"x" + x} x={px(x)} y={H - B + 18} textAnchor="middle" className="fill-ink-3 text-[11px]">{axe === "km" ? `${Math.round(x / 1000)} k` : x}</text>
          ))}
          <text x={W - D} y={H - 6} textAnchor="end" className="fill-ink-3 text-[11px]">{axe === "km" ? "kilométrage" : "année"}</text>
          {courbeOk && (
            <polyline fill="none" stroke="#ff5a1f" strokeWidth="2.5" strokeDasharray="6 5" points={courbe.filter((c) => c.P).map((c) => `${px(c.km)},${py(c.P!)}`).join(" ")} />
          )}
          {visibles.map((v, i) => (
            <circle key={i} cx={px(axe === "km" ? v.km : v.annee + ((i % 7) - 3) * 0.05)} cy={py(v.prix)} r={survol === i ? 6 : 3.6} fill={couleurDe(v)} fillOpacity={survol === i ? 1 : 0.7} stroke={survol === i ? "#fff" : "none"} onMouseEnter={() => setSurvol(i)} onClick={() => setSurvol(i)} />
          ))}
          {reperes.map((r, i) => {
            const x = axe === "km" ? r.km : r.annee;
            if (x == null) return null;
            const voiture = r.ton !== "releve";
            return (
              <g key={"r" + i}>
                {voiture ? (
                  <path d={`M${px(x)},${py(r.prix) - 11} L${px(x) + 3.5},${py(r.prix) - 3.5} L${px(x) + 11},${py(r.prix) - 3} L${px(x) + 5},${py(r.prix) + 2.5} L${px(x) + 7},${py(r.prix) + 10} L${px(x)},${py(r.prix) + 5.5} L${px(x) - 7},${py(r.prix) + 10} L${px(x) - 5},${py(r.prix) + 2.5} L${px(x) - 11},${py(r.prix) - 3} L${px(x) - 3.5},${py(r.prix) - 3.5} Z`} fill="#fff" stroke="#ff5a1f" strokeWidth="2" />
                ) : (
                  <rect x={px(x) - 5} y={py(r.prix) - 5} width="10" height="10" fill="none" stroke="#fff" strokeWidth="2" transform={`rotate(45 ${px(x)} ${py(r.prix)})`} />
                )}
                <title>{r.label}</title>
              </g>
            );
          })}
        </svg>
        {p && (
          <div className="pointer-events-none absolute right-2 top-2 max-w-[70%] rounded-xl border border-line-2 bg-bg0/95 p-3 text-xs shadow-lg" role="status">
            <p className="font-medium text-ink">{p.lib || "Annonce"}</p>
            <p className="num mt-1 text-ink-2">
              <b className="text-ink">{eur(p.prix)}</b> · {p.annee} · {kmTxt(p.km)}
              {p.ch ? ` · ${p.ch} ch` : ""} · {p.auto ? "auto" : "manuelle"} · {p.pro ? "pro" : "particulier"}
            </p>
            {(p.segs.length > 0 || p.eq > 0) && <p className="mt-1 text-ink-3">{[...p.segs, p.eq ? `${p.eq} option${p.eq > 1 ? "s" : ""} relevée${p.eq > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ")}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
        {coul === "annee" ? (
          <span className="flex items-center gap-2">
            {aMin}
            <span className="h-2 w-28 rounded-full" style={{ background: "linear-gradient(90deg, hsl(200 85% 60%), hsl(110 85% 60%), hsl(20 85% 60%))" }} aria-hidden="true" />
            {aMax}
          </span>
        ) : (
          categories.map(([k, n], i) => (
            <button key={k} type="button" aria-pressed={!masques.has(k)} onClick={() => setMasques((s) => { const t = new Set(s); if (t.has(k)) t.delete(k); else t.add(k); return t; })}
              className={cx("flex items-center gap-1.5 rounded-full border px-2.5 py-1", masques.has(k) ? "border-line text-ink-3 opacity-50" : "border-line-2 text-ink-2")}>
              <span className="size-2.5 rounded-full" style={{ background: PALETTE[Math.min(i, PALETTE.length - 1)] }} aria-hidden="true" />
              {k} <span className="num">({n})</span>
            </button>
          ))
        )}
        {reperes.some((r) => r.ton !== "releve") && <span className="ml-auto flex items-center gap-1.5"><span aria-hidden="true">★</span> votre voiture</span>}
        {reperes.some((r) => r.ton === "releve") && <span className="flex items-center gap-1.5"><span aria-hidden="true">◇</span> annonces collées</span>}
        {courbeOk && <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-dashed border-o" aria-hidden="true" /> cote selon le km</span>}
      </div>
    </figure>
  );
}
