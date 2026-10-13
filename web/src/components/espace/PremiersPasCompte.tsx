import type { Compte } from "@/lib/compte";
import { familleEspace } from "@/lib/espace";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { PremiersPas, type Etape } from "./PremiersPas";

/* Les trois premiers pas d'un compte, cochés d'après la base. La carte ne revient plus une fois masquée ou finie
   (profils.reglages.premiers_pas) ; à 3/3 elle se voit une dernière fois, puis se marque finie toute seule. */
export async function CartePremiersPas({ c }: { c: Compte }) {
  const sb = await supabaseServeur();
  const { data: profil } = await sb.from("profils").select("reglages").eq("id", c.id).maybeSingle();
  const reglages = (profil?.reglages as Record<string, unknown> | null) ?? {};
  if (reglages.premiers_pas === "masque" || reglages.premiers_pas === "fini") return null;

  const benef = familleEspace(c) === "benef";
  const formule = benef && c.offre.famille === "benef";
  const compter = (table: "favoris" | "recherches" | "parc") => sb.from(table).select("id", { count: "exact", head: true }).then(({ count }) => (count ?? 0) > 0);
  const rapport = (mode: "particulier" | "benef") => sb.from("rapports").select("id", { count: "exact", head: true }).eq("mode", mode).limit(1).then(({ count }) => (count ?? 0) > 0);

  let etapes: Etape[];
  if (!benef) {
    const [analyse, favori] = await Promise.all([rapport("particulier"), compter("favoris")]);
    etapes = [
      { l: "Analyser une annonce", fait: analyse, href: "/app/analyser", bouton: "Analyser" },
      { l: "Garder une annonce en favori", fait: favori, href: "/app/favoris", bouton: "Mes favoris" },
      { l: "Choisir la suite : Essentiel ou des crédits", fait: c.illimite || c.offre.prix > 0 || c.credits > 0, href: "/app/compte#formule", bouton: "Voir les formules" },
    ];
  } else if (!formule) {
    const analyse = await rapport("benef");
    etapes = [
      { l: "Choisir votre formule Benef", fait: false, href: "/tarifs#benef", bouton: "Choisir" },
      { l: "Chiffrer une annonce", fait: analyse, href: "/app/analyser", bouton: "Chiffrer" },
      { l: "Régler votre bénéfice minimum", fait: c.profilAnalyse.rempli, href: "/app/compte#analyse", bouton: "Régler" },
    ];
  } else if (c.code) {
    // analyses offertes par un code (TIKTOK…) : les essayer, régler son objectif, puis choisir une formule
    const analyse = await rapport("benef");
    etapes = [
      { l: "Chiffrer une annonce avec vos analyses offertes", fait: analyse, href: "/app/analyser", bouton: "Chiffrer" },
      { l: "Régler votre bénéfice minimum", fait: c.profilAnalyse.rempli, href: "/app/compte#analyse", bouton: "Régler" },
      { l: "Choisir votre formule Benef", fait: false, href: "/tarifs#benef", bouton: "Voir les formules" },
    ];
  } else {
    const pro = c.illimite || c.offre.id === "pro";
    const [analyse, recherche, parc] = await Promise.all([rapport("benef"), c.offre.recherche ? compter("recherches") : Promise.resolve(false), pro ? compter("parc") : Promise.resolve(!!reglages.guide_ouvert)]);
    etapes = [
      { l: "Chiffrer une annonce", fait: analyse, href: "/app/analyser", bouton: "Chiffrer" },
      // la recherche de marché n'existe qu'avec Pro : sinon, régler son objectif (la note et la marge en dépendent)
      c.offre.recherche
        ? { l: "Lancer une recherche de marché", fait: recherche, href: "/app/recherche", bouton: "Rechercher" }
        : { l: "Régler votre bénéfice minimum", fait: c.profilAnalyse.rempli, href: "/app/compte#analyse", bouton: "Régler" },
      pro
        ? { l: "Ajouter une voiture au parc", fait: parc, href: "/app/parc", bouton: "Mon parc" }
        : { l: "Lire le guide de la première revente", fait: parc, href: "/app/guides?guide=premiere-revente", bouton: "Lire le guide" },
    ];
  }
  // tout est fait : la carte se montre une dernière fois, puis ne revient plus
  if (etapes.every((e) => e.fait)) await sb.from("profils").update({ reglages: { ...reglages, premiers_pas: "fini" } }).eq("id", c.id);
  return <PremiersPas etapes={etapes} />;
}
