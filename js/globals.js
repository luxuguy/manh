// ─────────────────────────────────────────────────────────────
// globals.js — Destructure CDN globals once for all modules
// ─────────────────────────────────────────────────────────────

// React hooks — available to all subsequent scripts
const { useState, useCallback, useMemo } = React;

// Recharts components — available to all subsequent scripts
const {
  ComposedChart, Area, Line,
  BarChart,  Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} = Recharts;
