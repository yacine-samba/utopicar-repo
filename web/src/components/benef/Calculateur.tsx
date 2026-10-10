"use client";
import { useId, useState } from "react";

type Scenario = { l: string; a: number; f: number; r: number };

const SCENARIOS: Scenario[] = [
  { l: "Clio IV bien achetée", a: 5000, f: 630, r: 6300 },
  { l: "Embrayage oublié", a: 5000, f: 1430, r: 6300 },
  { l: "Petite citadine", a: 2800, f: 450, r: 3700 },
];
const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")}\u00a0€`;

function Curseur({ label, aide, v, min, max, pas, onChange }: { label: string; aide: string; v: number; min: number; max: number; pas: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-medium">
          {label}
          <span className="block text-sm font-normal text-ink-3">{aide}</span>
        </label>
        <output htmlFor={id} className="num font-display text-xl font-semibold">
          {eur(v)}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={pas} value={v} onChange={(e) => onChange(+e.target.value)} className="w-full accent-[#ff5a1f]" aria-valuetext={eur(v)} />
    </div>
  );
}

/** Calculateur de marge : achat, frais, revente → bénéfice net. Le premier exemple donne les valeurs de départ. */
export function Calculateur({ scenarios = SCENARIOS }: { scenarios?: Scenario[] }) {
  const [a, setA] = useState(scenarios[0].a);
  const [f, setF] = useState(scenarios[0].f);
  const [r, setR] = useState(scenarios[0].r);
  const net = r - a - f;
  const ton = net >= 500 ? "text-ok" : net >= 0 ? "text-warn" : "text-bad";
  const verdict = net >= 500 ? "Bonne affaire" : net >= 0 ? "Marge trop faible" : "Vous perdez de l'argent";
  // la revente découpée en achat, frais et marge (même image que l'en-tête de la page) ; en cas de perte, l'échelle est le coût total
  const base = Math.max(r, a + f, 1);
  const part = (v: number) => `${(Math.max(0, v) / base) * 100}%`;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="carte grid gap-6 p-6 sm:p-7">
        <Curseur label="Prix d'achat négocié" aide="Ce que vous payez au vendeur" v={a} min={1000} max={12000} pas={100} onChange={setA} />
        <Curseur label="Frais et remise en état" aide="Carte grise, pneus, CT, nettoyage, trajet" v={f} min={0} max={3000} pas={10} onChange={setF} />
        <Curseur label="Prix de revente" aide="Ce que paie votre acheteur" v={r} min={1000} max={15000} pas={100} onChange={setR} />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
          {scenarios.map((s) => (
            <button key={s.l} type="button" onClick={() => (setA(s.a), setF(s.f), setR(s.r))} className="rounded-full border border-line-2 px-3.5 py-1.5 text-sm text-ink-2 hover:border-o/50 hover:text-ink">
              {s.l}
            </button>
          ))}
        </div>
      </div>
      <div className="carte p-6 sm:p-7" aria-live="polite">
        <h3 className="font-display text-lg font-semibold">Votre ticket de caisse</h3>
        <ul className="mt-4 divide-y divide-line">
          <li className="flex justify-between py-2.5">
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-o" aria-hidden="true" />Achat négocié</span> <span className="num">{eur(a)}</span>
          </li>
          <li className="flex justify-between py-2.5">
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-warn" aria-hidden="true" />Frais et remise en état</span> <span className="num">− {eur(f)}</span>
          </li>
          <li className="flex justify-between py-2.5">
            Revente <span className="num">{eur(r)}</span>
          </li>
        </ul>
        <div className="mt-4 flex h-3.5 overflow-hidden rounded-full bg-glass" aria-hidden="true">
          <span className="bg-o transition-[width] duration-300" style={{ width: part(a) }} />
          <span className="bg-warn transition-[width] duration-300" style={{ width: part(f) }} />
          <span className={`transition-[width] duration-300 ${net >= 0 ? "bg-ok" : ""}`} style={{ width: part(net) }} />
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-line-2 pt-4">
          <b className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-ok" aria-hidden="true" />Bénéfice net</b>
          <b className={`num font-display text-3xl ${ton}`}>{eur(net)}</b>
        </div>
        <p className={`mt-1 text-right text-sm ${ton}`}>{verdict}</p>
        {net > 0 && (
          <p className="mt-5 text-sm text-ink-2">
            Pour 500 € par mois : <b>{Math.ceil(500 / net)}</b> voiture(s). Pour 1 000 € : <b>{Math.ceil(1000 / net)}</b>.
          </p>
        )}
        <p className="mt-3 text-xs text-ink-3">Avant impôts et cotisations. Le guide explique quel statut choisir.</p>
      </div>
    </div>
  );
}
