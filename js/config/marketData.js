// ─────────────────────────────────────────────────────────────
// config/marketData.js — 100-year real return history (1925–2024)
//
// All returns are REAL (after CPI inflation).
// Mean/std are computed from the data — do not hardcode them.
//
// Sources:
//   US Equities   — S&P 500 total return minus CPI (Shiller/CRSP)
//   Intl Equities — MSCI EAFE (1970–2024); pre-1970 world ex-US proxy
//   Bonds         — Bloomberg US Agg (1976–2024); pre-1976 long-term
//                   US Treasury proxy adjusted for CPI
//
// To update data: add a new value to each array and the stats
// will recalculate automatically on next page load.
// ─────────────────────────────────────────────────────────────

// Baseline CPI inflation already embedded in the historical data (~3% avg)
const BASELINE_INFLATION = 0.03;

const HIST = {
  // ── US Equities — S&P 500 real annual returns (%) ──────────
  usEq: [
    // 1925–1929
     25.7,  10.4,  39.9,  45.4,  -8.4,
    // 1930–1934  (Great Depression: deflation boosts some real #s)
    -23.1, -37.8,   1.9,  52.8,  -2.9,
    // 1935–1939
     43.4,  32.0, -37.4,  33.9,   1.0,
    // 1940–1944  (WWII era)
    -10.7, -15.8,   8.5,  18.7,  17.8,
    // 1945–1949
     33.4, -15.1,  -7.6,  -2.4,  20.2,
    // 1950–1954
     30.0,  14.9,  16.2,  -1.8,  51.4,
    // 1955–1959
     32.1,   3.5, -13.4,  40.8,  10.3,
    // 1960–1964
     -1.0,  25.9,  -9.9,  20.8,  15.3,
    // 1965–1969
     10.4, -13.1,  20.4,   6.1, -13.8,
    // 1970–1974  (stagflation onset)
     -1.5,  10.7,  15.1, -21.5, -34.2,
    // 1975–1979  (existing 50-yr data begins)
     31.5,  19.1, -11.5,   1.1,  12.0,
    // 1980–1984
     25.8,  -9.7,  14.8,  17.3,   1.4,
    // 1985–1989
     26.3,  14.6,   2.0,  12.4,  27.3,
    // 1990–1994
     -6.6,  26.3,   4.5,   7.1,  -1.5,
    // 1995–1999
     34.1,  20.3,  31.0,  26.7,  19.5,
    // 2000–2004
    -10.1, -13.0, -23.4,  26.4,   9.0,
    // 2005–2009
      3.0,  13.6,   3.5, -38.5,  23.5,
    // 2010–2014
     12.8,   0.0,  13.4,  29.6,  11.4,
    // 2015–2019
     -0.7,   9.5,  19.4,  -6.2,  28.9,
    // 2020–2024
     16.3,  26.9, -19.4,  24.2,  21.5,
  ].map(v => v / 100),

  // ── International Equities — real annual returns (%) ───────
  // 1925–1969: World ex-US proxy (European & Pacific markets, CPI-adj)
  // 1970–2024: MSCI EAFE real returns
  intlEq: [
    // 1925–1929
     18.0,   7.5,  22.0,  26.0, -28.0,
    // 1930–1934
    -38.0, -47.0,  -5.0,  38.0,   4.0,
    // 1935–1939
     28.0,  23.0, -38.0,  18.0, -18.0,
    // 1940–1944  (WWII disruption; many markets closed or collapsed)
    -32.0, -28.0, -12.0,   8.0,  12.0,
    // 1945–1949
     35.0, -12.0,   3.0,   4.0,  12.0,
    // 1950–1954  (post-war European reconstruction)
     22.0,  14.0,   9.0,   4.0,  32.0,
    // 1955–1959
     23.0,   6.0,  -7.0,  28.0,  13.0,
    // 1960–1964
      5.0,  22.0,  -6.0,  13.0,   8.0,
    // 1965–1969
      6.0,  -7.0,  18.0,  12.0,  -8.0,
    // 1970–1974  (MSCI EAFE data begins 1970)
     -5.0,  23.0,  30.0, -18.0, -28.0,
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

  // ── Bonds — real annual returns (%) ────────────────────────
  // 1925–1975: Long-term US Treasury total return minus CPI
  // 1976–2024: Bloomberg US Aggregate real returns
  bonds: [
    // 1925–1929  (stable bond market, mild deflation boosts real)
      4.3,   6.8,  10.2,   2.2,   6.3,
    // 1930–1934  (deflation: high real bond returns)
      9.8,   5.4,  27.3,  -3.0,  12.0,
    // 1935–1939
      2.1,   5.9,  -4.0,   7.6,   7.1,
    // 1940–1944  (financial repression: yields held low, inflation erodes real)
      5.2,  -6.1,  -9.2,  -5.4,   0.2,
    // 1945–1949  (post-war inflation surge crushed real bond returns)
      7.9, -13.4, -17.0,  -5.0,   7.5,
    // 1950–1954
     -6.5, -10.5,  -0.7,   2.8,   6.5,
    // 1955–1959
     -1.7,  -8.6,   4.5,  -7.9,  -3.8,
    // 1960–1964
     12.3,  -0.6,   5.6,  -0.4,   2.5,
    // 1965–1969  (rising inflation hits bonds hard)
     -1.2,   0.2, -12.7,  -5.0, -11.3,
    // 1970–1974  (stagflation: bonds badly negative in real terms)
      6.5,   9.9,   2.3,  -8.0,  -8.8,
    // 1975–1979  (Bloomberg US Agg proxy begins)
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

/**
 * Compute mean and sample standard deviation from a return array.
 * Called once at startup — results cached in MKT.
 */
function histStats(arr) {
  const n    = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const std  = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  return { mean, std };
}

// Asset class registry — add new asset classes here
const MKT = {
  usEq:   { ...histStats(HIST.usEq),   label: "US Equities (S&P 500)",      color: C.blue   },
  intlEq: { ...histStats(HIST.intlEq), label: "Intl Equities (MSCI EAFE)",  color: C.purple },
  bonds:  { ...histStats(HIST.bonds),  label: "Bonds (US Agg)",             color: C.teal   },
  cash:   { mean: 0.003, std: 0.008,   label: "Cash / HYSA",               color: C.accent },
};
