import Link from "next/link";
import { compteBenef } from "@/lib/benef";
import { debutPeriode, type Compte } from "@/lib/compte";
import { familleEspace, nomFormule } from "@/lib/espace";
import { BENEF, GUIDE, OFFRES, prixTxt } from "@/lib/offres";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { statsParc, type Vehicule } from "@/lib/parc";
import { ListeRapports } from "@/components/benef/ListeRapports";
import { CartesOffres } from "@/components/site/CartesOffres";
import { AnalyseRapide } from "@/components/espace/AnalyseRapide";
import { ListeAnalyses } from "@/components/espace/ListeAnalyses";

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
    .select("id, titre, verdict, prix, note, created_at")
    .eq("mode", "particulier")
    .order("created_at", { ascending: false })
    .limit(4);
  const lignes = data ?? [];
  return (
    <div className="grid gap-8">
      <Bonjour c={c} texte="Votre espace pour acheter une voiture d'occasion sans mauvaise surprise." />
      <AnalyseRapide titre="Une voiture en vue ?" texte="Collez le lien de l'annonce : en une minute, le verdict, ce qu'elle va vraiment vous coûter et ce qu'il faut vérifier." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Tuile
          l={o.parMois ? "Analyses restantes ce mois" : "Analyse offerte"}
          v={c.illimite ? "Illimité" : `${c.restantes} / ${o.analyses}`}
          sous={c.restantes ? (o.parMois ? "Elles reviennent le 1er du mois." : "Sans carte bancaire.") : o.parMois ? "Elles reviennent le 1er du mois." : "Votre analyse offerte a servi."}
          alerte={c.restantes === 0}
          lien={o.id === "serenite" ? undefined : { href: "/app/compte#formule", l: o.prix ? "Plus d'analyses" : "Voir les formules" }}
        />
        <Tuile l="Votre formule" v={nomFormule(c)} sous={o.prix ? `${prixTxt(o.prix)} par mois` : "Gratuite"} lien={{ href: "/app/compte#formule", l: "Gérer" }} />
        <Tuile l="Les guides" v={c.guide ? "Accès complet" : "2 chapitres offerts"} sous={c.guide ? "Les quatre guides, imprimables." : `Accès complet : ${prixTxt(GUIDE.prix)}, ou inclus dans Sérénité.`} lien={{ href: "/app/guides", l: "Lire" }} />
      </div>

      <section aria-labelledby="tb-analyses" className="grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tb-analyses" className="font-display text-xl font-semibold">
            Vos dernières analyses
          </h2>
          {lignes.length > 0 && (
            <Link href="/app/rapports" className="text-sm text-o2 underline-offset-4 hover:underline">
              Toutes mes analyses
            </Link>
          )}
        </div>
        {lignes.length ? (
          <ListeAnalyses lignes={lignes} />
        ) : (
          <ol className="grid gap-3 sm:grid-cols-3">
            {ETAPES.map(([t, d], i) => (
              <li key={t} className="carte p-5">
                <span className="grid size-8 place-items-center rounded-full bg-o/15 font-display font-semibold text-o2">{i + 1}</span>
                <p className="mt-3 font-display font-semibold">{t}</p>
                <p className="mt-1 text-sm text-ink-3">{d}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

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

async function TableauBenef({ c }: { c: Compte }) {
  const sb = await supabaseServeur();
  const debut = debutPeriode(c.offre);
  const [{ data: mois }, { data: derniers }] = await Promise.all([
    sb.from("rapports").select("id, titre, marge, verdict, prix").eq("mode", "benef").gte("created_at", debut).limit(1000),
    sb.from("rapports").select("id, titre, created_at, prix, verdict, marge, note").eq("mode", "benef").order("created_at", { ascending: false }).limit(5),
  ]);
  const go = (mois ?? []).filter((r) => r.verdict?.startsWith("GO"));
  const marges = go.map((r) => r.marge).filter((x): x is number => x != null);
  const meilleure = [...(mois ?? [])].filter((r) => r.marge != null).sort((a, b) => (b.marge ?? 0) - (a.marge ?? 0))[0];
  const complet = c.offre.tableauDeBord === "complet";
  const parc = complet ? statsParc(((await sb.from("parc").select("*").limit(1000)).data ?? []) as Vehicule[]) : null;
  const n = (mois ?? []).length;

  return (
    <div className="grid gap-8">
      <Bonjour c={c} texte={`${nomFormule(c)} · vos chiffres du mois, depuis le 1er.`} />
      <AnalyseRapide titre="Une annonce à chiffrer ?" texte="Collez le lien Leboncoin : marge nette après frais, prix d'offre et plafond d'achat, enregistrés dans vos rapports." />

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
        <ListeRapports rapports={derniers ?? []} comparateur={false} vide="Aucun rapport pour le moment : collez le lien d'une annonce ci-dessus." />
      </section>
    </div>
  );
}

export default async function Accueil() {
  const c = await compteBenef("/app");
  if (familleEspace(c) === "particulier") return <TableauParticulier c={c} />;
  if (c.offre.famille === "benef") return <TableauBenef c={c} />;
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
