"use client";
/* Rapport complet de l'espace Benef : en-tête, bilan (verdict, note, quatre questions, argent, travaux), puis les sections
   de détail au format de l'outil Garage et le calcul du deal à côté, tous deux tirés du bilan.
   Illimité et Pro voient tout ; les formules plus basses voient une version réduite (sections sous cadenas). */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Analyse, ParamsPro } from "@/lib/analyse/couts";
import { eur } from "@/lib/analyse/couts";
import { probaTexte, type SourcePoste } from "@/lib/analyse/travaux";
import { bilan as calculBilan } from "@/lib/analyse/bilan";
import { CHECKS, } from "@/lib/analyse/garage";
import { ouvertePar, SECTIONS, SECTIONS_PRO, sectionsDe, type Section } from "@/lib/analyse/sections";
import type { Rapport } from "@/lib/analyse/rapport";
import { OFFRES, type OffreId } from "@/lib/offres";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx, inputCls } from "@/lib/cx";
import { Copier, useReglages } from "../ui";
import { PiecesDossier } from "./PiecesDossier";
import { AjouterParc } from "./AjouterParc";
import { AnalysePhotos } from "@/components/analyse/AnalysePhotos";
import { BarreSections, BoutonSections, useSectionActive, type EntreeSommaire } from "./SommaireRapport";
import { Bilan, useBilan } from "@/components/analyse/Bilan";
import { SuiteRapport } from "@/components/analyse/SuiteRapport";
import { useProfilAnalyse } from "@/components/analyse/ProfilAnalyse";

type Poste = { categorie: string; libelle: string; montant: number };
const CATEGORIE: Record<SourcePoste, string> = { annonce: "petite mécanique", photos: "cosmétique", ia: "petite mécanique", entretien: "consommables", moteur: "remise en confiance", vendeur: "petite mécanique", visite: "petite mécanique" };

const e = (v: number | null | undefined) => (v == null || !isFinite(v) ? "—" : eur(v));
const km = (v: number | null | undefined) => (v == null ? null : `${Math.round(v).toLocaleString("fr-FR")} km`);
const STATUT_CTRL: Record<string, { i: string; c: string }> = { ok: { i: "✓", c: "text-ok border-ok/40" }, attention: { i: "!", c: "text-warn border-warn/40" }, probleme: { i: "✕", c: "text-bad border-bad/40" }, inconnu: { i: "?", c: "text-ink-3 border-line-2" } };
const TON_DIT: Record<string, string> = { "prouvé": "border-ok/40 text-ok", "annoncé": "border-o/40 text-o2", "non mentionné": "border-line-2 text-ink-3", contradictoire: "border-bad/40 text-bad" };
const CATEGORIES = ["cosmétique", "consommables", "remise en confiance", "petite mécanique", "non estimable sans inspection"];

function Liste({ items, vide = "Rien à signaler." }: { items?: string[]; vide?: string }) {
  if (!items?.length) return <p className="text-sm text-ink-3">{vide}</p>;
  return (
    <ul className="grid gap-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2 text-[15px] text-ink-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-o2" aria-hidden="true" />
          {x}
        </li>
      ))}
    </ul>
  );
}

function Script({ texte, label }: { texte?: string; label: string }) {
  if (!texte) return null;
  return (
    <div className="grid gap-2">
      <p className="whitespace-pre-line rounded-xl border border-line bg-bg0/60 p-3 text-[15px]">{texte}</p>
      <div>
        <Copier texte={texte} label={label} />
      </div>
    </div>
  );
}

