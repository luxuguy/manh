// ─────────────────────────────────────────────────────────────
// components/AllocSliders.jsx — 4-asset allocation sliders
// ─────────────────────────────────────────────────────────────

function AllocSliders({ us, intl, bnd, csh, onChange }) {
  const set = (key, newVal) => {
    const v = Math.max(0, Math.min(1, newVal));
    const rest = { us, intl, bnd, csh };
    rest[key] = v;
    const others = Object.entries(rest).filter(([k]) => k !== key);
    const sumOthers = others.reduce((a, [, x]) => a + x, 0);
    const deficit   = Math.max(0, 1 - v);
    if (sumOthers <= 0) others.forEach(([k])    => { rest[k] = deficit / 3; });
    else                others.forEach(([k, x]) => { rest[k] = (x / sumOthers) * deficit; });
    onChange(rest);
  };

  const rows = [
    { key: "us",   label: "US Equities (S&P 500)",     color: C.blue,   val: us,   mkt: MKT.usEq   },
    { key: "intl", label: "Intl Equities (MSCI EAFE)", color: C.purple, val: intl, mkt: MKT.intlEq },
    { key: "bnd",  label: "Bonds (US Agg)",            color: C.teal,   val: bnd,  mkt: MKT.bonds  },
    { key: "csh",  label: "Cash / HYSA",               color: C.accent, val: csh,  mkt: MKT.cash   },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {rows.map(({ key, label, color, val, mkt }) => (
        <div key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 11, color }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace" }}>
              {(val * 100).toFixed(0)}%
            </span>
          </div>
          <SliderInput
            color={color}
            min={0} max={100}
            value={Math.round(val * 100)}
            onChange={e => set(key, +e.target.value / 100)}
          />
          <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
            μ = {(mkt.mean * 100).toFixed(1)}%  ·  σ = {(mkt.std * 100).toFixed(1)}%  ·  100-yr real
          </div>
        </div>
      ))}

      {/* Live allocation bar */}
      <div style={{ marginTop: 4 }}>
        <div style={{ height: 7, borderRadius: 4, overflow: "hidden", display: "flex", gap: 1, marginBottom: 6 }}>
          {[[us, C.blue], [intl, C.purple], [bnd, C.teal], [csh, C.accent]].map(([v, c], i) => (
            <div key={i} style={{ width: `${v * 100}%`, background: c, transition: "width 0.25s" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 10, color: C.dim, flexWrap: "wrap" }}>
          {[["US", C.blue, us], ["Intl", C.purple, intl], ["Bonds", C.teal, bnd], ["Cash", C.accent, csh]].map(([l, c, v]) => (
            <span key={l}><span style={{ color: c }}>■</span> {l} {(v * 100).toFixed(0)}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}
