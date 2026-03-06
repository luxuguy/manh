// ─────────────────────────────────────────────────────────────
// components/ModelInfo.jsx — Simulation model explainer
//
// Rendered in two modes:
//   full   (default) — rich layout for the empty / pre-run state
//   compact          — collapsed panel usable alongside results
//
// No props required — all data is read from the globals
// REGIME_TRANSITIONS, REGIME_INIT, and MKT.
// ─────────────────────────────────────────────────────────────

// ── Static regime metadata ────────────────────────────────────
const REGIMES_META = [
  {
    id: 0,
    name: "Sideways",
    icon: "↔",
    color: C.muted,
    bg: "#0d1a2e",
    border: "#1a3050",
    years: "23 of 100",
    usEqAvg: "+3.1%",
    bondAvg: "+1.8%",
    examples: "1934, 1943–44, 1951–52, 1965",
    desc: "Range-bound markets with no clear trend. Low but positive average returns with moderate volatility. Stocks tread water; bonds provide marginal real yield.",
  },
  {
    id: 1,
    name: "Bull",
    icon: "↑",
    color: C.green,
    bg: "#061510",
    border: "#123d20",
    years: "42 of 100",
    usEqAvg: "+19.4%",
    bondAvg: "+4.2%",
    examples: "1925–28, 1950, 1985–86, 1995–99, 2021",
    desc: "Sustained upward trend driven by earnings growth, economic expansion, or monetary easing. Accounts for 42% of the 100-year history — the dominant regime.",
  },
  {
    id: 2,
    name: "Bear",
    icon: "↓",
    color: C.red,
    bg: "#180a0a",
    border: "#3d1212",
    years: "21 of 100",
    usEqAvg: "−22.6%",
    bondAvg: "−2.1%",
    examples: "1929–32, 1940–41, 1973–74, 2001–02, 2008, 2022",
    desc: "Prolonged declines of 20%+ driven by recessions, financial crises, or exogenous shocks. Bonds often decline too in inflationary bears. The regime most dangerous to retirees.",
  },
  {
    id: 3,
    name: "Recovery",
    icon: "↗",
    color: C.accent,
    bg: "#120f02",
    border: "#3d2e06",
    years: "14 of 100",
    usEqAvg: "+28.9%",
    bondAvg: "+6.5%",
    examples: "1933, 1938, 1945, 1975, 2003, 2009, 2023",
    desc: "Sharp rebounds following bear markets. High returns but typically short-lived (1–2 years). The Markov model makes bears almost always transition through recovery before the next regime.",
  },
];

// ── Step pills ────────────────────────────────────────────────
function StepPill({ n, label, color, sub }) {
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "13px 16px",
      background: `${color}08`,
      border: `1px solid ${color}28`,
      borderLeft: `3px solid ${color}`,
      borderRadius: "0 10px 10px 0",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: `${color}22`, border: `1px solid ${color}60`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 800, color, flexShrink: 0,
        fontFamily: "JetBrains Mono, monospace",
      }}>
        {n}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Regime card ───────────────────────────────────────────────
