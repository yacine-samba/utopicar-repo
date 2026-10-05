import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { Ico } from "@/components/espace/Icones";

export const metadata: Metadata = { title: "Extension Utopicar" };

const VERSION = "1.2";

/** Extension Chrome / Edge : analyser une annonce et relever une page de résultats Leboncoin en un clic. */
export default async function Page() {
  const c = await compteCourant();
  if (!c) redirect("/connexion?next=/app/extension");
  const pro = c.offre.recherche || c.illimite;
  return (
    <div className="grid max-w-4xl gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Extension Utopicar</h1>
        <p className="mt-2 text-ink-2">
          Deux boutons ajoutés directement sur Leboncoin : analyser l&apos;annonce que vous regardez, ou relever toute une page de résultats pour placer chaque voiture sur sa cote.
        </p>
      </div>

      <section className="carte grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <div>
          <p className="font-display text-lg font-semibold">Version {VERSION} · Chrome, Edge, Brave, Opera</p>
          <p className="mt-1 text-sm text-ink-3">Aucune donnée ne passe par un serveur tiers : l&apos;extension lit la page ouverte et l&apos;envoie à votre espace Utopicar.</p>
        </div>
        <a href="/utopicar-extension.zip" download className="btn btn-o gap-2">
          <Ico nom="extension" className="size-5" /> Télécharger l&apos;extension
        </a>
      </section>

      <section aria-labelledby="ext-quoi" className="grid gap-4 sm:grid-cols-2">
        <h2 id="ext-quoi" className="sr-only">Ce qu&apos;elle fait</h2>
        <div className="carte grid content-start gap-2 p-5">
          <p className="font-semibold">« Analyser avec Utopicar »</p>
          <p className="text-sm text-ink-2">Sur une annonce : texte, photos et lien partent vers l&apos;analyse, qui démarre seule. Plus de copier-coller.</p>
        </div>
        <div className="carte grid content-start gap-2 p-5">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            « Relever la page avec Utopicar » {!pro && <span className="rounded-full border border-line-2 px-2 py-px text-[11px] font-normal text-ink-3">Benef Pro</span>}
          </p>
          <p className="text-sm text-ink-2">
            Sur une page de résultats : toutes les annonces sont reconnues (marque, modèle, génération) et placées sur leur cote dans la page{" "}
            <Link href="/app/cote" className="text-o2 underline underline-offset-4">Cote</Link>. Elles rejoignent aussi la base du marché.
          </p>
        </div>
      </section>

      <section aria-labelledby="ext-installer" className="grid gap-3">
        <h2 id="ext-installer" className="font-display text-xl font-semibold">Installer en 1 minute</h2>
        <ol className="carte grid gap-3 p-5 text-sm text-ink-2 sm:p-6">
          {[
            <>Téléchargez l&apos;extension, puis décompressez le fichier (clic droit → « Extraire tout » sur Windows, double-clic sur Mac).</>,
            <>Ouvrez <code className="rounded bg-glass px-1.5 py-0.5 text-ink">chrome://extensions</code> (Edge : <code className="rounded bg-glass px-1.5 py-0.5 text-ink">edge://extensions</code>).</>,
            <>Activez le <b className="text-ink">Mode développeur</b> (en haut à droite).</>,
            <>Cliquez sur <b className="text-ink">Charger l&apos;extension non empaquetée</b> et choisissez le dossier décompressé (ou glissez-le dans la page).</>,
            <>Épinglez l&apos;extension (icône puzzle), puis ouvrez une annonce ou une recherche Leboncoin : les boutons Utopicar apparaissent en bas à droite.</>,
          ].map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-o/15 text-xs font-semibold text-o2">{i + 1}</span>
              <span>{e}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-3">
          Mise à jour : téléchargez la nouvelle version, remplacez le dossier, puis cliquez sur la flèche « Recharger » de l&apos;extension dans <code>chrome://extensions</code>. Firefox et Safari ne sont pas encore pris en charge.
        </p>
      </section>
    </div>
  );
}
