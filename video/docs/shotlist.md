# Shotlist — UTOPICAR, 15 s, 9:16 (1080x1920), 120 BPM

Grille : beat = 0,5 s, downbeat = 2 s. Les montants ci-dessous sont des valeurs cibles :
au build, les données démo seront réglées pour que l'outil calcule lui-même ces chiffres.

| # | Temps | Action | Texte à l'écran | Asset | Mouvement / transition | Son |
|---|---|---|---|---|---|---|
| 1 | 0,0–2,0 | **Hook.** Carte annonce démo plein cadre : « Volkswagen Golf VII 1.6 TDI · 2015 · 168 000 km · **9 500 €** ». À 1,0 s le ticket UTOPICAR tombe dessus : note **38**/100, **NO GO**, « Il vous reste **−1 200 €** » en rouge. | 0,0 : « Cette Golf à 9 500 € ? » → 1,0 : « Tu perds **1 200 €**. » | Vue Analyser (champ annonce rempli) + ticket réel `ticketLive` | 0,0 : téléphone déjà à l'image, zoom caméra 1,35 → 1,15 en `heavy`. 1,0 : ticket entre du bas en `default`, le montant compte vers −1 200 € | Impact d'ouverture (0,0), hit grave sur le verdict (1,0) |
| 2 | 2,0–4,0 | **Produit.** Dézoom : on découvre le rapport complet dans le téléphone, barre UTOPICAR (carré jaune + wordmark) visible. | « UTOPICAR calcule ce qu'il te **reste**. » | Vue Rapport réelle | Caméra 1,15 → 1,0 en `default`, le téléphone se recentre | Whoosh léger (2,0) |
| 3 | 4,0–7,0 | **Preuve 1 : Analyser.** Le détail du calcul se déroule ligne par ligne (revente visée, prix d'achat, remise en état, carte grise, frais), puis le bloc **Ne dépassez pas 8 100 €** et « Offre de départ conseillée : 7 600 € ». | « Frais déduits. **Prix max** donné. » | Ledger + bloc plafond réels | Scroll réel de l'UI en `default` ; lignes entrées au demi-beat ; zoom 1,0 → 1,4 sur « Ne dépassez pas » à 6,0 (downbeat) | Pop par ligne, impact sur 6,0 |
| 4 | 7,0–10,0 | **Preuve 2 : Recherche en direct.** Tap sur « Recherche » dans le dock. La liste se remplit : 3 cartes annonces arrivent, la 2ᵉ porte l'anneau jaune « nouvelle » et le tag « **1 400 € sous la cote** ». | « Les bonnes affaires arrivent **seules**. » | Vue Recherche réelle (liste `liveCard`) avec annonces démo | Pression curseur `snappy` (7,0), morph de l'écran, cartes entrées en `default` aux beats 7,5 / 8,0 / 8,5, zoom sur la carte (9,0) | Clic (7,0), pops (7,5–8,5), montée musicale |
| 5 | 10,0–12,0 | **Preuve 3 : Tableau de bord.** Tap sur « Tableau ». KPI réels qui comptent : En stock **4**, Marge réalisée **14 820 €** (9 ventes), Rotation moyenne **23 j** ; la barre pipeline préparation → en vente → vendu se remplit. | « Ton parc. Ta marge. **En un coup d'œil.** » | Vue Tableau de bord réelle | Clic (10,0), compteurs arrêtés sur 11,0 ; pipeline en `default` | Clic (10,0), impact sur le beat (11,0) |
| 6 | 12,0–15,0 | **Logo + CTA.** L'écran du téléphone se contracte en `heavy` jusqu'au carré jaune du logo (icône voiture réelle), le wordmark UTOPICAR se dévoile à droite. À 13,0 : CTA. Maintien 2 s. | 12,0 : **UTOPICAR** · 13,0 : « Commente **GARAGE** pour l'accès » | Logo réel (`.mark` + wordmark Archivo 125 %) | Morph conteneur → logo sur le downbeat 12,0 ; CTA en masque de ligne | Thump final (12,0), silence propre en fin de mesure |

## Notes format vertical
- Titres entre y 180 et 560, alignés à gauche à 72 px, 2 lignes max, ≥ 104 px.
- Téléphone : 820 px de large, centré sur x = 500 (légèrement à gauche pour éviter la colonne de boutons TikTok).
- CTA final au-dessus de y = 1450 pour ne pas passer sous la légende TikTok.
- Rien d'important à droite de x = 940.

## Points à confirmer
- Mot-clé du CTA (« GARAGE » par défaut) et pseudo TikTok à afficher ou non.
- Photos des voitures dans les cartes : icône voiture de l'UI par défaut, ou tes propres photos.
- Scène sombre `#0C0F14` (proposé) ou claire `#F2F4F7`.
