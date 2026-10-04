import Link from "next/link";
import { titreVehicule } from "@/lib/titre";
import { compteBenef } from "@/lib/benef";
import { debutPeriode, type Compte } from "@/lib/compte";
import { familleEspace, nomFormule } from "@/lib/espace";
import { BENEF, GUIDE, OFFRES, prixTxt } from "@/lib/offres";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { EN_STOCK, joursStock, margeReelle, STATUTS_PARC, statsParc, type Vehicule } from "@/lib/parc";
import { ListeRapports } from "@/components/benef/ListeRapports";
import { CartesOffres } from "@/components/site/CartesOffres";
import { AnalyseRapide } from "@/components/espace/AnalyseRapide";
import { ProjetAchat } from "@/components/espace/ProjetAchat";
import { GraphMarges, type BarreMarge } from "@/components/benef/GraphMarges";
import { Ico } from "@/components/espace/Icones";
import { RechercheRapide } from "@/components/espace/RechercheRapide";
import { catalogue } from "@/lib/vehicules/catalogue";
import { COLONNES_RECHERCHE, type Recherche } from "@/lib/recherches";

/** Les 3 dernières recherches du marché (formules avec la recherche). */
async function dernieresRecherches() {
  const { data } = await (await supabaseServeur()).from("recherches").select(COLONNES_RECHERCHE).order("derniere_le", { ascending: false }).limit(3);
  return (data ?? []) as Recherche[];
}

const eur = (v: number | null) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);

