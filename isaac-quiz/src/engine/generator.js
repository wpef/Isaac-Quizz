// Question generator with type weighting, anti-repetition and SRS weighting.
import { createRng } from './rng.js';
import { byId as indexById } from './items.js';
import { GENERATORS } from './questions.js';

export const DEFAULT_WEIGHTS = {
  PICK_BEST: 3,
  ICON_QUIZ: 2,
  NAME_QUIZ: 2,
  KNOWLEDGE: 2.5,
  STAT_COMPARE: 2,
  POOL: 1.5,
  QUALITY: 1,
  TRANSFORMATION: 1,
  SYNERGY: 1.5,
};

export function createGenerator({
  items,
  tags,
  synergies = [],
  difficulty = 'normal',
  seed = Date.now(),
  weights = DEFAULT_WEIGHTS,
  itemWeight = null, // (item) => number, e.g. Leitner due-ness. null = uniform
  historySize = 20,
  recentItemsSize = 30,
}) {
  const rng = createRng(seed);
  const byId = indexById(items);
  const history = []; // last question keys
  const recentList = []; // last shown item ids (FIFO)
  const recent = new Set();
  let lastType = null;
  let sameTypeStreak = 0;

  const ctx = {
    items,
    byId,
    tags,
    synergies,
    rng,
    difficulty,
    recent,
    weight: (it) => (itemWeight ? itemWeight(it) : 1),
  };

  function remember(q) {
    history.push(q.key);
    if (history.length > historySize) history.shift();
    for (const id of q.pedestals) {
      if (!recent.has(id)) {
        recentList.push(id);
        recent.add(id);
      }
    }
    for (const c of q.choices) {
      if (c.itemId && !recent.has(c.itemId)) {
        recentList.push(c.itemId);
        recent.add(c.itemId);
      }
    }
    while (recentList.length > recentItemsSize) recent.delete(recentList.shift());
  }

  function pickType(forceType) {
    if (forceType) return forceType;
    const entries = Object.entries(weights).filter(([t, w]) => w > 0 && GENERATORS[t]);
    const pool = sameTypeStreak >= 2 ? entries.filter(([t]) => t !== lastType) : entries;
    return rng.pickWeighted(pool.length ? pool : entries, ([, w]) => w)[0];
  }

  function next({ type: forceType } = {}) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const type = pickType(forceType);
      const q = GENERATORS[type](ctx);
      if (!q) continue;
      if (history.includes(q.key)) continue;
      // Don't repeat the exact same set of pedestals either.
      const setKey = q.pedestals.slice().sort().join(',');
      if (history.includes(`set:${setKey}`)) continue;
      remember(q);
      history.push(`set:${setKey}`);
      if (history.length > historySize * 2) history.shift();
      sameTypeStreak = type === lastType ? sameTypeStreak + 1 : 0;
      lastType = type;
      return q;
    }
    return null;
  }

  return { next, ctx, history, recent };
}

export function generateOne(type, opts) {
  return createGenerator(opts).next({ type });
}
