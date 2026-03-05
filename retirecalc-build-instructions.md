# RetireCalc — Full Build Instructions
> A standalone Monte Carlo retirement planning simulator.  
> Deliver a single `retirecalc.html` file that runs in any modern browser with no server, no build tools, and no installation required.

---

## Overview of the Final Product

**RetireCalc** is a dark-themed, single-page web app that simulates retirement portfolio outcomes using Monte Carlo methods. The user configures their portfolio on a sidebar, clicks "Run", and sees fan charts, histograms, percentile breakdowns, a success-rate gauge, and personalised recommendations across four result tabs.

Key capabilities:
- Monte Carlo simulation (up to 10,000 iterations)
- Four asset classes with 50 years of embedded offline real-return data
- Six withdrawal strategies with plain-English explanations
- Inflation assumption slider that shifts real returns dynamically
- 40-country tax gross-up: user enters **net after-tax** withdrawal need; the app calculates the required **gross** amount
- Income sources and extra withdrawal events
- Fan charts, histograms, percentile bar charts, a depletion-risk timeline, and a success-rate arc gauge
- Zero external dependencies at runtime — all CDN scripts are loaded once then browser-cached

---

## Tech Stack

| Layer | Choice |
|---|---|
| UI framework | React 18 (UMD from `unpkg.com`) |
| Charts | Recharts 2 (UMD from `unpkg.com`) |
| JSX transpilation | Babel Standalone (in-browser, from `unpkg.com`) |
| Styling | Inline React `style` objects only — no CSS framework |
| Fonts | Google Fonts — Outfit (UI) + JetBrains Mono (numbers) |
| State management | React `useState` / `useMemo` / `useCallback` only |
| Delivery | Single `.html` file |

---

## Prompt 1 — Analyse the Reference Site

> *"I want to re-create this website, plus additional features. First, analyze all functions and features of this website, and create a detailed summary of all functionalities: https://ficalc.app/"*

### What to research and document about FI Calc

Fetch `https://ficalc.app/` and catalogue every feature:

**Portfolio configuration**
- Starting portfolio value
- Asset allocation sliders (stocks / bonds / cash) with a live allocation bar
- Expense ratio / fee input
- Rebalancing toggle
- Glide-path support

**Simulation settings**
- Retirement duration (years)
- Historical backtesting (not Monte Carlo — this is a gap to fill)
- Start year selector

**Withdrawal strategies (10+)**
1. Constant Dollar (4% Rule)
2. Percent of Portfolio
3. 1/N (divide by years remaining)
4. Variable Percentage Withdrawal (VPW)
5. Custom VPW
6. Dynamic SWR
7. Endowment Strategy
8. Guyton-Klinger Guardrails
9. 95% Rule
10. CAPE-based / Sensible Withdrawals
11. Hebeler Autopilot II
12. Vanguard Dynamic Spending

**Additional inputs**
- Extra withdrawals (one-time or recurring)
- Income sources (Social Security, pension, etc.) with start year and duration

**Results**
- Overall success / failure rate
- Withdrawal statistics (median, range)
- Portfolio end-value distribution
- Year-by-year drill-down table
- Simulation fan charts
- CSV export
- URL sharing

**Gaps in FI Calc to address in RetireCalc**
- No Monte Carlo simulation
- No tax modeling
- No inflation assumption control
- No international equity asset class
- No multi-country support

---

## Prompt 2 — Build the Initial React App

> *"Recreate this website.*
> *1. For the simulation, use Monte Carlo simulation technique with options to select the number of iterations/runs (up to 10,000 runs).*
> *2. Market data should be available offline.*
> *For results, add a section to display:*
> *3. Distribution of the final account value including a fan chart*
> *4. Distribution of the monthly income including a fan chart*
> *5. Summary of the strategy to see if it will last my lifetime."*

### Deliverable

A single React JSX component file (`fi-calc.jsx`) with everything self-contained.

### Monte Carlo Engine

Use a **log-normal return model** with the **Box-Muller transform** to generate normally distributed random variates:

