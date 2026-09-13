// One generator per question type. Each returns a question or null when no objectively
// correct question can be built from the current data (never guesses).
//
// Question shape:
// {
//   type, key, prompt, answerMode: 'pedestal' | 'text',
//   pedestals: [itemId...],            // what sits on the altars (always shown as icons only)
//   choices: [{ id, label?, itemId? }],// what the player picks (pedestal itemIds or text options)
//   correctId, explanations: { [choiceId]: text },
//   situation?: { floor, note }, hp?: { red, max, soul, black }, held?: itemId, tag?, stat?
// }
import {
  eligible, familyOf, visualSimilarity, nameSimilarity, statScore, statLine, formatStat,
  GOALS, MAIN_POOLS, POOL_LABELS, STAT_LABELS,
} from './items.js';

const FLOORS = ['Basement II', 'Caves I', 'Caves II', 'Depths I', 'Depths II', 'Womb I', 'Womb II', 'Mines I', 'Mausoleum I'];

function firstLine(it) {
  return it.description.split('\n')[0];
}

/** Prefer items the player hasn't just seen, weighted by the SRS weight function. */
function pickTarget(ctx, candidates) {
  if (!candidates.length) return undefined;
  const fresh = candidates.filter((it) => !ctx.recent.has(it.id));
  const pool = fresh.length >= Math.min(3, candidates.length) ? fresh : candidates;
  return ctx.rng.pickWeighted(pool, ctx.weight);
}

function pedestalChoices(items) {
  return items.map((it) => ({ id: it.id, itemId: it.id, label: it.name }));
}

// ---------------------------------------------------------------- PICK_BEST
const MARGIN = { normal: 0.6, hard: 0.3, expert: 0.05 };

export function genPickBest(ctx) {
  const { rng, difficulty } = ctx;
  const goalKey = rng.pick(Object.keys(GOALS));
  const goal = GOALS[goalKey];
  const pool = eligible(ctx.items, difficulty).filter((it) => it.type === 'passive');
  const scored = pool.map((it) => ({ it, s: goal.score(it) })).filter((x) => x.s !== null && x.s > 0);
  if (scored.length < 3) return null;
  const distractorPool = pool.map((it) => ({ it, s: goal.score(it) ?? 0 }));
  const n = difficulty === 'normal' ? 2 + rng.int(2) : 3;
  const margin = MARGIN[difficulty] ?? MARGIN.normal;

  for (let attempt = 0; attempt < 40; attempt++) {
    const winner = pickTarget(ctx, scored.map((x) => x.it));
    const ws = goal.score(winner);
    // Distractors: items that also help (interesting trade-off) but strictly less, by a margin.
    let cands = distractorPool.filter((x) => x.it.id !== winner.id && x.s < ws - margin);
    if (difficulty !== 'normal') cands = cands.filter((x) => x.s > 0).length >= n - 1 ? cands.filter((x) => x.s > 0) : cands;
    else cands = cands.filter((x) => x.s >= 0);
    if (cands.length < n - 1) continue;
    // On expert, take the closest competitors; on normal, anything clearly worse.
    const sorted = cands.sort((a, b) => b.s - a.s);
    const window = difficulty === 'expert' ? sorted.slice(0, 6) : difficulty === 'hard' ? sorted.slice(0, 15) : sorted;
    const distractors = rng.sample(window, n - 1).map((x) => x.it);
    if (distractors.length < n - 1) continue;
    const shown = rng.shuffle([winner, ...distractors]);
    const explanations = {};
    for (const it of shown) {
      const s = goal.score(it) ?? 0;
      const line = statLine(it);
      explanations[it.id] = `${it.name} : ${line || firstLine(it)} → score ${goal.label} ${s > 0 ? '+' : ''}${Math.round(s * 100) / 100}`;
    }
    const q = {
      type: 'PICK_BEST',
      key: `PICK_BEST:${goalKey}:${winner.id}`,
      goal: goalKey,
      prompt: goal.prompt,
      answerMode: 'pedestal',
      pedestals: shown.map((it) => it.id),
      choices: pedestalChoices(shown),
      correctId: winner.id,
      explanations,
    };
    if (goal.situation === 'low_hp') {
      q.situation = { floor: rng.pick(FLOORS.slice(3)), note: 'Tu es presque mort.' };
      q.hp = { red: rng.pick([0.5, 1]), max: 3, soul: 0, black: 0 };
      q.prompt = `Tu es à ${q.hp.red === 0.5 ? 'un demi-cœur' : 'un cœur'} en ${q.situation.floor}. ${goal.prompt}`;
    } else if (goal.situation === 'devil_next') {
      q.situation = { floor: rng.pick(FLOORS.slice(0, 5)), note: 'Devil deal probable après le boss.' };
      q.hp = { red: 3, max: 3, soul: 0, black: 0 };
      q.prompt = `${q.situation.floor}, devil deal probable après le boss. ${goal.prompt}`;
    }
    return q;
  }
  return null;
}

