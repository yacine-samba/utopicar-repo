import { compteCourant } from "@/lib/compte";
import { OFFRES } from "@/lib/offres";
import { OutilBenef } from "@/components/benef/OutilBenef";

export default async function Page() {
  const compte = await compteCourant();
  const o = compte?.offre ?? OFFRES.starter;
  return <OutilBenef maxPhotos={o.photos} parc={o.parc} villeCompte={compte?.ville ?? ""} />;
}
