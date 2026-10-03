"use client";
import { useId, useState } from "react";

const PEURS = [
  { q: "« Et si je me faisais arnaquer ? »", d: "Faux vendeur, compteur trafiqué, voiture gagée, chèque de banque frauduleux : ces pièges existent.", t: "Quelques vérifications suffisent", r: "HistoVec, certificat de non-gage, papiers à récupérer et 5 questions à poser avant de vous déplacer. L'outil signale les annonces à risque." },
  { q: "« Et si j'achetais une voiture pourrie ? »", d: "Un embrayage à refaire efface presque toute votre marge.", t: "Les moteurs à fuir et l'essai de 10 minutes", r: "La liste des moteurs et boîtes à éviter, et quoi tester moteur froid. L'outil chiffre chaque défaut écrit dans l'annonce." },
  { q: "« Je ne sais pas combien payer. »", d: "Sans prix maximum calculé avant d'appeler, on négocie au feeling.", t: "Votre prix maximum en une ligne", r: "Revente réaliste − travaux − frais − votre marge. Au-dessus, vous passez votre tour. L'outil le calcule pour chaque annonce." },
];

/** Cartes « peur → solution » : un bouton révèle la réponse (accessible au clavier et au toucher). */
export function Peurs() {
  const [ouvertes, setOuvertes] = useState<number[]>([]);
  const base = useId();
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {PEURS.map((p, i) => {
        const o = ouvertes.includes(i);
        return (
          <li key={p.q} className={`carte flex flex-col p-6 transition ${o ? "border-o/50" : ""}`}>
            <h3 className="font-display text-xl font-semibold">{p.q}</h3>
            <p className="mt-2 text-ink-2">{p.d}</p>
            <div id={`${base}-${i}`} hidden={!o} className="mt-4 rounded-2xl border border-ok/30 bg-ok/10 p-4">
              <b className="text-ok">{p.t}</b>
              <p className="mt-1 text-sm text-ink-2">{p.r}</p>
            </div>
            <button
              type="button"
              aria-expanded={o}
              aria-controls={`${base}-${i}`}
              onClick={() => setOuvertes((l) => (o ? l.filter((x) => x !== i) : [...l, i]))}
              className="mt-auto w-fit pt-5 text-sm font-medium text-o2 underline-offset-4 hover:underline"
            >
              {o ? "Masquer" : "Voir ce qui vous protège"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
