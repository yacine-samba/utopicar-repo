"use client";
/* Profil d'analyse : questionnaire de la première analyse (4 questions, 20 secondes), le même formulaire dans
   Profil › Mon profil d'analyse, et la puce « Analysé pour… » des rapports. Le profil change les priorités de la note,
   le seuil de bénéfice et le ton ; il ne déclare jamais une voiture « hors cible ». Changer le profil recalcule
   aussitôt les rapports affichés (le bilan est calculé dans le navigateur à partir de l'analyse enregistrée). */
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { profilParDefaut, resumeProfil, type Delai, type Experience, type Objectif, type ProfilAnalyse, type Tolerance } from "@/lib/analyse/profil";
import { cx, inputCls } from "@/lib/cx";

type Ctx = { profil: ProfilAnalyse; enregistrer: (p: ProfilAnalyse) => Promise<boolean>; ouvrir: () => void; actif: boolean };
const Contexte = createContext<Ctx>({ profil: profilParDefaut("particulier"), enregistrer: async () => false, ouvrir: () => {}, actif: false });
export const useProfilAnalyse = () => useContext(Contexte);

export function ProfilAnalyseFournisseur({ initial, children }: { initial: ProfilAnalyse; children: ReactNode }) {
  const router = useRouter();
  const [profil, setProfil] = useState(initial);
  const [ouvert, setOuvert] = useState(false);
  const enregistrer = useCallback(
    async (p: ProfilAnalyse) => {
      setProfil({ ...p, rempli: true });
      const r = await fetch("/api/profil", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analyse: p }) }).catch(() => null);
      if (r?.ok) router.refresh();
      return !!r?.ok;
    },
    [router],
  );
  return (
    <Contexte.Provider value={{ profil, enregistrer, ouvrir: () => setOuvert(true), actif: true }}>
      {children}
      {ouvert && <Questionnaire initial={profil} onFermer={() => setOuvert(false)} onValider={async (p) => (await enregistrer(p), setOuvert(false))} />}
    </Contexte.Provider>
  );
}

/** Ouvre le questionnaire à la première analyse, une fois par session (« Plus tard » le referme jusqu'à la prochaine visite). */
export function DemandeProfil() {
  const { profil, ouvrir, actif } = useProfilAnalyse();
  useEffect(() => {
    if (!actif || profil.rempli) return;
    try {
      if (sessionStorage.getItem("utp-profil-plus-tard")) return;
      sessionStorage.setItem("utp-profil-plus-tard", "1");
    } catch {
      /* stockage indisponible : on demande quand même */
    }
    ouvrir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actif]);
  return null;
}

/** « Analysé pour : revente · bénéfice ≥ 750 € … » avec le lien pour modifier. */
export function PuceProfil({ className }: { className?: string }) {
  const { profil, ouvrir, actif } = useProfilAnalyse();
  if (!actif) return null;
  return (
    <p className={cx("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-3", className)}>
      <span>
        {profil.rempli ? "Analysé pour vous :" : "Analysé avec les réglages par défaut :"} <span className="text-ink-2">{resumeProfil(profil)}</span>
      </span>
      <button type="button" onClick={ouvrir} className="text-o2 underline underline-offset-4 hover:text-o3">
        {profil.rempli ? "Modifier" : "Personnaliser en 4 questions"}
      </button>
    </p>
  );
}

/* ---------- Questionnaire ---------- */

