# Avatar utopicar : prompts de fabrication

L'avatar, c'est le fondateur lui-même, à partir de son selfie : même visage, même bouc, même moustache. Deux
changements seulement : les yeux deviennent vert clair, et le logo utopicar remplace la forme orange du sweat.
Il donne des conseils d'achat-revente, assis à l'arrêt dans sa voiture.

Fabrication :
- plans générés de 8 s ;
- voix de Simon (ElevenLabs) ;
- montage par nos soins.

Recherche du 27 oct. 2026 : 11 agents, sources ouvertes et vérifiées, listées en fin de page.

Les prompts sont en anglais, les répliques en français. Chaque réplique passe d'abord par la grille de scénario et
chaque accroche par `art-du-hook` (règle du dépôt) : ici, elles restent `[RÉPLIQUE]`.

## 0. Les références

Les fichiers fournis sont rangés dans `video/refs/avatar/`. Ce dossier n'est pas versionné (règle « références hors du
dépôt »).

| Référence | Contenu | Rôle |
|---|---|---|
| `@selfie-reference` | le selfie du fondateur au bord d'un lac | **identité** : visage, peau, cheveux, bouc, moustache, sweat blanc |
| `@logo-utopicar-hd` | symbole officiel en 2400 px : voiture noire et flèche orange, sur fond blanc | logo du sweat, rendu depuis `video/assets/brand/official/utopicar-symbole-site.svg` |
| `@logo-utopicar` | le même symbole, fichier fourni (512 px) | secours si la version HD n'est pas acceptée |
| `@interieur-rs4-habitacle` | habitacle complet en 3/4, volant à anneaux, toit ouvrant, jardin d'oliviers dehors | décor principal et lumière |
| `@interieur-rs3-siege` | siège en nid d'abeille, « RS » sur le haut du dossier, surpiqûres rouges, ceinture noire à liserés rouges | détail des sièges, du logo et de la ceinture |
| `@interieur-s3-sieges` | sièges à losanges | **écartée** : un autre motif casserait la constance |

Références générées au fil des étapes :

| Référence | Étape | Contenu |
|---|---|---|
| `@avatar-portrait` | 1 | portrait propre, yeux vert clair, logo utopicar |
| `@fiche-angles` | 2 | 5 angles du visage |
| `@fiche-expressions` | 2 | 6 expressions |
| `@fiche-bouche` | 2 | 6 positions de bouche (sons du français) |
| `@plaque-habitacle` | 3 | l'habitacle vide vu du téléphone, logos nets |
| `@avatar-voiture` | 4 | l'avatar à sa place, première image de chaque plan vidéo |

**Joindre les références :**
- toujours dans le même ordre ;
- une seule fonction par image, et le dire dans le prompt ;
- **toujours `@selfie-reference` en image 1** dès qu'il y a le visage : c'est la vraie source de l'identité. On ne
  part jamais d'une retouche de retouche.

Dans ElevenLabs Flows, l'image se branche sur le port (images, start_frame) : le `@nom` dans le texte sert de repère,
et c'est le branchement qui fait la référence.

**Bloc identité**, à coller mot pour mot partout où le visage apparaît :

> Exactly the same man as in @selfie-reference: same face shape, same eye shape, same nose bridge, same lips, same
> jawline and cheekbones, same warm light-brown skin, same short dark curly hair with a neat taper on the sides and the
> same hairline, same thick straight dark eyebrows, same thin mustache and same short chin goatee, clean-shaven cheeks.
> His eyes are light green, with natural iris texture. He wears a plain white crewneck sweatshirt with the utopicar
> logo from @logo-utopicar-hd printed on it.

## 1. Le portrait de base → `@avatar-portrait`

Outil : Nano Banana Pro (`gemini-3-pro-image`), 9:16, 2K. Trois tours, **une seule modification par tour**, comme le
conseille Google. Joindre chaque fois `@selfie-reference` en image 1, puis l'image du tour précédent en image 2.

### Tour 1 : un portrait propre

Le selfie est pris au grand angle à bout de bras, ce qui déforme le visage. On le refait en vrai portrait.

