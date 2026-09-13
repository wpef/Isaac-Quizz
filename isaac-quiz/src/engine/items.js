// Item data helpers shared by every question generator. Pure functions, no state.

export const POOL_LABELS = {
  item_room: 'Item Room',
  devil: 'Devil Room',
  angel: 'Angel Room',
  boss: 'Boss Room',
  secret: 'Secret Room',
  ultra_secret: 'Ultra Secret Room',
  shop: 'Shop',
  curse: 'Curse Room',
  library: 'Library',
  planetarium: 'Planetarium',
  golden_chest: 'Golden Chest',
  red_chest: 'Red Chest',
  challenge: 'Challenge Room',
  beggar: 'Beggar',
  demon_beggar: 'Demon Beggar',
  key_beggar: 'Key Beggar',
  bomb_beggar: 'Bomb Beggar',
  crane_game: 'Crane Game',
  greed_item_room: 'Greed Item Room',
  greed_shop: 'Greed Shop',
  greed_devil: 'Greed Devil Room',
  greed_angel: 'Greed Angel Room',
  moms_chest: "Mom's Chest",
  old_chest: 'Old Chest',
  wooden_chest: 'Wooden Chest',
  shopkeeper: 'Shopkeeper',
  miniboss: 'Miniboss',
  boss_drop: 'Boss drop',
  mushroom: 'Mushroom',
  battery_beggar: 'Battery Beggar',
  rotten_beggar: 'Rotten Beggar',
};

/** Pools a player actually reasons about in-game. Used as answer/distractor space. */
export const MAIN_POOLS = ['item_room', 'devil', 'angel', 'boss', 'secret', 'shop', 'curse', 'library', 'planetarium', 'golden_chest', 'red_chest', 'ultra_secret'];

export const STAT_LABELS = {
  damage: 'dégâts',
  tears: 'tears (cadence)',
  speed: 'vitesse',
  luck: 'luck',
  range: 'portée',
  shot_speed: 'shot speed',
  hp: 'conteneurs de cœur',
  soul_hearts: 'soul hearts',
  black_hearts: 'black hearts',
};

