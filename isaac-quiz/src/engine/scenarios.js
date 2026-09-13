// Hand-written theorycraft scenarios (src/data/scenarios.json) -> questions.
// Items are referenced by their exact Platinum God name and resolved to ids here; a
// scenario that references an unknown item is rejected (and caught by the tests).

export const SCENARIO_TYPES = ['BUILD_CHOICE', 'DEVIL_DEAL', 'ANTI_SYNERGY', 'PRIORITY'];

const DEFAULT_PROMPTS = {
  BUILD_CHOICE: 'Item room. Lequel tu prends ?',
  DEVIL_DEAL: 'Devil room. Tu fais quoi ?',
  ANTI_SYNERGY: 'Lequel est un piège avec ton build ?',
  PRIORITY: 'Lequel tu prends ?',
};

// Which scenario difficulties are served for a selected difficulty.
const ELIGIBLE = {
  normal: new Set(['normal', 'hard']),
  hard: new Set(['normal', 'hard', 'expert']),
  expert: new Set(['hard', 'expert']),
};

function byName(items) {
  const m = new Map();
  for (const it of items) m.set(it.name.toLowerCase(), it);
  return m;
}

/** Resolve item names to ids and validate. Returns { scenarios, errors }. */
export function resolveScenarios(raw, items) {
  const names = byName(items);
  const errors = [];
  const scenarios = [];
  const look = (name, where) => {
    const it = names.get(String(name).toLowerCase());
    if (!it) errors.push(`${where}: unknown item "${name}"`);
    return it ? it.id : null;
  };
  for (const s of raw) {
    const where = s.id || '?';
    if (!SCENARIO_TYPES.includes(s.type)) errors.push(`${where}: unknown type ${s.type}`);
    const held = (s.held || []).map((n) => look(n, where)).filter((x) => x !== null);
    const deals = (s.deals || []).map((d) => ({ itemId: look(d.item, where), price: d.price }));
    const options = (s.options || []).map((o, i) => ({
      index: i,
      itemId: o.item ? look(o.item, where) : null,
      label: o.label || (o.skip ? 'Je skip le deal' : null),
      correct: !!(o.best || o.trap),
      why: o.why || '',
    }));
    const correct = options.filter((o) => o.correct);
    if (correct.length !== 1) errors.push(`${where}: expected exactly one correct option, got ${correct.length}`);
    if (options.length < 2 || options.length > 3) errors.push(`${where}: expected 2 or 3 options`);
    for (const o of options) if (!o.itemId && !o.label) errors.push(`${where}: option ${o.index} has neither item nor label`);
    for (const o of options) if (!o.why) errors.push(`${where}: option ${o.index} has no explanation`);
    scenarios.push({
      id: s.id,
      type: s.type,
      difficulty: s.difficulty || 'normal',
      held,
      floor: s.floor || null,
      hp: s.hp || null,
      context: s.context || null,
      prompt: s.prompt || null,
      deals,
      options,
    });
  }
  return { scenarios, errors };
}

/** Build the question object for one scenario. */
export function scenarioToQuestion(s, rng) {
  const itemOptions = s.options.filter((o) => o.itemId !== null);
  // Pedestals: the deals (devil room) or the item options, shuffled.
  let pedestals;
  if (s.deals.length) pedestals = s.deals.map((d) => d.itemId);
  else pedestals = rng.shuffle(itemOptions.map((o) => o.itemId));
  const prices = {};
  for (const d of s.deals) prices[d.itemId] = d.price;

  const choices = [];
  const explanations = {};
  let correctId = null;
  let targetId = null;
  const order = rng.shuffle(s.options);
  // Pedestal choices follow the pedestal order so the UI matches; text choices come after.
  for (const id of pedestals) {
    const o = s.options.find((x) => x.itemId === id);
    if (!o) continue;
    choices.push({ id, itemId: id, label: null });
    explanations[id] = o.why;
    if (o.correct) { correctId = id; targetId = id; }
  }
  for (const o of order) {
    if (o.itemId !== null && pedestals.includes(o.itemId)) continue;
    const id = `opt:${s.id}:${o.index}`;
    choices.push({ id, label: o.label, itemId: o.itemId });
    explanations[id] = o.why;
    if (o.correct) correctId = id;
  }
  if (targetId === null) targetId = s.held[0] ?? pedestals[0] ?? null;

  const q = {
    type: s.type,
    key: `SCENARIO:${s.id}`,
    scenarioId: s.id,
    prompt: s.prompt || DEFAULT_PROMPTS[s.type],
    context: s.context,
    answerMode: pedestals.length && choices.some((c) => c.itemId && pedestals.includes(c.itemId)) ? 'pedestal' : 'text',
    pedestals,
    prices: Object.keys(prices).length ? prices : null,
    choices,
    correctId,
    targetId,
    explanations,
    held: s.held,
  };
  if (s.floor || s.hp) q.situation = { floor: s.floor, note: s.context };
  if (s.hp) q.hp = s.hp;
  return q;
}

/** Generator factory for one scenario type (used by the question generator). */
export function makeScenarioGenerator(type) {
  return function genScenario(ctx) {
    const pool = (ctx.scenarios || []).filter((s) => s.type === type && (ELIGIBLE[ctx.difficulty] || ELIGIBLE.normal).has(s.difficulty));
    if (!pool.length) return null;
    // Prefer scenarios not asked recently; SRS weight on the target item.
    const fresh = pool.filter((s) => !ctx.recentScenarios?.has(s.id));
    const cands = fresh.length ? fresh : pool;
    const s = ctx.rng.pickWeighted(cands, (sc) => {
      const best = sc.options.find((o) => o.correct);
      const item = best?.itemId ? ctx.byId.get(best.itemId) : (sc.held[0] ? ctx.byId.get(sc.held[0]) : null);
      return item ? ctx.weight(item) : 1;
    });
    return scenarioToQuestion(s, ctx.rng);
  };
}
