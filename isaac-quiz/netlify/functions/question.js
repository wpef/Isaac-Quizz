const QUESTIONS = {
  normal: {
    PICK_BEST: [
      {
        type: 'PICK_BEST',
        situation: "You're on Basement I with half a heart left.",
        question: 'Which item would help you survive the most right now?',
        items: [
          { id: 346, name: 'Infamy' },
          { id: 22, name: 'Lunch' },
          { id: 75, name: 'PHD' },
        ],
        correct_id: 22,
        explanation: 'Lunch is a food item that gives you 1 HP up, which is exactly what you need when low on health.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You have base damage and no tears upgrades.',
        question: 'Which item gives you the best damage boost?',
        items: [
          { id: 4, name: 'Cricket\'s Head' },
          { id: 11, name: '1up!' },
          { id: 18, name: 'A Dollar' },
        ],
        correct_id: 4,
        explanation: "Cricket's Head gives a 1.5x damage multiplier, one of the best damage upgrades in the game.",
      },
      {
        type: 'PICK_BEST',
        situation: 'You enter a room full of flying enemies.',
        question: 'Which item is the most useful here?',
        items: [
          { id: 3, name: 'Spoon Bender' },
          { id: 19, name: 'Boom!' },
          { id: 52, name: 'Dr. Fetus' },
        ],
        correct_id: 3,
        explanation: 'Spoon Bender gives homing tears, which are perfect against fast-moving flying enemies.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You have no keys and there are 3 locked chests in the room.',
        question: 'Which item solves your problem?',
        items: [
          { id: 175, name: 'Paper Clip' },
          { id: 21, name: 'Compass' },
          { id: 34, name: 'Book of Belial' },
        ],
        correct_id: 175,
        explanation: 'Paper Clip is a trinket that gives you the effect of a golden key, opening all chests for free.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You need to clear rooms faster for Boss Rush.',
        question: 'Which item speeds up your clear time the most?',
        items: [
          { id: 149, name: 'Ipecac' },
          { id: 76, name: 'X-Ray Vision' },
          { id: 256, name: 'Hot Bombs' },
        ],
        correct_id: 149,
        explanation: 'Ipecac makes your tears explosive with +40 damage, letting you one-shot most early enemies.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You are playing as The Lost and need protection.',
        question: 'Which item is the most valuable for The Lost?',
        items: [
          { id: 313, name: 'Holy Mantle' },
          { id: 22, name: 'Lunch' },
          { id: 227, name: 'Piggy Bank' },
        ],
        correct_id: 313,
        explanation: 'Holy Mantle gives a free hit shield each room, essential for The Lost who dies in one hit.',
      },
      {
        type: 'PICK_BEST',
        situation: "You're fighting Mom's Heart and have low damage.",
        question: 'Which item would help the most in this boss fight?',
        items: [
          { id: 168, name: 'Epic Fetus' },
          { id: 23, name: 'Breakfast' },
          { id: 77, name: 'My Little Unicorn' },
        ],
        correct_id: 168,
        explanation: 'Epic Fetus replaces tears with missile strikes dealing massive damage, trivializing most bosses.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You have 99 coins and find a Shop.',
        question: 'Which shop item is the best long-term investment?',
        items: [
          { id: 64, name: 'Steam Sale' },
          { id: 139, name: "Mom's Purse" },
          { id: 72, name: 'Habit' },
        ],
        correct_id: 64,
        explanation: 'Steam Sale reduces all shop prices by 50%. Two Steam Sales make everything free!',
      },
    ],
    ICON_QUIZ: [
      {
        type: 'ICON_QUIZ',
        situation: 'One of these items gives you spectral tears.',
        question: 'Which one is Ouija Board?',
        items: [
          { id: 115, name: 'Ouija Board' },
          { id: 97, name: 'Blood Bag' },
          { id: 10, name: 'Halo of Flies' },
        ],
        correct_id: 115,
        explanation: 'Ouija Board gives spectral tears that pass through obstacles.',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'Identify the item by its icon.',
        question: 'Which one is Brimstone?',
        items: [
          { id: 118, name: 'Brimstone' },
          { id: 35, name: 'Mom\'s Eye' },
          { id: 44, name: 'Teleport!' },
        ],
        correct_id: 118,
        explanation: 'Brimstone replaces tears with a powerful blood laser beam.',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'One of these items is a cat.',
        question: 'Which one is Guppy\'s Head?',
        items: [
          { id: 145, name: "Guppy's Head" },
          { id: 153, name: 'Mutant Spider' },
          { id: 2, name: 'The Inner Eye' },
        ],
        correct_id: 145,
        explanation: "Guppy's Head spawns 2-4 blue flies when activated. It's part of the Guppy transformation.",
      },
      {
        type: 'ICON_QUIZ',
        situation: 'A powerful damage item is among these.',
        question: 'Which one is Polyphemus?',
        items: [
          { id: 169, name: 'Polyphemus' },
          { id: 106, name: 'Mr. Mega' },
          { id: 48, name: 'Necronomicon' },
        ],
        correct_id: 169,
        explanation: 'Polyphemus gives you a massive single tear with huge damage (+4 flat damage and 2x multiplier).',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'Identify this Devil Room item.',
        question: "Which one is Mom's Knife?",
        items: [
          { id: 114, name: "Mom's Knife" },
          { id: 51, name: 'Pentagram' },
          { id: 79, name: 'The Mark' },
        ],
        correct_id: 114,
        explanation: "Mom's Knife replaces tears with a throwable knife that deals massive damage.",
      },
      {
        type: 'ICON_QUIZ',
        situation: 'Find the familiar among these items.',
        question: 'Which one is Brother Bobby?',
        items: [
          { id: 8, name: 'Brother Bobby' },
          { id: 80, name: 'The Pact' },
          { id: 188, name: 'Abel' },
        ],
        correct_id: 8,
        explanation: 'Brother Bobby is a familiar that follows Isaac and shoots normal tears.',
      },
    ],
    KNOWLEDGE: [
      {
        type: 'KNOWLEDGE',
        situation: 'A question about item effects.',
        question: 'Which item gives you flight?',
        items: [
          { id: 7, name: 'Lord of the Pit' },
          { id: 15, name: "Mom's Heels" },
          { id: 30, name: 'Roid Rage' },
        ],
        correct_id: 7,
        explanation: 'Lord of the Pit grants flight and +0.3 speed, letting you fly over obstacles and pits.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Think about familiars.',
        question: 'Which item summons a familiar that copies your tears?',
        items: [
          { id: 67, name: 'Sister Maggy' },
          { id: 113, name: 'Demon Baby' },
          { id: 57, name: 'Distant Admiration' },
        ],
        correct_id: 67,
        explanation: 'Sister Maggy is a familiar that follows Isaac and shoots blood tears dealing 3.5 damage.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Item pools knowledge check.',
        question: 'Which item is found exclusively in Angel Rooms?',
        items: [
          { id: 331, name: 'Godhead' },
          { id: 118, name: 'Brimstone' },
          { id: 233, name: "Tiny Planet" },
        ],
        correct_id: 331,
        explanation: 'Godhead is an Angel Room exclusive item that gives homing tears with a damaging aura.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Do you know your transformations?',
        question: 'How many Guppy items do you need to become Guppy?',
        items: [
          { id: 145, name: "Guppy's Head (3 items)" },
          { id: 134, name: "Guppy's Tail (2 items)" },
          { id: 133, name: "Guppy's Paw (1 item)" },
        ],
        correct_id: 145,
        explanation: 'You need 3 Guppy items to complete the Guppy transformation, which grants flight and spawns flies.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'A question about tear effects.',
        question: 'Which item makes your tears bounce off walls?',
        items: [
          { id: 231, name: 'Rubber Cement' },
          { id: 229, name: 'Monstro\'s Lung' },
          { id: 5, name: 'My Reflection' },
        ],
        correct_id: 231,
        explanation: 'Rubber Cement makes your tears bounce off walls and obstacles, hitting enemies multiple times.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Character knowledge test.',
        question: "Which character starts with the D6?",
        items: [
          { id: 105, name: 'D6 (Isaac)' },
          { id: 34, name: 'Book of Belial (Judas)' },
          { id: 36, name: 'Razor Blade (Eve)' },
        ],
        correct_id: 105,
        explanation: 'Isaac starts with the D6 (after unlocking it), which rerolls item pedestals.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Think about what these items do.',
        question: 'Which item gives you a 1-UP (extra life)?',
        items: [
          { id: 11, name: '1up!' },
          { id: 28, name: 'Cupid\'s Arrow' },
          { id: 50, name: 'Steven' },
        ],
        correct_id: 11,
        explanation: '1up! gives you an extra life. When you die, you respawn in the previous room with full HP.',
      },
    ],
  },
  hard: {
    PICK_BEST: [
      {
        type: 'PICK_BEST',
        situation: "You have Brimstone and want to maximize your damage output.",
        question: 'Which item synergizes best with Brimstone?',
        items: [
          { id: 2, name: 'The Inner Eye' },
          { id: 329, name: 'The Ludovico Technique' },
          { id: 232, name: 'Stop Watch' },
        ],
        correct_id: 329,
        explanation: 'The Ludovico Technique + Brimstone creates a controllable Brimstone ring that does continuous damage.',
      },
      {
        type: 'PICK_BEST',
        situation: "You're going for Hush and need a consistent build.",
        question: 'Which item helps the most for the Hush fight?',
        items: [
          { id: 311, name: 'Judas\' Shadow' },
          { id: 276, name: 'Isaac\'s Heart' },
          { id: 330, name: 'Soy Milk' },
        ],
        correct_id: 311,
        explanation: "Judas' Shadow gives you an extra life and respawns you as Dark Judas with a massive 2x damage multiplier.",
      },
      {
        type: 'PICK_BEST',
        situation: 'You have Tech X and find these items.',
        question: 'Which item has the best synergy with Tech X?',
        items: [
          { id: 168, name: 'Epic Fetus' },
          { id: 3, name: 'Spoon Bender' },
          { id: 1, name: 'The Sad Onion' },
        ],
        correct_id: 3,
        explanation: 'Spoon Bender makes Tech X rings home in on enemies, making it nearly impossible to miss.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You find a Planetarium for the first time.',
        question: 'Which zodiac item is generally considered the strongest?',
        items: [
          { id: 588, name: 'Sol' },
          { id: 592, name: 'Terra' },
          { id: 594, name: 'Pluto' },
        ],
        correct_id: 588,
        explanation: 'Sol reveals the boss room, and after defeating the boss, gives full mapping, +3 damage, and +1 luck for the floor.',
      },
    ],
    ICON_QUIZ: [
      {
        type: 'ICON_QUIZ',
        situation: 'This item is a powerful orbital.',
        question: 'Which one is Sacrificial Dagger?',
        items: [
          { id: 172, name: 'Sacrificial Dagger' },
          { id: 210, name: 'Guillotine' },
          { id: 228, name: "Mom's Perfume" },
        ],
        correct_id: 172,
        explanation: 'Sacrificial Dagger is an orbital that deals 15 damage per tick to enemies it touches.',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'One of these is a quality 4 item.',
        question: 'Which one is Sacred Heart?',
        items: [
          { id: 182, name: 'Sacred Heart' },
          { id: 184, name: 'Holy Water' },
          { id: 178, name: 'Holy Grail' },
        ],
        correct_id: 182,
        explanation: 'Sacred Heart gives homing tears, +1 HP, and a 2.3x damage multiplier. One of the best items in the game.',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'Identify this Repentance item.',
        question: 'Which one is Revelation?',
        items: [
          { id: 643, name: 'Revelation' },
          { id: 331, name: 'Godhead' },
          { id: 374, name: 'Holy Light' },
        ],
        correct_id: 643,
        explanation: 'Revelation gives flight and a holy Brimstone laser that charges separately from your tears.',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'A useful activated item.',
        question: 'Which one is Void?',
        items: [
          { id: 477, name: 'Void' },
          { id: 476, name: 'D infinity' },
          { id: 297, name: 'Pandora\'s Box' },
        ],
        correct_id: 477,
        explanation: 'Void absorbs passive items for stat ups and active items to use their effects.',
      },
    ],
    KNOWLEDGE: [
      {
        type: 'KNOWLEDGE',
        situation: 'Deep game mechanics knowledge.',
        question: 'What does the Sacrificial Altar do?',
        items: [
          { id: 536, name: 'Sacrificial Altar (sacrifice familiars)' },
          { id: 172, name: 'Sacrificial Dagger (orbital)' },
          { id: 173, name: 'Mitre (soul hearts)' },
        ],
        correct_id: 536,
        explanation: 'Sacrificial Altar sacrifices your familiars and spawns Devil Room items in return.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Test your knowledge of item interactions.',
        question: "Which item makes you immune to explosions?",
        items: [
          { id: 132, name: 'Pyromaniac' },
          { id: 256, name: 'Hot Bombs' },
          { id: 137, name: 'Mr. Mega' },
        ],
        correct_id: 132,
        explanation: 'Pyromaniac makes you immune to explosion damage and actually heals you from explosions instead.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Secret room knowledge.',
        question: 'Which item can only be found in the Secret Room item pool?',
        items: [
          { id: 238, name: 'Key Piece 1' },
          { id: 114, name: "Mom's Knife" },
          { id: 1, name: 'The Sad Onion' },
        ],
        correct_id: 238,
        explanation: 'Key Piece 1 is obtained by bombing the angel statue in Angel Rooms to fight the angel and is part of the Mega Satan unlock.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Item quality rating knowledge.',
        question: 'Which of these items has Quality 4 (the highest)?',
        items: [
          { id: 182, name: 'Sacred Heart' },
          { id: 48, name: 'Necronomicon' },
          { id: 218, name: 'Placebo' },
        ],
        correct_id: 182,
        explanation: 'Sacred Heart is a Quality 4 item with homing, +1 HP, and a 2.3x damage multiplier.',
      },
    ],
  },
  expert: {
    PICK_BEST: [
      {
        type: 'PICK_BEST',
        situation: "You have 20/20, Soy Milk, and Libra.",
        question: 'Which item breaks this build the hardest?',
        items: [
          { id: 245, name: 'Almond Milk' },
          { id: 169, name: 'Polyphemus' },
          { id: 149, name: 'Ipecac' },
        ],
        correct_id: 149,
        explanation: 'Ipecac with Soy Milk and Libra redistributes the +40 damage across all stats, giving insane tears AND damage.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You are playing Tainted Lost on Corpse II.',
        question: 'Which item gives the best survival advantage?',
        items: [
          { id: 674, name: 'Spirit Shackles' },
          { id: 694, name: 'Heartbreak' },
          { id: 313, name: 'Holy Mantle' },
        ],
        correct_id: 313,
        explanation: 'Holy Mantle is the single best defensive item for Tainted Lost, blocking one hit per room.',
      },
      {
        type: 'PICK_BEST',
        situation: "You're doing a Greedier run and need coins.",
        question: 'Which item generates the most coins over time in Greed mode?',
        items: [
          { id: 389, name: 'Rune Bag' },
          { id: 416, name: 'Deep Pockets' },
          { id: 64, name: 'Steam Sale' },
        ],
        correct_id: 416,
        explanation: 'Deep Pockets doubles the coin cap to 999 and spawns coins after clearing waves, extremely powerful in Greed mode.',
      },
      {
        type: 'PICK_BEST',
        situation: 'You found R Key in a run with no completion marks left on this character.',
        question: 'When should you use R Key for maximum value?',
        items: [
          { id: 636, name: 'R Key (after final boss)' },
          { id: 580, name: 'Red Key (in Home)' },
          { id: 477, name: 'Void (on any floor)' },
        ],
        correct_id: 636,
        explanation: 'R Key restarts the entire run while keeping your items. Using it after the final boss lets you loop and get more completion marks.',
      },
    ],
    ICON_QUIZ: [
      {
        type: 'ICON_QUIZ',
        situation: 'This Repentance item was added in the final DLC.',
        question: 'Which one is C Section?',
        items: [
          { id: 678, name: 'C Section' },
          { id: 664, name: "Keeper's Sack" },
          { id: 654, name: 'False PHD' },
        ],
        correct_id: 678,
        explanation: 'C Section replaces your tears with fetuses that chase enemies and deal contact damage.',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'An obscure but powerful item.',
        question: 'Which one is Twisted Pair?',
        items: [
          { id: 698, name: 'Twisted Pair' },
          { id: 688, name: 'Glitched Crown' },
          { id: 685, name: 'Mega Mush' },
        ],
        correct_id: 698,
        explanation: 'Twisted Pair gives you two familiars that shoot tears that scale with your damage.',
      },
      {
        type: 'ICON_QUIZ',
        situation: 'Identify this tainted character unlock.',
        question: 'Which one is Spindown Dice?',
        items: [
          { id: 723, name: 'Spindown Dice' },
          { id: 105, name: 'D6' },
          { id: 386, name: 'D12' },
        ],
        correct_id: 723,
        explanation: 'Spindown Dice reduces an item\'s internal ID by 1, turning it into a different item. Extremely powerful with ID knowledge.',
      },
    ],
    KNOWLEDGE: [
      {
        type: 'KNOWLEDGE',
        situation: 'Advanced unlock knowledge.',
        question: 'What do you unlock by beating Delirium with every character?',
        items: [
          { id: 668, name: 'Mega Blast (all completion marks)' },
          { id: 477, name: 'Void (defeat Delirium once)' },
          { id: 706, name: 'Mega Clops (Tainted Samson)' },
        ],
        correct_id: 668,
        explanation: 'Completing all Delirium marks is one of the hardest achievements and unlocks various items depending on the character.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Test your modding and internal knowledge.',
        question: 'What is the internal item ID for Godhead?',
        items: [
          { id: 331, name: 'Godhead (ID: 331)' },
          { id: 401, name: 'Godhead (ID: 401)' },
          { id: 182, name: 'Godhead (ID: 182)' },
        ],
        correct_id: 331,
        explanation: 'Godhead has the internal collectible ID of 331 in The Binding of Isaac: Repentance.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Repentance boss knowledge.',
        question: 'Which floor is Mother fought on?',
        items: [
          { id: 619, name: 'Corpse II' },
          { id: 407, name: 'The Void' },
          { id: 550, name: 'Sheol' },
        ],
        correct_id: 619,
        explanation: 'Mother (also called Mom) is the final boss of the alternate path, fought at the end of Corpse II.',
      },
      {
        type: 'KNOWLEDGE',
        situation: 'Tainted character mechanics.',
        question: 'What is unique about Tainted Cain\'s crafting mechanic?',
        items: [
          { id: 710, name: 'Bag of Crafting (craft from pickups)' },
          { id: 105, name: 'D6 (reroll items)' },
          { id: 297, name: "Pandora's Box (floor rewards)" },
        ],
        correct_id: 710,
        explanation: 'Tainted Cain uses the Bag of Crafting to combine 8 pickups into items. He cannot take items from pedestals normally.',
      },
    ],
  },
};