```js
function randn() {
  let u, v;
  do { u = Math.random(); } while (!u);
  do { v = Math.random(); } while (!v);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
```

For each simulation run and each year:
1. Draw a random return from the blended portfolio's log-normal distribution
2. Apply the withdrawal (strategy-dependent)
3. Add income sources, subtract extra expenses
4. Record portfolio balance and monthly withdrawal
5. Flag the run as "depleted" if portfolio hits $0

### Offline Market Data (initial — 3 asset classes)

Embed real return parameters directly in the source (no API calls):

```js
const MKT = {
  stocks: { mean: 0.070, std: 0.155, label: "US Equities" },
  bonds:  { mean: 0.015, std: 0.070, label: "Bonds" },
  cash:   { mean: 0.003, std: 0.008, label: "Cash / HYSA" },
};
```

These are **real returns after CPI inflation** so nominal inflation is already baked in at the historical ~3% average.

### Withdrawal Strategies to Implement

| ID | Label | Inputs needed |
|---|---|---|
| `constant` | Constant Dollar (4% Rule) | Annual $ amount |
| `pct` | Percent of Portfolio | Rate % |
| `one_n` | 1/N (Years Remaining) | None |
| `vpw` | Variable Percentage Withdrawal | Rate % |
| `guyton_klinger` | Guyton-Klinger Guardrails | Annual $ amount |
| `endowment` | Endowment Strategy | Amount + Rate |

**Guyton-Klinger rules:**
- If current withdrawal rate > 120% of initial rate → cut spending 10%
- If current withdrawal rate < 80% of initial rate → increase spending 10%

**Endowment formula:** `withdrawal = 0.65 × prior_year_withdrawal + 0.35 × (portfolio × rate)`

**VPW formula:** `withdrawal = portfolio × min(0.5, 1.35 / years_remaining)`

### Results Tabs

Build four tabs:

**Tab 1 — Overview**
- Six stat cards: Success Rate, Median Final Portfolio, Portfolios Depleted, Median Monthly Income, 90th Pct Monthly, 10th Pct Monthly
- Fan chart: Portfolio Value Over Time
- Fan chart: Monthly Withdrawal Over Time

**Tab 2 — Portfolio**
- Fan chart (larger): Portfolio Balance
- Histogram: Final Portfolio Value Distribution
- Three stat cards: Median / P10 / P90 final values

**Tab 3 — Income**
- Fan chart: Monthly Income
- Grouped bar chart: Monthly Income by Year (P10 / Median / P90)
- Histogram: Average Monthly Income Distribution

**Tab 4 — Lifetime Summary**
- Arc gauge showing success rate (colour-coded: green ≥90%, amber ≥75%, orange ≥60%, red <60%)
- Verdict text (Excellent / Good / Moderate / High Risk)
- Configuration recap table
- Outcome probability cards with progress bars
- Depletion risk timeline (area chart, shown only when depletion > 0)
- Analysis & Recommendations section (context-aware alerts)

### Fan Chart Implementation

Use Recharts `ComposedChart` with stacked `Area` layers + a `Line` for the median:

```
base    = p5  (transparent, acts as offset)
lo      = p25 - p5   (10% opacity)
mid_lo  = p50 - p25  (28% opacity)
mid_hi  = p75 - p50  (28% opacity)
hi      = p95 - p75  (10% opacity)
median  = p50 line   (amber, 2.5px)
```

### Design System

```js
const C = {
  bg: "#050d1b",        // page background
  sidebar: "#070e1c",   // sidebar background
  card: "#0b1628",      // card background
  cardBorder: "#102138",
  input: "#0d1a2e",     // input fields
  border: "#1a3050",
  accent: "#f59e0b",    // amber — primary accent
  blue: "#3b82f6",      // US equities / portfolio charts
  purple: "#a78bfa",    // international equities
  teal: "#06b6d4",      // bonds
  green: "#22c55e",     // income / success
  red: "#ef4444",       // depletion / risk
  text: "#e2e8f0",
  muted: "#94a3b8",
  dim: "#475569",
  faint: "#1e3050",
};
```

