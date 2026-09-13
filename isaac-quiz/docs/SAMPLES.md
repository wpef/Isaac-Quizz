# Échantillons (générés par `npm run samples`)

## items.json — 5 entrées

```json
[
  {
    "id": 1,
    "name": "The Sad Onion",
    "quality": 3,
    "type": "passive",
    "subtype": null,
    "typeRaw": "Passive",
    "recharge": null,
    "pools": [
      "item_room"
    ],
    "poolsRaw": "Item Room",
    "pickup": "Tears up",
    "description": "+0.7 Tears Up",
    "unlock": null,
    "stats": {
      "tears": 0.7
    },
    "transformations": [],
    "keywords": [
      "item room",
      "treasure room",
      "item room pool",
      "green",
      "cry",
      "plant"
    ],
    "colors": [
      "green"
    ],
    "tags": [
      "tears_up"
    ]
  },
  {
    "id": 118,
    "name": "Brimstone",
    "quality": 4,
    "type": "passive",
    "subtype": "tear_modifier",
    "typeRaw": "Passive, Tear Modifier",
    "recharge": null,
    "pools": [
      "devil"
    ],
    "poolsRaw": "Devil Room",
    "pickup": "Blood laser barrage",
    "description": "Tears are replaced with the ability to charge and fire a powerful laser that travels in a straight line across the room, dealing a lot of damage (tear damage hits for 9 ticks per laser) to any enemies it comes into contact with\nDoes not directly affect your Damage stat but hits enemies 9 times per charge\nSynergizes very well with a lot of items including Tammy's Head, Tiny Planet, Inner Eye (Triple Shot), Mutant Spider (Quad Shot) and many others\nIf you somehow manage to get a second Brimstone, the laser becomes massive and deals double damage",
    "unlock": null,
    "stats": {
      "tears_multiplier": 0.33
    },
    "transformations": [
      "leviathan"
    ],
    "keywords": [
      "devil pool",
      "devil room pool",
      "devil deal",
      "infinity",
      "red",
      "black"
    ],
    "colors": [
      "red",
      "black"
    ],
    "tags": [
      "laser",
      "leviathan",
      "tear_modifier",
      "tears_down"
    ]
  },
  {
    "id": 12,
    "name": "Magic Mushroom",
    "quality": 4,
    "type": "passive",
    "subtype": null,
    "typeRaw": "Passive",
    "recharge": null,
    "pools": [
      "item_room",
      "mushroom"
    ],
    "poolsRaw": "Item Room, Mushrooms",
    "pickup": "All stats up!",
    "description": "+1 HP Up\n+0.3 Damage Up\nx1.5 times Damage Multiplier (Does not stack with the multipliers from Cricket's Head / Blood of The Martyr + Book of Belial)\n+1.5 Range Up\n+0.3 Speed Up\nIncreases the size of your player sprite, but doesn't increase the hitbox\nFully restores all red heart containers\nCounts as 1 of 3 mushroom items needed towards the Fun Guy transformation\nCounts as 1 of 3 size-increasing items needed towards the Stompy transformation",
    "unlock": null,
    "stats": {
      "damage": 0.3,
      "range": 1.5,
      "speed": 0.3,
      "damage_multiplier": 1.5,
      "hp": 1
    },
    "transformations": [
      "funguy"
    ],
    "keywords": [
      "boss room pool",
      "boss room item",
      "item room",
      "treasure room",
      "item room pool",
      "red",
      "spots",
      "spotted",
      "amanita muscaria"
    ],
    "colors": [
      "red"
    ],
    "tags": [
      "damage_multiplier",
      "damage_up",
      "fun_guy",
      "healing",
      "hp_up",
      "range_up",
      "size_up",
      "speed_up",
      "stompy"
    ]
  },
  {
    "id": 153,
    "name": "Mutant Spider",
    "quality": 3,
    "type": "passive",
    "subtype": "tear_modifier",
    "typeRaw": "Passive, Tear Modifier",
    "recharge": null,
    "pools": [
      "item_room"
    ],
    "poolsRaw": "Item Room",
    "pickup": "Quad Shot",
    "description": "Tears now shoot 4 at a time (Quad Shot)\nTears Down significantly (Tear delay * 2.1 + 3)\nSynergizes well with a lot of tear effects - e.g. with Brimstone you get 4 lasers\nCounts as 1 of 3 spider items needed towards the Spider Baby transformation",
    "unlock": null,
    "stats": {
      "tears_multiplier": 0.42
    },
    "transformations": [
      "spiderbaby"
    ],
    "keywords": [
      "item room",
      "treasure room",
      "item room pool",
      "green",
      "black"
    ],
    "colors": [
      "green",
      "black"
    ],
    "tags": [
      "multi_shot",
      "spider_baby",
      "tear_modifier",
      "tears_down"
    ]
  },
  {
    "id": 732,
    "name": "Mom's Ring",
    "quality": 3,
    "type": "passive",
    "subtype": null,
    "typeRaw": "Passive",
    "recharge": null,
    "pools": [
      "shop",
      "golden_chest",
      "moms_chest",
      "old_chest"
    ],
    "poolsRaw": "Shop, Golden Chest, Mom's Chest, Old Chest",
    "pickup": "DMG up",
    "description": "+1 Damage Up\nDrops 1 random rune or soul stone when picked up\nCounts as 1 of 3 mom items needed towards the Mom transformation",
    "unlock": null,
    "stats": {
      "damage": 1
    },
    "transformations": [
      "yesmother"
    ],
    "keywords": [],
    "colors": [],
    "tags": [
      "damage_up",
      "yes_mother"
    ]
  }
]
```

