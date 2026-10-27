# Avatar utopicar : prompts de fabrication

Un jeune homme qui donne des conseils d'achat-revente, assis à l'arrêt dans sa voiture. L'avatar s'inspire d'un selfie
réel sans le copier : c'est un visage nouveau. Les plans sont générés en 8 s, la voix est celle de Simon (ElevenLabs),
le montage est le nôtre. Recherche du 27 oct. 2026 (11 agents, sources ouvertes et vérifiées) : liste en fin de page.

Les prompts sont en anglais, les répliques en français. Chaque réplique passe d'abord par la grille de scénario et
chaque accroche par `art-du-hook` (règle du dépôt) : ici, elles restent `[RÉPLIQUE]`.

## 0. Les références

Fichiers fournis, rangés dans `video/refs/avatar/` (non versionné, règle « références hors du dépôt ») :

| Référence | Contenu | Rôle |
|---|---|---|
| `@selfie-inspiration` | selfie au bord d'un lac, sweat blanc à logo orange | allure, coiffure, barbe, tenue. **Jamais le visage.** |
| `@interieur-rs4-habitacle` | habitacle complet en 3/4, volant à anneaux, toit ouvrant, jardin d'oliviers dehors | décor principal, lumière |
| `@interieur-rs3-siege` | siège nid d'abeille, « RS » sur le haut du dossier, surpiqûres rouges, ceinture noire à liserés rouges | détail des sièges, du logo et de la ceinture |
| `@interieur-s3-sieges` | sièges à losanges | **écartée** : un autre motif casserait la constance |

Références générées au fil des étapes :

| Référence | Étape | Contenu |
|---|---|---|
| `@avatar-portrait` | 1 | le visage choisi, de face |
| `@fiche-angles` | 2 | 5 angles du visage |
| `@fiche-expressions` | 2 | 6 expressions |
| `@fiche-bouche` | 2 | 6 positions de bouche (sons du français) |
| `@plaque-habitacle` | 3 | l'habitacle vide vu du téléphone, logos nets |
| `@avatar-voiture` | 4 | l'avatar à sa place : première image de chaque plan vidéo |

Dans ElevenLabs Flows, l'image se branche sur le port (images, start_frame) : le `@nom` dans le texte sert de repère,
c'est le branchement qui fait la référence. Toujours joindre les images **dans le même ordre**, une seule fonction par
image, et le dire dans le prompt.

## 1. Créer le visage → `@avatar-portrait`

Nano Banana Pro (`gemini-3-pro-image`), 9:16, 2K, 4 variations. On en garde une.

```
Create a photorealistic head-and-shoulders portrait in 9:16 format of an original young French man of mixed heritage,
about 26 years old, who must not resemble any real or famous person. Use @selfie-inspiration only for the overall
style: grooming, hairstyle type, beard style and outfit. Do not copy that man's face: give this new person his own
distinct face shape, nose and eyes.
He has warm light-brown skin, short dark hair with a slight natural wave on top and a soft taper on the sides, thick
dark straight eyebrows, dark brown eyes, full lips, a thin mustache and a short chin beard, clean-shaven cheeks and a
defined jaw. He wears a plain white crewneck sweatshirt with a small orange geometric logo of two triangles on the
chest, as in @selfie-inspiration.
He looks straight into the lens with a calm, friendly half-smile, lips relaxed and slightly parted, a hint of the upper
teeth visible.
Shot at eye level with an 85mm lens, soft natural directional daylight from one side, neutral light grey background.
Natural skin texture with visible pores, fine lines and a slightly uneven skin tone, natural facial asymmetry, natural
teeth with their real shape and an off-white shade, a few stray hairs, light creases in the fabric, subtle film grain.
```

Choisir le visage :
- **Le plus important :** il ne doit pas ressembler à la personne du selfie. Comparer côte à côte. Si on le
  reconnaît, il faut l'accord écrit de cette personne (droit à l'image) ; Gemini Omni Flash refuse d'ailleurs les
  personnes reconnaissables.
- Avec le texte seul, sans joindre `@selfie-inspiration`, le risque de copie tombe à zéro.

## 2. Les trois planches

