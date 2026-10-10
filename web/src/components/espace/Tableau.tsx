/* eslint-disable @next/next/no-img-element -- photos d'annonces servies par Leboncoin et le stockage */
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { titreVehicule } from "@/lib/titre";
import { Ico } from "./Icones";
import { BoutonAnalyserAnnonce } from "./BoutonAnalyserAnnonce";

/* Briques du tableau de bord complet (Benef Pro, illimité). Rendu serveur ; seul « Analyser » est un bouton client.
   Principes suivis :
   - il répond d'abord à « que dois-je faire maintenant ? » (Votre journée : peu d'actions, classées, chacune avec sa raison) ;
   - le stock se lit par tranches d'âge (0–30, 31–45, 46–60, plus de 60 jours), comme chez les marchands ;
   - la couleur n'est jamais seule : chaque état a aussi un mot ou un symbole (WCAG 1.4.1), chaque graphique un résumé en texte ;
   - le rouge est réservé à ce qui doit être corrigé maintenant.
   Les entrées en cascade passent par la classe CSS « arrivee » (coupée si les animations sont réduites). */

type NomIcone = Parameters<typeof Ico>[0]["nom"];
export const eur = (v: number | null | undefined, signe = false) =>
  v == null ? "—" : `${signe && v > 0 ? "+" : ""}${Math.round(v).toLocaleString("fr-FR")} €`;
const cascade = (i: number) => ({ "--i": i }) as CSSProperties;
type Ton = "ok" | "warn" | "bad" | "o";
const TEXTE: Record<Ton, string> = { ok: "text-ok", warn: "text-warn", bad: "text-bad", o: "text-o2" };

/** En-tête : la date, le bonjour (ou bonsoir), l'essentiel en trois pastilles, le champ pour analyser ; à droite, la journée. */
export function EnTeteTableau({ prenom, sous, resume, action, journee }: { prenom: string | null; sous: string; resume: string[]; action: ReactNode; journee: ReactNode }) {
  const maintenant = new Date();
  const date = maintenant.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });
  const heure = Number(maintenant.toLocaleString("fr-FR", { hour: "numeric", hour12: false, timeZone: "Europe/Paris" }));
  return (
    <section aria-labelledby="tb-titre" className="relative isolate grid overflow-hidden rounded-[28px] border border-o/25 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      {/* halo orange et grille discrète : décor seulement */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_0%_0%,rgb(255_90_31/0.24),transparent_60%),radial-gradient(50%_80%_at_100%_100%,rgb(255_138_76/0.08),transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(var(--color-ink)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_100%_at_0%_0%,black,transparent)]" />
      <div className="flex flex-col px-5 py-7 sm:px-8 sm:py-9">
        <p className="arrivee text-sm font-medium first-letter:uppercase text-o2" style={cascade(0)}>{date}</p>
        <h1 id="tb-titre" className="arrivee mt-1 font-display text-[clamp(32px,5vw,50px)] font-semibold leading-[1.02] tracking-tight" style={cascade(1)}>
          {heure >= 18 || heure < 5 ? "Bonsoir" : "Bonjour"}
          {prenom ? ` ${prenom}` : ""}
        </h1>
        <p className="arrivee mt-2 max-w-xl text-ink-2" style={cascade(2)}>{sous}</p>
        <ul className="arrivee mt-4 flex flex-wrap gap-2" style={cascade(3)} aria-label="En bref">
          {resume.map((r) => (
            <li key={r} className="rounded-full border border-line-2 bg-bg0/50 px-3 py-1.5 text-sm text-ink-2 backdrop-blur">{r}</li>
          ))}
        </ul>
        <div className="arrivee mt-auto pt-7" style={cascade(4)}>{action}</div>
      </div>
      <div className="border-t border-line bg-bg0/40 px-5 py-6 backdrop-blur-md sm:px-8 xl:border-l xl:border-t-0">{journee}</div>
    </section>
  );
}

export type Action = { ton: "bad" | "warn" | "o" | "ok"; etiquette: string; titre: string; raison: string; lien: { href: string; l: string; externe?: boolean }; photo?: string | null };
const PUCE: Record<Action["ton"], { cls: string; signe: string }> = {
  bad: { cls: "bg-bad/15 text-bad", signe: "!" },
  warn: { cls: "bg-warn/15 text-warn", signe: "!" },
  o: { cls: "bg-o/15 text-o2", signe: "★" },
  ok: { cls: "bg-ok/15 text-ok", signe: "✓" },
};

