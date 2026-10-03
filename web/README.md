# Utopicar : outil d'analyse d'annonce (Next.js)

V1 : une seule fonction, **analyser une annonce de voiture d'occasion**, avec deux publics.

| Route | Public | Ce qui est calculé |
|---|---|---|
| `/app` | Pro, achat-revente | marge nette, offre, plafond, verdict GO / NO GO, note, état, fiabilité, message vendeur. Tableau de bord, parc, rapports et recherches sont affichés « bientôt ». |
| `/benef` | Particulier qui achète pour lui | verdict simple (bonne affaire, prix correct, trop cher, prudence, à éviter), **coût réel d'achat** (prix + carte grise + trajet + CT + petites réparations), 4 points à vérifier, 3 questions au vendeur. Le détail est replié. Pas de revente, pas de marge, pas de gros travaux dans le total. |
| `/api/analyse` | serveur | lecture de l'annonce + appel à l'IA |

Stack identique aux autres projets : Next.js 16, React 19, Tailwind 4, TypeScript.

## Comment l'analyse est faite

1. **Règles fixes, sans IA** (`src/lib/analyse/`), portées de l'outil d'origine :
   - `texte.ts` lit le prix, l'année, le kilométrage, la puissance fiscale, le CT, la distribution, le carnet et les propriétaires ;
   - `defauts.ts` contient les 38 défauts chiffrés (joint de culasse, embrayage, pneus…) ;
   - `fiabilite.ts` liste les moteurs et boîtes à éviter et les modèles fiables.
2. **IA côté serveur** (`ia.ts`) : identification de la version, cote du marché, distance, inspection des photos, travaux d'entretien à prévoir, alertes, questions. La clé reste sur le serveur ; le navigateur n'appelle jamais l'IA directement (l'outil d'origine passait par `window.claude` dans claude.ai).
3. **Calculs d'argent par l'outil, jamais par l'IA** (`couts.ts`) : `dealPro` pour le pro (port de `deal()`), `coutParticulier` pour le particulier. Ils tournent dans le navigateur : changer le prix ou la distance recalcule tout de suite.

Sans clé API, l'outil marche quand même : faits lus, défauts, fiabilité et coût réel (prix, CT, petites réparations). La cote, la distance et la carte grise (si la puissance fiscale n'est pas écrite) manquent alors.

## Variables d'environnement (Vercel, jamais dans le dépôt)

| Variable | Rôle |
|---|---|
| `ANTHROPIC_API_KEY` | obligatoire pour la cote du marché et l'analyse des photos |
| `ANTHROPIC_MODEL` | facultatif, `claude-opus-5-5` par défaut |

Repli automatique côté serveur si le modèle refuse une demande (`fallbacks: "default"`).
Limite simple : 12 analyses par tranche de 10 minutes et par adresse IP (en mémoire, par instance).

## Développer

```bash
cd web
npm install
npm run dev      # http://localhost:3000/app et /benef
npm run lint
npm run build
```

## Mise en ligne sur utopicar.fr

Aujourd'hui, utopicar.fr est le projet Vercel `utopicar-garage` : un site statique déployé à la main, sans lien Git.
L'outil se déploie à part, sans toucher au site :

1. Vercel : nouveau projet depuis ce dépôt, **Root Directory = `web`**, avec `ANTHROPIC_API_KEY`.
2. Dans le `vercel.json` du site statique, ajouter des réécritures vers ce projet (remplacer `OUTIL` par son domaine `.vercel.app`) :
   ```json
   "rewrites": [
     { "source": "/app", "destination": "https://OUTIL/app" },
     { "source": "/benef", "destination": "https://OUTIL/benef" },
     { "source": "/api/analyse", "destination": "https://OUTIL/api/analyse" },
     { "source": "/_next/:path*", "destination": "https://OUTIL/_next/:path*" }
   ]
   ```
3. Retirer `benef/index.html` du site statique : un fichier présent passe avant une réécriture, et `/benef` devient l'outil particulier. Les réécritures existantes `/benef/guide` et `/benef/legal` ne bougent pas.
