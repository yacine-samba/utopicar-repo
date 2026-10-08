import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { coteParSlug, dateTxt, eur, nb, kmTxt, libelle, marqueDe, slugCote, TRANCHES_KM, type CoteDetail } from "@/lib/cotes-publiques";
import { aEviterPour, fiabiliteModele } from "@/lib/analyse/fiabilite";
import { moteurParIndex } from "@/lib/moteurs";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { Barres } from "@/components/cote/Barres";
import { Essai } from "@/components/accueil/Essai";
import { Faq } from "@/components/site/Faq";
import { JsonLdFaq, JsonLdFil } from "@/components/site/JsonLd";

/* Page « Cote d'un modèle » : le prix du marché d'une génération et d'une énergie, d'après les annonces Leboncoin en ligne.
   Contenu calculé depuis la base (médianes, prix par année et par kilométrage), fiabilité tirée de la liste de l'outil,
   et le champ d'analyse de l'accueil pour passer de la cote à une annonce précise. */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { cote } = await coteParSlug(slug);
  if (!cote) return { title: "Cote introuvable", robots: { index: false } };
  const l = libelle(cote.nom);
  return {
    title: `Cote ${l} d'occasion : prix du marché`,
    description: `Prix médian ${eur(cote.mediane)} sur ${nb(cote.n)} annonces en ligne (${cote.y0}-${cote.y1}) : prix par année, par kilométrage, moteurs fiables et à éviter. Analysez une annonce gratuitement.`,
    alternates: { canonical: `/cote/${slug}` },
  };
}

/** Questions-réponses calculées depuis la cote : affichées sur la page et données à Google (FAQPage). */
function questions(c: CoteDetail, l: string, fiab: ReturnType<typeof fiabiliteModele>) {
  const date = dateTxt(c.maj);
  const q: { q: string; r: string }[] = [
    {
      q: `Quel est le prix d'une ${l} d'occasion ?`,
      r: `D'après ${nb(c.n)} annonces en ligne sur Leboncoin${date ? ` (relevé du ${date})` : ""}, le prix médian est de ${eur(c.mediane)}. La moitié des annonces se situe entre ${eur(c.p25)} et ${eur(c.p75)}${c.km ? `, pour un kilométrage médian de ${kmTxt(c.km)}` : ""}.`,
    },
  ];
  const freq = [...c.par_annee].sort((a, b) => b.n - a.n)[0];
  if (freq && c.par_annee.length >= 2)
    q.push({ q: `Combien coûte une ${l} de ${freq.annee} ?`, r: `Pour les ${freq.n} annonces de ${freq.annee}, le prix médian est de ${eur(freq.mediane)}${freq.km ? `, avec ${kmTxt(freq.km)} au compteur en médiane` : ""}.` });
  const k1 = c.par_km.find((x) => x.t === 1), k2 = c.par_km.find((x) => x.t === 2), k3 = c.par_km.find((x) => x.t === 3);
  const [a, b] = k1 && k2 ? [k1, k2] : k2 && k3 ? [k2, k3] : [null, null];
  if (a && b && a.mediane > b.mediane)
    q.push({
      q: `Combien le kilométrage fait-il baisser le prix d'une ${l} ?`,
      r: `Entre ${TRANCHES_KM[a.t].toLowerCase()}, le prix médian est de ${eur(a.mediane)} ; entre ${TRANCHES_KM[b.t].toLowerCase()}, de ${eur(b.mediane)}, soit environ ${eur(a.mediane - b.mediane)} de moins (années confondues).`,
    });
  if (fiab) q.push({ q: `Quel moteur choisir sur une ${l} ?`, r: `Les moteurs réputés fiables : ${fiab.bons}. À vérifier avant d'acheter : ${fiab.verif}` });
  q.push({
    q: `Comment savoir si une annonce de ${l} est une bonne affaire ?`,
    r: "Collez l'annonce dans Utopicar : elle est placée sur la cote de sa génération (même moteur, même âge, même kilométrage), les défauts qui coûtent cher sont repérés dans le texte et vous obtenez le prix à proposer. La première analyse est offerte.",
  });
  return q;
}

