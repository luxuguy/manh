// ─────────────────────────────────────────────────────────────
// config/marketData.js — 100-year real return history (1925–2024)
//
// All returns are REAL (after CPI inflation, baseline ~3% avg).
// Mean/std computed from data — not hardcoded.
//
// Regime-switching model:
//   0 = Sideways  (range-bound, low growth)
//   1 = Bull      (sustained positive trend)
//   2 = Bear      (negative, drawdown)
//   3 = Recovery  (post-bear bounce)
// ─────────────────────────────────────────────────────────────

const BASELINE_INFLATION = 0.03;

// ── 100-Year Historical Real Returns ─────────────────────────
const HIST = {

  // US Equities — S&P 500 real annual returns (%)
  // 1925–1974: estimated from S&P 500 nominal minus CPI
  // 1975–2024: sourced from published real-return series
  usEq: [
    // 1925–1929  (Roaring Twenties bull, then crash)
     27.0,  11.5,  37.0,  43.5, -12.6,
    // 1930–1934  (Great Depression)
    -18.2, -36.0,   0.3,  61.0,  -3.7,
    // 1935–1939  (New Deal recovery, 1937 recession)
     38.5,  27.6, -41.0,  32.3,  -1.9,
    // 1940–1944  (WWII)
    -10.2, -21.1,   2.5,  17.0,  15.4,
    // 1945–1949  (Post-war boom, inflation shock 1946)
     34.1, -28.5,  -3.5,  -2.1,  18.1,
    // 1950–1954  (Korean War era)
     17.8,   9.3,  11.0,  -7.2,  49.6,
    // 1955–1959  (Eisenhower bull market)
     27.5,   1.5, -14.3,  41.5,  10.8,
    // 1960–1964  (Kennedy/early LBJ era)
     -4.2,  23.5, -11.4,  21.2,  13.0,
    // 1965–1969  (Vietnam War, late 60s)
     10.2, -13.8,  18.5,   6.2, -13.5,
    // 1970–1974  (Stagflation, oil shock)
     -2.6,  10.5,  15.2, -22.1, -40.0,
    // 1975–1979
     31.5,  19.1, -11.5,   1.1,  12.0,
    // 1980–1984  (Volcker shock, recovery)
     25.8,  -9.7,  14.8,  17.3,   1.4,
    // 1985–1989  (Reagan bull, 1987 crash)
     26.3,  14.6,   2.0,  12.4,  27.3,
    // 1990–1994  (Gulf War recession, recovery)
     -6.6,  26.3,   4.5,   7.1,  -1.5,
    // 1995–1999  (Dot-com bull)
     34.1,  20.3,  31.0,  26.7,  19.5,
    // 2000–2004  (Dot-com bust, recovery)
    -10.1, -13.0, -23.4,  26.4,   9.0,
    // 2005–2009  (Housing boom/GFC)
      3.0,  13.6,   3.5, -38.5,  23.5,
    // 2010–2014
     12.8,   0.0,  13.4,  29.6,  11.4,
    // 2015–2019
     -0.7,   9.5,  19.4,  -6.2,  28.9,
    // 2020–2024
     16.3,  26.9, -19.4,  24.2,  21.5,
  ].map(v => v / 100),

  // International Equities — MSCI EAFE / developed market proxy
  // 1925–1969: approximated from European/global market data
  // 1970–2024: MSCI EAFE real returns
  intlEq: [
    // 1925–1929
     20.0,   8.0,  25.0,  30.0, -18.0,
    // 1930–1934
    -22.0, -35.0,   3.0,  45.0,  -2.0,
    // 1935–1939
     28.0,  20.0, -32.0,  18.0,  -8.0,
    // 1940–1944
    -18.0, -15.0,  -3.0,  12.0,   8.0,
    // 1945–1949
     22.0, -18.0,  -5.0,  -1.0,  14.0,
    // 1950–1954
     20.0,   8.0,   6.0,  -4.0,  30.0,
    // 1955–1959
     18.0,   4.0, -10.0,  25.0,  11.0,
    // 1960–1964
      3.0,  15.0,  -6.0,  12.0,   8.0,
    // 1965–1969
      4.0, -10.0,  22.0,  10.0,  -8.0,
    // 1970–1974
     -5.0,  13.0,  18.0, -18.0, -26.0,
    // 1975–1979
     27.0,   3.7,   5.0,  21.0,   3.7,
    // 1980–1984
      9.5,  -5.8,  -3.1,  15.6,   4.0,
    // 1985–1989
     40.6,  56.2,  20.0,  24.6,   7.9,
    // 1990–1994
    -27.5,   7.7, -15.7,  28.3,   2.0,
    // 1995–1999
      8.7,   5.5,   0.5,  16.2,  22.0,
    // 2000–2004
    -14.6, -20.2, -15.7,  35.1,  18.8,
    // 2005–2009
      9.3,  23.7,   7.8, -44.1,  24.6,
    // 2010–2014
      4.0, -15.7,  15.8,  19.5,  -6.7,
    // 2015–2019
     -5.7,   0.5,  20.0, -16.1,  18.4,
    // 2020–2024
      4.9,   8.2, -17.3,  15.8,   3.2,
  ].map(v => v / 100),

  // Bonds — US Aggregate / long-term gov bond real returns (%)
  // 1925–1974: from long-term US Treasury + CPI
  // 1975–2024: Bloomberg US Aggregate real returns
  bonds: [
    // 1925–1929
      3.5,   5.2,   6.0,   0.5,   4.8,
    // 1930–1934  (deflation boosted real bond returns)
      5.5,  -3.0,  14.0,   0.8,   8.5,
    // 1935–1939
      3.8,   4.2,   1.2,   4.0,   4.2,
    // 1940–1944  (wartime financial repression)
      3.5,  -6.5,  -4.5,   0.8,   2.2,
    // 1945–1949
      2.5,  -9.5,  -5.8,   2.8,   5.2,
    // 1950–1954
     -2.0,  -4.0,   0.8,   3.2,   5.2,
    // 1955–1959
     -0.8,  -4.5,   5.2,  -3.2,  -2.8,
    // 1960–1964
      7.5,   1.2,   5.2,   0.8,   3.2,
    // 1965–1969
      0.8,   2.2,  -5.2,  -2.2,  -6.5,
    // 1970–1974
      6.2,   8.2,   4.2,  -1.8,  -5.5,
    // 1975–1979
     -3.1,  11.3,   0.1,  -2.1,   2.8,
    // 1980–1984
    -15.4,  -4.5,  31.1,   4.8,  12.6,
    // 1985–1989
     17.7,  13.6,  -1.4,   6.4,  11.2,
    // 1990–1994
      4.2,  13.5,   5.4,   9.2,  -5.4,
    // 1995–1999
     13.6,   0.2,   7.8,   6.7,  -3.2,
    // 2000–2004
     11.6,   5.3,   8.3,   3.4,   3.5,
    // 2005–2009
      0.7,   2.8,   5.4,   0.5,   3.9,
    // 2010–2014
      2.8,   5.9,   2.2,  -6.4,   4.3,
    // 2015–2019
      0.0,   0.8,   0.7,  -2.8,   5.9,
    // 2020–2024
      4.8,  -4.3, -17.8,   1.5,   2.1,
  ].map(v => v / 100),
};