```
Using @selfie-reference, create a photorealistic head-and-shoulders portrait of exactly the same man, in 9:16.
Keep his face exactly the same: face shape, eyes, nose, lips, jawline, skin tone, hair, eyebrows, thin mustache and
short chin goatee. Keep the same white crewneck sweatshirt.
Change only the shot: eye level, 85mm portrait lens with natural, undistorted proportions, instead of the wide-angle
selfie. He looks straight into the lens with a calm, friendly half-smile, lips relaxed and slightly parted, a hint of
the upper teeth visible. No earbuds. Soft natural directional daylight from one side, plain light grey background.
Natural skin texture with visible pores, fine lines and a slightly uneven skin tone, natural facial asymmetry, natural
teeth with their real shape and an off-white shade, a few stray hairs, light creases in the fabric, subtle film grain.
```

Pour garder ses écouteurs comme signature, remplacer « No earbuds » par « Keep his white wireless earbuds ».

### Tour 2 : les yeux vert clair

```
Image 1 (@selfie-reference) is the identity reference. Image 2 is the portrait to edit.
Change only the color of his irises to a light, natural green, with real iris texture, a darker limbal ring and normal
reflections, not glowing and not saturated. Keep the eye shape, the eyelids, the eyebrows and everything else in
image 2 exactly the same. Do not change any other elements of the image.
```

### Tour 3 : le logo utopicar sur le sweat

Joindre `@logo-utopicar-hd` en image 3.

```
Image 1 (@selfie-reference) is the identity reference. Image 2 is the portrait to edit. Image 3 is the utopicar logo.
Change only the print on the sweatshirt: remove the orange two-triangle shape and replace it with the logo of image 3,
at the same place and about the same size as the shape in @selfie-reference. Copy the logo exactly: the black car
silhouette and the orange arrow (#FF5A1F), same proportions, same orientation as in image 3 (car facing left, arrow
pointing up to the right), not mirrored. No text and no other mark. It is printed flat on the cotton and follows the
folds and the light of the fabric. Do not redraw or stylize the logo. Do not change any other elements of the image.
```

**Validation :**
- c'est bien vous ;
- les yeux sont verts et naturels ;
- le logo est net et dans le bon sens.

Ce portrait devient `@avatar-portrait`.

## 2. Les trois planches

Outil : Nano Banana Pro, 16:9, 4K. Joindre `@selfie-reference` (image 1), `@avatar-portrait` (image 2),
`@logo-utopicar-hd` (image 3).

Règles communes :
- même lumière douce et égale dans toutes les cases ;
- pas d'ombre dure, pas de lunettes, pas de chapeau.

### `@fiche-angles`

```
Use image 1 for his identity and image 2 for his final look (light green eyes, utopicar logo); image 3 is the logo.
[BLOC IDENTITÉ]
Create a character reference sheet: five head-and-shoulders views in one row on a plain light grey background, same
scale and same soft even daylight in every view: left profile, left three-quarter, front, right three-quarter, right
profile. Neutral relaxed expression, mouth closed. The logo stays sharp and correctly oriented wherever it is visible.
85mm lens, natural skin texture with pores, sharp focus on the eyes.
```

### `@fiche-expressions`

```
Use image 1 for his identity and image 2 for his final look; image 3 is the logo.
[BLOC IDENTITÉ]
Create an expression sheet: a 3 by 2 grid of front-facing head-and-shoulders portraits on a plain light grey
background, same framing, scale and soft even daylight in every cell: 1) calm neutral; 2) warm half-smile, lips
together; 3) genuine smile showing natural teeth; 4) skeptical look, one eyebrow raised; 5) surprised, eyebrows up,
mouth slightly open; 6) serious and focused, mid-explanation, mouth open on a word.
Natural off-white teeth with the same shape and count in every cell, tongue visible when the mouth is open, real skin
texture with pores, natural creases around the eyes when he smiles.
```

### `@fiche-bouche`

C'est la planche qui aide le plus la synchro labiale, les dents et la langue.

```
Use image 1 for his identity and image 2 for his final look.
[BLOC IDENTITÉ]
Create a mouth reference sheet: a 3 by 2 grid of front-view close-ups from the nose to the chin, same scale and soft
even light, plain light grey background, his thin mustache and short chin goatee identical in every cell, each one
mid-speech on a different French sound:
1) lips pressed together as for "m", "b" or "p";
2) mouth open for "a", upper and lower teeth and the tongue visible;
3) rounded lips pushed forward for "ou";
4) small, tight rounded lips for the French "u";
5) upper teeth resting on the lower lip for "f" or "v";
6) tongue tip touching the back of the upper teeth for "l" or "t".
Natural, slightly uneven off-white teeth with the same number and shape in every cell, moist pink tongue, real lip
texture, sharp focus on the mouth.
```

