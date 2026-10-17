"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { Logo } from "@/components/site/Logo";
import { useCatalogue } from "@/lib/vehicules/useCatalogue";
import { CRITERES_VIDES, coutRecherche, credits, nbCriteres, actif, type AnnonceCC, type Criteres } from "@/lib/carcrush";
import { Coeur, Fleche, libelles, type Etape } from "./commun";
import { Accueil, Budget, Details, Voiture } from "./Questions";
import { Recap, type Compte } from "./Recap";
import { Pile } from "./Pile";
import { Favoris } from "./Favoris";

const QUESTIONS: Etape[] = ["voiture", "budget", "details"];
const BROUILLON = "carcrush:brouillon";
const RETOUR = "carcrush:retour";

type PileCC = { id: string; annonces: AnnonceCC[]; choix: Record<string, "garde" | "passe"> };

const lire = (k: string) => {
  try {
    return sessionStorage.getItem(k);
  } catch {
    return null;
  }
};
const ecrire = (k: string, v: string | null) => {
  try {
    if (v == null) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, v);
  } catch {
    /* navigation privée : rien de grave, le brouillon n'est pas gardé */
  }
};

/** CarCrush : questions (une par écran), récapitulatif modifiable, lancement payé en crédits, pile à swiper, coups de cœur. */
export function CarCrush({ compte: compteInitial, rechercheInitiale }: { compte: Compte; rechercheInitiale: string | null }) {
  const [etape, setEtape] = useState<Etape>(rechercheInitiale ? "pile" : "accueil");
  const [c, setC] = useState<Criteres>(CRITERES_VIDES);
  const [compte, setCompte] = useState<Compte>(compteInitial);
  const [pile, setPile] = useState<PileCC | null>(null);
  const [rendus, setRendus] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [depuisRecap, setDepuisRecap] = useState(false);
  const cat = useCatalogue();
  const router = useRouter();
  const ecran = useRef<HTMLDivElement>(null);
  const etapeAffichee = useRef(etape);

  const maj = (p: Partial<Criteres>) => setC((x) => ({ ...x, ...p }));

  // retour de la connexion : on reprend la recherche telle qu'elle était, sur le récapitulatif
  useEffect(() => {
    if (rechercheInitiale) return;
    const b = lire(BROUILLON);
    if (lire(RETOUR) && b) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage de session après hydratation
        setC({ ...CRITERES_VIDES, ...JSON.parse(b) });
        setEtape("recap");
      } catch {
        /* brouillon illisible : on repart de zéro */
      }
    }
    ecrire(RETOUR, null);
  }, [rechercheInitiale]);

  useEffect(() => {
    if (actif(c, "modele")) ecrire(BROUILLON, JSON.stringify(c));
  }, [c]);

  // recherche déjà lancée (lien ?r=) : la pile reprend là où elle en était, sans rien débiter
  useEffect(() => {
    if (!rechercheInitiale) return;
    fetch(`/api/carcrush?r=${rechercheInitiale}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setC({ ...CRITERES_VIDES, ...(d.criteres ?? {}) });
        if (!d.annonces?.length) {
          setRendus(d.rembourse ? d.cout : 0);
          setEtape("vide");
        } else setPile({ id: d.id, annonces: d.annonces, choix: d.choix ?? {} });
      })
      .catch(() => {
        setErreur("Cette recherche n'a pas pu être rouverte.");
        setEtape("accueil");
      });
  }, [rechercheInitiale]);

  // à chaque écran : haut de page et focus sur l'écran (les lecteurs d'écran annoncent le nouveau titre)
  useEffect(() => {
    if (etapeAffichee.current === etape) return;
    etapeAffichee.current = etape;
    window.scrollTo({ top: 0 });
    ecran.current?.focus({ preventScroll: true });
  }, [etape]);

  const aller = (e: Etape) => {
    setErreur("");
    setDepuisRecap(etape === "recap" && QUESTIONS.includes(e));
    setEtape(e);
  };

  const nouvelle = () => {
    setC(CRITERES_VIDES);
    setPile(null);
    setRendus(0);
    ecrire(BROUILLON, null);
    window.history.replaceState(history.state?.utpCarcrush ? { utpCarcrush: true } : null, "", "/carcrush");
    aller("accueil");
  };

  const lancer = async () => {
    setEnCours(true);
    setErreur("");
    try {
      const r = await fetch("/api/carcrush", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
      const d = await r.json().catch(() => ({}));
      if (typeof d.solde === "number") setCompte((x) => (x ? { ...x, credits: d.solde } : x));
      if (r.status === 401) {
        ecrire(RETOUR, "1");
        router.push("/connexion?next=/carcrush");
        return;
      }
      if (!r.ok) {
        setErreur(d.erreur ?? "La recherche n'a pas abouti.");
        return;
      }
      ecrire(BROUILLON, null);
      window.history.replaceState(history.state?.utpCarcrush ? { utpCarcrush: true } : null, "", `/carcrush?r=${d.id}`);
      if (!d.annonces?.length) {
        setRendus(d.rendus ?? 0);
        aller("vide");
      } else {
        setPile({ id: d.id, annonces: d.annonces, choix: {} });
        aller("pile");
      }
    } catch {
      setErreur("Connexion perdue : la recherche n'a pas été lancée.");
    } finally {
      setEnCours(false);
    }
  };

  const nb = nbCriteres(c);
  const cout = coutRecherche(nb);
  const iQ = QUESTIONS.indexOf(etape);
  const precedent = (): Etape | null => {
    if (etape === "accueil") return null;
    if (depuisRecap && iQ >= 0) return "recap";
    if (etape === "voiture") return "accueil";
    if (iQ > 0) return QUESTIONS[iQ - 1];
    if (etape === "recap") return "details";
    if (etape === "favoris") return pile ? "pile" : "accueil";
    if (etape === "vide") return "recap";
    return null;
  };
  const retour = precedent();

  // bouton ou geste « retour » du téléphone = la flèche de l'écran : une entrée d'historique reste en haut de la pile
  // tant que l'écran a un précédent ; un retour la consomme et affiche l'écran précédent (sans précédent : on quitte la page).
  const sentinelle = useRef(false);
  const retourRef = useRef<{ retour: Etape | null; aller: (e: Etape) => void }>({ retour, aller });
  useEffect(() => {
    retourRef.current = { retour, aller };
    if (retour && !sentinelle.current) {
      history.pushState({ utpCarcrush: true }, "");
      sentinelle.current = true;
    }
  });
  useEffect(() => {
    const onPop = () => {
      if (!sentinelle.current || history.state?.utpCarcrush) return;
      sentinelle.current = false;
      const { retour: r, aller: a } = retourRef.current;
      if (r) a(r);
      else history.back();
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-5">
      <header className="flex items-center justify-between gap-3 pb-4">
        {retour ? (
          <button type="button" onClick={() => aller(retour)} aria-label="Retour" className="grid size-11 place-items-center rounded-[14px] border border-line-2 bg-glass hover:border-o/50">
            <Fleche />
          </button>
        ) : (
          <Logo sous="CarCrush" />
        )}
        {iQ >= 0 && (
          <div className="flex flex-1 items-center gap-2" aria-hidden="true">
            {QUESTIONS.map((q, i) => (
              <span key={q} className={cx("h-1.5 flex-1 rounded-full", i <= iQ ? "bg-o" : "bg-line")} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          {compte && (
            <Link href="/app/credits" className="kicker min-h-9 font-medium hover:border-o/50">
              {compte.illimite ? "Illimité" : credits(compte.credits)}
            </Link>
          )}
          {compte && etape !== "favoris" && (
            <button type="button" onClick={() => aller("favoris")} aria-label="Mes coups de cœur" className="grid size-11 place-items-center rounded-[14px] border border-line-2 bg-glass text-o hover:border-o/50">
              <Coeur className="size-5" />
            </button>
          )}
        </div>
      </header>
      {iQ >= 0 && <p className="sr-only">Question {iQ + 1} sur 3</p>}

      <div ref={ecran} tabIndex={-1} className="flex flex-1 flex-col" style={{ outline: "none" }}>
        {erreur && etape !== "recap" && (
          <p role="alert" className="mb-4 rounded-2xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
            {erreur}
          </p>
        )}

        {etape === "accueil" && <Accueil />}
        {etape === "voiture" && <Voiture c={c} maj={maj} cat={cat} />}
        {etape === "budget" && <Budget c={c} maj={maj} />}
        {etape === "details" && <Details c={c} maj={maj} />}
        {etape === "recap" && <Recap c={c} maj={maj} cat={cat} compte={compte} aller={aller} lancer={lancer} enCours={enCours} erreur={erreur} />}
        {etape === "pile" && (pile ? <Pile key={pile.id} id={pile.id} annonces={pile.annonces} choixInitiaux={pile.choix} onFavoris={() => aller("favoris")} onNouvelle={nouvelle} /> : <p className="text-ink-3">Chargement de la recherche…</p>)}
        {etape === "favoris" && <Favoris onNouvelle={nouvelle} />}
        {etape === "vide" && <Vide rendus={rendus} criteres={libelles(c, cat)} onModifier={() => aller("recap")} onRetirer={(k) => { maj(k === "gen" ? { gen: "", phase: "" } : ({ [k]: CRITERES_VIDES[k] } as Partial<Criteres>)); aller("recap"); }} />}
      </div>

      {(etape === "accueil" || iQ >= 0) && (
        <div className="sticky bottom-0 -mx-5 mt-8 grid gap-2.5 bg-gradient-to-b from-transparent to-bg1 to-25% px-5 pb-7 pt-5">
          {iQ >= 0 && (
            <p aria-live="polite" className="flex justify-between text-sm text-ink-2">
              <span>
                <b className="text-ink">{nb}</b> critère{nb > 1 ? "s" : ""}
              </span>
              <span>
                Coût : <b className="text-o2">{cout ? credits(cout) : "2 critères min."}</b>
              </span>
            </p>
          )}
          {etape === "voiture" && !actif(c, "modele") ? (
            <button type="button" disabled className="btn btn-o min-h-14 w-full">
              Choisissez une marque et un modèle
            </button>
          ) : (
            <button
              type="button"
              onClick={() => aller(etape === "accueil" ? "voiture" : depuisRecap || etape === "details" ? "recap" : QUESTIONS[iQ + 1])}
              className="btn btn-o min-h-14 w-full"
            >
              {etape === "accueil" ? "Commencer ma recherche" : depuisRecap ? "Revenir à ma recherche" : etape === "details" ? "Voir ma recherche" : "Continuer"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Vide({ rendus, criteres, onModifier, onRetirer }: { rendus: number; criteres: { k: keyof Criteres; label: string; valeur: string }[]; onModifier: () => void; onRetirer: (k: keyof Criteres) => void }) {
  const retirables = criteres.filter((x) => x.k !== "modele");
  return (
    <div className="grid gap-6 pb-10">
      <div aria-hidden="true" className="relative grid h-40 place-items-center">
        <div className="absolute size-36 -rotate-[8deg] rounded-[26px] border border-dashed border-line-2" />
        <div className="absolute size-36 rotate-[7deg] rounded-[26px] border border-dashed border-line-2" />
        <div className="relative grid size-20 place-items-center rounded-full border border-ok/50 bg-ok/10 text-ok">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-9">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
        </div>
      </div>
      <div className="grid gap-2.5">
        <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em]">
          Aucune annonce. {rendus > 0 ? <span className="it">Vos {credits(rendus)} {rendus > 1 ? "sont rendus" : "est rendu"}.</span> : <span className="it">Rien n&apos;a été débité.</span>}
        </h1>
        <p role="status" className="leading-relaxed text-ink-2">
          Personne ne vend cette voiture en ce moment avec ces critères. Élargissez la recherche : chaque critère retiré la rend aussi moins chère.
        </p>
      </div>
      {retirables.length > 0 && (
        <section aria-labelledby="cc-elargir" className="carte grid gap-1 p-4">
          <h2 id="cc-elargir" className="mb-1 text-[13px] font-bold text-ink-3">
            Retirer un critère
          </h2>
          {retirables.map((x) => (
            <button key={x.k} type="button" onClick={() => onRetirer(x.k)} className="flex min-h-12 items-center justify-between gap-3 border-b border-line text-left last:border-b-0">
              <span>
                <span className="text-ink-3">{x.label} : </span>
                <span className="font-semibold">{x.valeur}</span>
              </span>
              <span className="text-sm font-bold text-o2">Retirer</span>
            </button>
          ))}
        </section>
      )}
      <button type="button" onClick={onModifier} className="btn btn-o min-h-14 w-full">
        Modifier ma recherche
      </button>
    </div>
  );
}
