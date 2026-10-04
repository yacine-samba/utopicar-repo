"use client";
/* eslint-disable @next/next/no-img-element -- photos d'annonces (Leboncoin ou stockées) affichées telles quelles */
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

/** Silhouette de voiture quand l'annonce n'a pas de photo. */
export function SansPhoto({ className }: { className?: string }) {
  return (
    <div className={cx("grid place-items-center bg-[radial-gradient(120%_120%_at_30%_20%,rgb(255_90_31/0.18),transparent_60%)] text-ink-3", className)} aria-hidden="true">
      <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className="w-1/3 max-w-28 opacity-70">
        <path d="M4 26v-5l5-2 7-8h22l9 8 10 2 3 4v1H4z" />
        <circle cx="16" cy="27" r="4.5" />
        <circle cx="49" cy="27" r="4.5" />
        <path d="M18 19h26M30 11v8" />
      </svg>
    </div>
  );
}

/** Photo d'annonce : chargée à la demande, sans transmettre l'adresse de la page au site d'origine. */
function Img({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [ko, setKo] = useState(false);
  if (ko) return <SansPhoto className={className} />;
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer" draggable={false} onError={() => setKo(true)} className={cx("object-cover", className)} />;
}

/** Carrousel à faire glisser du doigt (ou avec les flèches à la souris), sans ouvrir la carte. */
export function Carrousel({ photos, alt, className }: { photos: string[]; alt: string; className?: string }) {
  const zone = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = photos.length;
  const aller = (k: number) => {
    const z = zone.current;
    if (!z) return;
    const j = Math.max(0, Math.min(n - 1, k));
    z.scrollTo({ left: j * z.clientWidth, behavior: "smooth" });
  };
  if (!n) return <SansPhoto className={cx("aspect-[4/3] w-full", className)} />;
  return (
    <div className={cx("group/c relative aspect-[4/3] w-full overflow-hidden bg-black/40", className)}>
      <div
        ref={zone}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${n} photo${n > 1 ? "s" : ""} : faites glisser pour les voir`}
      >
        {photos.map((p, k) => (
          <div key={p + k} className="size-full shrink-0 snap-center">
            <Img src={p} alt={`${alt}, photo ${k + 1} sur ${n}`} className="size-full" eager={k === 0} />
          </div>
        ))}
      </div>
      {n > 1 && (
        <>
          {(["‹", "›"] as const).map((f, d) => (
            <button
              key={f}
              type="button"
              aria-label={d ? "Photo suivante" : "Photo précédente"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                aller(i + (d ? 1 : -1));
              }}
              disabled={d ? i >= n - 1 : i <= 0}
              className={cx(
                "absolute top-1/2 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-lg text-white opacity-0 transition group-hover/c:opacity-100 disabled:hidden sm:grid",
                d ? "right-2" : "left-2",
              )}
            >
              {f}
            </button>
          ))}
          <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden="true">
            {photos.slice(0, 8).map((_, k) => (
              <span key={k} className={cx("size-1.5 rounded-full transition", k === Math.min(i, 7) ? "bg-white" : "bg-white/45")} />
            ))}
          </span>
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
            {i + 1}/{n}
          </span>
        </>
      )}
    </div>
  );
}

/** Visionneuse plein écran : flèches, clavier, glisser. */
function Visionneuse({ photos, depart, alt, fermer }: { photos: string[]; depart: number; alt: string; fermer: () => void }) {
  const [i, setI] = useState(depart);
  const x0 = useRef<number | null>(null);
  const n = photos.length;
  const suivante = useCallback((d: number) => setI((k) => (k + d + n) % n), [n]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape") fermer();
      if (e.key === "ArrowRight") suivante(1);
      if (e.key === "ArrowLeft") suivante(-1);
    };
    addEventListener("keydown", f);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", f);
      document.body.style.overflow = avant;
    };
  }, [fermer, suivante]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photos de la voiture"
      className="fixed inset-0 z-[60] grid grid-rows-[auto_1fr_auto] bg-black/95"
      onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (x0.current == null) return;
        const dx = e.changedTouches[0].clientX - x0.current;
        if (Math.abs(dx) > 40) suivante(dx < 0 ? 1 : -1);
        x0.current = null;
      }}
    >
      <div className="flex items-center justify-between p-4 text-sm text-white/80">
        <span className="num">
          {i + 1} / {n}
        </span>
        <button type="button" onClick={fermer} className="rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20" autoFocus>
          Fermer
        </button>
      </div>
      <div className="relative grid min-h-0 place-items-center px-2" onClick={fermer}>
        <img src={photos[i]} alt={`${alt}, photo ${i + 1} sur ${n}`} referrerPolicy="no-referrer" className="max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
        {n > 1 && (
          <>
            <button type="button" aria-label="Photo précédente" onClick={(e) => (e.stopPropagation(), suivante(-1))} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
              ‹
            </button>
            <button type="button" aria-label="Photo suivante" onClick={(e) => (e.stopPropagation(), suivante(1))} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
              ›
            </button>
          </>
        )}
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto p-3">
        {photos.map((p, k) => (
          <button key={p + k} type="button" onClick={() => setI(k)} aria-label={`Photo ${k + 1}`} aria-current={k === i} className={cx("h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2", k === i ? "border-o" : "border-transparent opacity-60")}>
            <img src={p} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Mosaïque de photos en tête de rapport : la grande à gauche, les autres à droite, ouverture en plein écran.
    `max` : photos montrées selon la formule ; les suivantes sont annoncées avec le moyen de les voir. */
export function BentoPhotos({ photos, alt, max = 12, verrou }: { photos: string[]; alt: string; max?: number; verrou?: React.ReactNode }) {
  const [vue, setVue] = useState<number | null>(null);
  const visibles = photos.slice(0, max);
  const cachees = photos.length - visibles.length;
  if (!photos.length) return null;
  const petites = visibles.slice(1, 5);
  const reste = visibles.length - 1 - petites.length;
  return (
    <section aria-label="Photos de la voiture" className="grid gap-2">
      <div className={cx("grid gap-2", petites.length ? "grid-cols-2 grid-rows-[2fr_1fr] sm:grid-cols-4 sm:grid-rows-2" : "grid-cols-1")} style={{ height: "clamp(240px, 46vw, 440px)" }}>
        <button type="button" onClick={() => setVue(0)} className={cx("relative overflow-hidden rounded-2xl", petites.length ? "col-span-2 row-span-2 max-sm:col-span-2 max-sm:row-span-1" : "")} aria-label="Agrandir la photo 1">
          <Img src={visibles[0]} alt={`${alt}, photo 1`} className="size-full transition duration-500 hover:scale-[1.03]" eager />
        </button>
        {petites.map((p, k) => {
          const derniere = k === petites.length - 1 && reste > 0;
          return (
            <button key={p + k} type="button" onClick={() => setVue(k + 1)} className={cx("relative overflow-hidden rounded-2xl", k >= 2 && "max-sm:hidden")} aria-label={`Agrandir la photo ${k + 2}`}>
              <Img src={p} alt={`${alt}, photo ${k + 2}`} className="size-full transition duration-500 hover:scale-[1.04]" />
              {derniere && <span className="absolute inset-0 grid place-items-center bg-black/55 font-display text-lg font-semibold text-white">+{reste} photo{reste > 1 ? "s" : ""}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-3">
        <button type="button" onClick={() => setVue(0)} className="underline-offset-4 hover:text-ink hover:underline">
          Voir les {visibles.length} photo{visibles.length > 1 ? "s" : ""} en grand
        </button>
        {cachees > 0 && verrou}
      </div>
      {vue != null && <Visionneuse photos={visibles} depart={vue} alt={alt} fermer={() => setVue(null)} />}
    </section>
  );
}
