// ─────────────────────────────────────────────────────────────
// core/utils.js — Math helpers and formatters
// ─────────────────────────────────────────────────────────────

/**
 * Box-Muller transform: returns a standard-normal random variate.
 * Used in the Monte Carlo engine to generate correlated returns.
 */
function randn() {
  let u, v;
  do { u = Math.random(); } while (!u);
  do { v = Math.random(); } while (!v);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Linear-interpolation percentile on a pre-sorted array.
 * @param {number[]} sorted - Ascending sorted array
 * @param {number}   p      - Percentile (0–100)
 */
function pctVal(sorted, p) {
  const i  = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return lo === hi
    ? sorted[lo]
    : sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/**
 * Format a dollar value for display.
 * @param {number}  v     - Amount in USD
 * @param {boolean} short - If true, use compact notation ($1.23M, $456K)
 */
function fmt$(v, short = false) {
  if (!isFinite(v) || v < 0) return "$0";
  if (short) {
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${Math.round(v)}`;
  }
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
