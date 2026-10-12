# Brief : Avatar 1 · « Moins 1 200 € sur une voiture impeccable » (TikTok 9:16, 24,9 s)

Fait en autonomie (demande du 8 octobre 2026 : « occupe-toi de tout, avatar, une seule voix Simon, pas de test,
type B »). Une seule version : vertical, français, une ouverture.

```
Produit : utopicar.fr                    Objectif : faire connaître + commentaires (guide)     Plateforme : TikTok (puis Reels, Shorts)
Public : débutants en achat-revente auto
Format : selfie face caméra dans une voiture (avatar généré, animé en local), sous-titres mot à mot, vraies captures de l'outil
Voix : Simon — Voix Radio (ElevenLabs mvhJVdVoTWVUtL4keT7W, eleven_v3), prises existantes de MO3 recoupées
CTA (dit + écrit) : « Commente DÉBUTANT ou PRO, je t'envoie le guide. »
Livrable : renders/9x16-avatar1.mp4 (+ poster, mix sans musique)
```

## Ce qui a bloqué, et ce qui a été fait à la place

| Prévu | Bloqué par | Fait à la place |
|---|---|---|
| Nouvelle voix off de Simon (script B ci-dessous) | ElevenLabs : « activité inhabituelle, accès gratuit désactivé, passez à un abonnement payant » | Vraies prises de Simon déjà générées pour MO3, recoupées en 5 segments (`film-avatar1/build_vo.py`) |
| Avatar vidéo réaliste (OmniHuman, Creatify Aurora, HeyGen) | ElevenLabs : « la génération vidéo demande un forfait payant » | Selfie généré (Nano Banana Pro, 2K), animé en code : bouche sur la voix, clignements, caméra à la main (`face.py`) |
| Variantes de bouche générées | Limite quotidienne d'images du forfait gratuit, 682 crédits restants sur 10 000 | Bouche et paupières déformées en local (OpenCV) à partir des repères du visage |

Crédits ElevenLabs dépensés : environ 2 000 (portrait 16:9 185, selfie 9:16 2K 1 827). La voix B a échoué sans être
facturée.

## Le script diffusé (prises MO3)

| ≈ t | Voix | Écran |
|---|---|---|
| 0,0 | Moins 1 200 € sur une voiture impeccable. | **−1 200 €** géant dès l'image 0, puis « sur une voiture *impeccable.* » |
| 5,4 | *(scratch, la musique s'arrête)* Ouais… les frais. | 4 étiquettes : Contrôle technique, Pneus, Embrayage, Carte grise (un ping chacune) |
| 9,3 | Sur une voiture… parfaite. | sous-titres, *parfaite* en italique, coup de zoom |
| 13,2 | Maintenant, avant d'acheter, je colle l'annonce dans Utopicar. | vraie barre « Analyser le dossier » (pression sur « colle »), puis « Lu sur l'annonce par l'outil » ; la musique revient |
| 17,2 | Je sais ce qu'il me reste avant d'acheter. | vraies cartes « Il vous reste − 1 200 € », puis « Ne dépassez pas 7 500 € » · *Données de démonstration* |
| 20,1 | Pas après. | **Pas *après.*** en grand, coup de zoom |
| 21,0 | Commente débutant ou pro, je t'envoie le guide. | Commente **DÉBUTANT** · ou PRO · je t'envoie le guide |

## Le script B (prêt, à générer quand la voix sera débloquée)

Écrit avec le skill « L'art du hook » (voir `brief-vo-test.md`) ; balises eleven_v3 :

```
Excel, Notion, trois calculettes. [short pause] Quatre marges différentes… pour la même voiture. [sighs] Moi, je
calculais ma marge… après l'achat. [short pause] Super méthode. [chuckles] Alors j'ai codé un outil. Je colle
l'annonce : frais, défauts, marge. Avant d'appeler. [short pause] Il me dit souvent non. [deadpan] Plus souvent que
ma banquière. Commente DÉBUTANT, je t'envoie le guide.
```

Pour le produire : ElevenLabs payant (Starter suffit) → générer cette ligne avec Simon (≈ 400 crédits) → transcrire
avec Scribe (minutage mot à mot) → remplacer `audio/vo-avatar1.wav` et `film-avatar1/words.json` → `face.py`, puis
adapter les apparitions de `film.js` (mêmes briques : accroche, étiquettes, cartes, CTA) → `mix.py` → rendu.

## Chaîne de fabrication

```
python film-avatar1/build_vo.py        # voix (prises MO3) → audio/vo-avatar1.wav, words.json, env.json
python film-avatar1/face.py            # avatar animé → film-avatar1/frames/ (746 images, 30 i/s)
python film-avatar1/mix.py             # mix → audio/mix-avatar1.wav (−14 LUFS, ≤ −3,5 dBTP de travail)
CHROMIUM=<chrome.exe> CUT=avatar1 node scripts/render.mjs --all   # → renders/9x16-avatar1.mp4
```

## À dire en publiant

- TikTok : activer l'étiquette « Contenu généré par IA » (visage généré). C'est la règle de la plateforme pour un
  visage réaliste créé par IA.
- Les cartes de l'outil montrent des données de démonstration (mention à l'écran).
