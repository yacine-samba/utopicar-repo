/* Horloge figée : la date du jour du tableau de bord (« samedi 10 octobre », « Bonjour »), les jours en stock et le
   mois en cours sont calculés par l'app avec new Date(). On fige l'instant pour que chaque rendu soit identique.
   À importer en premier. Instant modifiable avec la variable d'environnement DATE_DEMO (ISO 8601). */
const ISO = (typeof process !== "undefined" && process.env?.DATE_DEMO) || "2026-10-10T08:30:00Z"; // 10 h 30 à Paris
export const MAINTENANT = Date.parse(ISO);

const DateReelle = Date;
class DateFigee extends DateReelle {
  constructor(...a: unknown[]) {
    if (a.length === 0) super(MAINTENANT);
    else super(...(a as [string]));
  }
  static now() {
    return MAINTENANT;
  }
}
globalThis.Date = DateFigee as DateConstructor;

/** Date ISO d'il y a `j` jours (à l'heure figée). */
export const ilYaJours = (j: number) => new DateReelle(MAINTENANT - j * 86400000).toISOString();