## Une question par type servi par défaut (difficulté hard, seed 2026)

### BUILD_CHOICE

```json
{
  "type": "BUILD_CHOICE",
  "key": "SCENARIO:bc-019",
  "scenarioId": "bc-019",
  "prompt": "Item room. Lequel tu prends ?",
  "context": null,
  "answerMode": "pedestal",
  "pedestals": [
    168,
    395,
    373
  ],
  "prices": null,
  "choices": [
    {
      "id": 168,
      "itemId": 168,
      "label": null
    },
    {
      "id": 395,
      "itemId": 395,
      "label": null
    },
    {
      "id": 373,
      "itemId": 373,
      "label": null
    }
  ],
  "correctId": 373,
  "targetId": 373,
  "explanations": {
    "168": "Écrase Ludovico.",
    "373": "La larme ne touche jamais mur ni sol : multiplicateur x2 permanent.",
    "395": "Écrase Ludovico."
  },
  "held": [
    329
  ],
  "situation": {
    "floor": "Womb I",
    "note": null
  },
  "hp": {
    "red": 3,
    "max": 3,
    "soul": 0,
    "black": 0
  },
  "_pedestals": [
    "Epic Fetus",
    "Tech X",
    "Dead Eye"
  ]
}
```

### DEVIL_DEAL

```json
{
  "type": "DEVIL_DEAL",
  "key": "SCENARIO:dd-005",
  "scenarioId": "dd-005",
  "prompt": "Devil room. Tu fais quoi ?",
  "context": null,
  "answerMode": "pedestal",
  "pedestals": [
    114,
    83
  ],
  "prices": {
    "83": 1,
    "114": 2
  },
  "choices": [
    {
      "id": 114,
      "itemId": 114,
      "label": null
    },
    {
      "id": 83,
      "itemId": 83,
      "label": null
    },
    {
      "id": "opt:dd-005:2",
      "label": "Je skip le deal",
      "itemId": null
    }
  ],
  "correctId": 114,
  "targetId": 114,
  "explanations": {
    "83": "Un actif situationnel contre un couteau qui gagne la run.",
    "114": "Q4 qui remplace ton tir. Il te reste 1 conteneur + 2 soul hearts, largement assez avec ce niveau de dégâts.",
    "opt:dd-005:2": "Un Mom's Knife à Caves II, ça ne se skip pas."
  },
  "held": [],
  "situation": {
    "floor": "Caves II",
    "note": null
  },
  "hp": {
    "red": 3,
    "max": 3,
    "soul": 2,
    "black": 0
  },
  "_pedestals": [
    "Mom's Knife",
    "The Nail"
  ]
}
```

### ANTI_SYNERGY

```json
{
  "type": "ANTI_SYNERGY",
  "key": "SCENARIO:as-010",
  "scenarioId": "as-010",
  "prompt": "Lequel est un piège avec ton build ?",
  "context": null,
  "answerMode": "pedestal",
  "pedestals": [
    3,
    68,
    261
  ],
  "prices": null,
  "choices": [
    {
      "id": 3,
      "itemId": 3,
      "label": null
    },
    {
      "id": 68,
      "itemId": 68,
      "label": null
    },
    {
      "id": 261,
      "itemId": 261,
      "label": null
    }
  ],
  "correctId": 261,
  "targetId": 261,
  "explanations": {
    "3": "Le laser se courbe vers les ennemis.",
    "68": "Multiplicateur x1.5 sur le laser.",
    "261": "Le laser fait x6 à bout portant mais perd 13 % de dégâts par case, jusqu'à 0.1x à 7 cases : ton laser plein écran devient un pistolet à eau."
  },
  "held": [
    118
  ],
  "situation": {
    "floor": "Depths II",
    "note": null
  },
  "hp": {
    "red": 4,
    "max": 4,
    "soul": 0,
    "black": 0
  },
  "_pedestals": [
    "Spoon Bender",
    "Technology",
    "Proptosis"
  ]
}
```

### PRIORITY