function RegimeCard({ r }) {
  return (
    <div style={{
      background: r.bg, border: `1px solid ${r.border}`,
      borderTop: `2px solid ${r.color}`,
      borderRadius: 10, padding: "13px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{
          fontSize: 16, color: r.color,
          fontFamily: "JetBrains Mono, monospace", fontWeight: 800,
          lineHeight: 1,
        }}>
          {r.icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.name}</span>
        <span style={{
          marginLeft: "auto", fontSize: 9, color: C.dim,
          background: `${r.color}14`, border: `1px solid ${r.color}30`,
          borderRadius: 20, padding: "1px 7px",
        }}>
          {r.years} yrs
        </span>
      </div>

      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>
        {r.desc}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[["US Eq avg", r.usEqAvg, C.blue], ["Bond avg", r.bondAvg, C.teal]].map(([l, v, c]) => (
          <div key={l} style={{
            flex: 1, background: `${c}10`, border: `1px solid ${c}28`,
            borderRadius: 7, padding: "5px 8px",
          }}>
            <div style={{ fontSize: 9, color: C.dim, marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: "JetBrains Mono, monospace" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9, color: C.dim, lineHeight: 1.5 }}>
        <span style={{ color: `${r.color}90` }}>Historical examples: </span>{r.examples}
      </div>
    </div>
  );
}

// ── Markov transition diagram ─────────────────────────────────
function MarkovDiagram() {
  const regimeColors = [C.muted, C.green, C.red, C.accent];
  const regimeNames  = ["Sideways", "Bull", "Bear", "Recovery"];

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>
        Regime Transition Probabilities
      </div>
      <div style={{ fontSize: 11, color: C.dim, marginBottom: 12, lineHeight: 1.6 }}>
        Each year, the model asks: given the current regime, what comes next?
        These probabilities control regime persistence and cycle realism.
        Bulls tend to stay bullish (71%). Bears almost always resolve through Recovery (41%) before any new trend.
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 340 }}>
          <thead>
            <tr>
              <th style={{ padding: "6px 10px", textAlign: "left", color: C.dim, fontWeight: 600, fontSize: 10, borderBottom: `1px solid ${C.faint}` }}>
                From ↓ / To →
              </th>
              {regimeNames.map((n, i) => (
                <th key={n} style={{
                  padding: "6px 10px", textAlign: "center",
                  color: regimeColors[i], fontWeight: 700, fontSize: 10,
                  borderBottom: `1px solid ${C.faint}`,
                }}>
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REGIME_TRANSITIONS.map((row, from) => (
              <tr key={from} style={{ borderBottom: `1px solid ${C.faint}20` }}>
                <td style={{
                  padding: "7px 10px", color: regimeColors[from],
                  fontWeight: 700, fontSize: 11, whiteSpace: "nowrap",
                }}>
                  {regimeNames[from]}
                </td>
                {row.map((prob, to) => {
                  const isMax    = prob === Math.max(...row);
                  const isDiag   = from === to;
                  const opacity  = 0.3 + prob * 0.7;
                  return (
                    <td key={to} style={{
                      padding: "7px 10px", textAlign: "center",
                      background: isMax ? `${regimeColors[to]}14` : "transparent",
                    }}>
                      <span style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: isMax ? 700 : 400,
                        color: isMax ? regimeColors[to] : C.dim,
                        fontSize: 12,
                      }}>
                        {(prob * 100).toFixed(0)}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 9, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
        Bold = most likely next regime. Starting regime sampled from empirical frequencies:
        {" "}{REGIMES_META.map(r => (
          <span key={r.id}>
            <span style={{ color: r.color }}>{r.name}</span>
            {" "}{(REGIME_INIT[r.id] * 100).toFixed(0)}%{r.id < 3 ? " · " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Block bootstrap explainer ─────────────────────────────────
function BlockBootstrapPanel() {
  return (
    
  );
}

// ── Sequence-of-returns risk callout ──────────────────────────
function SequenceRiskCallout() {
  // Simple illustration: show a bear-in-year-1 vs bear-in-year-20 scenario
  const years  = 10;
  const wdRate = 0.04;

  // Scenario A: -30% then +7%/yr
  // Scenario B: +7%/yr then -30%
  const simulate = (crashYear) => {
    let p = 100;
    const vals = [100];
    for (let y = 1; y <= years; y++) {
      const ret = (y === crashYear) ? -0.30 : 0.07;
      p = Math.max(0, p * (1 + ret) - 4);
      vals.push(Math.round(p));
    }
    return vals;
  };
  const earlyBear = simulate(2);
  const lateBear  = simulate(8);

  return (
    <div style={{
      background: "#0e0a00", border: `1px solid #3d2e06`,
      borderLeft: `3px solid ${C.orange}`,
      borderRadius: "0 10px 10px 0", padding: "13px 16px",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, marginBottom: 6 }}>
        ⚡ Why regime timing matters: Sequence-of-Returns Risk
      </div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.75, marginBottom: 12 }}>
        Same average return, same crash magnitude — but{" "}
        <b style={{ color: C.text }}>a bear market in early retirement is far more damaging</b>{" "}
        than the same crash late in retirement. Selling depressed assets to fund withdrawals
        permanently reduces the portfolio's recovery capacity.
        The regime model captures this by simulating realistic crash timing and duration,
        not just long-run averages.
      </div>

      {/* Mini sparkline */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[
          { label: "Bear in Year 2",  vals: earlyBear, color: C.red,   end: earlyBear[years] },
          { label: "Bear in Year 8",  vals: lateBear,  color: C.green, end: lateBear[years]  },
        ].map(({ label, vals, color, end }) => {
          const max = Math.max(...vals, 100);
          return (
            <div key={label} style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 10, color }}>{label}</span>
                <span style={{
                  fontSize: 10, fontFamily: "JetBrains Mono, monospace",
                  color: end < 100 ? C.red : C.green, fontWeight: 700,
                }}>
                  {end < 0 ? "Depleted" : `$${end}`} left
                </span>
              </div>
              <svg width="100%" height="44" viewBox={`0 0 ${(years + 1) * 20} 50`} preserveAspectRatio="none">
                {/* Area fill */}
                <polyline
                  points={vals.map((v, i) => `${i * 20},${50 - Math.max(0, v / max * 44)}`).join(" ")}
                  fill="none" stroke={color} strokeWidth="2" opacity="0.9"
                />
                <polygon
                  points={[
                    ...vals.map((v, i) => `${i * 20},${50 - Math.max(0, v / max * 44)}`),
                    `${years * 20},50`, `0,50`
                  ].join(" ")}
                  fill={color} opacity="0.12"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.dim, marginTop: 2 }}>
                <span>Start</span><span>Yr 5</span><span>Yr 10</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 9, color: C.dim, marginTop: 8, lineHeight: 1.5 }}>
        Illustrative: $100 starting portfolio, 4% annual withdrawal, same −30% crash & +7% avg return.
        Early crash ends with ~${earlyBear[years]} vs late crash ~${lateBear[years]}.
      </div>
    </div>
  );
}

// ── Main export — full explainer ──────────────────────────────
function ModelInfoFull() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 860, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>◈</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", marginBottom: 8 }}>
          Configure & Run Your Simulation
        </div>
        <div style={{ fontSize: 13, color: C.dim, maxWidth: 520, margin: "0 auto", lineHeight: 1.9 }}>
          Set your portfolio, withdrawal needs, and inflation assumptions in the sidebar, then
          run up to <b style={{ color: C.text }}>100,000 Monte Carlo scenarios</b> powered by
          a <b style={{ color: C.accent }}>regime-switching block bootstrap model</b> calibrated
          on 100 years of real market data (1925–2024).
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          ["🎲 100K Simulations",  C.blue  ],
          ["🔄 4 Market Regimes",  C.accent],
          ["📦 Block Bootstrap",   C.purple],
          ["⛓ Markov Transitions", C.teal  ],
          ["📅 100-Year History",  C.green ],
          ["🧾 40-Country Tax",    C.orange],
        ].map(([label, color]) => (
          <span key={label} style={{
            fontSize: 10, color,
            background: `${color}12`, border: `1px solid ${color}30`,
            borderRadius: 20, padding: "4px 12px", fontWeight: 600,
          }}>
            {label}
          </span>
        ))}
      </div>

      {/* ── 3-Step algorithm ── */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.dim,
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 12,
        }}>
          How the simulation works
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <StepPill
            n="1"
            color={C.blue}
            label="Identify the Market Regime"
            sub="Each year of the simulation belongs to one of four regimes: Bull, Bear, Recovery, or Sideways. The starting regime is sampled from empirical frequencies (Bull 45%, Sideways 23%, Bear 22%, Recovery 11%) derived from 100 years of S&P 500 history."
          />
          <StepPill
            n="2"
            color={C.purple}
            label="Block Bootstrap Within the Regime"
            sub="Rather than drawing a single random return, the engine picks a consecutive block of historical years that all belong to the current regime. This preserves multi-year autocorrelation — bull markets stay bullish, bear markets drag for multiple years, just as in real history. All three assets (US, International, Bonds) are sampled together, preserving within-cycle correlation."
          />
          <StepPill
            n="3"
            color={C.teal}
            label="Markov Chain Regime Transitions"
            sub="When a regime block ends, a Markov transition matrix decides what happens next. Bulls have a 71% chance of continuing; Bears almost always (41%) transition to Recovery before any new trend begins. This produces realistic market cycles — not random year-to-year noise — making the simulation far more sensitive to sequence-of-returns risk."
          />
        </div>
      </div>

      {/* ── Why this matters ── */}
      <BlockBootstrapPanel />

      {/* ── Sequence-of-returns risk ── */}
      <SequenceRiskCallout />

      {/* ── 4 Regime cards ── */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.dim,
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 12,
        }}>
          The 4 Market Regimes (1925–2024)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {REGIMES_META.map(r => <RegimeCard key={r.id} r={r} />)}
        </div>
      </div>

      {/* ── Markov table ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.cardBorder}`,
        borderRadius: 12, padding: "18px 20px",
      }}>
        <MarkovDiagram />
      </div>

      {/* ── Data sources note ── */}
      <div style={{
        background: C.input, borderRadius: 9, padding: "12px 16px",
        fontSize: 10, color: C.dim, lineHeight: 1.75,
        borderLeft: `3px solid ${C.faint}`,
      }}>
        <b style={{ color: C.text }}>Data sources & assumptions: </b>
        US Equities (S&P 500 real returns 1925–2024): 1975–2024 from published CPI-adjusted series;
        1925–1974 estimated from S&P 500 nominal minus BLS CPI.
        International Equities: 1970–2024 MSCI EAFE real; 1925–1969 approximated from major developed market indices.
        Bonds: 1975–2024 Bloomberg US Aggregate real; 1925–1974 US long-term Treasury real returns.
        Regime classifications derived from rolling peak-trough analysis of the US equity series.
        Cash real return = max(−5%, HYSA rate − inflation). All figures are{" "}
        <b style={{ color: C.text }}>real (inflation-adjusted)</b> at the baseline 3% CPI rate;
        your inflation slider shifts all real returns accordingly.
      </div>

    </div>
  );
}

// ── Compact panel — shown in Summary tab after results load ───
function ModelInfoCompact({ onClose }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`,
      borderRadius: 12, overflow: "hidden",
    }}>
      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 16px",
        background: "#060f1e", borderBottom: `1px solid ${C.cardBorder}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔬</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Simulation Model</span>
          <Tag color={C.accent}>Regime-Switching Block Bootstrap</Tag>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: "none", border: "none", color: C.dim,
            cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1,
          }}>✕</button>
        )}
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* 3-step summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { n:"1", title:"Regime",    color:C.blue,   body:"Each year is assigned a market regime (Bull / Bear / Recovery / Sideways) based on 100 years of S&P 500 history." },
            { n:"2", title:"Bootstrap", color:C.purple, body:"Returns are drawn as consecutive historical blocks within the current regime, preserving multi-year cycle autocorrelation." },
            { n:"3", title:"Markov",    color:C.teal,   body:"A 4×4 transition matrix governs regime switches. Bulls persist 71% of the time; Bears resolve to Recovery 41% of the time." },
          ].map(({ n, title, color, body }) => (
            <div key={n} style={{
              background: `${color}08`, border: `1px solid ${color}25`,
              borderTop: `2px solid ${color}`, borderRadius: 9, padding: "11px 13px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${color}22`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 10, fontWeight: 800, color,
                  flexShrink: 0, fontFamily: "JetBrains Mono, monospace",
                }}>{n}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{title}</span>
              </div>
              <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.7 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* Regime frequency bar */}
        <div>
          <div style={{ fontSize: 10, color: C.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Historical regime frequency (1925–2024)
          </div>
          <div style={{ height: 8, borderRadius: 4, overflow: "hidden", display: "flex", gap: 1 }}>
            {REGIMES_META.map(r => (
              <div key={r.id} style={{
                width: `${REGIME_INIT[r.id] * 100}%`,
                background: r.color, transition: "width 0.3s",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 9, color: C.dim, flexWrap: "wrap" }}>
            {REGIMES_META.map(r => (
              <span key={r.id}>
                <span style={{ color: r.color }}>{r.icon} {r.name}</span>
                {" "}{(REGIME_INIT[r.id] * 100).toFixed(0)}%
                {" "}({r.years})
              </span>
            ))}
          </div>
        </div>

        {/* Compact transition matrix */}
        <MarkovDiagram />

        {/* vs i.i.d. note */}
        <div style={{
          fontSize: 10, color: C.muted, lineHeight: 1.75,
          padding: "10px 13px", background: C.input, borderRadius: 8,
          borderLeft: `2px solid ${C.accent}`,
        }}>
          <b style={{ color: C.text }}>Why not simple random draws?</b>
          {" "}Independent draws ignore the fact that markets trend — a single bad year is likely
          followed by more bad years. Block bootstrapping preserves this autocorrelation,
          making the simulation much more sensitive to{" "}
          <b style={{ color: C.orange }}>sequence-of-returns risk</b> — the primary retirement hazard.
        </div>

      </div>
    </div>
  );
}
