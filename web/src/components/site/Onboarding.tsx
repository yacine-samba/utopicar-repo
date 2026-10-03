"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { OFFRES, prixTxt, type OffreId } from "@/lib/offres";

/* Questions-réponses d'accueil : quelques choix, puis une recommandation claire.
   Les réponses restent dans le navigateur et pré-remplissent l'inscription. */

type Choix = { v: string; l: string; s?: string };
type Etape = { id: string; q: string; aide?: string; choix: Choix[] };

const DEPART: Etape = {
  id: "but",
  q: "Qu'est-ce qui vous amène ?",
  aide: "Trois questions au plus, pour vous montrer ce qui vous sera utile.",
  choix: [
    { v: "achat", l: "J'achète une voiture pour moi", s: "Je veux savoir si une annonce vaut le coup" },
    { v: "lancer", l: "Je veux me lancer dans l'achat-revente", s: "Acheter, préparer, revendre avec une marge" },
    { v: "pro", l: "Je fais déjà de l'achat-revente", s: "Marchand, garagiste ou revendeur" },
    { v: "curieux", l: "Je découvre", s: "Montrez-moi d'abord comment ça marche" },
  ],
};

const SUITES: Record<string, Etape[]> = {
  achat: [
    { id: "ou", q: "Où en êtes-vous ?", choix: [{ v: "annonce", l: "J'ai une annonce en vue" }, { v: "compare", l: "J'hésite entre plusieurs annonces" }, { v: "debut", l: "Je commence à chercher" }] },
    { id: "connaissance", q: "Vous vous y connaissez en voitures ?", aide: "Aucune mauvaise réponse : on adapte les explications.", choix: [{ v: "peu", l: "Pas vraiment" }, { v: "moyen", l: "Un peu" }, { v: "bien", l: "Plutôt bien" }] },
    { id: "budget", q: "Quel est votre budget ?", choix: [{ v: "5", l: "Moins de 5 000 €" }, { v: "10", l: "De 5 000 à 10 000 €" }, { v: "20", l: "De 10 000 à 20 000 €" }, { v: "plus", l: "Plus de 20 000 €" }] },
  ],
  lancer: [
    { id: "budget", q: "Quel budget de départ ?", aide: "Pour la première voiture, réserve comprise.", choix: [{ v: "2", l: "Moins de 2 000 €" }, { v: "5", l: "De 2 000 à 5 000 €" }, { v: "10", l: "De 5 000 à 10 000 €" }, { v: "plus", l: "Plus de 10 000 €" }] },
    { id: "rythme", q: "Combien de voitures par mois visez-vous ?", choix: [{ v: "1", l: "Une pour commencer" }, { v: "3", l: "Deux ou trois" }, { v: "plus", l: "Plus de trois" }] },
  ],
  pro: [
    { id: "volume", q: "Combien de voitures passent par vous chaque mois ?", choix: [{ v: "3", l: "Une à trois" }, { v: "10", l: "Quatre à dix" }, { v: "plus", l: "Plus de dix" }] },
    { id: "besoin", q: "Qu'est-ce qui vous ferait gagner le plus de temps ?", choix: [{ v: "tri", l: "Trier les annonces plus vite" }, { v: "reprise", l: "Estimer des reprises" }, { v: "stock", l: "Suivre mon stock et mes marges" }] },
  ],
  curieux: [],
};

type Reco = { titre: string; texte: string; offre: OffreId | null; conseils: string[]; principal: { href: string; l: string }; second: { href: string; l: string } };

