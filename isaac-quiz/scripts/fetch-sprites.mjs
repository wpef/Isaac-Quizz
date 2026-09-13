#!/usr/bin/env node
/**
 * Download Repentance collectible sprites into public/sprites/items/NNN.png
 *
 * Source: https://github.com/Rchardon/RebirthItemTracker (maintained fork of the
 * Rebirth Item Tracker, updated for Repentance+) — `collectibles/collectibles_NNN.png`,
 * 64x64 indexed PNGs (~500 bytes each), one per CollectibleType id.
 *
 *   node scripts/fetch-sprites.mjs           # download missing sprites
 *   node scripts/fetch-sprites.mjs --force   # re-download everything
 *
 * Runs at build/dev time only. The app never fetches anything external.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const ITEMS = path.join(ROOT, 'src/data/items.json');
const OUT_DIR = path.join(ROOT, 'public/sprites/items');
const BASE = 'https://raw.githubusercontent.com/Rchardon/RebirthItemTracker/main/collectibles';
const CONCURRENCY = 16;
const force = process.argv.includes('--force');

const pad = (id) => String(id).padStart(3, '0');

async function download(id) {
  const dest = path.join(OUT_DIR, `${pad(id)}.png`);
  if (!force && fs.existsSync(dest) && fs.statSync(dest).size > 0) return 'skip';
  const url = `${BASE}/collectibles_${pad(id)}.png`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return 'missing';
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      return 'ok';
    } catch (e) {
      if (attempt === 4) throw new Error(`${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}

async function main() {
  const items = JSON.parse(fs.readFileSync(ITEMS, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const ids = items.map((i) => i.id);
  const counts = { ok: 0, skip: 0, missing: 0 };
  const missing = [];
  let cursor = 0;
  async function worker() {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      const r = await download(id);
      counts[r]++;
      if (r === 'missing') missing.push(id);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Sprites: ${counts.ok} downloaded, ${counts.skip} already present, ${counts.missing} missing -> ${path.relative(ROOT, OUT_DIR)}`);
  if (missing.length) console.warn('Missing ids:', missing.join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
