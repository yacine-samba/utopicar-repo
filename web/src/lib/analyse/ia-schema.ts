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
        zone: z.string().optional(),
        photo: z.number().nullable().optional(),
      }),
    ),
    vuesManquantes: z.array(z.string()),
    resume: z.string().optional(),
    teinte: z.array(z.string()).optional(),
    incoherences: z.array(z.string()).optional(),
    compteurLu: z.number().nullable().optional(),
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
  synthese: z.array(z.string()).describe("3 à 5 phrases courtes : l'essentiel du rapport pour décider vite"),
  negociation: z.object({
    prixOuverture: z.number().nullable().describe("premier prix à proposer, réaliste et poli, arrondi à 50 €"),
    arguments: z.array(z.object({ argument: z.string(), montant: z.number().nullable() })).describe("défauts réels et chiffrés, du plus fort au plus faible"),
    conseils: z.array(z.string()).describe("3 à 5 conseils concrets pour négocier cette voiture-là, sans jargon"),
  }),
  visite: z.object({
    aControler: z.array(z.string()).describe("8 à 12 points à contrôler sur place et à l'essai, adaptés à ce modèle et à ce moteur"),
    documents: z.array(z.string()).describe("papiers à demander et à vérifier avant de payer"),
  }),
  accompagnement: z.object({
    recommandation: choix(["vous pouvez y aller seul", "venez accompagné", "faites inspecter la voiture"]),
    pourquoi: z.string().describe("1 à 2 phrases, sans jargon"),
  }),
});

export type Ia = z.infer<typeof IaSchema>;

/** Résultat tel qu'il est montré : certaines parties sont retirées selon la formule. */
export type IaVue = Omit<Ia, "negociation" | "visite" | "accompagnement" | "messageVendeur" | "questions"> & {
  negociation: Ia["negociation"] | null;
  visite: Ia["visite"] | null;
  accompagnement: Ia["accompagnement"] | null;
  messageVendeur: string | null;
  questions: string[] | null;
};

