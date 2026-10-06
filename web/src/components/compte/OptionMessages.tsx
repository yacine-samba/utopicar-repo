import Link from "next/link";
import { OPTION_MESSAGES, prixTxt } from "@/lib/offres";
import { BoutonAbonner } from "@/components/site/BoutonAbonner";

/** Option « Messages Leboncoin » de Benef Pro, dans le profil. */
export function OptionMessages({ actif, illimite }: { actif: boolean; illimite: boolean }) {
  return (
    <section id="option-messages" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-messages">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="c-messages" className="font-display text-xl font-semibold">Option {OPTION_MESSAGES.nom}</h2>
        <span className={actif ? "rounded-full border border-ok/40 px-2.5 py-0.5 text-xs text-ok" : "rounded-full border border-line-2 px-2.5 py-0.5 text-xs text-ink-3"}>
          {actif ? (illimite ? "Incluse (compte illimité)" : "Active") : "Non souscrite"}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-ink-2">
        Un premier message automatique aux vendeurs des annonces de vos recherches, espacé d&apos;une à deux minutes, sans jamais recontacter une annonce déjà contactée. Les annonces qui refusent le démarchage sont ignorées par défaut. Mini boîte de réception pour suivre les réponses.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {actif ? (
          <Link href="/app/messages" className="btn btn-o">Ouvrir les messages</Link>
        ) : (
          <div className="w-full max-w-xs">
            <BoutonAbonner produit="messages">Ajouter l&apos;option : {prixTxt(OPTION_MESSAGES.prix)} par mois</BoutonAbonner>
          </div>
        )}
        <p className="text-sm text-ink-3">En plus de Benef Pro, sans engagement.</p>
      </div>
    </section>
  );
}
