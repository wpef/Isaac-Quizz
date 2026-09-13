// Accuracy statistics per question type, per tag group and per item. localStorage only.
import { load, save } from './storage.js';

const KEY = 'stats';

export function loadStats() {
  return load(KEY, { types: {}, groups: {}, items: {}, total: 0, correct: 0, bestStreak: 0, runs: [] });
}

function inc(map, key, correct) {
  const e = map[key] || { n: 0, ok: 0 };
  e.n += 1;
  if (correct) e.ok += 1;
  map[key] = e;
}

export function recordStat(stats, question, correct, { items, tags, streak }) {
  const next = {
    ...stats,
    types: { ...stats.types },
    groups: { ...stats.groups },
    items: { ...stats.items },
    total: stats.total + 1,
    correct: stats.correct + (correct ? 1 : 0),
    bestStreak: Math.max(stats.bestStreak, streak),
  };
  inc(next.types, question.type, correct);
  const targetId = question.answerMode === 'pedestal' ? question.correctId : question.pedestals[0];
  const target = items.get(targetId);
  if (target) {
    const groups = new Set((target.tags || []).map((t) => tags[t]?.group).filter(Boolean));
    if (question.tag && tags[question.tag]) groups.add(tags[question.tag].group);
    for (const g of groups) inc(next.groups, g, correct);
    const e = next.items[targetId] || { n: 0, ok: 0 };
    next.items[targetId] = { n: e.n + 1, ok: e.ok + (correct ? 1 : 0) };
  }
  save(KEY, next);
  return next;
}

export function recordRun(stats, run) {
  const next = { ...stats, runs: [...(stats.runs || []), run].slice(-20) };
  save(KEY, next);
  return next;
}

export function mostMissed(stats, n = 10) {
  return Object.entries(stats.items)
    .map(([id, e]) => ({ id: Number(id), misses: e.n - e.ok, n: e.n }))
    .filter((x) => x.misses > 0)
    .sort((a, b) => b.misses - a.misses || b.n - a.n)
    .slice(0, n);
}

export function clearStats() {
  const empty = { types: {}, groups: {}, items: {}, total: 0, correct: 0, bestStreak: 0, runs: [] };
  save(KEY, empty);
  return empty;
}
