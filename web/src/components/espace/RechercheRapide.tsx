"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useId, useState } from "react";
import { cx } from "@/lib/cx";
import { useCatalogue } from "@/lib/vehicules/useCatalogue";
import { quandRecherche, resumeFiltres, type Recherche } from "@/lib/recherches";
import { ChoixVehicule, type Choix } from "../marche/ChoixVehicule";
import { Ico } from "./Icones";
import { usePreferences } from "./Preferences";

const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

/** Tableau de bord : chercher une voiture dans le marché en deux clics, et reprendre ses 3 dernières recherches. */
export function RechercheRapide({ recentes }: { recentes: Recherche[] }) {
  const router = useRouter();
  const cat = useCatalogue() ?? [];
  const { favoris } = usePreferences();
  const [choix, setChoix] = useState<Choix>({ marque: "", modele: "", gen: "" });
  const [err, setErr] = useState("");
  const pret = !!(choix.marque && choix.modele);
  return (
    <section aria-labelledby="tb-recherche" className="carte grid gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="tb-recherche" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Ico nom="recherche" className="size-5 text-o2" />
          Recherche de marché
        </h2>
        <span className="flex gap-4 text-sm">
          <Link href="/app/recherche" className="text-o2 underline-offset-4 hover:underline">Mes recherches</Link>
          {favoris && <Link href="/app/favoris" className="text-o2 underline-offset-4 hover:underline">Favoris</Link>}
        </span>
      </div>
      <form
        className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!pret) return setErr("Choisissez au moins la marque et le modèle.");
          router.push(`/app/recherche?${new URLSearchParams({ marque: choix.marque, modele: choix.modele, gen: choix.gen })}`);
        }}
      >
        <ChoixVehicule cat={cat} v={choix} onChange={(c) => { setChoix(c); setErr(""); }} idPrefixe="tb" />
        <button type="submit" className={cx("btn btn-o min-h-11", !pret && "opacity-80")}>
          Chercher
        </button>
        {err && <p role="alert" className="text-sm text-warn sm:col-span-2 lg:col-span-4">{err}</p>}
      </form>

      <div className="grid gap-2">
        <h3 className="text-sm font-medium text-ink-2">Vos dernières recherches</h3>
        {recentes.length ? (
          <ul className="grid gap-2 sm:gap-3 md:grid-cols-3">
            {recentes.map((r) => (
              <li key={r.id} className="min-w-0">
                <Link href={`/app/recherche?r=${r.id}`} className="group grid h-full gap-1.5 rounded-2xl border border-line p-3 sm:p-4 transition hover:border-o/40 hover:bg-glass">
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 font-semibold">
                      {r.active && <span className="size-2 shrink-0 rounded-full bg-ok" title="Ouverte en onglet" aria-label="ouverte" />}
                      <span className="truncate">{r.nom}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-3" suppressHydrationWarning>{quandRecherche(r.derniere_le)}</span>
                  </span>
                  <span className="truncate text-xs text-ink-3 max-sm:hidden">{resumeFiltres(r.criteres.f) || "Tous les critères"}</span>
                  <span className="text-sm text-ink-2">
                    <b className="num text-ink">{r.trouvees ?? 0}</b> annonce{(r.trouvees ?? 0) > 1 ? "s" : ""}
                    {r.sous_cote ? <> · <b className="num text-ok">{r.sous_cote}</b> sous la cote</> : null}
                  </span>
                  {r.meilleure && (
                    <span className="truncate text-xs text-ink-3 max-sm:hidden">
                      Meilleure : {eur(r.meilleure.prix)} · <span className="text-ok">{r.meilleure.pct} % sous la cote</span>
                    </span>
                  )}
                  <span className="mt-auto pt-1 text-sm text-o2 max-sm:hidden">Reprendre <span aria-hidden="true">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-line-2 p-4 text-sm text-ink-3">
            Aucune recherche pour l&apos;instant : choisissez une voiture ci-dessus. Chaque recherche est gardée ici et reste ouverte dans la page Recherche.
          </p>
        )}
      </div>
    </section>
  );
}

/** Téléphone : bouton « Rechercher » qui ouvre une fenêtre (marque, modèle, génération) au lieu du formulaire dans la page. */
export function BoutonRechercher({ className }: { className?: string }) {
  const router = useRouter();
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const cat = useCatalogue(ouvert) ?? []; // chargé à l'ouverture de la fenêtre
  const [choix, setChoix] = useState<Choix>({ marque: "", modele: "", gen: "" });
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, [ouvert]);
  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={cx("btn w-full gap-2", className)}>
        <Ico nom="recherche" className="size-5" />
        Rechercher
      </button>
      {ouvert &&
        createPortal(
          <div className="fixed inset-0 z-[70] grid items-end bg-black/70 backdrop-blur-sm sm:place-items-center sm:px-4" onClick={() => setOuvert(false)}>
            <div role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-line-2 bg-bg1 p-5 sm:max-w-lg sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 id={`${id}-t`} className="font-display text-xl font-semibold">Rechercher une voiture</h2>
                <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer" className="rounded-full px-2 py-1 text-ink-3 hover:text-ink">✕</button>
              </div>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!choix.marque || !choix.modele) return setErr("Choisissez au moins la marque et le modèle.");
                  router.push(`/app/recherche?${new URLSearchParams({ marque: choix.marque, modele: choix.modele, gen: choix.gen })}`);
                }}
              >
                <ChoixVehicule cat={cat} v={choix} onChange={(c) => { setChoix(c); setErr(""); }} idPrefixe={`${id}-rv`} />
                {err && <p role="alert" className="text-sm text-warn">{err}</p>}
                <button type="submit" className="btn btn-o mt-1">Chercher</button>
              </form>
              <p className="mt-4 text-sm text-ink-3">
                Plus de filtres (prix, kilométrage, sous la cote…) dans la page{" "}
                <Link href="/app/recherche" className="text-o2 underline underline-offset-4">Recherche</Link>.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
