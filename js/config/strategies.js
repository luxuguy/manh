// ─────────────────────────────────────────────────────────────
// config/strategies.js — Withdrawal strategy definitions
//
// To add a new strategy:
//   1. Add an entry to the appropriate group in STRATEGIES
//   2. Add its simulation logic in core/engine.js → monteCarlo()
//   3. Set usesAmt / usesRate to show the right inputs in Sidebar
// ─────────────────────────────────────────────────────────────

const STRATEGIES = [
  {
    group: "Basic",
    items: [
      {
        id: "constant",
        label: "Constant Dollar (4% Rule)",
        usesAmt: true,
        usesRate: false,
        desc: 'Withdraw a fixed, inflation-adjusted dollar amount every year — regardless of market performance. This is the classic "4% Rule" from the Trinity Study. Simple and predictable, but can deplete a falling portfolio because spending never adjusts downward in bad markets.',
      },
      {
        id: "pct",
        label: "Percent of Portfolio",
        usesAmt: false,
        usesRate: true,
        desc: "Each year, withdraw a fixed percentage of your portfolio's current value. Income rises in good markets and falls in bad ones — the portfolio can never technically hit zero, but withdrawals may shrink uncomfortably in prolonged downturns.",
      },
      {
        id: "one_n",
        label: "1/N (Years Remaining)",
        usesAmt: false,
        usesRate: false,
        desc: "Each year, divide your remaining portfolio by the number of years left. This mathematically guarantees spending every dollar by the final year. Best for those who want certainty of using all their money without concern for leaving a legacy.",
      },
    ],
  },
  {
    group: "Maximize Spending",
    items: [
      {
        id: "vpw",
        label: "Variable Percentage Withdrawal (VPW)",
        usesAmt: false,
        usesRate: true,
        desc: "Calculates a withdrawal percentage that gradually increases each year to optimally draw down the portfolio by end of retirement. Derived from PMT calculations accounting for remaining years. Allows higher early spending than the 4% Rule and adjusts dynamically.",
      },
    ],
  },
  {
    group: "Maximize Longevity",
    items: [
      {
        id: "guyton_klinger",
        label: "Guyton-Klinger Guardrails",
        usesAmt: true,
        usesRate: false,
        desc: "Starts with a fixed withdrawal but applies two annual guardrail rules: (1) if your withdrawal rate rises above 120% of initial (portfolio fell badly), cut spending 10%; (2) if it falls below 80% (portfolio grew a lot), boost spending 10%. A self-regulating system.",
      },
      {
        id: "endowment",
        label: "Endowment Strategy",
        usesAmt: true,
        usesRate: true,
        desc: "Blends 65% fixed prior-year withdrawal (stability) with 35% of current portfolio value (market responsiveness). Modeled after university endowment fund management — balancing predictability with market adaptation for smooth, sustainable long-term income.",
      },
    ],
  },
];

// Flat lookup map: strategyId → strategy object
const STRAT_MAP = Object.fromEntries(
  STRATEGIES.flatMap(g => g.items.map(s => [s.id, s]))
);
