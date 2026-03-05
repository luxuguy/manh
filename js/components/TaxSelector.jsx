// ─────────────────────────────────────────────────────────────
// components/TaxSelector.jsx — Country tax selector + gross-up display
//
// Props:
//   netAnnWd       — desired net after-tax withdrawal ($)
//   taxCountryId   — selected country ID string
//   onCountryChange — callback(newId)
//   grossAnnWd     — computed gross (from grossFromNet)
//   effectiveRate  — effective tax rate as a percentage (0–100)
// ─────────────────────────────────────────────────────────────

function TaxSelector({ netAnnWd, taxCountryId, onCountryChange, grossAnnWd, effectiveRate }) {
  const country = TAX_COUNTRIES.find(c => c.id === taxCountryId) || TAX_COUNTRIES[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Country dropdown */}
      <div>
        <Label>Tax Country / Jurisdiction</Label>
        <SelectField value={taxCountryId} onChange={e => onCountryChange(e.target.value)}>
          {TAX_COUNTRIES.map(c => (
            <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
          ))}
        </SelectField>
        {country.note && (
          <div style={{ fontSize: 9, color: C.dim, marginTop: 3, lineHeight: 1.5, fontStyle: "italic" }}>
            {country.note}
          </div>
        )}
      </div>

      {/* Gross-up summary box */}
      <div style={{
        background: "#060f1e",
        border: `1px solid ${C.faint}`,
        borderLeft: `3px solid ${C.green}`,
        borderRadius: "0 8px 8px 0",
        padding: "10px 12px",
      }}>
        {/* Gross headline */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Gross Before Tax
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.green, fontFamily: "JetBrains Mono, monospace" }}>
            {fmt$(grossAnnWd)}
          </span>
        </div>

        {/* Detail rows */}
        {[
          ["Net after tax",    fmt$(netAnnWd),               C.text  ],
          ["Est. annual tax",  fmt$(grossAnnWd - netAnnWd),  C.red   ],
          ["Effective rate",   `${effectiveRate.toFixed(1)}%`, C.accent],
        ].map(([l, v, c]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
            <span style={{ color: C.dim }}>{l}</span>
            <span style={{ color: c, fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>{v}</span>
          </div>
        ))}

        {/* Tax rate bar */}
        <div style={{ marginTop: 6, height: 4, background: C.faint, borderRadius: 2 }}>
          <div style={{
            height: "100%", borderRadius: 2, background: C.red,
            width: `${Math.min(100, effectiveRate)}%`,
            transition: "width 0.4s ease",
          }} />
        </div>

        <div style={{ fontSize: 9, color: "#334155", marginTop: 5, lineHeight: 1.5 }}>
          ⚠ Approximate {country.flag} national/federal tax only. State/provincial/local taxes not included. Consult a tax professional.
        </div>
      </div>
    </div>
  );
}