Fonts: `Outfit` for UI text, `JetBrains Mono` for all numbers and financial figures.

### Sidebar Sections (in order)

1. **Portfolio** — Starting Value input, data info box, allocation sliders
2. **Retirement Duration** — Slider (5–60 years)
3. **Withdrawal Strategy** — Dropdown + strategy description box + amount/rate inputs
4. **Income Sources** — Add/remove income streams (name, annual $, start year, duration or forever)
5. **Extra Withdrawals** — Add/remove expense events (name, annual $, start year, duration)
6. **Simulation** — Iterations slider (100–10,000) + Run button

---

## Prompt 3 — Expand to 4 Asset Classes with 50-Year Historical Data

> *"Asset allocation data should cover Stock US Equities, Stock International Equities, Bond and Cash. Data for US and International stock equities should be available offline for the past 50 years for Monte Carlo simulation.*
> *Add a text field below withdrawal strategy to explain what each withdrawal strategy does."*

### Embed 50 Years of Annual Real Returns (1975–2024)

Embed all 200 data points directly in the source as arrays, then **compute** mean and std from the data (do not hardcode them — derive them so they update automatically if data is corrected):

```js
const HIST = {
  // US Equities — S&P 500 real returns after CPI (%)
  usEq: [
    31.5, 19.1,-11.5,  1.1, 12.0,   // 1975–1979
    25.8, -9.7, 14.8, 17.3,  1.4,   // 1980–1984
    26.3, 14.6,  2.0, 12.4, 27.3,   // 1985–1989
    -6.6, 26.3,  4.5,  7.1, -1.5,   // 1990–1994
    34.1, 20.3, 31.0, 26.7, 19.5,   // 1995–1999
   -10.1,-13.0,-23.4, 26.4,  9.0,   // 2000–2004
     3.0, 13.6,  3.5,-38.5, 23.5,   // 2005–2009
    12.8,  0.0, 13.4, 29.6, 11.4,   // 2010–2014
    -0.7,  9.5, 19.4, -6.2, 28.9,   // 2015–2019
    16.3, 26.9,-19.4, 24.2, 21.5,   // 2020–2024
  ].map(v => v / 100),

  // International Equities — MSCI EAFE real returns (%)
  intlEq: [
    27.0,  3.7,  5.0, 21.0,  3.7,
     9.5, -5.8, -3.1, 15.6,  4.0,
    40.6, 56.2, 20.0, 24.6,  7.9,
   -27.5,  7.7,-15.7, 28.3,  2.0,
     8.7,  5.5,  0.5, 16.2, 22.0,
   -14.6,-20.2,-15.7, 35.1, 18.8,
     9.3, 23.7,  7.8,-44.1, 24.6,
     4.0,-15.7, 15.8, 19.5, -6.7,
    -5.7,  0.5, 20.0,-16.1, 18.4,
     4.9,  8.2,-17.3, 15.8,  3.2,
  ].map(v => v / 100),

  // Bonds — Bloomberg US Aggregate real returns (%)
  bonds: [
    -3.1, 11.3,  0.1, -2.1,  2.8,
   -15.4, -4.5, 31.1,  4.8, 12.6,
    17.7, 13.6, -1.4,  6.4, 11.2,
     4.2, 13.5,  5.4,  9.2, -5.4,
    13.6,  0.2,  7.8,  6.7, -3.2,
    11.6,  5.3,  8.3,  3.4,  3.5,
     0.7,  2.8,  5.4,  0.5,  3.9,
     2.8,  5.9,  2.2, -6.4,  4.3,
     0.0,  0.8,  0.7, -2.8,  5.9,
     4.8, -4.3,-17.8,  1.5,  2.1,
  ].map(v => v / 100),
};

function histStats(arr) {
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  return { mean, std };
}

const MKT = {
  usEq:   { ...histStats(HIST.usEq),   label: "US Equities (S&P 500)",     color: "#3b82f6" },
  intlEq: { ...histStats(HIST.intlEq), label: "Intl Equities (MSCI EAFE)", color: "#a78bfa" },
  bonds:  { ...histStats(HIST.bonds),  label: "Bonds (US Agg)",            color: "#06b6d4" },
  cash:   { mean: 0.003, std: 0.008,   label: "Cash / HYSA",              color: "#f59e0b" },
};
```