// ---------------------------------------------------------------- ICON_QUIZ
export function genIconQuiz(ctx) {
  const { rng, difficulty } = ctx;
  const target = pickTarget(ctx, eligible(ctx.items, difficulty));
  if (!target) return null;
  const others = ctx.items.filter((it) => it.id !== target.id && it.name !== target.name);
  const ranked = others
    .map((it) => ({ it, s: visualSimilarity(target, it) }))
    .sort((a, b) => b.s - a.s);
  let window;
  if (difficulty === 'expert') window = ranked.slice(0, 6);
  else if (difficulty === 'hard') window = ranked.slice(0, 14);
  else window = ranked.filter((x) => x.s >= 1).slice(0, 40);
  if (window.length < 2) window = ranked.slice(0, 40);
  const distractors = rng.sample(window, 2).map((x) => x.it);
  const shown = rng.shuffle([target, ...distractors]);
  const explanations = {};
  for (const it of shown) explanations[it.id] = `${it.name} — « ${it.pickup} ». ${firstLine(it)}`;
  return {
    type: 'ICON_QUIZ',
    key: `ICON_QUIZ:${target.id}`,
    prompt: `Lequel est « ${target.name} » ?`,
    answerMode: 'pedestal',
    pedestals: shown.map((it) => it.id),
    choices: pedestalChoices(shown),
    correctId: target.id,
    explanations,
  };
}

// ---------------------------------------------------------------- NAME_QUIZ
export function genNameQuiz(ctx) {
  const { rng, difficulty } = ctx;
  const target = pickTarget(ctx, eligible(ctx.items, difficulty));
  if (!target) return null;
  const others = ctx.items.filter((it) => it.id !== target.id && it.name !== target.name);
  const ranked = others.map((it) => ({ it, s: nameSimilarity(target, it) + visualSimilarity(target, it) * 0.5 })).sort((a, b) => b.s - a.s);
  let window;
  if (difficulty === 'expert') window = ranked.slice(0, 6);
  else if (difficulty === 'hard') window = ranked.slice(0, 15);
  else window = ranked.slice(0, 60);
  const distractors = rng.sample(window, 2).map((x) => x.it);
  const options = rng.shuffle([target, ...distractors]);
  const explanations = {};
  for (const it of options) explanations[`item:${it.id}`] = `${it.name} — « ${it.pickup} ». ${firstLine(it)}`;
  return {
    type: 'NAME_QUIZ',
    key: `NAME_QUIZ:${target.id}`,
    prompt: 'Comment s’appelle cet item ?',
    answerMode: 'text',
    pedestals: [target.id],
    choices: options.map((it) => ({ id: `item:${it.id}`, label: it.name, itemId: it.id })),
    correctId: `item:${target.id}`,
    explanations,
  };
}

