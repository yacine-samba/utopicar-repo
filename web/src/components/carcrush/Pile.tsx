"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "@/lib/cx";
import { eur, type AnnonceCC } from "@/lib/carcrush";
import { Coeur, Croix, EcartCote, Externe, PastilleVerdict, PhotoAnnonce } from "./commun";

type ChoixCC = "garde" | "passe";
const SEUIL = 110;

/** Pile d'annonces : glisser à droite (garder) ou à gauche (passer), ou les boutons. Chaque choix est enregistré. */
export function Pile({ id, annonces, choixInitiaux, onFavoris, onNouvelle }: {
  id: string; annonces: AnnonceCC[]; choixInitiaux: Record<string, ChoixCC>; onFavoris: () => void; onNouvelle: () => void;
}) {
  // reprise d'une pile entamée : on repart de la première annonce sans choix
  const [historique, setHistorique] = useState<{ id: string; choix: ChoixCC }[]>(() => annonces.filter((a) => choixInitiaux[a.id]).map((a) => ({ id: a.id, choix: choixInitiaux[a.id] })));
  const restantes = annonces.filter((a) => !historique.some((h) => h.id === a.id));
  const cur = restantes[0] ?? null;
  const suivante = restantes[1] ?? null;
  const gardees = historique.filter((h) => h.choix === "garde").length;
  const [dx, setDx] = useState(0);
  const [glisse, setGlisse] = useState(false);
  const [sortie, setSortie] = useState<ChoixCC | null>(null);
  const [erreur, setErreur] = useState("");
  const depart = useRef(0);
  // appui commencé sur la photo : un appui sans glisser change de photo (droite : suivante, gauche : précédente)
  const surPhoto = useRef<DOMRect | null>(null);
  const carte = useRef<HTMLElement>(null);
  const [vue, setVue] = useState({ id: "", i: 0 });
  const photos = cur ? (cur.photos?.length ? cur.photos : cur.photo ? [cur.photo] : []) : [];
  const iPhoto = vue.id === cur?.id ? Math.min(vue.i, Math.max(0, photos.length - 1)) : 0;
  const voirPhoto = (i: number) => cur && setVue({ id: cur.id, i: (i + photos.length) % photos.length });

  // la carte du dessus reçoit le focus : les flèches du clavier décident tout de suite
  useEffect(() => {
    if (cur && !sortie) carte.current?.focus({ preventScroll: true });
  }, [cur, sortie]);

  const enregistrer = (a: AnnonceCC, choix: ChoixCC) =>
    fetch("/api/carcrush/choix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recherche: id, annonce: a, choix }) })
      .then((r) => setErreur(r.ok ? "" : "Votre dernier choix n'a pas été enregistré."))
      .catch(() => setErreur("Hors ligne : votre dernier choix n'a pas été enregistré."));

  const decider = (choix: ChoixCC) => {
    if (!cur || sortie) return;
    setSortie(choix);
    setGlisse(false);
    void enregistrer(cur, choix);
    const a = cur;
    window.setTimeout(() => {
      setHistorique((h) => [...h, { id: a.id, choix }]);
      setSortie(null);
      setDx(0);
    }, 280);
  };

  const annuler = () => {
    const dernier = historique[historique.length - 1];
    if (!dernier || sortie) return;
    setHistorique((h) => h.slice(0, -1));
    void fetch("/api/carcrush/choix", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recherche: id, annonce: dernier.id }) }).catch(() => {});
  };

  const down = (e: PointerEvent<HTMLElement>) => {
    if (sortie || (e.target as HTMLElement).closest("a,button")) return;
    depart.current = e.clientX;
    surPhoto.current = (e.target as HTMLElement).closest("[data-photo]")?.getBoundingClientRect() ?? null;
    e.currentTarget.setPointerCapture(e.pointerId);
    setGlisse(true);
  };
  const move = (e: PointerEvent<HTMLElement>) => glisse && setDx(e.clientX - depart.current);
  const up = (e: PointerEvent<HTMLElement>) => {
    if (!glisse) return;
    if (dx > SEUIL) decider("garde");
    else if (dx < -SEUIL) decider("passe");
    else {
      const r = surPhoto.current;
      if (r && Math.abs(e.clientX - depart.current) < 8 && photos.length > 1) voirPhoto(iPhoto + (e.clientX < r.left + r.width / 3 ? -1 : 1));
      setGlisse(false);
      setDx(0);
    }
  };
  const touche = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); decider("garde"); }
    if (e.key === "ArrowLeft") { e.preventDefault(); decider("passe"); }
  };

  const transform = sortie === "garde" ? "translateX(130%) rotate(24deg)" : sortie === "passe" ? "translateX(-130%) rotate(-24deg)" : `translateX(${dx}px) rotate(${dx / 16}deg)`;
  const p = sortie ? 1 : Math.min(1, Math.abs(dx) / SEUIL);
  const opGarde = sortie === "garde" ? 1 : dx > 0 ? Math.min(1, dx / SEUIL) : 0;
  const opPasse = sortie === "passe" ? 1 : dx < 0 ? Math.min(1, -dx / SEUIL) : 0;
  const pos = Math.min(historique.length + 1, annonces.length);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 pb-3">
        <div aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-o transition-[width] duration-300" style={{ width: `${(historique.length / annonces.length) * 100}%` }} />
        </div>
        <span className="num text-[13px] font-bold">
          {pos} / {annonces.length}
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {cur ? `Annonce ${pos} sur ${annonces.length} : ${cur.titre}, ${eur(cur.prix)}.` : `Toutes les annonces sont passées. Vous en gardez ${gardees}.`}
      </p>

      <div className="relative min-h-[460px] flex-1">
        {suivante && (
          <div aria-hidden="true" className="absolute inset-0 rounded-[26px] border border-line bg-[#1d1611] transition-transform duration-300" style={{ transform: `translateY(${14 - 14 * p}px) scale(${0.94 + 0.06 * p})` }} />
        )}

        {cur && (
          <article
            key={cur.id}
            ref={carte}
            tabIndex={0}
            aria-roledescription="carte d'annonce"
            aria-label={`${cur.titre}, ${eur(cur.prix)}. Flèche droite pour garder, flèche gauche pour passer.`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={touche}
            className={cx(
              "absolute inset-0 flex touch-none select-none flex-col overflow-hidden rounded-[26px] border border-line-2 bg-[#1d1611] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.8)] outline-offset-4",
              glisse ? "cursor-grabbing" : "cursor-grab transition-transform duration-300 ease-[var(--ease-doux)]",
            )}
            style={{ transform }}
          >
            <div className="relative h-[46%] shrink-0" data-photo="">
              <PhotoAnnonce src={photos[iPhoto] ?? null} className="absolute inset-0" />
              {/* photos suivantes chargées d'avance : le défilement est immédiat */}
              {photos.slice(1).map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={u} src={u} alt="" aria-hidden="true" className="hidden" />
              ))}
              {/* ombre légère en haut : les barres de photos et l'étiquette restent lisibles sur une photo claire */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
              {photos.length > 1 && (
                <div className="absolute inset-x-2 top-1 flex gap-1">
                  {photos.map((u, i) => (
                    <button key={u} type="button" onClick={() => voirPhoto(i)} aria-label={`Photo ${i + 1} sur ${photos.length}`} aria-pressed={i === iPhoto} className="flex h-6 flex-1 items-center">
                      <span className={cx("h-[3px] w-full rounded-full", i === iPhoto ? "bg-ink" : "bg-ink/35")} />
                    </button>
                  ))}
                </div>
              )}
              <span className="absolute left-3 top-8 rounded-full bg-bg0/75 px-2.5 py-1 text-xs font-bold backdrop-blur">{cur.pro ? "Professionnel" : "Particulier"}</span>
              <span aria-hidden="true" className="absolute left-4 top-14 -rotate-12 rounded-2xl border-[3px] border-o bg-bg0/80 px-3.5 py-1 font-display text-3xl font-semibold text-o2" style={{ opacity: opGarde }}>
                Je garde
              </span>
              <span aria-hidden="true" className="absolute right-4 top-14 rotate-12 rounded-2xl border-[3px] border-ink bg-bg0/80 px-3.5 py-1 font-display text-3xl font-semibold" style={{ opacity: opPasse }}>
                Je passe
              </span>
              <PastilleVerdict v={cur.verdict} className="absolute bottom-3 left-3" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-[18px]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="line-clamp-2 font-display text-[21px] font-semibold leading-tight">{cur.titre}</h2>
                <span className="num shrink-0 font-display text-[23px] font-semibold">{eur(cur.prix)}</span>
              </div>
              <p className="text-sm">
                <EcartCote cote={cur.cote} />
              </p>
              {!!cur.aVerifier?.length && (
                <p className="flex flex-wrap gap-1.5">
                  {cur.aVerifier.map((x) => (
                    <span key={x} className="rounded-full border border-warn/50 px-2.5 py-0.5 text-xs font-bold text-warn">
                      À vérifier : {x.toLowerCase()}
                    </span>
                  ))}
                </p>
              )}
              <dl className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  ["Année", cur.annee ?? "?"],
                  ["Km", cur.km != null ? `${Math.round(cur.km / 1000)} k` : "?"],
                  ["Puiss.", cur.ch ? `${cur.ch} ch` : "?"],
                  ["Boîte", cur.boite ? (/auto/i.test(cur.boite) ? "Auto" : "Manuelle") : "?"],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-2xl border border-line bg-creux px-1 py-2">
                    <dt className="text-[11px] text-ink-3">{l}</dt>
                    <dd className="num text-[15px] font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-auto flex items-center justify-between gap-2 text-sm text-ink-2">
                <span className="truncate">{[cur.gen, cur.lieu].filter(Boolean).join(" · ")}</span>
                {cur.url && (
                  <a href={cur.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-1 font-semibold text-o2 underline-offset-4 hover:underline">
                    L&apos;annonce <Externe />
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                )}
              </p>
            </div>
          </article>
        )}

        {!cur && (
          <div className="absolute inset-0 flex flex-col justify-center gap-5 rounded-[26px] border border-dashed border-line-2 p-6">
            <span className="text-[13px] font-bold text-ink-3">Toutes les annonces sont passées</span>
            <p className="font-display text-[38px] font-semibold leading-[1.04] tracking-[-0.02em]">
              Vous en gardez <span className="it">{gardees}.</span>
            </p>
            <button type="button" onClick={onFavoris} className="btn btn-o min-h-14">
              Voir mes coups de cœur
            </button>
            <button type="button" onClick={onNouvelle} className="btn">
              Nouvelle recherche
            </button>
          </div>
        )}
      </div>

      {erreur && (
        <p role="alert" className="mt-3 text-center text-sm text-warn">
          {erreur}
        </p>
      )}

      <nav aria-label="Décider" className="flex items-start justify-center gap-4 pb-2 pt-4">
        <Bouton taille="grand" onClick={() => decider("passe")} label="Je passe" aria="Passer cette annonce" disabled={!cur}>
          <Croix className="size-7" />
        </Bouton>
        <Bouton onClick={annuler} label="Retour" aria="Revenir à l'annonce précédente" disabled={!historique.length}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5">
            <path d="M9 14L4 9l5-5" />
            <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
          </svg>
        </Bouton>
        <Bouton onClick={onFavoris} label="Gardées" aria={`Mes coups de cœur, ${gardees} dans cette recherche`}>
          <span className="num font-display text-lg font-semibold">{gardees}</span>
        </Bouton>
        <Bouton taille="grand" orange onClick={() => decider("garde")} label="Je garde" aria="Garder cette annonce" disabled={!cur}>
          <Coeur className="size-7" />
        </Bouton>
      </nav>
    </div>
  );
}

function Bouton({ children, onClick, label, aria, taille, orange, disabled }: {
  children: React.ReactNode; onClick: () => void; label: string; aria: string; taille?: "grand"; orange?: boolean; disabled?: boolean;
}) {
  return (
    <div className={cx("flex flex-col items-center gap-1.5", taille !== "grand" && "pt-2.5")}>
      <button
        type="button"
        onClick={onClick}
        aria-label={aria}
        disabled={disabled}
        className={cx(
          "grid place-items-center rounded-full border transition disabled:opacity-40",
          taille === "grand" ? "size-[68px]" : "size-12",
          orange ? "border-o bg-o text-[#160904] shadow-[0_12px_34px_-12px_rgb(255_90_31/0.85)] hover:bg-o2" : "border-line-2 bg-glass text-ink hover:border-o/50",
        )}
      >
        {children}
      </button>
      <span className={cx("text-[13px]", taille === "grand" ? "font-bold" : "font-medium text-ink-3")} aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
