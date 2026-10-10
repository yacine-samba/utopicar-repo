import type { CSSProperties } from "react";
import { EXEMPLES, srcSetDemo } from "@/lib/demo";
import type { Apercu } from "@/components/analyse/Patience";

/* L'outil en action sur une annonce, lisible sans explication (même carte sur l'accueil et sur Benef) :
   1. un balayage passe sur la photo (« Analyse… »), puis ce à quoi l'annonce est comparée ;
   2. deux barres côte à côte, le prix du marché puis celui de l'annonce, l'écart hachuré (vert sous le marché, rouge au-dessus) ;
   3. le verdict dit pourquoi, et à droite le chiffre qui compte pour la page.
   Par défaut, un exemple ; dès que la personne fait son scan, la carte montre SON annonce (voir CarteHero).
   CSS seul (classes « scene », « balayage », « passe », « pas », « jauge » de globals.css). */

export type CarteAnalyse = {
  /** photo de l'annonce (locale ou Leboncoin) ; sans photo, un fond neutre */
  photo: string | null;
  titre: string;
  /** ce qui remplace « Analyse… » dans l'étiquette du haut */
  comparaison: string;
  prix: number;
  /** prix du marché ; inconnu (pas assez d'annonces comparables) : pas de barres */
  marche: number | null;
  verdict: string;
  /** couleur du verdict : bon (défaut), à négocier, à éviter */
  ton?: "ok" | "warn" | "bad";
  droite: { l: string; v: string; ton?: "ok" | "bad" };
  /** phrase lue par les lecteurs d'écran à la place de la scène */
  resume: string;
};

const e = (v: number) => `${Math.round(v).toLocaleString("fr-FR").replace(/ /g, " ")} €`;

/** Accueil : la vraie annonce Clio IV de la démonstration (relevée le 3 octobre 2026), et le prix à proposer. */
export const carteDepuisExemple = (cle: string): CarteAnalyse | null => {
  const x = EXEMPLES[cle];
  if (!x) return null;
  const cote = x.lignes[0].v;
  const proposer = x.lignes[3].v;
  const n = /(\d+)\s/.exec(x.lignes[0].s)?.[1];
  return {
    photo: x.photos[x === EXEMPLES.clio ? 1 : 0],
    titre: x.titre,
    comparaison: n ? `${n} annonces comparées` : "Comparée au marché",
    prix: x.prix,
    marche: cote,
    verdict: x.verdict,
    ton: x.ton,
    droite: proposer != null ? { l: "Proposez", v: e(proposer) } : { l: "Conseil", v: "Passer", ton: "bad" },
    resume: `Exemple réel : une ${x.titre} à ${e(x.prix)}${cote ? `, prix du marché ${e(cote)}` : ""}. Verdict : ${x.verdict.toLowerCase()}${proposer ? `, proposez ${e(proposer)}` : ""}.`,
  };
};
export const CARTE_ACCUEIL: CarteAnalyse = carteDepuisExemple("clio")!;

/** L'aperçu de l'annonce de la personne (champ d'essai) : sa photo, son prix face au marché, un verdict prudent. */
export function carteDepuisApercu(a: Apercu, photo: string | null): CarteAnalyse | null {
  if (!a.prix) return null;
  const m = a.cote?.mediane ?? null;
  const r = m ? a.prix / m : null;
  const eviter = a.fiab.k === "eviter" || a.defauts.some((x) => x.piege);
  const [verdict, ton]: [string, "ok" | "warn" | "bad"] = eviter
    ? ["À éviter", "bad"]
    : r == null
      ? ["Aperçu prêt", "warn"]
      : r <= 0.97
        ? ["Bon prix", "ok"]
        : r <= 1.05
          ? ["Prix correct", "warn"]
          : ["Trop cher", "bad"];
  const nd = a.defauts.length;
  return {
    photo,
    titre: a.titre || "Votre annonce",
    comparaison: a.cote ? `${a.cote.n} annonces comparées` : "Analyse terminée",
    prix: a.prix,
    marche: m,
    verdict,
    ton,
    droite: { l: "Défauts repérés", v: String(nd), ton: nd ? "bad" : "ok" },
    resume: `Votre annonce : ${a.titre} à ${e(a.prix)}${m ? `, prix du marché ${e(m)}` : ""}. ${verdict}. ${nd} défaut${nd > 1 ? "s" : ""} repéré${nd > 1 ? "s" : ""} dans le texte.`,
  };
}

