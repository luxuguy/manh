// ─────────────────────────────────────────────────────────────
// core/engine.js — Regime-switching Monte Carlo retirement engine
//
// Algorithm:
//   1. Classify 100 years of history into 4 market regimes
//      (Bull, Bear, Recovery, Sideways)
//   2. Within each regime, use block bootstrapping — consecutive
//      historical years from that regime are sampled as a block,
//      preserving within-cycle autocorrelation
//   3. Use a Markov chain to transition between regimes, capturing
//      realistic market cycle persistence and mean-reversion
//
// This replaces the i.i.d. log-normal model with a regime-aware
// simulation that better reflects real market dynamics.
// ─────────────────────────────────────────────────────────────

// ── Regime Helpers ────────────────────────────────────────────

/**
 * Sample next regime from Markov transition matrix.
 * @param {number} regime - Current regime (0–3)
 * @returns {number} Next regime
 */
function markovTransition(regime) {
  const row = REGIME_TRANSITIONS[regime];
  const r = Math.random();
  let c = 0;
  for (let i = 0; i < row.length; i++) {
    c += row[i];
    if (r < c) return i;
  }
  return row.length - 1;
}

/**
 * Sample starting regime from empirical historical frequencies.
 * @returns {number} Initial regime (0–3)
 */
function sampleInitialRegime() {
  const r = Math.random();
  let c = 0;
  for (let i = 0; i < REGIME_INIT.length; i++) {
    c += REGIME_INIT[i];
    if (r < c) return i;
  }
  return 0;
}

/**
 * Draw a random block of consecutive historical returns for a given regime.
 * Falls back to a single-year average if no blocks exist (shouldn't happen).
 * @param {number} regime - Target regime (0–3)
 * @returns {Array} Array of { us, intl, bnd } annual return objects
 */
function sampleRegimeBlock(regime) {
  const pool = REGIME_BLOCKS[regime];

  if (!pool || pool.length === 0) {
    // Fallback: compute average returns for this regime from raw history
    const idx = HIST_REGIMES.reduce((a, r, i) => (r === regime ? [...a, i] : a), []);
    const avg = arr => idx.length ? idx.reduce((a, i) => a + arr[i], 0) / idx.length : 0;
    return [{ us: avg(HIST.usEq), intl: avg(HIST.intlEq), bnd: avg(HIST.bonds) }];
  }

  // Pick a uniformly random block from this regime's pool
  const block = pool[Math.floor(Math.random() * pool.length)];

  return block.us.map((_, k) => ({
    us:   block.us[k],
    intl: block.intl[k],
    bnd:  block.bnd[k],
  }));
}

// ── Monte Carlo Simulation ────────────────────────────────────

/**
 * Run regime-switching Monte Carlo retirement simulations.
 *
 * Each simulation year's return is drawn via:
 *   1. Start in a regime (sampled from empirical distribution)
 *   2. Sample a consecutive historical block from that regime
 *   3. Work through the block year-by-year
 *   4. When block exhausted → Markov-transition to next regime
 *   5. Repeat until retirement duration covered
 *
 * Inflation adjustment: historical data embeds ~3% CPI baseline.
 * If user selects a different rate, each asset return is shifted by
 * inflAdj = -(userInflation - 0.03), so higher inflation lowers real returns.
 *
 * @param {object} params
 * @param {number} params.portfolio   - Starting portfolio value ($)
 * @param {number} params.usEqPct     - US equity allocation (0–1)
 * @param {number} params.intlEqPct   - Intl equity allocation (0–1)
 * @param {number} params.bndPct      - Bond allocation (0–1)
 * @param {number} params.cshPct      - Cash allocation (0–1)
 * @param {number} params.years       - Retirement duration
 * @param {string} params.strategy    - Withdrawal strategy ID
 * @param {number} params.grossAnnWd  - Annual gross withdrawal ($)
 * @param {number} params.wdRate      - Withdrawal rate for % strategies
 * @param {Array}  params.incomes     - Income source objects
 * @param {Array}  params.extras      - Extra expense objects
 * @param {number} params.runs        - Number of simulation runs
 * @param {number} params.inflation   - User inflation assumption (0–1)
 * @returns {Array} Simulation result objects
 */
