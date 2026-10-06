import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { confirmerRetour } from "@/lib/stripe-synchro";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { supabaseService } from "@/lib/supabase/service";
import { OPTION_MESSAGES, prixTxt } from "@/lib/offres";
import { BoutonAbonner } from "@/components/site/BoutonAbonner";
import { EspaceMessages, type Boite, type Campagne, type CompteLbc, type EnvoiLbc } from "@/components/messages/EspaceMessages";

export const metadata: Metadata = { title: "Messages Leboncoin" };

/** Réglages de l'envoi (interrupteur général, date d'arrêt des essais), lus côté serveur : la table n'est pas lisible du navigateur. */
async function etatEnvoi() {
  try {
    const { data } = await supabaseService().from("reglages").select("cle, valeur").in("cle", ["lbc_actif", "lbc_jusqu_au"]);
    const r = Object.fromEntries((data ?? []).map((x) => [x.cle, x.valeur as string]));
    const jusquAu = r.lbc_jusqu_au || null;
    return { actif: r.lbc_actif === "oui", jusquAu, passe: !!jusquAu && Date.parse(jusquAu) < Date.now() };
  } catch {
    return { actif: true, jusquAu: null, passe: false };
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ paiement?: string; session_id?: string }> }) {
  const c = await compteBenef("/app/messages");
  const p = await searchParams;
  if (p.paiement === "ok" && p.session_id) {
    await confirmerRetour(p.session_id, c.id);
    redirect("/app/messages");
  }
  if (!c.messages)
    return (
      <section className="carte mx-auto max-w-2xl p-8 text-center">
        <p className="text-sm font-medium text-o2">Option de Benef Pro</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Messages Leboncoin</h1>
        <p className="mt-3 text-ink-2">
          Un premier message envoyé automatiquement aux vendeurs des annonces de vos recherches, une annonce à la fois, espacé d&apos;une à deux minutes, sans jamais recontacter une annonce déjà contactée. Les annonces qui refusent le démarchage sont ignorées par défaut. Une mini boîte de réception montre les réponses.
        </p>
        <div className="mx-auto mt-6 grid max-w-xs gap-3">
          {c.offre.id === "pro" ? (
            <BoutonAbonner produit="messages">Ajouter l&apos;option : {prixTxt(OPTION_MESSAGES.prix)} par mois</BoutonAbonner>
          ) : (
            <Link href="/tarifs#benef" className="btn btn-o">Passer à Benef Pro</Link>
          )}
          <Link href="/app/compte#option-messages" className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">Ma formule</Link>
        </div>
      </section>
    );

  const sb = await supabaseServeur();
  const [{ data: compte }, { data: campagnes }, { data: recherches }, { data: envois }, { data: boite }, etat] = await Promise.all([
    sb.rpc("lbc_mon_compte"),
    sb.from("lbc_campagnes").select("id, recherche_id, nom, message, actif, ignorer_refus, updated_at").order("created_at"),
    sb.from("recherches").select("id, nom, trouvees, derniere_le").order("derniere_le", { ascending: false }).limit(100),
    sb.from("lbc_envois").select("id, campagne_id, annonce_id, url, titre, prix, statut, raison, created_at, traite_le").order("created_at", { ascending: false }).limit(300),
    sb.from("lbc_boites").select("conversations, non_lus, total, maj, demande, run_id, erreur").maybeSingle(),
    etatEnvoi(),
  ]);
  return (
    <div className="grid gap-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">Messages Leboncoin</h1>
        <p className="mt-2 text-ink-2">
          Choisissez une de vos recherches et votre premier message : Utopicar l&apos;envoie aux vendeurs des annonces trouvées, une annonce toutes les une à deux minutes, puis s&apos;arrête là. La suite de la conversation se fait sur Leboncoin.
        </p>
      </div>
      <EspaceMessages
        compte={(compte as CompteLbc | null) ?? null}
        campagnes={(campagnes ?? []) as Campagne[]}
        recherches={(recherches ?? []) as { id: string; nom: string; trouvees: number | null }[]}
        envois={(envois ?? []) as EnvoiLbc[]}
        boite={(boite as Boite | null) ?? null}
        etat={etat}
      />
    </div>
  );
}
