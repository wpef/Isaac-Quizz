import { describe, it, expect } from 'vitest';
import items from '../data/items.json';
import tags from '../data/tags.json';
import synergies from '../data/synergies.json';
import { createGenerator, GENERATORS, DEFAULT_WEIGHTS } from './index.js';

const byId = new Map(items.map((i) => [i.id, i]));
const TYPES = Object.keys(GENERATORS);
const DIFFS = ['normal', 'hard', 'expert'];

function assertValid(q, type) {
  expect(q).toBeTruthy();
  expect(q.type).toBe(type);
  expect(typeof q.prompt).toBe('string');
  expect(q.prompt.length).toBeGreaterThan(5);
  expect(q.choices.length).toBeGreaterThanOrEqual(2);
  expect(q.choices.length).toBeLessThanOrEqual(3);
  // Exactly one correct answer, present in the choices
  const ids = q.choices.map((c) => c.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.filter((id) => id === q.correctId)).toHaveLength(1);
  // Every choice has an explanation
  for (const c of q.choices) expect(typeof q.explanations[c.id]).toBe('string');
  // Pedestal items exist
  expect(q.pedestals.length).toBeGreaterThanOrEqual(1);
  for (const id of q.pedestals) expect(byId.has(id)).toBe(true);
  expect(new Set(q.pedestals).size).toBe(q.pedestals.length);
  if (q.answerMode === 'pedestal') {
    for (const c of q.choices) expect(q.pedestals).toContain(c.itemId);
  }
}

describe('each generator produces valid questions', () => {
  for (const type of TYPES) {
    for (const difficulty of DIFFS) {
      it(`${type} / ${difficulty}`, () => {
        const gen = createGenerator({ items, tags, synergies, difficulty, seed: 42 });
        let count = 0;
        for (let i = 0; i < 15; i++) {
          const q = gen.next({ type });
          if (!q) continue; // anti-repetition may exhaust small pools (synergies)
          assertValid(q, type);
          count++;
        }
        expect(count).toBeGreaterThanOrEqual(type === 'SYNERGY' ? 8 : 12);
      });
    }
  }
});

describe('answers are objectively derived from data', () => {
  it('PICK_BEST winner has the strictly best goal score', () => {
    const gen = createGenerator({ items, tags, synergies, difficulty: 'expert', seed: 7 });
    for (let i = 0; i < 30; i++) {
      const q = gen.next({ type: 'PICK_BEST' });
      if (!q) continue;
      const { GOALS } = require('./items.js');
      const score = GOALS[q.goal].score;
      const winner = score(byId.get(q.correctId));
      for (const id of q.pedestals) {
        if (id === q.correctId) continue;
        expect(score(byId.get(id)) ?? 0).toBeLessThan(winner);
      }
      if (GOALS[q.goal].situation) expect(q.hp).toBeTruthy();
      else expect(q.hp).toBeUndefined();
    }
  });

  it('STAT_COMPARE winner has the highest stat', () => {
    const gen = createGenerator({ items, tags, synergies, difficulty: 'hard', seed: 3 });
    const { statScore } = require('./items.js');
    for (let i = 0; i < 30; i++) {
      const q = gen.next({ type: 'STAT_COMPARE' });
      const w = statScore(byId.get(q.correctId), q.stat);
      for (const id of q.pedestals) if (id !== q.correctId) expect(statScore(byId.get(id), q.stat)).toBeLessThan(w);
    }
  });

  it('KNOWLEDGE / TRANSFORMATION: only the correct item carries the tag', () => {
    for (const type of ['KNOWLEDGE', 'TRANSFORMATION']) {
      const gen = createGenerator({ items, tags, synergies, difficulty: 'hard', seed: 11 });
      for (let i = 0; i < 30; i++) {
        const q = gen.next({ type });
        expect(byId.get(q.correctId).tags).toContain(q.tag);
        for (const id of q.pedestals) if (id !== q.correctId) expect(byId.get(id).tags).not.toContain(q.tag);
      }
    }
  });

  it('POOL / QUALITY / NAME_QUIZ answers match the item', () => {
    const gen = createGenerator({ items, tags, synergies, difficulty: 'normal', seed: 5 });
    for (let i = 0; i < 20; i++) {
      const p = gen.next({ type: 'POOL' });
      expect(byId.get(p.pedestals[0]).pools[0]).toBe(p.correctId.replace('pool:', ''));
      for (const c of p.choices) if (c.id !== p.correctId) expect(byId.get(p.pedestals[0]).pools).not.toContain(c.id.replace('pool:', ''));
      const q = gen.next({ type: 'QUALITY' });
      expect(`q:${byId.get(q.pedestals[0]).quality}`).toBe(q.correctId);
      const n = gen.next({ type: 'NAME_QUIZ' });
      expect(`item:${n.pedestals[0]}`).toBe(n.correctId);
      const labels = n.choices.map((c) => c.label);
      expect(new Set(labels).size).toBe(3);
    }
  });

  it('ICON_QUIZ shows the named item and two others', () => {
    const gen = createGenerator({ items, tags, synergies, difficulty: 'expert', seed: 9 });
    for (let i = 0; i < 20; i++) {
      const q = gen.next({ type: 'ICON_QUIZ' });
      expect(q.prompt).toContain(byId.get(q.correctId).name);
      const names = q.pedestals.map((id) => byId.get(id).name);
      expect(new Set(names).size).toBe(3);
    }
  });

  it('SYNERGY uses the hand-written file', () => {
    const gen = createGenerator({ items, tags, synergies, difficulty: 'normal', seed: 1 });
    const q = gen.next({ type: 'SYNERGY' });
    const entry = synergies.find((s) => s.with === q.held && s.best === q.correctId);
    expect(entry).toBeTruthy();
    expect(q.prompt).toContain(byId.get(q.held).name);
  });
});

