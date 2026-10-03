/* Défauts écrits par le vendeur, lus par des règles fixes, avec leur coût de réparation.
   Port de DEFAUTS / defautsDesc de l'outil UTOPICAR Garage. */
import { excerpt, flat } from "./texte";

/** piege = rédhibitoire, lourd = grosse dépense ou risque, levier = petit défaut chiffrable, info = signal. */
export type CatDefaut = "piege" | "lourd" | "levier" | "info";

export type Defaut = {
  k: string;
  l: string;
  cat: CatDefaut;
  min: number;
  max: number;
  /** Non chiffrable sans inspection. */
  nc: boolean;
  extrait: string;
  src: "annonce" | "photos" | "ia";
  conf?: "faible" | "moyenne" | "forte";
};

const ACT =
  "(a refaire|a changer|a prevoir|a remplacer|a faire|a revoir|hs|h\\.s|mort|morte|uses?|usees?|fatigues?|fatiguees?|en fin de vie|limite|defectueu\\w*|ne fonctionne (pas|plus)|ne marche (pas|plus)|en panne|casses?|cassees?)";
const near = (o: string, a?: string) => new RegExp(`\\b(${o})\\b[^.;!?\\n]{0,28}?\\b${a || ACT}`);

type Regle = [k: string, re: RegExp, l: string, cat: CatDefaut, min: number, max: number, nc: boolean];

