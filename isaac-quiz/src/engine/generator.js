// Question generator with type weighting, anti-repetition and SRS weighting.
import { createRng } from './rng.js';
import { byId as indexById } from './items.js';
import { GENERATORS } from './questions.js';
import { resolveScenarios } from './scenarios.js';

// Decision questions dominate; recognition (icon / stat block) stays as a light background.
// The older generated types (PICK_BEST, NAME_QUIZ, KNOWLEDGE, STAT_COMPARE, POOL, QUALITY,
// TRANSFORMATION) remain available through `next({ type })` but are not served by default.
export const DEFAULT_WEIGHTS = {
  BUILD_CHOICE: 3,
  DEVIL_DEAL: 2.5,
  ANTI_SYNERGY: 2.5,
  PRIORITY: 2,
  SYNERGY: 1.5,
  ICON_QUIZ: 1,
  STAT_QUIZ: 1,
};

export function createGenerator({
  items,
  tags,
  synergies = [],
  scenarios = [],
  difficulty = 'normal',
  seed = Date.now(),
  weights = DEFAULT_WEIGHTS,
  itemWeight = null, // (item) => number, e.g. Leitner due-ness. null = uniform
  historySize = 20,
  recentItemsSize = 30,
}) {
  const rng = createRng(seed);
  const byId = indexById(items);
  const resolved = resolveScenarios(scenarios, items).scenarios;
  const recentScenarios = new Set();
  const recentScenarioList = [];
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
    scenarios: resolved,
    recentScenarios,
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
    if (q.scenarioId) {
      recentScenarios.add(q.scenarioId);
      recentScenarioList.push(q.scenarioId);
      // Scenario banks are finite: remember roughly the last third of each bank.
      while (recentScenarioList.length > 25) recentScenarios.delete(recentScenarioList.shift());
    }
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
      if (q.pedestals.length && history.includes(`set:${setKey}`)) continue;
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