describe('generator', () => {
  it('is deterministic for a given seed', () => {
    const a = createGenerator({ items, tags, synergies, seed: 123 });
    const b = createGenerator({ items, tags, synergies, seed: 123 });
    for (let i = 0; i < 10; i++) expect(a.next().key).toBe(b.next().key);
  });

  it('never repeats a question key within the last 20 and avoids recently seen items', () => {
    const gen = createGenerator({ items, tags, synergies, difficulty: 'hard', seed: 99 });
    const keys = [];
    const seen = [];
    for (let i = 0; i < 80; i++) {
      const q = gen.next();
      expect(q).toBeTruthy();
      const recentKeys = keys.slice(-20);
      expect(recentKeys).not.toContain(q.key);
      // The target item was not among the pedestals of the previous 5 questions.
      const recentItems = new Set(seen.slice(-5).flat());
      const targetId = q.answerMode === 'pedestal' ? q.correctId : q.pedestals[0];
      if (q.type !== 'SYNERGY') expect(recentItems.has(targetId)).toBe(false);
      keys.push(q.key);
      seen.push(q.pedestals);
    }
  });

  it('uses every question type over a long session', () => {
    const gen = createGenerator({ items, tags, synergies, seed: 2024 });
    const types = new Set();
    for (let i = 0; i < 120; i++) types.add(gen.next().type);
    for (const t of Object.keys(DEFAULT_WEIGHTS)) expect(types.has(t)).toBe(true);
  });

  it('SRS weight makes weighted items appear far more often', () => {
    const favourite = 118; // Brimstone
    const gen = createGenerator({
      items, tags, synergies, seed: 4, difficulty: 'hard',
      weights: { ICON_QUIZ: 1 }, recentItemsSize: 0,
      itemWeight: (it) => (it.id === favourite ? 500 : 1),
    });
    let hits = 0;
    for (let i = 0; i < 30; i++) {
      const q = gen.next();
      if (!q) continue;
      if (q.correctId === favourite) hits++;
      gen.history.length = 0; // allow repeats: we only test weighting here
    }
    expect(hits).toBeGreaterThan(10);
  });
});
