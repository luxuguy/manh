// ─────────────────────────────────────────────────────────────
// components/tabs/Income.jsx — Monthly income distribution tab
//
// Shows: income fan chart, grouped bar by year, avg income
//        histogram, P10/50/90 stat cards
//
// All figures are in REAL (today's) dollars — inflation-adjusted
// at the user's specified rate.  Income sources are treated as
// real (inflation-protected) values throughout the simulation.
// ─────────────────────────────────────────────────────────────

function TabIncome({ res, ctx }) {
  const {
    incFan, incHistogram, incByYear,
    medianMonthly, p10Monthly, p90Monthly,
    n, years,
  } = res;

  const { inflation } = ctx;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Inflation note ───────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        background: C.input, borderRadius: 9,
        borderLeft: `3px solid ${C.orange}`,
        padding: "10px 14px", fontSize: 11, color: C.muted, lineHeight: 1.7,
      }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>📌</span>
        <div>
          <b style={{ color: C.text }}>Real (inflation-adjusted) dollars</b>
          {" — "}all income figures represent purchasing power in{" "}
          <b style={{ color: C.text }}>today's dollars</b> at{" "}
          <b style={{ color: C.orange }}>{(inflation * 100).toFixed(1)}% annual inflation</b>.
          {" "}Income sources (Social Security, pension, etc.) are treated as{" "}
          <b style={{ color: C.green }}>real / COLA-protected</b> — their value
          is held constant in today's dollars throughout the simulation.
          {" "}Nominal dollar amounts in future years would be higher by{" "}
          approximately{" "}
          <b style={{ color: C.orange }}>
            {((Math.pow(1 + inflation, 10) - 1) * 100).toFixed(0)}%
          </b>{" "}
          after 10 years and{" "}
          <b style={{ color: C.orange }}>
            {((Math.pow(1 + inflation, 20) - 1) * 100).toFixed(0)}%
          </b>{" "}
          after 20 years.
        </div>
      </div>

      {/* ── Income Fan Chart ─────────────────────────────────── */}
      <Card>
        <FanChart
          data={incFan}
          color={C.green}
          yFmt={v => `$${Math.round(v).toLocaleString()}`}
          height={320}
          title="Monthly Income — Fan Chart"
          subtitle={`Gross monthly withdrawal in real (today's) dollars · ${(inflation * 100).toFixed(1)}% inflation · ${n.toLocaleString()} runs`}
        />
      </Card>

      {/* ── Income by Year ───────────────────────────────────── */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>
          Monthly Income by Year — Percentiles
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>
          10th / Median / 90th percentile at sampled years — all in real (today's) dollars
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incByYear} margin={{ top: 5, right: 16, bottom: 20, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0d2040" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 11 }} />
            <YAxis tick={{ fill: C.dim, fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<BarTip fmt={v => `$${v.toLocaleString()}/mo (real)`} />} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.dim, paddingTop: 8 }} />
            <Bar dataKey="p10"    name="10th Pct" fill={C.red}   fillOpacity={0.8} radius={[3, 3, 0, 0]} />
            <Bar dataKey="median" name="Median"   fill={C.green} fillOpacity={0.9} radius={[3, 3, 0, 0]} />
            <Bar dataKey="p90"    name="90th Pct" fill={C.blue}  fillOpacity={0.8} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Average Income Distribution ──────────────────────── */}
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>
          Average Monthly Income — Distribution
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>
          Average monthly gross income (real) per simulation across the full {years}-year period
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={incHistogram} margin={{ top: 5, right: 16, bottom: 26, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0d2040" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: C.dim, fontSize: 9, fontFamily: "JetBrains Mono, monospace" }} angle={-30} textAnchor="end" />
            <YAxis tick={{ fill: C.dim, fontSize: 10 }} />
            <Tooltip content={<BarTip />} />
            <Bar dataKey="count" name="Simulations" radius={[3, 3, 0, 0]}>
              {incHistogram.map((_, i) => (
                <Cell key={i} fill={`hsl(${142 + i * 2.5},62%,${25 + i * 1.8}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <StatCard
          label="Median Monthly"
          value={fmt$(medianMonthly)}
          sub={`${fmt$(medianMonthly * 12)}/yr · real $`}
          color={C.green}
        />
        <StatCard
          label="10th Pct"
          value={fmt$(p10Monthly)}
          sub="Pessimistic · real $"
          color="#f87171"
        />
        <StatCard
          label="90th Pct"
          value={fmt$(p90Monthly)}
          sub="Optimistic · real $"
          color={C.blue}
        />
      </div>

      {/* ── Nominal equivalent reference ─────────────────────── */}
      <Card style={{ background: "#06101e", border: `1px solid ${C.faint}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 12 }}>
          💱 Nominal Equivalents (what you'll actually withdraw)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[1, 5, 10, 15, 20, 25, 30, years].filter((v, i, a) => a.indexOf(v) === i && v <= years).slice(0, 8).map(yr => {
            const nomFactor = Math.pow(1 + inflation, yr);
            return (
              <div key={yr} style={{ background: C.input, borderRadius: 7, padding: "9px 11px" }}>
                <div style={{ fontSize: 10, color: C.dim, marginBottom: 4 }}>Year {yr}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, fontFamily: "JetBrains Mono, monospace" }}>
                  {fmt$(medianMonthly * nomFactor)}
                </div>
                <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
                  /mo nominal
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 9, color: C.dim, marginTop: 10, lineHeight: 1.5 }}>
          Nominal = Real × (1 + {(inflation * 100).toFixed(1)}%)^year. These are the actual dollar amounts you
          would withdraw, assuming {(inflation * 100).toFixed(1)}% inflation. The simulation uses real returns so
          all analysis above is already purchasing-power adjusted.
        </div>
      </Card>

    </div>
  );
}
