// ─────────────────────────────────────────────────────────────
// components/tabs/Summary.jsx — Lifetime summary tab
//
// Shows: arc gauge + verdict, config recap table, outcome
//        probability cards, depletion timeline, recommendations
// ─────────────────────────────────────────────────────────────

function TabSummary({ res, ctx }) {
  const {
    successRate, successCount, n,
    medianFinal, zeroCount,
    histogram, depTimeline,
    medianMonthly, p10Monthly,
  } = res;

  const {
    srColor, strat, inflation,
    portfolio, alloc, years, runs,
    netAnnWd, grossAnnWd, taxAmount, effectiveRate, taxCountry,
    wdRate,
  } = ctx;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Gauge + Verdict ──────────────────────────────────── */}
      <Card style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flexShrink: 0 }}>
          <Gauge value={successRate} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>
            {successRate >= 95 ? "✅ Excellent — Very robust plan"
              : successRate >= 85 ? "🟡 Good — Mostly safe plan"
              : successRate >= 70 ? "⚠️ Moderate — Meaningful risk"
              : "🔴 High Risk — Needs adjustment"}
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.85 }}>
            Your <b style={{ color: C.text }}>{strat.label}</b> strategy succeeded in{" "}
            <b style={{ color: srColor }}>{successCount.toLocaleString()} of {n.toLocaleString()} scenarios</b>{" "}
            ({successRate.toFixed(1)}%) at <b style={{ color: C.orange }}>{(inflation * 100).toFixed(1)}% inflation</b>.
            {zeroCount > 0 && (
              <> In <b style={{ color: C.red }}>{zeroCount.toLocaleString()} runs</b> ({(zeroCount / n * 100).toFixed(1)}%), the portfolio was exhausted.</>
            )}
            {" "}Median ending portfolio: <b style={{ color: C.blue }}>{fmt$(medianFinal, true)}</b>.
            Median monthly gross income: <b style={{ color: C.green }}>{fmt$(medianMonthly)}</b>.
          </div>
        </div>
      </Card>

      {/* ── Config Recap ─────────────────────────────────────── */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>📋 Simulation Configuration</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {[
            ["Starting Portfolio",    fmt$(portfolio)],
            ["Retirement Duration",   `${years} years`],
            ["Inflation Assumption",  `${(inflation * 100).toFixed(1)}%/yr`],
            ["US Equities",           `${(alloc.us   * 100).toFixed(0)}%  μ=${(MKT.usEq.mean   * 100).toFixed(1)}% σ=${(MKT.usEq.std   * 100).toFixed(1)}%`],
            ["Intl Equities",         `${(alloc.intl * 100).toFixed(0)}%  μ=${(MKT.intlEq.mean * 100).toFixed(1)}% σ=${(MKT.intlEq.std * 100).toFixed(1)}%`],
            ["Bonds",                 `${(alloc.bnd  * 100).toFixed(0)}%  μ=${(MKT.bonds.mean  * 100).toFixed(1)}% σ=${(MKT.bonds.std  * 100).toFixed(1)}%`],
            ["Cash",                  `${(alloc.csh  * 100).toFixed(0)}%  real ${(Math.max(-0.05, 0.015 - inflation) * 100).toFixed(1)}%/yr`],
            ["Withdrawal Strategy",   strat.label],
            ...(strat.usesAmt
              ? [
                  ["Net Annual Withdrawal", fmt$(netAnnWd)],
                  ["Gross Before Tax",      fmt$(grossAnnWd)],
                  ["Tax Country",           `${taxCountry.flag} ${taxCountry.name}`],
                  ["Effective Tax Rate",    `${effectiveRate.toFixed(1)}%`],
                ]
              : [["Withdrawal Rate", `${(wdRate * 100).toFixed(1)}%`]]
            ),
            ["Monte Carlo Runs",      runs.toLocaleString()],
            ["Data Calibration",      "1975–2024 (50-yr real returns)"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 11px", background: C.input, borderRadius: 7 }}>
              <span style={{ fontSize: 11, color: C.dim, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 11, color: C.text, fontWeight: 600, fontFamily: "JetBrains Mono, monospace", textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Outcome Probabilities ────────────────────────────── */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>🎯 Outcome Probabilities</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {[
            { label: `Lasts all ${years} years`, val: successCount, color: C.green },
            { label: "Portfolio depleted",        val: zeroCount,    color: C.red   },
            {
              label: "Ends with > $500K",
              val: histogram.slice(Math.max(0, Math.floor(26 * 500000 / (medianFinal * 4 || 1)))).reduce((a, b) => a + b.count, 0),
              color: C.blue,
            },
            {
              label: "Monthly income ≥ $3K",
              val: Math.round(n * (p10Monthly >= 3000 ? 0.90 : medianMonthly >= 3000 ? 0.52 : 0.18)),
              color: C.teal,
            },
          ].map(item => (
            <div key={item.label} style={{ background: C.input, borderRadius: 9, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.dim, marginBottom: 6 }}>{item.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: item.color, fontFamily: "JetBrains Mono, monospace" }}>
                  {(Math.min(item.val, n) / n * 100).toFixed(1)}%
                </span>
                <span style={{ fontSize: 10, color: C.dim }}>{Math.min(item.val, n).toLocaleString()} runs</span>
              </div>
              <div style={{ height: 4, background: C.faint, borderRadius: 2, marginTop: 8 }}>
                <div style={{
                  height: "100%", borderRadius: 2, background: item.color,
                  width: `${Math.min(100, Math.min(item.val, n) / n * 100)}%`,
                  transition: "width 0.7s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Depletion Timeline (conditional) ────────────────── */}
      {zeroCount > 0 && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>⚠️ Depletion Risk Timeline</div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>
            Cumulative % of simulations that run out of money by each year
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={depTimeline} margin={{ top: 5, right: 16, bottom: 20, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0d2040" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -10, fill: C.dim, fontSize: 11 }} />
              <YAxis tick={{ fill: C.dim, fontSize: 10 }} tickFormatter={v => `${v.toFixed(0)}%`} domain={[0, 100]} />
              <Tooltip content={<BarTip fmt={v => `${v.toFixed(1)}%`} />} />
              <Area type="monotone" dataKey="cumPct" fill={C.red} fillOpacity={0.15} stroke={C.red} strokeWidth={2} name="Depleted %" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Recommendations ──────────────────────────────────── */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>💡 Analysis & Recommendations</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>

          {successRate < 80 && (
            <div style={{ background: "#180a0a", border: "1px solid #3d1212", borderRadius: 9, padding: "12px 14px", color: "#fca5a5", lineHeight: 1.75 }}>
              🔴 <b>Success rate of {successRate.toFixed(1)}% is below the 80% safety threshold.</b>{" "}
              Consider reducing your net annual withdrawal by {fmt$(netAnnWd * 0.1, true)}, adding early-retirement income, or switching to Guyton-Klinger guardrails for built-in downside protection.
            </div>
          )}
          {successRate >= 95 && (
            <div style={{ background: "#061510", border: "1px solid #123d20", borderRadius: 9, padding: "12px 14px", color: "#86efac", lineHeight: 1.75 }}>
              ✅ <b>Excellent at {successRate.toFixed(1)}%.</b>{" "}
              Very robust. You could increase your net withdrawal by 10–15% ({fmt$(netAnnWd * 1.12, true)}/yr), retire earlier, or increase international equity for additional diversification.
            </div>
          )}
          {successRate >= 80 && successRate < 95 && (
            <div style={{ background: "#120f02", border: "1px solid #3d2e06", borderRadius: 9, padding: "12px 14px", color: "#fde68a", lineHeight: 1.75 }}>
              🟡 <b>Good at {successRate.toFixed(1)}%.</b>{" "}
              Adding a modest income buffer in years 1–10 (part-time work, delayed Social Security) could push your success rate above 95%.
            </div>
          )}
          {inflation > 0.05 && (
            <div style={{ background: "#140a00", border: "1px solid #4a2000", borderRadius: 9, padding: "12px 14px", color: "#fdba74", lineHeight: 1.75 }}>
              📈 <b>High inflation assumption ({(inflation * 100).toFixed(1)}%).</b>{" "}
              Real returns are reduced by {((inflation - 0.03) * 100).toFixed(1)}% vs historical average.
              Cash real return is {(Math.max(-0.05, 0.015 - inflation) * 100).toFixed(1)}%.
              Consider reducing cash and increasing equity exposure.
            </div>
          )}
          {alloc.intl < 0.15 && (
            <div style={{ background: "#08071a", border: "1px solid #2a1a6b", borderRadius: 9, padding: "12px 14px", color: C.purple, lineHeight: 1.75 }}>
              🌍 <b>Low international allocation ({(alloc.intl * 100).toFixed(0)}%).</b>{" "}
              A 20–30% international sleeve can reduce portfolio volatility through diversification across global market cycles.
            </div>
          )}

          {/* Bottom line */}
          <div style={{ background: C.input, borderRadius: 9, padding: "12px 14px", color: C.muted, lineHeight: 1.75 }}>
            📌 <b style={{ color: C.text }}>Bottom line:</b>{" "}
            You need <b style={{ color: C.green }}>{fmt$(grossAnnWd)}/yr gross</b> ({fmt$(netAnnWd)}/yr net after {effectiveRate.toFixed(1)}% {taxCountry.flag} tax) from a{" "}
            <b style={{ color: C.text }}>{fmt$(portfolio)}</b> portfolio at{" "}
            <b style={{ color: C.orange }}>{(inflation * 100).toFixed(1)}% inflation</b>. Under median conditions, you sustain{" "}
            <b style={{ color: C.green }}>{fmt$(medianMonthly)}/month</b> gross for {years} years, ending with{" "}
            <b style={{ color: C.blue }}>{fmt$(medianFinal, true)}</b>.
          </div>
        </div>
      </Card>
    </div>
  );
}
