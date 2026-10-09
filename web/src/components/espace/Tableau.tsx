/* eslint-disable @next/next/no-img-element -- photos d'annonces servies par Leboncoin et le stockage */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { titreVehicule } from "@/lib/titre";
type NomIcone = Parameters<typeof Ico>[0]["nom"];
import { Ico } from "./Icones";

/* Briques du tableau de bord complet (Benef Pro, illimité). Rendu serveur, sans JavaScript :
   les entrées en cascade passent par la classe CSS « arrivee » (coupée si les animations sont réduites). */

export const eur = (v: number | null | undefined, signe = false) =>
  v == null ? "—" : `${signe && v > 0 ? "+" : ""}${Math.round(v).toLocaleString("fr-FR")} €`;
const cascade = (i: number) => ({ "--i": i }) as CSSProperties;
type Ton = "ok" | "warn" | "bad" | "o";
const TEXTE: Record<Ton, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad", o: "text-o2" };

/** En-tête : bonjour, la date, une phrase qui résume la situation, et le champ pour analyser une annonce. */
export function EnTeteTableau({ prenom, sous, resume, action }: { prenom: string | null; sous: string; resume: ReactNode[]; action: ReactNode }) {
  const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });
  return (
    <section aria-labelledby="tb-titre" className="relative isolate overflow-hidden rounded-[28px] border border-o/25 px-5 py-7 sm:px-8 sm:py-9">
      {/* halo orange et grille discrète : décor seulement */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(90%_120%_at_0%_0%,rgb(255_90_31/0.22),transparent_60%),radial-gradient(60%_90%_at_100%_100%,rgb(255_138_76/0.10),transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(var(--color-ink)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(80%_100%_at_0%_0%,black,transparent)]" />
      <p className="arrivee text-sm font-medium capitalize text-o2" style={cascade(0)}>{date}</p>
      <h1 id="tb-titre" className="arrivee mt-1 font-display text-[clamp(30px,5vw,46px)] font-semibold leading-[1.05] tracking-tight" style={cascade(1)}>
        Bonjour{prenom ? ` ${prenom}` : ""}
      </h1>
      <p className="arrivee mt-2 max-w-2xl text-ink-2" style={cascade(2)}>{sous}</p>
      {resume.length > 0 && (
        <ul className="arrivee mt-4 flex flex-wrap gap-2" style={cascade(3)} aria-label="En bref">
          {resume.map((r, i) => (
            <li key={i} className="rounded-full border border-line-2 bg-bg0/50 px-3 py-1.5 text-sm text-ink-2 backdrop-blur">
              {r}
            </li>
          ))}
        </ul>
      )}
      <div className="arrivee mt-6 max-w-3xl" style={cascade(4)}>{action}</div>
    </section>
  );
}

/** Un grand chiffre : libellé, valeur, précision, et un lien facultatif. `fort` : la carte mise en avant. */
export function Chiffre({ icone, l, v, s, ton, lien, fort, i = 0 }: { icone: NomIcone; l: string; v: string; s?: ReactNode; ton?: Ton; lien?: { href: string; l: string }; fort?: boolean; i?: number }) {
  return (
    <div
      className={cx(
        "arrivee carte relative flex flex-col overflow-hidden p-5",
        fort && "border-o/35 bg-[linear-gradient(160deg,rgb(255_90_31/0.16),transparent_55%),var(--color-panel)]",
      )}
      style={cascade(i)}
    >
      <div className="flex items-center gap-2.5">
        <span className={cx("grid size-9 place-items-center rounded-xl", fort ? "bg-o text-[#160904]" : "bg-glass text-o2")} aria-hidden="true">
          <Ico nom={icone} className="size-[18px]" />
        </span>
        <p className="text-sm text-ink-2">{l}</p>
      </div>
      <p className={cx("num mt-4 font-display text-[clamp(28px,3.2vw,38px)] font-semibold leading-none tracking-tight", ton && TEXTE[ton])}>{v}</p>
      {s && <p className="mt-2 text-sm text-ink-3">{s}</p>}
      {lien && (
        <Link href={lien.href} className="mt-auto pt-4 text-sm font-medium text-o2 underline-offset-4 hover:underline">
          {lien.l} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export type EtapeParc = { cle: string; l: string; n: number; photos: string[]; ton: string };

/** Le parc en étapes, de la voiture repérée à la voiture vendue : un chiffre et les photos de chaque étape. */
export function EtapesParc({ etapes, lien }: { etapes: EtapeParc[]; lien: string }) {
  const total = etapes.reduce((s, e) => s + e.n, 0);
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label={`Parc : ${total} voiture${total > 1 ? "s" : ""} suivie${total > 1 ? "s" : ""}`}>
      {etapes.map((e, i) => (
        <li key={e.cle} className={cx("arrivee min-w-0", i === etapes.length - 1 && "max-sm:col-span-2")} style={cascade(i)}>
          <Link href={lien} className="group relative flex h-full flex-col gap-3 rounded-2xl border border-line bg-glass p-4 transition hover:-translate-y-0.5 hover:border-o/40">
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm text-ink-2">
                <span className={cx("size-2.5 shrink-0 rounded-full", e.ton)} aria-hidden="true" />
                <span className="truncate">{e.l}</span>
              </span>
              <span className="text-xs text-ink-3" aria-hidden="true">{i + 1}/{etapes.length}</span>
            </span>
            <span className="num font-display text-4xl font-semibold leading-none">
              {e.n}
              <span className="sr-only"> voiture{e.n > 1 ? "s" : ""}</span>
            </span>
            <span className="mt-auto flex h-9 items-center" aria-hidden="true">
              {e.photos.length ? (
                e.photos.slice(0, 3).map((p, k) => (
                  <img key={p} src={p} alt="" loading="lazy" referrerPolicy="no-referrer" className={cx("size-9 rounded-full border-2 border-bg1 object-cover", k > 0 && "-ml-2.5")} />
                ))
              ) : (
                <span className="text-xs text-ink-3">{e.n ? "sans photo" : "aucune"}</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export type Affaire = { id: string; titre: string; prix: number | null; verdict: string | null; marge: number | null; note: number | null; photos?: string[] };

/** Les meilleures affaires de la semaine, en cartes photo : la marge d'abord, puis le prix et la note. */
export function Affaires({ affaires }: { affaires: Affaire[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {affaires.map((r, i) => (
        <li key={r.id} className="arrivee min-w-0" style={cascade(i)}>
          <Link href={`/app/rapports/${r.id}`} className="group carte flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-o/40">
            <span className="relative block aspect-[16/9] overflow-hidden bg-glass">
              {r.photos?.[0] ? (
                <img src={r.photos[0]} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" />
              ) : (
                <span className="grid size-full place-items-center text-ink-3" aria-hidden="true">
                  <Ico nom="parc" className="size-8" />
                </span>
              )}
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <span className="rounded-full border border-ok/50 bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-ok backdrop-blur">{r.verdict}</span>
                <span className={cx("num font-display text-2xl font-semibold drop-shadow", (r.marge ?? 0) >= 0 ? "text-ok" : "text-bad")}>
                  {eur(r.marge, true)}
                  <span className="sr-only"> de marge estimée</span>
                </span>
              </span>
            </span>
            <span className="grid gap-1 p-4">
              <span className="line-clamp-2 font-medium leading-snug">{titreVehicule(r.titre)}</span>
              <span className="text-sm text-ink-3">
                Prix {eur(r.prix)}
                {r.note != null && <> · note {r.note}/100</>}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export type Alerte = { href: string; titre: string; txt: string; lvl: "bad" | "warn" };

/** Ce qui demande une action dans le parc, le plus grave d'abord. */
export function AlertesParc({ alertes }: { alertes: Alerte[] }) {
  return (
    <ul className="grid gap-2">
      {alertes.map((a, i) => (
        <li key={i} className="arrivee" style={cascade(i)}>
          <Link href={a.href} className={cx("carte flex items-start gap-3 p-4 text-sm transition hover:border-o/40", a.lvl === "bad" ? "border-bad/40" : "border-warn/30")}>
            <span className={cx("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full font-display text-sm font-bold", a.lvl === "bad" ? "bg-bad/15 text-bad" : "bg-warn/15 text-warn")} aria-hidden="true">
              !
            </span>
            <span className="min-w-0">
              <span className="sr-only">{a.lvl === "bad" ? "Critique : " : "À surveiller : "}</span>
              <b className="block truncate font-medium">{a.titre}</b>
              <span className="text-ink-2">{a.txt}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Titre de section avec un lien « voir tout » à droite. */
export function TitreSection({ id, children, lien, aside }: { id: string; children: ReactNode; lien?: { href: string; l: string }; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 id={id} className="font-display text-xl font-semibold tracking-tight">{children}</h2>
      <span className="flex items-baseline gap-4 text-sm">
        {aside && <span className="text-ink-3">{aside}</span>}
        {lien && (
          <Link href={lien.href} className="font-medium text-o2 underline-offset-4 hover:underline">
            {lien.l} <span aria-hidden="true">→</span>
          </Link>
        )}
      </span>
    </div>
  );
}

/** Raccourci vers un outil : icône, nom, ce qu'il fait. */
export function Outil({ href, icone, l, d, i = 0 }: { href: string; icone: NomIcone; l: string; d: string; i?: number }) {
  return (
    <Link href={href} className="arrivee group carte flex items-start gap-4 p-4 transition hover:-translate-y-0.5 hover:border-o/40" style={cascade(i)}>
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-o/12 text-o2 transition group-hover:bg-o group-hover:text-[#160904]" aria-hidden="true">
        <Ico nom={icone} className="size-5" />
      </span>
      <span className="grid gap-0.5">
        <span className="font-medium">{l}</span>
        <span className="text-sm text-ink-3">{d}</span>
      </span>
    </Link>
  );
}