/** Benef : une Yaris III achetée sous le marché (8 350 €, la cote de la Yaris de la démonstration),
    revendue à 8 300 € avec 550 € de frais : la marge nette. */
const yaris = EXEMPLES.yaris;
const COTE_YARIS = yaris.lignes[0].v ?? 8350;
const ACHAT_YARIS = 6900, REVENTE_YARIS = 8300, FRAIS_YARIS = 550;
export const CARTE_BENEF: CarteAnalyse = {
  photo: yaris.photos[1],
  titre: "Toyota Yaris III 1.33 VVT-i",
  comparaison: "Yaris III · comparée au marché",
  prix: ACHAT_YARIS,
  marche: COTE_YARIS,
  verdict: "GO · à acheter",
  droite: { l: "Marge nette", v: `+${e(REVENTE_YARIS - ACHAT_YARIS - FRAIS_YARIS)}`, ton: "ok" },
  resume: `Exemple : une Toyota Yaris III à ${e(ACHAT_YARIS)}, pour un prix du marché de ${e(COTE_YARIS)}. Revendue ${e(REVENTE_YARIS)} avec ${e(FRAIS_YARIS)} de frais, il reste ${e(REVENTE_YARIS - ACHAT_YARIS - FRAIS_YARIS)} de marge nette. Verdict : GO, à acheter.`,
};

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const PILULE = { ok: "bg-[#3ecb7f] text-[#04140a]", warn: "bg-[#ffc53d] text-[#1a1300]", bad: "bg-[#ff7a7a] text-[#1a0606]" };
const SIGNE = { ok: "✓", warn: "!", bad: "✕" };

