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

## Une question par type (difficulté hard, seed 2026)

### PICK_BEST

```json
{
  "type": "PICK_BEST",
  "key": "PICK_BEST:luck:492",
  "goal": "luck",
  "prompt": "Tu veux monter ta luck. Lequel tu prends ?",
  "answerMode": "pedestal",
  "pedestals": [
    671,
    492,
    686
  ],
  "choices": [
    {
      "id": 671,
      "itemId": 671,
      "label": "Candy Heart"
    },
    {
      "id": 492,
      "itemId": 492,
      "label": "YO LISTEN!"
    },
    {
      "id": 686,
      "itemId": 686,
      "label": "Soul Locket"
    }
  ],
  "correctId": 492,
  "explanations": {
    "492": "YO LISTEN! : +1 luck → score la luck +1",
    "671": "Candy Heart : +0.1 dégâts, +0.05 tears (cadence), +0.02 vitesse, +0.1 luck, +0.15 portée, +0.02 shot speed → score la luck +0.1",
    "686": "Soul Locket : +0.2 dégâts, +0.1 tears (cadence), +0.04 vitesse, +0.2 luck, +0.3 portée, +1 soul hearts → score la luck +0.2"
  },
  "_pedestals": [
    "Candy Heart",
    "YO LISTEN!",
    "Soul Locket"
  ]
}
```

### ICON_QUIZ

```json
{
  "type": "ICON_QUIZ",
  "key": "ICON_QUIZ:162",
  "prompt": "Lequel est « Celtic Cross » ?",
  "answerMode": "pedestal",
  "pedestals": [
    306,
    313,
    162
  ],
  "choices": [
    {
      "id": 306,
      "itemId": 306,
      "label": "Sagittarius"
    },
    {
      "id": 313,
      "itemId": 313,
      "label": "Holy Mantle"
    },
    {
      "id": 162,
      "itemId": 162,
      "label": "Celtic Cross"
    }
  ],
  "correctId": 162,
  "explanations": {
    "162": "Celtic Cross — « You feel blessed ». Upon taking damage, you have a 20% chance to gain an invulnerability shield for 7 seconds",
    "306": "Sagittarius — « Penetrative shot + speed up ». +0.2 Speed Up",
    "313": "Holy Mantle — « Holy shield ». Each time you enter a new room, damage is negated for the first time you get hit"
  },
  "_pedestals": [
    "Sagittarius",
    "Holy Mantle",
    "Celtic Cross"
  ]
}
```

### NAME_QUIZ

```json
{
  "type": "NAME_QUIZ",
  "key": "NAME_QUIZ:201",
  "prompt": "Comment s’appelle cet item ?",
  "answerMode": "text",
  "pedestals": [
    201
  ],
  "choices": [
    {
      "id": "item:201",
      "label": "Iron Bar",
      "itemId": 201
    },
    {
      "id": "item:114",
      "label": "Mom's Knife",
      "itemId": 114
    },
    {
      "id": "item:107",
      "label": "Pinking Shears",
      "itemId": 107
    }
  ],
  "correctId": "item:201",
  "explanations": {
    "item:201": "Iron Bar — « Concussive tears ». +0.3 Damage Up",
    "item:114": "Mom's Knife — « Stab stab stab ». Tears are replaced with a knife which can be charged and thrown in a boomerang style action",
    "item:107": "Pinking Shears — « Cut and run ». Cuts Isaac's head from his body for the current room, allowing him to fly and leaving the decapitated body to run around attacking enemies for 5.5 damage per tick"
  },
  "_pedestals": [
    "Iron Bar"
  ]
}
```

### KNOWLEDGE

```json
{
  "type": "KNOWLEDGE",
  "key": "KNOWLEDGE:poison:336",
  "tag": "poison",
  "prompt": "Quel item empoisonne les ennemis ?",
  "answerMode": "pedestal",
  "pedestals": [
    528,
    136,
    336
  ],
  "choices": [
    {
      "id": 528,
      "itemId": 528,
      "label": "Angelic Prism"
    },
    {
      "id": 136,
      "itemId": 136,
      "label": "Best Friend"
    },
    {
      "id": 336,
      "itemId": 336,
      "label": "Dead Onion"
    }
  ],
  "correctId": 336,
  "explanations": {
    "136": "Best Friend ne correspond pas (« empoisonne les ennemis ») : Places a decoy on the floor which attracts enemies and explodes after a period of time",
    "336": "Dead Onion empoisonne les ennemis. Isaac's tears become large, brown and will penetrate all objects and enemies (piercing + spectral)",
    "528": "Angelic Prism ne correspond pas (« empoisonne les ennemis ») : Grants a prism orbital with a large orbital radius"
  },
  "_pedestals": [
    "Angelic Prism",
    "Best Friend",
    "Dead Onion"
  ]
}
```

### STAT_COMPARE