Pour retoucher une case :

```
Keep everything the same, but change only [ONE THING]. Do not change any other elements of the image.
```

Une seule modification par tour, toujours avec `@selfie-reference` jointe.

## 3. L'habitacle, logos compris → `@plaque-habitacle`

Outil : Nano Banana Pro, 9:16, 4K. Joindre dans cet ordre : `@interieur-rs3-siege` (image 1), puis
`@interieur-rs4-habitacle` (image 2).

**Bloc décor**, à coller mot pour mot dans tous les prompts suivants :

> Interior of a stationary Audi RS sport car with left-hand drive. Black leather sport seats with red contrast
> stitching in a hexagonal honeycomb quilting pattern, red piping on the bolsters, "RS" embossed on the upper backrest.
> Flat-bottom steering wheel with a black suede rim and the four interlocking Audi rings on the hub. Black seatbelt
> with red edge stripes. Panoramic glass roof. Infotainment screen off. Outside the windows: a quiet residential street
> with olive trees, soft late-afternoon sun.

```
Use image 1 (@interieur-rs3-siege) for the seats: copy the honeycomb quilting, the red stitching and piping, the RS
logo and the seatbelt exactly. Use image 2 (@interieur-rs4-habitacle) for the layout, the dashboard, the steering
wheel with the Audi rings, the roof and the light.
Create an empty photorealistic plate of this exact interior, seen from a phone mounted on the dashboard slightly below
eye level, facing the empty driver's seat, vertical 9:16.
[BLOC DÉCOR]
Do not redesign, redraw or stylize any logo: the Audi rings and the RS logo stay sharp, symmetrical and correctly
shaped. Soft daylight through the windshield from behind the camera, side windows bright but not blown out, no strong
reflections on the glass, no phone mount visible.
```