```json
{
  "type": "PRIORITY",
  "key": "SCENARIO:pr-002",
  "scenarioId": "pr-002",
  "prompt": "Lequel tu prends ?",
  "context": "Item room.",
  "answerMode": "pedestal",
  "pedestals": [
    218,
    21,
    169
  ],
  "prices": null,
  "choices": [
    {
      "id": 218,
      "itemId": 218,
      "label": null
    },
    {
      "id": 21,
      "itemId": 21,
      "label": null
    },
    {
      "id": 169,
      "itemId": 169,
      "label": null
    }
  ],
  "correctId": 169,
  "targetId": 169,
  "explanations": {
    "21": "Utilitaire. Pas le moment.",
    "169": "Tu as 7 cœurs et pas de dégâts : à Depths II c'est le scaling qui manque, pas la survie.",
    "218": "Tu as déjà 7 cœurs. Sans dégâts, tu vas juste mourir plus lentement dans le Womb."
  },
  "held": [
    1
  ],
  "situation": {
    "floor": "Depths II",
    "note": "Item room."
  },
  "hp": {
    "red": 5,
    "max": 5,
    "soul": 2,
    "black": 0
  },
  "_pedestals": [
    "Placenta",
    "The Compass",
    "Polyphemus"
  ]
}
```

### SYNERGY

```json
{
  "type": "SYNERGY",
  "key": "SYNERGY:233:132",
  "held": [
    233
  ],
  "prompt": "Tu as Tiny Planet. Lequel synergise le mieux ?",
  "answerMode": "pedestal",
  "pedestals": [
    5,
    373,
    132
  ],
  "choices": [
    {
      "id": 5,
      "itemId": 5,
      "label": "My Reflection"
    },
    {
      "id": 373,
      "itemId": 373,
      "label": "Dead Eye"
    },
    {
      "id": 132,
      "itemId": 132,
      "label": "A Lump of Coal"
    }
  ],
  "correctId": 132,
  "targetId": 132,
  "explanations": {
    "5": "My Reflection : My Reflection : boomerang inutile, les larmes tournent déjà.",
    "132": "A Lump of Coal + Tiny Planet : A Lump of Coal + Tiny Planet : les larmes gagnent des dégâts en orbitant, elles deviennent énormes le temps de tourner.",
    "373": "Dead Eye : Dead Eye : des larmes en orbite qui ratent cassent le multiplicateur."
  },
  "_pedestals": [
    "My Reflection",
    "Dead Eye",
    "A Lump of Coal"
  ]
}
```

### ICON_QUIZ

```json
{
  "type": "ICON_QUIZ",
  "key": "ICON_QUIZ:699",
  "prompt": "Lequel est « Azazel's Rage » ?",
  "answerMode": "pedestal",
  "pedestals": [
    699,
    7,
    9
  ],
  "choices": [
    {
      "id": 699,
      "itemId": 699,
      "label": "Azazel's Rage"
    },
    {
      "id": 7,
      "itemId": 7,
      "label": "Blood of the Martyr"
    },
    {
      "id": 9,
      "itemId": 9,
      "label": "Skatole"
    }
  ],
  "correctId": 699,
  "targetId": 699,
  "explanations": {
    "7": "Blood of the Martyr — « DMG up ». +1.0 Damage Up",
    "9": "Skatole — « Fly love ». A lot of fly enemies are no longer aggressive towards Isaac",
    "699": "Azazel's Rage — « Ancient power ». Isaac builds rage each time you clear a new room. This is shown by the Azazel skin spreading on Isaac's face"
  },
  "_pedestals": [
    "Azazel's Rage",
    "Blood of the Martyr",
    "Skatole"
  ]
}
```

### STAT_QUIZ

```json
{
  "type": "STAT_QUIZ",
  "key": "STAT_QUIZ:237",
  "prompt": "Cet item donne quoi ?",
  "answerMode": "text",
  "pedestals": [
    237
  ],
  "choices": [
    {
      "id": "stat:0",
      "label": "+2 tears (cadence), +1.5 portée, +0.2 shot speed"
    },
    {
      "id": "stat:1",
      "label": "+0.4 dégâts, x0.9 dégâts, +1.7 tears (cadence), +0.3 vitesse"
    },
    {
      "id": "stat:2",
      "label": "+1.5 dégâts, -0.3 tears (cadence)"
    }
  ],
  "correctId": "stat:2",
  "targetId": 237,
  "explanations": {
    "stat:0": "Non, ça c'est le profil de Dark Prince's Crown (+2 tears (cadence), +1.5 portée, +0.2 shot speed). Death's Touch donne +1.5 dégâts, -0.3 tears (cadence).",
    "stat:1": "Non, ça c'est le profil de Odd Mushroom (Thin) (+0.4 dégâts, x0.9 dégâts, +1.7 tears (cadence), +0.3 vitesse). Death's Touch donne +1.5 dégâts, -0.3 tears (cadence).",
    "stat:2": "Death's Touch : +1.5 dégâts, -0.3 tears (cadence). +1.5 Damage Up"
  },
  "_pedestals": [
    "Death's Touch"
  ]
}
```