Nano Banana Pro, 16:9, 4K. Joindre `@avatar-portrait` en image 1. Même lumière douce et égale dans toutes les cases,
sans ombre dure, sans lunettes ni chapeau.

### `@fiche-angles`

```
Using @avatar-portrait as the only identity reference, create a character reference sheet of exactly the same man.
Keep identical: eye shape, nose bridge contour, jawline angle, lip proportions, skin tone and texture, short dark wavy
hair with soft taper, thin mustache and short chin beard, white crewneck sweatshirt with the small orange two-triangle
logo.
Five head-and-shoulders views in one row on a plain light grey background, same scale and same soft even daylight in
every view: left profile, left three-quarter, front, right three-quarter, right profile. Neutral relaxed expression,
mouth closed. 85mm lens, natural skin texture with pores, sharp focus on the eyes.
```

### `@fiche-expressions`

```
Using @avatar-portrait and @fiche-angles as identity references, create an expression sheet of exactly the same man,
with the same identical features and the same sweatshirt.
A 3 by 2 grid of front-facing head-and-shoulders portraits on a plain light grey background, same framing, scale and
soft even daylight in every cell: 1) calm neutral; 2) warm half-smile, lips together; 3) genuine smile showing natural
teeth; 4) skeptical look, one eyebrow raised; 5) surprised, eyebrows up, mouth slightly open; 6) serious and focused,
mid-explanation, mouth open on a word.
Natural off-white teeth with the same shape and count in every cell, tongue visible when the mouth is open, real skin
texture with pores, natural creases around the eyes when he smiles.
```

### `@fiche-bouche`

C'est la planche qui aide le plus la synchro labiale, les dents et la langue.

```
Using @avatar-portrait as the identity reference, create a mouth reference sheet of exactly the same man: same lips,
teeth, beard and skin.
A 3 by 2 grid of front-view close-ups from the nose to the chin, same scale and soft even light, plain light grey
background, each one mid-speech on a different French sound:
1) lips pressed together as for "m", "b" or "p";
2) mouth open for "a", upper and lower teeth and the tongue visible;
3) rounded lips pushed forward for "ou";
4) small, tight rounded lips for the French "u";
5) upper teeth resting on the lower lip for "f" or "v";
6) tongue tip touching the back of the upper teeth for "l" or "t".
Natural, slightly uneven off-white teeth with the same number and shape in every cell, moist pink tongue, real lip
texture, sharp focus on the mouth.
```

Retoucher une case : `Keep everything the same, but change only [ONE THING]. Do not change any other elements of the
image.` Une seule modification par tour, et repartir des planches d'origine plutôt que de retoucher une retouche.

## 3. L'habitacle, logos compris → `@plaque-habitacle`

Nano Banana Pro, 9:16, 4K. Joindre dans cet ordre : `@interieur-rs3-siege` (image 1), `@interieur-rs4-habitacle`
(image 2). Ce **bloc décor** se colle mot pour mot dans tous les prompts suivants :

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

