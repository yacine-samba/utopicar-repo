# Brief — MO3 : plus d'humain, gros hooks (d'après la référence 5)

Demande : « recréer un motion avec plus d'humain, des gros gros hooks, en prenant cette vidéo en référence ; découpe
à 0,1 s ou image par image ; voix, ton, effets, SFX, éléments graphiques : tout doit être parfait ».
Réponses au questionnaire : référence déposée (`refs/ref5/`), voix plus incarnée, 9:16 de 30–45 s, 3 ouvertures A/B/C.

Grammaire : `docs/ref5_style_guide.md` (mesurée image par image). Le film est un **plan-séquence** :
- une nouvelle scène toutes les 1,5–2 s, sans fondu enchaîné ;
- une typo cinétique écrite mot à mot sur la voix ;
- la palette bascule à la révélation du logo ;
- des éclats dessinés aux 3 moments clés.

| | |
|---|---|
| Produit | UTOPICAR Garage, données démo avec la mention « Données de démonstration » |
| Public | acheteurs-revendeurs auto sur TikTok |
| Promesse | savoir ce qu'il te restera **avant** d'acheter, et le prix à ne pas dépasser |
| CTA (dit et écrit) | « Commente DÉBUTANT ou PRO » |
| Format | 9:16, 1080×1920, 60 i/s, ≈ 36 s |
| Langue | français |
| Voix | Simon (ElevenLabs `mvhJVdVoTWVUtL4keT7W`, eleven_v3), en personnage |
| Ouvertures | A = scène vécue (il achète) · B = chiffre choc · C = aveu chuchoté. 0–3 s, même corps de film |

## Simon, le personnage

Marchand VO, la trentaine, cash et pince-sans-rire. Il raconte **sa** pire voiture à un pote, avec le sourire de
celui qui s'en est sorti. Il réagit à ce que montre l'image (soupir, petit rire, « ouais… »). Il baisse la voix pour
les bons plans et pose ses phrases de chute à plat, sans emphase.

## Script

Les balises entre crochets sont jouées par eleven_v3, jamais lues.

### Ouvertures (0–3 s)

| | Voix | Écran | Image |
|---|---|---|---|
| **A — scène vécue** | `[hesitant] Mmh… [short pause] propre… huit mille… [short pause] allez. Je la prends.` | « Mmh… » tapé lettre à lettre en haut, puis l'aplat **« Acheté. »** | La vraie fiche de la Golf monte du bas. Le curseur hésite et tourne autour du prix, puis clique : aplat orange plein cadre « Acheté. » |
| **B — chiffre choc** | `[deadpan] Moins mille deux cents euros. [short pause] Sur une voiture… impeccable.` | **− 1 200 €** géant dès l'image 0, puis « impeccable » en italique | Le chiffre glisse avec des lignes de vitesse. Un cercle est tracé à la main autour de « impeccable ». |
| **C — aveu chuchoté** | `[whispers] Je vais te montrer… [short pause] ma pire voiture.` | « ma **pire** voiture. », avec « PIRE » tamponné | La fiche de la Golf, floue, se met au point. Un tampon rouge s'écrase, secousse. |

Les trois ouvertures se raccordent à la même image : un zoom à travers le dernier mot, ou l'aplat, qui ouvre sur
la pluie de frais.

### Corps (à partir de 3 s)

| ≈ t | Voix | Écran (mot à mot) | Image et transition |
|---|---|---|---|
| 3,0 | *(1,2 s sans voix)* | — | 4 tickets de frais tombent : contrôle technique, pneus, embrayage, carte grise. Le compteur plonge de + 300 € à − 1 200 €. Un pop par ticket. |
| 4,4 | `[sighs] Ouais. [short pause] Les frais.` | Ouais. **Les frais.** | Le compteur vibre, des fissures se dessinent |
| 6,0 | `[chuckles] Sur une voiture… parfaite.` | Sur une voiture… *parfaite.* | Zoom **à travers** « parfaite » : la palette bascule du blanc froid au crème chaud |
| 8,5 | `[warmly] Maintenant, avant d'acheter, je colle l'annonce dans utopicar.` | avant d'acheter → **utopicar** | Logo officiel avec un éclat de traits orange, puis le vrai champ « Lien de l'annonce » ; le curseur colle le lien et clique sur « Analyser » |
| 13,0 | `[short pause] Deux secondes.` | Deux secondes. | Anneau de chargement 2 → 1 → ✓ |
| 14,5 | `Trente-huit sur cent. [short pause] NO GO. [chuckles] Il me l'aurait dit.` | 38/100 · **NO GO** | La jauge monte, le tampon NO GO s'écrase (secousse), puis la vraie carte « Il vous reste − 1 200 € » en perspective |
| 19,5 | `Et le prix à ne jamais dépasser… sept mille cinq cents.` | **7 500 €** max | Réglette : le prix glisse de 9 500 € au plafond, zone rouge au-dessus ; dézoom en profondeur |
| 23,5 | `[curious] Une Clio, mille quatre cent cinquante sous la cote ? [whispers] Je suis le premier prévenu.` | **− 1 450 €** sous la cote | Radar concentrique : les annonces se posent, un point orange s'allume, la notification utopicar tombe |
| 29,0 | `[confident] Je sais ce qu'il me reste avant d'acheter. [short pause] Pas après.` | avant d'acheter. **Pas après.** | Grand texte, « Pas après. » à plat ; chiffre de marge avec lignes de vitesse |
| 32,5 | `[excited] Commente DÉBUTANT ou PRO… [short pause] je t'envoie le guide.` | Commente **DÉBUTANT** ou **PRO** | Logo officiel ; le curseur clique sur les pastilles DÉBUTANT puis PRO, éclat orange au clic |
| 36,0 | — | carton logo et CTA, tenue ≈ 1,5 s | — |

Le corps compte 66 mots. Avec les pauses, il dure environ 33 s. Le film fait donc ≈ 36 s.

## Son

- **Musique** : synthèse en code, 108 BPM, légère sous la voix. Arrêt net pendant la pluie de frais : le silence
  porte le gag.
- **Bruitages** :
  - un whoosh par transition ;
  - un pop par carte ou ticket ;
  - un clic réel ;
  - un impact par tampon ;
  - aucun bruitage sur un mot.
- **Master** : −14 LUFS, −3,5 dBTP de travail.

## Livrables

- `9x16-mo3-A.mp4`, `9x16-mo3-B.mp4`, `9x16-mo3-C.mp4` ;
- posters ;
- SRT ;
- rapport `qa_video.py`.
