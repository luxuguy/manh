// ─────────────────────────────────────────────────────────────
// components/Results.jsx — Results panel with tab bar
//
// Renders empty state (with full model explainer), loading
// spinner, or the 4-tab result view.
// ─────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",  label: "Overview"        },
  { id: "portfolio", label: "Portfolio"        },
  { id: "income",    label: "Income"           },
  { id: "summary",   label: "Lifetime Summary" },
  { id: "model",     label: "🔬 Model"         },
];

// ── Empty state — shows full model explainer ──────────────────
function ResultsEmpty() {
  return (
    <div style={{
      height: "100%", overflowY: "auto",
      padding: "32px 28px",
    }}>
      <ModelInfoFull />
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────
function ResultsLoading({ runs, years }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100%", gap: 14,
    }}>
      <div className="spin" style={{ fontSize: 38, color: C.accent }}>◈</div>
      <div style={{ fontSize: 16, color: C.muted }}>
        Running {runs.toLocaleString()} Monte Carlo simulations…
      </div>
      <div style={{ fontSize: 12, color: C.dim }}>
        {years} years × {runs.toLocaleString()} iterations · regime-switching block bootstrap
      </div>
      <div style={{
        marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
      }}>
        {[
          ["🔄 Sampling regimes",   C.accent],
          ["📦 Block bootstrap",    C.purple],
          ["⛓ Markov transitions", C.teal  ],
          ["📊 Aggregating stats",  C.blue  ],
        ].map(([label, color]) => (
          <span key={label} style={{
            fontSize: 10, color,
            background: `${color}12`, border: `1px solid ${color}25`,
            borderRadius: 20, padding: "3px 10px",
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Results panel with tab bar ────────────────────────────────
function ResultsPanel({ results, activeTab, setActiveTab, ctx }) {
  const { srColor, runs, years, inflation } = ctx;
  const { successRate, n } = results;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>

      {/* Tab bar */}
      <div style={{
        display: "flex",
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: "0 20px",
        flexShrink: 0,
        overflowX: "auto",
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === t.id
                ? `2px solid ${t.id === "model" ? C.teal : C.accent}`
                : "2px solid transparent",
              color: activeTab === t.id
                ? (t.id === "model" ? C.teal : C.accent)
                : C.dim,
              padding: "13px 16px",
              fontSize: 12,
              fontFamily: "inherit",
              fontWeight: activeTab === t.id ? 700 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}
          >
            {t.label}
          </button>
        ))}

        {/* Status badges */}
        <div style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: 10,
          padding: "0 4px", flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: C.dim, whiteSpace: "nowrap" }}>
            {n.toLocaleString()} runs · {years} yrs · {(inflation * 100).toFixed(1)}% infl
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
            color: srColor,
            background: `${srColor}18`,
            border: `1px solid ${srColor}40`,
            borderRadius: 20, padding: "2px 10px",
            whiteSpace: "nowrap",
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
        {activeTab === "model"     && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <ModelInfoCompact />
          </div>
        )}
      </div>
    </div>
  );
}