// ---------------------------------------------------------------- KNOWLEDGE
// Loose regexes that exclude a distractor if its text even hints at the property, so a
// heuristic tagging miss can never make the "wrong" answer actually right.
const GUARDS = {
  flight: /\bfl(y|ight|ying)\b/i,
  homing: /homing/i,
  piercing: /pierc/i,
  spectral: /spectral/i,
  laser: /laser|brimstone/i,
  knife: /knife|knives|blade|sword/i,
  explosive_tears: /bomb|missile|explosi/i,
  tear_modifier: /tears (are|become|will)|instead of tears|replaces? (your |isaac'?s )?tears/i,
  familiar: /familiar/i,
  orbital: /orbit/i,
  poison: /poison/i,
  explosive: /explo/i,
  one_time_use: /one time|single use|once/i,
  extra_life: /extra li|respawn|reviv|resurrect/i,
  invincibility: /invincib|invulnerab/i,
  shield: /shield|block/i,
  teleport: /teleport/i,
  reroll: /re-?roll/i,
  healing: /heal|restore/i,
  charge_shot: /charg/i,
  multi_shot: /shot|tears at once/i,
  devil_deal_helper: /devil/i,
  angel_deal_helper: /angel/i,
  uncaps_tears: /cap/i,
  uncaps_damage: /cap|limit/i,
  fear: /fear|flee/i,
  freeze: /freez|petrif|stone/i,
  slow: /slow/i,
  burn: /burn|fire/i,
  charm: /charm/i,
  confusion: /confus/i,
  contact_damage: /contact|touch/i,
  size_up: /size|bigger|larger/i,
  gives_coins: /coin|penn|money/i,
  gives_keys: /key/i,
  gives_bombs: /bomb/i,
  soul_hearts: /soul heart/i,
  black_hearts: /black heart/i,
  bone_hearts: /bone heart/i,
  hp_up: /hp up|health up|heart container/i,
  damage_up: /damage up|damage multiplier|x\d(\.\d+)? damage/i,
  tears_up: /tears up|fire rate|rate of fire/i,
  luck_up: /luck up/i,
  speed_up: /speed up/i,
  range_up: /range up|range (greatly )?increased/i,
  shot_speed_up: /shot speed up/i,
  character_start: /starts with/i,
  active: /./, // handled by type
};
const KNOWLEDGE_EXCLUDED = new Set(['active', 'luck_scaling', 'damage_down', 'tears_down', 'speed_down', 'luck_down', 'range_down', 'shot_speed_down', 'all_stats_up', 'explosive']);

function tagCounts(ctx) {
  if (ctx._tagCounts) return ctx._tagCounts;
  const c = {};
  for (const it of ctx.items) for (const t of it.tags || []) c[t] = (c[t] || 0) + 1;
  ctx._tagCounts = c;
  return c;
}

function knowledgeTags(ctx) {
  const counts = tagCounts(ctx);
  return Object.keys(ctx.tags).filter((t) => {
    const def = ctx.tags[t];
    return def.knowledge && def.group !== 'transformation' && !KNOWLEDGE_EXCLUDED.has(t) && (counts[t] || 0) >= 3;
  });
}

function distractorsWithoutTag(ctx, target, tag, n) {
  const { rng, difficulty } = ctx;
  const guard = GUARDS[tag];
  const group = ctx.tags[tag]?.group;
  let pool = ctx.items.filter((it) => it.id !== target.id && it.name !== target.name && !(it.tags || []).includes(tag) && !(guard && guard.test(it.description)));
  if (tag === 'active') pool = pool.filter((it) => it.type !== 'active');
  if (difficulty === 'normal') pool = pool.filter((it) => (it.quality ?? 0) >= 1);
  if (pool.length < n) return null;
  if (difficulty === 'expert') {
    // Look-alikes first: same visual family / palette, then same tag group.
    const ranked = pool.map((it) => ({ it, s: visualSimilarity(target, it) + ((it.tags || []).some((t) => ctx.tags[t]?.group === group) ? 1 : 0) })).sort((a, b) => b.s - a.s);
    return rng.sample(ranked.slice(0, 10), n).map((x) => x.it);
  }
  if (difficulty === 'hard') {
    const same = pool.filter((it) => (it.tags || []).some((t) => ctx.tags[t]?.group === group));
    if (same.length >= n) return rng.sample(same, n);
  }
  return rng.sample(pool, n);
}

export function genKnowledge(ctx) {
  const { rng, difficulty } = ctx;
  const tags = knowledgeTags(ctx);
  for (let attempt = 0; attempt < 20; attempt++) {
    const tag = rng.pick(tags);
    if (!tag) return null;
    const def = ctx.tags[tag];
    const withTag = eligible(ctx.items, difficulty).filter((it) => (it.tags || []).includes(tag));
    if (withTag.length === 0) continue;
    const target = pickTarget(ctx, withTag);
    const distractors = distractorsWithoutTag(ctx, target, tag, 2);
    if (!distractors) continue;
    const shown = rng.shuffle([target, ...distractors]);
    const explanations = {};
    for (const it of shown) {
      explanations[it.id] = it.id === target.id
        ? `${it.name} ${def.knowledge}. ${firstLine(it)}`
        : `${it.name} ne correspond pas (« ${def.knowledge} ») : ${firstLine(it)}`;
    }
    return {
      type: 'KNOWLEDGE',
      key: `KNOWLEDGE:${tag}:${target.id}`,
      tag,
      prompt: `Quel item ${def.knowledge} ?`,
      answerMode: 'pedestal',
      pedestals: shown.map((it) => it.id),
      choices: pedestalChoices(shown),
      correctId: target.id,
      explanations,
    };
  }
  return null;
}

// ---------------------------------------------------------------- STAT_COMPARE
const STAT_MARGINS = { damage: 0.3, tears: 0.2, speed: 0.1, luck: 1, range: 0.5, shot_speed: 0.1, hp: 1, soul_hearts: 1 };
const STATS = Object.keys(STAT_MARGINS);

export function genStatCompare(ctx) {
  const { rng, difficulty } = ctx;
  const mult = difficulty === 'normal' ? 2 : difficulty === 'hard' ? 1 : 0.01;
  for (let attempt = 0; attempt < 30; attempt++) {
    const stat = rng.pick(STATS);
    const margin = STAT_MARGINS[stat] * mult;
    const pool = eligible(ctx.items, difficulty)
      .filter((it) => it.type === 'passive')
      .map((it) => ({ it, s: statScore(it, stat) }))
      .filter((x) => x.s !== null && x.s > 0);
    if (pool.length < 3) continue;
    const target = pickTarget(ctx, pool.map((x) => x.it));
    const winnerEntry = pool.find((x) => x.it.id === target.id);
    const ws = winnerEntry.s;
    let cands = pool.filter((x) => x.it.id !== winnerEntry.it.id && x.s <= ws - margin && x.it.name !== winnerEntry.it.name);
    if (cands.length < 2) continue;
    cands = cands.sort((a, b) => b.s - a.s);
    const window = difficulty === 'expert' ? cands.slice(0, 5) : difficulty === 'hard' ? cands.slice(0, 12) : cands;
    const distractors = rng.sample(window, 2);
    const shown = rng.shuffle([winnerEntry, ...distractors]);
    const explanations = {};
    for (const x of shown) explanations[x.it.id] = `${x.it.name} : ${formatStat(stat, x.s)}${statLine(x.it) && stat !== 'hp' ? ` (${statLine(x.it)})` : ''}`;
    return {
      type: 'STAT_COMPARE',
      key: `STAT_COMPARE:${stat}:${winnerEntry.it.id}`,
      stat,
      prompt: `Lequel donne le plus gros bonus de ${STAT_LABELS[stat]} ?`,
      answerMode: 'pedestal',
      pedestals: shown.map((x) => x.it.id),
      choices: pedestalChoices(shown.map((x) => x.it)),
      correctId: winnerEntry.it.id,
      explanations,
    };
  }
  return null;
}

// ---------------------------------------------------------------- POOL
const CONFUSABLE = {
  devil: ['curse', 'red_chest', 'angel'],
  angel: ['devil', 'secret', 'library'],
  curse: ['devil', 'red_chest', 'secret'],
  red_chest: ['devil', 'curse', 'golden_chest'],
  secret: ['ultra_secret', 'shop', 'angel'],
  ultra_secret: ['secret', 'angel', 'planetarium'],
  boss: ['item_room', 'golden_chest', 'shop'],
  item_room: ['boss', 'shop', 'golden_chest'],
  shop: ['item_room', 'secret', 'golden_chest'],
  library: ['angel', 'item_room', 'planetarium'],
  planetarium: ['ultra_secret', 'library', 'angel'],
  golden_chest: ['shop', 'boss', 'red_chest'],
};

export function genPool(ctx) {
  const { rng, difficulty } = ctx;
  const maxPools = difficulty === 'normal' ? 2 : 3;
  const pool = eligible(ctx.items, difficulty).filter((it) => it.pools.length >= 1 && it.pools.length <= maxPools && MAIN_POOLS.includes(it.pools[0]));
  const target = pickTarget(ctx, pool);
  if (!target) return null;
  const correct = target.pools[0];
  let cands = MAIN_POOLS.filter((p) => !target.pools.includes(p));
  if (difficulty !== 'normal') {
    const conf = (CONFUSABLE[correct] || []).filter((p) => cands.includes(p));
    if (conf.length >= 2) cands = difficulty === 'expert' ? conf : [...conf, ...rng.sample(cands.filter((p) => !conf.includes(p)), 2)];
  }
  const distractors = rng.sample(cands, 2);
  if (distractors.length < 2) return null;
  const options = rng.shuffle([correct, ...distractors]);
  const explanations = {};
  for (const p of options) {
    explanations[`pool:${p}`] = p === correct
      ? `${target.name} vient de : ${target.poolsRaw}.`
      : `Pas ${POOL_LABELS[p]} : ${target.name} vient de ${target.poolsRaw}.`;
  }
  return {
    type: 'POOL',
    key: `POOL:${target.id}`,
    prompt: 'Cet item vient de quel pool ?',
    answerMode: 'text',
    pedestals: [target.id],
    choices: options.map((p) => ({ id: `pool:${p}`, label: POOL_LABELS[p] })),
    correctId: `pool:${correct}`,
    explanations,
  };
}

// ---------------------------------------------------------------- QUALITY
export function genQuality(ctx) {
  const { rng, difficulty } = ctx;
  const target = pickTarget(ctx, eligible(ctx.items, difficulty).filter((it) => it.quality !== null));
  if (!target) return null;
  const q = target.quality;
  let others = [0, 1, 2, 3, 4].filter((x) => x !== q);
  if (difficulty === 'expert') {
    const adj = others.filter((x) => Math.abs(x - q) === 1);
    others = adj.length >= 2 ? adj : [...adj, ...others.filter((x) => !adj.includes(x)).slice(0, 2 - adj.length)];
  } else if (difficulty === 'hard') {
    others = others.sort((a, b) => Math.abs(a - q) - Math.abs(b - q)).slice(0, 3);
  }
  const distractors = rng.sample(others, 2);
  const options = rng.shuffle([q, ...distractors]).sort((a, b) => a - b);
  const explanations = {};
  for (const x of options) {
    explanations[`q:${x}`] = x === q
      ? `${target.name} est qualité ${q} — « ${target.pickup} ». ${firstLine(target)}`
      : `Non, ${target.name} est qualité ${q}, pas ${x}.`;
  }
  return {
    type: 'QUALITY',
    key: `QUALITY:${target.id}`,
    prompt: 'Quelle est la qualité de cet item ?',
    answerMode: 'text',
    pedestals: [target.id],
    choices: options.map((x) => ({ id: `q:${x}`, label: `Qualité ${x}` })),
    correctId: `q:${q}`,
    explanations,
  };
}

// ---------------------------------------------------------------- TRANSFORMATION
const TRANSFORM_WORDS = {
  guppy: /guppy|\bcat\b/i, leviathan: /leviathan|evil item/i, beelzebub: /beelzebub|fly item/i,
  fun_guy: /fun guy|mushroom item/i, spun: /\bspun\b|syringe item/i, yes_mother: /yes mother|mom item|mom transformation/i,
  seraphim: /seraphim|angel item/i, bookworm: /bookworm|book item/i, oh_crap: /oh crap|poop item/i,
  bob: /\bbob\b/i, super_bum: /super bum|bum item/i, spider_baby: /spider baby|spider item/i,
  stompy: /stompy|size-increasing/i, conjoined: /conjoined/i,
};

export function genTransformation(ctx) {
  const { rng, difficulty } = ctx;
  const counts = tagCounts(ctx);
  const tags = Object.keys(ctx.tags).filter((t) => ctx.tags[t].group === 'transformation' && (counts[t] || 0) >= 3);
  for (let attempt = 0; attempt < 20; attempt++) {
    const tag = rng.pick(tags);
    if (!tag) return null;
    const def = ctx.tags[tag];
    const withTag = eligible(ctx.items, difficulty).filter((it) => (it.tags || []).includes(tag));
    if (!withTag.length) continue;
    const target = pickTarget(ctx, withTag);
    const word = TRANSFORM_WORDS[tag];
    let pool = ctx.items.filter((it) => it.id !== target.id && !(it.tags || []).includes(tag) && !(word && word.test(it.description)) && !(word && word.test(it.name)));
    if (difficulty === 'normal') pool = pool.filter((it) => (it.quality ?? 0) >= 1);
    if (difficulty === 'hard') {
      const other = pool.filter((it) => (it.tags || []).some((t) => ctx.tags[t]?.group === 'transformation'));
      if (other.length >= 2) pool = other;
    } else if (difficulty === 'expert') {
      const ranked = pool.map((it) => ({ it, s: visualSimilarity(target, it) })).sort((a, b) => b.s - a.s);
      pool = ranked.slice(0, 10).map((x) => x.it);
    }
    if (pool.length < 2) continue;
    const distractors = rng.sample(pool, 2);
    const shown = rng.shuffle([target, ...distractors]);
    const explanations = {};
    for (const it of shown) {
      const own = (it.tags || []).filter((t) => ctx.tags[t]?.group === 'transformation').map((t) => ctx.tags[t].label);
      explanations[it.id] = it.id === target.id
        ? `${it.name} compte pour ${def.label} (1 des 3 items nécessaires).`
        : `${it.name} ne compte pas pour ${def.label}${own.length ? ` (il compte pour ${own.join(', ')})` : ''}.`;
    }
    return {
      type: 'TRANSFORMATION',
      key: `TRANSFORMATION:${tag}:${target.id}`,
      tag,
      prompt: `Lequel compte pour la transformation ${def.label} ?`,
      answerMode: 'pedestal',
      pedestals: shown.map((it) => it.id),
      choices: pedestalChoices(shown),
      correctId: target.id,
      explanations,
    };
  }
  return null;
}

// ---------------------------------------------------------------- SYNERGY
export function genSynergy(ctx) {
  const { rng, byId } = ctx;
  const entries = (ctx.synergies || []).filter((e) => byId.has(e.with) && byId.has(e.best) && e.distractors.every((d) => byId.has(d.id)));
  if (!entries.length) return null;
  const fresh = entries.filter((e) => !ctx.recent.has(e.best));
  const entry = rng.pick(fresh.length ? fresh : entries);
  const held = byId.get(entry.with);
  const best = byId.get(entry.best);
  const distractors = rng.sample(entry.distractors, 2);
  if (distractors.length < 2) return null;
  const shown = rng.shuffle([best, ...distractors.map((d) => byId.get(d.id))]);
  const explanations = { [best.id]: `${best.name} + ${held.name} : ${entry.why}` };
  for (const d of distractors) explanations[d.id] = `${byId.get(d.id).name} : ${d.why}`;
  return {
    type: 'SYNERGY',
    key: `SYNERGY:${entry.with}:${entry.best}`,
    held: held.id,
    prompt: `Tu as ${held.name}. Lequel synergise le mieux ?`,
    answerMode: 'pedestal',
    pedestals: shown.map((it) => it.id),
    choices: pedestalChoices(shown),
    correctId: best.id,
    explanations,
  };
}

export const GENERATORS = {
  PICK_BEST: genPickBest,
  ICON_QUIZ: genIconQuiz,
  NAME_QUIZ: genNameQuiz,
  KNOWLEDGE: genKnowledge,
  STAT_COMPARE: genStatCompare,
  POOL: genPool,
  QUALITY: genQuality,
  TRANSFORMATION: genTransformation,
  SYNERGY: genSynergy,
};

export const TYPE_LABELS = {
  PICK_BEST: 'Meilleur choix',
  ICON_QUIZ: 'Reconnaissance d’icône',
  NAME_QUIZ: 'Nom de l’item',
  KNOWLEDGE: 'Connaissance',
  STAT_COMPARE: 'Comparaison de stats',
  POOL: 'Item pool',
  QUALITY: 'Qualité',
  TRANSFORMATION: 'Transformation',
  SYNERGY: 'Synergie',
};

export { familyOf };
