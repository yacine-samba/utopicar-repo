/* Le tableau de bord complet (Benef Pro), composé comme TableauComplet dans web/src/app/app/page.tsx :
   mêmes calculs (copiés ligne à ligne), mêmes composants, même ordre, mêmes titres. Seule la source change :
   les lignes de Supabase sont remplacées par la fausse base de ./donnees.
   Sections non rendues : « Recherche de marché » (catalogue chargé en direct) et « Derniers rapports » (liste interactive
   des rapports enregistrés) ; la carte « Premiers pas » et les annonces suivies sont absentes pour ce compte. */
import { estFavorable } from "@/lib/analyse/verdicts";
import { titreVehicule } from "@/lib/titre";
import { EN_STOCK, joursStock, margePrevue, margeReelle, statsParc, type Vehicule } from "@/lib/parc";
import { estPiege } from "@/lib/vehicules/pieges";
import type { Icone } from "@/lib/espace";
import { profilParDefaut } from "@/lib/analyse/profil";
import { ProfilAnalyseFournisseur } from "@/components/analyse/ProfilAnalyse";
import { AnalysesEnFond } from "@/components/espace/AnalysesEnFond";
import { AnalyseRapide } from "@/components/espace/AnalyseRapide";
import { BoutonAnalyser } from "@/components/espace/BoutonAnalyser";
import { GraphMarges, type BarreMarge } from "@/components/benef/GraphMarges";
import { Affaires, AgeStock, Chiffre, EnTeteTableau as EnTeteComplet, EtapesParc, eur, Journee, Marche, Outil, TitreSection, type Action, type EtapeParc, type Opportunite } from "@/components/espace/Tableau";
import { COMPTE as c, FRAIS as frais, MOIS as mois, PARC as parcBrut, SEMAINE_GO as semaineGo } from "./donnees";

const joursDepuis = (d: string) => Math.round((Date.now() - new Date(d).getTime()) / 86400000);