// Visual "families" used to pick look-alike distractors (icon quizzes) and name-alike ones.
const FAMILIES = [
  ['heart', /\bhearts?\b/],
  ['mushroom', /mushroom|mush\b|shroom/],
  ['head', /\bheads?\b|skull/],
  ['book', /\bbook|bible|necronomicon|tome|manual/],
  ['syringe', /syringe|needle|injection|roid|adderline|speed ball/],
  ['card', /\bcards?\b|tarot/],
  ['eye', /\beyes?\b|contact|glasses|spectacles|vision/],
  ['baby', /\bbaby|babies|bobby|infant/],
  ['fly', /\bfl(y|ies)\b|bug|beetle/],
  ['bomb', /\bbombs?\b|dynamite|tnt|boom/],
  ['key', /\bkeys?\b/],
  ['coin', /\bcoins?\b|penny|nickel|dime|dollar|cent\b|money/],
  ['bottle', /bottle|jar|vial|potion|milk|juice/],
  ['poop', /\bpoop|crap|dung/],
  ['pill', /\bpills?\b/],
  ['knife', /knife|blade|sword|dagger|razor|scissors|shears/],
  ['cross', /\bcross|crucifix|rosary/],
  ['ring', /\bring\b|halo|crown/],
  ['tooth', /tooth|teeth|fang/],
  ['bone', /\bbones?\b|skeleton/],
  ['box', /\bbox|chest|bag|sack|pocket|purse/],
  ['food', /\bmeat|dinner|lunch|breakfast|dessert|cake|onion|egg|candy|cookie|steak|sausage/],
  ['tech', /tech|robot|battery|remote|cube|computer|gb bug|nes/],
  ['cat', /\bcat\b|guppy|kitten/],
  ['hand', /\bhands?\b|paw|finger|fist|palm/],
  ['mom', /\bmom'?s?\b/],
  ['dad', /\bdad'?s?\b/],
  ['angel', /angel|holy|sacred|godhead|seraph|wing|halo/],
  ['devil', /devil|demon|satan|brimstone|pentagram|goat|evil|black/],
  ['plant', /leaf|flower|plant|rose|seed|nugget|clover/],
  ['toy', /\btoy|doll|pony|robot|balloon|kite/],
];

export function familyOf(item) {
  const text = `${item.name} ${(item.keywords || []).join(' ')}`.toLowerCase();
  for (const [name, re] of FAMILIES) if (re.test(text)) return name;
  return null;
}

export function visualSimilarity(a, b) {
  let s = 0;
  const ca = new Set(a.colors || []);
  for (const c of b.colors || []) if (ca.has(c)) s += 1;
  const fa = familyOf(a);
  if (fa && fa === familyOf(b)) s += 3;
  return s;
}

/** Name-alike score: shares a leading word ("Mom's", "Book of", "Guppy's") or a family. */
export function nameSimilarity(a, b) {
  let s = 0;
  const wa = a.name.toLowerCase().split(/[\s']+/).filter((w) => w.length > 2);
  const wb = new Set(b.name.toLowerCase().split(/[\s']+/).filter((w) => w.length > 2));
  for (const w of wa) if (wb.has(w) && !['the', 'and', 'for'].includes(w)) s += 2;
  const fa = familyOf(a);
  if (fa && fa === familyOf(b)) s += 1;
  return s;
}

const DIFFICULTY_QUALITY = {
  normal: (q) => q >= 2,
  hard: () => true,
  expert: () => true,
};

/** Items eligible as *targets* for a difficulty: Normal sticks to items every player meets. */
export function eligible(items, difficulty = 'normal') {
  const ok = DIFFICULTY_QUALITY[difficulty] || DIFFICULTY_QUALITY.normal;
  return items.filter((it) => ok(it.quality ?? 0));
}

/** Effective flat damage bonus taking multipliers into account (Isaac base damage = 3.5). */
export function damageScore(it) {
  const s = it.stats || {};
  if (s.damage === undefined && s.damage_multiplier === undefined) return null;
  const flat = s.damage ?? 0;
  const mult = s.damage_multiplier ?? 1;
  return Math.round(((3.5 + flat) * mult - 3.5) * 100) / 100;
}

/** Tears bonus with multipliers folded in (base tears ~2.73 shots/s). */
export function tearsScore(it) {
  const s = it.stats || {};
  if (s.tears === undefined && s.tears_multiplier === undefined) return null;
  const flat = s.tears ?? 0;
  const mult = s.tears_multiplier ?? 1;
  return Math.round(((2.73 + flat) * mult - 2.73) * 100) / 100;
}

export function statScore(it, stat) {
  if (stat === 'damage') return damageScore(it);
  if (stat === 'tears') return tearsScore(it);
  const v = it.stats?.[stat];
  return v === undefined ? null : v;
}

/** How much an item helps you not die: hearts, healing, lives, protection. */
export function survivalScore(it) {
  const s = it.stats || {};
  const t = new Set(it.tags || []);
  let v = 0;
  v += (s.hp || 0) * 2;
  v += s.soul_hearts || 0;
  v += s.black_hearts || 0;
  v += (s.bone_hearts || 0) * 1.5;
  if (t.has('healing')) v += 1;
  if (t.has('extra_life')) v += 3;
  if (t.has('shield')) v += 1.5;
  if (t.has('invincibility')) v += 1;
  return v;
}

/** Devil-deal preparation: hearts you can pay with + items that open / help deals. */
export function devilPrepScore(it) {
  const s = it.stats || {};
  const t = new Set(it.tags || []);
  let v = 0;
  v += (s.soul_hearts || 0) * 1.5;
  v += (s.black_hearts || 0) * 1.5;
  v += (s.hp || 0) * 1;
  if (t.has('devil_deal_helper')) v += 3;
  return v;
}

export const GOALS = {
  damage: { label: 'les dégâts', score: damageScore },
  tears: { label: 'la cadence de tir (tears)', score: tearsScore },
  luck: { label: 'la luck', score: (it) => statScore(it, 'luck') },
  speed: { label: 'la vitesse', score: (it) => statScore(it, 'speed') },
  survival: { label: 'ta survie', score: survivalScore, situation: 'low_hp' },
  devil: { label: 'la préparation d’un devil deal', score: devilPrepScore, situation: 'devil_next' },
};

export function formatStat(stat, v) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v} ${STAT_LABELS[stat] || stat}`;
}

/** Short stat line: "+0.7 tears, +1 dégâts". */
export function statLine(it) {
  const s = it.stats || {};
  const parts = [];
  for (const k of ['damage', 'damage_multiplier', 'tears', 'tears_multiplier', 'speed', 'luck', 'range', 'shot_speed', 'hp', 'soul_hearts', 'black_hearts', 'bone_hearts']) {
    if (s[k] === undefined) continue;
    if (k.endsWith('_multiplier')) parts.push(`x${s[k]} ${STAT_LABELS[k.replace('_multiplier', '')]}`);
    else parts.push(formatStat(k, s[k]));
  }
  return parts.join(', ');
}

export function byId(items) {
  const m = new Map();
  for (const it of items) m.set(it.id, it);
  return m;
}