type Choix<T extends string> = { v: T; l: string; d: string };
const OBJECTIFS: Choix<Objectif>[] = [
  { v: "usage", l: "Rouler avec", d: "Je cherche ma prochaine voiture." },
  { v: "revente", l: "La revendre", d: "Achat-revente : je vise un bénéfice." },
  { v: "mixte", l: "Rouler, puis revendre", d: "Je la garde un an ou deux et je veux qu'elle garde sa valeur." },
];
const EXPERIENCES: Choix<Experience>[] = [
  { v: "debutant", l: "Je débute", d: "Explications simples, prudence renforcée sur les risques." },
  { v: "habitue", l: "J'ai l'habitude", d: "J'ai déjà acheté plusieurs voitures d'occasion." },
  { v: "pro", l: "C'est mon métier", d: "Ton direct, chiffres d'abord." },
];
const TRAVAUX: Choix<Tolerance>[] = [
  { v: "aucun", l: "Aucun", d: "Je veux rouler tout de suite, sans frais." },
  { v: "petits", l: "Les petits", d: "Pneus, freins, vidange : ça me va." },
  { v: "gros", l: "Même les gros", d: "Embrayage, distribution… si le prix les compense." },
];
const DELAIS: Choix<Delai>[] = [
  { v: "rapide", l: "2 à 3 semaines", d: "Je revends vite, au prix bas du marché." },
  { v: "normal", l: "1 à 2 mois", d: "Au prix du marché." },
  { v: "patient", l: "Pas pressé", d: "J'attends le bon acheteur, au prix haut." },
];
const MARGES = [300, 500, 750, 1000, 1500, 2500];
const KMS = [5000, 10000, 15000, 25000];
const eur = (v: number) => `${v.toLocaleString("fr-FR")} €`;

function Options<T extends string>({ nom, choix, valeur, onChange }: { nom: string; choix: Choix<T>[]; valeur: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={nom} className="grid gap-2">
      {choix.map((c) => (
        <button
          key={c.v}
          type="button"
          role="radio"
          aria-checked={valeur === c.v}
          onClick={() => onChange(c.v)}
          className={cx("grid gap-0.5 rounded-2xl border p-3.5 text-left transition", valeur === c.v ? "border-o/70 bg-o/10" : "border-line-2 hover:border-o/40 hover:bg-glass")}
        >
          <span className="font-medium">{c.l}</span>
          <span className="text-sm text-ink-3">{c.d}</span>
        </button>
      ))}
    </div>
  );
}

function Puces({ nom, valeurs, valeur, format, onChange }: { nom: string; valeurs: number[]; valeur: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div role="radiogroup" aria-label={nom} className="flex flex-wrap gap-2">
      {valeurs.map((v) => (
        <button key={v} type="button" role="radio" aria-checked={valeur === v} onClick={() => onChange(v)} className={cx("rounded-full border px-3.5 py-1.5 text-sm transition", valeur === v ? "border-o/70 bg-o/15 text-ink" : "border-line-2 text-ink-2 hover:border-o/40")}>
          {format(v)}
        </button>
      ))}
    </div>
  );
}

const nombre = (s: string) => {
  const v = Number(s.replace(/[\s €]/g, "").replace(",", "."));
  return Number.isFinite(v) && v >= 0 ? v : null;
};

