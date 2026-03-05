// ─────────────────────────────────────────────────────────────
// components/Results.jsx — Results panel with tab bar
// ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Overview"         },
  { id: "portfolio", label: "Portfolio"         },
  { id: "income",    label: "Income"            },
  { id: "summary",   label: "Lifetime Summary"  },
];

function ResultsEmpty() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 18, padding: 40 }}>
      <div style={{ fontSize: 56, opacity: 0.3 }}>◈</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Configure & Run Your Simulation</div>
      <div style={{ fontSize: 13, color: C.dim, maxWidth: 480, textAlign: "center", lineHeight: 1.9 }}>
        Set up your 4-asset portfolio, enter your net after-tax income need, choose inflation assumptions and a withdrawal strategy, then run Monte Carlo simulations powered by 100 years of real market data (1925–2024) — including the Great Depression, WWII, stagflation, and modern bull markets.
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Tag color={C.blue}>🎲 Monte Carlo up to 10K runs</Tag>
        <Tag color={C.purple}>🌍 4 Asset Classes</Tag>
        <Tag color={C.orange}>📈 Inflation Adjusted</Tag>
        <Tag color={C.green}>🧾 40-Country Tax Gross-Up</Tag>
        <Tag color={C.teal}>📅 100-Year Historical Data</Tag>
      </div>
    </div>
  );
}

function ResultsLoading({ runs, years }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
      <div className="spin" style={{ fontSize: 38, color: C.accent }}>◈</div>
      <div style={{ fontSize: 16, color: C.muted }}>Running {runs.toLocaleString()} Monte Carlo simulations…</div>
      <div style={{ fontSize: 12, color: C.dim }}>{years} years × {runs.toLocaleString()} iterations</div>
    </div>
  );
}

function ResultsPanel({ results, activeTab, setActiveTab, ctx }) {
  const { srColor, runs, years, inflation } = ctx;
  const { successRate, n } = results;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.cardBorder}`, padding: "0 20px", flexShrink: 0, overflowX: "auto" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: "none", border: "none",
              borderBottom: activeTab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
              color: activeTab === t.id ? C.accent : C.dim,
              padding: "13px 16px", fontSize: 12, fontFamily: "inherit",
              fontWeight: activeTab === t.id ? 700 : 400,
              cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.02em",
            }}
          >
            {t.label}
          </button>
        ))}
        {/* Status badges */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, padding: "0 4px", flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: C.dim, whiteSpace: "nowrap" }}>
            {n.toLocaleString()} runs · {years} yrs · {(inflation * 100).toFixed(1)}% infl
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
            color: srColor, background: `${srColor}18`, border: `1px solid ${srColor}40`,
            borderRadius: 20, padding: "2px 10px", whiteSpace: "nowrap",
          }}>
            {successRate.toFixed(1)}% success
          </span>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {activeTab === "overview"  && <TabOverview  res={results} ctx={ctx} />}
        {activeTab === "portfolio" && <TabPortfolio res={results} ctx={ctx} />}
        {activeTab === "income"    && <TabIncome    res={results} ctx={ctx} />}
        {activeTab === "summary"   && <TabSummary   res={results} ctx={ctx} />}
      </div>
    </div>
  );
}