export default async function PageCote({ params }: Params) {
  const { slug } = await params;
  const [{ cote: c, liste }, fournisseurs] = await Promise.all([coteParSlug(slug), fournisseursActifs()]);
  if (!c) notFound();
  const l = libelle(c.nom);
  const date = dateTxt(c.maj);
  const fiab = fiabiliteModele(l, c.y0, c.y1);
  const aEviter = aEviterPour(marqueDe(c.base));
  const faq = questions(c, l, fiab);
  const autres = liste.filter((x) => x.cle !== c.cle);
  const memeModele = autres.filter((x) => x.base === c.base);

  return (
    <div className="wrap py-12">
      <JsonLdFil etapes={[{ nom: "Accueil", chemin: "/" }, { nom: "Cotes", chemin: "/cote" }, { nom: l, chemin: `/cote/${slug}` }]} />
      <JsonLdFaq questions={faq} />
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>{" "}
        ›{" "}
        <Link href="/cote" className="hover:text-ink">
          Cotes
        </Link>{" "}
        › <span aria-current="page">{l}</span>
      </nav>

      {/* ---------------- en-tête : le chiffre d'abord ---------------- */}
      <header className="max-w-3xl">
        <h1 className="font-display text-[clamp(32px,5.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">
          Cote {l} <span className="it">d&apos;occasion</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          Modèles {c.y0} à {c.y1}. Prix demandés sur {nb(c.n)} annonces Leboncoin en ligne{date ? `, relevées le ${date}` : ""}.
        </p>
      </header>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Prix médian", eur(c.mediane), "la moitié des annonces est en dessous"],
          ["La moitié des annonces", `${eur(c.p25)} – ${eur(c.p75)}`, "entre le premier et le troisième quart"],
          ["Kilométrage médian", c.km ? kmTxt(c.km) : "—", "au compteur"],
          ["Annonces relevées", nb(c.n), date ? `le ${date}` : "sur Leboncoin"],
        ].map(([t, v, s]) => (
          <div key={t} className="carte p-5">
            <dt className="text-sm text-ink-3">{t}</dt>
            <dd className="num mt-1 font-display text-2xl font-semibold">{v}</dd>
            <dd className="mt-0.5 text-xs text-ink-3">{s}</dd>
          </div>
        ))}
      </dl>

      {/* ---------------- prix selon l'année et le kilométrage ---------------- */}
      <section aria-labelledby="c-prix" className="mt-14">
        <h2 id="c-prix" className="font-display text-2xl font-semibold">
          Le prix selon l&apos;année et le kilométrage
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Barres
            titre="Prix médian selon l'année"
            colonne="Année"
            aide="Année du modèle indiquée dans l'annonce."
            lignes={c.par_annee.map((x) => ({ l: String(x.annee), v: x.mediane, n: x.n }))}
          />
          <Barres titre="Prix médian selon le kilométrage" colonne="Kilométrage" aide="Toutes années confondues." lignes={c.par_km.map((x) => ({ l: TRANCHES_KM[x.t], v: x.mediane, n: x.n }))} />
        </div>
        {(c.par_boite.length > 1 || c.par_ch.length > 1) && (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Barres titre="Boîte manuelle ou automatique" colonne="Boîte" lignes={c.par_boite.map((x) => ({ l: x.boite, v: x.mediane, n: x.n }))} />
            <Barres titre="Les puissances les plus courantes" colonne="Puissance" aide="Puissance réelle (ch DIN)." lignes={c.par_ch.map((x) => ({ l: `${x.ch} ch`, v: x.mediane, n: x.n }))} />
          </div>
        )}
      </section>

      {/* ---------------- passer de la cote à une annonce ---------------- */}
      <section aria-labelledby="c-essai" className="mt-16 text-center">
        <h2 id="c-essai" className="h-sec">
          Une {l} en vue ? <span className="it">Collez l&apos;annonce</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-2">L&apos;outil la place sur cette cote, avec son moteur, son âge et son kilométrage, et repère les défauts qui coûtent cher. Aperçu en 2 secondes, sans compte.</p>
        <div className="mt-8">
          <Essai fournisseurs={fournisseurs} depuis="cote" retour={`/cote/${slug}`} />
        </div>
      </section>

      {/* ---------------- fiabilité ---------------- */}
      {(fiab || aEviter.length > 0) && (
        <section aria-labelledby="c-fiab" className="mt-16 grid gap-5 lg:grid-cols-2">
          <h2 id="c-fiab" className="font-display text-2xl font-semibold lg:col-span-2">
            Moteurs fiables et points à surveiller
          </h2>
          {fiab && (
            <div className="carte p-6">
              <p className="text-sm font-medium text-ok">Dans la liste des modèles fiables de l&apos;outil</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{fiab.nom}</h3>
              <p className="mt-2 text-ink-2">{fiab.pourquoi}</p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-ink-3">Moteurs à privilégier</dt>
                  <dd className="text-ink">{fiab.bons}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">À vérifier avant d&apos;acheter</dt>
                  <dd className="text-ink-2">{fiab.verif}</dd>
                </div>
                <div>
                  <dt className="text-ink-3">Tranche conseillée</dt>
                  <dd className="text-ink-2">
                    {fiab.ans[0]} à {fiab.ans[1]}, moins de {kmTxt(fiab.km)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
          {(aEviter.length > 0 || (fiab?.aEviter.length ?? 0) > 0) && (
            <div className="carte p-6">
              <p className="text-sm font-medium text-warn">Signalés par l&apos;outil sur chaque annonce</p>
              <h3 className="mt-2 font-display text-xl font-semibold">Moteurs et boîtes à éviter</h3>
              <ul className="mt-4 grid gap-2.5 text-sm text-ink-2">
                {[...(fiab?.aEviter ?? []).map((texte) => ({ texte, index: -1 })), ...aEviter].map((t) => {
                  const m = moteurParIndex(t.index);
                  return (
                    <li key={t.texte} className="flex gap-2.5">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-warn/15 text-[11px] text-warn" aria-hidden="true">
                        !
                      </span>
                      <span>
                        {t.texte}
                        {m && (
                          <>
                            {" "}
                            <Link href={`/moteur/${m.slug}`} className="whitespace-nowrap text-o2 underline underline-offset-4">
                              le guide
                            </Link>
                          </>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ---------------- questions ---------------- */}
      <section aria-labelledby="c-faq" className="mt-16">
        <h2 id="c-faq" className="mb-6 text-center font-display text-2xl font-semibold">
          Questions sur la {l}
        </h2>
        <Faq questions={faq.map((x) => ({ q: x.q, r: <p>{x.r}</p> }))} />
      </section>

      {/* ---------------- autres cotes ---------------- */}
      {autres.length > 0 && (
        <nav aria-labelledby="c-autres" className="mt-16">
          <h2 id="c-autres" className="font-display text-xl font-semibold">
            {memeModele.length ? "Autres versions et autres modèles" : "Autres cotes"}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[...memeModele, ...autres.filter((x) => x.base !== c.base)].map((x) => (
              <li key={x.cle}>
                <Link href={`/cote/${slugCote(x.nom)}`} className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-4 text-sm text-ink-2 transition hover:border-o/50 hover:text-ink">
                  {libelle(x.nom)} <span className="num ml-2 text-ink-3">{eur(x.mediane)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <p className="mt-12 text-xs text-ink-3">
        Méthode : prix demandés (pas des prix de vente) sur les annonces Leboncoin vues ces 90 derniers jours, de 500 à 150 000 €, 2 % les plus bas et les plus hauts écartés. Une ligne n&apos;est affichée qu&apos;à partir de 5 annonces.
      </p>
    </div>
  );
}