/** Champs du profil, par étape (questionnaire) ou tous à la suite (paramètres). */
function Etape({ n, p, maj }: { n: number; p: ProfilAnalyse; maj: (x: Partial<ProfilAnalyse>) => void }) {
  if (n === 0) return <Options nom="Objectif" choix={OBJECTIFS} valeur={p.objectif} onChange={(objectif) => maj({ objectif })} />;
  if (n === 1) return <Options nom="Expérience" choix={EXPERIENCES} valeur={p.experience} onChange={(experience) => maj({ experience })} />;
  if (n === 2) return <Options nom="Travaux acceptés" choix={TRAVAUX} valeur={p.travaux} onChange={(travaux) => maj({ travaux })} />;
  return p.objectif === "revente" ? (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm text-ink-2">Bénéfice minimum par voiture, une fois tout payé</p>
        <Puces nom="Bénéfice minimum" valeurs={MARGES} valeur={p.margeMin} format={eur} onChange={(margeMin) => maj({ margeMin })} />
        <label className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
          ou au moins
          <input inputMode="decimal" defaultValue={p.margePct || ""} onBlur={(e) => maj({ margePct: Math.min(50, nombre(e.target.value) ?? 0) })} placeholder="0" className={cx(inputCls, "w-16! py-1")} aria-label="Bénéfice minimum en pourcentage du prix d'achat" />
          % du prix d&apos;achat (pour les voitures chères)
        </label>
      </div>
      <div className="grid gap-2">
        <p className="text-sm text-ink-2">Revendre en combien de temps ?</p>
        <Options nom="Délai de revente" choix={DELAIS} valeur={p.delai} onChange={(delai) => maj({ delai })} />
      </div>
    </div>
  ) : (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-sm text-ink-2">Combien de kilomètres par an ?</p>
        <Puces nom="Kilomètres par an" valeurs={KMS} valeur={p.kmAn} format={(v) => `${(v / 1000).toLocaleString("fr-FR")} 000 km`} onChange={(kmAn) => maj({ kmAn })} />
      </div>
      <label className="grid gap-1.5 text-sm">
        <span className="text-ink-2">Budget maximum (facultatif)</span>
        <input inputMode="numeric" defaultValue={p.budget || ""} onBlur={(e) => maj({ budget: nombre(e.target.value) ?? 0 })} placeholder="ex. 8 000" className={cx(inputCls, "w-40")} />
        <span className="text-xs text-ink-3">Il ne change pas la note : il vous signale seulement les annonces au-dessus.</span>
      </label>
    </div>
  );
}

const TITRES = ["Cette voiture, c'est pour…", "Votre expérience des voitures d'occasion", "Les travaux, vous les acceptez ?", "Dernière question"];
const TITRES_REVENTE = "Votre objectif de revente";

