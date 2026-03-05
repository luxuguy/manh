// ─────────────────────────────────────────────────────────────
// components/ui.jsx — Reusable primitive UI components
//
// All components use inline styles with tokens from C (tokens.js).
// To change styling globally, update tokens.js instead.
// ─────────────────────────────────────────────────────────────

// ── Form Labels ──────────────────────────────────────────────
function Label({ children, sub }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
        {children}
      </div>
      {sub && <div style={{ fontSize: 10, color: C.dim, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

// ── Text / Number Input ───────────────────────────────────────
function InputField({ style, ...rest }) {
  return (
    <input
      {...rest}
      style={{
        background: C.input, border: `1px solid ${C.border}`, borderRadius: 7,
        padding: "7px 11px", color: C.text, fontSize: 13, width: "100%",
        fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
        ...style,
      }}
    />
  );
}

// ── Select / Dropdown ─────────────────────────────────────────
function SelectField({ children, style, ...rest }) {
  return (
    <select
      {...rest}
      style={{
        background: C.input, border: `1px solid ${C.border}`, borderRadius: 7,
        padding: "7px 11px", color: C.text, fontSize: 13, width: "100%",
        fontFamily: "inherit", outline: "none",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

// ── Range Slider ─────────────────────────────────────────────
function SliderInput({ color = C.accent, ...rest }) {
  return (
    <input
      type="range"
      {...rest}
      style={{ width: "100%", accentColor: color, cursor: "pointer" }}
    />
  );
}

// ── Button ────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, variant = "primary", size = "md" }) {
  const bg =
    variant === "primary" ? "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)" :
    variant === "ghost"   ? "transparent" :
    C.faint;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        border: variant === "ghost" ? `1px solid ${C.border}` : "none",
        borderRadius: 8,
        padding: size === "sm" ? "6px 10px" : "10px 16px",
        color: variant === "primary" ? "#000" : C.muted,
        fontFamily: "inherit", fontWeight: 600,
        fontSize: size === "sm" ? 11 : 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        width: "100%",
      }}
    >
      {children}
    </button>
  );
}

// ── Card Surface ──────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`,
      borderRadius: 12, padding: "18px 20px", ...style,
    }}>
      {children}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────
function SecHeader({ icon, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, fontSize: 11,
      fontWeight: 700, color: "#cbd5e1", marginBottom: 14, paddingBottom: 10,
      borderBottom: `1px solid ${C.faint}`, textTransform: "uppercase",
      letterSpacing: "0.06em",
    }}>
      <span>{icon}</span>{children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, color = C.text, accent = false }) {
  return (
    <div style={{
      background: accent ? "linear-gradient(135deg,#0d1e35 0%,#0b1628 100%)" : C.card,
      border: `1px solid ${accent ? C.border : C.cardBorder}`,
      borderRadius: 11, padding: "14px 16px",
      boxShadow: accent ? "0 0 20px rgba(245,158,11,0.08)" : "none",
    }}>
      <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace", letterSpacing: "-0.01em" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Pill Tag ──────────────────────────────────────────────────
function Tag({ children, color = C.muted }) {
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}40`, color,
      borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 600,
    }}>
      {children}
    </span>
  );
}
