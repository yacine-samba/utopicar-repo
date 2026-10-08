import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OutilAnalyse } from "@/components/analyse/OutilAnalyse";
import { compteCourant } from "@/lib/compte";
import { OFFRES } from "@/lib/offres";

export const metadata: Metadata = {
  title: "Estimer une affaire : analysez une annonce de voiture",
  description: "Collez une annonce de voiture d'occasion : verdict, coût réel d'achat et points à vérifier, expliqués simplement. Première analyse offerte.",
};

export default async function Page() {
  const compte = await compteCourant();
  // Connecté : l'analyse se fait dans l'espace, où elle est enregistrée et retrouvée.
  if (compte) redirect("/app/analyser");
  return (
    <div className="wrap py-12">
      <OutilAnalyse
        ville=""
        maxPhotos={OFFRES.gratuit.photos}
        entete={
          <div className="grid gap-3">
            <span className="kicker w-fit">Première analyse offerte</span>
            <h1 className="h-sec">
              Cette voiture est-elle <span className="it">une bonne affaire ?</span>
            </h1>
            <p className="text-lg text-ink-2">Collez l&apos;annonce. Nous vous disons combien elle va vraiment vous coûter et ce qu&apos;il faut vérifier avant d&apos;acheter, en langage clair.</p>
            <p className="text-sm text-ink-3">
              L&apos;aperçu est immédiat et sans compte ; le rapport complet demande un compte gratuit. Déjà inscrit ? <Link href="/connexion?next=/app/analyser" className="text-o2 underline underline-offset-4">Connectez-vous</Link>.
            </p>
            <details className="carte mt-2 p-4 text-sm text-ink-2">
              <summary className="cursor-pointer font-medium text-ink">Comment copier une annonce ?</summary>
              <ul className="mt-3 grid list-disc gap-1.5 pl-5">
                <li>
                  <b className="text-ink">Leboncoin</b> : copiez simplement le lien de l&apos;annonce (bouton « Partager », puis « Copier le lien ») et collez-le ci-dessous. L&apos;annonce et ses photos se remplissent toutes seules.
                </li>
                <li>
                  <b className="text-ink">La Centrale, AutoScout24 et les autres</b> : sur ordinateur, Ctrl+A puis Ctrl+C (Cmd sur Mac) ; sur téléphone, appui long sur le texte, « Tout sélectionner », « Copier ». Collez ensuite le texte ci-dessous.
                </li>
              </ul>
            </details>
          </div>
        }
      />
    </div>
  );
}
