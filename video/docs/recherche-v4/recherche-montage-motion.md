# Montage and motion craft for utopicar vertical shorts — research v4

Date: 29 Oct 2026. Scope: 1080×1920 at 24 fps, an AI avatar (young man) seated in a car talking to camera (close and wide shots), Mixkit B-roll, word-by-word subtitles, a top label pill with a number badge, full-screen word cards. Brand: utopicar (single-line car silhouette + orange upward arrow). Everything is rendered in code: HTML/CSS/SVG + GSAP in HyperFrames 0.8.210, with ffmpeg 6.1 and Python (numpy 2.5, scipy 1.18, OpenCV 5.0, torch 2.15 **CPU only, no CUDA**, 4 cores, 15 GB RAM) for pre-processing.

**Method.** I read primary sources wherever they exist: official docs (Material/AOSP source code, Apple WWDC and HIG, IBM Carbon, GSAP, MDN, OpenCV, MediaPipe, ffmpeg's own `-h filter=` help, HyperFrames' bundled docs v0.8.210), books through faithful quotations (Murch, Dmytryk, *The Illusion of Life*), peer-reviewed papers (Guo et al. 2014, Cutting et al. 2011, Gernsbacher 2015, Spence 2011), the people themselves (Murch interview, Jenny Hoyos podcast, the MrBeast production memo, Kallaway podcast excerpts), and studio or brand case studies (DIA, Vucko via Print, Google, Renault, Netflix, Mastercard, Spotify/Rive, Polestar). I cannot watch videos, so creators' styles are covered only where a written source exists. Section 7 lists every source I opened. Anything I saw only in search snippets is marked **(not opened)**.

**Confidence legend.** *High*: primary documentation or a peer-reviewed or measured source, read in full. *Medium*: a practitioner's own words, vendor docs measured on their own films, or consistent secondary sources. *Low*: vendor marketing, single anecdotes, or my own derivation (always labelled "derived").

**Note on limits.** The shared web-search budget ran out near the end. The last fact (Spence 2011) came from fetching PubMed directly. A few planned checks were not done; they are listed in §5.6 and §7.

---

## 0. Constraints behind every recommendation

**House rules** (`video/CLAUDE.md`, brief): no zoom added on the face. No crossfades between scenes, nothing that appears by fade alone, no generic particles, no glow on UI, no spins, glitches or light leaks without a narrative reason, no visible bounce on typography, no dead time. Something new appears every 2–4 s. Safe zones: top 220, bottom 440, right 140, left 60. Centred items sit on x = 540. Closed-form springs only, no `Math.random`, and every frame is a pure function of t.

**HyperFrames facts that change how things get built** (local docs `dist/skills/hyperframes/references/*.md`, v0.8.210):
- "Grades, grain, blur and vignettes on footage go through `npx hyperframes media-treatment`, never CSS filters" (contract rule 11). The `media-treatment` blur is an isotropic defocus that can be animated through `--hf-color-grading-blur` (0–1). Directional smear comes from the motion-blur engine instead:
  - `data-motion-blur="on"` on the root, with shutter default 240° (0–720) and ≥32 samples.
  - The "filter" tier averages copies along the real path for translations.
  - The "capture" tier draws spins and zooms truthfully.
  - Cost measured by HF: filter tier ≈ no cost; capture 9.8 s against 5.3–5.9 s without blur on their 8 s test.
- Speed: `data-playback-rate` (0.1–10, pitch-preserved). Ramps use a `rate` lane in `data-automation`, with `t` in clip seconds and `v` from 0.1 to 10. The documented syntax is the same JSON as the volume lane: `{"version":1,"lanes":[{"target":"…","points":[{"t":0,"v":1},…]}]}`.
- `npx hyperframes remove-background in.mp4 -o cutout.webm` gives a transparent WebM of the person. `--background-output plate.webm` also gives the background with a hole where the subject was. This is the basis for text-behind-subject and "background-only" emphasis. HF measured about 2 fps at 1080p on CPU, with a 168 MB model download.
- A freeze in the middle of a source needs a still exported first and placed as its own clip.
- Footage whose keyframes are more than about 1 s apart freezes on seek: re-encode with `-g 24`.
- No network at render time: GSAP plugins (CustomEase, SplitText, DrawSVG, CustomWiggle) must be local files. All of them are free for commercial use since GSAP 3.13 (29 Apr 2025: "GSAP is now 100% FREE including ALL of the bonus plugins").

**ML tools: can they run here, and does the licence allow commercial use?**

| Tool | Use | Licence (as read) | Runs on this CPU box? |
|---|---|---|---|
| HyperFrames `remove-background` | person matte, plate | HF CLI | yes, ~2 fps at 1080p (HF doc) |
| Robust Video Matting (RVM) | temporally stable human matte | GPL-3.0 (the code; processing your own video is not distribution) | yes (MobileNetV3); GPU figures only published |
| SAM 2 | object masks and video propagation | Apache-2.0 | slow on CPU |
| SAM 3 | text-prompted video segmentation ("car key") | "SAM License": broad grant, military/ITAR uses excluded, no explicit ban on commercial use | **no**: needs CUDA ≥ 12.6 |
| Depth Anything V2 | depth for 2.5D parallax | **Small: Apache-2.0; Base/Large/Giant: CC-BY-NC-4.0** | Small: yes |
| 3D Ken Burns (Niklaus 2019) | single-image camera move | **CC BY-NC-SA 4.0: non-commercial, unusable for utopicar** | no (CUDA) |
| Practical-RIFE (v4.25) | frame interpolation, slow motion | MIT | yes (slow) |
| FILM (Google) | interpolation for large motion and near-duplicate frames | Apache-2.0, repo archived 14 Oct 2025 | TF and GPU-oriented |
| WhisperX | word and character alignment (wav2vec2; French supported) | BSD-2 | yes |
| MediaPipe Face/Hand Landmarker | 478 face landmarks + 52 blendshapes; 21 hand landmarks | Apache-2.0 | yes (not installed: `pip install mediapipe`) |

---

## 1. Transitions that feel motivated or invisible

### 1.0 The decision framework pros use

- **Murch's Rule of Six** (*In the Blink of an Eye*, 1995): emotion 51%, story 23%, rhythm 10%, eye-trace 7%, 2-D plane of the screen 5%, 3-D space 4%. If something has to give, give from the bottom of the list. The editors who apply it note the percentages matter less than the order. Sources: PremiumBeat; No Film School. Confidence: medium-high (secondary but consistent everywhere).
- **Eye-trace counts more in fast montage.** No Film School argues that in sub-second social cuts, eye-trace "may even be a single most important factor" (quoting editor Jeff Bartsch). Viewers find the point of interest in a fraction of a second. Faces, high contrast and saturated colour attract first. Making the eyes jump across the frame at every cut is disorienting. Confidence: medium.
- **Dmytryk, *On Film Editing* (1984)**, as transcribed in a course document: "All properly made cuts are unnoticeable." "Never make a cut without a positive reason." "Cut on action whenever possible." "Cut into and away from a scene while it is still alive." "'Fresh' footage is preferable to 'stale'." The rationale given for cutting on action: the eye cannot focus during movement, and a movement takes about a fifth of a second, so a cut inside that window goes unseen. Keep the rhythm of the action even at the cost of a slightly imperfect match. Confidence: medium.
- **Cuts are the default; effects need a cause.** Videomaker: "As a rule, cuts are the best edits." "If you choose an effect simply because it looks neat, you'll probably wind up confusing the audience." HyperFrames' measured rule for its own launch films: use 3–5 kinds of transition in a film, each caused by something on screen. At most a third of the seams between beats should be hard cuts, and "worlds never crossfade". Confidence: medium.

### 1.1 Cut at the motion peak, with direction and speed matched

- **What and why.** Cut mid-movement, on the fastest frame, so motion carries the eye across the seam and the cut falls in the window where the eye can't focus (Dmytryk). HyperFrames' rule: "cut at the fastest frame of a move, with matching direction and speed on both sides". If speeds don't match across the seam, mirror the eases: `power3.in` going out, `power3.out` coming in.
- **How pros do it.** Mark the frame where the action peaks and trim so the motion continues in the incoming shot. Stinson (Videomaker): cutting in the middle of an ongoing movement "is the hardest method but it delivers the most convincing illusion". Change at least one of vertical angle, horizontal angle or image size, preferably two; changing all three draws attention.
- **In our stack (original part): pick B-roll in and out points from measured optical flow, not by eye.**
  ```python
  # flowscan.py — speed, direction and "where the motion is" per frame (run with python3 -I)
  import cv2, numpy as np, json, sys
  cap = cv2.VideoCapture(sys.argv[1]); dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_FAST)
  prev, out, i, S = None, [], 0, 4                      # analyse at 1/4 resolution
  while True:
      ok, f = cap.read()
      if not ok: break
      g = cv2.cvtColor(cv2.resize(f, None, fx=1/S, fy=1/S), cv2.COLOR_BGR2GRAY)
      if prev is not None:
          fl = dis.calc(prev, g, None); mag = np.hypot(fl[...,0], fl[...,1]); w = mag/(mag.sum()+1e-6)
          ys, xs = np.mgrid[:g.shape[0], :g.shape[1]]
          out.append(dict(f=i, vx=float((fl[...,0]*w).sum()*S), vy=float((fl[...,1]*w).sum()*S),
                          cx=float((xs*w).sum()*S), cy=float((ys*w).sum()*S)))   # px/frame and motion centroid
      prev, i = g, i+1
  json.dump(out, open(sys.argv[2], 'w'))
  ```
  Choose the out-point of shot A and the in-point of shot B where |v| peaks near the voice cue and where the angles agree within about 20° (the 20° threshold is derived). Write them as `data-media-start` / `data-start`. Static avatar shots carry no motion, so put the moving element on the graphics side: a pill or word card leaves along the B-roll's vector.
