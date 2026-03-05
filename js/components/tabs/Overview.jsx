// ─────────────────────────────────────────────────────────────
// components/tabs/Overview.jsx — First results tab
//
// Shows: 6 stat cards, tax summary bar, portfolio fan chart,
//        income fan chart.
// ─────────────────────────────────────────────────────────────

function TabOverview({ res, ctx }) {
  const {
    successRate, successCount, n,
    medianFinal, p10Final, p90Final,
    portFan, incFan,
    zeroCount,
    medianMonthly, p10Monthly, p90Monthly,
  } = res;

  const { srColor, strat, netAnnWd, grossAnnWd, taxAmount, effectiveRate, taxCountry, inflation, years } = ctx;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <StatCard accent label="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          sub={`${successCount.toLocaleString()} / ${n.toLocaleString()} simulations`}
          color={srColor} />
        <StatCard label="Median Final Portfolio"
          value={fmt$(medianFinal, true)}
          sub={`Range: ${fmt$(p10Final, true)} – ${fmt$(p90Final, true)}`}
          color={C.blue} />
        <StatCard label="Portfolio Depleted"
          value={zeroCount.toLocaleString()}
          sub={`${(zeroCount / n * 100).toFixed(1)}% of runs ran out`}
          color={zeroCount > 0 ? C.red : C.green} />
        <StatCard label="Median Monthly Income"
          value={fmt$(medianMonthly)}
          sub={`Gross · ${fmt$(medianMonthly * 12)}/year`}
          color={C.accent} />
        <StatCard label="90th Pct Monthly"
          value={fmt$(p90Monthly)}
          sub="Best-case scenario"
          color={C.green} />
        <StatCard label="10th Pct Monthly"
          value={fmt$(p10Monthly)}
          sub="Worst-case scenario"
          color="#f87171" />
      </div>

      {/* ── Tax summary bar ──────────────────────────────────── */}
      {strat.usesAmt && (
        <div style={{
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 11, padding: "12px 16px",
          display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>
            🧾 Tax: {taxCountry.flag} {taxCountry.name}
          </div>
          {[
            ["Net withdrawal",  `${fmt$(netAnnWd)}/yr`,   C.text  ],
            ["Gross before tax",`${fmt$(grossAnnWd)}/yr`, C.green ],
            ["Annual tax",      `${fmt$(taxAmount)}/yr`,  C.red   ],
            ["Effective rate",  `${effectiveRate.toFixed(1)}%`,   C.accent],
          ].map(([l, v, c]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: C.dim }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "JetBrains Mono, monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fan charts ───────────────────────────────────────── */}
      <Card>
        <FanChart
          data={portFan}
          color={C.blue}
          height={240}
          title="Portfolio Value Over Time"
          subtitle={`Distribution across ${n.toLocaleString()} Monte Carlo runs · ${(inflation * 100).toFixed(1)}% inflation assumption`}
        />
      </Card>
      <Card>
        <FanChart
          data={incFan}
          color={C.green}
          yFmt={v => `$${Math.round(v).toLocaleString()}`}
          height={240}
          title="Monthly Withdrawal Over Time"
          subtitle="Gross monthly income drawn from portfolio across all simulations"
        />
      </Card>
    </div>
  );
}