const DEFAUTS: Regle[] = [
  ["culasse", /joint de culasse(?![^.;!?\n]{0,25}\b(refait|change|remplace|neuf|fait)\b)|culasse (fendue|voilee)/, "Joint de culasse signalé", "piege", 0, 0, true],
  ["moteur", /\bmoteur\b[^.;!?\n]{0,25}?\b(hs|h\.s|casse|serre|mort|a changer|a refaire|a remplacer|claque|a reviser)\b|casse moteur/, "Moteur à refaire", "piege", 0, 0, true],
  ["nonroulant", /non roulant|ne demarre (pas|plus)|\ben panne\b|pour pieces|\bepave\b|sur plateau|a depanner/, "Non roulante ou pour pièces", "piege", 0, 0, true],
  ["surchauffe", /surchauffe|chauffe anormalement|fumee blanche|melange (eau|huile)|mayonnaise|consomme (du )?liquide de refroidissement|perte de liquide de refroidissement/, "Surchauffe ou fumée blanche", "piege", 0, 0, true],
  ["districasse", /(distribution|courroie) (a )?(casse|cassee|saute)/, "Distribution cassée", "piege", 0, 0, true],
  ["compteur", /compteur (change|remplace|bloque|hs|trafique)|km non garantis?|kilometrage non garanti/, "Kilométrage non garanti", "piege", 0, 0, true],
  ["admin", /sans carte grise|pas de carte grise|carte grise (perdue|egaree)|pas a mon nom|\bgagee?\b|\bopposition\b|\bvei\b|vehicule endommage/, "Problème de papiers (carte grise, gage, VEI)", "piege", 0, 0, true],
  ["boite", /\bboite( de vitesses?)?\b[^.;!?\n]{0,25}?\b(hs|casse|a changer|a refaire|craque|craquent|saute|bruyante|a reviser)\b|vitesses? (craque|craquent|passent mal|passe mal|saute|sautent)/, "Boîte de vitesses à revoir", "lourd", 800, 1600, false],
  ["turbo", near("turbo", "(hs|siffle|fume|a changer|a prevoir|fatigue|jeu|a refaire)"), "Turbo à changer", "lourd", 600, 1300, false],
  ["embrayage", near("embrayage", "(a changer|a faire|a refaire|a prevoir|patine|fatigue|dur|hs|use|en fin de vie|haut|a revoir)"), "Embrayage à changer", "lourd", 500, 900, false],
  ["volant", near("volant moteur", "(bruyant|claque|hs|a changer|fatigue|a prevoir)"), "Volant moteur à changer", "lourd", 400, 800, false],
  ["injecteurs", near("injecteurs?", "(hs|a changer|a faire|fuit|fuient|fatigues?|defectueu\\w*|a prevoir)"), "Injecteurs à changer", "lourd", 300, 1000, false],
  ["egr", near("vanne egr|egr|fap|filtre a particules", "(hs|encrasse\\w*|bouche|a changer|a nettoyer|a faire|defectueu\\w*|colmate)"), "Vanne EGR ou FAP à traiter", "lourd", 150, 900, false],
  ["distri", near("distribution|courroie de distribution|kit de distribution|courroie", "(a faire|a prevoir|a changer|a refaire|pas faite|non faite|depassee)"), "Distribution à faire", "lourd", 400, 750, false],
  ["voyant", /voyant (moteur|orange|injection|anti ?-?pollution|prechauffage|depollution|allume)|voyant [^.;!?\n]{0,15}allume/, "Voyant allumé, panne non diagnostiquée", "lourd", 100, 1500, true],
  ["fuite", /fuite (d'?huile|huile|de liquide)|perte d'?huile|consomme (de l'?|beaucoup d'?|un peu d'?)?huile/, "Fuite ou consommation d'huile", "lourd", 100, 900, true],
  ["bruit", /\b(bruit|claquement|cliquetis|sifflement|grincement)s?\b/, "Bruit signalé, origine inconnue", "lourd", 100, 600, true],
  ["fumee", /\bfumee (noire|bleue)\b|\bfume (noir|bleu|beaucoup)\b/, "Fumée à l'échappement", "lourd", 150, 1000, true],
  ["freins", near("freins?|plaquettes?|disques?|etriers?", "(a refaire|a changer|a prevoir|a remplacer|uses?|usees?|en fin de vie|limite|hs|a faire|voiles?|grincent)"), "Freins à refaire", "levier", 150, 400, false],
  ["pneus", near("pneus?|pneumatiques?", "(a changer|a prevoir|a remplacer|uses?|lisses?|limite|en fin de vie|craquel\\w*|hs|a faire)"), "Pneus à changer", "levier", 150, 350, false],
  ["amortisseurs", near("amortisseurs?", "(a changer|a prevoir|fatigues?|hs|uses?|fuient|a faire)"), "Amortisseurs à changer", "levier", 250, 500, false],
  ["train", near("rotules?|triangles?|silent ?-?blocs?|cardans?|roulements?|biellettes?|soufflets?", "(a changer|hs|uses?|a prevoir|bruit|claque|fatigues?|a faire|dechire)"), "Train avant ou roulement à reprendre", "levier", 100, 400, false],
  ["batterie", near("batterie", "(a changer|faible|hs|fatiguee|a prevoir|morte)"), "Batterie à changer", "levier", 90, 160, false],
  ["clim", near("clim|climatisation", "(a recharger|a recharge|ne (fonctionne|marche) (pas|plus)|hs|en panne|a revoir|pas de froid|a faire|souffle chaud)"), "Climatisation à recharger ou réparer", "levier", 80, 450, false],
  ["vidange", near("vidange", "(a faire|a prevoir|a refaire|depassee)"), "Vidange à faire", "levier", 90, 160, false],
  ["teinte", /\b(teinte|couleur) (differente|legerement differente|pas (tout a fait )?la meme)|pas de la meme (couleur|teinte)|(porte|aile|capot|pare-?chocs?|hayon)[^.;!?\n]{0,25}?(repeint\w*|d'?une autre couleur|autre teinte|de couleur differente)|\brepeinte?s?\b/, "Élément repeint ou d'une autre teinte (choc passé ?)", "levier", 150, 450, false],
  ["carrosserie", /\b(rayures?|bosses?|bosselures?|enfoncements?|carrosserie (abimee?|a refaire|a revoir)|impacts?( de)? carrosserie|defauts? esthetiques?|traces? de choc|(?<!pare[\s-]?)chocs?|pare-?chocs? (abime|raye|fissure|casse|a repeindre|decroche))\b/, "Rayures, bosses ou choc de carrosserie", "levier", 150, 700, false],
  ["rouille", /\b(rouille|corrosion|rouillee?)\b/, "Rouille", "levier", 100, 600, false],
  ["parebrise", near("pare-?brise", "(fissure|impact|etoile|a changer|casse|fendu)"), "Pare-brise impacté ou fissuré", "levier", 60, 450, false],
  ["retro", near("retro(viseur)?s?", "(casse|abime|a changer|hs|pend|recolle)"), "Rétroviseur abîmé", "levier", 60, 180, false],
  ["phares", near("phares?|optiques?|feux?", "(opaques?|jaunis?|ternes?|casses?|fissures?|hs|a changer)"), "Phares ternes ou abîmés", "levier", 30, 200, false],
  ["jantes", near("jantes?", "(rayees?|abimees?|voilees?|frottees?|a refaire)"), "Jantes abîmées", "levier", 50, 250, false],
  ["interieur", near("sellerie|siege|sieges|interieur|pommeau|ciel de toit|garnitures?|moquette", "(dechire\\w*|tache\\w*|abime\\w*|brule\\w*|decolle\\w*|sale)"), "Intérieur abîmé", "levier", 50, 250, false],
  ["echappement", near("echappement|silencieux|pot|ligne", "(troue|perce|a changer|bruyant|hs|fuit|fuite)"), "Échappement à reprendre", "levier", 100, 350, false],
  ["demarreur", near("demarreur|alternateur", "(hs|a changer|fatigue|faible|a prevoir)"), "Démarreur ou alternateur à changer", "levier", 150, 450, false],
  ["airbag", /voyant airbag|airbag[^.;!?\n]{0,15}\b(hs|allume|voyant)\b/, "Voyant airbag", "levier", 100, 400, false],
  ["vitres", near("leve-?vitres?|vitre electrique", "(hs|ne fonctionne|en panne|casse|bloque)"), "Lève-vitre en panne", "levier", 60, 200, false],
  ["enletat", /\b(vendue? en l'?etat|dans l'?etat|sans garantie)\b/, "Vendue en l'état, sans garantie", "info", 0, 0, false],
];

const NEG2 = /\b(non|jamais|aucun|aucune|pas d'?|pas de|sans|zero|ni|nul|nulle)[\s-]*$/;
const REV = /\b(prevoir|a prevoir|a changer|a refaire|a faire)\s*:?\s*(les |le |la |l'|un |une |des )?(pneus|freins|plaquettes|disques|embrayage|distribution|vidange|batterie|amortisseurs)\b/g;
const REV_KEY: Record<string, string> = { pneus: "pneus", freins: "freins", plaquettes: "freins", disques: "freins", embrayage: "embrayage", distribution: "distri", vidange: "vidange", batterie: "batterie", amortisseurs: "amortisseurs" };

export function defautsDesc(s: string): Defaut[] {
  const t = flat(s);
  const out: Defaut[] = [];
  const seen = new Set<string>();
  const add = (row: Regle, i: number) => {
    const [k, , l, cat, min, max, nc] = row;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ k, l, cat, min, max, nc, extrait: excerpt(s, i, 90), src: "annonce" });
  };
  DEFAUTS.forEach((row) => {
    const g = new RegExp(row[1].source, "g");
    let m: RegExpExecArray | null;
    while ((m = g.exec(t))) {
      if (!NEG2.test(t.slice(Math.max(0, m.index - 22), m.index)) && !/\b(neu(f|fs|ve|ves)|changee?s? recemment|refaite?s? recemment)\b/.test(m[0])) {
        add(row, m.index);
        break;
      }
    }
  });
  let m: RegExpExecArray | null;
  REV.lastIndex = 0;
  while ((m = REV.exec(t))) {
    const k = REV_KEY[m[3]];
    const row = DEFAUTS.find((r) => r[0] === k);
    if (row && !NEG2.test(t.slice(Math.max(0, m.index - 16), m.index))) add(row, m.index);
  }
  return out;
}