- **Numbers.** About 1/5 s for a movement (Dmytryk). HyperFrames: a fast move takes 0.3–0.6 s.
- **Sources.** Dmytryk (chicagomediaworks transcription); Stinson (Kent mirror); HF `motion.md`.
- **Confidence.** Principle: medium-high. Automation: derived.

### 1.2 Match cuts: graphic, action and sound

- **What.** Shots joined by a shared shape, colour, line or composition (graphic), by continuous motion (action), or by sound (audio, including J/L cuts). Adobe: "An impactful match cut calls for nearly perfect timing". Its workflow: stack both clips at 50% opacity, slip until the shapes align, then restore. Use match cuts sparingly.
- **Our use: brand-shape matches.** Our recurring shapes are round (steering wheel, rev counter, number badge, wheels) and the 31.7° diagonal of the logo arrow (§4.4).
  - Find circles in B-roll frames with `cv2.HoughCircles` or contour moments.
  - Let the 74 px number badge land exactly on the B-roll circle's centre at the cut, then let the badge "become" the gauge (or the reverse).
  - The 50%-opacity alignment pros do by hand becomes a measured position.
- **Sound match.** A real B-roll sound (key turning, engine starting) placed on the cut. HyperFrames: J/L cuts are separate `<audio>` elements.
- **Sources.** Adobe "Match cut".
- **Confidence.** Medium (definitions). The brand-shape automation is derived.

### 1.3 Whip pan with directional motion blur, matched in speed

- **What and why.** A fast pan smears the image. A cut hidden inside the smear is invisible. Adobe: "Viewers won't notice the invisible cut if the whip pans between shots are quick enough."
- **How pros do it.** In Premiere and AE, a push plus Directional Blur on an adjustment layer, keyframed to peak at the cut. Tutorials quote blur lengths of 50–250 (not opened). HyperFrames measured on its films:
  - a whip lasts 0.13–0.3 s;
  - "the arriving element lands blurred and sharpens in ~0.13 s";
  - blur peaks at the fastest frame: 6–12 px on text-sized elements, 15–20 px full-frame, horizontal-only on a horizontal move.