function recommander(r: Record<string, string>): Reco {
  if (r.but === "achat") {
    const novice = r.connaissance === "peu" || r.budget === "20" || r.budget === "plus";
    const o: OffreId = r.ou === "compare" ? (novice ? "serenite" : "essentiel") : novice ? "serenite" : "gratuit";
    const conseils = [
      r.ou === "debut" ? "Collez la première annonce qui vous plaît : vous verrez tout de suite ce qu'il faut regarder." : "Collez l'annonce : verdict, coût réel et points à vérifier en quelques secondes.",
      r.connaissance === "peu" ? "Pas besoin de connaître la mécanique : tout est expliqué simplement, sans jargon." : "Vous verrez aussi la fiabilité du moteur et le prix du marché.",
      novice ? "Sérénité vous dit quoi contrôler sur place, comment négocier et s'il vaut mieux venir accompagné." : "Votre première analyse est offerte, sans carte bancaire.",
    ];
    return {
      titre: o === "gratuit" ? "Commencez par l'analyse offerte" : `La formule ${OFFRES[o].nom} vous correspond`,
      texte: o === "gratuit" ? "Une analyse complète de votre annonce, présentée simplement." : `${OFFRES[o].accroche}, à ${prixTxt(OFFRES[o].prix)} par mois, sans engagement. Votre première analyse reste offerte.`,
      offre: o,
      conseils,
      principal: { href: "/analyse", l: "Analyser mon annonce" },
      second: { href: "/tarifs#particuliers", l: "Voir les formules" },
    };
  }
  if (r.but === "lancer") {
    const o: OffreId = r.rythme === "1" ? "starter" : "croissance";
    return {
      titre: `Benef ${OFFRES[o].nom} pour vous lancer`,
      texte: `${OFFRES[o].accroche}, à ${prixTxt(OFFRES[o].prix)} par mois. Chaque annonce est chiffrée : marge nette, prix d'offre et prix à ne pas dépasser.`,
      offre: o,
      conseils: [
        r.budget === "2" ? "Avec moins de 2 000 €, commencez par le mandat de vente : le guide vous explique comment, sans rien acheter." : "Visez une citadine fiable : le guide liste les modèles à prendre et les moteurs à fuir.",
        "Calculez votre prix maximum avant d'appeler : l'outil le fait pour chaque annonce.",
        "Le guide « Votre première revente » est inclus dans toutes les formules Benef.",
      ],
      principal: { href: "/benef", l: "Découvrir Benef" },
      second: { href: "/tarifs#benef", l: "Voir les formules Benef" },
    };
  }
  if (r.but === "pro") {
    const o: OffreId = r.besoin === "stock" || r.volume === "plus" || r.volume === "10" ? "pro" : "croissance";
    return {
      titre: `Benef ${OFFRES[o].nom} pour votre activité`,
      texte: `${OFFRES[o].accroche}, à ${prixTxt(OFFRES[o].prix)} par mois, sans engagement.`,
      offre: o,
      conseils: [
        r.besoin === "tri" ? "Ouvrez seulement les annonces sous la cote : le verdict et la marge sortent en quelques secondes." : r.besoin === "reprise" ? "Pour une reprise, collez l'annonce ou la description : vous obtenez une cote chiffrée à montrer au client." : "Le parc suit vos achats, vos frais et vos ventes, avec la marge réelle de chaque voiture.",
        "Rapports complets par défaut, synthèse en un clic quand vous êtes pressé.",
        "Résiliable à tout moment depuis votre compte.",
      ],
      principal: { href: "/tarifs#benef", l: `Choisir ${OFFRES[o].nom}` },
      second: { href: "/benef", l: "Découvrir Benef" },
    };
  }
  return {
    titre: "Voyez l'outil à l'œuvre",
    texte: "La démonstration analyse trois vraies annonces. Ensuite, essayez sur la vôtre : la première analyse est offerte.",
    offre: null,
    conseils: ["Aucune carte bancaire pour essayer.", "Une question ? La FAQ en bas de page répond aux plus fréquentes."],
    principal: { href: "/#demo", l: "Voir la démonstration" },
    second: { href: "/analyse", l: "Analyser une annonce" },
  };
}

const CLE = "utp-onboarding";
const PAGES_AUTO = ["/", "/benef", "/tarifs"];

/** Ouvre l'onboarding depuis n'importe quel bouton du site. */
export const ouvrirOnboarding = () => window.dispatchEvent(new Event("utp:onboarding"));

