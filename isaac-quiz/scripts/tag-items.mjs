#!/usr/bin/env node
/**
 * Tag every item of src/data/items.json with the vocabulary of src/data/tags.json.
 * Runs ONCE, offline from the game: the result is frozen in items.json and committed.
 * Nothing here ever runs at runtime.
 *
 *   node scripts/tag-items.mjs               # LLM batch if ANTHROPIC_API_KEY is set, else heuristics
 *   node scripts/tag-items.mjs --heuristic   # force rule-based tagging (no network)
 *   node scripts/tag-items.mjs --llm         # force LLM tagging (fails without a key)
 *   node scripts/tag-items.mjs --only 118,12 # debug: tag a few ids and print them
 *
 * Objective tags (numeric stats, tracker transformation flags) are always derived from the
 * data; the LLM only decides the qualitative ones (flight, homing, tear modifier...) and
 * starts from the heuristic suggestion.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const ITEMS = path.join(ROOT, 'src/data/items.json');
const TAGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tags.json'), 'utf8'));
const VOCAB = new Set(Object.keys(TAGS));

const args = process.argv.slice(2);
const forceHeuristic = args.includes('--heuristic');
const forceLlm = args.includes('--llm');
const onlyArg = args[args.indexOf('--only') + 1];
const only = args.includes('--only') && onlyArg ? onlyArg.split(',').map(Number) : null;

// Same filter as the scraper: paragraphs describing temporary / conditional effects.
const TEMP_RE = /(current room|this room|for the room|rest of the room|temporar|until|while (held|active|in use)|per (tear|hit|kill)|each (room|floor|tear|kill|hit)|every (room|floor|hit|kill|time)|for \d+ seconds|on use|upon use|when used|if used|chance)/i;

function permanentText(item) {
  return item.description
    .split('\n')
    .filter((p) => !TEMP_RE.test(p))
    .filter((p) => item.type !== 'active' || /picked up|pick up|when held|holding/i.test(p))
    .join('\n');
}

const TRANSFORM_TAG = {
  guppy: 'guppy', leviathan: 'leviathan', beelzebub: 'beelzebub', funguy: 'fun_guy',
  spiderbaby: 'spider_baby', bookworm: 'bookworm', seraphim: 'seraphim', yesmother: 'yes_mother',
  bob: 'bob', spun: 'spun', ohcrap: 'oh_crap', superbum: 'super_bum',
};
const TRANSFORM_TEXT = {
  'guppy': 'guppy', 'leviathan': 'leviathan', 'beelzebub': 'beelzebub', 'fun guy': 'fun_guy',
  'spider baby': 'spider_baby', 'bookworm': 'bookworm', 'seraphim': 'seraphim', 'mom': 'yes_mother',
  'bob': 'bob', 'spun': 'spun', 'oh crap': 'oh_crap', 'super bum': 'super_bum', 'stompy': 'stompy',
  'conjoined': 'conjoined',
};

/** Tags that follow mechanically from the data — never overridden by the LLM. */
function objectiveTags(item) {
  const s = item.stats || {};
  const t = new Set();
  const dir = (key, up, down) => {
    if (s[key] > 0) t.add(up);
    if (s[key] < 0) t.add(down);
  };
  dir('damage', 'damage_up', 'damage_down');
  dir('tears', 'tears_up', 'tears_down');
  dir('speed', 'speed_up', 'speed_down');
  dir('luck', 'luck_up', 'luck_down');
  dir('range', 'range_up', 'range_down');
  dir('shot_speed', 'shot_speed_up', 'shot_speed_down');
  if (s.damage_multiplier > 1) { t.add('damage_multiplier'); t.add('damage_up'); }
  if (s.damage_multiplier > 0 && s.damage_multiplier < 1) t.add('damage_down');
  if (s.tears_multiplier > 1) t.add('tears_up');
  if (s.tears_multiplier > 0 && s.tears_multiplier < 1) t.add('tears_down');
  if (s.hp > 0) t.add('hp_up');
  if (s.soul_hearts > 0) t.add('soul_hearts');
  if (s.black_hearts > 0) t.add('black_hearts');
  if (s.bone_hearts > 0) t.add('bone_hearts');
  for (const tr of item.transformations || []) if (TRANSFORM_TAG[tr]) t.add(TRANSFORM_TAG[tr]);
  const re = /counts as 1 of 3 [^.\n]*? needed towards the ([^.\n]*?) transformation/gi;
  let m;
  while ((m = re.exec(item.description))) {
    const key = m[1].trim().toLowerCase();
    if (TRANSFORM_TEXT[key]) t.add(TRANSFORM_TEXT[key]);
  }
  if (item.type === 'active') t.add('active');
  if (/one time|1 time|single/i.test(item.recharge || '')) t.add('one_time_use');
  return t;
}