function TableauComplet() {
  const parc = (parcBrut ?? []) as Vehicule[];
  const st = statsParc(parc);
  const vivants = parc.filter((v) => v.statut !== "abandonne");
  const stock = vivants.filter((v) => EN_STOCK.includes(v.statut));
  // marge prévue du stock : la même que la page Parc (prix conseillé − prix d'achat réel − frais)
  const margeLiee = new Map<string, number | null>();
  const prevues = stock.map((v) => ({ v, m: margePrevue(v) ?? (v.rapport_id ? (margeLiee.get(v.rapport_id) ?? null) : null) })).filter((x) => x.m != null);
  const attente = prevues.reduce((s, x) => s + (x.m ?? 0), 0);
  const go = (mois ?? []).filter((r) => estFavorable(r.verdict));
  const n = (mois ?? []).length;

  // marge réalisée le mois dernier, pour la comparaison
  const auj = new Date();
  const debutMois = new Date(auj.getFullYear(), auj.getMonth(), 1);
  const debutPrec = new Date(auj.getFullYear(), auj.getMonth() - 1, 1);
  const margePrec = vivants
    .filter((v) => v.statut === "vendu" && v.date_vente && new Date(v.date_vente) >= debutPrec && new Date(v.date_vente) < debutMois)
    .reduce((s, v) => s + (margeReelle(v) ?? 0), 0);
  const nomPrec = debutPrec.toLocaleDateString("fr-FR", { month: "long" });

  // le marché des 7 derniers jours : nouvelles annonces de ses recherches entre 10 et 45 % sous la cote (au-delà : souvent un piège)
  const opportunites: Opportunite[] = (frais ?? [])
    .filter((a) => a.cote?.pct != null && a.cote.pct >= 0.1 && a.cote.pct <= 0.45 && a.prix && !estPiege(a.titre))
    .sort((a, b) => (b.cote?.pct ?? 0) - (a.cote?.pct ?? 0))
    .slice(0, 8)
    .map((a) => ({ cle: a.cle, titre: a.titre, prix: a.prix, cote: a.cote?.P ?? null, pct: a.cote!.pct!, annee: a.annee, km: a.km, lieu: a.lieu, url: a.url, photo: a.photo, recherche: a.recherche }));

  // Votre journée : les décisions du jour, la plus urgente d'abord
  const actions: (Action & { rang: number })[] = [];
  for (const v of vivants) {
    const j = joursStock(v);
    const photo = v.photos?.[0] ?? null;
    const titre = `${v.immat ? `${v.immat} · ` : ""}${titreVehicule(v.titre)}`;
    const fiche = { href: `/app/parc/${v.id}`, l: "Ouvrir la fiche" };
    if (EN_STOCK.includes(v.statut) && j != null && j > 60) actions.push({ rang: 0, ton: "bad", etiquette: `${j} jours en stock`, titre, raison: "Le capital dort : baissez le prix ou changez l'annonce aujourd'hui.", lien: { ...fiche, l: "Ajuster le prix" }, photo });
    else if (EN_STOCK.includes(v.statut) && j != null && j > 45) actions.push({ rang: 1, ton: "warn", etiquette: `${j} jours en stock`, titre, raison: "Au-delà de 45 jours, la marge fond : refaites les photos ou ajustez le prix.", lien: { ...fiche, l: "Revoir l'annonce" }, photo });
    if (EN_STOCK.includes(v.statut) && v.prix_achat == null) actions.push({ rang: 1, ton: "warn", etiquette: "Prix d'achat manquant", titre, raison: "Sans lui, la marge et le capital sont faux.", lien: { ...fiche, l: "Compléter" }, photo });
    const m = margeReelle(v);
    if (v.statut === "vendu" && m != null && m < 0) actions.push({ rang: 2, ton: "warn", etiquette: "Vendue à perte", titre, raison: `${eur(m)} : notez ce qui a coûté pour la prochaine fois.`, lien: fiche, photo });
    if (v.statut === "repere") {
      const age = joursDepuis(v.created_at);
      if (age > 7) actions.push({ rang: 3, ton: "warn", etiquette: `Repérée il y a ${age} jours`, titre, raison: "Achetez-la ou abandonnez-la pour garder un parc à jour.", lien: { ...fiche, l: "Décider" }, photo });
    }
  }
  const dansParc = new Set(parc.map((v) => v.rapport_id).filter(Boolean));
  const goLibres = (semaineGo ?? []).filter((r) => !dansParc.has(r.id));
  if (goLibres[0]) {
    const r = goLibres[0];
    actions.push({ rang: 4, ton: "o", etiquette: `Affaire GO · ${eur(r.marge, true)}`, titre: titreVehicule(r.titre), raison: "Analysée cette semaine, pas encore dans le parc : contactez le vendeur.", lien: { href: `/app/rapports/${r.id}`, l: "Voir le rapport" }, photo: r.photos?.[0] ?? null });
  }
  if (opportunites[0]) {
    const o = opportunites[0];
    actions.push({ rang: 5, ton: "o", etiquette: `−${Math.round(o.pct * 100)} % sous la cote`, titre: o.titre, raison: `Nouvelle annonce${o.recherche ? ` de « ${o.recherche} »` : ""} : à analyser avant les autres.`, lien: { href: "#tb-marche", l: "Voir le marché" }, photo: o.photo });
  }
  actions.sort((a, b) => a.rang - b.rang);

  const ETAPES = [
    ["repere", "Repérées", "bg-ink-3"],
    ["achete", "Achetées", "bg-o3"],
    ["preparation", "En préparation", "bg-warn"],
    ["en_vente", "En vente", "bg-o"],
    ["vendu", "Vendues", "bg-ok"],
  ] as const;
  const etapes: EtapeParc[] = ETAPES.map(([s, l, ton]) => {
    const vs = vivants.filter((v) => v.statut === s);
    return { cle: s, l, ton, n: vs.length, photos: vs.map((v) => v.photos?.[0]).filter((p): p is string => !!p) };
  });
  const total = etapes.reduce((s, e) => s + e.n, 0);

  const barres: BarreMarge[] = [
    ...vivants.filter((v) => v.statut === "vendu").map((v) => ({ v, m: margeReelle(v) })).filter((x) => x.m != null)
      .sort((a, b) => String(b.v.date_vente ?? "").localeCompare(String(a.v.date_vente ?? ""))).map(({ v, m }) => ({ id: v.id, nom: v.titre, marge: m!, prevue: false })),
    ...prevues.map(({ v, m }) => ({ id: v.id, nom: v.titre, marge: m!, prevue: true })),
  ].slice(0, 12);

  const resume = [
    semaineGo?.length ? `${semaineGo.length} affaire${semaineGo.length > 1 ? "s" : ""} GO cette semaine` : "Aucune affaire GO cette semaine",
    opportunites.length ? `${opportunites.length} annonce${opportunites.length > 1 ? "s" : ""} sous la cote cette semaine` : `${st.enStock} voiture${st.enStock > 1 ? "s" : ""} en stock`,
    c.illimite ? `${c.utilisees} analyse${c.utilisees > 1 ? "s" : ""} ce mois` : `${c.restantes} analyse${c.restantes > 1 ? "s" : ""} restante${c.restantes > 1 ? "s" : ""}`,
  ];

  return (
    <div className="grid gap-10">
      <EnTeteComplet
        prenom={c.prenom}
        sous="Collez une annonce : marge nette, prix d'offre et plafond en une minute."
        resume={resume}
        action={
          <>
            <div className="hidden sm:block">
              <AnalyseRapide compact />
            </div>
            <div className="sm:hidden">
              <BoutonAnalyser className="w-full justify-center" />
            </div>
          </>
        }
        journee={<Journee actions={actions.slice(0, 4)} />}
      />

      <section aria-labelledby="tb-chiffres">
        <h2 id="tb-chiffres" className="sr-only">Chiffres clés</h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Chiffre i={0} fort icone="rentabilite" l="Marge réalisée ce mois" v={eur(st.margeMois)} ton={st.margeMois < 0 ? "bad" : undefined}
            delta={margePrec || st.margeMois ? { v: st.margeMois - margePrec, l: `par rapport à ${nomPrec}` } : null}
            s={<>Au total : <b className="num text-ink-2">{eur(st.margeTotale)}</b> sur {st.vendus} vente{st.vendus > 1 ? "s" : ""}</>} />
          <Chiffre i={1} icone="parc" l="Marge en attente" v={eur(prevues.length ? attente : null, true)} ton={!prevues.length ? undefined : attente < 0 ? "bad" : "ok"}
            s={prevues.length ? `Sur ${prevues.length} voiture${prevues.length > 1 ? "s" : ""} du stock, au prix conseillé` : "Indiquez le prix conseillé dans le parc"} />
          <Chiffre i={2} icone="credits" l="Capital immobilisé" v={eur(st.capital)} s={`${st.enStock} voiture${st.enStock > 1 ? "s" : ""} en stock, achats et frais`} />
          <Chiffre i={3} icone="historique" l="Rotation moyenne" v={st.rotation != null ? `${st.rotation} j` : "—"} ton={st.rotation != null && st.rotation > 45 ? "warn" : undefined}
            s={st.margeMoyenne != null ? <>De l&apos;achat à la vente · marge moyenne <b className="num text-ink-2">{eur(st.margeMoyenne)}</b></> : "De l'achat à la vente, sur les voitures vendues"} />
        </div>
      </section>

      {opportunites.length > 0 && (
        <section aria-labelledby="tb-marche" id="tb-marche" className="scroll-mt-24">
          <TitreSection id="tb-marche-t" aside="trouvées par vos recherches ces 7 derniers jours" lien={{ href: "/app/recherche?vue=annonces", l: "Toutes les annonces" }}>
            Le marché, en ce moment
          </TitreSection>
          <Marche annonces={opportunites} />
        </section>
      )}

      <section aria-labelledby="tb-parc" className="carte grid gap-6 p-5 sm:p-6">
        <TitreSection id="tb-parc" aside={`${total} voiture${total > 1 ? "s" : ""} suivie${total > 1 ? "s" : ""}`} lien={{ href: "/app/parc", l: "Gérer le parc" }}>
          Votre parc
        </TitreSection>
        <EtapesParc etapes={etapes} lien="/app/parc" />
        <div className="grid gap-3 border-t border-line pt-5">
          <h3 className="font-display font-semibold">Âge du stock</h3>
          <AgeStock voitures={stock.map((v) => ({ id: v.id, titre: v.titre, jours: joursStock(v), photo: v.photos?.[0] ?? null }))} />
        </div>
      </section>

      <section aria-labelledby="tb-best">
        <TitreSection id="tb-best" lien={{ href: "/app/rapports", l: "Tous les rapports" }}>Les meilleures affaires de la semaine</TitreSection>
        {semaineGo?.length ? (
          <Affaires affaires={semaineGo.slice(0, 3)} />
        ) : (
          <p className="carte p-6 text-ink-2">Rien au-dessus de votre seuil cette semaine. Cherchez sous la cote dans la recherche, ou analysez une annonce.</p>
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="tb-marges" className="carte grid content-start gap-4 p-5 sm:p-6">
          <h2 id="tb-marges" className="font-display text-xl font-semibold tracking-tight">Marge par voiture</h2>
          <GraphMarges barres={barres} />
        </section>
        <section aria-labelledby="tb-analyses" className="carte grid content-start gap-4 p-5 sm:p-6">
          <h2 id="tb-analyses" className="font-display text-xl font-semibold tracking-tight">Analyses du mois</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
            {[
              ["Analyses", c.illimite ? String(c.utilisees) : `${c.utilisees} / ${c.offre.analyses}`, c.illimite ? "sans limite" : `${c.restantes} restante${c.restantes > 1 ? "s" : ""}`],
              ["Affaires GO", String(go.length), `sur ${n} annonce${n > 1 ? "s" : ""}`],
              ["Marge moyenne des GO", eur(go.length ? go.reduce((s, r) => s + (r.marge ?? 0), 0) / go.length : null), "estimée avant achat"],
              ["Taux de GO", n ? `${Math.round((go.length / n) * 100)} %` : "—", "des annonces analysées"],
            ].map(([l, v, s]) => (
              <div key={l} className="min-w-0">
                <dt className="text-sm text-ink-3">{l}</dt>
                <dd className="num mt-1 font-display text-2xl font-semibold">{v}</dd>
                <dd className="text-xs text-ink-3">{s}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section aria-labelledby="tb-outils">
        <TitreSection id="tb-outils">Vos outils</TitreSection>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["/app/recherche", "recherche", "Recherche", "Le marché par génération, sous la cote, avec alertes e-mail"],
            c.illimite ? ["/app/cote", "cote", "Cote du marché", "Coller un relevé, placer une voiture"] : ["/app/estimation", "estimation", "Estimer une cote", "Vos critères, notre base d'annonces"],
            ["/app/messages", "messages", "Messages Leboncoin", c.messages ? "Premier message automatique, boîte de réception" : "Option de Benef Pro"],
          ] as [string, Icone, string, string][]).map(([href, ico, l, d], i) => (
            <Outil key={href} i={i} href={href} icone={ico} l={l} d={d} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Le tableau de bord dans les fournisseurs de la mise en page de l'espace (web/src/app/app/layout.tsx). */
export function Tableau() {
  return (
    <ProfilAnalyseFournisseur initial={profilParDefaut("benef")}>
      <AnalysesEnFond mode="benef" actif maxPhotos={6} ville="">
        <TableauComplet />
      </AnalysesEnFond>
    </ProfilAnalyseFournisseur>
  );
}
