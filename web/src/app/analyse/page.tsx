import type { Metadata } from "next";
import Link from "next/link";
import { OutilAnalyse } from "@/components/analyse/OutilAnalyse";
import { compteCourant } from "@/lib/compte";
import { OFFRES } from "@/lib/offres";

export const metadata: Metadata = {
  title: "Estimer une affaire : analysez une annonce de voiture",
  description: "Collez une annonce de voiture d'occasion : verdict, coût réel d'achat et points à vérifier, expliqués simplement. Première analyse offerte.",
};

export default async function Page() {
  const compte = await compteCourant();
  const o = compte?.offre ?? OFFRES.gratuit;
  return (
    <div className="wrap py-12">
      <OutilAnalyse
        ville={compte?.ville ?? ""}
        maxPhotos={o.photos}
        entete={
          <div className="grid gap-3">
            <span className="kicker w-fit">{compte ? `Formule ${o.nom} · ${compte.restantes} analyse${compte.restantes > 1 ? "s" : ""} restante${compte.restantes > 1 ? "s" : ""}` : "Première analyse offerte"}</span>
            <h1 className="h-sec">
              Cette voiture est-elle <span className="it">une bonne affaire ?</span>
            </h1>
            <p className="text-lg text-ink-2">Collez l&apos;annonce. Nous vous disons combien elle va vraiment vous coûter et ce qu&apos;il faut vérifier avant d&apos;acheter, en langage clair.</p>
            {!compte && (
              <p className="text-sm text-ink-3">
                Un compte gratuit vous sera demandé pour voir le résultat. Déjà inscrit ? <Link href="/connexion?next=/analyse" className="text-o2 underline underline-offset-4">Connectez-vous</Link>.
              </p>
            )}
            <details className="carte mt-2 p-4 text-sm text-ink-2">
              <summary className="cursor-pointer font-medium text-ink">Comment copier une annonce ?</summary>
              <ol className="mt-3 grid list-decimal gap-1.5 pl-5">
                <li>Ouvrez l&apos;annonce sur Leboncoin, La Centrale ou AutoScout24.</li>
                <li>Sur ordinateur : Ctrl+A puis Ctrl+C (Cmd sur Mac). Sur téléphone : appui long sur le texte, « Tout sélectionner », « Copier ».</li>
                <li>Revenez ici et collez dans le champ ci-dessous.</li>
              </ol>
            </details>
          </div>
        }
      />
    </div>
  );
}
