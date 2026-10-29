# Écrire les découpages

Le format complet est en tête de `scripts/decoupage.py` et `scripts/decoupage_yt.py` (modèles). Exemple réel et complet :
`C:\Users\ysamb\Desktop\Henritokane\montage\scripts\decoupage.py` et `decoupage_yt.py`.

## Extraits (`decoupage.py`)

- `segs` : (début du 1er mot, début du dernier mot, cadre M/C, options). Alterner M et C à chaque coupe ; en style
  viral, `entree: "file"` ou `"zoom"` sur les reprises.
- `accroche` : `contexte` (voix du compte), `lignes` [(texte, "serif"/"rouge-g", t, temps source du mot)], `jusqua`,
  `bande`. « haut » quand la tête est basse (plan moyen, sujet loin) ; « bas » sinon (l'accroche prend la place des
  sous-titres). Elle s'efface à la première carte plein cadre : faire durer le contrat jusqu'à ~3 s (`depuis` sur la
  carte suivante).
- `corr` / `style` / `coupe` : corrections d'affichage, mots forts, débuts de groupes de sous-titres.
- Signature en fin de clip : un dernier plan avec la phrase du compte qui publie.

## Version longue (`decoupage_yt.py`)

`OUVERTURE` (≈ 15-20 s), `CORPS` (avec `chap`), `CORR`, `FORTS_OUV` / `FORTS` (mots forts), `CARTES`, `LITS`.
Textes du carton titre et de fin : `projet.TITRE`, `projet.FIN`.

## Les cartes

| Type | Générique ? | Paramètres |
|---|---|---|
| `mots` | oui : intercalaire plein cadre mot à mot | `theme` bleu/blanc, `forts` (mots en serif) |
| `video` | oui : carte vidéo qui monte | `media` (temps source), `cadre`, `theme`, `legende` (nom, rôle) |
| `nom` | oui : surimpression nom + rôle | `nom`, `role`, `visage`, `depuis`, `duree` (long) |
| `carte` | oui : France → destination sur la carte du monde | `vers` |
| `stat_simple` | oui : gros chiffre + 2 lignes | (version longue, `vues`) |
| `titre`, `fin`, `etapes` | titre et fin oui (projet.TITRE/FIN) ; `etapes` exemple | |
| `leads`, `graphe`, `chat`, `audit`, `liste`, `semaine`, `horaires`, `duel`, `stat` | exemples Henritokane (textes en dur) | voir `gen.carte_html` |

Une carte d'exemple qui ne colle pas au sujet se copie et s'adapte dans `cartes2.py` (une fonction courte :
html + css + js GSAP en temps locaux, `_doc(...)` fait le reste, thème lu sur la fin de l'identifiant via
`cartes.THEMES`), puis s'ajoute à `gen.carte_html`. Seulement des faits dits : aucun faux écran présenté comme une
capture.