function Tuile({ l, v, sous, alerte, lien }: { l: string; v: string; sous?: React.ReactNode; alerte?: boolean; lien?: { href: string; l: string } }) {
  return (
    <div className="carte flex flex-col p-5">
      <p className="text-sm text-ink-3">{l}</p>
      <p className="num mt-1 font-display text-3xl font-semibold">{v}</p>
      {sous && <p className={`mt-1 text-sm ${alerte ? "text-warn" : "text-ink-3"}`}>{sous}</p>}
      {lien && (
        <Link href={lien.href} className="mt-auto pt-3 text-sm text-o2 underline-offset-4 hover:underline">
          {lien.l} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

function Bonjour({ c, texte }: { c: Compte; texte: string }) {
  return (
    <div>
      <h1 className="font-display text-[clamp(28px,5vw,40px)] font-semibold leading-tight tracking-tight">Bonjour{c.prenom ? ` ${c.prenom}` : ""}</h1>
      <p className="mt-1 text-ink-2">{texte}</p>
    </div>
  );
}

const ETAPES = [
  ["Collez le lien", "Copiez le lien de l'annonce Leboncoin et collez-le ci-dessus. Pour un autre site, collez le texte."],
  ["Lisez le verdict", "Bonne affaire ou pas, coût réel d'achat (carte grise, trajet, réparations) et points faibles du modèle."],
  ["Négociez et vérifiez", "Le prix à proposer, les questions à poser au vendeur et ce qu'il faut contrôler sur place."],
];

async function TableauParticulier({ c }: { c: Compte }) {
  const o = c.offre;
  const { data } = await (await supabaseServeur())
    .from("rapports")
    .select("id, titre, verdict, prix, note, created_at, photos, lien")
    .eq("mode", "particulier")
    .order("created_at", { ascending: false })
    .limit(20);
  return (
    <div className="grid gap-8">
      <Bonjour c={c} texte="Votre projet d'achat, étape par étape, sans mauvaise surprise." />
      <AnalyseRapide titre="Une voiture en vue ?" texte="Collez le lien de l'annonce : en une minute, le verdict, ce qu'elle va vraiment vous coûter et ce qu'il faut vérifier." />
      <ProjetAchat lignes={data ?? []} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Tuile
          l={o.parMois ? "Analyses restantes ce mois" : "Analyse offerte"}
          v={c.illimite ? "Illimité" : `${c.restantesFormule} / ${o.analyses}`}
          sous={
            c.credits
              ? `Plus ${c.credits} crédit${c.credits > 1 ? "s" : ""} à l'unité.`
              : c.restantes
                ? o.parMois ? "Elles reviennent le 1er du mois." : "Sans carte bancaire."
                : o.parMois ? "Elles reviennent le 1er du mois." : "Votre analyse offerte a servi."
          }
          alerte={c.restantes === 0}
          lien={{ href: "/app/credits", l: c.restantes ? "Mes crédits" : "Acheter des crédits" }}
        />
        <Tuile l="Votre formule" v={nomFormule(c)} sous={o.prix ? `${prixTxt(o.prix)} par mois` : "Gratuite"} lien={{ href: "/app/compte#formule", l: "Gérer" }} />
        <Tuile l="Les guides" v={c.guide ? "Accès complet" : "2 chapitres offerts"} sous={c.guide ? "Les quatre guides, imprimables." : `Accès complet à vie : ${prixTxt(GUIDE.prix)}.`} lien={{ href: "/app/guides", l: "Lire" }} />
      </div>
      {o.id === "gratuit" && (
        <section className="carte flex flex-wrap items-center justify-between gap-4 border-o/30 p-6">
          <div className="max-w-xl">
            <h2 className="font-display text-lg font-semibold">Vous hésitez entre plusieurs voitures ?</h2>
            <p className="mt-1 text-ink-2">
              Avec {OFFRES.essentiel.nom}, {OFFRES.essentiel.analyses} analyses par mois, le prix à proposer, les questions à poser au vendeur et l&apos;analyse des photos. {prixTxt(OFFRES.essentiel.prix)} par mois, sans engagement.
            </p>
          </div>
          <Link href="/app/compte#formule" className="btn btn-o">
            Voir les formules
          </Link>
        </section>
      )}
    </div>
  );
}

type AlerteResume = { actif: boolean; annonces: { id: string; url: string | null; titre: string; prix: number | null; annee: number | null; km: number | null; ville: string | null; vu: string | null }[] };

/** Tableau de bord complet (Benef Pro et illimité) : celui de l'outil Garage. */
async function TableauComplet({ c }: { c: Compte }) {
  const sb = await supabaseServeur();
  const debut = debutPeriode(c.offre);
  const semaine = new Date(ilYa(7)).toISOString();
  const [{ data: mois }, { data: derniers }, { data: semaineGo }, { data: parcBrut }, alertesRes, recherches] = await Promise.all([
    sb.from("rapports").select("id, marge, verdict").eq("mode", "benef").gte("created_at", debut).limit(2000),
    sb.from("rapports").select("id, titre, created_at, prix, verdict, marge, note, photos, lien").eq("mode", "benef").order("created_at", { ascending: false }).limit(5),
    sb.from("rapports").select("id, titre, created_at, prix, verdict, marge, note, photos, lien").eq("mode", "benef").gte("created_at", semaine).like("verdict", "GO%").order("marge", { ascending: false, nullsFirst: false }).limit(6),
    sb.from("parc").select("*").limit(1000),
    c.illimite || c.offre.id === "pro" ? sb.rpc("mes_alertes") : Promise.resolve({ data: null }),
    c.offre.recherche ? dernieresRecherches() : Promise.resolve(null),
  ]);
  const parc = (parcBrut ?? []) as Vehicule[];
  const st = statsParc(parc);
  const vivants = parc.filter((v) => v.statut !== "abandonne");
  const stock = vivants.filter((v) => EN_STOCK.includes(v.statut));
  // marge prévue du stock : celle du rapport d'analyse lié, frais du parc déduits au-delà des frais estimés
  const liens = stock.map((v) => v.rapport_id).filter((x): x is string => !!x);
  const { data: rapLies } = liens.length ? await sb.from("rapports").select("id, marge").in("id", liens) : { data: [] as { id: string; marge: number | null }[] };
  const margeLiee = new Map((rapLies ?? []).map((r) => [r.id, r.marge]));
  const prevues = stock.map((v) => ({ v, m: v.rapport_id ? (margeLiee.get(v.rapport_id) ?? null) : null })).filter((x) => x.m != null);
  const attente = prevues.reduce((s, x) => s + (x.m ?? 0), 0);
  const go = (mois ?? []).filter((r) => r.verdict?.startsWith("GO"));
  const n = (mois ?? []).length;

  const alertes: { v: Vehicule; lvl: "bad" | "warn"; txt: string }[] = [];
  vivants.forEach((v) => {
    const j = joursStock(v);
    const m = margeReelle(v);
    if (EN_STOCK.includes(v.statut) && j != null && j > 60) alertes.push({ v, lvl: "bad", txt: `En stock depuis ${j} jours : baissez le prix ou changez d'annonce, le capital dort.` });
    else if (EN_STOCK.includes(v.statut) && j != null && j > 45) alertes.push({ v, lvl: "warn", txt: `En stock depuis ${j} jours : au-delà de 45 jours, la marge fond.` });
    if (EN_STOCK.includes(v.statut) && v.prix_achat == null) alertes.push({ v, lvl: "warn", txt: "Prix d'achat manquant : la marge et le capital sont faux." });
    if (v.statut === "vendu" && m != null && m < 0) alertes.push({ v, lvl: "bad", txt: `Vendue à perte : ${Math.round(m).toLocaleString("fr-FR")} €.` });
    if (v.statut === "repere") {
      const age = joursDepuis(v.created_at);
      if (age > 7) alertes.push({ v, lvl: "warn", txt: `Repérée il y a ${age} jours : achetez ou abandonnez pour garder un parc à jour.` });
    }
  });
  alertes.sort((a, b) => (a.lvl === "bad" ? 0 : 1) - (b.lvl === "bad" ? 0 : 1));

  const comptes = (["repere", "achete", "preparation", "en_vente", "vendu"] as const).map((s) => [s, vivants.filter((v) => v.statut === s).length] as const);
  const total = comptes.reduce((s, [, k]) => s + k, 0);
  const TONS: Record<string, string> = { repere: "bg-ink-3/40", achete: "bg-o3/70", preparation: "bg-warn/80", en_vente: "bg-o", vendu: "bg-ok" };

  const barres: BarreMarge[] = [
    ...vivants.filter((v) => v.statut === "vendu").map((v) => ({ v, m: margeReelle(v) })).filter((x) => x.m != null)
      .sort((a, b) => String(b.v.date_vente ?? "").localeCompare(String(a.v.date_vente ?? ""))).map(({ v, m }) => ({ id: v.id, nom: v.titre, marge: m!, prevue: false })),
    ...prevues.map(({ v, m }) => ({ id: v.id, nom: v.titre, marge: m!, prevue: true })),
  ].slice(0, 12);

  const al = (alertesRes?.data ?? null) as AlerteResume[] | null;
  const recentes = al ? al.flatMap((a) => a.annonces).sort((a, b) => String(b.vu ?? "").localeCompare(String(a.vu ?? ""))).slice(0, 4) : [];
  const jour = ilYa(1);

  return (
    <div className="grid gap-8">
      <Bonjour c={c} texte={`${nomFormule(c)} · stock, marges, meilleures affaires et alertes, comme dans l'outil Garage.`} />
      <AnalyseRapide titre="Une annonce à chiffrer ?" texte="Collez le lien Leboncoin : marge nette après frais, prix d'offre et plafond d'achat, enregistrés dans vos rapports." />
      {recherches && <RechercheRapide cat={catalogue()} recentes={recherches} />}

      <section aria-labelledby="tb-kpi">
        <h2 id="tb-kpi" className="sr-only">Chiffres clés</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi l="En stock" v={String(st.enStock)} s={`${vivants.filter((v) => v.statut === "repere").length} repérée(s)`} />
          <Kpi l="Capital immobilisé" v={eur(st.capital)} s="achats et frais engagés" />
          <Kpi l="Marge réalisée" v={eur(st.margeTotale)} s={`${st.vendus} vente${st.vendus > 1 ? "s" : ""}`} ton={st.margeTotale < 0 ? "bad" : st.margeTotale > 0 ? "ok" : undefined} />
          <Kpi l="Marge moyenne" v={eur(st.margeMoyenne)} s="par voiture vendue" ton={st.margeMoyenne != null && st.margeMoyenne < 750 ? "warn" : undefined} />
          <Kpi l="Rotation moyenne" v={st.rotation != null ? `${st.rotation} j` : "—"} s="de l'achat à la vente" />
          <Kpi l="Marge en attente" v={eur(prevues.length ? attente : null)} s={prevues.length ? `${prevues.length} voiture(s) du stock` : "liez le stock à ses rapports"} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="tb-best" className="grid content-start gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="tb-best" className="font-display text-lg font-semibold">Meilleures affaires de la semaine</h2>
            <Link href="/app/tri" className="shrink-0 whitespace-nowrap text-sm text-o2 underline-offset-4 hover:underline">Tri rapide</Link>
          </div>
          {semaineGo?.length ? (
            <ul className="grid gap-2">
              {semaineGo.map((r) => (
                <li key={r.id}>
                  <Link href={`/app/rapports/${r.id}`} className="carte flex items-center justify-between gap-3 p-3 transition hover:border-o/40">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{titreVehicule(r.titre)}</span>
                      <span className="text-xs text-ink-3">{r.verdict} · prix {eur(r.prix)}{r.note != null ? ` · ${r.note}/100` : ""}</span>
                    </span>
                    <b className={`num shrink-0 ${(r.marge ?? 0) >= 0 ? "text-ok" : "text-bad"}`}>{r.marge != null ? `${r.marge >= 0 ? "+" : ""}${eur(r.marge)}` : "—"}</b>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="carte p-5 text-sm text-ink-2">Rien au-dessus de votre seuil cette semaine. Lancez un tri rapide sur une dizaine d&apos;annonces ou cherchez sous la cote.</p>
          )}
        </section>

        <section aria-labelledby="tb-alertes" className="grid content-start gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="tb-alertes" className="font-display text-lg font-semibold">À surveiller dans le parc</h2>
            <span className="text-sm text-ink-3">{alertes.length ? `${alertes.filter((a) => a.lvl === "bad").length} critique(s), ${alertes.length} au total` : ""}</span>
          </div>
          {alertes.length ? (
            <ul className="grid gap-2">
              {alertes.slice(0, 6).map((a, i) => (
                <li key={i}>
                  <Link href="/app/parc" className={`carte flex gap-3 p-3 text-sm transition hover:border-o/40 ${a.lvl === "bad" ? "border-bad/35" : "border-warn/30"}`}>
                    <span className={`w-1 shrink-0 rounded-full ${a.lvl === "bad" ? "bg-bad" : "bg-warn"}`} aria-hidden="true" />
                    <span>
                      <b className="block font-medium">{a.v.immat ? `${a.v.immat} · ` : ""}{a.v.titre}</b>
                      <span className="text-ink-2">{a.txt}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="carte p-5 text-sm text-ink-2">Aucune alerte : durées de stock, prix d&apos;achat et marges sont dans les clous.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="tb-pipe" className="carte grid gap-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tb-pipe" className="font-display text-lg font-semibold">Parc</h2>
          <span className="text-sm text-ink-3">{total} véhicule{total > 1 ? "s" : ""} suivi{total > 1 ? "s" : ""}</span>
        </div>
        <div className="flex h-8 overflow-hidden rounded-xl" role="img" aria-label={comptes.map(([s, k]) => `${STATUTS_PARC[s]} : ${k}`).join(", ")}>
          {total ? comptes.filter(([, k]) => k).map(([s, k]) => (
            <span key={s} className={`grid place-items-center text-xs font-semibold text-bg0 ${TONS[s]}`} style={{ flex: k }}>{k}</span>
          )) : <span className="grid flex-1 place-items-center bg-glass text-xs text-ink-3">Aucun véhicule</span>}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
          {comptes.map(([s, k]) => (
            <span key={s} className="flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${TONS[s]}`} aria-hidden="true" />{STATUTS_PARC[s]} <b className="num text-ink-2">{k}</b></span>
          ))}
          <Link href="/app/parc" className="ml-auto text-o2 underline-offset-4 hover:underline">Gérer le parc</Link>
        </div>
      </section>

      <section aria-labelledby="tb-marges" className="carte grid gap-4 p-5">
        <h2 id="tb-marges" className="font-display text-lg font-semibold">Marges par voiture</h2>
        <GraphMarges barres={barres} />
      </section>

      <section aria-labelledby="tb-analyses">
        <h2 id="tb-analyses" className="mb-3 font-display text-lg font-semibold">Analyses du mois</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi l="Analyses utilisées" v={c.illimite ? String(c.utilisees) : `${c.utilisees} / ${c.offre.analyses}`} s={c.illimite ? "sans limite" : `${c.restantes} restante${c.restantes > 1 ? "s" : ""}`} ton={!c.illimite && c.restantes <= 3 ? "warn" : undefined} />
          <Kpi l="Affaires GO repérées" v={String(go.length)} s={`sur ${n} annonce${n > 1 ? "s" : ""}`} />
          <Kpi l="Marge moyenne des GO" v={eur(go.length ? go.reduce((s, r) => s + (r.marge ?? 0), 0) / go.length : null)} s="estimée avant achat" />
          <Kpi l="Marge réalisée ce mois" v={eur(st.margeMois)} s="voitures vendues ce mois" />
        </div>
      </section>

      {al && (
        <section aria-labelledby="tb-mail" className="carte grid gap-4 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="tb-mail" className="font-display text-lg font-semibold">Alertes e-mail</h2>
            <Link href="/app/alertes" className="text-sm text-o2 underline-offset-4 hover:underline">Gérer les alertes</Link>
          </div>
          <p className="text-sm text-ink-2">
            {(() => {
              const actives = al.filter((a) => a.actif).length;
              const nouvelles = al.flatMap((a) => a.annonces).filter((x) => x.vu && Date.parse(x.vu) >= jour).length;
              if (!al.length) return "Aucune alerte pour le moment : créez-en une pour recevoir les nouvelles annonces sous la cote.";
              return `${actives} alerte${actives > 1 ? "s" : ""} active${actives > 1 ? "s" : ""} · ${nouvelles ? `${nouvelles} nouvelle${nouvelles > 1 ? "s" : ""} annonce${nouvelles > 1 ? "s" : ""}` : "aucune nouvelle annonce"} ces dernières 24 heures`;
            })()}
          </p>
          {recentes.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {recentes.map((x) => (
                <li key={x.id} className="rounded-xl border border-line p-3 text-sm">
                  {x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer" className="block truncate font-medium underline-offset-4 hover:underline">{x.titre}</a> : <span className="block truncate font-medium">{x.titre}</span>}
                  <span className="text-ink-3"><b className="num text-ink">{eur(x.prix)}</b> · {[x.annee, x.km != null ? `${x.km.toLocaleString("fr-FR")} km` : null, x.ville].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="tb-outils">
        <h2 id="tb-outils" className="mb-3 font-display text-lg font-semibold">Outils</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {([
            ["/app/recherche", "recherche", "Recherche", "Le marché par génération, sous la cote"],
            ["/app/cote", "cote", "Cote", "Coller un relevé, placer une voiture"],
            ["/app/tri", "tri", "Tri rapide", "10 annonces classées sans IA"],
            ["/app/comparer", "comparer", "Comparateur", "2 à 3 rapports côte à côte"],
          ] as const).map(([href, ico, l, d]) => (
            <Link key={href} href={href} className="carte grid gap-2 p-4 transition hover:border-o/40">
              <Ico nom={ico} className="size-5 text-o2" />
              <span className="font-medium">{l}</span>
              <span className="text-xs text-ink-3">{d}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="tb-derniers">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tb-derniers" className="font-display text-lg font-semibold">Derniers rapports</h2>
          <Link href="/app/rapports" className="text-sm text-o2 underline-offset-4 hover:underline">Tous les rapports</Link>
        </div>
        <ListeRapports rapports={derniers ?? []} comparateur={false} choixVue={false} vide="Aucun rapport pour le moment : collez le lien d'une annonce ci-dessus." />
      </section>
    </div>
  );
}

/* Hors des composants : l'heure courante n'est lue qu'au rendu serveur de la page. */
const ilYa = (jours: number) => Date.now() - jours * 86400000;
const joursDepuis = (d: string) => Math.round((Date.now() - new Date(d).getTime()) / 86400000);

function Kpi({ l, v, s, ton }: { l: string; v: string; s?: string; ton?: "ok" | "warn" | "bad" }) {
  return (
    <div className="carte p-4">
      <p className="text-xs text-ink-3">{l}</p>
      <p className={`num mt-1 font-display text-2xl font-semibold ${ton === "ok" ? "text-ok" : ton === "warn" ? "text-warn" : ton === "bad" ? "text-bad" : ""}`}>{v}</p>
      {s && <p className="mt-0.5 text-xs text-ink-3">{s}</p>}
    </div>
  );
}

async function TableauBenef({ c }: { c: Compte }) {
  const sb = await supabaseServeur();
  const debut = debutPeriode(c.offre);
  const [{ data: mois }, { data: derniers }] = await Promise.all([
    sb.from("rapports").select("id, titre, marge, verdict, prix").eq("mode", "benef").gte("created_at", debut).limit(1000),
    sb.from("rapports").select("id, titre, created_at, prix, verdict, marge, note, photos, lien").eq("mode", "benef").order("created_at", { ascending: false }).limit(5),
  ]);
  const go = (mois ?? []).filter((r) => r.verdict?.startsWith("GO"));
  const marges = go.map((r) => r.marge).filter((x): x is number => x != null);
  const meilleure = [...(mois ?? [])].filter((r) => r.marge != null).sort((a, b) => (b.marge ?? 0) - (a.marge ?? 0))[0];
  const complet = c.offre.tableauDeBord === "complet";
  const parc = complet ? statsParc(((await sb.from("parc").select("*").limit(1000)).data ?? []) as Vehicule[]) : null;
  const recherches = c.offre.recherche ? await dernieresRecherches() : null;
  const n = (mois ?? []).length;

  return (
    <div className="grid gap-8">
      <Bonjour c={c} texte={`${nomFormule(c)} · vos chiffres du mois, depuis le 1er.`} />
      <AnalyseRapide titre="Une annonce à chiffrer ?" texte="Collez le lien Leboncoin : marge nette après frais, prix d'offre et plafond d'achat, enregistrés dans vos rapports." />
      {recherches && <RechercheRapide cat={catalogue()} recentes={recherches} />}

      <section aria-labelledby="tb-analyses">
        <h2 id="tb-analyses" className="mb-3 font-display text-lg font-semibold">
          Analyses du mois
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tuile l="Analyses utilisées" v={c.illimite ? String(c.utilisees) : `${c.utilisees} / ${c.offre.analyses}`} sous={c.illimite ? "sans limite" : `${c.restantes} restante${c.restantes > 1 ? "s" : ""}`} alerte={!c.illimite && c.restantes <= 3} />
          <Tuile l="Affaires GO repérées" v={String(go.length)} sous={`sur ${n} annonce${n > 1 ? "s" : ""} analysée${n > 1 ? "s" : ""}`} />
          <Tuile l="Marge moyenne des GO" v={eur(marges.length ? marges.reduce((s, x) => s + x, 0) / marges.length : null)} sous="estimée avant achat" />
          <Tuile l="Meilleure affaire" v={eur(meilleure?.marge ?? null)} sous={meilleure?.titre ?? "aucune ce mois"} />
        </div>
      </section>

      {parc ? (
        <section aria-labelledby="tb-parc">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="tb-parc" className="font-display text-lg font-semibold">
              Parc et marges réelles
            </h2>
            <Link href="/app/parc" className="text-sm text-o2 underline-offset-4 hover:underline">
              Gérer le parc
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Tuile l="Voitures en stock" v={String(parc.enStock)} sous={parc.plusVieux != null ? `la plus ancienne depuis ${parc.plusVieux} jours` : undefined} alerte={(parc.plusVieux ?? 0) > 45} />
            <Tuile l="Capital immobilisé" v={eur(parc.capital)} sous="achats + frais du stock" />
            <Tuile l="Marge réalisée ce mois" v={eur(parc.margeMois)} sous="voitures vendues ce mois" />
            <Tuile l="Marge moyenne par voiture" v={eur(parc.margeMoyenne)} sous={`${parc.vendus} voiture${parc.vendus > 1 ? "s" : ""} vendue${parc.vendus > 1 ? "s" : ""}`} />
            <Tuile l="Rotation moyenne" v={parc.rotation != null ? `${parc.rotation} j` : "—"} sous="de l'achat à la vente" />
            <Tuile l="Marge réalisée au total" v={eur(parc.margeTotale)} />
          </div>
        </section>
      ) : (
        <section className="carte flex flex-wrap items-center justify-between gap-4 border-dashed p-6">
          <div className="max-w-xl">
            <h2 className="font-display text-lg font-semibold">Le tableau de bord complet</h2>
            <p className="mt-1 text-ink-2">Stock, capital immobilisé, marges réelles et rotation : inclus dans Benef Pro, avec la gestion du parc.</p>
          </div>
          <Link href="/app/compte#formule" className="btn btn-sm">
            Découvrir Pro
          </Link>
        </section>
      )}

      <section aria-labelledby="tb-derniers">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tb-derniers" className="font-display text-lg font-semibold">
            Derniers rapports
          </h2>
          <Link href="/app/rapports" className="text-sm text-o2 underline-offset-4 hover:underline">
            Tous les rapports
          </Link>
        </div>
        <ListeRapports rapports={derniers ?? []} comparateur={false} choixVue={false} vide="Aucun rapport pour le moment : collez le lien d'une annonce ci-dessus." />
      </section>
    </div>
  );
}

export default async function Accueil() {
  const c = await compteBenef("/app");
  if (familleEspace(c) === "particulier") return <TableauParticulier c={c} />;
  if (c.offre.famille === "benef") return c.offre.tableauDeBord === "complet" ? <TableauComplet c={c} /> : <TableauBenef c={c} />;
  return (
    <div className="grid gap-8">
      <Bonjour c={c} texte="Bienvenue dans votre espace Benef. Choisissez votre formule pour chiffrer vos premières annonces." />
      <ul className="grid gap-3 sm:grid-cols-3">
        {[
          ["Marge nette", "Ce qu'il vous reste une fois la voiture revendue, après carte grise, trajet, remise en état et commissions."],
          ["Prix d'offre et plafond", "Le prix à proposer au vendeur et celui à ne jamais dépasser."],
          ["Tableau de bord", "Rapports enregistrés, comparateur, parc et marges réelles selon la formule."],
        ].map(([t, d]) => (
          <li key={t} className="carte p-5">
            <p className="font-display font-semibold">{t}</p>
            <p className="mt-1 text-sm text-ink-3">{d}</p>
          </li>
        ))}
      </ul>
      <CartesOffres ids={BENEF} />
      <p className="text-sm text-ink-3">
        Vous cherchez une voiture pour vous ? <Link href="/app/compte#usage" className="text-o2 underline underline-offset-4">Passez en usage particulier</Link> : votre première analyse est offerte.
      </p>
    </div>
  );
}