### Cross-Asset Correlation in the Monte Carlo Engine

Use a shared market factor `z0` to introduce realistic correlation between assets:

```js
const z0 = randn();
const zU = 0.70 * z0 + Math.sqrt(1 - 0.49)   * randn();  // US corr ~0.70
const zI = 0.65 * z0 + Math.sqrt(1 - 0.4225) * randn();  // Intl corr ~0.65
const zB = 0.08 * z0 + Math.sqrt(1 - 0.0064) * randn();  // Bonds low corr

const ret = usEqPct   * Math.exp(UL.lm + UL.ls * zU)
          + intlEqPct * Math.exp(IL.lm + IL.ls * zI)
          + bndPct    * Math.exp(BL.lm + BL.ls * zB)
          + cshPct    * (1 + cashReal);
```

### 4-Asset Allocation Sliders with Auto-Normalisation

When one slider moves, scale the other three proportionally so they always sum to 100%:

```js
const set = (key, newVal) => {
  const v = Math.max(0, Math.min(1, newVal));
  const rest = { us, intl, bnd, csh };
  rest[key] = v;
  const others = Object.entries(rest).filter(([k]) => k !== key);
  const sumOthers = others.reduce((a, [, x]) => a + x, 0);
  const deficit = Math.max(0, 1 - v);
  if (sumOthers <= 0) others.forEach(([k]) => { rest[k] = deficit / 3; });
  else others.forEach(([k, x]) => { rest[k] = (x / sumOthers) * deficit; });
  onChange(rest);
};
```

Show a live multi-colour allocation bar beneath the sliders. Each slider shows the asset's μ and σ derived from the historical data.

### Strategy Description Box

Below the strategy dropdown, add a permanently visible description panel:

```jsx
<div style={{
  background: "#06101e",
  border: "1px solid #1a3456",
  borderLeft: "3px solid #f59e0b",   // amber left accent
  borderRadius: "0 8px 8px 0",
  padding: "12px 14px",
  fontSize: 11.5,
  color: "#94a3b8",
  lineHeight: 1.8,
}}>
  {strat.desc}
</div>
```

Store the description in the strategy definition object:

```js
const STRATEGIES = [
  { group: "Basic", items: [
    { id: "constant", label: "Constant Dollar (4% Rule)", usesAmt: true, usesRate: false,
      desc: "Withdraw a fixed, inflation-adjusted dollar amount every year..." },
    // ...
  ]},
  // ...
];
```

Group strategies using `<optgroup>` in the select element for visual separation.

---

## Prompt 4 — Inflation Slider, Input Fix, and 40-Country Tax Gross-Up

