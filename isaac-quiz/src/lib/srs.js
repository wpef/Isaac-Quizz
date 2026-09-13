// Leitner spaced repetition over items (and question types), persisted in localStorage.
// Box 0 = just failed (due now), each success moves up a box and pushes the due date.
import { load, save } from './storage.js';

const KEY = 'srs';
const INTERVALS_MS = [0, 10 * 60e3, 60 * 60e3, 6 * 3600e3, 24 * 3600e3, 3 * 86400e3, 7 * 86400e3, 30 * 86400e3];
const MAX_BOX = INTERVALS_MS.length - 1;

export function loadSrs() {
  return load(KEY, { items: {}, types: {} });
}

function bump(entry, correct, now) {
  const e = entry || { box: 0, due: now, hits: 0, misses: 0, seen: 0 };
  e.seen += 1;
  if (correct) {
    e.hits += 1;
    e.box = Math.min(MAX_BOX, e.box + 1);
  } else {
    e.misses += 1;
    e.box = 0;
  }
  e.due = now + INTERVALS_MS[e.box];
  e.last = now;
  return e;
}

/**
 * Record an answer. The *target* item of the question is what we are learning; a wrong
 * pick also marks the picked item (the confusion goes both ways).
 */
export function recordAnswer(srs, question, choiceId, correct, now = Date.now()) {
  const next = { items: { ...srs.items }, types: { ...srs.types } };
  const targetId = question.answerMode === 'pedestal' ? question.correctId : question.pedestals[0];
  next.items[targetId] = bump(next.items[targetId], correct, now);
  if (!correct) {
    const picked = question.choices.find((c) => c.id === choiceId);
    if (picked?.itemId && picked.itemId !== targetId) {
      next.items[picked.itemId] = bump(next.items[picked.itemId], false, now);
    }
  }
  next.types[question.type] = bump(next.types[question.type], correct, now);
  save(KEY, next);
  return next;
}

export function dueItems(srs, now = Date.now()) {
  return Object.entries(srs.items)
    .filter(([, e]) => e.due <= now && e.misses > 0)
    .map(([id]) => Number(id));
}

/** Weight function for the generator: due / failed items come back a lot more often. */
export function makeItemWeight(srs, { review = false } = {}) {
  const now = Date.now();
  return (item) => {
    const e = srs.items[item.id];
    if (!e) return review ? 0.15 : 1;
    const due = e.due <= now;
    if (review) return due ? 4 + e.misses * 4 : 0.05 + e.misses * 0.2;
    return due ? 3 + e.misses * 2 : 1 / (1 + e.box);
  };
}

/** Type weights for review mode: types you fail more get asked more. */
export function makeTypeWeights(srs, base) {
  const out = {};
  for (const [type, w] of Object.entries(base)) {
    const e = srs.types[type];
    const failRate = e && e.seen ? e.misses / e.seen : 0.3;
    out[type] = w * (0.5 + failRate * 2);
  }
  return out;
}

export function clearSrs() {
  save(KEY, { items: {}, types: {} });
  return { items: {}, types: {} };
}
