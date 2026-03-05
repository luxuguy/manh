// ─────────────────────────────────────────────────────────────
// components/charts.jsx — Reusable chart components
// ─────────────────────────────────────────────────────────────

// ── Fan Chart Tooltip ─────────────────────────────────────────
function FanTip({ active, payload, label, yFmt }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{
      background: "#071120", border: `1px solid ${C.border}`, borderRadius: 9,
      padding: "10px 14px", fontSize: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ color: C.muted, marginBottom: 7, fontWeight: 600 }}>Year {label}</div>
      {[
        ["Median",  C.accent,   yFmt(d.raw_p50)],
        ["25–75%",  C.blue,     `${yFmt(d.raw_p25)} – ${yFmt(d.raw_p75)}`],
        ["5–95%",   "#64748b",  `${yFmt(d.raw_p5)} – ${yFmt(d.raw_p95)}`],
      ].map(([l, c, v], i) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 14, opacity: i === 2 ? 0.65 : 1, marginBottom: 3 }}>
          <span style={{ color: c }}>{l}</span>
          <span style={{ color: C.text, fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stacked Fan Chart ─────────────────────────────────────────
// data shape: [{year, base, lo, mid_lo, mid_hi, hi, median, raw_p5, raw_p25, raw_p50, raw_p75, raw_p95}]
function FanChart({ data, color = C.blue, yFmt = v => fmt$(v, true), height = 280, title, subtitle }) {
  return (
    <div>
      {title && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 5, right: 16, bottom: 26, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0d2040" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 11 }} label={{ value: "Retirement Year", position: "insideBottom", offset: -14, fill: C.dim, fontSize: 11 }} />
          <YAxis tick={{ fill: C.dim, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }} tickFormatter={yFmt} width={72} />
          <Tooltip content={<FanTip yFmt={yFmt} />} />
          {/* Stacked band layers — base is transparent offset */}
          <Area type="monotone" dataKey="base"   stackId="f" fill="transparent" stroke="none" legendType="none" />
          <Area type="monotone" dataKey="lo"     stackId="f" fill={color} fillOpacity={0.10} stroke="none" legendType="none" />
          <Area type="monotone" dataKey="mid_lo" stackId="f" fill={color} fillOpacity={0.28} stroke="none" legendType="none" />
          <Area type="monotone" dataKey="mid_hi" stackId="f" fill={color} fillOpacity={0.28} stroke="none" legendType="none" />
          <Area type="monotone" dataKey="hi"     stackId="f" fill={color} fillOpacity={0.10} stroke="none" legendType="none" />
          <Line type="monotone" dataKey="median" stroke={C.accent} strokeWidth={2.5} dot={false} legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 2, fontSize: 10, color: C.dim }}>
        {[["5–95th pct", 0.15], ["25–75th pct", 0.45]].map(([l, op]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 26, height: 3, background: color, opacity: op, borderRadius: 2 }} />
            {l}
          </span>
        ))}
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ display: "inline-block", width: 26, height: 2.5, background: C.accent, borderRadius: 2 }} />
          Median
        </span>
      </div>
    </div>
  );
}

// ── Bar Chart Tooltip ─────────────────────────────────────────
function BarTip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#071120", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 13px", fontSize: 11 }}>
      <div style={{ color: C.muted, marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill, fontFamily: "JetBrains Mono, monospace" }}>
          {p.name}: {fmt ? fmt(p.value) : p.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
}

// ── Success Rate Arc Gauge ────────────────────────────────────
function Gauge({ value }) {
  const r = 72, cx = 90, cy = 88;
  const rad   = d => (d * Math.PI) / 180;
  const ptAt  = deg => ({ x: cx + r * Math.cos(rad(deg)), y: cy - r * Math.sin(rad(deg)) });
  const RANGE = 250, startDeg = 215;
  const s     = ptAt(startDeg);
  const e     = ptAt(startDeg - RANGE);
  const valDeg = startDeg - (value / 100) * RANGE;
  const v      = ptAt(valDeg);
  const sw     = (startDeg - valDeg) > 180 ? 1 : 0;
  const color  = value >= 90 ? C.green : value >= 75 ? C.accent : value >= 60 ? "#f97316" : C.red;

  return (
    <svg width="180" height="120" viewBox="0 0 180 120">
      {/* Track */}
      <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 1 0 ${e.x} ${e.y}`} fill="none" stroke="#1a3050" strokeWidth="11" strokeLinecap="round" />
      {/* Filled arc */}
      <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${sw} 0 ${v.x} ${v.y}`} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" />
      {/* Glow */}
      <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${sw} 0 ${v.x} ${v.y}`} fill="none" stroke={color} strokeWidth="22" strokeLinecap="round" opacity="0.07" />
      {/* Labels */}
      <text x={cx} y={cy + 6}  textAnchor="middle" fill={color} fontSize="26" fontWeight="700" fontFamily="JetBrains Mono, monospace">
        {value.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill={C.dim} fontSize="9" fontFamily="Outfit, sans-serif" letterSpacing="0.1em">
        SUCCESS RATE
      </text>
    </svg>
  );
}
