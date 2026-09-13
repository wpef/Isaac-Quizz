import { describe, it, expect } from 'vitest';
import items from '../data/items.json';
import tags from '../data/tags.json';
import synergies from '../data/synergies.json';
import scenarios from '../data/scenarios.json';
import { resolveScenarios, scenarioToQuestion, SCENARIO_TYPES, createGenerator, DEFAULT_WEIGHTS } from './index.js';
import { createRng } from './rng.js';

const byId = new Map(items.map((i) => [i.id, i]));

describe('scenario bank', () => {
  const { scenarios: resolved, errors } = resolveScenarios(scenarios, items);

  it('resolves every item name and has exactly one correct option per scenario', () => {
    expect(errors).toEqual([]);
    expect(resolved.length).toBe(scenarios.length);
  });

  it('has unique ids and covers every scenario type at several difficulties', () => {
    const ids = scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const type of SCENARIO_TYPES) {
      const ofType = scenarios.filter((s) => s.type === type);
      expect(ofType.length).toBeGreaterThanOrEqual(15);
      expect(new Set(ofType.map((s) => s.difficulty)).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('converts every scenario to a valid question', () => {
    const rng = createRng(1);
    for (const s of resolved) {
      const q = scenarioToQuestion(s, rng);
      expect(q.type).toBe(s.type);
      expect(q.prompt.length).toBeGreaterThan(5);
      const ids = q.choices.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.filter((id) => id === q.correctId)).toHaveLength(1);
      for (const c of q.choices) expect(typeof q.explanations[c.id]).toBe('string');
      for (const id of q.pedestals) expect(byId.has(id)).toBe(true);
      for (const id of q.held) expect(byId.has(id)).toBe(true);
      if (q.prices) for (const id of Object.keys(q.prices)) expect(q.pedestals).toContain(Number(id));
      if (q.answerMode === 'pedestal') expect(q.pedestals.length).toBeGreaterThan(0);
      if (q.targetId !== null) expect(byId.has(q.targetId)).toBe(true);
    }
  });

  it('devil deals show prices and offer a way out (skip / rule option) when relevant', () => {
    const deals = resolved.filter((s) => s.type === 'DEVIL_DEAL' && s.deals.length);
    expect(deals.length).toBeGreaterThan(5);
    for (const s of deals) {
      const q = scenarioToQuestion(s, createRng(2));
      expect(q.prices).toBeTruthy();
      expect(q.choices.some((c) => !c.itemId || !q.pedestals.includes(c.itemId))).toBe(true);
    }
  });
});

describe('generator with scenarios', () => {
  it('serves every default type and never repeats a scenario within 25 questions', () => {
    const gen = createGenerator({ items, tags, synergies, scenarios, difficulty: 'hard', seed: 77 });
    const seen = new Set();
    const recentScenarios = [];
    for (let i = 0; i < 120; i++) {
      const q = gen.next();
      expect(q).toBeTruthy();
      seen.add(q.type);
      if (q.scenarioId) {
        expect(recentScenarios.slice(-25)).not.toContain(q.scenarioId);
        recentScenarios.push(q.scenarioId);
      }
    }
    for (const t of Object.keys(DEFAULT_WEIGHTS)) expect(seen.has(t)).toBe(true);
  });

  it('STAT_QUIZ: the correct label is the real stat line of the shown item', () => {
    const gen = createGenerator({ items, tags, synergies, scenarios, difficulty: 'expert', seed: 5 });
    for (let i = 0; i < 20; i++) {
      const q = gen.next({ type: 'STAT_QUIZ' });
      expect(q.pedestals).toHaveLength(1);
      const labels = q.choices.map((c) => c.label);
      expect(new Set(labels).size).toBe(3);
      expect(q.targetId).toBe(q.pedestals[0]);
    }
  });

  it('normal difficulty never serves expert-only scenarios', () => {
    const gen = createGenerator({ items, tags, synergies, scenarios, difficulty: 'normal', seed: 9 });
    const byScenario = new Map(scenarios.map((s) => [s.id, s]));
    for (let i = 0; i < 60; i++) {
      const q = gen.next();
      if (q.scenarioId) expect(byScenario.get(q.scenarioId).difficulty).not.toBe('expert');
    }
  });
});