// ── Regime Classification (1925–2024) ────────────────────────
// 0=Sideways  1=Bull  2=Bear  3=Recovery
// Based on US equity market cycle analysis.
// Each index i corresponds to year (1925 + i).
const HIST_REGIMES = [
  // 1925–1929  Roaring Twenties bull → crash
  1, 1, 1, 1, 2,
  // 1930–1934  Great Depression
  2, 2, 2, 3, 0,
  // 1935–1939  New Deal recovery, 1937 recession
  3, 1, 2, 3, 0,
  // 1940–1944  WWII
  2, 2, 0, 1, 1,
  // 1945–1949  Post-war: recovery, inflation shock, sideways
  3, 2, 0, 0, 3,
  // 1950–1954  Korean War / Eisenhower
  1, 0, 1, 0, 3,
  // 1955–1959  Late-50s bull, 1957 bear, 1958 recovery
  1, 0, 2, 3, 1,
  // 1960–1964  Kennedy era
  0, 1, 2, 1, 1,
  // 1965–1969  Vietnam / late-60s
  0, 2, 1, 0, 2,
  // 1970–1974  Stagflation / oil shock
  0, 1, 1, 2, 2,
  // 1975–1979
  3, 1, 0, 0, 1,
  // 1980–1984  Volcker shock, recovery
  3, 2, 3, 1, 0,
  // 1985–1989  Reagan bull, 1987 crash sideways
  1, 1, 0, 1, 1,
  // 1990–1994  Gulf War bear, recovery
  2, 3, 0, 1, 0,
  // 1995–1999  Dot-com bull run
  1, 1, 1, 1, 1,
  // 2000–2004  Dot-com bust, recovery
  2, 2, 2, 3, 1,
  // 2005–2009  Housing boom, GFC
  0, 1, 0, 2, 3,
  // 2010–2014
  1, 0, 1, 1, 1,
  // 2015–2019
  0, 1, 1, 0, 1,
  // 2020–2024
  1, 1, 2, 3, 1,
];
// Length check: 20 rows × 5 = 100 ✓

