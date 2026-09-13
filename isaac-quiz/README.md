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

## Types de questions (`src/engine/questions.js`)

1. **PICK_BEST** — 2 ou 3 icônes, objectif (dégâts / tears / luck / speed / survie / devil deal).
   Réponse calculée depuis `stats` + `tags` ; refus de générer sans vainqueur objectif.
   La situation (HP bas, devil deal à venir) n'apparaît que si elle change la réponse et est
   reflétée dans le HUD (cœurs, étage).
2. **ICON_QUIZ** — nom donné, 3 icônes proches visuellement (palette / famille).
3. **NAME_QUIZ** — 1 icône, 3 noms.
4. **KNOWLEDGE** — "Quel item donne le vol / ignore le tears cap / est à usage unique…" (tags).
5. **STAT_COMPARE** — "Lequel donne le plus gros bonus de X ?" (stats).
6. **POOL** — "Cet item vient de quel pool ?"
7. **QUALITY** — "Quelle qualité ?" (0 à 4).
8. **TRANSFORMATION** — "Lequel compte pour Guppy / Leviathan / Bob… ?"
9. **SYNERGY** — "Tu as X, lequel synergise le mieux ?" (`src/data/synergies.json`, ~33 entrées
   écrites à la main avec distracteurs expliqués).

Format d'une question :

```js
{ type, key, prompt, answerMode: 'pedestal'|'text', pedestals: [itemId], choices: [{id, label, itemId?}],
  correctId, explanations: { [choiceId]: text }, situation?: {floor, note}, hp?: {red, max, soul, black}, held? }
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
│   ├── data/           items.json (718), tags.json, synergies.json
│   ├── engine/         rng, items (scores/similarité), questions (9 générateurs), generator (pondération, anti-répétition, SRS)
│   ├── components/     Room, Hud, Pedestal, Question, Feedback, ItemSheet, Title, Summary, Stats
│   └── lib/            storage, srs (Leitner), stats, explain, assets (fallback sprites)
├── netlify/functions/  explain.js
├── public/             sprites/, fonts/, icons/, manifest, sw.js
└── docs/SAMPLES.md
```

Raccourcis clavier (desktop) : `1-3` / `A-C` pour répondre, `Entrée` pour la salle suivante.
Debug : `?type=SYNERGY` force un type de question.
