import type { Detail } from "../offres";
import type { Ia, IaVue } from "./ia-schema";

/** Retire, côté serveur, ce que la formule ne donne pas : rien de payant ne part vers le navigateur. */
export function filtrer(ia: Ia, detail: Detail): IaVue {
  if (detail === "complet") return ia;
  const base: IaVue = { ...ia, negociation: null, visite: null, accompagnement: null };
  if (detail === "detail") return base;
  return {
    ...base,
    marche: { ...ia.marche, bas: null, haut: null, reventeRapide: null, commentaire: "" },
    fiabilite: { ...ia.fiabilite, problemesConnus: [] },
    photos: { ...ia.photos, defauts: [], vuesManquantes: [] },
    alertes: ia.alertes.slice(0, 2),
    pointsForts: [],
    questions: null,
    messageVendeur: null,
    synthese: [],
    resume: "",
  };
}