Vérifier avant de continuer :
- le volant (bas plat, branches, nombre d'anneaux) ;
- le motif : nid d'abeille, pas losanges ;
- l'emplacement du « RS » ;
- la ceinture à liserés rouges.

Si un logo est abîmé, corriger cette plaque une fois pour toutes : toute la série en hérite.

## 4. L'avatar à sa place → `@avatar-voiture`

Nano Banana Pro, 9:16, 4K. Joindre `@avatar-portrait` (image 1), `@fiche-angles` (image 2), `@plaque-habitacle`
(image 3).

```
Use images 1 and 2 only for the man's identity: keep his facial features exactly the same as image 1 (eye shape, nose
bridge, jawline, lips, skin tone, hair, thin mustache and short chin beard) and the same white sweatshirt with the
small orange two-triangle logo. Use image 3 only for the environment.
Change only: place this man in the driver's seat of image 3. Keep everything else the same: seats, stitching, RS logo,
steering wheel and Audi rings, dashboard, roof, light, camera angle and framing.
He sits relaxed, turned slightly toward the phone, head-and-shoulders framing with his face large and front-on, mouth
and lower face fully unobstructed, lips slightly parted as if about to speak, calm half-smile. His left hand rests on
the steering wheel rim without covering the hub. Seatbelt unfastened, resting on the left side.
Soft daylight through the windshield lights his face evenly; match the light, shadows and color temperature on him
to the interior. An unedited smartphone photo from the front camera, natural colors, slight sensor noise in the
shadows, natural skin texture with pores, no beauty filter. The RS logo reads correctly, not mirrored.
```

C'est la première image de tous les plans. Le décor ne change jamais ; pour une autre heure ou une autre rue, on
refait une plaque, pas un plan.

## 5. Les plans vidéo de 8 s

Gemini Omni Flash 1.1 (`gemini-omni-1.1-flash`), 9:16, durée 8 s. Brancher `@avatar-voiture` sur **start_frame**.
Le mode start_frame ne se combine pas avec des images de référence : c'est l'image de départ qui porte l'identité.
Faire les essais en 360p (le réglage le plus bas d'Omni), la version finale en 1080p.

```
In a single continuous shot, no scene cuts. Vertical 9:16 video, static locked-off camera as if filmed by a phone
mounted on the dashboard; the framing stays exactly as in the start frame @avatar-voiture.
The man is speaking naturally to the camera. He looks straight into the lens and says in French, as a native speaker
from Paris with a soft uvular R, in a calm, confident, conversational tone: "[RÉPLIQUE — 15 à 18 mots, chiffres en
lettres]"
He blinks naturally and keeps eye contact on the key words; during a short pause he glances briefly at the side
window, then back at the lens. Minimal head movement while speaking, relaxed shoulders that move gently with his
breathing, a brief half-smile with lips mostly closed between sentences. His left hand stays on the steering wheel rim,
nothing passes in front of his mouth.
[BLOC DÉCOR] The interior, the logos, the light and the seatbelt stay identical for the whole shot.
Voice: young adult male, mid-twenties, warm, relaxed, medium-low pitch, native French speaker, normal pace.
Ambient noise: the quiet hush of a parked car interior, faint muffled street outside, engine off.
No music. No extra sound effects. No subtitles, no captions, no on-screen text.
```

À éviter dans ce prompt :
- les mouvements forts : « nods », « turns his head », « shaky cam », « big smile while talking », « energetic
  gestures » ;
- le mot « RS » entre guillemets, qui pourrait s'afficher à l'écran ;
- toute deuxième personne à l'image.

Retouches, une par échange, sur le plan généré :
- `Edit this keeping everything the same. Reduce his head movement; keep his torso relaxed, not frozen.`
- `Edit this keeping everything the same. Natural blink rate, eyes not locked; one brief glance away during the pause.`
- `Edit this keeping everything the same. Softer smile with lips mostly closed between sentences.`

## 6. La voix de Simon et la synchro

1. **Voix.** TTS ElevenLabs, voix Simon (`mvhJVdVoTWVUtL4keT7W`), même texte que la réplique du plan :
   - chiffres et abréviations en toutes lettres (« trois mille cinq cents euros ») ;
   - pas de balise `<break>` en v3 ou v4 ;
   - la durée de la voix doit tenir dans le plan.
2. **Synchro.** Jeter l'audio d'Omni (son français n'est pas garanti). Passer le plan dans **Sync Lipsync 3**
   (`sync-lipsync-v3`) avec la voix de Simon seule, sans musique ni bruit, en 1080p. Pourquoi Sync 3 plutôt que
   lipsync-2-pro : il génère la bouche en 4K, alors que lipsync-2-pro la refait en 512 × 512, ce qui floute les dents
   sur un gros plan. Pour un deuxième essai, repartir du plan d'origine, jamais d'un plan déjà resynchronisé.
3. **Repli.** OmniHuman 1.5 (`@avatar-voiture` + voix de Simon, WAV 16 bits, 30 s maximum en 1080p). La synchro
   est solide, mais le décor reste plus figé.
4. **Montage chez nous** :
   - ambiance et musique remises après la synchro ;
   - sous-titres mot à mot ;
   - illustrations ;
   - logo Audi réincrusté depuis la photo d'origine si la vidéo l'a adouci (le plan est fixe : un simple calque
     suffit).

## 7. Contrôle de chaque plan

- **Visage :** le même que `@avatar-portrait`. Vérifier la ligne des cheveux, la barbe et l'âge.
- **Bouche, image par image en gros plan :**
  - les lèvres se ferment sur p, b, m ;
  - elles s'arrondissent sur « ou » et « u » (pour, plus, une, bonne) ;
  - les dents gardent le même nombre et la même forme ;
  - la langue est visible sur « l » et « t » ;
  - l'intérieur de la bouche n'est jamais un trou noir.
- **Regard :** il cligne des yeux et ne fixe pas l'objectif sans interruption.
- **Décor :** le volant, les anneaux, le nid d'abeille, le RS et la ceinture sont identiques à la plaque.
- **Visionnage :** une fois son coupé, une fois avec le son. Les premières images ne doivent pas bugger.
- **Publication :**
  - étiquette TikTok « contenu généré par IA » activée (règle TikTok et AI Act, art. 50) ;
  - l'avatar parle en « tu », ne raconte aucun vécu inventé et ne se fait pas passer pour une vraie personne.

## Sources

| Sujet | Source | Fiabilité |
|---|---|---|
| Références, ratio, 2K/4K, « Do not change any other elements » | [Gemini API, génération d'images](https://ai.google.dev/gemini-api/docs/image-generation) | doc officielle |
| Rôle de chaque image, limites sur le petit texte | [Google, 7 conseils Nano Banana Pro](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/) | officiel |
| Structure du prompt d'image, type d'appareil | [Google Cloud, guide Nano Banana](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana) | officiel |
| Omni : plan unique, langues autres que l'anglais non évaluées, exclusions | [Gemini API, Omni](https://ai.google.dev/gemini-api/docs/omni) | doc officielle |
| Arrêt de Veo 3.1 Preview le 22 oct. 2026 | [Gemini API, vidéo](https://ai.google.dev/gemini-api/docs/video) | doc officielle |
| Dialogue entre guillemets, `Ambient noise:` | [Guide de prompt Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1) | officiel |
| Sync 3 en 4K, lipsync-2-pro en 512 × 512, « person is speaking naturally » | [sync.so, modèles](https://sync.so/docs/models), [conseils](https://sync.so/docs/compatibility-and-tips/improving-lip-sync-quality) | doc officielle |
| OmniHuman 1.5 : durées et format audio | [fal, guide OmniHuman 1.5](https://fal.ai/learn/devs/omnihuman-15-user-guide) | doc d'hébergeur |
| Nombres en lettres, pas de `<break>` en v3/v4 | [ElevenLabs, normalisation](https://elevenlabs.io/docs/best-practices/prompting/normalization) | doc officielle |
| Bouche visible, personnage grand dans l'image | [HeyGen, photo avatars](https://help.heygen.com/en/articles/10034438-how-to-get-started-with-photo-avatars) | aide officielle |
| Upscale image par image = dents qui scintillent | [HDTR-Net, arXiv 2309.07495](https://ar5iv.labs.arxiv.org/html/2309.07495) | recherche |
| Visage et décor constants, peau, image de départ du lipsync | [Higgsfield, personnages et lieux](https://higgsfield.ai/blog/consistent-characters-locations), [image vers vidéo parlante](https://higgsfield.ai/blog/still-image-to-talking-video) | blog éditeur |
| Fiche 3 vues, décor en une image 3/4, accent décrit par le son (« soft uvular R ») | chaîne YouTube [@HiggsfieldAI](https://www.youtube.com/@HiggsfieldAI) : MsxIRbuYmyU, Lts9yNZKUv4, 5PlgLhR9tsc (descriptions ; transcriptions non lues) | éditeur |
| Regard fixe, mains, dents qui fusionnent au sourire | [diyai.io, talking heads](https://diyai.io/ai-tools/video-generation/ai-talking-head-generator/) | blog tiers |
| Étiquette IA : environ −7 à 8 % de likes ; contenu rationnel moins pénalisé | [Journal of Consumer Research 2026](https://academic.oup.com/jcr/advance-article/doi/10.1093/jcr/ucag013/8672493), [CBS 2026](https://www.cbs.dk/en/articles/ai-labels-reduce-social-media-engagement) | études |

Points qu'aucune source ne garantit, à mesurer sur nos premiers plans : la qualité de la synchro en français
(Omni comme Sync), l'effet des lèvres entrouvertes sur la référence, la tenue des logos en vidéo.