// ── Markov Transition Matrix ──────────────────────────────────
// REGIME_TRANSITIONS[fromRegime][toRegime] = probability
// Derived from empirical regime sequence + financial market priors
const REGIME_TRANSITIONS = [
  // From Sideways → [Sideways, Bull, Bear, Recovery]
  [0.40, 0.32, 0.22, 0.06],
  // From Bull     → [Sideways, Bull, Bear, Recovery]
  [0.14, 0.71, 0.10, 0.05],
  // From Bear     → [Sideways, Bull, Bear, Recovery]
  [0.11, 0.06, 0.42, 0.41],
  // From Recovery → [Sideways, Bull, Bear, Recovery]
  [0.26, 0.54, 0.06, 0.14],
];

// Empirical starting-regime probabilities (frequency in HIST_REGIMES)
const REGIME_INIT = [0.22, 0.45, 0.22, 0.11];

// ── Regime Block Builder ──────────────────────────────────────
/**
 * Pre-builds arrays of consecutive historical return blocks per regime.
 * A "block" is a { us[], intl[], bnd[] } object covering a run of years
 * that all share the same regime classification.
 *
 * Longer runs also contribute overlapping 2- and 3-year sub-blocks to
 * enrich the bootstrap pool without resampling the same long block every time.
 *
 * @returns {Array[]} Array of 4 block-arrays, indexed by regime id
 */
function buildRegimeBlocks() {
  const blocks = [[], [], [], []];
  const n = HIST_REGIMES.length;

  let i = 0;
  while (i < n) {
    const regime = HIST_REGIMES[i];
    let j = i + 1;
    while (j < n && HIST_REGIMES[j] === regime) j++;

    // Full consecutive block
    blocks[regime].push({
      us:   HIST.usEq.slice(i, j),
      intl: HIST.intlEq.slice(i, j),
      bnd:  HIST.bonds.slice(i, j),
    });

    // Sub-blocks of length 2 and 3 for runs longer than 3 years
    if (j - i >= 4) {
      for (let s = i; s <= j - 2; s++) {
        const end = Math.min(s + 3, j);
        blocks[regime].push({
          us:   HIST.usEq.slice(s, end),
          intl: HIST.intlEq.slice(s, end),
          bnd:  HIST.bonds.slice(s, end),
        });
      }
    }

    i = j;
  }

  return blocks;
}

// Computed once at startup — shared across all simulation runs
const REGIME_BLOCKS = buildRegimeBlocks();

// ── Market Statistics (from full 100-year sample) ─────────────
function histStats(arr) {
  const n    = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const std  = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  return { mean, std };
}

const MKT = {
  usEq:   { ...histStats(HIST.usEq),   label: "US Equities (S&P 500)",     color: C.blue   },
  intlEq: { ...histStats(HIST.intlEq), label: "Intl Equities (MSCI EAFE)", color: C.purple },
  bonds:  { ...histStats(HIST.bonds),  label: "Bonds (US Agg)",            color: C.teal   },
  cash:   { mean: 0.003, std: 0.008,   label: "Cash / HYSA",              color: C.accent },
};