**À vérifier avant de continuer :**
- le volant (bas plat, branches, nombre d'anneaux) ;
- le motif des sièges : nid d'abeille, et non losanges ;
- la place du « RS » ;
- la ceinture à liserés rouges.

Si un logo est abîmé, on corrige cette plaque une fois pour toutes : toute la série en hérite.

## 4. L'avatar à sa place → `@avatar-voiture`

Outil : Nano Banana Pro, 9:16, 4K. Joindre :
- `@selfie-reference` (image 1) ;
- `@avatar-portrait` (image 2) ;
- `@fiche-angles` (image 3) ;
- `@plaque-habitacle` (image 4) ;
- `@logo-utopicar-hd` (image 5).

```
Images 1 to 3 are only for the man's identity and look; image 4 is only for the environment; image 5 is the logo on
his sweatshirt.
[BLOC IDENTITÉ]
Change only: place this man in the driver's seat of image 4. Keep everything else in image 4 the same: seats,
stitching, RS logo, steering wheel and Audi rings, dashboard, roof, light, camera angle and framing.
He sits relaxed, turned slightly toward the phone, head-and-shoulders framing with his face large and front-on, mouth
and lower face fully unobstructed, lips slightly parted as if about to speak, calm half-smile. His left hand rests on
the steering wheel rim without covering the hub. Seatbelt unfastened, resting on the left side. The utopicar logo on
his sweatshirt is visible, sharp and correctly oriented.
Soft daylight through the windshield lights his face evenly; match the light, shadows and color temperature on him
to the interior. An unedited smartphone photo from the front camera, natural colors, slight sensor noise in the
shadows, natural skin texture with pores, no beauty filter. Neither the RS logo nor the utopicar logo is mirrored.
```

C'est la première image de tous les plans. Le décor ne change jamais : pour une autre heure ou une autre rue, on refait
une plaque, pas un plan.

## 5. Les plans vidéo de 8 s

Outil : Gemini Omni Flash 1.1 (`gemini-omni-1.1-flash`), 9:16, 8 s. Brancher `@avatar-voiture` sur **start_frame**.
Ce mode ne se combine pas avec des images de référence : c'est l'image de départ qui porte l'identité. Faire les essais
en 360p (le réglage le plus bas d'Omni) et la version finale en 1080p.

**Attention :** la doc Google d'Omni dit qu'il n'accepte pas les images de personnes reconnaissables. Comme
l'avatar a votre vrai visage, Omni peut refuser l'image de départ : à tester dès le premier plan. Si c'est le cas, on
passe à Veo 3.1 (première image + 3 références au plus) ou à Kling 3 dans Flows, avec le même prompt. Pour Veo, il
faut retirer les phrases « No … » et les mettre dans le champ negative prompt (« music, sound effects, subtitles,
captions, on-screen text, scene cuts, extra people »).

```
In a single continuous shot, no scene cuts. Vertical 9:16 video, static locked-off camera as if filmed by a phone
mounted on the dashboard; the framing stays exactly as in the start frame @avatar-voiture.
The man is speaking naturally to the camera. He looks straight into the lens and says in French, as a native speaker
from Paris with a soft uvular R, in a calm, confident, conversational tone: "[RÉPLIQUE — 15 à 18 mots, chiffres en
lettres]"
He blinks naturally and keeps eye contact on the key words; during a short pause he glances briefly at the side
window, then back at the lens. Minimal head movement while speaking, relaxed shoulders that move gently with his
breathing, a brief half-smile with lips mostly closed between sentences. His left hand stays on the steering wheel rim,
nothing passes in front of his mouth. His face, light green eyes, mustache, goatee and the utopicar logo on his
sweatshirt stay identical for the whole shot.
[BLOC DÉCOR] The interior, the logos, the light and the seatbelt stay identical for the whole shot.
Voice: young adult male, mid-twenties, warm, relaxed, medium-low pitch, native French speaker, normal pace.
Ambient noise: the quiet hush of a parked car interior, faint muffled street outside, engine off.
No music. No extra sound effects. No subtitles, no captions, no on-screen text.
```

**À éviter dans ce prompt :**
- les mouvements forts : « nods », « turns his head », « shaky cam », « big smile while talking », « energetic
  gestures » ;
- le mot « RS » ou « utopicar » entre guillemets, qui pourrait s'afficher à l'écran ;
- toute deuxième personne à l'image.

**Retouches**, une par échange, sur le plan généré :
- `Edit this keeping everything the same. Reduce his head movement; keep his torso relaxed, not frozen.`
- `Edit this keeping everything the same. Natural blink rate, eyes not locked; one brief glance away during the pause.`
- `Edit this keeping everything the same. Softer smile with lips mostly closed between sentences.`

## 6. La voix de Simon et la synchro

1. **Voix.** TTS ElevenLabs, voix Simon (`mvhJVdVoTWVUtL4keT7W`), même texte que la réplique du plan :
   - chiffres et abréviations en toutes lettres (« trois mille cinq cents euros ») ;
   - pas de balise `<break>` en v3 ou v4 ;
   - la voix doit tenir dans la durée du plan.
2. **Synchro.** On jette l'audio du modèle vidéo (son français n'est pas garanti). On passe le plan dans
   **Sync Lipsync 3** (`sync-lipsync-v3`) avec la voix de Simon seule, sans musique ni bruit, en 1080p.
   - Sync 3 recrée la bouche en 4K, alors que lipsync-2-pro la refait en 512 × 512, ce qui floute les dents en gros plan.
   - Pour un deuxième essai, repartir du plan d'origine, jamais d'un plan déjà resynchronisé.
3. **Repli.** OmniHuman 1.5, avec `@avatar-voiture` et la voix de Simon en WAV 16 bits, 30 s maximum en 1080p.
   La synchro est solide, mais le décor reste plus figé.
4. **Montage chez nous :**
   - ambiance et musique remises après la synchro ;
   - sous-titres mot à mot ;
   - illustrations ;
   - si la vidéo a adouci un logo, réincrustation du vrai : Audi depuis la photo, utopicar depuis le SVG officiel.
     Le plan est fixe, un simple calque suffit.

## 7. Contrôle de chaque plan

- **Visage :** le même que `@selfie-reference`. Vérifier la ligne des cheveux, le bouc, la moustache et les yeux vert
  clair (ni gris, ni marron, ni lumineux).
- **Bouche :** à contrôler image par image en gros plan.
  - Les lèvres se ferment sur p, b et m.
  - Elles s'arrondissent sur « ou » et « u » (pour, plus, une, bonne).
  - Les dents gardent le même nombre et la même forme.
  - La langue est visible sur « l » et « t ».
  - L'intérieur de la bouche n'est jamais un trou noir.
- **Regard :** il cligne des yeux et ne fixe pas l'objectif en continu.
- **Logos :** utopicar dans le bon sens et net. Les anneaux, le nid d'abeille, le « RS » et la ceinture sont identiques
  à la plaque.
- **Visionnage :** une fois son coupé, une fois avec le son. Les premières images ne buguent pas.
- **Publication :**
  - étiquette TikTok « contenu généré par IA » activée (règle TikTok et AI Act, art. 50) ;
  - l'avatar parle en « tu » et ne raconte aucun vécu inventé ;
  - comme c'est votre visage, il ne dit rien que vous ne diriez pas vous-même.

## Sources

| Sujet | Source | Fiabilité |
|---|---|---|
| Références, ratio, 2K/4K, « Do not change any other elements » | [Gemini API, génération d'images](https://ai.google.dev/gemini-api/docs/image-generation) | doc officielle |
| Rôle de chaque image, une modification par tour, limites sur le petit texte | [Google, 7 conseils Nano Banana Pro](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/) | officiel |
| Structure du prompt d'image, type d'appareil | [Google Cloud, guide Nano Banana](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana) | officiel |
| Omni : plan unique, personnes reconnaissables refusées, langues autres que l'anglais non évaluées, exclusions | [Gemini API, Omni](https://ai.google.dev/gemini-api/docs/omni) | doc officielle |
| Arrêt de Veo 3.1 Preview le 22 oct. 2026 | [Gemini API, vidéo](https://ai.google.dev/gemini-api/docs/video) | doc officielle |
| Dialogue entre guillemets, `Ambient noise:` | [Guide de prompt Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1) | officiel |
| Veo 3.1 : 3 images de référence au plus | [Google Developers, Veo 3.1](https://developers.googleblog.com/introducing-veo-3-1-and-new-creative-capabilities-in-the-gemini-api/) | officiel |
| Sync 3 en 4K, lipsync-2-pro en 512 × 512, « person is speaking naturally » | [sync.so, modèles](https://sync.so/docs/models), [conseils](https://sync.so/docs/compatibility-and-tips/improving-lip-sync-quality) | doc officielle |
| OmniHuman 1.5 : durées et format audio | [fal, guide OmniHuman 1.5](https://fal.ai/learn/devs/omnihuman-15-user-guide) | doc d'hébergeur |
| Nombres en lettres, pas de `<break>` en v3/v4 | [ElevenLabs, normalisation](https://elevenlabs.io/docs/best-practices/prompting/normalization) | doc officielle |
| Bouche visible, personnage grand dans l'image | [HeyGen, photo avatars](https://help.heygen.com/en/articles/10034438-how-to-get-started-with-photo-avatars) | aide officielle |
| Upscale image par image : les dents scintillent | [HDTR-Net, arXiv 2309.07495](https://ar5iv.labs.arxiv.org/html/2309.07495) | recherche |
| Visage et décor constants, peau, image de départ du lipsync | [Higgsfield, personnages et lieux](https://higgsfield.ai/blog/consistent-characters-locations), [image vers vidéo parlante](https://higgsfield.ai/blog/still-image-to-talking-video) | blog éditeur |
| Fiche à 3 vues, décor en une image 3/4, accent décrit par le son (« soft uvular R ») | chaîne YouTube [@HiggsfieldAI](https://www.youtube.com/@HiggsfieldAI) : MsxIRbuYmyU, Lts9yNZKUv4, 5PlgLhR9tsc (descriptions ; transcriptions non lues) | éditeur |
| Regard fixe, mains, dents qui fusionnent au sourire | [diyai.io, talking heads](https://diyai.io/ai-tools/video-generation/ai-talking-head-generator/) | blog tiers |
| Étiquette IA : environ −7 à 8 % de likes ; le contenu rationnel est moins pénalisé | [Journal of Consumer Research 2026](https://academic.oup.com/jcr/advance-article/doi/10.1093/jcr/ucag013/8672493), [CBS 2026](https://www.cbs.dk/en/articles/ai-labels-reduce-social-media-engagement) | études |

**À mesurer sur les premiers plans**, aucune source ne le garantit :
- si Omni accepte un vrai visage ;
- la qualité de la synchro en français ;
- la tenue des logos en vidéo ;
- le naturel des yeux vert clair sur toute la série.
