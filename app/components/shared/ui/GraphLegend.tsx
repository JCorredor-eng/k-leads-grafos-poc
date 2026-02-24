export default function GraphLegend() {
  return (
    <div
      style={{
        position: "absolute", bottom: 12, left: 16, zIndex: 10,
        background: "var(--surface-glass)", backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderRadius: 10, border: "1px solid var(--border)",
        padding: "8px 12px", display: "flex", gap: 16, alignItems: "center",
        boxShadow: "var(--panel-shadow)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--text-primary)", background: "#EC4899", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fbbf24" }}>{"\u2605"}</div>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Source</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#3B82F6" }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>4 cells</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3B82F6" }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>2 cells</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid #DC2626" }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Critical</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px dashed #F97316" }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Major</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 16, height: 0, borderTop: "2px solid var(--text-faint)" }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Full config</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 16, height: 0, borderTop: "2px dashed var(--text-faint)" }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Partial</span>
      </div>
    </div>
  );
}