const TYPES = ['PICK_BEST', 'ICON_QUIZ', 'KNOWLEDGE'];
let typeIndex = 0;

// Track recently used questions to avoid repeats
const recentQuestions = [];
const MAX_RECENT = 10;

export default async (req) => {
  const url = new URL(req.url);
  const diff = url.searchParams.get('diff') || 'normal';

  const type = TYPES[typeIndex % TYPES.length];
  typeIndex++;

  const difficulty = ['normal', 'hard', 'expert'].includes(diff) ? diff : 'normal';
  const pool = QUESTIONS[difficulty]?.[type] || QUESTIONS.normal[type];

  // Pick a random question, avoiding recent ones
  let available = pool.filter((_, i) => !recentQuestions.includes(`${difficulty}-${type}-${i}`));
  if (available.length === 0) {
    // Reset if all questions have been used
    recentQuestions.length = 0;
    available = pool;
  }

  const idx = Math.floor(Math.random() * available.length);
  const question = available[idx];
  const originalIdx = pool.indexOf(question);

  // Track this question
  const key = `${difficulty}-${type}-${originalIdx}`;
  recentQuestions.push(key);
  if (recentQuestions.length > MAX_RECENT) recentQuestions.shift();

  // Randomize HP display (1-6)
  const hp = Math.floor(Math.random() * 6) + 1;

  return new Response(JSON.stringify({ ...question, hp }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
};

export const config = {
  path: '/api/question',
};
