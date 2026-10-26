/* eslint-disable @next/next/no-img-element -- photos des annonces de démonstration, servies en local et compressées */
import type { CSSProperties } from "react";
import { EXEMPLES, euros, srcSetDemo, type Exemple } from "@/lib/demo";

/* Trois vraies annonces, trois verdicts différents : l'outil sait aussi dire non. Une grande photo, le verdict en
   toutes lettres et en couleur, puis le prix face à la cote et la raison, sans cadre autour. */

const TON = { ok: "text-ok", warn: "text-warn", bad: "text-bad" } as const;

function raison(x: Exemple) {
  const cote = x.lignes[0].v ?? x.prix;
  if (x.ton === "bad") return `Moteur ${x.fiab.moteur} à éviter, et ${euros(x.prix - cote)} au-dessus de la cote.`;
  const ecart = x.prix - cote;
  return ecart < 0 ? `${euros(-ecart)} sous la cote, défauts compris.` : `${euros(ecart)} au-dessus de la cote, moteur fiable.`;
}

export function Verdicts() {
  const liste = [EXEMPLES.clio, EXEMPLES.yaris, EXEMPLES.p208];
  return (
    <ul className="grid gap-12 md:grid-cols-3 md:gap-8">
      {liste.map((x, i) => {
        const cote = x.lignes[0].v ?? x.prix;
        return (
          <li key={x.titre} className="apparait grid content-start gap-4" style={{ "--i": i } as CSSProperties}>
            <div className="overflow-hidden rounded-xl">
              <img src={x.photos[0]} srcSet={srcSetDemo(x.photos[0])} sizes="(max-width: 768px) 92vw, 360px" alt={`${x.titre}, photo de l'annonce`} width={800} height={600} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition duration-700 ease-out hover:scale-[1.03]" />
            </div>
            <p className={`font-display text-[clamp(32px,3vw,44px)] font-medium leading-none tracking-[-0.03em] ${TON[x.ton]}`}>{x.verdict}</p>
            <div className="grid gap-1 text-[17px]">
              <p className="font-medium">{x.titre}</p>
              <p className="num text-ink-2">
                {euros(x.prix)} demandés · cote {euros(cote)}
              </p>
              <p className="text-ink-2">{raison(x)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