function Questionnaire({ initial, onFermer, onValider }: { initial: ProfilAnalyse; onFermer: () => void; onValider: (p: ProfilAnalyse) => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [p, setP] = useState(initial);
  // copie synchrone : un champ texte est lu à sa sortie (blur), juste avant le clic sur « Voir mes analyses »
  const courant = useRef(initial);
  const [n, setN] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const maj = (x: Partial<ProfilAnalyse>) => {
    courant.current = { ...courant.current, ...x };
    setP(courant.current);
  };
  const dernier = n === 3;
  return (
    <dialog
      ref={ref}
      aria-labelledby="profil-titre"
      onCancel={(e) => {
        e.preventDefault();
        onFermer();
      }}
      className="m-auto w-[min(94vw,520px)] rounded-3xl border border-line-2 bg-bg1 p-0 text-ink shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="grid gap-5 p-6 sm:p-7">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-o2">Votre analyse sur mesure · {n + 1} / 4</p>
            <button type="button" onClick={onFermer} className="text-sm text-ink-3 hover:text-ink">
              Plus tard
            </button>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cx("h-1 flex-1 rounded-full", i <= n ? "bg-o" : "bg-line")} />
            ))}
          </div>
          <h2 id="profil-titre" className="mt-2 font-display text-xl font-semibold">
            {dernier && p.objectif === "revente" ? TITRES_REVENTE : TITRES[n]}
          </h2>
          {n === 0 && <p className="text-sm text-ink-2">Quatre questions pour que la note, les frais et les conseils correspondent à votre projet. Toutes les voitures restent analysées, de la citadine à la sportive.</p>}
        </div>
        <Etape n={n} p={p} maj={maj} />
        {dernier && (
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink-2">Votre ville</span>
            <input defaultValue={p.ville} onBlur={(e) => maj({ ville: e.target.value.trim().slice(0, 80) })} placeholder="ex. Lyon" className={inputCls} />
            <span className="text-xs text-ink-3">Pour le trajet jusqu&apos;à la voiture{p.objectif === "revente" ? " et le marché de revente" : ""}.</span>
          </label>
        )}
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setN((x) => Math.max(0, x - 1))} disabled={n === 0} className="btn btn-sm">
            Retour
          </button>
          {dernier ? (
            <button
              type="button"
              disabled={envoi}
              onClick={async () => {
                setEnvoi(true);
                await onValider(courant.current);
              }}
              className="btn btn-o btn-sm"
            >
              {envoi ? "Enregistrement…" : "Voir mes analyses sur mesure"}
            </button>
          ) : (
            <button type="button" onClick={() => setN((x) => x + 1)} className="btn btn-o btn-sm">
              Suivant
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}

/* ---------- Formulaire complet (Profil › Mon profil d'analyse) ---------- */

export function FormulaireProfilAnalyse() {
  const { profil, enregistrer } = useProfilAnalyse();
  const [p, setP] = useState(profil);
  const courant = useRef(profil);
  const [etat, setEtat] = useState<"" | "ok" | "erreur" | "envoi">("");
  const maj = (x: Partial<ProfilAnalyse>) => {
    courant.current = { ...courant.current, ...x };
    setP(courant.current);
    setEtat("");
  };
  const revente = p.objectif === "revente";
  return (
    <form
      className="grid gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setEtat("envoi");
        setEtat((await enregistrer(courant.current)) ? "ok" : "erreur");
      }}
    >
      {[0, 1, 2].map((i) => (
        <fieldset key={i} className="grid gap-2">
          <legend className="mb-2 font-medium">{TITRES[i]}</legend>
          <Etape n={i} p={p} maj={maj} />
        </fieldset>
      ))}
      <fieldset className="grid gap-2">
        <legend className="mb-2 font-medium">{revente ? TITRES_REVENTE : "Votre usage"}</legend>
        <Etape n={3} p={p} maj={maj} />
      </fieldset>
      <details className="rounded-2xl border border-line p-4">
        <summary className="cursor-pointer font-medium">Réglages des frais</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["ville", "Ville", "Trajet jusqu'à la voiture et marché de revente."],
              ["tarifCV", "Prix du cheval fiscal (€)", "Carte grise. Île-de-France 2026 : 68,95 €."],
              ["kmCost", "Coût du trajet (€ par km)", "Compté sur l'aller-retour."],
              ...(revente ? [["fraisFixes", "Frais par voiture revendue (€)", "CT, nettoyage, photos, annonce."]] : []),
            ] as [keyof ProfilAnalyse, string, string][]
          ).map(([k, l, aide]) => (
            <label key={k} className="grid gap-1.5 text-sm">
              <span className="text-ink-2">{l}</span>
              <input
                defaultValue={String(p[k] ?? "")}
                inputMode={k === "ville" ? "text" : "decimal"}
                onBlur={(e) => maj({ [k]: k === "ville" ? e.target.value.trim().slice(0, 80) : (nombre(e.target.value) ?? p[k]) } as Partial<ProfilAnalyse>)}
                className={inputCls}
              />
              <span className="text-xs text-ink-3">{aide}</span>
            </label>
          ))}
          {revente && (
            <label className="flex items-start gap-3 text-sm sm:col-span-2">
              <input type="checkbox" checked={p.negociant} onChange={(e) => maj({ negociant: e.target.checked })} className="mt-1 size-4 accent-[#ff5a1f]" />
              <span>
                Je suis négociant (déclaration d&apos;achat) : pas de carte grise à mon nom à chaque achat.
              </span>
            </label>
          )}
        </div>
      </details>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={etat === "envoi"} className="btn btn-o btn-sm">
          Enregistrer mon profil
        </button>
        <span role="status" className={cx("text-sm", etat === "erreur" ? "text-bad" : "text-ok")}>
          {etat === "ok" ? "Enregistré : vos rapports sont recalculés." : etat === "erreur" ? "Enregistrement impossible, réessayez." : ""}
        </span>
      </div>
      <p className="text-sm text-ink-3">Actuellement : {resumeProfil(p)}.</p>
    </form>
  );
}