- **Physics for choosing the blur instead of a preset (derived).** A shutter exposes during a fraction s/360 of the frame interval. Smear length L = v × (shutter/360), with v in px per frame. A box smear of length L has a standard deviation σ ≈ L/√12 ≈ 0.29 L. So blur follows from the velocity you animate. Example: 600 px/s at 24 fps and 180° gives L = 12.5 px.
- **In our stack.**
  1. Use a **strip** where the incoming shot is attached to the outgoing one, so no edge is ever exposed. The face is never scaled, so no zoom.
  2. Mirror the eases so peak speeds match at the seam. With power-type eases the peak speed is k·D/T, so matching needs D_out/T_out = D_in/T_in.
  3. Turn on HF motion blur (filter tier = true directional smear along the path), or pre-render the smear.
  ```js
  // root: data-motion-blur="on" data-motion-blur-shutter="360"   (shutter chosen from the speed, see formula)
  // #strip holds A at x=0 and B at x=1080, side by side, both 1080×1920, nothing scaled
  const W = 1080, cut = 6.805, Tout = 0.10, Tin = 0.20;            // total 0.30 s = HF whip range
  const Dout = W * Tout / (Tout + Tin), Din = W - Dout;             // Dout/Tout = Din/Tin → same peak speed at `cut`
  tl.fromTo('#strip', { x: 0 },     { x: -Dout, duration: Tout, ease: 'power3.in' }, cut - Tout);
  tl.fromTo('#strip', { x: -Dout }, { x: -W,    duration: Tin,  ease: 'power3.out', immediateRender: false }, cut);
  // peak speed = 4·Dout/Tout = 14 400 px/s = 600 px/frame at 24 fps → 360° shutter ≈ a 600 px smear: a real whip
  ```
  There is no hard cut: the seam (at x = W − Dout when the speed peaks) is hidden inside the smear. Check render time: HF sets samples to about one per 2 px of smear when that exceeds 32. If it is too slow, pre-render the strip as video.
  - For footage outside HF, pre-render a physically correct smear with `cv2.blur(frame, (L_i, 1))` (horizontal box) per frame from the velocity curve.
  - Avoid OpenCV `GaussianBlur` with `sigmaY=0`: OpenCV then sets sigmaY = sigmaX.
  - Or use `ffmpeg gblur=sigma=σ:sigmaV=0` (horizontal only, per ffmpeg's own help; a Trac ticket reports that old builds ignored sigma=0 combined with sigmaV>0), or `dblur=angle=θ:radius=r`.
  - For SVG overlays, `<feGaussianBlur stdDeviation="σx 0">`. MDN: "If stdDeviation is 0 in only one of X or Y, then the effect is that the blur is only applied in the direction that has a non-zero value." Widen the filter region (`x="-30%" width="160%"`) for large σ.
- **Numbers.** 0.13–0.3 s, so 3–7 frames at 24 fps. Sharpen in about 0.13 s (3 frames). Blur ∝ velocity.
- **Sources.** HF `motion.md`; HF motion-blur guide; Adobe "invisible cut"; MDN `stdDeviation`; ffmpeg 6.1 `-h filter=gblur|dblur`.
- **Confidence.** High for the mechanisms. Medium for the values, which are vendor-measured.

### 1.4 Natural (object) wipe: something passes the lens

- **What and why.** An object or person in the shot fills the frame and hides the cut: a door, a passing vehicle, a walker, a hand. Adobe: "a character walking toward the lens until the scene is completely dark."
- **Rules from editors (Videomaker).**
  - "the shorter length of time the wall blocks the lens in the transition, the more effective the technique".
  - Match the blocking object "with something similar in color, brightness, shape, size, or context in the following shot".
  - The wipe "should be invisible to the viewer".
  - A PremiumBeat tutorial (not opened) advises choosing an object that crosses the entire frame, so no gaps remain to mask.
- **In our stack.** Mixkit clips offer natural wipers: traffic seen from above, a key handed through the window (the arm crosses the frame), a car passing at sunset.
  1. Build a matte of the wiper. Options: HF `remove-background` for people and arms; SAM 2 for objects (slow on CPU); `lumakey` or a threshold for dark bodywork against a light sky.
  2. Grow the matte (`cv2.dilate` with a kernel that grows over 3–5 frames) so it reaches full frame just after the object covers about 50% of it.
  3. Composite with ffmpeg:
  ```bash
  ffmpeg -i A.mp4 -i B.mp4 -i matte.mp4 -filter_complex \
   "[1:v]format=yuva420p[b];[2:v]format=gray[m];[b][m]alphamerge[bm];[0:v][bm]overlay=format=auto,format=yuv420p" \
   -c:v libx264 -crf 16 wipe.mp4
  ```
  `alphamerge` copies the luma of the 2nd input into the alpha of the 1st, per ffmpeg's help. A brand variant: the wiper is our own object, the label pill or a word card, growing past the frame (HF "object becomes the world": 0.65 s ease-in-out, corner radius shrinking).
- **Sources.** Videomaker "Wipers au naturel"; Adobe "natural wipe"; ffmpeg help.
- **Confidence.** Medium (craft). Pipeline: high (tools).

### 1.5 Luma and shape mattes, including a wipe on the brand angle

- **What.** The next shot is revealed through a shape or through the luminance of an image: a headlight flare, the sky in a windscreen.
- **In our stack.**
  - Shape: `clip-path: circle()` or `polygon()`. HF "iris from the click" opens in 0.15 s.
  - Luminance: ffmpeg `maskedmerge` (base, overlay, mask) or `alphamerge` with a grey matte built from the B-roll's own light, e.g. `format=gray,curves` or `lumakey=threshold=…:tolerance=…:softness=…`.
  - **Brand-angle wipe (original).** The arrow in the official symbol rises at **31.7°**, derived from the SVG: base midpoint (1199.5, 1102) to tip (1640, 830); the two edges sit at 27.2° and 38.4°. CSS gradient angles are measured clockwise from "to top", so this direction is `58.3deg`:
  ```css
  .next { -webkit-mask-image: linear-gradient(58.3deg, #000 calc(var(--p)*100%), transparent calc(var(--p)*100% + 1.5%));
                  mask-image: linear-gradient(58.3deg, #000 calc(var(--p)*100%), transparent calc(var(--p)*100% + 1.5%)); }
  ```
  Tween `--p` from 0 to 1 in GSAP. The gradient line spans the box corners, so p = 1 always clears the frame. Mask an inner wrapper, never the timed `<video>` (HF "crop or mask reveal").
- **Sources.** ffmpeg 6.1 help (`maskedmerge`, `alphamerge`, `lumakey`); HF `motion.md`; official logo SVG `video/assets/brand/official/utopicar-symbole-couleur-fond-sombre.svg`.
- **Confidence.** High (mechanism). Brand angle: measured.

### 1.6 J and L cuts (sound bridges)

- **What and why.** The sound of the next shot starts before its picture (J), or the sound of the last shot continues over the next picture (L). Adobe classes these as "audio match cuts". They are the main tool for turning a jump between face and B-roll into speech that flows.
- **In our stack.** The voice already runs continuously on its own audio track in HF. The question is where the picture cuts relative to the word.
  - Return to the face so the picture arrives just before the stressed word, not at the start of the sentence.
  - Leave the face on a complete thought.
  - Murch (interview): cut "a frame or two before the actor actually blinks". A cut during a blink "is not a good thing". A cut just after a blink "creates a little stutter which goes along with surprise". Caveat: "IF the actor is in character". An AI avatar's blinks may not be thought-driven, so check them by eye.
  - Detect blinks with MediaPipe Face Landmarker blendshapes (`output_face_blendshapes=True`; 52 scores) and words with Scribe or WhisperX. Snap face returns to 1–2 frames before a blink if one falls within ±4 frames of the cue (the ±4 window is derived).
- **Sources.** Adobe "Match cut"; Murch in ProVideo Coalition "Art of the Cut"; MediaPipe Face Landmarker docs; HF contract rule 7.
- **Confidence.** Murch quote: high. Blink automation: derived.

### 1.7 Smash cut and dip cut: emphasis without a crossfade

- **What.** A smash cut is a hard cut into a contrasting picture or sound at full intensity, for surprise. A **dip cut** (HF): "the outgoing frame darkens ~40% for 3 frames before a hard cut, so the cut reads as meant". It gives the softness of a dissolve with no crossfade.
- **In our stack.** Animate the exposure of the outgoing clip: `--hf-color-grading-exposure` is animatable by GSAP through media-treatment. A smash cut belongs on a reversal, for example the "208" item. The house brief already puts a buzz on it, and the sound carries the smash.
- **Sources.** HF `motion.md`, `media-treatment --capability=animation`.
- **Confidence.** Medium.

### 1.8 Speed ramps, built on optical flow

- **What and why.** Normal speed slows into slow motion on the moment that matters, then speeds back up. Slow motion only looks smooth when there are enough real frames. Stock clips at 24–30 fps slowed to 25% repeat each frame 4×, which reads as judder.
- **In our stack.**
  1. Interpolate first with Practical-RIFE (`inference_video.py --video=broll.mp4 --multi=4`; model 4.25 "recommended by default for most scenes"; MIT licence).
  2. Then remap time by integrating a speed curve. Using HF's rate lane alone repeats frames.
  ```python
  import numpy as np
  fps, n = 24, int(1.6*24); t = np.arange(n)/fps
  ss = lambda x: np.clip(x,0,1)**2*(3-2*np.clip(x,0,1))                    # smoothstep
  v = 1 - 0.75*ss((t-0.35)/0.25) + 0.75*ss((t-1.05)/0.25)                   # 1 → 0.25 → 1 (×source speed)
  s = np.concatenate([[0], np.cumsum(v[:-1])/fps])                           # source time = ∫ v dt
  idx = np.round(s*fps*4).astype(int)                                        # frames of the ×4 RIFE sequence
  ```
  Put the slowest point on the word being stressed. HF's music guide: a move that must land on a hit starts 40–190 ms early, and the hit itself is a 0 ms `tl.set`. Rule (derived): slow-motion factor ≤ interpolation factor, i.e. source fps × interp ≥ 24 / speed.
- **Sources.** Practical-RIFE README; HF `motion.md` (rate lane, constant rate 0.1–10); HF `film.md` (hit timing). ffmpeg `minterpolate` (`mi_mode=mci`, `mc_mode=aobmc`, `me_mode=bidir`, `vsbmc=1`) is a CPU fallback that tears on complex motion.
- **Confidence.** High (tools). Curve: derived.

### 1.9 Camera move carried across the cut

- **What.** The move of shot A continues in shot B: the same direction, a speed that keeps building, or an element "carried" from one world into the next.
- **HF transitions measured on its films** (all crossfade-free):
  - carry across: the result shrinks 1 → 0.6 with blur peaking at 6 px mid-move and lands inside the next scene as it builds around it;
  - colour flood: the hero object stays while the ground changes colour in about 0.4 s `power2.inOut`;
  - morph: one container widens into the next, about 110 → 880 px in 0.2 s `power3.out`, with a horizontal blur 12 → 0;
  - blur swap on one stage: out in 0.13–0.2 s with about 8 px blur, in sharpening in 0.13 s, the ground never cuts.
- **Our use.** The avatar shots are static and get no face zoom, so the carry happens in the graphics layer. The label pill leaves along the B-roll's flow vector (from `flowscan.py`), or the number badge travels into the next item's pill.
- **Confidence.** Medium.

### 1.10 Jump cuts in the avatar: morph cut, smooth cut, and better options

- **How pros do it.**
  - **Premiere Morph Cut** (Adobe): best on single-subject interviews with "a fixed shot" and "a static background". Hands, body movement, background motion, tight framing and profiles break it. Choose "short, logical gaps" with similar head placement, find them on the waveform, and start and end the morph near the peaks of the last and first words to protect lip-sync. Adobe gives no duration beyond "shorter".
  - **Resolve Smooth Cut** (optical flow): editors set it to about 2–6 frames instead of the default 1 s. This comes from search summaries of tutorials; the manual mirror I tried returned 404.
- **In code.** Interpolate between the last frame of A and the first frame of B: RIFE `--img` on a two-frame folder, or FILM, which is "designed for near-duplicate photos" (Apache-2.0). Keep it to 2–4 frames and only when the head moves little. Check the face frame by frame, because interpolation smears teeth and eyes (a lip-sync risk already noted in the house research).
- **Better options for our footage.**
  1. Cut between the close and the wide shot. That changes the image size, which is Stinson's rule, and it is a real second camera, not a zoom.
  2. Cover the jump with the B-roll the voice names, as the house already does.
  3. Cut on a blink, 1–2 frames before it (Murch).
  4. Use the velocity-matched whip of §1.3 between two takes with the same framing.
- **Confidence.** Medium.

### 1.11 What separates a premium transition from a cheap one (synthesis)

Premium:
1. it has a cause on screen (an object, a movement, a sound);
2. speed and direction match across the seam, and the cut falls on the fastest frame;
3. the point of interest lands where the eye already is;
4. there are few kinds of transition, reused consistently (3–5 per film);
5. blur is directional, follows the real path and is proportional to velocity;
6. the hit lands on the sound with a 0 ms set, after moves that started 40–190 ms early;
7. it is short (a whip in 3–7 frames; a natural wipe that blocks as briefly as possible);
8. it leaves nothing behind: text exits before the cut or is cut hard (house rule).

Cheap: a preset effect with no cause. The HF registry ships "glitch", "chromatic-radial-split", "flash-through-white", "cinematic-zoom" and light-leak or flash overlays; all are available and all are off-brief. Others:
- a static outgoing frame followed by a sliding incoming frame (speed mismatch);
- isotropic blur standing in for motion blur;
- the same transition at every seam;
- a whoosh on every cut;
- dissolves where no time passes (Videomaker).

Confidence: medium (convergent practitioner and vendor sources). The list is mine.

---

## 2. Motion-design craft

### 2.1 Animation principles applied to type and UI

*The Illusion of Life* (Thomas & Johnston 1981, via Wikipedia's faithful summary):
- anticipation "prepare[s] the audience for an action";
- follow-through and overlapping action means parts move at different rates and drag "a few frames" behind;
- slow in / slow out means "more pictures… near the beginning and end of an action";
- "most natural action tends to follow an arched trajectory";
- secondary action must "emphasize, rather than take attention away from the main action";
- timing is "the number of drawings or frames for a given action".

How this maps to type in our house style:
- **Anticipation**: 2–4 frames of counter-move (−6 to −10% of the amplitude; house `motion-pro.md`), on containers only.
- **Overlap**: secondary elements trail by 0.03–0.07 s (house); the next element starts when the previous one is 30–50% done (HF).
- **Arcs**: only for objects (badge, arrow); never curve lines of reading text.
- **No overshoot on type**: house rule. HF: "Position and size may bounce; opacity and colour never do." Material: effects springs exist so a value such as alpha "shouldn't bounce or oscillate above 100%".

Confidence: high.

### 2.2 Curves: choose eases by "time to 90%" and by the 24 fps first frame

**Ease by role** (HF):
- an arrival lands on a long tail (`expo.out`, `power4.out`);
- a camera move or a colour flood eases both ways (`power2.inOut`);
- a zoom-through or an exit accelerates (`power3.in`);
- exits are 40–50% shorter than entrances;
- "The same `power2.out` at 0.5 s on everything is the flat default that makes a film feel generated."

**Design-system tokens** (AOSP `MotionTokens.kt`):
- emphasized decelerate `(0.05, 0.7, 0.1, 1)`, emphasized accelerate `(0.3, 0, 0.8, 0.15)`, standard `(0.2, 0, 0, 1)`;
- durations 50–200 / 250–400 / 450–600 / 700–1000 ms;
- Material Android doc: "duration should increase as the area/traversal of an animation increases".

IBM Carbon:
- productive standard `(0.2, 0, 0.38, 0.9)`, expressive standard `(0.4, 0.14, 0.3, 1)`;
- entrances `(0, 0, 0.38, 0.9)` / `(0, 0, 0.3, 1)`, exits `(0.2, 0, 1, 0.9)` / `(0.4, 0.14, 1, 1)`;
- durations 70 / 110 / 150 / 240 / 400 / 700 ms, on a non-linear scale by size.

**Derived tool 1: time to 90%** (computed). How early an ease commits to its target:

| ease | t at 50% | t at 90% | start speed (× linear) |
|---|---|---|---|
| expo.out | 0.10 | 0.33 | 6.9 |
| power4.out (quint, GSAP naming) | 0.13 | 0.37 | 5 |
| power3.out (quart) | 0.16 | 0.44 | 4 |
| power2.out (cubic) | 0.21 | 0.54 | 3 |
| M3 emphasized decelerate | 0.06 | 0.36 | 14 |
| utopicar `--ease-doux` (.2,.8,.2,1) | 0.13 | 0.39 | 4 |
| Carbon expressive entrance | 0.24 | 0.63 | 3.3 |

**Use**: schedule a label so that its 90% point lands on the stressed syllable. Its start is then `t_syllable − 0.33·T` for expo.out.

**Derived tool 2: the 24 fps first-frame jump.** Share of the total travel covered on the very first frame:

| ease | 0.25 s | 0.4 s | 0.6 s | 0.8 s |
|---|---|---|---|---|
| expo.out | 0.69 | 0.51 | 0.38 | 0.30 |
| power3.out | 0.52 | 0.36 | 0.25 | 0.19 |
| power2.out | 0.42 | 0.28 | 0.19 | 0.15 |
| M3 emphasized decelerate | 0.74 | 0.63 | 0.53 | 0.46 |

UI curves were designed for 60–120 Hz screens. At 24 fps they make an element jump half its travel in one frame, which reads as a pop or a glitch, not a motion. HF says the same in words: "Entrances that are too snappy read as glitches". **Rule (derived):** either turn on motion blur (the first frame becomes a smear, which is how cinema handles it), or keep the first-frame share ≤ about 0.3. Examples: power3.out ≥ 0.6 s, power2.out ≥ 0.4 s, expo.out ≥ 0.8 s.

**Bespoke curves.** GSAP `CustomEase.create(id, "M0,0 C…")` accepts SVG cubic path data or a 4-value cubic-bezier. `getSVGData()` plots it. Create once at load. After Effects' default easy ease uses 33.33% influence (community answer, not Adobe docs).

Confidence: tokens high; derived tables computed.

### 2.3 Springs chosen by physics, by weight and by property

**Sources.**
- AOSP source (`StandardMotionTokens.kt`, `ExpressiveMotionTokens.kt`), mass = 1, k = stiffness:

| token | Standard (ζ, k) | Expressive (ζ, k) |
|---|---|---|
| fast spatial | 0.9, 1400 | 0.6, 800 |
| default spatial | 0.9, 700 | 0.8, 380 |
| slow spatial | 0.9, 300 | 0.8, 200 |
| fast / default / slow effects | 1.0, 3800 / 1600 / 800 | same |

- Material doc on choosing: "a speed should be chosen based on the animation's size or distance covered"; "a spatial or effects type should be chosen depending on the property being animated". Small items use the fast spring, full-screen transitions the slow spring, everything else the default. Pair a spatial spring for shape with an effects spring for colour.
- Apple (WWDC23 "Animate with springs"): springs are specified by perceptual duration d and bounce. stiffness = (2π/d)². The damping formula on screen reads "1 − 4π × bounce ÷ duration". Checked against critical damping 2√k = 4π/d, the consistent form is c = 4π(1 − bounce)/d, i.e. **ζ = 1 − bounce** (derived).
  - "When you're not sure, use a spring with bounce 0."
  - About 15% bounce gives a brisker tail; about 30% is noticeably bouncy.
  - "you should be cautious about using values higher than around 0.4".
  - Springs keep velocity when retargeted.
- HF: ζ 1.0 never bounces; 0.7–0.85 "reads premium"; 0.4–0.6 playful; under 0.3 a cartoon.

**Derived numbers for 24 fps** (computed): overshoot = e^(−πζ/√(1−ζ²)).

| ζ | overshoot |
|---|---|
| 0.95 | 0.007% |
| 0.9 | 0.15% |
| 0.85 | 0.63% |
| 0.8 | 1.5% |
| 0.7 | 4.6% |
| 0.6 | 9.5% |
| 0.5 | 16% |

Apple perceptual duration d = 2π/√k: k 1400 → 0.17 s, 700 → 0.24 s, 380 → 0.32 s, 300 → 0.36 s, 200 → 0.44 s.

2% settle in frames at 24 fps: (0.9, 1400) 3.0; (0.9, 700) 4.3; (0.9, 300) 6.5; (0.8, 380) 4.6; (1.0, 1600) 3.5.

Material's springs are tuned for UI and settle in 3–6 frames, which is a pop at 24 fps. Film elements usually need d = 0.3–0.6 s.

**Method (no presets):**
1. Pick d from size and distance: about 0.22–0.25 s for a 74 px badge, 0.3–0.35 s for an 800 px pill, 0.45–0.6 s for full-frame cards and wipes. Use a sub-linear law (Carbon calls its scale "non-linear"; d ∝ √distance is my working assumption).
2. k = (2π/d)².
3. Pick ζ by property and content:
   - ζ = 1 for opacity, colour and blur (effects);
   - ζ ≥ 0.9 for type, so overshoot ≤ 0.15%: 0.3 px on a 200 px move, invisible;
   - ζ ≈ 0.8 for non-type shapes that should "settle" (1.5%, i.e. 3 px on 200 px);
   - ζ ≤ 0.6 only for a mascot.
4. Check the overshoot in pixels at phone size (the house 360 px test).
5. Express weight through d (lower k), not through more damping.

```js
// seek-safe closed form: x(t) from 0 → 1 (t in s since start)
function spring(t, d = 0.32, z = 0.9) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI / d;                                     // ω0 = √k
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);        // critical damping
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
// GSAP: tl.to(el, { x: 0, duration: T, ease: p => spring(p * T, 0.32, 0.9) }, t0)  with T ≈ 2·d
```

Confidence: tokens and formulas high; the method is derived.

### 2.4 Stagger and overlap

- **GSAP stagger.** `each` is a fixed gap; `amount` is a fixed total split among the targets. Options: `from: "start"|"center"|"edges"|"random"|"end"|index`, `grid: "auto"`, `axis`, and an `ease` that "distributes the start times". Use `amount` when the number of items changes but the phrase must fit a beat. Use `from: "center"` for a centred title. A `power2.in` stagger ease accelerates the cascade into the key word. Avoid `"random"` unless seeded: HF forbids unseeded randomness.
- **Values** (HF): letters one frame apart, words 60–120 ms, list items 40–80 ms. The next element starts when the previous one is 30–50% done: "fully sequential looks robotic, all at once looks cheap".
- **For anything spoken, don't stagger by a constant.** Each word appears at its spoken onset from the transcript. A constant stagger only applies to unspoken text.
- **Confidence.** High.

### 2.5 Kinetic type synced to words and syllables

- **What.** Type that reveals on the syllables of the voice, karaoke-like, for one emphasis word, not for every caption.
- **In our stack.**
  - Character timings: WhisperX `align(..., return_char_alignments=True)` (wav2vec2 forced alignment; French among the defaults; words containing characters outside the model's dictionary, such as "2014." or "£13.60", get no timing). ElevenLabs STT reportedly accepts `timestamps_granularity=character` (third-party docs only, **verify** in the official reference).
  - Group the characters into syllables around vowel nuclei. Pyphen hyphenation points only approximate French syllables (derived).
  - Fill each syllable with a `background-clip:text` gradient whose stop moves with time, or a `clip-path: inset()` sweep along the 31.7° brand axis.
  - HF reference values: per word blur 6 → 0 px with opacity in 0.13 s, 0.067 s apart; per word grey → ink 0.07–0.1 s apart with no position change; per letter for a name 0.1 s apart, opacity 0.3 → 1; slot-machine roll at about 0.1 s per roll. A landed title is "dead still".
- **Confidence.** Tools high; the syllable grouping is derived.

### 2.6 Motion blur on graphics

- The house already renders sub-frame blur (`MB=8`, shutter 180° and 360° on fast gestures). The fluidity of its nine reference ads measured a sharpness ratio of 0.22–0.49 at peak speed.
- HF: `data-motion-blur="on"`; shutter 240° by default, 720° "strong"; samples ≥ 32 or about 1 per 2 px of smear; `data-motion-blur="off"` per subtree; check with `check` (`motion_blur_filter_fallback`, …).
- Rule: derive the shutter from the speed you want to read (§1.3). Text-sized movers peak at 6–12 px of blur; full-frame movers at 15–20 px.
- Confidence: high.

### 2.7 Text behind the subject

- **What and why.** A big word sits between the background and the person. Depth then reads instantly, which is the "magazine cover" effect. CapCut's method is the canonical three-layer stack: original video, text, cutout of the person on top.
- **In our stack** (HF `captions.md`):
  - stack `<video>` → word → `remove-background` WebM, ordered by z-index;
  - mark the cutout `data-layout-allow-occlusion`;
  - "A big word behind the head reads best 30–55% covered: under about 15% it floats, over about 65% it is eaten";
  - lay out again when a content word is 80% covered;
  - "Measure the rendered word boxes against the matte over each caption's own time window (heads move…)";
  - the matte drops thin parts and flickers on held objects (here: hands, banknotes).
  ```python
  # coverage of a word box by the person matte, per frame of its window
  cov = (alpha[y0:y1, x0:x1] > 127).mean()      # target 0.30–0.55
  ```
- **Our use.** The hook word (the euro amount) behind the avatar's head in the wide shot, where the roof leaves room above the head. Never over the mouth.
- **Confidence.** Medium-high.

### 2.8 Tracked leader lines and callouts that draw on

- **What.** The top label pill stays inside the safe zone. A thin line draws from the pill to the real part in the B-roll (the belt, the rust, the gauge), and its end follows the part. This is telestration as used in sports and F1 graphics.
- **In our stack.**
  1. Seed points inside a box you choose on the first frame, then track them with OpenCV Lucas–Kanade using the official sample parameters: `maxCorners=100, qualityLevel=0.3, minDistance=7, blockSize=7`; `winSize=(15,15), maxLevel=2, criteria=(EPS|COUNT, 10, 0.03)`.
  2. The anchor is the median of the surviving points. The official sample never re-detects, so lost points simply disappear.
  3. Smooth with `scipy.signal.savgol_filter(window=7, poly=2)` and export `{t, x, y}`.
  4. In GSAP, read the anchor as a function of `tl.time()` (deterministic) and draw the line with `stroke-dasharray`/`dashoffset` on `pathLength="100"`, or DrawSVG (free). Draw it in 0.25–0.35 s on expo.out, and detach before the cut.
  - HF gotchas: "`getTotalLength()` can return 0 before layout; give line draw-ons a fallback". Hide a round-capped line with `dasharray="100 120"`, `dashoffset="110"`, not dash = gap = offset. "A point in an image guessed directly misses by 16–24% of the frame": use `scripts/locate.mjs` (9×9 grid, then 6×6, about 2% error).
- **Confidence.** High (tools). Design: derived.

### 2.9 Freeze frame with a cut-out highlight

- **What.** Stop the image on the decisive moment (the cracked belt, the rust), cut the object out, and push the rest back. Sports and creator editors use it as a "beat".
- **In our stack** (HF recipe "Freeze-Frame Cutout"): `ffmpeg -ss <s> -i src -frames:v 1 still.png`, then `remove-background still.png -o cutout.png`. "This requires a real alpha matte; decoration may not conceal a poor subject edge."
- **Brand variant instead of HF's "paper and tape" dressing:**
  - pre-render a darker, desaturated plate in Python, since HF forbids CSS filters on footage;
  - draw the cutout's contour with a single cream line `#F4F1EC` (the logo is one line) using the house `cutout.py`, which already exports a vector contour;
  - hold 0.4–0.8 s (HF: holds 0.3–0.75 s before a payoff).
  - The HF recipe animates the cutout with `back.out(1.35)`: avoid it for anything that carries text.
- **Confidence.** Medium-high.

### 2.10 Parallax from 2-D stills (2.5D)

- **What.** Split one still into depth layers and move them at different speeds. A camera seems to move inside a photo.
- **In our stack.**
  1. Depth Anything V2 **Small** (Apache-2.0; the larger models are non-commercial).
  2. Two or three layers by depth threshold.
  3. Inpaint the background holes (`cv2.inpaint` for small gaps).
  4. Speeds inversely proportional to depth. The house rule from HK5: the background moves 2–3× slower than the subject.
  - Video Depth Anything (ByteDance, CVPR 2025) is the temporally consistent version for video. Check its licence before use.
  - 3D Ken Burns is non-commercial: excluded.
  - Use parallax only on B-roll stills, never on the face.
- **Confidence.** High (licences, tools). Values: house.

### 2.11 Camera shake on impacts, kept subtle

- **What.** Shake sells a physical hit: a slammed bonnet, an engine catching. Overused, it reads as a preset. The best references the house studied ban shake outright (`motion-pro.md`).
- **Principle (Eiserloh, GDC 2016 "Juicing Your Cameras With Math", via a code implementation that follows the talk).**
  - Each impact adds "trauma" in [0, 1], which decays linearly.
  - Shake amplitude = trauma², so small hits barely show.
  - Offsets come from smooth Perlin noise, not random values.
  - Bevy's constants: decay 0.5/s, exponent 2, max angle 10°, max translation 20 px, noise speed 20, +0.4 trauma per hit. Those are game-scale values.
- **For video (derived).**
  - Couple trauma to the SFX envelope: trauma += peak level of the impact sound, normalised. The shake is then synced and proportional by construction.
  - Cap at about 0.5% of the frame width (about 5 px) and 0.3°.
  - Decay over 3–5 frames.
  - Shake a wrapper of the B-roll only, never the face shots.
  - GSAP `CustomWiggle` gives deterministic `easeOut`/`anticipate` wiggles. Avoid `type:"random"`: the docs don't say whether it uses `Math.random`.
- **Confidence.** Principle: medium. Video values: low (derived).

### 2.12 Alternatives to punch-in zooms (no zoom on the face)

Six options, none of which scales the face:
1. **Cut between the close and the wide shot** of the same take. That is a change of image size (Stinson), done the way a two-camera interview is.
2. **Picture-in-picture or stacked layout** when B-roll would cut away from the speaker. Guo et al. (6.9 M sessions) found talking-head videos more engaging than slides alone and suggested "a picture-in-picture view might work better" than jarring switches. HF portrait PiP: 312×555 at (738, 28).
3. **Background-only emphasis.** Use the `--background-output` plate to darken or desaturate the background by 15–25% while the person stays untouched, pre-rendered. It is a "spotlight", not a zoom. The 15–25% range is derived.
4. **Focus-pull illusion.** A pre-blurred background plate composited under the matte, blended over 6–10 frames.
5. **Graphic emphasis on the word**: text behind the subject, an underline written by the logo line, or the highlighter band (HF: `background-size` with `box-decoration-break: clone`).
6. **Cut to a full-screen word card**, as the house already does, built on the brand-angle wipe.

Confidence: medium.

### 2.13 One persistent counter badge instead of pop + ring

- **What and why.**
  - The house principle is an "objet porteur": one object that becomes the next.
  - HF lists "click rings" among defaults that look generated, and the house's best references ban shock-wave rings.
  - One badge that persists from item to item and rolls its digit upward (up = progress, the arrow's direction) builds continuity. A new pop each time does not.
- **In our stack.**
  ```html
  <b class="badge"><span class="reel"><i>1</i><i>2</i><i>3</i><i>4</i></span></b>
  ```
  ```css
  .badge{display:inline-block;width:74px;height:74px;border-radius:50%;overflow:hidden;background:#FF5A1F}
  .reel{display:block} .reel i{display:block;height:74px;line-height:74px;font-style:normal;text-align:center}
  ```
  ```js
  // item n lands on the frame the gesture completes (tHit); ζ=1, no overshoot on the digit
  tl.to('.reel', { y: -(n - 1) * 74, duration: 0.36, ease: p => spring(p * 0.36, 0.2, 1) }, tHit - 0.12);
  ```
  - Find `tHit` with MediaPipe Hand Landmarker (21 landmarks, VIDEO mode): the first frame where the expected number of fingers is extended (fingertip above the PIP joint). The brief already syncs ①②③ to the index, two fingers and three fingers.
  - Keep the pitch rising with the number, as the house already does (+0/+2/+4/+5 semitones). Spence (2011): "people consistently match high-pitched sounds with small, bright objects that are located high up in space".
- **Confidence.** Principle: medium-high. Implementation: derived.

---

## 3. Captions in 2025–2026

### 3.1 What the evidence says

- **Captions help everyone.** Gernsbacher's review of more than 100 studies: "captioning a video improves comprehension of, attention to, and memory for the video", for hearing adults as well. Errors in automatic captions reduce the benefit. Confidence: high.
- **Showing one word at a time has a cost.** RSVP studies (Schotter, Tran & Rayner, as reported by APS) show that blocking regressions and parafoveal preview lowers comprehension, "for both difficult and simple sentences". Readers look back 10–15% of the time. **So show short groups (2–5 words) with the active word highlighted.** A single word alone on screen is for emphasis only. Confidence: medium-high.
- **Professional timing rules** (Netflix, primary):
  - minimum event 20 frames (5/6 s at 24 fps), maximum 7 s, 2 lines maximum;
  - in-time on the first frame of audio or within 1–2 frames;
  - gaps are "either 2 frames or half a second or more";
  - at 24 fps, half a second is 12 frames: a subtitle starting within 12 frames after a shot change starts on the shot change, and an out-time within 12 frames before a shot change is extended to 2 frames before it;
  - do not split a noun from its article or a verb from its subject pronoun;
  - avoid on-screen text.

  Confidence: high.
- **HF caption practice:**
  - groups of 2–3 words for high energy, 3–5 conversational, 4–6 calm;
  - break at a sentence end, a pause ≥ 150 ms or the word limit;
  - one group visible at a time, with a hard kill after its exit (`tl.set(group,{opacity:0,visibility:"hidden"},end)`);
  - "A caption at exactly 0 s looks pre-existing: start 0.1–0.3 s in";
  - portrait position about 600–700 px from the bottom, never over the face;
  - "Fade the group or its words, not both: the opacities multiply and read as a pop";
  - plain subtitles over footage brighter than about 60/255 get "a scrim sized to the text (30–40%), never a full-width bar";
  - `fitTextFontSize` with base 78, minimum 42, `maxWidth` 900 portrait.

  Confidence: medium (vendor, measured).
- **Speaker-following placement** (Kurzhals et al., CHI 2017, 40 participants; **abstract seen in search results only, the ACM page returned 403**): subtitles placed near the current speaker gave more fixations on relevant image regions and shorter saccades. Confidence: low-medium.
- **Platform research** (TikTok's own studies, as published by TikTok): "90% of ad recall impact is captured within the first six seconds". Text overlays "increase view time, recall, and likability" (no figures). Creators: Jenny Hoyos says Reels favoured visual content with subtitles because people watch muted.

### 3.2 What creators use now (weak data, label it so)

- OpusClip analysed 12–13.5 M clips from Jan–Mar 2026: 80.2% captioned, 78.6% animated captions, about 1.6% static. Its denominators are inconsistent and the sample is biased by the tool's own defaults: it auto-generates animated captions. Confidence: low.
- Word-by-word with an active-word highlight is named "dominant" by every vendor blog I saw (search results). No independent study.
- Practitioner opinions (Video Builders newsletter, Sept 2023):
  - the Hormozi style is "bold font, color tracking to speech, emojis, and tilts";
  - more than 2,500 Fiverr sellers offer "Alex Hormozi Captions";
  - "Even Hormozi doesn't use that caption style anymore";
  - Starter Story's creative director: "People should view captions like subtitles on a Netflix show", "it shouldn't take away from the video itself", "don't use emoji's — I scroll past every time I see".
  
  Confidence: low-medium.

### 3.3 What now reads as dated or cheap (with the strength of evidence)

- Preset "viral" captions: per-word colour tracking with tilts and pops, bouncing scale on each word, emoji on every line (opinion sources above; low-medium).
- Captions that bounce or overshoot in scale. For us this also breaks the house rule.
- A full-width black bar under captions (HF: "never a full-width bar"; medium).
- Heavy glow or halo shadows around words. They read as glow on UI. HF prefers a scrim sized to the text (medium).
- Captions that cross a cut or flicker within 3–11 frames of one (Netflix logic; high as a pro norm).
- Single words flashing one at a time for whole sentences (RSVP evidence; medium-high).

### 3.4 A caption system for utopicar, with the reasons

1. **Groups of 2–4 words** at the voice's pace (the house measures about 2.5 words/s in French). Each group stays ≥ 20 frames (Netflix). Break on syntax, never between article and noun (Netflix).
2. **Active word**: a colour step from 70% ink to 100% ink, with the brand orange only on one meaning-carrying word per sentence (HF: "One highlighted word in the accent colour, which carries meaning"). No scale on the active word, so nothing bounces. The current file uses `#F2742B` while the brand is `#FF5A1F`: use one orange.
3. **The container snaps to cuts, the words stay on the voice** (original, adapted from Netflix). If a group's box would appear within 12 frames after a cut, it appears on the cut. If it would disappear within 12 frames before a cut, it holds until 2 frames before the cut. The words inside still light up at their spoken times, so lip-sync accuracy is untouched.
   ```python
   def snap(g_in, g_out, cuts, fps=24):
       for c in cuts:
           if 0 <= (g_in - c)*fps < 12:  g_in = c              # opens just after a cut → open on the cut
           if 0 < (c - g_in)*fps < 12:   g_in = c - 12/fps     # opens just before a cut → open ≥ 0.5 s earlier
           if 0 < (c - g_out)*fps < 12:  g_out = c - 2/fps     # closes just before a cut → hold to 2 f before it
       return g_in, g_out                                       # then re-check overlaps with the previous group
   ```
4. **Position** follows the face but never covers it. From a face box per frame (MediaPipe or OpenCV YuNet): caption top ≥ chin + 0.15 × face height, clamped inside the house band (bottom 440 px) and HF's band (≤ 1330 px for text). Move only between groups, never mid-group.
5. **Size**: measure the text itself. HF: base 78, minimum 42, nothing under 28 px; quiet lines 2.5–4% of the height, i.e. 48–77 px. The current 46 px Satoshi 700 sits at the bottom of that range. Test at 360 px width (house).
6. **Legibility without glow**: replace the 46 px dark halo with a 2–4 px shadow. Add a text-sized scrim (30–40%) only where the measured luminance behind the text is above about 60/255 (HF thresholds).
7. **Emphasis words** keep the house's Instrument Serif italic. That makes two typefaces plus the logo, which respects the house "one display + one UI" rule.

### 3.5 Implementation notes

- SplitText v3.13 options: `type:"words,lines"`, `mask:"lines"` (wraps each line in a clip), `autoSplit:true` with `onSplit()`, and `aria:"auto"`. Wait for fonts with `document.fonts.ready`, which the house already does.
- Fill effects go on the inner span, never on the transformed container (HF).
- Run `scripts/chevauchements.mjs`/`.py` (house) for text-on-text collisions every 0.1 s.

---

## 4. Brand-led motion systems

### 4.1 What studios and design systems agree on

- **"A motion identity is not an animated logo."** A motion system gives "the logic, behaviours and reason for why a brand moves". "Without a system behind it, motion becomes ornamental." "Consistency and time are the two pillars that help motion identities mature into recognizable signatures." (Print, reporting Vucko's work.)
  - Vucko's study asked people to recognise brands from logo motion alone. Disney scored 81%, Uber 14% (often confused with Netflix).
  - Interpretation in the piece: recognition comes from a few iconic behaviours repeated everywhere.
  - Confidence: medium (the study itself is unpublished).
- **DIA (Mitch Paone):**
  - "treat motion as a system rather than an effect";
  - "The idea came first. The software only translated it.";
  - "A brand is defined by how it behaves, not just by how it looks";
  - "design the behavior, then let the software execute it";
  - the aim is "to access potential, not presets";
  - motion added to a system built for static use "yields awkward results";
  - Squarespace (2018) ran on its procedural motion system for about seven years.

  In Creative Boom, DIA gives an example rule written as numbers: "All transitions use 400ms ease-out for expansion, 300ms ease-in for contraction". BUCK describes a cascade: strategy → principles → guidelines → templates; experienced designers need only the principles. Confidence: medium-high.
- **IBM Carbon**: two styles, productive (efficient, "subtle and out of the way") and expressive (reserved for "occasional, important moments"). Curves "reflect the duality of man and machine". Duration scales with the size of the change. Confidence: high.
- **Material**: speed is chosen by size or distance, spring type by property (§2.3). M3 Expressive was backed by 46 studies with more than 18,000 participants (Dezeen, not opened). Google's design notes: "Expressive can mean quiet. And it can also mean loud." Confidence: high / medium.
- **Apple HIG**: "Add motion purposefully, supporting the experience without overshadowing it". "Aim for brevity and precision in feedback animations". Feedback motion should follow expectations. Confidence: high.

### 4.2 Real examples and what they teach

| Brand | What they did | Lesson for us |
|---|---|---|
| Google (2015 identity) | The Dots are "a dynamic distillation of the logotype". Each state has a meaning: listening, thinking, replying, incomprehension, confirmation. Their motion is "rooted in consistent paths and timing… geometric arcs and… a standard set of snappy easing curves." | Derive moving elements from the logo; give each motion one meaning; one easing family. |
| Renault (2021 diamond) | "designed to live in movement". Vidal: "a path between two lozenges… creating… the impression of continuous movement". The flat treatment eases animation in video, digital media and the car's welcome sequence. Sound for its EVs by Jean-Michel Jarre (from 2022). | A line logo is a path to animate; the car brand ties logo motion to a welcome moment. |
| Netflix "ta-dum" | "it had to be really short". Tension and release "in like three seconds". "more cinematic than electronic and computerish". Think Netflix without hearing the word. About 20–30 candidates, one year, the final pick from 5. | A sonic logo is short, story-shaped and avoids tech clichés. |
| Mastercard (2019) | One melody, "distinct and authentic, yet adaptable globally and across genres". Fortune (via search) reports 20 versions growing to 200. It extends to the payment "acceptance sound". | One motif, many arrangements: identity through repetition with variation. |
| Spotify Wrapped | A motion system and toolkit so partners stay consistent (search results). In 2025, motion built in Rive with dummy data, then driven by real user data without rebuilds. | Parameters driven by data, not hand-made variants. |
| Polestar | One typeface, typically "only one size and one weight". Accents "never dominate". "Restrained consistency in the execution" counts as identity. | Restraint is a signature; one accent, used once. |
| Duolingo | Motion principles "make people feel something" and "find a rhythm, so even silent animations have a beat" (LinkedIn via search, **not opened**). Bought the Animade studio (search). | Rhythm without sound. |

Stripe and Airbnb: not verified this session. The Stripe animation post URL returned 404, and Airbnb's "Lava" format appears only on third-party sites.

### 4.3 How studios avoid the template look

1. The idea comes before any effect, and behaviour before form (DIA).
2. Behaviours are written as numbers: durations, curves, directions, colours by role. They are not picked from a preset library (DIA, Colorpark).
3. A few iconic behaviours are repeated everywhere and consistently (Vucko). Novelty belongs in content, not in transition styles.
4. Motion is designed with the identity, not retrofitted (DIA, BUCK).
5. Each motion has a meaning, like Google's states.
6. Restraint (Polestar), and expressive moments only where they matter (Carbon).
7. Parameters derive from the content: Spotify's data, and for us, the voice's timings, the B-roll's measured flow and the gestures.

### 4.4 A utopicar motion grammar derived from the logo (proposal with numbers)

**Vocabulary**
- **Direction θ = 31.7°**, the axis of the arrow measured on the official SVG; its edges sit at 27.2–38.4°.
  - Progress, gain or "this is the right choice" moves along +θ (up and to the right): wipes into the next item, the badge's digit roll, the rise of the verdict.
  - Risk or loss moves along the inverse direction, down and to the left: the 208 ✕ item, a strike-through. Each direction has one meaning, as in Google's states.
  - Camera-like whips between takes stay horizontal, because footage motion must stay plausible.
- **The line.** The car silhouette is one closed path (outer body plus the window cut-out).
  - Draw it at a constant "pen speed", e.g. one full silhouette in 0.6 s at 800 px wide. Keeping that speed constant everywhere is what makes it a behaviour.
  - Uses: the end card; an underline or strike that "drives" under a key word; the contour of freeze-frame cut-outs; the leading edge of the brand-angle wipe.
  - Colour: cream `#F4F1EC` on dark, ink `#1A1310` on light.
- **Colour roles.** Orange `#FF5A1F` only for the verdict and the number of the moment, once per screen (Polestar; the house "one accent" rule). Gain green and loss red only if the brief asks, because the house allows one accent unless justified.

**Behaviour sheet** (durations from size, springs from §2.3; d is the perceptual duration)

| Element | Style (Carbon) | Enter | Exit | Spring/ease |
|---|---|---|---|---|
| Caption group | productive | appears on the cut or at the voice cue; words by colour step | hard kill after a 0.08–0.12 s fade + 4 px blur | effects ζ = 1 |
| Label pill (800 px) | productive | slide 24–40 px along +θ, d = 0.32 s, with motion blur | 0.6 × entrance, along +θ | spatial ζ = 0.9; text ζ = 1 |
| Number badge (74 px) | expressive | persistent; digit rolls upward on the gesture frame, d = 0.2 s | stays | ζ = 1 on the digit; the disc may use ζ = 0.85 |
| Full-screen word card | expressive | brand-angle mask wipe (§1.5), 0.45–0.55 s `power2.inOut` | smash or dip cut (§1.7) | — |
| B-roll entry | productive | natural wipe or velocity-matched whip | cut on the motion peak | — |
| End card | expressive | the line draws the car, the arrow rises along θ, sonic logo | abrupt end (§5.4) | spatial ζ = 0.8 on the arrow only |

**Sound** (Spence: high pitch goes with high, small and bright)
- Rising pitch for ascending items.
- A lower thud for full-frame cards.
- One sonic signature of ≤ 1 s (the current "impact + chime" from the v3 montage), always identical (Vucko's consistency), with only its arrangement varying by context (Mastercard).
- "Cinematic, not computerish" (Netflix): avoid UI blips.

Confidence: grammar derived; its principles medium-high.

### 4.5 Coordinating the sonic and visual logo

- The visual hit is a 0 ms `tl.set` exactly on the sound's transient. Moves start 40–190 ms early and reactions follow 0–45 ms after (HF).
- Measure the alignment on the encoded MP4: the house target is ≤ 3 frames, and the v3 montage measured 1 ms.
- Netflix shows that a 3 s sting is "really short" for a viewer who has opted in. In a 30 s short, keep the sting at ≤ 1 s and never at frame 0 (HF: frame 0 is "never a logo").

---

## 5. Editing rhythm of top short-form creators

### 5.1 What the primary-ish sources actually say

- **MrBeast production memo** (leaked 2024; quotes from a faithful transcription):
  - "The first minute of each video is the most important minute";
  - "Stop telling people what they will be watching and start showing them";
  - "No dull moments in videos";
  - "lots of quick scene changes and highly stimulating simple content that reflects the story";
  - "Me like simple. The simpler the better";
  - "The video endings must always be abrupt to protect retention";
  - "Don't ever signal the end of the video unless it's to build hype for the prize or payoff at the end".

  It covers long-form; the memo doesn't mention Shorts. Confidence: medium.
- **Jenny Hoyos** (Creator Science podcast; YouTube Shorts creator averaging about 10 M views):
  - cutting one final second lifted retention "from 83% to 88%, and the video went flying";
  - endings are abrupt, often on a reaction, with the final line written before filming;
  - the hook is visual, understandable without audio, simple enough to explain to a child (about 5th-grade reading level), then a foreshadow of the ending in ≤ 3 s;
  - her average is about 34 s;
  - TikTok favoured 10–20 s dense videos for her; YouTube favoured slower 34 s stories;
  - "pacing breaks without the pacing actually breaking";
  - her hunch, without data, is that retention matters less than people think and shareability more.

  Confidence: medium (one top practitioner).
- **Kallaway** (podcast summary with transcript excerpts):
  - "Set up, rehook. Set up, rehook. Set up, rehook.";
  - "at the very end, I tried to hook them again with… the ending so that they share it";
  - vary the length of sentences and the delivery;
  - slow podcast pacing fails on TikTok and Reels.

  Confidence: medium-low.
- **Platforms.** YouTube has counted a Shorts view at every start or replay since 31 Mar 2025, with no minimum watch time. The old metric survives as "engaged views", which YPP still uses. So a clean loop now raises the public view count directly (medium-high). TikTok counts replays as views according to secondary sources (low-medium). TikTok's own research: 90% of ad recall within 6 s; the product on screen gives +65% brand affinity and +25% recall (medium).
- **Research.**
  - Guo, Kim & Rubin 2014 (6.9 M sessions): mixing the talking head with slides beat slides alone (problem attempts 46% vs 33%). "Personalization" means a tight frame with direct eye contact. Faster speakers were more engaging (up to 2× within a length bucket; 48–254 wpm, mean 156). The mid-speed, least energetic bucket was the least engaging.
  - Cutting et al. 2011 (160 films, 1935–2010): average shot length fell from about 10 s to under 4 s after 2000. In recent films "shorter shots tend to have more motion" (action r = −.54). Shot-length sequences approach 1/f, the pattern of attention.
  - Stephen Follows' figures (via No Film School): Nolan about 3.5 s per shot, Spielberg about 7 s.

  Confidence: high.
- **HF measured pacing** for vertical: shots of 1–2 s, a new beat every 2–4 s, "the payoff before the swipe". Montages cut every 0.13–0.8 s; shots average 1.8–3 s with motion inside. Hold 0.3–0.75 s before a payoff, played at normal speed. "Any single treatment goes stale after about 6 s." House references (9 ads): 81–94% of frames in motion, longest pause 0.5–1.5 s.

### 5.2 How often the picture should change (synthesis)

- First second: a change every 0.12–0.3 s (house). Then a new visual fact every 1–2 s in the hook and every 2–4 s after.
- **Vary the lengths**: a near-1/f mix of long and short, not a metronome (Cutting).
- Give short shots more motion inside (Cutting).
- A treatment never runs longer than about 6 s (HF).
- Hold 0.3–0.75 s before the payoff.

### 5.3 Face vs B-roll

I found no published ratio from any credible source. A semantic rule follows from the evidence:
- **Face** carries the promise in the hook, judgements and verdicts (trust), and reactions or jokes. Guo: personalization through a tight frame and eye contact.
- **B-roll** shows what the voice names (MrBeast: show, don't tell). It never covers a gesture, a joke or the last word (house brief).
- Use PiP or a stacked layout when switching would be jarring (Guo's suggestion).
- Measure it per video and log it with retention in recette-47, rather than fixing a ratio.

### 5.4 Endings and loops

- End abruptly on the last spoken frame plus the lips closing (2–4 frames). Never signal the end (MrBeast; Hoyos). Detect the closed-lip frame from the `jawOpen` blendshape.
- Make the last state match frame 0: position, motion vector, caption slot (house loop rule). On YouTube every replay is now a view.
- Keep the end card short. The v3 montage's 0.85 s card agrees with Hoyos's one-second cut. Test 0 s against 0.85 s in recette-47.
- Experimental (derived): put the sonic signature's decaying tail under frame 0 at very low level, so the restart feels continuous. Check that it doesn't mask the hook's first word.

### 5.5 Current anti-patterns (and how strong the evidence is)

- Defaults that look generated (HF, medium): breathing, floating or pulsing loops on titles; titles that keep sliding or scaling after they land; a slow creeping scale late in a scene; bounce on UI; click rings; every scene entering the same way; every element fading and sliding up.
- Preset caption styles with emoji and colour tracking (low-medium).
- Long outros and "follow for more" endings (medium).
- Preset glitch, chromatic or flash transitions with no cause (house + HF).
- A sound effect on every cut. The house rule is "un son principal à la fois" (one main sound at a time).

### 5.6 What I could not verify

- No primary written source exists for the editing rules of Iman Gadzhi, Ali Abdaal or Dan Koe. What the web offers is reverse-engineering by tool vendors and freelancers, which contradict each other. For Hormozi only the 2023 newsletter note.
- No official pixel safe zones for TikTok: the Creative Center offers templates only. Meta's 14/35/6% figures appear only on third-party sites. The house union zone stands.
- Not opened:
  - Eiserloh's slides (503) and the BBC subtitle guide (404);
  - Kurzhals 2017 (403) and the Spotify Wrapped 2023 interview (403);
  - Vucko's CommArts interview (503);
  - the TikTok Creative Codes PDF (image-only).

---

## 6. Applying this to the current "4 000 €" montage (read in `scratchpad/montage-4k/tiktok-1`)

1. **The whip between same-framing takes** (`index.html` l.85–88): `#camN` slides in from `xPercent: 9` with `filter: blur(22px)` → 0 in 0.22 s `power3.out`, while the outgoing shot is static.
   - The isotropic CSS blur on footage breaks HF contract rule 11.
   - Speed is 0 on one side of the seam and about 74 px/frame on the other.
   - **Fix**: §1.3, a strip with mirrored eases and HF motion blur (filter tier), or a pre-rendered horizontal box smear.
2. **The number badge** (`clip-1-etiquette*.html`): `scale 2.2→1, rotation −10→0, back.out(1.8)`.
   - Computed, the digit undershoots to **0.868** (13%): a visible bounce on typography.
   - The orange "onde" ring is a generic shock-wave ring.
   - **Fix**: §2.13, one persistent counter badge with a ζ = 1 digit roll, landing on the detected gesture frame.
3. **The label pill**: entrance 0.26 s `power3.out` with blur 10 px → 0 and scale 0.92 → 1. The first frame covers about 50% of the travel (§2.2). Move it along +θ, with d about 0.32 s and motion blur.
4. **Captions**: halos of up to 46 px dark glow, and the active colour `#F2742B` is not the brand's `#FF5A1F`. Apply §3.4: a 2–4 px shadow, a text-sized scrim only where the measured luminance needs it, containers snapped to cuts.
5. **B-roll pushes**: every illustration gets the same linear 1 → 1.03 scale (`ease:"none"`). Give each one a drift along its own measured flow (§1.1) instead, or let it play still.
6. **Word cards** (`clip-1-mots*.html`): entry is opacity plus blur only, with a linear 1.16% push. Enter them with the brand-angle wipe and hold the words dead still once landed (HF titles).
7. **SFX**: a whoosh comes with every filé, and a pop + impact with every badge. Keep one main sound per event, pitched by size and height (§4.4).
8. **Ending**: 0.85 s card, abrupt; keep it, and test the loop variant of §5.4.

---

## 7. Sources opened (by topic)

Editing theory and transitions
- Murch, Art of the Cut interview (ProVideo Coalition): https://www.provideocoalition.com/aotc-murch-bcpc/ (high)
- PremiumBeat, cutting on the blink / rule of six: https://www.premiumbeat.com/blog/cutting-on-the-blink-editing-tips-from-walter-murch (medium)
- No Film School, eye-trace in fast cutting (and Stephen Follows' ASL figures): https://nofilmschool.com/2018/08/editing-eye-trace-mind-rule-six-incorrect (medium)
- No Film School, Murch and blinks: https://nofilmschool.com/2016/05/not-sure-where-cut-editor-walter-murch-says-answer-may-be-eyes (medium)
- Dmytryk's rules (transcription): https://www.chicagomediaworks.com/2instructworks/3editing_doc/3editing_docdymytryk.html (medium)
- Stinson, "The Grammar of Editing" (Videomaker, mirror): https://www.personal.kent.edu/~lhanson/grammar.htm (medium)
- Videomaker, aesthetics of editing: https://www.videomaker.com/article/c3/2645-edit-suite-aesthetics-of-editing/ (medium)
- Videomaker, natural wipes: https://www.videomaker.com/article/f5/12726-wipers-au-naturel/ (medium)
- Adobe, match cut: https://www.adobe.com/creativecloud/video/discover/match-cut.html (medium)
- Adobe, invisible cut: https://www.adobe.com/creativecloud/video/hub/ideas/what-is-an-invisible-cut-in-film.html (medium)
- Adobe, natural wipe: https://www.adobe.com/creativecloud/video/hub/ideas/what-is-natural-wipe-in-video-editing.html (medium)
- Adobe blog, Morph Cut tips: https://blog.adobe.com/en/publish/2015/06/18/morph-cut-tips-tricks-for-best-results (high)

HyperFrames
- Local docs v0.8.210: `/root/.npm/_npx/26397facff9ecfd0/node_modules/hyperframes/dist/skills/hyperframes/references/{motion,captions,film,overlays,runtimes}.md`, `…/types/vertical.md`, `…/media-use/references/{mixing,media-treatment-recipes,local}.md`
- CLI output for `catalog --tag transition` and `media-treatment --capabilities`
- Motion-blur guide: https://hyperframes.heygen.com/guides/motion-blur (high for tool behaviour, medium for craft values)

ffmpeg 6.1.1, local `-h filter=` output for `minterpolate`, `tmix`, `tblend`, `dblur`, `gblur`, `framerate`, `xfade`, `maskedmerge`, `alphamerge`, `lumakey`, `setpts` (high)

Motion craft
- Material, AOSP tokens:
  - https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt
  - …/ExpressiveMotionTokens.kt
  - …/MotionTokens.kt
  - …/MotionSchemeKeyTokens.kt
  - (high)
- Material Components Android, Motion.md: https://raw.githubusercontent.com/material-components/material-components-android/master/docs/theming/Motion.md (high)
- Apple, WWDC23 "Animate with springs": https://developer.apple.com/videos/play/wwdc2023/10158/ (high)
- Apple HIG, Motion: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json (high)
- IBM Carbon, motion: https://carbondesignsystem.com/elements/motion/overview/ (high)
- GSAP:
  - 3.13 "100% free": https://gsap.com/blog/3-13/
  - CustomEase: https://gsap.com/docs/v3/Eases/CustomEase/
  - CustomWiggle: https://gsap.com/docs/v3/Eases/CustomWiggle/
  - SplitText: https://gsap.com/docs/v3/Plugins/SplitText/
  - Staggers: https://gsap.com/resources/getting-started/Staggers/
  - (high)
- MDN, `stdDeviation`: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stdDeviation and `feGaussianBlur`: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur (high)
- OpenCV, LK sample: https://raw.githubusercontent.com/opencv/opencv/4.x/samples/python/tutorial_code/video/optical_flow/optical_flow.py (high)
- Twelve principles (summary of *The Illusion of Life*): https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation (medium-high)
- Camera shake:
  - Bevy 2-D screen shake (follows Eiserloh's GDC talk): https://bevy.org/examples/camera/2d-screen-shake/ (medium)
  - Game Developer page on the talk: https://gamedeveloper.com/programming/video-sprucing-up-cameras-with-math (low)

ML tools
- RVM: https://github.com/PeterL1n/RobustVideoMatting
- SAM 3: https://github.com/facebookresearch/sam3 and its LICENSE; SAM 2 LICENSE: https://raw.githubusercontent.com/facebookresearch/sam2/main/LICENSE
- Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- 3D Ken Burns: https://github.com/sniklaus/3d-ken-burns
- Practical-RIFE: https://github.com/hzwer/Practical-RIFE
- FILM: https://github.com/google-research/frame-interpolation
- WhisperX: https://github.com/m-bain/whisperX
- MediaPipe Face Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker and Hand Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker
- (all high)

Captions
- Netflix, general requirements: https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617 and timing guidelines: https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines (high)
- Gernsbacher 2015: https://pmc.ncbi.nlm.nih.gov/articles/PMC5214590/ (high)
- APS on RSVP and the trailing-mask study: https://www.psychologicalscience.org/news/were-only-human/read-this-blog-post-in-less-than-a-minute.html (medium-high)
- OpusClip caption data: https://www.opus.pro/research/best-caption-strategy-short-form (low)
- Video Builders newsletter: https://videobuilders.beehiiv.com/p/hormozi-captions (low-medium)
- TikTok creative best practices: https://ads.tiktok.com/business/en/blog/creative-best-practices-top-performing-ads and Creative Codes: https://ads.tiktok.com/business/en/creative-codes (medium)
- CapCut, text behind a person: https://www.capcut.com/resource/how-to-put-text-behind-a-person-in-capcut (seen through search results, low; the method is consistent with the HF docs)

Brand motion
- Google, evolving the Google identity: https://design.google/library/evolving-google-identity
- Renault press release on the 2021 logo: https://media.renault.com/?p=198667
- Twenty Thousand Hertz, the Netflix episode: https://www.20k.org/episodes/netflix
- Mastercard press release: https://newsroom.mastercard.com/news/press/2019/february/sound-on-mastercard-debuts-sonic-brand/
- DIA / Mitch Paone essay: https://mitchpaone.substack.com/p/time-is-the-material-from-motion
- Creative Boom: https://www.creativeboom.com/insight/how-to-do-motion-first-branding-better/
- Print: https://www.printmag.com/industry-perspectives/your-logo-works-hard-how-about-your-motion/
- Rive on Spotify Wrapped 2025: https://rive.app/blog/spotify-used-rive-for-spotify-wrapped-2025
- Polestar journal: https://www.polestar.com/global/news/journal-1/
- Google design notes on M3 Expressive: https://design.google/library/design-notes-material-3-expressive-liam-spradlin
- Spence 2011 (PubMed): https://pubmed.ncbi.nlm.nih.gov/21264748/

Rhythm
- MrBeast memo: https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/ (medium) and Simon Willison's notes: https://simonwillison.net/2024/Sep/15/how-to-succeed-in-mrbeast-production/
- Jenny Hoyos: https://creatorscience.com/podcast/jenny-hoyos/ (medium) and Tubefilter: https://www.tubefilter.com/2023/09/27/creators-on-the-rise-jenny-hoyos/amp/
- Kallaway: https://www.castmagic.io/podcast/rhythm-hooks-and-a-billion-views-kane-kallaways-short-form-video-content-secrets (medium-low)
- YouTube view count: https://ppc.land/youtube-changes-how-shorts-views-are-counted-from-march-31/ and https://routenote.com/blog/how-are-views-counted-shorts-tiktok-reels/ (medium)
- Guo, Kim & Rubin 2014: https://up.csail.mit.edu/other-pubs/las2014-pguo-engagement.pdf (high)
- Cutting et al. 2011: https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/ (high)

House files read: `.claude/skills/motion-studio/references/{motion-craft,motion-pro,fluidite,utopicar}.md`, `video/CLAUDE.md`, `scratchpad/montage-4k/{BRIEF,REVIEW}.md` and `tiktok-1/` compositions, the official logo SVG.

Seen only in search results (**not opened**): the Kurzhals et al. CHI 2017 abstract; Resolve Smooth Cut tutorials (2–6 frames); whip-pan tutorials (Directional Blur 50–250); Duolingo's motion principles (LinkedIn); the M3 Expressive study counts (Dezeen); BMW's 2020 logo statements; Meta and TikTok safe-zone figures; ElevenLabs Scribe `timestamps_granularity`.
