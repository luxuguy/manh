// ─────────────────────────────────────────────────────────────
// App.jsx — Root component: state, run logic, layout
// ─────────────────────────────────────────────────────────────

function App() {
  // ── Portfolio state ───────────────────────────────────────
  const [portfolioStr, setPortfolioStr] = useState("1,000,000");
  const portfolio = useMemo(() =>
    Math.max(1000, parseFloat(portfolioStr.replace(/,/g, "")) || 1000),
  [portfolioStr]);

  const [alloc, setAlloc] = useState({ us: 0.40, intl: 0.20, bnd: 0.30, csh: 0.10 });

  // ── Duration & inflation ──────────────────────────────────
  const [years,     setYears]     = useState(30);
  const [inflation, setInflation] = useState(0.03);

  // ── Withdrawal ────────────────────────────────────────────
  const [strategy,     setStrategy]     = useState("constant");
  const [netAnnWdStr,  setNetAnnWdStr]  = useState("40,000");
  const [taxCountryId, setTaxCountryId] = useState("US");
  const [wdRate,       setWdRate]       = useState(0.04);

  const netAnnWd   = useMemo(() => Math.max(0, parseFloat(netAnnWdStr.replace(/,/g, "")) || 0), [netAnnWdStr]);
  const taxCountry = useMemo(() => TAX_COUNTRIES.find(c => c.id === taxCountryId) || TAX_COUNTRIES[0], [taxCountryId]);
  const grossAnnWd = useMemo(() => grossFromNet(netAnnWd, taxCountry.brackets), [netAnnWd, taxCountry]);
  const taxAmount  = useMemo(() => grossAnnWd - netAnnWd, [grossAnnWd, netAnnWd]);
  const effectiveRate = useMemo(() =>
    grossAnnWd > 0 ? (taxAmount / grossAnnWd) * 100 : 0,
  [taxAmount, grossAnnWd]);

  // ── Income / extra expense lists ──────────────────────────
  const [incomes, setIncomes] = useState([]);
  const [extras,  setExtras]  = useState([]);
  const [newInc,  setNewInc]  = useState({ name: "", amt: 24000, start: 0,  dur: 10, forever: true });
  const [newExt,  setNewExt]  = useState({ name: "", amt: 10000, start: 5, dur: 1  });

  // ── Simulation ────────────────────────────────────────────
  const [runs,      setRuns]      = useState(1000);
  const [results,   setResults]   = useState(null);
  const [running,   setRunning]   = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const strat   = STRAT_MAP[strategy];
  const srColor = results
    ? results.successRate >= 90 ? C.green
    : results.successRate >= 75 ? C.accent
    : results.successRate >= 60 ? "#f97316"
    : C.red
    : C.text;

  // ── Run handler ───────────────────────────────────────────
  const handleRun = useCallback(() => {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      const sims = monteCarlo({
        portfolio,
        usEqPct:   alloc.us,
        intlEqPct: alloc.intl,
        bndPct:    alloc.bnd,
        cshPct:    alloc.csh,
        years, strategy, grossAnnWd, wdRate,
        incomes, extras, runs, inflation,
      });
      setResults(analyze(sims, years));
      setRunning(false);
      setActiveTab("overview");
    }, 40);
  }, [portfolio, alloc, years, strategy, grossAnnWd, wdRate, incomes, extras, runs, inflation]);

  // ── Context bundle ────────────────────────────────────────
  const ctx = {
    srColor, strat, inflation, portfolio, alloc, years, runs,
    netAnnWd, grossAnnWd, taxAmount, effectiveRate, taxCountry,
    wdRate,
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: "Outfit, sans-serif",
      background: C.bg, color: C.text,
      height: "100vh",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* Header bar */}
      <div style={{
        background: C.sidebar,
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: "9px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 22, color: C.accent }}>◈</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.03em" }}>RetireCalc</div>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Monte Carlo Retirement Simulator
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            ["🎲", "Monte Carlo",                    C.blue  ],
            ["🌍", "4 Assets",                       C.purple],
            ["📈", `${(inflation * 100).toFixed(1)}% Inflation`, C.orange],
            ["🧾", "40-Country Tax",                 C.green ],
            ["📅", "100-Year Data",                  C.teal  ],
          ].map(([icon, label, color]) => (
            <span key={label} style={{
              fontSize: 10, color, background: `${color}12`,
              border: `1px solid ${color}30`, borderRadius: 20, padding: "3px 9px",
            }}>
              {icon} {label}
            </span>
          ))}
          {results && (
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono, monospace",
              color: srColor, background: `${srColor}12`, border: `1px solid ${srColor}40`,
              borderRadius: 20, padding: "3px 9px",
            }}>
              ✓ {results.successRate.toFixed(1)}% success
            </span>
          )}
        </div>
      </div>

      {/* Body: sidebar + main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          portfolioStr={portfolioStr}   setPortfolioStr={setPortfolioStr}
          portfolio={portfolio}
          alloc={alloc}                 setAlloc={setAlloc}
          years={years}                 setYears={setYears}
          inflation={inflation}         setInflation={setInflation}
          strategy={strategy}           setStrategy={setStrategy}
          netAnnWdStr={netAnnWdStr}     setNetAnnWdStr={setNetAnnWdStr}
          netAnnWd={netAnnWd}
          taxCountryId={taxCountryId}   setTaxCountryId={setTaxCountryId}
          grossAnnWd={grossAnnWd}       effectiveRate={effectiveRate}
          wdRate={wdRate}               setWdRate={setWdRate}
          incomes={incomes}             setIncomes={setIncomes}
          extras={extras}               setExtras={setExtras}
          newInc={newInc}               setNewInc={setNewInc}
          newExt={newExt}               setNewExt={setNewExt}
          runs={runs}                   setRuns={setRuns}
          onRun={handleRun}
          running={running}
        />

        <div style={{ flex: 1, overflow: "hidden" }}>
          {running
            ? <ResultsLoading runs={runs} years={years} />
            : results
            ? <ResultsPanel results={results} activeTab={activeTab} setActiveTab={setActiveTab} ctx={ctx} />
            : <ResultsEmpty />
          }
        </div>
      </div>
    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

document.getElementById("loading-screen").classList.add("fade-out");
setTimeout(() => {
  const el = document.getElementById("loading-screen");
  if (el) el.remove();
}, 500);
