# Isaac Theorycraft Trainer

Web app mobile-first (PWA) d'entraînement au theorycraft pour **The Binding of Isaac: Repentance**.
Tu es dans une item room, face à des piédestaux : il faut choisir, reconnaître, comparer.
Toutes les réponses sont calculées à partir des données réelles de Platinum God (stats, qualité,
pools, tags), jamais devinées. 100 % statique, jouable hors ligne, aucune dépendance runtime.

## Modes

| Mode | Description |
|------|-------------|
| Entraînement libre | Questions infinies, 9 types pondérés, anti-répétition. |
| Run | 10 questions, score (100 pts + bonus de streak), résumé final avec les items ratés. |
| Révision | SRS Leitner : les items et types de question ratés reviennent plus souvent (localStorage). |
| Stats | Précision par type de question, par catégorie de tag, items les plus ratés. |

Difficulté **Normal / Hard / Expert** = qualité des items tirés et proximité des distracteurs
(mêmes couleurs, même famille visuelle, stats proches), pas des questions plus longues.

Après chaque réponse : fiche Platinum God des 3 items (description, qualité, pools, unlock, tags),
bouton **Pourquoi ?** (Netlify Function optionnelle, voir plus bas).

## Types de questions

Le cœur du jeu est une **banque de scénarios de theorycraft écrite à la main** (`src/data/scenarios.json`,
109 scénarios, vérifiés contre le wiki Repentance) + quelques types générés depuis les données.

| Type | Poids | Source | Exemple |
|------|-------|--------|---------|
| **BUILD_CHOICE** | 3 | scénarios | « Tu as Brimstone, Depths I. Item room : Tammy's Head / Sad Onion / Cricket's Body. » |
| **DEVIL_DEAL** | 2.5 | scénarios | « 1 conteneur + 3 soul hearts, Brimstone à 2 cœurs. Tu prends ? » (prix affichés, option skip, règles de prix / angel lock / devil chance) |
| **ANTI_SYNERGY** | 2.5 | scénarios | « Tu as Ipecac. Lequel est un piège ? » (Tiny Planet, My Reflection, Number One…) |
| **PRIORITY** | 2 | scénarios | « Womb I, 1 cœur, build Brimstone + Tammy's Head. Boss room : Placenta ou reroll ? », curse room à 1 cœur, D6, Missing No… |
| **SYNERGY** | 1.5 | `synergies.json` | « Tu as Dr. Fetus. Lequel synergise le mieux ? » |
| **ICON_QUIZ** | 1 | généré | « Lequel est Celtic Cross ? » (distracteurs même palette / famille) |
| **STAT_QUIZ** | 1 | généré (stats PG) | « Cet item donne quoi ? » 3 blocs de stats, l'icône seule |

Chaque scénario porte le build tenu (affiché dans le HUD), l'étage, les cœurs (HUD), 2-3 options
avec une explication par option, et une difficulté (`normal` / `hard` / `expert`). Les items sont
référencés par nom Platinum God et résolus/validés par les tests (`src/engine/scenarios.test.js`).

Format d'un scénario :

```json
{ "id": "dd-002", "type": "DEVIL_DEAL", "difficulty": "hard",
  "held": ["Tech X"], "floor": "Depths I", "hp": { "red": 1, "max": 1, "soul": 3, "black": 0 },
  "deals": [ { "item": "Brimstone", "price": 2 } ],
  "options": [
    { "item": "Brimstone", "best": true, "why": "…" },
    { "skip": true, "why": "…" },
    { "label": "Impossible, il faut 2 conteneurs", "why": "…" } ] }
```

`best` (ou `trap` pour ANTI_SYNERGY) marque l'unique bonne réponse. Une option peut être un item
(piédestal cliquable), un `skip` ou un `label` libre (bouton texte). `deals` affiche les prix en cœurs.

Les anciens types générés (PICK_BEST, NAME_QUIZ, KNOWLEDGE, STAT_COMPARE, POOL, QUALITY,
TRANSFORMATION) existent toujours dans `src/engine/questions.js` mais ne sont plus servis par défaut
(`DEFAULT_WEIGHTS` dans `generator.js`) ; `?type=POOL` les force pour débug.

Format d'une question :

```js
{ type, key, prompt, context?, answerMode: 'pedestal'|'text', pedestals: [itemId], prices?: {itemId: n},
  choices: [{id, label?, itemId?}], correctId, targetId, explanations: { [choiceId]: text },
  situation?: {floor, note}, hp?: {red, max, soul, black}, held?: [itemId] }
```

Voir `docs/SAMPLES.md` (`npm run samples`) pour 5 entrées d'`items.json` et une question de chaque type.

## Installation

```bash
cd isaac-quiz
npm install
npm run dev        # http://localhost:5173
npm test           # vitest : validité de chaque type, réponses objectives, anti-répétition, SRS
npm run build      # dist/
```

