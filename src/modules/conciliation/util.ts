// Small Levenshtein distance implementation and helpers for fuzzy comparisons

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(
        dp[j] + 1,       // deletion
        dp[j - 1] + 1,   // insertion
        prev + cost      // substitution
      );
      prev = tmp;
    }
  }
  return dp[n];
}

function normalizeStr(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

// Returns true if any substring of original (of similar length) is within maxDist of value.
export function approxInOriginal(original: string, value: string, maxDist: number): boolean {
  if (!original || !value) return false;
  const o = normalizeStr(original);
  const v = normalizeStr(value);
  if (o.includes(v)) return true;
  const L = v.length;
  if (L === 0) return false;
  // simple sliding window with stride 1, limited for performance
  const maxWindows = Math.min(o.length - L + 1, 2000);
  for (let i = 0; i < maxWindows; i++) {
    const sub = o.slice(i, i + L);
    if (levenshtein(sub, v) <= maxDist) return true;
  }
  return false;
}

// Fuzzy equality with Levenshtein threshold
export function fuzzyEqual(a?: string | number | null, b?: string | number | null, maxDist = 2): boolean {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  if (typeof a === 'number' || typeof b === 'number') return a === b;
  const sa = String(a).toLowerCase().trim();
  const sb = String(b).toLowerCase().trim();
  if (sa === sb) return true;
  return levenshtein(sa, sb) <= maxDist;
}
