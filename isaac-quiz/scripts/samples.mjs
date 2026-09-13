#!/usr/bin/env node
// Regenerate docs/SAMPLES.md: 5 items from items.json and one question per type.
import fs from 'node:fs';
import path from 'node:path';
import { createGenerator, DEFAULT_WEIGHTS } from '../src/engine/index.js';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const items = read('src/data/items.json');
const tags = read('src/data/tags.json');
const synergies = read('src/data/synergies.json');
const scenarios = read('src/data/scenarios.json');
const byId = new Map(items.map((i) => [i.id, i]));

let md = '# Échantillons (générés par `npm run samples`)\n\n## items.json — 5 entrées\n\n```json\n';
md += JSON.stringify([1, 118, 12, 153, 732].map((id) => byId.get(id)), null, 2) + '\n```\n\n';
md += '## Une question par type servi par défaut (difficulté hard, seed 2026)\n\n';
const gen = createGenerator({ items, tags, synergies, scenarios, difficulty: 'hard', seed: 2026 });
for (const type of Object.keys(DEFAULT_WEIGHTS)) {
  const q = gen.next({ type });
  md += `### ${type}\n\n\`\`\`json\n${JSON.stringify({ ...q, _pedestals: q.pedestals.map((id) => byId.get(id).name) }, null, 2)}\n\`\`\`\n\n`;
}
fs.writeFileSync(path.join(ROOT, 'docs/SAMPLES.md'), md);
console.log('docs/SAMPLES.md written');
