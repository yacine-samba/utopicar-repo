import * as z from "zod/v4";

/* Ce que l'IA rend. Aucun calcul d'argent ici : marge, coût réel, plafond et offre
   sont calculés par l'outil lui-même (couts.ts). */
// Valeurs fermées décrites en texte : le SDK ne transmet pas les enum en sortie structurée.
const choix = (v: string[]) => z.string().describe("une valeur parmi : " + v.join(" | "));
const conf = choix(["faible", "moyenne", "forte"]);

export const IaSchema = z.object({
  vehicule: z.object({
    marque: z.string(),
    modele: z.string(),
    generation: z.string().describe("ex. Clio 4, Golf 7, 208 II"),
    version: z.string().describe("moteur, puissance et finition, ex. 1.5 dCi 90 Business"),
    annee: z.number().nullable(),
    km: z.number().nullable(),
    energie: z.string(),
    boite: z.string(),
    puissanceFiscale: z.number().nullable().describe("CV fiscaux ; valeur habituelle de la version si non écrite"),
    prix: z.number().nullable(),
    localisation: z.string().describe("ville (département) de la voiture"),
    vendeur: choix(["particulier", "professionnel", "inconnu"]),
  }),
  distanceKm: z.number().nullable().describe("distance par la route entre la voiture et la ville de l'utilisateur"),
  marche: z.object({
    bas: z.number().nullable(),
    realiste: z.number().nullable().describe("prix réaliste entre particuliers pour cette version, cette année, ce kilométrage"),
    haut: z.number().nullable(),
    reventeRapide: z.number().nullable().describe("prix de revente en moins de 3 semaines dans la ville de l'utilisateur, après remise en état"),
    confiance: conf,
    commentaire: z.string(),
  }),
  photos: z.object({
    fournies: z.boolean(),
    score: z.number().nullable().describe("état visible 0-100 ; null sans photo"),
    defauts: z.array(
      z.object({
        libelle: z.string(),
        gravite: choix(["léger", "moyen", "lourd"]),
        coutMin: z.number(),
        coutMax: z.number(),
        confiance: conf,
      }),
    ),
    vuesManquantes: z.array(z.string()),
  }),
  travaux: z
    .array(
      z.object({
        libelle: z.string(),
        type: choix(["entretien", "petite réparation", "gros travaux"]),
        coutMin: z.number(),
        coutMax: z.number(),
      }),
    )
    .describe("travaux à prévoir NON déjà listés par l'outil : entretien arrivé à échéance, défaillances de CT, faiblesses connues probables"),
  fiabilite: z.object({
    moteur: z.string(),
    note: z.number().describe("0-10, 10 = très fiable"),
    problemesConnus: z.array(z.string()),
  }),
  drapeaux: z.object({
    compteurSuspect: z.boolean(),
    sinistreGrave: z.boolean(),
    gageOuOpposition: z.boolean(),
    defautBloquant: z.boolean(),
    prixHT: z.boolean(),
  }),
  alertes: z.array(z.string()),
  pointsForts: z.array(z.string()),
  questions: z.array(z.string()).describe("5 questions au vendeur, la plus importante d'abord"),
  messageVendeur: z.string().describe("premier message, 2 phrases, 280 caractères max, sans prix"),
  resume: z.string().describe("2 à 3 phrases pour un professionnel de l'achat-revente"),
  resumeSimple: z.string().describe("1 à 2 phrases très simples pour un particulier qui connaît peu l'automobile"),
});

export type Ia = z.infer<typeof IaSchema>;