/** Votre journée : les quelques décisions du jour, la plus urgente d'abord, chacune avec sa raison et un lien pour agir. */
export function Journee({ actions }: { actions: Action[] }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Votre journée</h2>
        <span className="text-sm text-ink-3">{actions.length ? `${actions.length} décision${actions.length > 1 ? "s" : ""}` : ""}</span>
      </div>
      {actions.length ? (
        <ol className="grid gap-2.5">
          {actions.map((a, i) => (
            <li key={a.titre + i} className="arrivee" style={cascade(5 + i)}>
              <div className="group relative flex gap-3 rounded-2xl border border-line bg-glass p-3 transition hover:border-o/40">
                {a.photo ? (
                  <img src={a.photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className={cx("grid size-12 shrink-0 place-items-center rounded-xl font-display text-lg font-bold", PUCE[a.ton].cls)} aria-hidden="true">{PUCE[a.ton].signe}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-xs">
                    <span className={cx("font-semibold uppercase tracking-wide", TEXTE[a.ton])}>{a.etiquette}</span>
                  </p>
                  <p className="truncate font-medium">{a.titre}</p>
                  <p className="text-sm text-ink-3">{a.raison}</p>
                  {/* le lien couvre toute la carte (clic partout), son texte dit l'action */}
                  <Link
                    href={a.lien.href}
                    {...(a.lien.externe ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="mt-1 inline-flex text-sm font-medium text-o2 underline-offset-4 after:absolute after:inset-0 after:rounded-2xl group-hover:underline"
                  >
                    {a.lien.l} <span aria-hidden="true">&nbsp;→</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="flex items-center gap-3 rounded-2xl border border-ok/30 bg-ok/5 p-4 text-sm text-ink-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ok/15 text-ok" aria-hidden="true">✓</span>
          Rien d&apos;urgent : le parc est à jour. Une annonce à chiffrer ? Collez son lien à gauche.
        </p>
      )}
    </div>
  );
}

/** Un grand chiffre : libellé, valeur, comparaison au mois dernier (en mots et en flèche), précision, lien facultatif. */
export function Chiffre({ icone, l, v, s, ton, delta, fort, i = 0 }: { icone: NomIcone; l: string; v: string; s?: ReactNode; ton?: Ton; delta?: { v: number; l: string } | null; fort?: boolean; i?: number }) {
  return (
    <div
      className={cx("arrivee carte relative flex flex-col overflow-hidden p-4 sm:p-5", fort && "border-o/35 bg-[linear-gradient(160deg,rgb(255_90_31/0.16),transparent_55%),var(--color-panel)]")}
      style={cascade(i)}
    >
      <div className="flex items-center gap-2.5">
        <span className={cx("grid size-9 shrink-0 place-items-center rounded-xl", fort ? "bg-o text-[#160904]" : "bg-glass text-o2")} aria-hidden="true">
          <Ico nom={icone} className="size-[18px]" />
        </span>
        <p className="text-sm leading-tight text-ink-2">{l}</p>
      </div>
      <p className={cx("num mt-4 font-display text-[clamp(24px,3.2vw,38px)] font-semibold leading-none tracking-tight", ton && TEXTE[ton])}>{v}</p>
      {delta && delta.v !== 0 && (
        <p className={cx("mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", delta.v > 0 ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad")}>
          <span aria-hidden="true">{delta.v > 0 ? "▲" : "▼"}</span>
          {eur(delta.v, true)} {delta.l}
        </p>
      )}
      {s && <p className="mt-2 text-sm text-ink-3">{s}</p>}
    </div>
  );
}

export type Opportunite = { cle: string; titre: string; prix: number | null; cote: number | null; pct: number; annee: number | null; km: number | null; lieu: string | null; url: string | null; photo: string | null; recherche: string | null };

/** Le marché de la semaine : les nouvelles annonces de vos recherches nettement sous la cote, à analyser en un clic. */
export function Marche({ annonces }: { annonces: Opportunite[] }) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Nouvelles annonces sous la cote, défilement horizontal"
      className="-mx-4 overflow-x-auto px-4 pb-2 [scroll-snap-type:x_mandatory] sm:mx-0 sm:px-0"
    >
      <ul className="flex gap-3 xl:grid xl:grid-cols-4">
        {annonces.map((a, i) => (
          <li key={a.cle} className="arrivee w-[78%] shrink-0 [scroll-snap-align:start] sm:w-[46%] lg:w-[31%] xl:w-auto" style={cascade(i)}>
            <article className="carte flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[16/10] bg-glass">
                {a.photo ? (
                  <img src={a.photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-ink-3" aria-hidden="true"><Ico nom="parc" className="size-8" /></span>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-ok px-2.5 py-1 text-xs font-bold text-[#04140a] shadow">
                  −{Math.round(a.pct * 100)} % <span className="font-medium">sous la cote</span>
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="line-clamp-2 font-medium leading-snug">{a.titre}</h3>
                <p className="text-sm text-ink-3">{[a.annee, a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null, a.lieu].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="num font-display text-2xl font-semibold">{eur(a.prix)}</span>
                  {a.cote != null && <span className="num text-sm text-ink-3">cote {eur(a.cote)}</span>}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                  <BoutonAnalyserAnnonce url={a.url} className="btn-o" />
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      Voir l&apos;annonce<span className="sr-only"> (nouvel onglet)</span> <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
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
              <span className="text-xs text-ink-3 max-sm:hidden" aria-hidden="true">{i + 1}/{etapes.length}</span>
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

export type VoitureStock = { id: string; titre: string; jours: number | null; photo: string | null };
const TRANCHES = [
  { l: "0 à 30 j", max: 30, cls: "bg-ok", txt: "text-ok", motif: "" },
  { l: "31 à 45 j", max: 45, cls: "bg-o3", txt: "text-o3", motif: "" },
  { l: "46 à 60 j", max: 60, cls: "bg-warn", txt: "text-warn", motif: "[background-image:repeating-linear-gradient(135deg,rgb(0_0_0/0.25)_0_3px,transparent_3px_7px)]" },
  { l: "plus de 60 j", max: Infinity, cls: "bg-bad", txt: "text-bad", motif: "[background-image:repeating-linear-gradient(135deg,rgb(0_0_0/0.35)_0_2px,transparent_2px_5px)]" },
] as const;
const tranche = (j: number | null) => TRANCHES.findIndex((t) => (j ?? 0) <= t.max);

/** Âge du stock par tranches : une barre lisible sans la couleur (chiffres et motifs), un résumé en phrase, chaque voiture avec ses jours. */
export function AgeStock({ voitures }: { voitures: VoitureStock[] }) {
  if (!voitures.length) return <p className="text-sm text-ink-3">Aucune voiture en stock pour l&apos;instant.</p>;
  const n = TRANCHES.map((_, k) => voitures.filter((v) => tranche(v.jours) === k).length);
  const connus = voitures.filter((v) => v.jours != null);
  const moyenne = connus.length ? Math.round(connus.reduce((s, v) => s + (v.jours ?? 0), 0) / connus.length) : null;
  const vieilles = n[2] + n[3];
  const tri = [...voitures].sort((a, b) => (b.jours ?? -1) - (a.jours ?? -1));
  return (
    <div className="grid gap-4">
      <p className="text-sm text-ink-2">
        {voitures.length} voiture{voitures.length > 1 ? "s" : ""} en stock
        {moyenne != null && <>, depuis <b className="num text-ink">{moyenne} jours</b> en moyenne</>}
        {vieilles ? <>, dont <b className="text-warn">{vieilles} au-delà de 45 jours</b></> : " : aucune au-delà de 45 jours"}.
      </p>
      <div className="flex h-9 overflow-hidden rounded-xl border border-line" aria-hidden="true">
        {n.map((k, i) =>
          k ? (
            <span key={i} className={cx("grid place-items-center text-sm font-semibold text-[#160904]", TRANCHES[i].cls, TRANCHES[i].motif)} style={{ flex: k }}>
              {k}
            </span>
          ) : null,
        )}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-3" aria-label="Tranches d'âge">
        {TRANCHES.map((t, i) => (
          <li key={t.l} className="flex items-center gap-1.5">
            <span className={cx("size-2.5 rounded-sm", t.cls, t.motif)} aria-hidden="true" />
            {t.l} <b className="num text-ink-2">{n[i]}</b>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-2">
        {tri.slice(0, 8).map((v) => {
          const t = TRANCHES[Math.max(0, tranche(v.jours))];
          return (
            <li key={v.id}>
              <Link href={`/app/parc/${v.id}`} className="flex items-center gap-2 rounded-full border border-line-2 py-1 pl-1 pr-3 text-sm transition hover:border-o/40">
                {v.photo ? <img src={v.photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-7 rounded-full object-cover" /> : <span className={cx("size-7 rounded-full", t.cls, t.motif)} aria-hidden="true" />}
                <span className="max-w-44 truncate">{titreVehicule(v.titre)}</span>
                <b className={cx("num", t.txt)}>{v.jours != null ? `${v.jours} j` : "date ?"}</b>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
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
                <span className="grid size-full place-items-center text-ink-3" aria-hidden="true"><Ico nom="parc" className="size-8" /></span>
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
