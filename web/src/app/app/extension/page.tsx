import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { Ico } from "@/components/espace/Icones";

export const metadata: Metadata = { title: "Extension Utopicar" };

const VERSION = "4.4";

/** Extension Chrome / Edge : envoyer une annonce, lire en entier une sélection, relever toute une recherche Leboncoin. */
export default async function Page() {
  const c = await compteCourant();
  if (!c) redirect("/connexion?next=/app/extension");
  // réservée au compte illimité : invisible et inaccessible pour toutes les formules
  if (!c.illimite) redirect("/app");
  const pro = c.offre.recherche || c.illimite;
  const benef = c.offre.famille === "benef" || c.illimite;
  const actions: { t: string; d: React.ReactNode; badge?: string }[] = [
    { t: "Envoyer cette annonce", d: <>Sur une annonce : description complète, tous les critères Leboncoin et jusqu&apos;à 20 photos. La page <Link href="/app/analyser" className="text-o2 underline underline-offset-4">Analyser</Link> s&apos;ouvre et l&apos;analyse démarre seule.</> },
    { t: "Lire en entier", badge: benef ? undefined : "Benef", d: <>Sur une page de résultats : cochez jusqu&apos;à 10 annonces. Chacune est ouverte en fond et lue avec ses photos, au rythme d&apos;une personne (5 à 10 s par annonce). Le <Link href="/app/tri" className="text-o2 underline underline-offset-4">Tri rapide</Link> s&apos;ouvre avec les annonces classées.</> },
    { t: "Relever toute la recherche", badge: pro ? undefined : "Benef Pro", d: <>Toutes les pages de la recherche, jusqu&apos;à 3 500 annonces (le maximum de Leboncoin), avec une pause entre deux pages. La page <Link href="/app/cote" className="text-o2 underline underline-offset-4">Cote</Link> s&apos;ouvre avec chaque annonce placée sur sa cote, et les annonces rejoignent la base du marché.</> },
  ];
  return (
    <div className="grid max-w-4xl gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Extension Utopicar</h1>
        <p className="mt-2 text-ink-2">
          Depuis Leboncoin, en un clic sur l&apos;icône Utopicar (ou Alt+Maj+U) : une annonce, une sélection lue en entier, ou toute une recherche, ouvertes directement dans votre espace.
        </p>
      </div>

      <section className="carte grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <div>
          <p className="font-display text-lg font-semibold">Version {VERSION} · Chrome, Edge, Brave, Opera</p>
          <p className="mt-1 text-sm text-ink-3">Tout passe par votre navigateur : aucune donnée ne transite par un serveur tiers. La lecture va au rythme d&apos;une personne et s&apos;arrête si Leboncoin demande une vérification ; elle ne la contourne jamais.</p>
        </div>
        <a href="/api/extension" download="utopicar-extension.zip" className="btn btn-o gap-2">
          <Ico nom="extension" className="size-5" /> Télécharger l&apos;extension
        </a>
      </section>

      <section aria-labelledby="ext-quoi" className="grid gap-4 md:grid-cols-3">
        <h2 id="ext-quoi" className="sr-only">Ce qu&apos;elle fait</h2>
        {actions.map((a) => (
          <div key={a.t} className="carte grid content-start gap-2 p-5">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              « {a.t} » {a.badge && <span className="rounded-full border border-line-2 px-2 py-px text-[11px] font-normal text-ink-3">{a.badge}</span>}
            </p>
            <p className="text-sm text-ink-2">{a.d}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="ext-installer" className="grid gap-3">
        <h2 id="ext-installer" className="font-display text-xl font-semibold">Installer en 2 minutes</h2>
        <ol className="carte grid gap-3 p-5 text-sm text-ink-2 sm:p-6">
          {[
            <>Téléchargez l&apos;extension et décompressez-la dans un dossier où elle restera (ex. Documents/utopicar-extension).</>,
            <>Ouvrez <code className="rounded bg-glass px-1.5 py-0.5 text-ink">chrome://extensions</code> (Edge : <code className="rounded bg-glass px-1.5 py-0.5 text-ink">edge://extensions</code>) et activez le <b className="text-ink">Mode développeur</b>.</>,
            <>Cliquez sur <b className="text-ink">Charger l&apos;extension non empaquetée</b> et choisissez le dossier.</>,
            <>Acceptez les notifications : c&apos;est ce qui vous prévient quand une lecture est finie.</>,
            <>Épinglez l&apos;icône Utopicar (menu puzzle, punaise). Restez connecté ici : les envois s&apos;ouvrent directement dans votre espace.</>,
          ].map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-o/15 text-xs font-semibold text-o2">{i + 1}</span>
              <span>{e}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-3">
          Mise à jour : remplacez les fichiers du dossier par ceux de la nouvelle version, puis cliquez sur « Actualiser » (flèche ronde) sur la carte Utopicar dans <code>chrome://extensions</code>. Si un envoi ne s&apos;ouvre pas, il est aussi copié : faites Ctrl+V dans la page concernée.
        </p>
        <p className="text-sm text-ink-3">
          Bon usage : les règles de Leboncoin interdisent la collecte automatique en masse. L&apos;extension lit seulement ce que vous choisissez, à un rythme humain, depuis votre navigateur. Gardez ce rythme : pas de relevés enchaînés toute la journée.
        </p>
      </section>
    </div>
  );
}
