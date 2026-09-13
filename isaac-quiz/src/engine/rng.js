// Deterministic PRNG (mulberry32) so a seed always yields the same question sequence.
export function createRng(seed = Date.now()) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n) => Math.floor(next() * n);
  const pick = (arr) => (arr.length ? arr[int(arr.length)] : undefined);
  const shuffle = (arr) => {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  /** Weighted pick: weightFn(item) >= 0. Falls back to uniform when all weights are 0. */
  const pickWeighted = (arr, weightFn) => {
    if (!arr.length) return undefined;
    const weights = arr.map((x) => Math.max(0, weightFn(x) || 0));
    const total = weights.reduce((s, w) => s + w, 0);
    if (total <= 0) return pick(arr);
    let r = next() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  };
  return { next, int, pick, shuffle, sample, pickWeighted };
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