function monteCarlo({
  portfolio, usEqPct, intlEqPct, bndPct, cshPct,
  years, strategy, grossAnnWd, wdRate,
  incomes, extras, runs, inflation,
}) {
  // ── Inflation adjustment ──────────────────────────────────
  // Shift every historical return by the deviation from the 3% baseline
  // embedded in the data.  Higher user inflation → lower real returns.
  const inflAdj  = -(inflation - BASELINE_INFLATION);
  const cashReal = Math.max(-0.05, 0.015 - inflation);

  const results = [];

  for (let sim = 0; sim < runs; sim++) {
    let p  = portfolio;
    let wd = grossAnnWd;
    const pp = [p];        // portfolio values, one per year-end
    const wp = [wd / 12];  // monthly withdrawal, one per year

    let depleted = false;
    let depY     = null;
    const initRate = portfolio > 0 ? grossAnnWd / portfolio : 0.04;

    // ── Regime-switching state ─────────────────────────────
    let regime   = sampleInitialRegime();
    let block    = sampleRegimeBlock(regime);   // current return block
    let blockPos = 0;

    for (let y = 0; y < years; y++) {
      if (depleted) { pp.push(0); wp.push(0); continue; }

      // Advance block; when exhausted → Markov-transition to new regime
      if (blockPos >= block.length) {
        regime   = markovTransition(regime);
        block    = sampleRegimeBlock(regime);
        blockPos = 0;
      }

      const yr = block[blockPos++];

      // ── Portfolio return for this year ─────────────────
      // Blended weighted return factor, with inflation shift applied
      // to each risky asset.  Cash uses its own real-return floor.
      const ret = usEqPct   * (1 + yr.us   + inflAdj)
                + intlEqPct * (1 + yr.intl  + inflAdj)
                + bndPct    * (1 + yr.bnd   + inflAdj)
                + cshPct    * (1 + cashReal);

      p = Math.max(0, p * ret);

      // ── Withdrawal amount for this year ───────────────
      const left = Math.max(1, years - y);
      let tw;

      if      (strategy === "constant")   tw = wd;
      else if (strategy === "pct")        tw = p * wdRate;
      else if (strategy === "one_n")      tw = p / left;
      else if (strategy === "vpw")        tw = p * Math.min(0.5, 1.35 / left);
      else if (strategy === "guyton_klinger") {
        const cr = wd / (p || 1);
        if      (cr > initRate * 1.20) wd *= 0.90;
        else if (cr < initRate * 0.80) wd *= 1.10;
        tw = wd;
      }
      else if (strategy === "endowment")  tw = 0.65 * wd + 0.35 * (p * wdRate);
      else tw = wd;

      // ── Income sources (entered in real/today's dollars) ──
      // All income amounts are treated as real (inflation-protected)
      // values — equivalent to COLA-adjusted Social Security or pension.
      const inc = incomes.reduce((a, s) =>
        y >= s.start && (s.forever || y < s.start + s.dur) ? a + s.amt : a, 0);

      // Extra withdrawals (real dollars)
      const ext = extras.reduce((a, e) =>
        y >= e.start && y < e.start + e.dur ? a + e.amt : a, 0);

      p = Math.max(0, p - Math.max(0, tw + ext - inc));

      if (p <= 0 && !depleted) { depleted = true; depY = y + 1; }

      wd = tw;
      pp.push(p);
      wp.push(Math.max(0, tw / 12));
    }

    results.push({ pp, wp, depleted, depY, final: pp.at(-1) });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────

/**
 * Aggregate simulation results into chart-ready statistics.
 * Output format unchanged — all consumers remain compatible.
 *
 * @param {Array}  sims  - Output of monteCarlo()
 * @param {number} years - Retirement duration
 * @returns {object} Percentile series, histograms, and summary stats
 */
function analyze(sims, years) {
  const n            = sims.length;
  const successCount = sims.filter(s => !s.depleted).length;
  const successRate  = (successCount / n) * 100;
  const finals       = sims.map(s => s.final).sort((a, b) => a - b);

  // ── Year-by-year percentile series ───────────────────────
  const portSeries = [], incSeries = [];
  for (let y = 0; y <= years; y++) {
    const pv = sims.map(s => s.pp[y] ?? 0).sort((a, b) => a - b);
    const wv = sims.map(s => s.wp[y] ?? 0).sort((a, b) => a - b);
    const mk = arr => ({
      year: y,
      p5:  pctVal(arr,  5), p10: pctVal(arr, 10),
      p25: pctVal(arr, 25), p50: pctVal(arr, 50),
      p75: pctVal(arr, 75), p90: pctVal(arr, 90),
      p95: pctVal(arr, 95),
    });
    portSeries.push(mk(pv));
    incSeries.push(mk(wv));
  }

  // ── Convert to stacked fan-chart format ──────────────────
  const toFan = s => s.map(d => ({
    year:    d.year,
    base:    d.p5,
    lo:      Math.max(0, d.p25 - d.p5),
    mid_lo:  Math.max(0, d.p50 - d.p25),
    mid_hi:  Math.max(0, d.p75 - d.p50),
    hi:      Math.max(0, d.p95 - d.p75),
    median:  d.p50,
    raw_p5:  d.p5,  raw_p25: d.p25, raw_p50: d.p50,
    raw_p75: d.p75, raw_p95: d.p95,
  }));

  // ── Final-portfolio histogram ─────────────────────────────
  const binN      = 26;
  const maxV      = finals.filter(Boolean).at(-1) || 1;
  const bSz       = maxV / binN;
  const zeroCount = finals.filter(f => f <= 0).length;
  const histogram = Array.from({ length: binN }, (_, i) => ({
    label: fmt$(i * bSz, true), count: 0,
  }));
  finals.filter(Boolean).forEach(v => {
    histogram[Math.min(binN - 1, Math.floor(v / bSz))].count++;
  });

  // ── Average-monthly-income histogram ─────────────────────
  const simAvgInc = sims.map(s => {
    const nz = s.wp.filter(v => v > 0);
    return nz.length ? nz.reduce((a, b) => a + b, 0) / nz.length : 0;
  }).sort((a, b) => a - b);
  const incMax      = simAvgInc.at(-1) || 1;
  const incBSz      = incMax / 20;
  const incHistogram = Array.from({ length: 20 }, (_, i) => ({
    label: `$${Math.round(i * incBSz / 100) * 100}`, count: 0,
  }));
  simAvgInc.filter(Boolean).forEach(v => {
    incHistogram[Math.min(19, Math.floor(v / incBSz))].count++;
  });

  // ── Sampled-year income percentile bars ──────────────────
  const sampleYears = Array.from(
    { length: Math.min(years + 1, 7) },
    (_, i) => Math.round(i * years / Math.min(years, 6))
  );
  const incByYear = sampleYears.map(y => ({
    year:   `Yr ${y}`,
    p10:    Math.round(incSeries[y]?.p10 || 0),
    median: Math.round(incSeries[y]?.p50 || 0),
    p90:    Math.round(incSeries[y]?.p90 || 0),
  }));

  // ── Depletion timeline ────────────────────────────────────
  const depMap = {};
  sims.filter(s => s.depleted).forEach(s => {
    depMap[s.depY] = (depMap[s.depY] || 0) + 1;
  });
  let cumDep = 0;
  const depTimeline = Array.from({ length: years + 1 }, (_, y) => {
    cumDep += depMap[y] || 0;
    return { year: y, cumPct: (cumDep / n) * 100 };
  });

  return {
    successRate, successCount, n,
    medianFinal:   pctVal(finals, 50),
    p10Final:      pctVal(finals, 10),
    p90Final:      pctVal(finals, 90),
    portFan:       toFan(portSeries),
    portSeries,
    incFan:        toFan(incSeries),
    incSeries,
    histogram,
    incHistogram,
    incByYear,
    zeroCount,
    depTimeline,
    medianMonthly: pctVal(simAvgInc, 50),
    p10Monthly:    pctVal(simAvgInc, 10),
    p90Monthly:    pctVal(simAvgInc, 90),
  };
}