```json
{
  "type": "STAT_COMPARE",
  "key": "STAT_COMPARE:damage:197",
  "stat": "damage",
  "prompt": "Lequel donne le plus gros bonus de dégâts ?",
  "answerMode": "pedestal",
  "pedestals": [
    109,
    197,
    686
  ],
  "choices": [
    {
      "id": 109,
      "itemId": 109,
      "label": "Money = Power"
    },
    {
      "id": 197,
      "itemId": 197,
      "label": "Jesus Juice"
    },
    {
      "id": 686,
      "itemId": 686,
      "label": "Soul Locket"
    }
  ],
  "correctId": 197,
  "explanations": {
    "109": "Money = Power : +0.04 dégâts (+0.04 dégâts)",
    "197": "Jesus Juice : +0.5 dégâts (+0.5 dégâts, +0.38 portée)",
    "686": "Soul Locket : +0.2 dégâts (+0.2 dégâts, +0.1 tears (cadence), +0.04 vitesse, +0.2 luck, +0.3 portée, +1 soul hearts)"
  },
  "_pedestals": [
    "Money = Power",
    "Jesus Juice",
    "Soul Locket"
  ]
}
```

### POOL

```json
{
  "type": "POOL",
  "key": "POOL:101",
  "prompt": "Cet item vient de quel pool ?",
  "answerMode": "text",
  "pedestals": [
    101
  ],
  "choices": [
    {
      "id": "pool:shop",
      "label": "Shop"
    },
    {
      "id": "pool:item_room",
      "label": "Item Room"
    },
    {
      "id": "pool:secret",
      "label": "Secret Room"
    }
  ],
  "correctId": "pool:item_room",
  "explanations": {
    "pool:shop": "Pas Shop : The Halo vient de Item Room, Angel Room.",
    "pool:item_room": "The Halo vient de : Item Room, Angel Room.",
    "pool:secret": "Pas Secret Room : The Halo vient de Item Room, Angel Room."
  },
  "_pedestals": [
    "The Halo"
  ]
}
```

### QUALITY

```json
{
  "type": "QUALITY",
  "key": "QUALITY:722",
  "prompt": "Quelle est la qualité de cet item ?",
  "answerMode": "text",
  "pedestals": [
    722
  ],
  "choices": [
    {
      "id": "q:0",
      "label": "Qualité 0"
    },
    {
      "id": "q:1",
      "label": "Qualité 1"
    },
    {
      "id": "q:2",
      "label": "Qualité 2"
    }
  ],
  "correctId": "q:2",
  "explanations": {
    "q:0": "Non, Anima Sola est qualité 2, pas 0.",
    "q:1": "Non, Anima Sola est qualité 2, pas 1.",
    "q:2": "Anima Sola est qualité 2 — « Repent ». When used, it puts the closes enemy in chains for 5 seconds, preventing it from moving. You can release the enemy early by using it again"
  },
  "_pedestals": [
    "Anima Sola"
  ]
}
```

### TRANSFORMATION

```json
{
  "type": "TRANSFORMATION",
  "key": "TRANSFORMATION:bob:273",
  "tag": "bob",
  "prompt": "Lequel compte pour la transformation Bob ?",
  "answerMode": "pedestal",
  "pedestals": [
    236,
    322,
    273
  ],
  "choices": [
    {
      "id": 236,
      "itemId": 236,
      "label": "E. Coli"
    },
    {
      "id": 322,
      "itemId": 322,
      "label": "Mongo Baby"
    },
    {
      "id": 273,
      "itemId": 273,
      "label": "Bob's Brain"
    }
  ],
  "correctId": 273,
  "explanations": {
    "236": "E. Coli ne compte pas pour Bob (il compte pour Oh Crap).",
    "273": "Bob's Brain compte pour Bob (1 des 3 items nécessaires).",
    "322": "Mongo Baby ne compte pas pour Bob (il compte pour Conjoined)."
  },
  "_pedestals": [
    "E. Coli",
    "Mongo Baby",
    "Bob's Brain"
  ]
}
```

### SYNERGY

```json
{
  "type": "SYNERGY",
  "key": "SYNERGY:118:153",
  "held": 118,
  "prompt": "Tu as Brimstone. Lequel synergise le mieux ?",
  "answerMode": "pedestal",
  "pedestals": [
    153,
    5,
    373
  ],
  "choices": [
    {
      "id": 153,
      "itemId": 153,
      "label": "Mutant Spider"
    },
    {
      "id": 5,
      "itemId": 5,
      "label": "My Reflection"
    },
    {
      "id": 373,
      "itemId": 373,
      "label": "Dead Eye"
    }
  ],
  "correctId": 153,
  "explanations": {
    "5": "My Reflection : My Reflection donne des larmes boomerang : aucun effet sur un laser.",
    "153": "Mutant Spider + Brimstone : Mutant Spider avec Brimstone : 4 lasers par charge, le multi-tir s'applique au laser.",
    "373": "Dead Eye : Dead Eye se charge en enchaînant des larmes qui touchent : le laser ne construit pas le combo."
  },
  "_pedestals": [
    "Mutant Spider",
    "My Reflection",
    "Dead Eye"
  ]
}
```