function Bloc({ id, titre, note, children, verrou, masque }: { id: Section; titre: string; note?: string; children: ReactNode; verrou?: OffreId | null; masque?: boolean }) {
  if (masque) return null;
  return (
    <section id={`r-${id}`} className="carte scroll-mt-28 p-5 sm:p-6" aria-labelledby={`r-${id}-t`}>
      <div className="mb-4">
        <h2 id={`r-${id}-t`} className="font-display text-xl font-semibold">
          {titre}
        </h2>
        {note && <p className="mt-1 text-sm text-ink-3">{note}</p>}
      </div>
      {verrou ? (
        <div className="rounded-xl border border-dashed border-line-2 p-4 text-sm text-ink-2">
          Inclus dans Benef {OFFRES[verrou].nom}.{" "}
          <Link href="/app/compte#formule" className="text-o2 underline underline-offset-4">
            Voir les formules
          </Link>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function Tableau({ tetes, lignes }: { tetes: string[]; lignes: ReactNode[][] }) {
  if (!lignes.length) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="text-ink-3">
          <tr className="border-b border-line">
            {tetes.map((t) => (
              <th key={t} scope="col" className="px-3 py-2 font-medium">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {l.map((c, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Graphique du prix : fourchette des annonces comparables, cote, prix demandé, plafond. */
function GraphePrix({ points, bande }: { points: { l: string; v: number | null; c: string }[]; bande: [number, number] | null }) {
  const vals = [...points.map((p) => p.v), ...(bande ?? [])].filter((x): x is number => x != null && x > 0);
  if (vals.length < 2) return null;
  const min = Math.min(...vals) * 0.92;
  const max = Math.max(...vals) * 1.05;
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div className="grid gap-3" role="img" aria-label={points.filter((p) => p.v).map((p) => `${p.l} ${e(p.v)}`).join(", ")}>
      <div className="relative mx-2 h-12">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        {bande && <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-o/25" style={{ left: pos(bande[0]), width: `calc(${pos(bande[1])} - ${pos(bande[0])})` }} title="Moitié centrale des annonces comparables" />}
        {points.filter((p) => p.v).map((p) => (
          <span key={p.l} className={cx("absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg0", p.c)} style={{ left: pos(p.v!) }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {bande && (
          <li className="flex items-center gap-1.5 text-ink-2">
            <span className="h-2 w-4 rounded-full bg-o/25" /> Moitié des annonces ({e(bande[0])} à {e(bande[1])})
          </li>
        )}
        {points.filter((p) => p.v).map((p) => (
          <li key={p.l} className="flex items-center gap-1.5 text-ink-2">
            <span className={cx("size-2.5 rounded-full", p.c)} /> {p.l} {e(p.v)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RapportComplet({ a, r, reg, offre, id, parc, lien, parcId = null }: { a: Analyse; r: Rapport; reg: ParamsPro; offre: OffreId; id?: string | null; parc: boolean; lien?: string; parcId?: string | null }) {
  const router = useRouter();
  const ok = new Set(sectionsDe(offre));
  const verrou = (s: Section) => (ok.has(s) ? null : ouvertePar(s));
  // vue pro par défaut (l'essentiel pour décider) ; « Détail profond » ouvre toutes les sections, choix gardé sur l'appareil
  const [mode, setMode] = useReglages("utp-rapport", { profond: false });
  const montre = (s: Section) => mode.profond || SECTIONS_PRO.includes(s);
  const v = r.vehicule ?? {};
  const m = r.marche ?? {};
  const { profil } = useProfilAnalyse();
  // postes de départ : le budget travaux du bilan (sûrs à leur coût moyen, probables à leur coût pondéré), modifiables
  const [postes, setPostes] = useState<Poste[]>(() =>
    calculBilan(a, profil).travaux.postes.filter((p) => !p.piege).map((p) => ({ categorie: p.nc ? "non estimable sans inspection" : CATEGORIE[p.source], libelle: p.proba < 1 ? `${p.libelle} (${probaTexte(p.proba)})` : p.libelle, montant: p.nc ? 0 : Math.round(((p.min + p.max) / 2) * Math.min(1, p.proba) / 10) * 10 })),
  );
  const [prudence, setPrudence] = useState(() => ({ debutant: 30, habitue: 20, pro: 10 })[profil.experience]);
  const [prixTest, setPrixTest] = useState("");
  const [supp, setSupp] = useState(0);
  const travaux = Math.round(postes.reduce((s, p) => s + (p.montant || 0), 0));
  const remise = Math.round(travaux * (1 + prudence / 100));
  const prix = Number(prixTest.replace(/\s/g, "")) || null;
  const b = useBilan(a, { prix, travaux, remise });
  const g = b.argent;
  const plafondOk = g.plafond != null && g.plafond > 0 ? g.plafond : null;
  const remplir = (t?: string) =>
    (t ?? "").replace(/\{OFFRE\}/g, g.offre != null ? eur(g.offre) : "votre offre").replace(/\{CIBLE\}/g, g.cible != null ? eur(g.cible) : "votre prix cible").replace(/\{PLAFOND\}/g, plafondOk != null ? eur(plafondOk) : "votre plafond");
  const lignes = [
    { l: g.retenu ? `${g.retenu.l} (${g.retenu.delai})` : "Revente", d: a.cote ? `Cote de l'outil sur ${a.cote.n} annonces` : g.retenu?.revente != null ? `Cote estimée, confiance ${m.confiance || "faible"}` : "Cote manquante", v: g.retenu?.revente ?? null, tete: true },
    { l: prix != null ? "Votre prix" : "Prix demandé", d: "", v: g.prix != null ? -g.prix : null },
    { l: "Travaux", d: `Postes ci-dessous, prudence ${prudence} % comprise`, v: -g.travauxRetenus },
    { l: "Carte grise", d: profil.negociant ? "Négociant : déclaration d'achat" : "", v: g.cg == null ? null : -g.cg },
    { l: "Trajet", d: g.dist != null ? `${Math.round(g.dist).toLocaleString("fr-FR")} km × 2 × ${profil.kmCost.toLocaleString("fr-FR")} €` : "Distance inconnue", v: g.trajet == null ? null : -g.trajet },
    { l: "Frais par voiture", d: "CT, nettoyage, photos, annonce", v: -g.fraisFixes },
  ];
  const ng = r.negociation ?? {};
  const msg1 = ng.message1 || r.messageVendeur || a.ia?.messageVendeur || "";
  const titre = [v.marque, v.modele].filter(Boolean).join(" ") || a.faits.titre || "Annonce";
  const version = v.versionExacte || [v.motorisation, v.finition].filter(Boolean).join(" ");
  const controles = CHECKS.map(([cid, l]) => ({ ...((r.controles ?? []).find((c) => c?.id === cid) ?? { statut: "inconnu" as const, detail: "Non évalué." }), id: cid, l }));
  const compte = (s: string) => controles.filter((c) => c.statut === s).length;
  const ctAnnonce = a.faits.ct ? `CT ${a.faits.ct.statut}${a.faits.ct.dateTxt ? ` (${a.faits.ct.dateTxt})` : ""}` : null;
  const faitsEnTete = [
    v.annee ?? a.faits.annee,
    km(v.km ?? a.faits.km),
    v.energie || a.faits.energie,
    v.boite || a.faits.boite,
    v.localisation,
    v.distanceKm != null ? `${km(v.distanceKm)} de ${profil.ville || reg.ville || "Paris"}` : null,
    v.enLigneDepuisJours != null ? `en ligne depuis ${v.enLigneDepuisJours} j` : null,
    v.vendeur && v.vendeur !== "inconnu" ? v.vendeur : null,
    v.premiereImmat ? `1re MEC ${v.premiereImmat}` : null,
    (v.puissanceFiscale ?? a.faits.cv) != null ? `${v.puissanceFiscale ?? a.faits.cv} CV` : null,
    a.faits.estimSite ? `cote Leboncoin ${e(a.faits.estimSite.min)} à ${e(a.faits.estimSite.max)}` : null,
    ctAnnonce,
  ].filter(Boolean) as (string | number)[];
  const argumentsChiffres = [
    ...a.faits.defauts.filter((d) => d.cat !== "piege").map((d) => ({ a: d.l, m: d.nc ? null : `${e(d.min)} à ${e(d.max)}`, s: "annonce" })),
    ...(r.etatPhotos?.defauts ?? []).filter((d) => d?.libelle).map((d) => ({ a: d.libelle!, m: d.coutMax ? `${e(d.coutMin)} à ${e(d.coutMax)}` : null, s: "photos" })),
    ...(ng.argumentaire ?? []).filter((x) => x?.argument).map((x) => ({ a: x.argument!, m: x.montant ? e(x.montant) : null, s: x.source || "IA" })),
  ];
  const scores: [string, keyof NonNullable<Rapport["scores"]>][] = [["Facilité de revente", "revente"], ["Marge potentielle", "marge"], ["Risque mécanique (10 = faible)", "risqueMecanique"], ["Risque administratif (10 = faible)", "risqueAdministratif"]];

  // chiffre clé de chaque section, affiché dans le sommaire
  const nbAlertes = (r.alertes ?? []).length + a.faits.defauts.filter((d) => d.cat === "piege").length;
  const nbDefauts = a.faits.defauts.length + (r.etatPhotos?.defauts ?? []).filter((d) => d?.libelle).length;
  const nbRisques = Object.values(r.risquesCaches ?? {}).reduce((s, x) => s + (Array.isArray(x) ? x.length : 0), 0);
  const fiab = r.fiabilite?.note;
  const resumes: Record<Section, Pick<EntreeSommaire, "resume" | "ton">> = {
    annonce: { resume: (r.annonceDecortiquee ?? []).length ? `${(r.annonceDecortiquee ?? []).length} points lus` : "Points lus" },
    alertes: { resume: nbAlertes ? `${nbAlertes} alerte${nbAlertes > 1 ? "s" : ""}` : "Aucune alerte", ton: nbAlertes ? "warn" : "ok" },
    etat: { resume: r.etatPhotos?.score != null ? `Note ${r.etatPhotos.score} / 100` : nbDefauts ? `${nbDefauts} défaut${nbDefauts > 1 ? "s" : ""}` : "Aucun défaut" },
    nego: { resume: g.offre != null && plafondOk != null ? `Offre ${e(g.offre)}` : "Messages prêts" },
    prix: { resume: m.realiste ? `Cote ${e(m.realiste)}` : "Cote du marché" },
    km: { resume: (r.kmReleves ?? []).length > 1 ? `${(r.kmReleves ?? []).length} relevés` : "Un seul relevé", ton: (r.kmReleves ?? []).length > 1 ? null : "warn" },
    controles: { resume: `${compte("ok")} OK sur 13`, ton: compte("probleme") ? "bad" : compte("attention") ? "warn" : "ok" },
    papiers: { resume: r.histovec?.fourni ? "HistoVec lu" : "À demander", ton: r.histovec?.fourni ? "ok" : "warn" },
    moteur: { resume: fiab != null ? `Fiable ${fiab} / 10` : "Points faibles", ton: a.fiab.k === "eviter" ? "bad" : fiab != null ? (fiab >= 7 ? "ok" : fiab >= 5 ? "warn" : "bad") : null },
    photos: { resume: (a.vignettes ?? []).length ? `${(a.vignettes ?? []).length} photos lues` : a.ia?.photos.fournies ? "Photos lues" : "Aucune photo" },
    travaux: { resume: remise ? e(remise) : "Aucun poste" },
    deal: { resume: r.structure?.choix ? r.structure.choix[0].toUpperCase() + r.structure.choix.slice(1) : "Structure conseillée" },
    risques: { resume: nbRisques ? `${nbRisques} point${nbRisques > 1 ? "s" : ""}` : "Aucun relevé" },
    decision: { resume: r.decision?.action ? r.decision.action[0].toUpperCase() + r.decision.action.slice(1) : b.libelle, ton: r.decision?.action === "abandonne" ? "bad" : r.decision?.action === "attends" ? "warn" : r.decision?.action ? "ok" : null },
    documents: { resume: "CT, HistoVec, carte grise…" },
  };
  const sommaire: EntreeSommaire[] = SECTIONS.filter(([k]) => montre(k)).map(([k, l]) => ({ id: k, label: l, ...resumes[k], verrou: ok.has(k) ? null : `Benef ${OFFRES[ouvertePar(k)].nom}` }));
  const actif = useSectionActive(sommaire.map((x) => x.id));

  async function supprimer() {
    if (!id) return;
    if (supp === 0) return setSupp(1);
    const { error } = await supabaseNavigateur().from("rapports").delete().eq("id", id);
    if (!error) {
      router.push("/app/rapports");
      router.refresh();
    } else setSupp(2);
  }

  return (
    <div className="grid gap-6 pb-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:pb-0">
      <div className="grid min-w-0 gap-5">
        {/* En-tête */}
        <header className="carte grid gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {v.immat && <span className="rounded-md border border-line-2 bg-white/90 px-2 py-0.5 font-mono text-sm font-bold text-[#0b0a09]">{v.immat}</span>}
          </div>
          <div>
            <h1 className="font-display text-[clamp(26px,4vw,36px)] font-semibold leading-tight">{titre}</h1>
            {(v.generation || version) && <p className="mt-1 font-medium text-ink-2">{[v.generation, version].filter(Boolean).join(" · ")}</p>}
            {v.titreAnnonce && version && !v.titreAnnonce.toLowerCase().includes(version.toLowerCase()) && <p className="mt-1 text-sm text-ink-3">L&apos;annonce disait « {v.titreAnnonce} ».</p>}
          </div>
          <ul className="flex flex-wrap gap-2 text-sm">
            {faitsEnTete.map((f, i) => (
              <li key={i} className="rounded-full border border-line px-3 py-1 text-ink-2">
                {f}
              </li>
            ))}
          </ul>
        </header>

        <Bilan a={a} b={b} lien={lien} rapportId={id ?? a.rapportId ?? null} />

        {(id ?? a.rapportId) && <SuiteRapport a={a} id={(id ?? a.rapportId)!} />}

        <BarreSections entrees={sommaire} actif={actif} profond={mode.profond} onProfond={(profond) => setMode({ profond })} />

        <Bloc id="annonce" masque={!montre("annonce")} titre="Ce que dit l'annonce">
          {!(r.annonceDecortiquee ?? []).length && <p className="text-sm text-ink-3">Détail sujet par sujet (prouvé, annoncé, non mentionné) disponible quand l&apos;analyse IA répond. Les points lus par l&apos;outil sont dans Alertes et État.</p>}
          <ul className="grid gap-2 sm:grid-cols-2">
            {(r.annonceDecortiquee ?? []).map((x, i) => (
              <li key={i} className="flex flex-col gap-1 rounded-xl border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <b className="text-sm">{x.sujet}</b>
                  <span className={cx("rounded-full border px-2 py-0.5 text-xs", TON_DIT[x.statut ?? ""] ?? "border-line-2 text-ink-3")}>{x.statut || "—"}</span>
                </div>
                {x.detail && <span className="text-sm text-ink-3">{x.detail}</span>}
              </li>
            ))}
          </ul>
        </Bloc>

        <Bloc id="alertes" masque={!montre("alertes")} titre="Ce qui doit vous alerter">
          <div className="grid gap-4">
            <Liste items={[...(r.alertes ?? []), ...a.faits.defauts.filter((d) => d.cat === "piege").map((d) => d.l)]} vide="Aucune alerte dans le dossier." />
            {b.limites.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">Ce qui limite la note</p>
                <Liste items={b.limites.map((x) => x.charAt(0).toUpperCase() + x.slice(1))} />
              </div>
            )}
            {(r.aVerifier ?? []).length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">À vérifier absolument</p>
                <Liste items={r.aVerifier} />
              </div>
            )}
          </div>
        </Bloc>

        <Bloc id="etat" masque={!montre("etat")} titre="État de la voiture" note="Chaque défaut vient de l'annonce ou des photos, avec son coût : ce sont vos arguments pour négocier.">
          <div className="grid gap-3">
            {r.etatPhotos?.score != null && <p className="text-sm">État visible sur les photos : <b className="num">{r.etatPhotos.score} / 100</b></p>}
            <Tableau
              tetes={["Défaut", "Source", "Coût"]}
              lignes={[
                ...a.faits.defauts.map((d) => [d.l, "annonce", d.cat === "piege" ? <span key="p" className="text-bad">rédhibitoire</span> : d.nc ? "non chiffrable" : `${e(d.min)} à ${e(d.max)}`]),
                ...(r.etatPhotos?.defauts ?? []).filter((d) => d?.libelle).map((d) => [`${d.libelle}${d.confiance === "faible" ? " (à confirmer)" : ""}`, "photos", d.coutMax ? `${e(d.coutMin)} à ${e(d.coutMax)}` : "—"]),
              ]}
            />
            {r.etatPhotos?.resume && <p className="text-sm text-ink-2">{r.etatPhotos.resume}</p>}
            {(r.etatPhotos?.vuesManquantes ?? []).length > 0 && <p className="text-sm text-ink-3">Photos manquantes pour juger : {r.etatPhotos!.vuesManquantes!.join(", ")}. Demandez-les au vendeur.</p>}
            {r.etatPhotos?.teinteDifferente?.constat && <p className="text-sm text-warn">Teinte différente : {(r.etatPhotos.teinteDifferente.elements ?? []).join(", ")} (confiance {r.etatPhotos.teinteDifferente.confiance}).</p>}
            {!a.faits.defauts.length && !(r.etatPhotos?.defauts ?? []).length && <p className="text-sm text-ink-3">Aucun défaut relevé dans l&apos;annonce ni sur les photos.</p>}
          </div>
        </Bloc>

        <Bloc id="nego" masque={!montre("nego")} titre="Plan de négociation" note="Montants calculés par l'outil, jamais par l'IA : ouverture = plafond − 6 %, arrondi.">
          <ol className="grid gap-5">
            <li className="grid gap-2">
              <h3 className="font-display font-semibold">1. Premier message</h3>
              <p className="text-sm text-ink-3">Court, sans parler de prix. Le but : obtenir une réponse et un appel.</p>
              <Script texte={msg1} label="Copier le message" />
              {ng.relance && <p className="text-sm text-ink-2"><span className="text-ink-3">Sans réponse sous 24 h :</span> {ng.relance}</p>}
            </li>
            <li className="grid gap-2">
              <h3 className="font-display font-semibold">2. Au téléphone, avant de vous déplacer</h3>
              <Liste items={ng.appel?.length ? ng.appel : r.questions} />
            </li>
            <li className="grid gap-2">
              <h3 className="font-display font-semibold">3. Sur place : vos arguments chiffrés</h3>
              {argumentsChiffres.length ? <Tableau tetes={["Argument", "Montant", "Source"]} lignes={argumentsChiffres.map((x) => [x.a, x.m ?? "—", x.s])} /> : <p className="text-sm text-ink-3">Aucun défaut chiffré : négociez sur le prix du marché.</p>}
            </li>
            <li className="grid gap-3">
              <h3 className="font-display font-semibold">4. Votre offre</h3>
              {plafondOk != null ? (
                <div className="grid grid-cols-3 gap-2">
                  {[["Ouverture", g.offre], ["Objectif", g.cible], ["Plafond", plafondOk]].map(([l, x]) => (
                    <div key={l as string} className="rounded-xl border border-line p-3">
                      <p className="text-xs text-ink-3">{l}</p>
                      <p className="num font-display text-lg font-semibold">{e(x as number | null)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-warn">Aucun prix ne vous laisse votre minimum de {e(g.seuil)} : n&apos;achetez pas, proposez un mandat ou passez.</p>
              )}
              <Script texte={remplir(ng.annonceOffre)} label="Copier l'annonce de l'offre" />
              {ng.contreOffre && <p className="text-sm"><span className="text-ink-3">S&apos;il refuse :</span> {remplir(ng.contreOffre)}</p>}
              {ng.sortie && <p className="text-sm"><span className="text-ink-3">Pour partir :</span> {remplir(ng.sortie)}</p>}
            </li>
          </ol>
        </Bloc>

        <Bloc id="prix" masque={!montre("prix")} titre="Prix et cote">
          <div className="grid gap-4">
            <GraphePrix
              bande={a.cote ? [a.cote.p25, a.cote.p75] : null}
              points={[
                { l: "Prix demandé", v: g.prix, c: "bg-ink" },
                { l: "Cote réaliste", v: m.realiste ?? null, c: "bg-ok" },
                { l: "Plafond", v: plafondOk, c: "bg-o" },
                { l: "Estimation Leboncoin", v: a.faits.estimSite ? Math.round((a.faits.estimSite.min + a.faits.estimSite.max) / 2) : null, c: "bg-o3" },
              ]}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[["Cote basse", m.bas], ["Cote réaliste", m.realiste], ["Revente rapide", m.reventeRapide], ["Revente lente", m.reventeOptimisee]].map(([l, x]) => (
                <div key={l as string} className="rounded-xl border border-line p-3">
                  <p className="text-xs text-ink-3">{l}</p>
                  <p className="num font-display text-lg font-semibold">{e(x as number | undefined)}</p>
                </div>
              ))}
            </div>
            {b.piliers[2]?.score != null && <p className={cx("text-sm", (g.ecartPct ?? 0) > 0.03 ? "text-ok" : (g.ecartPct ?? 0) < -0.03 ? "text-bad" : "text-ink-2")}>{b.piliers[2].reponse} : {b.piliers[2].sous}</p>}
            <p className="text-sm text-ink-3">
              {a.cote ? `Médiane des ${a.cote.n} annonces comparables : ${e(a.cote.mediane)}. ` : "Pas assez d'annonces comparables : la cote vient de l'IA. "}
              {a.faits.estimSite ? `Estimation Leboncoin : ${e(a.faits.estimSite.min)} à ${e(a.faits.estimSite.max)}. ` : ""}
              Confiance : {m.confiance || "—"}. Liquidité {r.liquidite || "—"}, revente {r.difficulteRevente || "—"}. Acheteur visé : {r.profilAcheteur || "—"}.
            </p>
            {m.commentaire && <p className="text-sm text-ink-2">{m.commentaire}</p>}
            {r.coherencePrix && <p className="text-sm text-ink-2">{r.coherencePrix}</p>}
          </div>
        </Bloc>

        <Bloc id="km" masque={!montre("km")} titre="Historique du kilométrage" verrou={verrou("km")}>
          {(r.kmReleves ?? []).length ? (
            <Tableau tetes={["Date", "Kilométrage", "Source"]} lignes={(r.kmReleves ?? []).map((k) => [k.date || "—", km(k.km) ?? "—", k.source || "—"])} />
          ) : (
            <p className="text-sm text-ink-3">Un seul relevé (l&apos;annonce). Demandez le CT et HistoVec pour vérifier le kilométrage dans le temps.</p>
          )}
        </Bloc>

        <Bloc id="controles" masque={!montre("controles")} titre="Les 13 contrôles" note={`${compte("ok")} OK · ${compte("attention")} attention · ${compte("probleme")} problème · ${compte("inconnu")} non vérifiable`}>
          <ul className="grid gap-2 sm:grid-cols-2">
            {controles.map((c) => {
              const s = STATUT_CTRL[c.statut ?? "inconnu"] ?? STATUT_CTRL.inconnu;
              return (
                <li key={c.id} className="flex gap-3 rounded-xl border border-line p-3">
                  <span className={cx("grid size-7 shrink-0 place-items-center rounded-full border font-bold", s.c)} aria-label={c.statut}>
                    {s.i}
                  </span>
                  <div>
                    <b className="text-sm">{c.l}</b>
                    <p className="text-sm text-ink-3">{c.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Bloc>

        <Bloc id="papiers" masque={!montre("papiers")} titre="HistoVec, contrôle technique et entretien" verrou={verrou("papiers")}>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <h3 className="font-display font-semibold">HistoVec {r.histovec?.fourni ? "(fourni)" : "(non fourni)"}</h3>
              <Tableau
                tetes={["Point", "Valeur"]}
                lignes={[["1re immatriculation en France", r.histovec?.premiereImmatFrance || v.premiereImmat || "—"], ["Titulaires", r.histovec?.nbTitulaires ?? "—"], ["Dernier changement", r.histovec?.dernierChangementTitulaire || "—"], ["Sinistres, VE, VEI", r.histovec?.sinistres || "—"], ["Gage", r.histovec?.gage || "—"], ["Opposition", r.histovec?.opposition || "—"], ["Vol", r.histovec?.vol || "—"], ["Usage", r.histovec?.usage || "—"]]}
              />
              {r.histovec?.commentaire && <p className="text-sm text-ink-2">{r.histovec.commentaire}</p>}
            </div>
            <div className="grid gap-2">
              <h3 className="font-display font-semibold">Contrôle technique : {r.ctAnalyse?.resultat || a.faits.ct?.statut || "inconnu"}{r.ctAnalyse?.date ? ` (${r.ctAnalyse.date})` : ""}</h3>
              <Tableau tetes={["Défaillance", "Niveau", "Coût"]} lignes={(r.ctAnalyse?.defaillances ?? []).map((d) => [d.libelle, d.niveau, e(d.cout)])} />
              {r.ctAnalyse?.commentaire && <p className="text-sm text-ink-2">{r.ctAnalyse.commentaire}</p>}
            </div>
            <div className="grid gap-2">
              <h3 className="font-display font-semibold">Entretien : suivi {r.entretienAnalyse?.suivi || "inconnu"}</h3>
              <Tableau tetes={["Date", "Km", "Travaux"]} lignes={(r.entretienAnalyse?.interventions ?? []).map((x) => [x.date || "—", km(x.km) ?? "—", x.travaux])} />
              <Tableau tetes={["À prévoir", "Échéance", "Coût"]} lignes={(r.entretienAnalyse?.aPrevoir ?? []).map((x) => [x.libelle, x.echeance || "—", e(x.cout)])} />
              {r.entretienAnalyse?.commentaire && <p className="text-sm text-ink-2">{r.entretienAnalyse.commentaire}</p>}
            </div>
          </div>
        </Bloc>

        <Bloc id="moteur" masque={!montre("moteur")} titre="Le moteur et ses faiblesses connues" note="Réputation de ce moteur en général, pas un défaut constaté sur cette voiture." verrou={verrou("moteur")}>
          <div className="grid gap-3">
            <p>
              <b>{r.fiabilite?.moteur || version || "Motorisation non identifiée"}</b>
              {r.fiabilite?.note != null && <span className="ml-2 text-sm text-ink-3">fiabilité {r.fiabilite.note} / 10</span>}
            </p>
            {a.fiab.k === "eviter" && <p className="text-sm text-bad">Sur la liste des moteurs à éviter de l&apos;outil : {a.fiab.pourquoi.join(" ; ")}</p>}
            <Tableau tetes={["Faiblesse connue", "Gravité", "Comment la vérifier"]} lignes={(r.fiabilite?.problemesConnus ?? []).map((x) => [x.libelle, x.gravite, x.aVerifier])} />
            {(r.fiabilite?.rappels ?? []).length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">Rappels constructeur</p>
                <Liste items={r.fiabilite!.rappels} />
              </div>
            )}
          </div>
        </Bloc>

        <Bloc id="photos" masque={!montre("photos")} titre="Ce que montrent les photos" verrou={verrou("photos")}>
          <div className="mb-5">
            {a.ia?.photos.fournies || (a.vignettes ?? []).length ? (
              <AnalysePhotos photos={a.ia?.photos} vignettes={a.vignettes} regles={a.regles} />
            ) : (
              <p className="text-sm text-ink-3">Aucune photo examinée : ajoutez les photos de l&apos;annonce à la prochaine analyse (ou collez le lien Leboncoin, elles sont récupérées) pour la note d&apos;état, les défauts chiffrés et la teinte des éléments.</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[["Visible", r.visuel?.visible], ["Probable", r.visuel?.probable], ["Impossible à confirmer", r.visuel?.nonVerifiable]].map(([l, x]) => (
              <div key={l as string}>
                <p className="mb-1.5 text-sm font-semibold">{l as string}</p>
                <Liste items={x as string[] | undefined} vide="—" />
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 text-sm font-semibold">Équipements annoncés</p>
              <Liste items={v.options} vide="—" />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold">Signaux dans l&apos;annonce</p>
              <Liste items={r.signauxAnnonce} vide="—" />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-semibold">Points forts</p>
              <Liste items={r.pointsForts} vide="—" />
            </div>
          </div>
        </Bloc>

        <Bloc id="travaux" masque={!montre("travaux")} titre="Remise en état" note="Postes modifiables : le calcul se met à jour." verrou={verrou("travaux")}>
          <div className="grid gap-3">
            {r.remiseEnEtat && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[["Minimum probable", r.remiseEnEtat.minimum], ["Fourchette réaliste", r.remiseEnEtat.realisteMin != null ? `${e(r.remiseEnEtat.realisteMin)} à ${e(r.remiseEnEtat.realisteMax)}` : null], ["Prudent (+30 %)", r.remiseEnEtat.prudent]].map(([l, x]) => (
                  <div key={l as string} className="rounded-xl border border-line p-3">
                    <p className="text-xs text-ink-3">{l as string}</p>
                    <p className="num font-display font-semibold">{typeof x === "number" ? e(x) : (x ?? "—")}</p>
                  </div>
                ))}
              </div>
            )}
            <ul className="grid gap-2">
              {postes.map((p, i) => (
                <li key={i} className="grid gap-2 rounded-xl border border-line p-2 sm:grid-cols-[170px_1fr_110px_auto] sm:items-center">
                  <select aria-label="Catégorie" value={p.categorie} onChange={(ev) => setPostes((l) => l.map((x, j) => (j === i ? { ...x, categorie: ev.target.value } : x)))} className={inputCls}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <input aria-label="Poste" value={p.libelle} onChange={(ev) => setPostes((l) => l.map((x, j) => (j === i ? { ...x, libelle: ev.target.value } : x)))} className={inputCls} />
                  <input aria-label="Montant en euros" inputMode="numeric" value={p.montant || ""} onChange={(ev) => setPostes((l) => l.map((x, j) => (j === i ? { ...x, montant: Number(ev.target.value.replace(/\D/g, "")) || 0 } : x)))} className={cx(inputCls, "num text-right")} />
                  <button type="button" onClick={() => setPostes((l) => l.filter((_, j) => j !== i))} className="btn btn-sm" aria-label={`Retirer ${p.libelle}`}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-sm" onClick={() => setPostes((l) => [...l, { categorie: "petite mécanique", libelle: "Nouveau poste", montant: 0 }])}>
                Ajouter un poste
              </button>
              <label className="flex items-center gap-2 text-sm">
                Marge de prudence
                <select value={prudence} onChange={(ev) => setPrudence(Number(ev.target.value))} className={cx(inputCls, "w-auto")}>
                  {[[0, "0 % (devis ferme)"], [10, "10 %"], [20, "20 %"], [30, "30 % (prudent)"], [50, "50 % (inconnu)"]].map(([v2, l]) => (
                    <option key={v2} value={v2}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-sm text-ink-2">
                Total retenu : <b className="num text-ink">{e(remise)}</b>
              </span>
            </div>
          </div>
        </Bloc>

        <Bloc id="deal" masque={!montre("deal")} titre="Structure du deal et négociation" verrou={verrou("deal")}>
          <div className="grid gap-4">
            {r.structure?.choix && <span className="w-fit rounded-full bg-o px-3 py-1 text-sm font-bold text-[#160904]">{r.structure.choix}</span>}
            {r.structure?.pourquoi && <p className="whitespace-pre-line text-[15px] text-ink-2">{r.structure.pourquoi}</p>}
            {r.scriptStructure && (
              <div className="grid gap-2">
                <h3 className="font-display font-semibold">Pour proposer cette structure</h3>
                <Script texte={r.scriptStructure} label="Copier le script" />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-1.5 text-sm font-semibold">À demander au vendeur</p>
                <Liste items={r.questions} />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-semibold">Leviers</p>
                <Liste items={r.leviersNegociation} />
              </div>
              <div>
                <p className="mb-1.5 text-sm font-semibold">À contrôler sur place</p>
                <Liste items={r.inspection} />
              </div>
            </div>
            {r.conditionSortie && <p className="text-[15px]"><span className="text-ink-3">Vous sortez du deal si :</span> {r.conditionSortie}</p>}
          </div>
        </Bloc>

        <Bloc id="risques" masque={!montre("risques")} titre="Risques cachés" verrou={verrou("risques")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[["Administratif", r.risquesCaches?.administratif], ["Mécanique", r.risquesCaches?.mecanique], ["Commercial", r.risquesCaches?.commercial], ["Négociation", r.risquesCaches?.negociation], ["Revente", r.risquesCaches?.revente]].map(([l, x]) => (
              <div key={l as string}>
                <p className="mb-1.5 text-sm font-semibold">{l as string}</p>
                <Liste items={x as string[] | undefined} vide="—" />
              </div>
            ))}
          </div>
        </Bloc>

        <Bloc id="decision" masque={!montre("decision")} titre="Avis détaillé de l'analyse IA" note="Lecture de l'IA, à croiser avec le bilan en haut du rapport, calculé avec votre profil.">
          <div className="grid gap-3">
            <span className={cx("w-fit rounded-full px-3 py-1 text-sm font-bold capitalize", r.decision?.action === "abandonne" ? "bg-bad text-[#1a0606]" : r.decision?.action === "attends" ? "bg-warn text-[#1a1300]" : "bg-ok text-[#06140c]")}>{r.decision?.action || "—"}</span>
            {r.decision?.pourquoi && <p className="text-[15px]">{r.decision.pourquoi}</p>}
            {r.decision?.conditions && <p className="text-[15px]"><span className="text-ink-3">Le deal redevient bon si :</span> {r.decision.conditions}</p>}
            {r.prochaineAction && <p className="text-[15px]"><span className="text-ink-3">Prochaine action :</span> <b>{r.prochaineAction}</b></p>}
            {ok.has("deal") && r.scores && (
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {scores.map(([l, k]) => {
                  const x = Math.max(0, Math.min(10, Number(r.scores?.[k]) || 0));
                  return (
                    <li key={k} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
                      <span>{l}</span>
                      <span className="num">{x} / 10</span>
                      <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-line">
                        <span className="block h-full rounded-full bg-gradient-to-r from-o to-o2" style={{ width: `${x * 10}%` }} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {id && (
              <div>
                <button type="button" onClick={supprimer} className="btn btn-sm border-bad/50 text-bad">
                  {supp === 0 ? "Supprimer le rapport" : supp === 1 ? "Confirmer la suppression" : "Suppression impossible, réessayez"}
                </button>
              </div>
            )}
          </div>
        </Bloc>

        <Bloc id="documents" masque={!montre("documents")} titre="Documents" note="Ajoutés après coup, ils ne changent pas la note : ils complètent le dossier.">
          {id ? <PiecesDossier rapportId={id} parcId={parcId} titre="CT, HistoVec, carte grise, cession" /> : <p className="text-sm text-ink-3">Les documents s&apos;ajoutent sur un rapport enregistré.</p>}
        </Bloc>
      </div>

      {/* Calcul final */}
      <aside className="grid gap-3 lg:sticky lg:top-6">
      <BoutonSections entrees={sommaire} actif={actif} visible className="hidden w-full lg:flex" />
      <div className="carte grid gap-4 p-5" aria-label="Calcul du deal" role="region">
        <div>
          <p className="font-display font-semibold">{titre}</p>
          {version && <p className="text-sm text-ink-3">{version}</p>}
        </div>
        <ul className="grid gap-2 text-sm">
          {lignes.map((l) => (
            <li key={l.l} className={cx("flex items-baseline justify-between gap-3", l.tete && "border-b border-line pb-2")}>
              <span>
                {l.l}
                {l.d && <span className="block text-xs text-ink-3">{l.d}</span>}
              </span>
              <span className="num shrink-0 font-semibold">{l.v == null ? "—" : `${l.v < 0 ? "− " : ""}${e(Math.abs(l.v))}`}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="font-semibold">Ce qui reste</span>
          <span className={cx("num font-display text-2xl font-semibold", g.marge == null ? "" : g.marge >= g.seuil ? "text-ok" : g.marge >= 0 ? "text-warn" : "text-bad")}>{e(g.marge)}</span>
        </div>
        <p className="text-xs text-ink-3">Votre minimum : {e(g.seuil)}. {g.marge != null ? (g.marge >= g.seuil ? "Au-dessus." : "En dessous.") : ""} {plafondOk != null ? `Prix maximum : ${e(plafondOk)}.` : ""}</p>
        <label className="grid gap-1.5 text-sm">
          Si vous l&apos;avez à (€)
          <input inputMode="numeric" value={prixTest} onChange={(ev) => setPrixTest(ev.target.value)} placeholder={g.prix != null ? String(g.prix) : ""} className={inputCls} />
        </label>
        <div className="grid gap-2">
          {parc && id && <AjouterParc rapportId={id} titre={titre} prix={g.prix} />}
          {msg1 && <Copier texte={msg1} label="Copier le 1er message" />}
          {lien && (
            <a href={lien} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
              Ouvrir l&apos;annonce
            </a>
          )}
        </div>
      </div>
      </aside>
    </div>
  );
}