### Scripts de données (à lancer une fois, résultats commités)

| Script | Rôle |
|--------|------|
| `npm run scrape` | `scripts/scrape-items.mjs` — scrape https://platinumgod.co.uk/repentance (cheerio) → `src/data/items.json` (718 items : id, name, quality, type, pools, description, unlock, `stats` parsées, mots-clés/couleurs). Les trous de stats sont complétés par le `items.json` du Rebirth Item Tracker. `--cache` réutilise `.cache/`. |
| `npm run tag` | `scripts/tag-items.mjs` — tague chaque item avec le vocabulaire de `src/data/tags.json` (75 tags). Avec `ANTHROPIC_API_KEY` : batch LLM (`claude-opus-5`, sortie JSON structurée) qui part des suggestions heuristiques ; sans clé ou avec `--heuristic` : règles regex. Les tags objectifs (stats, transformations) viennent toujours des données. Ne tourne jamais au runtime. |
| `npm run fetch-sprites` | `scripts/fetch-sprites.mjs` — télécharge les icônes 64×64 `collectibles_NNN.png` depuis [Rchardon/RebirthItemTracker](https://github.com/Rchardon/RebirthItemTracker) → `public/sprites/items/NNN.png`. |
| `node scripts/make-icons.mjs` | Regénère les icônes PWA (`public/icons/`). |
| `npm run samples` | Regénère `docs/SAMPLES.md`. |

Ordre : `scrape` → `tag` → `fetch-sprites`. Tout est déjà commité, ces scripts ne servent qu'à rafraîchir.

## Assets de la salle (`public/sprites/room/`)

Le rendu par défaut est un fallback CSS pixel-art (Basement : tons bruns, carrelage, 4 portes,
piédestal d'item room avec ses marches, torches animées). Dépose les vrais assets extraits du jeu
avec ces noms et ils seront utilisés automatiquement (détection au chargement, aucun autre changement) :

| Fichier | Usage |
|---------|-------|
| `floor.png` | Tuile de sol répétée (96×96 affichés). |
| `wall.png` | Tuile de mur répétée (52×52 affichés). |
| `door_top.png`, `door_bottom.png`, `door_left.png`, `door_right.png` | Portes (64×26 / 26×64, étirées à la taille de la porte). |
| `altar.png` | Piédestal d'item room (affiché 92×46). |
| `torch.png` | Torche murale (14×22). |
| `heart_red.png`, `heart_half.png`, `heart_empty.png`, `heart_soul.png`, `heart_black.png` | Cœurs du HUD (22×20). |

Icônes d'items : `public/sprites/items/NNN.png` (id Repentance sur 3 chiffres). Rendu
`image-rendering: pixelated` partout. Polices locales dans `public/fonts/` (Press Start 2P, VT323, OFL).

## Déploiement Netlify

```bash
npm install -g netlify-cli
netlify init          # ou netlify link — build: npm run build, publish: dist (déjà dans netlify.toml)
netlify deploy --prod
```

`netlify.toml` contient le redirect SPA, la redirection `/api/*` vers les functions et les
en-têtes de cache pour sprites/fonts.

### Function optionnelle `explain` (bouton "Pourquoi ?")

`netlify/functions/explain.js` reçoit la question + le choix du joueur et renvoie 2-3 phrases
d'explication contextuelle via l'API Anthropic (`claude-opus-5`). Configure la variable
d'environnement dans Netlify (Site settings → Environment variables) :

```
ANTHROPIC_API_KEY=sk-ant-...
```

Sans clé, la function répond 503 et l'app retombe silencieusement sur les explications statiques :
le jeu est 100 % jouable sans. En local : `netlify dev` (proxy `/api` déjà configuré dans Vite).

## PWA

`public/manifest.webmanifest`, icônes `public/icons/`, service worker `public/sw.js`
(shell network-first, sprites/fonts/données cache-first). Installable sur mobile, jouable hors ligne
après la première visite.

## Structure

```
isaac-quiz/
├── scripts/            scrape-items, tag-items, fetch-sprites, make-icons, samples
├── src/
│   ├── data/           items.json (718), tags.json, synergies.json, scenarios.json (109 scénarios)
│   ├── engine/         rng, items, questions (générateurs), scenarios (banque → questions), generator (pondération, anti-répétition, SRS)
│   ├── components/     Room, Hud, Pedestal, Question, Feedback, ItemSheet, Title, Summary, Stats
│   └── lib/            storage, srs (Leitner), stats, explain, assets (fallback sprites)
├── netlify/functions/  explain.js
├── public/             sprites/, fonts/, icons/, manifest, sw.js
└── docs/SAMPLES.md
```

Raccourcis clavier (desktop) : `1-3` / `A-C` pour répondre, `Entrée` pour la salle suivante.
Debug : `?type=SYNERGY` force un type de question.