export function Onboarding() {
  const chemin = usePathname();
  const dlg = useRef<HTMLDialogElement>(null);
  const titre = useRef<HTMLHeadingElement>(null);
  const [rep, setRep] = useState<Record<string, string>>({});
  const [i, setI] = useState(0);

  const etapes = [DEPART, ...(SUITES[rep.but] ?? [])];
  const fini = rep.but != null && i >= etapes.length;
  const total = rep.but ? etapes.length : 4;

  const ouvrir = useCallback(() => {
    setRep({});
    setI(0);
    if (!dlg.current?.open) dlg.current?.showModal();
    // La question reçoit le focus (et non le bouton « Passer ») : elle est lue en premier.
    requestAnimationFrame(() => titre.current?.focus());
  }, []);
  const fermer = useCallback(() => {
    dlg.current?.close();
    try {
      localStorage.setItem(CLE, "vu");
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    const f = () => ouvrir();
    addEventListener("utp:onboarding", f);
    return () => removeEventListener("utp:onboarding", f);
  }, [ouvrir]);

  // Ouverture automatique à la première visite, sur les pages de présentation seulement.
  useEffect(() => {
    if (!PAGES_AUTO.includes(chemin)) return;
    let vu = false;
    try {
      vu = localStorage.getItem(CLE) != null;
    } catch {
      vu = true;
    }
    if (vu || new URLSearchParams(location.search).has("sans-accueil")) return;
    const t = setTimeout(ouvrir, 1200);
    return () => clearTimeout(t);
  }, [chemin, ouvrir]);

  // Le titre de chaque étape reçoit le focus : les lecteurs d'écran annoncent la nouvelle question.
  useEffect(() => {
    if (dlg.current?.open) titre.current?.focus();
  }, [i, fini]);

  function choisir(etape: Etape, v: string) {
    const r = { ...rep, [etape.id]: v };
    setRep(r);
    setI(i + 1);
    if (i + 1 >= [DEPART, ...(SUITES[r.but] ?? [])].length) {
      try {
        localStorage.setItem("utp-profil", JSON.stringify({ ...r, famille: r.but === "achat" ? "particulier" : r.but === "curieux" ? null : "benef" }));
        localStorage.setItem(CLE, "fini");
      } catch {
        /* stockage indisponible */
      }
    }
  }

  const reco = fini ? recommander(rep) : null;
  const etape = etapes[Math.min(i, etapes.length - 1)];
  const avance = fini ? 100 : Math.round((i / total) * 100);

  return (
    <dialog
      ref={dlg}
      aria-labelledby="onb-titre"
      onCancel={(e) => {
        e.preventDefault();
        fermer();
      }}
      onClick={(e) => e.target === dlg.current && fermer()}
      className="m-auto w-[min(640px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-auto rounded-[28px] border border-line-2 bg-[#120e0b] p-0 text-ink shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6 sm:p-9">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-[28px] bg-[radial-gradient(ellipse_at_top,rgba(255,90,31,.22),transparent_70%)]" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <span className="text-sm text-ink-3" aria-live="polite">
            {fini ? "Notre conseil" : `Question ${i + 1} sur ${total}`}
          </span>
          <button type="button" onClick={fermer} className="rounded-full border border-line-2 px-3.5 py-1.5 text-sm text-ink-2 hover:text-ink">
            {fini ? "Fermer" : "Passer"}
          </button>
        </div>
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Avancement" aria-valuemin={0} aria-valuemax={100} aria-valuenow={avance}>
          <div className="h-full rounded-full bg-gradient-to-r from-o to-o2 transition-[width] duration-500" style={{ width: `${avance}%` }} />
        </div>

        {!fini ? (
          <div key={etape.id + i} className="relative mt-7 animate-[entree_.35s_var(--ease-doux)]">
            <h2 id="onb-titre" ref={titre} tabIndex={-1} className="font-display text-[clamp(24px,4vw,32px)] font-semibold leading-tight tracking-tight outline-none">
              {etape.q}
            </h2>
            {etape.aide && <p className="mt-2 text-ink-3">{etape.aide}</p>}
            <ul className="mt-6 grid gap-3">
              {etape.choix.map((c) => (
                <li key={c.v}>
                  <button
                    type="button"
                    onClick={() => choisir(etape, c.v)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-o/60 hover:bg-o/10 ${rep[etape.id] === c.v ? "border-o/60 bg-o/10" : "border-line-2 bg-glass"}`}
                  >
                    <span className="grid flex-1 gap-0.5">
                      <b className="font-display text-[17px] font-semibold">{c.l}</b>
                      {c.s && <span className="text-sm text-ink-3">{c.s}</span>}
                    </span>
                    <span className="text-xl text-o2 transition group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {i > 0 && (
              <button type="button" onClick={() => setI(i - 1)} className="mt-5 text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                ← Question précédente
              </button>
            )}
          </div>
        ) : (
          reco && (
            <div className="relative mt-7 animate-[entree_.35s_var(--ease-doux)]">
              <h2 id="onb-titre" ref={titre} tabIndex={-1} className="font-display text-[clamp(24px,4vw,32px)] font-semibold leading-tight tracking-tight outline-none">
                {reco.titre}
              </h2>
              <p className="mt-2 text-lg text-ink-2">{reco.texte}</p>
              <ul className="mt-5 grid gap-3">
                {reco.conseils.map((c) => (
                  <li key={c} className="flex gap-3">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-ok/15 text-xs text-ok" aria-hidden="true">
                      ✓
                    </span>
                    <span className="text-ink-2">{c}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={reco.principal.href} onClick={fermer} className="btn btn-o">
                  {reco.principal.l} <span aria-hidden="true">→</span>
                </Link>
                <Link href={reco.second.href} onClick={fermer} className="btn">
                  {reco.second.l}
                </Link>
              </div>
              <button type="button" onClick={() => setI(i - 1)} className="mt-5 text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                ← Modifier mes réponses
              </button>
            </div>
          )
        )}
      </div>
    </dialog>
  );
}
