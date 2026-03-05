// ─────────────────────────────────────────────────────────────
// components/tabs/Income.jsx — Monthly income distribution tab
//
// Shows: income fan chart, grouped bar by year, avg income
//        histogram, P10/50/90 stat cards
// ─────────────────────────────────────────────────────────────

function TabIncome({ res }) {
  const {
    incFan, incHistogram, incByYear,
    medianMonthly, p10Monthly, p90Monthly,
    n, years,
  } = res;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      <Card>
        <FanChart
          data={incFan}
          color={C.green}
          yFmt={v => `$${Math.round(v).toLocaleString()}`}
          height={320}
          title="Monthly Income — Fan Chart"
          subtitle="Gross monthly withdrawal distribution across all simulations"
        />
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>
          Monthly Income by Year — Percentiles
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>
          10th / Median / 90th percentile at sampled retirement years
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incByYear} margin={{ top: 5, right: 16, bottom: 20, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0d2040" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 11 }} />
            <YAxis tick={{ fill: C.dim, fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<BarTip fmt={v => `$${v.toLocaleString()}/mo`} />} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.dim, paddingTop: 8 }} />
            <Bar dataKey="p10"    name="10th Pct" fill={C.red}   fillOpacity={0.8} radius={[3, 3, 0, 0]} />
            <Bar dataKey="median" name="Median"   fill={C.green} fillOpacity={0.9} radius={[3, 3, 0, 0]} />
            <Bar dataKey="p90"    name="90th Pct" fill={C.blue}  fillOpacity={0.8} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>
          Average Monthly Income — Distribution
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>
          Average monthly gross income per simulation across the full {years}-year period
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <StatCard label="Median Monthly" value={fmt$(medianMonthly)} sub={`${fmt$(medianMonthly * 12)}/yr gross`} color={C.green}  />
        <StatCard label="10th Pct"       value={fmt$(p10Monthly)}    sub="Pessimistic"                            color="#f87171" />
        <StatCard label="90th Pct"       value={fmt$(p90Monthly)}    sub="Optimistic"                             color={C.blue}  />
      </div>
    </div>
  );
}