/** Rule-based qualitative tags (fallback and LLM seed). */
function heuristicTags(item) {
  const d = item.description;
  const perm = permanentText(item);
  const first2 = d.split('\n').slice(0, 2).join('\n');
  const first3 = d.split('\n').slice(0, 3).join('\n');
  const t = new Set();
  const has = (re, text = d) => re.test(text);

  if (has(/\bdamage up\b/i, perm) && !has(/damage down/i, perm)) t.add('damage_up');
  if (has(/\bdamage down\b/i, perm)) t.add('damage_down');
  if (has(/damage multiplier|times damage|x\d(\.\d+)? damage/i, perm) && !has(/x0\.\d+ damage|0\.\d+x damage/i, perm)) { t.add('damage_multiplier'); t.add('damage_up'); }
  if (has(/\btears up\b|rate of fire up|fire rate up|increases? (your |the )?(rate of fire|fire rate|tears)/i, perm)) t.add('tears_up');
  if (has(/\btears down\b|fire rate down|decreases? (your |the )?(rate of fire|fire rate|tears)/i, perm)) t.add('tears_down');
  if (has(/\bspeed up\b/i, perm)) t.add('speed_up');
  if (has(/\bspeed down\b/i, perm)) t.add('speed_down');
  if (has(/\bluck up\b/i, perm)) t.add('luck_up');
  if (has(/\bluck down\b/i, perm)) t.add('luck_down');
  if (has(/\brange up\b|range (greatly )?increased/i, perm)) t.add('range_up');
  if (has(/\brange down\b/i, perm)) t.add('range_down');
  if (has(/\bshot speed up\b/i, perm)) t.add('shot_speed_up');
  if (has(/\bshot speed down\b/i, perm)) t.add('shot_speed_down');
  if (has(/all stats up/i)) t.add('all_stats_up');
  if (has(/\bhp up\b|health up|\+\d+ (red )?heart containers?/i, perm)) t.add('hp_up');
  if (has(/\+\d+ soul hearts?|gives (isaac |you )?(\d+|a|an|one|two) soul hearts?/i, perm)) t.add('soul_hearts');
  if (has(/\+\d+ black hearts?|gives (isaac |you )?(\d+|a|an|one|two) black hearts?/i, perm)) t.add('black_hearts');
  if (has(/\+\d+ bone hearts?|gives (isaac |you )?(\d+|a|an|one|two) bone hearts?/i, perm)) t.add('bone_hearts');
  if (has(/\bheals?\b|\bhealing\b|restores? (all|full|your|\d|one|two)/i) && !has(/heals? enemies/i)) t.add('healing');
  if (has(/extra li(fe|ves)|respawns?|revives?|resurrect|brought back to life/i)) t.add('extra_life');
  if (has(/invincib|invulnerab/i)) t.add('invincibility');
  if (has(/\bshields?\b|blocks? (enemy )?(shots|projectiles|damage)|negates? (one|a) hit/i)) t.add('shield');
  if (item.type === 'passive' && has(/(ability|able) to fly\b|grants? (isaac |you )?(the ability to fly|flight)|\bflight\b|isaac can (now )?fly\b|gives (isaac |you )?(the ability to )?fly\b/i, first3)) t.add('flight');
  if (has(/increases? (the )?size of (your |isaac'?s )?(player|isaac|character|sprite)|\bsize up\b|makes isaac (much )?(bigger|larger)/i)) t.add('size_up');
  if (has(/teleport/i)) t.add('teleport');
  if (has(/\bre-?rolls?\b/i)) t.add('reroll');
  if (has(/\+\d+ coins?|spawns? (a |\d+ |several |random )?(random |golden )?(coins?|penn(y|ies)|nickels?|dimes?)|gives (you |isaac )?\d+ coins|drops? (a |\d+ )?(random )?(coins?|penn(y|ies))/i)) t.add('gives_coins');
  if (has(/\+\d+ keys?|spawns? (a |\d+ |random )?(random |golden )?keys?|gives (you |isaac )?\d+ keys|drops? (a |\d+ )?(random )?keys?/i)) t.add('gives_keys');
  if (has(/\+\d+ bombs?|spawns? (a |\d+ |random )?(random |golden )?bombs?|gives (you |isaac )?\d+ bombs|drops? (a |\d+ )?(random )?bombs?/i)) t.add('gives_bombs');
  if (item.subtype === 'familiar' || has(/^(a |an |spawns? (a|an) |summons? (a|an) |gives (isaac |you )?(a|an) )?[^.\n]{0,50}\bfamiliar\b/i, first2)) t.add('familiar');
  if (item.subtype === 'orbital' || has(/\borbit(s|al|ing)?\b[^.\n]{0,20}\b(isaac|around)|orbital familiar|circles? (around )?isaac/i)) t.add('orbital');
  const tearMod = item.subtype === 'tear_modifier' || has(/tears (are|become|will be|will now be) (now )?(replaced|turned|transformed)|instead of tears|replaces (isaac'?s |your )?tears|isaac (now )?(fires|shoots) (a |an )?(laser|knife|bomb|missile|sword|blade)/i, first2);
  if (tearMod) t.add('tear_modifier');
  if (tearMod && has(/\blasers?\b|brimstone/i, first2)) t.add('laser');
  if (tearMod && has(/\bknife|knives|blade|sword\b/i, first2)) t.add('knife');
  if (tearMod && has(/\bbombs?\b|missiles?|explosive/i, first2)) t.add('explosive_tears');
  if (has(/\bhoming\b/i)) t.add('homing');
  if (has(/\bpiercing\b|pierce through|pass(es)? through enemies/i)) t.add('piercing');
  if (has(/\bspectral\b/i)) t.add('spectral');
  if (has(/charge(d|s)? (shots?|tears?|attacks?|up)|holding (down )?the fire button|hold (down )?(the )?fire/i)) t.add('charge_shot');
  if (has(/(double|triple|quad|quadruple) shot|shoots? (two|three|four|2|3|4|\d+) tears (at once|at a time)|\btears? at once\b/i, first2)) t.add('multi_shot');
  if (has(/\bpoison/i)) t.add('poison');
  if (has(/explod|explosi/i)) t.add('explosive');
  if (has(/\bfear(ed|s)?\b|\bflee\b/i)) t.add('fear');
  if (has(/freez|frozen|petrif|turns? (enemies )?to stone/i)) t.add('freeze');
  if (has(/\bslow(s|ed|ing)? (down )?(enemies|nearby)|slowing enemies|slow(ing)? effect/i)) t.add('slow');
  if (has(/\bburn(s|ing)?\b|set(s)? (enemies )?on fire|fire damage/i)) t.add('burn');
  if (has(/\bcharm(s|ed|ing)?\b/i)) t.add('charm');
  if (has(/\bconfus(e|ed|ion|ing)\b/i)) t.add('confusion');
  if (has(/contact damage|damages? (any )?enemies (that |it |he |isaac )?touch|on contact with enemies|by touching/i)) t.add('contact_damage');
  if (has(/\bchance\b/i) && has(/\bluck\b/i)) t.add('luck_scaling');
  if (has(/(chance|guaranteed|100%)[^.\n]{0,60}devil(\s*\/\s*angel| or angel)? (room|deal)|devil(\s*\/\s*angel| or angel)? (room|deal)[^.\n]{0,60}(chance|guaranteed|100%|opening)|devil deals? (are |now )?(free|cost)|pay(ing)? for devil deals/i)) t.add('devil_deal_helper');
  if (has(/(chance|guaranteed|100%)[^.\n]{0,60}angel (room|deal)|angel (room|deal)[^.\n]{0,60}(chance|guaranteed|100%|opening)/i)) t.add('angel_deal_helper');
  if (has(/breaks? the (soft )?tears cap|ignores? the (normal )?fire rate cap|bypass(es)? the (tears|fire rate) cap|no (fire rate|tears) cap/i)) t.add('uncaps_tears');
  if (has(/damage cap|no damage limit|removes? the (damage )?limit/i)) t.add('uncaps_damage');
  if (has(/one time use|single use|disappears after (one |a single )?use|can only be used once/i)) t.add('one_time_use');
  if (has(/starts? with this item/i)) t.add('character_start');
  return t;
}

// ---------- LLM batch ----------
const MODEL = 'claude-opus-5';
const BATCH = 25;

function vocabPrompt() {
  return Object.entries(TAGS).map(([k, v]) => `- ${k}: ${v.desc}`).join('\n');
}

async function llmTagBatch(client, batch) {
  const payload = batch.map((it) => ({
    id: it.id,
    name: it.name,
    type: it.type,
    recharge: it.recharge,
    description: it.description.slice(0, 1200),
    suggested_tags: [...heuristicTags(it)],
  }));
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: {
      effort: 'medium',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['id', 'tags'],
                properties: {
                  id: { type: 'integer' },
                  tags: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    system: [
      {
        type: 'text',
        text:
          'You classify items of The Binding of Isaac: Repentance for a theorycraft trainer. ' +
          'For each item, return the exact set of tags that apply, using ONLY this vocabulary:\n' +
          vocabPrompt() +
          '\n\nRules: tag permanent effects of the item itself (not synergies mentioned in the text, ' +
          'not temporary on-use effects unless the tag is about actives). `suggested_tags` come from ' +
          'regex heuristics: keep the correct ones, drop the wrong ones, add missing ones. ' +
          'Return every item id you were given.',
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  });
  if (res.stop_reason === 'refusal') throw new Error('Model refused the batch');
  const text = res.content.find((b) => b.type === 'text')?.text ?? '{}';
  const parsed = JSON.parse(text);
  const out = new Map();
  for (const row of parsed.items || []) {
    out.set(row.id, new Set(row.tags.filter((t) => VOCAB.has(t))));
  }
  return out;
}

async function main() {
  const items = JSON.parse(fs.readFileSync(ITEMS, 'utf8'));
  const targets = only ? items.filter((i) => only.includes(i.id)) : items;
  const useLlm = forceLlm || (!forceHeuristic && !!process.env.ANTHROPIC_API_KEY);

  let llmTags = new Map();
  if (useLlm) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();
    console.log(`LLM tagging with ${MODEL}: ${targets.length} items in batches of ${BATCH}`);
    for (let i = 0; i < targets.length; i += BATCH) {
      const batch = targets.slice(i, i + BATCH);
      for (let attempt = 1; ; attempt++) {
        try {
          const res = await llmTagBatch(client, batch);
          for (const [id, tags] of res) llmTags.set(id, tags);
          break;
        } catch (e) {
          if (attempt >= 3) throw e;
          console.warn(`batch ${i / BATCH} failed (${e.message}), retrying...`);
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
      process.stdout.write(`\r${Math.min(i + BATCH, targets.length)}/${targets.length}`);
    }
    console.log();
  } else {
    console.log('Heuristic tagging (no ANTHROPIC_API_KEY or --heuristic)');
  }

  for (const it of targets) {
    const tags = new Set([...objectiveTags(it), ...(llmTags.get(it.id) ?? heuristicTags(it))]);
    it.tags = [...tags].filter((t) => VOCAB.has(t)).sort();
  }

  if (only) {
    for (const it of targets) console.log(it.id, it.name, '->', it.tags.join(', '));
    return;
  }
  fs.writeFileSync(ITEMS, JSON.stringify(items, null, 1) + '\n');
  const counts = {};
  for (const it of items) for (const t of it.tags) counts[t] = (counts[t] || 0) + 1;
  console.log('Tag coverage:', counts);
  console.log(`Tagged ${items.length} items (${useLlm ? 'llm' : 'heuristic'} mode)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