/** `remplace` : carte posée après un scan, elle se joue tout de suite (sans attendre l'apparition de la page). */
export function PreuveAnimee({ carte = CARTE_ACCUEIL, remplace = false }: { carte?: CarteAnalyse; remplace?: boolean }) {
  const ton = carte.ton ?? "ok";
  const m = carte.marche;
  // les barres : la plus longue des deux fait toute la largeur ; l'écart est hachuré
  const max = Math.max(carte.prix, m ?? 0) || 1;
  const pc = (eur: number) => `${(eur / max) * 100}%`;
  const sous = m != null && carte.prix <= m;
  const ecart = m != null ? Math.abs(m - carte.prix) : 0;
  const locale = !!carte.photo && carte.photo.startsWith("/images/demo/");
  const droiteCls = carte.droite.ton === "ok" ? "text-ok" : carte.droite.ton === "bad" ? "text-bad" : "";
  return (
    <figure className={`${remplace ? "" : "arrivee attend "}mx-auto w-full max-w-[420px]`} style={{ "--i": 2 } as CSSProperties}>
      <figcaption className="sr-only">{carte.resume}</figcaption>
      <div className="scene relative isolate aspect-[4/5] overflow-hidden rounded-[30px] border border-line-2 bg-[radial-gradient(120%_90%_at_30%_10%,#3a2a20,#120d0a)] shadow-[0_40px_100px_-40px_rgb(255_90_31/0.6)]" aria-hidden="true">
        {carte.photo &&
          (locale ? (
            // eslint-disable-next-line @next/next/no-img-element -- photo de démonstration, servie en local et compressée
            <img src={carte.photo} srcSet={srcSetDemo(carte.photo)} sizes="(max-width: 480px) 92vw, 420px" alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- première photo de l'annonce analysée, servie par Leboncoin
            <img src={carte.photo} referrerPolicy="no-referrer" alt="" className="absolute inset-0 -z-10 size-full object-cover" />
          ))}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.4)_0%,transparent_26%,transparent_38%,rgb(0_0_0/0.9)_100%)]" />

        {/* 1. le balayage d'analyse */}
        <div className="balayage pointer-events-none absolute inset-x-0 top-0 h-[38%] border-b-2 border-o bg-[linear-gradient(180deg,transparent,rgb(255_90_31/0.28))] shadow-[0_6px_24px_rgb(255_90_31/0.55)]" style={d(0.15)} />
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-white/20 bg-black/50 py-1.5 pl-2 pr-3 text-sm font-medium text-white backdrop-blur-md">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white text-[9px] font-bold text-black">lbc</span>
          <span className="relative grid min-w-0">
            <span className="passe col-start-1 row-start-1 flex items-center gap-1.5" style={d(0.1)}>
              <span className="size-1.5 animate-pulse rounded-full bg-o" /> Analyse…
            </span>
            <span className="pas col-start-1 row-start-1 truncate" style={d(1.3)}>
              {carte.comparaison}
            </span>
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-4 grid gap-3 text-white">
          {/* 2. le prix face au marché : deux barres côte à côte, l'écart hachuré */}
          {m != null && (
            <div className="pas grid gap-2.5 rounded-2xl border border-white/15 bg-black/50 p-4 text-sm backdrop-blur-md" style={d(1.0)}>
              <div className="grid grid-cols-[4.5rem_1fr_4.2rem] items-center gap-2.5">
                <span className="text-white/75">Marché</span>
                <span className="relative h-2.5 rounded-full bg-white/10">
                  <span className="jauge absolute inset-y-0 left-0 rounded-full bg-white/80" style={{ width: pc(m), ...d(1.1) }} />
                </span>
                <b className="num text-right">{e(m)}</b>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr_4.2rem] items-center gap-2.5">
                <span className="text-white/75">Annonce</span>
                <span className="relative h-2.5 rounded-full bg-white/10">
                  <span className="jauge absolute inset-y-0 left-0 rounded-l-full bg-o" style={{ width: pc(Math.min(carte.prix, m)), ...d(1.3) }} />
                  <span
                    className={`pas absolute inset-y-0 rounded-r-full ${sous ? "bg-[repeating-linear-gradient(135deg,#3ecb7f_0_3px,transparent_3px_6px)]" : "bg-[repeating-linear-gradient(135deg,#ff7a7a_0_3px,transparent_3px_6px)]"}`}
                    style={{ left: pc(Math.min(carte.prix, m)), width: pc(ecart), ...d(1.6) }}
                  />
                </span>
                <b className="num text-right text-o3">{e(carte.prix)}</b>
              </div>
            </div>
          )}

          {/* 3. le verdict, et pourquoi ; à droite, le chiffre qui compte pour la page */}
          <div className="pas flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg0 px-4 py-3 text-ink shadow-lg" style={d(1.9)}>
            <span className="grid min-w-0 gap-1">
              <span className={`w-fit rounded-full px-2.5 py-0.5 text-sm font-bold ${PILULE[ton]}`}>
                {SIGNE[ton]} {carte.verdict}
              </span>
              {m != null && ecart > 0 ? (
                <span className={`text-xs font-medium ${sous ? "text-ok" : "text-bad"}`}>
                  {e(ecart)} {sous ? "sous le marché" : "au-dessus du marché"}
                </span>
              ) : (
                <span className="truncate text-xs text-ink-3">{carte.titre}</span>
              )}
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-xs font-medium text-ink-3">{carte.droite.l}</span>
              <span className={`num font-display text-[32px] font-semibold leading-none ${droiteCls}`}>{carte.droite.v}</span>
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