> *"Add a slider for Inflation Input.*
> *Fix an issue where I cannot change the starting value field (won't let me delete it below 1000 to enter a new value).*
> *For Annual Withdrawal field, specify that field is NET after tax. Add a drop box menu to include the top 40 countries as well as their tax brackets to calculate the actual withdrawal rate BEFORE tax and use that for calculation."*

### Fix Free-Form Number Inputs

Change all number inputs that have min-value clamping from `type="number"` to `type="text"` with `inputMode="numeric"`. Validate only on `onBlur`, not `onChange`:

```jsx
<input
  type="text"
  inputMode="numeric"
  value={portfolioStr}
  onChange={e => setPortfolioStr(e.target.value)}       // allow anything while typing
  onBlur={() => {
    const v = Math.max(1000, parseFloat(portfolioStr.replace(/,/g, '')) || 1000);
    setPortfolioStr(v.toLocaleString());
  }}
/>
```

Store raw string in state; derive the numeric value with `useMemo`.

### Inflation Section (new sidebar section, between Duration and Withdrawal)

- Slider: 0–12%, step 0.1%, default **3.0%** (matching the baseline embedded in the historical data)
- Live display of current value in orange (`#fb923c`)
- Info box showing:
  - Baseline (historical avg): 3.0%
  - Your assumption: X%
  - Real return adjustment: ±Y% (green if deflation vs baseline, red if higher inflation)
  - Cash real return: Z% (can go negative)

**Inflation adjustment logic:**

The 50-year historical data already embeds ~3% average inflation as real returns. When the user selects a different inflation rate, shift all asset means by the difference:

```js
const BASELINE_INFLATION = 0.03;
const inflAdj = -(inflation - BASELINE_INFLATION);  // negative = more inflation = lower real return

const adjMean = (m) => ({ ...m, mean: m.mean + inflAdj });
const us   = adjMean(MKT.usEq);
const intl = adjMean(MKT.intlEq);
const bnd  = adjMean(MKT.bonds);
const cashReal = Math.max(-0.05, 0.015 - inflation);  // cash real return floored at -5%
```

### Annual Withdrawal — Net After Tax

Label the withdrawal field clearly:

```
ANNUAL WITHDRAWAL — NET AFTER TAX
$3,333/month net · 4.00% of portfolio
```

Use a binary-search gross-up function to find the gross amount that, after tax, equals the user's desired net:

```js
function taxOnGross(gross, brackets) {
  let tax = 0;
  for (const [mn, mx, rate] of brackets) {
    if (gross <= mn) break;
    tax += (Math.min(gross, mx) - mn) * rate;
  }
  return Math.max(0, tax);
}

function grossFromNet(net, brackets) {
  if (!brackets || brackets.length === 0) return net;
  if (brackets.length === 1 && brackets[0][2] === 0) return net;  // no-tax countries
  let lo = net, hi = net * 6;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const diff = mid - taxOnGross(mid, brackets) - net;
    if (Math.abs(diff) < 0.5) return mid;
    diff < 0 ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}
```

Pass `grossAnnWd` (not `netAnnWd`) into the Monte Carlo engine.

### 40-Country Tax Table

Include these 40 countries/regions with simplified national/federal progressive brackets (USD-denominated thresholds). Format: `[minUSD, maxUSD, marginalRate]`.

| # | Country | Notes |
|---|---|---|
| 1 | 🌐 No Income Tax | UAE, Qatar, Monaco, Cayman Islands, etc. |
| 2 | 🇺🇸 United States | Federal only. Single filer, standard deduction. |
| 3 | 🇬🇧 United Kingdom | England/Wales. Personal allowance ~$16K. |
| 4 | 🇨🇦 Canada | Federal only. Basic personal amount included. |
| 5 | 🇦🇺 Australia | Federal. Tax-free threshold ~$12K. |
| 6 | 🇩🇪 Germany | Federal. Basic allowance ~$13K. |
| 7 | 🇫🇷 France | National. Simplified part quotient. |
| 8 | 🇯🇵 Japan | National + local combined. |
| 9 | 🇳🇱 Netherlands | Box 1 income. |
| 10 | 🇸🇪 Sweden | State + municipal combined. |
| 11 | 🇳🇴 Norway | National + municipal + bracket tax. |
| 12 | 🇩🇰 Denmark | State + municipal combined. |
| 13 | 🇨🇭 Switzerland | Federal only (no cantonal). |
| 14 | 🇸🇬 Singapore | Resident individual rate. |
| 15 | 🇭🇰 Hong Kong | Progressive salary tax. |
| 16 | 🇳🇿 New Zealand | Resident. |
| 17 | 🇮🇪 Ireland | PAYE. |
| 18 | 🇧🇪 Belgium | Federal. |
| 19 | 🇦🇹 Austria | Federal. |
| 20 | 🇪🇸 Spain | State rate. |
| 21 | 🇮🇹 Italy | IRPEF national. |
| 22 | 🇵🇹 Portugal | IRS. |
| 23 | 🇬🇷 Greece | National. |
| 24 | 🇫🇮 Finland | State + municipal combined. |
| 25 | 🇰🇷 South Korea | National. |
| 26 | 🇮🇱 Israel | Progressive NIS rate. |
| 27 | 🇧🇷 Brazil | IRPF federal. |
| 28 | 🇲🇽 Mexico | ISR federal. |
| 29 | 🇮🇳 India | New regime FY2024-25. |
| 30 | 🇨🇳 China | IIT. |
| 31 | 🇿🇦 South Africa | National. |
| 32 | 🇹🇭 Thailand | PIT. |
| 33 | 🇲🇾 Malaysia | Personal income tax. |
| 34 | 🇮🇩 Indonesia | PPh 21. |
| 35 | 🇵🇭 Philippines | BIR TRAIN Law. |
| 36 | 🇵🇱 Poland | PIT. |
| 37 | 🇨🇿 Czech Republic | PIT. |
| 38 | 🇭🇺 Hungary | Flat 15%. |
| 39 | 🇷🇴 Romania | Flat ~20% combined. |
| 40 | 🇻🇳 Vietnam | PIT. |

**Tax selector UI** — below the net withdrawal input, show:
- Country dropdown
- A green-accented info box showing:
  - Gross before tax (large, green)
  - Net after tax
  - Estimated annual tax (red)
  - Effective rate % (amber)
  - A red fill bar proportional to effective rate
  - Disclaimer: "Approximate national/federal tax only. Consult a tax professional."

---

## Prompt 5 — Convert to Standalone HTML for Browser

> *"Convert the code to be able to run off a web browser."*

### Deliverable: `retirecalc.html`

A single self-contained `.html` file. The user should be able to double-click it and open it in Chrome, Firefox, Safari, or Edge.

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>RetireCalc — Monte Carlo Retirement Simulator</title>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>

  <!-- Dependencies (loaded from CDN, cached by browser after first visit) -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/prop-types@15/prop-types.min.js" crossorigin></script>
  <script src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="loading-screen">...</div>
  <div id="root"></div>

  <script type="text/babel" data-presets="react">
    // All React/JSX code goes here as one inline script block
    const { useState, useCallback, useMemo } = React;
    const { ComposedChart, Area, Line, ... } = Recharts;

    // ... full app code ...

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<App/>);
  </script>
