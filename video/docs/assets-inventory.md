# Inventaire des assets

| Chemin | Source | Utilisation prévue |
|---|---|---|
| assets/site/utopicar-live.html | Version publiée de l'artifact UTOPICAR Garage (claude.ai/artifact/8bHqs6YhWoWT2zje3mSF3q), lue le 29/09/2026 | Vraie UI filmée dans Chromium, en mode démo (window.claude mocké) |
| assets/site/Archivo-latin.woff2 | Google Fonts, Archivo variable (sous-ensemble latin), police déclarée par le site | Police display et UI, servie en local pour un rendu déterministe |
| assets/site/archivo.css | Feuille Google Fonts d'Archivo | Référence des plages largeur et graisse |
| assets/shots/probe-desk.png | Capture locale 1440x900 @2x, mode local | Vérification du rendu desktop |
| assets/shots/probe-mobile.png | Capture locale 390x844 @2x, mode local, avec Archivo | Vérification du rendu mobile (base du téléphone du film) |

Logo : carré jaune `#FFC928` 32 px, rayon 9 px, icône voiture SVG de l'UI + wordmark
« UTOPICAR » en Archivo 800 à 125 %. Il n'existe pas de fichier logo séparé : il sera
extrait du DOM réel.

Aucune donnée réelle (véhicules, annonces, relevés) n'est capturée : la base Supabase
n'est pas branchée en local.
