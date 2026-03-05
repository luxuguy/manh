// ─────────────────────────────────────────────────────────────
// components/Sidebar.jsx — Left panel with all simulation inputs
//
// Sections (in order):
//   1. Portfolio — starting value + asset allocation sliders
//   2. Duration  — years slider
//   3. Inflation — rate slider + context info box
//   4. Withdrawal Strategy — strategy picker + amount/rate + tax
//   5. Income Sources — add/remove recurring income
//   6. Extra Withdrawals — add/remove expense events
//   7. Simulation — iteration count + Run button
// ─────────────────────────────────────────────────────────────

function Sidebar({
  // Portfolio
  portfolioStr, setPortfolioStr, portfolio, alloc, setAlloc,
  // Duration
  years, setYears,
  // Inflation
  inflation, setInflation,
  // Withdrawal
  strategy, setStrategy,
  netAnnWdStr, setNetAnnWdStr, netAnnWd,
  taxCountryId, setTaxCountryId,
  grossAnnWd, effectiveRate,
  wdRate, setWdRate,
  // Income / Extras
  incomes, setIncomes,
  extras,  setExtras,
  newInc,  setNewInc,
  newExt,  setNewExt,
  // Simulation
  runs, setRuns,
  onRun, running,
}) {
  const strat = STRAT_MAP[strategy];

  return (
    <div style={{
      width: 320, minWidth: 320,
      background: C.sidebar,
      borderRight: `1px solid ${C.cardBorder}`,
      overflowY: "auto",
      padding: "14px",
      display: "flex", flexDirection: "column", gap: 18,
      flexShrink: 0,
    }}>

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", paddingBottom: 12, borderBottom: `1px solid ${C.faint}` }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: C.accent, letterSpacing: "-0.03em" }}>◈ RetireCalc</div>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>
          Monte Carlo Retirement Simulator
        </div>
      </div>

      {/* ── 1. Portfolio ─────────────────────────────────────── */}
      <div>
        <SecHeader icon="🏦">Portfolio</SecHeader>
        <div style={{ marginBottom: 14 }}>
          <Label>Starting Value ($)</Label>
          <InputField
            type="text" inputMode="numeric"
            value={portfolioStr} placeholder="1000000"
            onChange={e => setPortfolioStr(e.target.value)}
            onBlur={() => {
              const v = Math.max(1000, parseFloat(portfolioStr.replace(/,/g, "")) || 1000);
              setPortfolioStr(v.toLocaleString());
            }}
          />
          <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>= {fmt$(portfolio)}</div>
        </div>

        {/* Market data info box */}
        <div style={{ background: "#060f1e", border: `1px solid ${C.faint}`, borderRadius: 8, padding: "10px 12px", marginBottom: 13 }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            📊 50-Year Real Returns (1975–2024)
          </div>
          {Object.entries(MKT).map(([k, m]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 10 }}>
              <span style={{ color: C.dim }}>{m.label}</span>
              <span style={{ color: m.color, fontFamily: "JetBrains Mono, monospace" }}>
                μ {(m.mean * 100).toFixed(1)}%  σ {(m.std * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          <div style={{ fontSize: 9, color: "#334155", marginTop: 5, lineHeight: 1.5 }}>
            Real returns after CPI inflation. Log-normal with cross-asset correlation.
          </div>
        </div>

        <Label>Asset Allocation</Label>
        <AllocSliders us={alloc.us} intl={alloc.intl} bnd={alloc.bnd} csh={alloc.csh} onChange={setAlloc} />
      </div>

      {/* ── 2. Duration ──────────────────────────────────────── */}
      <div>
        <SecHeader icon="📅">Retirement Duration</SecHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <Label>Years in Retirement</Label>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.accent, fontFamily: "JetBrains Mono, monospace" }}>{years}</span>
        </div>
        <SliderInput min={5} max={60} value={years} onChange={e => setYears(+e.target.value)} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginTop: 3 }}>
          <span>5 yrs</span><span>60 yrs</span>
        </div>
      </div>

      {/* ── 3. Inflation ─────────────────────────────────────── */}
      <div>
        <SecHeader icon="📈">Inflation Assumption</SecHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <Label sub="Adjusts real returns & cash purchasing power">Annual Inflation Rate</Label>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.orange, fontFamily: "JetBrains Mono, monospace" }}>
            {(inflation * 100).toFixed(1)}%
          </span>
        </div>
        <SliderInput color={C.orange} min={0} max={12} step={0.1} value={inflation * 100} onChange={e => setInflation(+e.target.value / 100)} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginTop: 3, marginBottom: 8 }}>
          <span>0%</span><span>12%</span>
        </div>
        <div style={{ background: "#0a0c0e", border: `1px solid ${C.faint}`, borderRadius: 8, padding: "9px 11px", fontSize: 10 }}>
          {[
            ["Baseline (historical avg)", "3.0%",                                    C.muted ],
            ["Your assumption",           `${(inflation * 100).toFixed(1)}%`,        C.orange],
            ["Real return adjustment",
              inflation === BASELINE_INFLATION
                ? "—"
                : `${inflation > BASELINE_INFLATION ? "-" : "+"}${Math.abs((inflation - BASELINE_INFLATION) * 100).toFixed(1)}%`,
              inflation > BASELINE_INFLATION ? C.red : C.green
            ],
            ["Cash real return",
              `${(Math.max(-0.05, 0.015 - inflation) * 100).toFixed(1)}%`,
              0.015 - inflation >= 0 ? C.teal : C.red
            ],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: C.dim }}>{l}</span>
              <span style={{ color: c, fontFamily: "JetBrains Mono, monospace" }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 9, color: "#334155", marginTop: 5, lineHeight: 1.5 }}>
            Higher inflation lowers real returns. At 3% (default), historical data is used unchanged.
          </div>
        </div>
      </div>

      {/* ── 4. Withdrawal Strategy ───────────────────────────── */}
      <div>
        <SecHeader icon="💰">Withdrawal Strategy</SecHeader>
        <div style={{ marginBottom: 10 }}>
          <Label>Strategy</Label>
          <SelectField value={strategy} onChange={e => setStrategy(e.target.value)}>
            {STRATEGIES.map(g => (
              <optgroup key={g.group} label={`── ${g.group}`}>
                {g.items.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </optgroup>
            ))}
          </SelectField>
        </div>

        {/* Strategy description */}
        <div style={{
          background: "#06101e", border: "1px solid #1a3456",
          borderLeft: `3px solid ${C.accent}`, borderRadius: "0 8px 8px 0",
          padding: "12px 14px", marginBottom: 13,
          fontSize: 11.5, color: C.muted, lineHeight: 1.8,
        }}>
          {strat.desc}
        </div>

        {/* Net withdrawal + tax (for amount-based strategies) */}
        {strat.usesAmt && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
                Annual Withdrawal — <span style={{ color: C.green }}>NET After Tax</span>
              </div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>
                {fmt$(netAnnWd / 12)}/month net · {(netAnnWd / portfolio * 100).toFixed(2)}% of portfolio
              </div>
            </div>
            <InputField
              type="text" inputMode="numeric"
              value={netAnnWdStr} placeholder="40000"
              onChange={e => setNetAnnWdStr(e.target.value)}
              onBlur={() => {
                const v = Math.max(0, parseFloat(netAnnWdStr.replace(/,/g, "")) || 0);
                setNetAnnWdStr(v.toLocaleString());
              }}
            />
            <div style={{ marginTop: 10 }}>
              <TaxSelector
                netAnnWd={netAnnWd}
                taxCountryId={taxCountryId}
                onCountryChange={setTaxCountryId}
                grossAnnWd={grossAnnWd}
                effectiveRate={effectiveRate}
              />
            </div>
          </div>
        )}

        {/* Withdrawal rate (for rate-based strategies) */}
        {strat.usesRate && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
              <Label sub={`${fmt$(portfolio * wdRate / 12)}/month at start`}>Withdrawal Rate</Label>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.accent, fontFamily: "JetBrains Mono, monospace" }}>
                {(wdRate * 100).toFixed(1)}%
              </span>
            </div>
            <SliderInput min={1} max={12} step={0.1} value={wdRate * 100} onChange={e => setWdRate(+e.target.value / 100)} />
          </div>
        )}
      </div>

      {/* ── 5. Income Sources ────────────────────────────────── */}
      <div>
        <SecHeader icon="💵">Income Sources</SecHeader>
        {incomes.map((inc, i) => (
          <div key={i} style={{ background: C.input, borderRadius: 7, padding: "8px 10px", marginBottom: 6, fontSize: 11, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.text, fontWeight: 600 }}>{inc.name}</span>
              <button onClick={() => setIncomes(incomes.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13, padding: "0 2px" }}>✕</button>
            </div>
            <div style={{ color: C.green, marginTop: 2 }}>
              {fmt$(inc.amt)}/yr <span style={{ color: C.dim }}>· yr {inc.start} · {inc.forever ? "∞" : `${inc.dur} yrs`}</span>
            </div>
          </div>
        ))}
        <div style={{ background: C.input, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
            <div><Label>Name</Label>
              <InputField value={newInc.name} placeholder="Social Security…" onChange={e => setNewInc({ ...newInc, name: e.target.value })} />
            </div>
            <div><Label>Annual ($)</Label>
              <InputField type="number" value={newInc.amt} step={1000} onChange={e => setNewInc({ ...newInc, amt: +e.target.value })} />
            </div>
            <div><Label>Start Year</Label>
              <InputField type="number" value={newInc.start} min={0} onChange={e => setNewInc({ ...newInc, start: +e.target.value })} />
            </div>
            <div><Label>Duration</Label>
              <SelectField
                value={newInc.forever ? "forever" : String(newInc.dur)}
                onChange={e => setNewInc(e.target.value === "forever"
                  ? { ...newInc, forever: true }
                  : { ...newInc, forever: false, dur: +e.target.value }
                )}
              >
                <option value="forever">∞ Forever</option>
                {[1, 2, 3, 5, 10, 15, 20, 25].map(d => <option key={d} value={d}>{d} yrs</option>)}
              </SelectField>
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => {
            if (newInc.name && newInc.amt > 0) {
              setIncomes([...incomes, { ...newInc }]);
              setNewInc({ name: "", amt: 24000, start: 0, dur: 10, forever: true });
            }
          }}>+ Add Income Source</Btn>
        </div>
      </div>

      {/* ── 6. Extra Withdrawals ─────────────────────────────── */}
      <div>
        <SecHeader icon="🛒">Extra Withdrawals</SecHeader>
        {extras.map((ex, i) => (
          <div key={i} style={{ background: C.input, borderRadius: 7, padding: "8px 10px", marginBottom: 6, fontSize: 11, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: C.text, fontWeight: 600 }}>{ex.name}</span>
              <button onClick={() => setExtras(extras.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13, padding: "0 2px" }}>✕</button>
            </div>
            <div style={{ color: "#f87171", marginTop: 2 }}>
              {fmt$(ex.amt)}/yr <span style={{ color: C.dim }}>· yr {ex.start}–{ex.start + ex.dur - 1}</span>
            </div>
          </div>
        ))}
        <div style={{ background: C.input, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 7 }}>
            <div><Label>Name</Label>
              <InputField value={newExt.name} placeholder="New Car…" onChange={e => setNewExt({ ...newExt, name: e.target.value })} />
            </div>
            <div><Label>Annual ($)</Label>
              <InputField type="number" value={newExt.amt} step={1000} onChange={e => setNewExt({ ...newExt, amt: +e.target.value })} />
            </div>
            <div><Label>Start Year</Label>
              <InputField type="number" value={newExt.start} min={0} onChange={e => setNewExt({ ...newExt, start: +e.target.value })} />
            </div>
            <div><Label>Duration (yrs)</Label>
              <InputField type="number" value={newExt.dur} min={1} onChange={e => setNewExt({ ...newExt, dur: +e.target.value })} />
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => {
            if (newExt.name && newExt.amt > 0) {
              setExtras([...extras, { ...newExt }]);
              setNewExt({ name: "", amt: 10000, start: 5, dur: 1 });
            }
          }}>+ Add Expense</Btn>
        </div>
      </div>

      {/* ── 7. Simulation ────────────────────────────────────── */}
      <div>
        <SecHeader icon="⚙️">Simulation</SecHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <Label>Monte Carlo Iterations</Label>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.accent, fontFamily: "JetBrains Mono, monospace" }}>
            {runs.toLocaleString()}
          </span>
        </div>
        <SliderInput min={100} max={10000} step={100} value={runs} onChange={e => setRuns(+e.target.value)} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.dim, marginTop: 2, marginBottom: 14 }}>
          <span>100</span><span>10,000</span>
        </div>
        <Btn onClick={onRun} disabled={running}>
          {running
            ? `⏳ Simulating ${runs.toLocaleString()} scenarios…`
            : `▶  Run ${runs.toLocaleString()} Simulations`}
        </Btn>
      </div>

    </div>
  );
}