</body>
</html>
```

### Critical conversion rules

1. **Remove all `import` statements** — globals are provided by the UMD CDN scripts (`React`, `ReactDOM`, `Recharts`)
2. **Destructure from globals** at the top of the `<script>` block:
   ```js
   const { useState, useCallback, useMemo } = React;
   const { ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis,
           CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } = Recharts;
   ```
3. **Rename any component** that clashes with a native HTML element or browser global. Specifically:
   - `Input` → `InputField`
   - `Select` → `SelectField`
   - `Slider` → `SliderInput`
   - The `$$` formatter → `fmt$` (avoid confusion, though `$$` is technically valid)
4. **Mount with `ReactDOM.createRoot`** (React 18 API)
5. **Add a loading screen** shown while Babel transpiles JSX (takes 1–2 seconds):
   ```css
   @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
   ```
   Remove it after the script finishes executing.
6. **Set `type="text/babel" data-presets="react"`** on the script tag — this tells Babel standalone to transpile it.
7. **Do not use `localStorage`** — all state lives in React `useState`.

### Loading screen HTML

```html
<div id="loading-screen" style="position:fixed;inset:0;background:#050d1b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:9999;transition:opacity 0.4s;">
  <div style="font-size:48px;color:#f59e0b;animation:pulse 1.2s ease-in-out infinite;">◈</div>
  <div style="font-size:14px;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">Loading RetireCalc…</div>
