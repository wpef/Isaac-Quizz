#!/usr/bin/env node
/**
 * Scrape https://platinumgod.co.uk/repentance and produce src/data/items.json
 *
 *   node scripts/scrape-items.mjs            # fetch + parse
 *   node scripts/scrape-items.mjs --cache    # reuse .cache/*.html if present
 *
 * Output: one entry per Repentance collectible (id 1..732, 718 items):
 *   { id, name, quality, type, subtype, recharge, pools, poolsRaw, pickup, description,
 *     unlock, stats, transformations, keywords, colors, tags }
 *
 * `tags` is left empty here and filled by scripts/tag-items.mjs (never at runtime).
 * `stats` is parsed from the Platinum God description; gaps are filled with the curated
 * numbers of the Rebirth Item Tracker (Rchardon/RebirthItemTracker).
 */
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const SRC_URL = 'https://platinumgod.co.uk/repentance';
const TRACKER_URL = 'https://raw.githubusercontent.com/Rchardon/RebirthItemTracker/main/items.json';
const CACHE_DIR = path.join(ROOT, '.cache');
const OUT = path.join(ROOT, 'src/data/items.json');
const useCache = process.argv.includes('--cache');

async function fetchText(url, cacheName) {
  const cacheFile = path.join(CACHE_DIR, cacheName);
  if (useCache && fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, 'utf8');
  const res = await fetch(url, { headers: { 'user-agent': 'isaac-theorycraft-trainer scraper' } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const text = await res.text();
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile, text);
  return text;
}

// ---------- pools ----------
const POOL_MAP = [
  [/^greed mode item room$/i, 'greed_item_room'],
  [/^greed mode shop$/i, 'greed_shop'],
  [/^greed mode devil room$/i, 'greed_devil'],
  [/^greed mode angel room$/i, 'greed_angel'],
  [/^item room$/i, 'item_room'],
  [/^devil room$/i, 'devil'],
  [/^angel room$/i, 'angel'],
  [/^boss room$/i, 'boss'],
  [/^ultra secret room$/i, 'ultra_secret'],
  [/^secret room$/i, 'secret'],
  [/^shop$/i, 'shop'],
  [/^curse room$/i, 'curse'],
  [/^library$/i, 'library'],
  [/^planetarium$/i, 'planetarium'],
  [/^challenge room$/i, 'challenge'],
  [/^(gold|golden|gold\/stone) chest$/i, 'golden_chest'],
  [/^red chest$/i, 'red_chest'],
  [/^old chest$/i, 'old_chest'],
  [/^wooden chest$/i, 'wooden_chest'],
  [/^mom'?s chest$/i, 'moms_chest'],
  [/^demon beggar$/i, 'demon_beggar'],
  [/^key beggar$/i, 'key_beggar'],
  [/^bomb beggar$/i, 'bomb_beggar'],
  [/^battery beggar$/i, 'battery_beggar'],
  [/^rotten beggar$/i, 'rotten_beggar'],
  [/^beggar$/i, 'beggar'],
  [/^crane game$/i, 'crane_game'],
  [/^(dead )?shopkeeper$/i, 'shopkeeper'],
  [/miniboss$/i, 'miniboss'],
  [/boss$/i, 'boss_drop'],
  [/^mushrooms$/i, 'mushroom'],
];
function normalizePools(raw) {
  const out = new Set();
  for (const part of raw.split(',')) {
    const p = part.trim();
    if (!p || /^none/i.test(p)) continue;
    const hit = POOL_MAP.find(([re]) => re.test(p));
    if (hit) out.add(hit[1]);
    else out.add(p.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
  }
  return [...out];
}

// ---------- stats parsing ----------
const STAT_NAMES = {
  damage: 'damage',
  tears: 'tears',
  speed: 'speed',
  luck: 'luck',
  range: 'range',
  'shot speed': 'shot_speed',
};
const TEMP_RE = /(current room|this room|for the room|rest of the room|temporar|until|while (held|active|in use)|per (tear|hit|kill)|each (room|floor|tear|kill|hit)|every (room|floor|hit|kill|time)|for \d+ seconds|on use|upon use|when used|if used|chance)/i;

function parseStatsFromText(paragraphs, active) {
  const stats = {};
  const add = (key, val) => {
    if (!Number.isFinite(val)) return;
    if (stats[key] === undefined) stats[key] = val;
  };
  for (const p of paragraphs) {
    // Skip conditional / temporary effects: they don't define the item's base stat line.
    if (TEMP_RE.test(p)) continue;
    // Actives only keep stats explicitly granted on pickup.
    if (active && !/picked up|pick up|when held|holding/i.test(p)) continue;

    // "+0.5 Tears Up", "-0.1 Speed", "+1 Damage Up", "+2.0 Range Up"
    const re = /([+-]\s?\d+(?:\.\d+)?)\s*(damage|tears|speed|luck|range|shot speed)\b(?:\s*(up|down))?/gi;
    let m;
    while ((m = re.exec(p))) {
      let v = parseFloat(m[1].replace(/\s/g, ''));
      if (m[3] && /down/i.test(m[3]) && v > 0) v = -v;
      add(STAT_NAMES[m[2].toLowerCase()], v);
    }
    // "x1.5 Damage Multiplier", "x2 Damage", "1.5x damage multiplier", "Damage x 1.5"
    const mult = /(?:x\s?(\d+(?:\.\d+)?)\s*(damage|tears)(?:\s*multiplier)?|(\d+(?:\.\d+)?)\s?x\s*(damage|tears)\s*multiplier|(damage|tears)\s*(?:multiplier)?\s*x\s?(\d+(?:\.\d+)?))/gi;
    while ((m = mult.exec(p))) {
      const val = parseFloat(m[1] || m[3] || m[6]);
      const which = (m[2] || m[4] || m[5]).toLowerCase();
      add(which === 'damage' ? 'damage_multiplier' : 'tears_multiplier', val);
    }
    // Hearts
    const hp = /\+(\d+)\s*(?:red\s*)?heart containers?/i.exec(p);
    if (hp) add('hp', parseInt(hp[1], 10));
    const soul = /\+(\d+)\s*soul hearts?/i.exec(p);
    if (soul) add('soul_hearts', parseInt(soul[1], 10));
    const black = /\+(\d+)\s*black hearts?/i.exec(p);
    if (black) add('black_hearts', parseInt(black[1], 10));
    const bone = /\+(\d+)\s*bone hearts?/i.exec(p);
    if (bone) add('bone_hearts', parseInt(bone[1], 10));
    const full = /(gives|grants) (?:isaac )?(\d+|one|two|three) (?:full )?(?:red )?heart containers?/i.exec(p);
    if (full) add('hp', { one: 1, two: 2, three: 3 }[full[2].toLowerCase()] ?? parseInt(full[2], 10));
  }
  return stats;
}

const TRACKER_KEYS = {
  dmg: 'damage',
  dmg_x: 'damage_multiplier',
  tears: 'tears',
  tears_x: 'tears_multiplier',
  speed: 'speed',
  luck: 'luck',
  range: 'range',
  shot_speed: 'shot_speed',
  health: 'hp',
  soul_hearts: 'soul_hearts',
  sin_hearts: 'black_hearts',
  bone_hearts: 'bone_hearts',
};
const TRACKER_TRANSFORMS = ['guppy', 'leviathan', 'beelzebub', 'funguy', 'spiderbaby', 'bookworm', 'seraphim', 'yesmother', 'bob', 'spun', 'ohcrap', 'superbum'];

// Platinum God values (Repentance units) win; the tracker (Rebirth-era units for
// range/tears) only fills the gaps, e.g. multipliers and hearts that the text doesn't state.
function mergeTrackerStats(stats, tracker) {
  if (!tracker) return stats;
  const out = { ...stats };
  for (const [tk, key] of Object.entries(TRACKER_KEYS)) {
    if (tracker[tk] !== undefined && out[key] === undefined) {
      const v = parseFloat(tracker[tk]);
      if (Number.isFinite(v)) out[key] = v;
    }
  }
  return out;
}

// ---------- colors from Platinum God search keywords ----------
const COLORS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'grey', 'gray', 'gold', 'golden', 'silver', 'tan', 'beige', 'cyan', 'teal', 'lime'];

// ---------- main ----------
async function main() {
  console.log('Fetching', SRC_URL);
  const html = await fetchText(SRC_URL, 'platinumgod.html');
  let tracker = {};
  try {
    tracker = JSON.parse(await fetchText(TRACKER_URL, 'tracker-items.json'));
    console.log('Tracker stats loaded:', Object.keys(tracker).length, 'entries');
  } catch (e) {
    console.warn('Tracker items.json unavailable, keeping text-parsed stats only:', e.message);
  }

  const $ = load(html);
  const items = new Map();

  $('li.textbox').each((_, li) => {
    const $li = $(li);
    const idText = $li.find('.r-itemid').first().text().trim();
    const idMatch = /^ItemID:\s*(\d+)/.exec(idText);
    if (!idMatch) return; // trinkets, cards...
    const id = parseInt(idMatch[1], 10);
    if (items.has(id)) return;

    const name = $li.find('.item-title').first().text().trim();
    const pickup = $li.find('.pickup').first().text().trim().replace(/^"|"$/g, '');
    const qualityText = $li.find('.quality').first().text();
    const qm = /Quality:\s*(\d)/.exec(qualityText);
    const quality = qm ? parseInt(qm[1], 10) : null;
    const unlock = $li.find('.r-unlock').first().text().trim().replace(/^Unlock this item by\s*/i, '');

    const paragraphs = [];
    $li.find('span > p').each((__, p) => {
      const $p = $(p);
      if ($p.is('.item-title, .r-itemid, .pickup, .quality, .r-unlock, .tags')) return;
      const t = $p.text().replace(/\s+/g, ' ').trim();
      if (t) paragraphs.push(t);
    });
    let typeRaw = '';
    let poolsRaw = '';
    let recharge = '';
    $li.find('ul p').each((__, p) => {
      const t = $(p).text().replace(/\s+/g, ' ').trim();
      if (/^Type:/i.test(t)) typeRaw = t.replace(/^Type:\s*/i, '');
      else if (/^Item Pool:/i.test(t)) poolsRaw = t.replace(/^Item Pool:\s*/i, '');
      else if (/^Recharge Time:/i.test(t)) recharge = t.replace(/^Recharge Time:\s*/i, '');
    });
    const active = /active/i.test(typeRaw) && !/^passive/i.test(typeRaw);
    const type = active ? 'active' : 'passive';
    const subtype = /familiar/i.test(typeRaw) ? 'familiar'
      : /orbital/i.test(typeRaw) ? 'orbital'
      : /tear modifier/i.test(typeRaw) ? 'tear_modifier'
      : /bomb modifier/i.test(typeRaw) ? 'bomb_modifier'
      : null;

    const tagsText = $li.find('.tags').first().text().replace(/^\*\s*,?\s*/, '');
    const keywords = tagsText.split(',').map((s) => s.trim().toLowerCase()).filter((s) => s && s !== '*');
    const colors = [...new Set(keywords.filter((k) => COLORS.includes(k)).map((k) => (k === 'gray' ? 'grey' : k === 'golden' ? 'gold' : k)))];

    const parsedStats = parseStatsFromText(paragraphs, active);
    const stats = mergeTrackerStats(parsedStats, tracker[String(id)]);
    const trackerTransforms = tracker[String(id)]
      ? TRACKER_TRANSFORMS.filter((t) => tracker[String(id)][t])
      : [];

    items.set(id, {
      id,
      name,
      quality,
      type,
      subtype,
      typeRaw,
      recharge: active ? recharge || null : null,
      pools: normalizePools(poolsRaw),
      poolsRaw,
      pickup,
      description: paragraphs.join('\n'),
      unlock: unlock || null,
      stats,
      transformations: trackerTransforms,
      keywords,
      colors,
      tags: [],
    });
  });

  const list = [...items.values()].sort((a, b) => a.id - b.id);
  // Preserve tags from a previous run (tag-items.mjs output) so re-scraping doesn't wipe them.
  if (fs.existsSync(OUT)) {
    try {
      const prev = new Map(JSON.parse(fs.readFileSync(OUT, 'utf8')).map((it) => [it.id, it]));
      for (const it of list) {
        const p = prev.get(it.id);
        if (p && Array.isArray(p.tags) && p.tags.length) it.tags = p.tags;
      }
    } catch { /* ignore */ }
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(list, null, 1) + '\n');
  const withStats = list.filter((i) => Object.keys(i.stats).length).length;
  console.log(`Wrote ${list.length} items to ${path.relative(ROOT, OUT)} (${withStats} with numeric stats)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
