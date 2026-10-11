"use client";
/* Visite de bienvenue après un abonnement : 4 étapes, 1 minute.
   1 Bienvenue (la formule est active, ce qu'elle apporte) · 2 Votre profil (les 4 questions de l'analyse sur mesure)
   3 Votre espace (où trouver quoi) · 4 Première analyse (coller un lien). Chaque étape se passe ; fermer ou terminer
   enregistre la visite (profils.reglages.bienvenue) et retire ?bienvenue=1 de l'adresse. */
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Etape, TITRES, TITRES_REVENTE, useProfilAnalyse } from "@/components/analyse/ProfilAnalyse";
import { lienLeboncoin } from "@/lib/analyse/import";
import type { ProfilAnalyse } from "@/lib/analyse/profil";
import type { DonneesBienvenue } from "@/lib/bienvenue";
import { cx, inputCls } from "@/lib/cx";
import { Ico } from "./Icones";

const ETAPES = ["Bienvenue", "Votre profil", "Votre espace", "Première analyse"];

export function Bienvenue({ d }: { d: DonneesBienvenue }) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const titre = useRef<HTMLHeadingElement>(null);
  const idLien = useId();
  const { profil, enregistrer } = useProfilAnalyse();
  const [etape, setEtape] = useState(0);
  const [q, setQ] = useState(0); // question du profil (0 à 3)
  const [p, setP] = useState(profil);
  const courant = useRef(profil);
  const [envoi, setEnvoi] = useState(false);
  const [lien, setLien] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    ref.current?.showModal();
  }, []);
  // le titre de l'étape reçoit le focus : lecteur d'écran et clavier suivent la visite
  useEffect(() => {
    titre.current?.focus();
  }, [etape, q]);

  const maj = (x: Partial<ProfilAnalyse>) => {
    courant.current = { ...courant.current, ...x };
    setP(courant.current);
  };

  const terminer = async (statut: "fait" | "passee", suite?: string) => {
    await fetch("/api/profil", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bienvenue: statut }) }).catch(() => null);
    ref.current?.close();
    router.replace(suite ?? "/app");
    router.refresh();
  };

  const validerProfil = async () => {
    setEnvoi(true);
    await enregistrer(courant.current);
    setEnvoi(false);
    setEtape(2);
  };

  const lancer = () => {
    const l = lienLeboncoin(lien);
    if (!l) return setErr("Collez le lien d'une annonce Leboncoin (il commence par https://www.leboncoin.fr/). Pour un autre site, vous collerez le texte de l'annonce dans l'analyse.");
    void terminer("fait", `/app/analyser?lien=${encodeURIComponent(l)}`);
  };

  const dernierQ = q === 3;
  const nom = d.prenom ? ` ${d.prenom}` : "";

  return (
    <dialog
      ref={ref}
      aria-labelledby="bienvenue-titre"
      onCancel={(e) => {
        e.preventDefault();
        void terminer("passee");
      }}
      className="m-auto max-h-[94dvh] w-[min(96vw,860px)] overflow-hidden rounded-3xl border border-line-2 bg-bg1 p-0 text-ink shadow-[0_30px_90px_-30px_rgb(0_0_0/0.95)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="grid max-h-[94dvh] md:grid-cols-[220px_minmax(0,1fr)]">
        {/* Étapes : colonne sur ordinateur, barre sur téléphone */}
        <nav aria-label="Étapes de la visite" className="border-b border-line bg-bg0/60 px-5 py-4 md:border-b-0 md:border-r md:py-8">
          <ol className="flex gap-1.5 md:grid md:gap-1">
            {ETAPES.map((l, i) => (
              <li key={l} aria-current={i === etape ? "step" : undefined} className="flex-1 md:flex-none">
                <span className="block h-1 rounded-full md:hidden" aria-hidden="true">
                  <span className={cx("block h-full rounded-full transition-colors", i <= etape ? "bg-o" : "bg-line")} />
                </span>
                <span className={cx("hidden items-center gap-3 rounded-xl px-2 py-2 text-sm md:flex", i === etape ? "bg-o/10 text-ink" : i < etape ? "text-ink-2" : "text-ink-3")}>
                  <span className={cx("grid size-6 shrink-0 place-items-center rounded-full border text-xs", i < etape ? "border-ok bg-ok/20 text-ok" : i === etape ? "border-o text-o2" : "border-line-2")} aria-hidden="true">
                    {i < etape ? "✓" : i + 1}
                  </span>
                  {l}
                  {i < etape && <span className="sr-only"> (fait)</span>}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-3 md:hidden">
            Étape {etape + 1} sur {ETAPES.length} · {ETAPES[etape]}
          </p>
        </nav>

        <div className="grid min-h-0 content-start gap-5 overflow-y-auto p-6 sm:p-8">
          {etape === 0 && (
            <>
              <div className="grid size-12 place-items-center rounded-full border border-ok/50 bg-ok/15 text-ok" aria-hidden="true">
                <Ico nom="analyser" className="size-6" />
              </div>
              <div className="grid gap-2">
                <h2 id="bienvenue-titre" ref={titre} tabIndex={-1} style={{ outline: "none" }} className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  Bienvenue{nom}, votre formule {d.formule} est active
                </h2>
                <p className="text-ink-2">
                  {d.restantes}. Une minute pour régler l&apos;outil sur votre projet et savoir où tout se trouve ; vous pouvez passer chaque étape.
                </p>
              </div>
              {d.avantages.length > 0 && (
                <ul className="grid gap-2 rounded-2xl border border-line bg-glass p-4 text-sm">
                  {d.avantages.map((a) => (
                    <li key={a} className="flex gap-3">
                      <span className="mt-0.5 text-ok" aria-hidden="true">✓</span>
                      <span className="text-ink-2">{a}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => void terminer("passee")} className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                  Passer la visite
                </button>
                <button type="button" onClick={() => setEtape(1)} className="btn btn-o">
                  Commencer
                </button>
              </div>
            </>
          )}

          {etape === 1 && (
            <>
              <div className="grid gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-o2">Question {q + 1} sur 4</p>
                <h2 id="bienvenue-titre" ref={titre} tabIndex={-1} style={{ outline: "none" }} className="font-display text-xl font-semibold sm:text-2xl">
                  {dernierQ && p.objectif === "revente" ? TITRES_REVENTE : TITRES[q]}
                </h2>
                {q === 0 && <p className="text-sm text-ink-2">La note, les frais et les conseils de chaque analyse en dépendent. Vous pourrez tout modifier dans Profil et paramètres.</p>}
              </div>
              <Etape n={q} p={p} maj={maj} />
              {dernierQ && (
                <label className="grid gap-1.5 text-sm">
                  <span className="text-ink-2">Votre ville</span>
                  <input defaultValue={p.ville} onBlur={(e) => maj({ ville: e.target.value.trim().slice(0, 80) })} placeholder="ex. Lyon" className={inputCls} />
                  <span className="text-xs text-ink-3">Pour le trajet jusqu&apos;à la voiture{p.objectif === "revente" ? " et le marché de revente" : ""}.</span>
                </label>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => (q === 0 ? setEtape(0) : setQ(q - 1))} className="btn btn-sm">
                  Retour
                </button>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setEtape(2)} className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                    Passer
                  </button>
                  {dernierQ ? (
                    <button type="button" disabled={envoi} onClick={() => void validerProfil()} className="btn btn-o btn-sm">
                      {envoi ? "Enregistrement…" : "Enregistrer et continuer"}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setQ(q + 1)} className="btn btn-o btn-sm">
                      Suivant
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {etape === 2 && (
            <>
              <div className="grid gap-2">
                <h2 id="bienvenue-titre" ref={titre} tabIndex={-1} style={{ outline: "none" }} className="font-display text-xl font-semibold sm:text-2xl">
                  Votre espace en un coup d&apos;œil
                </h2>
                <p className="text-sm text-ink-2">Le menu (à gauche sur ordinateur, en bas sur téléphone) donne accès à tout ça.</p>
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {d.visite.map((e) => (
                  <li key={e.href} className="flex gap-3 rounded-2xl border border-line p-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-o/10 text-o2" aria-hidden="true">
                      <Ico nom={e.icone} className="size-5" />
                    </span>
                    <span className="grid gap-0.5">
                      <span className="font-medium">{e.label}</span>
                      <span className="text-sm text-ink-3">{e.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => setEtape(1)} className="btn btn-sm">
                  Retour
                </button>
                <button type="button" onClick={() => setEtape(3)} className="btn btn-o btn-sm">
                  Suivant
                </button>
              </div>
            </>
          )}

          {etape === 3 && (
            <>
              <div className="grid gap-2">
                <h2 id="bienvenue-titre" ref={titre} tabIndex={-1} style={{ outline: "none" }} className="font-display text-xl font-semibold sm:text-2xl">
                  Lancez votre première analyse
                </h2>
                <p className="text-sm text-ink-2">Ouvrez une annonce Leboncoin, copiez son adresse et collez-la ici : l&apos;annonce et ses photos se remplissent toutes seules.</p>
              </div>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  lancer();
                }}
              >
                <label htmlFor={idLien} className="sr-only">
                  Lien de l&apos;annonce Leboncoin
                </label>
                <div className="relative">
                  <Ico nom="lien" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-3" />
                  <input
                    id={idLien}
                    value={lien}
                    onChange={(e) => {
                      setLien(e.target.value);
                      setErr("");
                    }}
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://www.leboncoin.fr/ad/voitures/…"
                    aria-invalid={!!err}
                    aria-describedby={err ? `${idLien}-e` : undefined}
                    className={cx(inputCls, "min-h-13 pl-12 text-base")}
                  />
                </div>
                {err && (
                  <p id={`${idLien}-e`} role="alert" className="text-sm text-bad">
                    {err}
                  </p>
                )}
                <button type="submit" className="btn btn-o justify-center">
                  Analyser cette annonce
                </button>
              </form>
              <ul className="grid gap-2 rounded-2xl border border-line bg-glass p-4 text-sm text-ink-2">
                <li className="flex gap-3">
                  <span aria-hidden="true">📱</span>
                  <span>Sur Android, ajoutez Utopicar à l&apos;écran d&apos;accueil : le bouton « Partager » de l&apos;appli Leboncoin enverra l&apos;annonce ici directement.</span>
                </li>
                {d.extension && (
                  <li className="flex gap-3">
                    <Ico nom="extension" className="mt-0.5 size-4 shrink-0 text-o2" />
                    <span>L&apos;extension Leboncoin (menu de gauche) analyse l&apos;annonce sans quitter la page.</span>
                  </li>
                )}
                <li className="flex gap-3">
                  <Ico nom="compte" className="mt-0.5 size-4 shrink-0 text-o2" />
                  <span>Profil et paramètres : modifier votre profil d&apos;analyse, gérer ou résilier votre formule, revoir cette visite.</span>
                </li>
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => setEtape(2)} className="btn btn-sm">
                  Retour
                </button>
                <button type="button" onClick={() => void terminer("fait")} className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
                  Plus tard, j&apos;explore d&apos;abord
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
