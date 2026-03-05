// ─────────────────────────────────────────────────────────────
// components/tabs/Portfolio.jsx — Portfolio distribution tab
//
// Shows: large fan chart, final-value histogram ($100K bins),
//        P10/50/90 stat cards
// ─────────────────────────────────────────────────────────────

function TabPortfolio({ res }) {
  const { portFan, histogram, medianFinal, p10Final, p90Final, n, years } = res;

  // With $100K bins there can be many buckets — show every Nth label
  // so the axis stays readable regardless of portfolio size
  const tickInterval = histogram.length > 40 ? 4
                     : histogram.length > 20 ? 2
                     : histogram.length > 10 ? 1
                     : 0;   // 0 = show all

  // Taller chart when there are many bins so angled labels don't clip
  const chartHeight = histogram.length > 30 ? 300 : 260;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      <Card>
        <FanChart
          data={portFan}
          color={C.blue}
          height={320}
          title="Portfolio Balance — Fan Chart"
          subtitle={`Percentile bands across ${n.toLocaleString()} simulations · amber line = median`}
        />
      </Card>

      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>
          Final Portfolio Value — Distribution
        </div>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>
          Histogram of ending balance at year {years} · $100K buckets · {n.toLocaleString()} runs
        </div>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={histogram}
            margin={{ top: 5, right: 16, bottom: 46, left: 8 }}
            barCategoryGap="10%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#0d2040" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: C.dim, fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
              angle={-50}
              textAnchor="end"
              interval={tickInterval}
              height={52}
            />
            <YAxis tick={{ fill: C.dim, fontSize: 10 }} />
            <Tooltip content={<BarTip />} />
            <Bar dataKey="count" name="Simulations" radius={[3, 3, 0, 0]}>
              {histogram.map((_, i) => (
                <Cell key={i} fill={`hsl(${210 + i * (120 / Math.max(histogram.length, 1))},72%,${26 + i * (20 / Math.max(histogram.length, 1))}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <StatCard label="Median Final"    value={fmt$(medianFinal, true)} sub={fmt$(medianFinal)}  color={C.blue}    />
        <StatCard label="10th Percentile" value={fmt$(p10Final, true)}    sub="Pessimistic"        color="#f87171"   />
        <StatCard label="90th Percentile" value={fmt$(p90Final, true)}    sub="Optimistic"         color={C.green}   />
      </div>
    </div>
  );
}
