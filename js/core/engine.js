// ─────────────────────────────────────────────────────────────
// core/engine.js — Monte Carlo simulation + statistical analysis
// ─────────────────────────────────────────────────────────────

/**
 * Run Monte Carlo retirement simulations.
 */
function monteCarlo({
  portfolio, usEqPct, intlEqPct, bndPct, cshPct,
  years, strategy, grossAnnWd, wdRate,
  incomes, extras, runs, inflation,
}) {
  const inflAdj  = -(inflation - BASELINE_INFLATION);
  const adjMean  = m => ({ ...m, mean: m.mean + inflAdj });
  const us       = adjMean(MKT.usEq);
  const intl     = adjMean(MKT.intlEq);
  const bnd      = adjMean(MKT.bonds);
  const cashReal = Math.max(-0.05, 0.015 - inflation);

  const lp = m => ({
    lm: Math.log(1 + m.mean) - 0.5 * m.std ** 2,
    ls: m.std,
  });
  const UL = lp(us), IL = lp(intl), BL = lp(bnd);

  const results = [];

  for (let sim = 0; sim < runs; sim++) {
    let p  = portfolio;
    let wd = grossAnnWd;
    const pp = [p];
    const wp = [wd / 12];

    let depleted = false;
    let depY     = null;
    const initRate = portfolio > 0 ? grossAnnWd / portfolio : 0.04;

    for (let y = 0; y < years; y++) {
      if (depleted) { pp.push(0); wp.push(0); continue; }

      const z0 = randn();
      const zU = 0.70 * z0 + Math.sqrt(0.51)   * randn();
      const zI = 0.65 * z0 + Math.sqrt(0.5775) * randn();
      const zB = 0.08 * z0 + Math.sqrt(0.9936) * randn();

      const ret = usEqPct   * Math.exp(UL.lm + UL.ls * zU)
                + intlEqPct * Math.exp(IL.lm + IL.ls * zI)
                + bndPct    * Math.exp(BL.lm + BL.ls * zB)
                + cshPct    * (1 + cashReal);

      p = Math.max(0, p * ret);

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

      const inc = incomes.reduce((a, s) =>
        y >= s.start && (s.forever || y < s.start + s.dur) ? a + s.amt : a, 0);
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
 * Trim histogram bins so there are no more than `maxZeros`
 * consecutive zero-count bins at the leading or trailing ends.
 *
 * @param {Array}  hist     - Array of {label, count} objects
 * @param {number} maxZeros - Max allowed leading/trailing zero bins (default 2)
 * @returns {Array} Trimmed histogram slice
 */
function trimHistogram(hist, maxZeros = 2) {
  const first = hist.findIndex(b => b.count > 0);
  if (first === -1) return hist.slice(0, maxZeros); // all-zero edge case

  // Walk backwards for last non-zero bin
  let last = hist.length - 1;
  while (last > 0 && hist[last].count === 0) last--;

  const start = Math.max(0, first - maxZeros);
  const end   = Math.min(hist.length, last + maxZeros + 1);
  return hist.slice(start, end);
}

// ─────────────────────────────────────────────────────────────

/**
 * Aggregate simulation results into chart-ready statistics.
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

  // ── Fan chart format ──────────────────────────────────────
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

  // ── Final-portfolio histogram ($100K fixed bins) ─────────
  const BIN_SIZE   = 100_000;                          // $100K resolution
  const zeroCount  = finals.filter(f => f <= 0).length;
  const nonZeroMax = finals.filter(f => f > 0).at(-1) || BIN_SIZE;
  const portBinN   = Math.ceil(nonZeroMax / BIN_SIZE) + 1;

  const histogramRaw = Array.from({ length: portBinN }, (_, i) => ({
    label: fmt$(i * BIN_SIZE, true),
    count: 0,
  }));
  // Depleted (value=0) runs are tracked via zeroCount; skip them here
  finals.filter(f => f > 0).forEach(v => {
    const idx = Math.min(portBinN - 1, Math.floor(v / BIN_SIZE));
    histogramRaw[idx].count++;
  });
  const histogram = trimHistogram(histogramRaw, 2);

  // ── Average-monthly-income histogram (dynamic bins) ──────
  const simAvgInc = sims.map(s => {
    const nz = s.wp.filter(v => v > 0);
    return nz.length ? nz.reduce((a, b) => a + b, 0) / nz.length : 0;
  }).sort((a, b) => a - b);
  const incMax  = simAvgInc.at(-1) || 1;
  const incBSz  = incMax / 20;
  const incHistRaw = Array.from({ length: 20 }, (_, i) => ({
    label: `$${Math.round(i * incBSz / 100) * 100}`, count: 0,
  }));
  simAvgInc.filter(Boolean).forEach(v => {
    incHistRaw[Math.min(19, Math.floor(v / incBSz))].count++;
  });
  const incHistogram = trimHistogram(incHistRaw, 2);

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
