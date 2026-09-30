// Récit commun des deux remakes (références 1 et 2) : les battements de la vidéo validée, calés sur les mots de Simon
// (repères de timeline-explainer60.json). Chaque battement : [début, fin, type, texte, élément d'interface].
// Texte : « [mot] » = mot d'accent (orange). type : phrase | big | red | green | lockup | end.
export function beats(M, voice) {
  const B = (a, b, kind, text, ui) => ({ a: M[a], b: M[b], kind, text, ui });
  return [
    B('start', 'ecoute', 'phrase', "Tu fais de l'[achat-revente] auto ?"),
    B('ecoute', 'annonce', 'big', voice ? 'Écoute.' : 'Regarde.'),
    B('annonce', 'frais', 'phrase', "Une annonce qui a l'air [top]…", 'golf'),
    B('frais', 'rien', 'phrase', 'Une fois les [frais] payés…', 'costs'),
    B('rien', 'p1', 'red', '− 1 200 €|frais compris.'),
    B('p1', 'p2', 'phrase', 'Des annonces [partout].', 'ads'),
    B('p2', 'p3', 'phrase', 'Des calculs [à la main].', 'calc'),
    B('p3', 'fini', 'phrase', 'Une marge [au pif].'),
    B('fini', 'voici', 'big', 'Fini.'),
    B('voici', 'poche', 'lockup', ''),
    B('poche', 'f1', 'phrase', "Ton outil d'achat-revente,\n[dans ta poche].", 'dock'),
    B('f1', 'colle', 'big', 'Analyse.'),
    B('colle', 'deux', 'phrase', "Colle [l'annonce].", 'texte'),
    B('deux', 'note', 'big', '2 secondes.'),
    B('note', 'reste', 'phrase', 'Une [note], un verdict.', 'tktop'),
    B('reste', 'plafond', 'phrase', "Ce qu'il te [reste], vraiment.", 'tktot'),
    B('plafond', 'f2', 'phrase', 'Ton prix [max].', 'plaf'),
    B('f2', 'dossiers', 'big', 'Compare.'),
    B('dossiers', 'meilleure', 'phrase', 'Tous tes [dossiers].', 'duo'),
    B('meilleure', 'f3', 'phrase', 'Garde la [meilleure].', 'clio'),
    B('f3', 'surveille', 'big', 'Trouve.'),
    B('surveille', 'sous', 'phrase', 'Il [surveille] les annonces.', 'lvmini'),
    B('sous', 'mille', 'phrase', 'Et sort celles [sous la cote].', 'liveprix'),
    B('mille', 'premier', 'green', '1 450 €|sous la cote.'),
    B('premier', 'f4', 'phrase', "T'es le [premier]."),
    B('f4', 'chaque', 'big', 'Organise.'),
    B('chaque', 'dort', 'phrase', 'Chaque voiture, sa [marge].', 'rows'),
    B('dort', 'f5', 'phrase', 'Et ses [jours] en stock.', 'rowsdays'),
    B('f5', 'stock', 'big', 'Pilote.'),
    B('stock', 'coup', 'phrase', 'Stock, capital, [marge].', 'kpis'),
    B('coup', 'sais', 'phrase', "Tout, d'un [coup d'œil].", 'mosaic'),
    B('sais', 'revends', 'phrase', "Tu sais [avant] d'acheter."),
    B('revends', 'logo', 'phrase', 'Tu revends avec de la [marge].'),
    B('logo', 'end', 'end', ''),
  ];
}
// « Une [note], un verdict. » → segments pour Kit.text ([texte, classe])
export function segs(s, acc = 'o') {
  const out = []; const re = /\[(.+?)\]/g; let last = 0, m;
  while ((m = re.exec(s))) { if (m.index > last) out.push([s.slice(last, m.index), '']); out.push([m[1], acc]); last = re.lastIndex; }
  if (last < s.length) out.push([s.slice(last), '']);
  return out.flatMap(([t, c]) => t.split('\n').flatMap((p, i) => (i ? [['\n', ''], [p, c]] : [[p, c]]))).filter(([t]) => t !== '');
}