</div>
```

After mount, fade out:
```js
document.getElementById("loading-screen").classList.add("fade-out");
setTimeout(() => {
  const el = document.getElementById("loading-screen");
  if (el) el.remove();
}, 500);
```

---

## Complete Feature Checklist

### Sidebar
- [x] Starting portfolio — free-text input (validates on blur, min $1,000)
- [x] Offline data info box — shows μ and σ for all 4 assets
- [x] Asset allocation — 4 sliders (US, Intl, Bonds, Cash) that auto-normalise to 100%
- [x] Live allocation bar with 4 coloured segments
- [x] Each slider shows: asset label, current %, μ, σ, "50-yr real"
- [x] Retirement duration slider — 5 to 60 years
- [x] Inflation slider — 0% to 12%, default 3%
- [x] Inflation info box — shows adjustments and cash real return
- [x] Withdrawal strategy dropdown — grouped by category
- [x] Strategy description — always-visible amber-accented text box
- [x] Annual withdrawal input — labelled "NET After Tax", free-text
- [x] Tax country dropdown — 40 options with flag emoji
- [x] Tax gross-up box — shows gross, tax, and effective rate
- [x] Withdrawal rate slider (for rate-based strategies)
- [x] Income sources — add/remove, name / $ / start year / duration or forever
- [x] Extra withdrawals — add/remove, name / $ / start year / duration
- [x] Monte Carlo iterations slider — 100 to 10,000
- [x] Run button — disabled and shows spinner text during simulation

### Results
- [x] Tab bar with 4 tabs
- [x] Tab status badge — runs, years, inflation %, success rate (colour-coded)
- [x] Overview: 6 stat cards
- [x] Overview: Tax summary bar (when strategy uses amount)
- [x] Overview: 2 fan charts (portfolio + income)
- [x] Portfolio: Fan chart (tall), histogram, 3 stat cards
- [x] Income: Fan chart, grouped bar chart by year, average income histogram, 3 stat cards
- [x] Lifetime Summary: arc gauge, verdict text, config recap table
- [x] Lifetime Summary: 4 outcome probability cards with animated progress bars
- [x] Lifetime Summary: Depletion risk area chart (conditional)
- [x] Lifetime Summary: Context-aware recommendation alerts (success rate / inflation / international allocation)

### Simulation Engine
- [x] Log-normal returns via Box-Muller transform
- [x] Cholesky-like cross-asset correlation
- [x] Inflation adjustment on all asset means
- [x] Cash real return floored at -5%
- [x] All 6 withdrawal strategies
- [x] Income source offsets per year
- [x] Extra withdrawal additions per year
- [x] Depletion tracking (year and run-level)
- [x] Percentile calculation for fan charts (P5, P10, P25, P50, P75, P90, P95)
- [x] Histogram binning for final portfolio and average monthly income
- [x] Sampled-year income percentile bars

---

## Visual Design Reference

| Element | Value |
|---|---|
| Page background | `#050d1b` |
| Sidebar background | `#070e1c` |
| Card background | `#0b1628` |
| Input background | `#0d1a2e` |
| Border | `#1a3050` |
| Primary accent | `#f59e0b` (amber) |
| US Equities | `#3b82f6` (blue) |
| Intl Equities | `#a78bfa` (purple) |
| Bonds | `#06b6d4` (teal) |
| Cash / accent | `#f59e0b` (amber) |
| Income / success | `#22c55e` (green) |
| Risk / depletion | `#ef4444` (red) |
| Inflation | `#fb923c` (orange) |
| Text | `#e2e8f0` |
| Muted text | `#94a3b8` |
| Dim text | `#475569` |
| UI font | Outfit (Google Fonts) |
| Number font | JetBrains Mono (Google Fonts) |

---

## Validation Notes

After building, verify these outputs manually:

| Test | Expected result |
|---|---|
| US tax: net $40K | Gross ≈ $43,200 (effective rate ≈ 7.4%) |
| No-tax: net $40K | Gross = $40,000 (0% rate) |
| Denmark: net $120K | Gross ≈ $221,000 (effective ≈ 45.7%) |
| MC: $1M, $40K/yr, 60/20/20, 30yr | Success rate ≈ 85–93% |
| Inflation 5% vs 3% | All equity real returns reduced by 2% |
| Inflation 3% (default) | No adjustment to historical returns |
| All sliders sum | Always 100% after any slider move |
| Portfolio input | Can delete all digits and type fresh value |

---

*This document captures every decision made during the build session. Feed it verbatim to any capable LLM with code-generation ability and it should be able to reproduce the full `retirecalc.html` without additional clarification.*
