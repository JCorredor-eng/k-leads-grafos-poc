export default function GraphLegend() {
  return (
    <div
      style={{
        position: "absolute", bottom: 12, left: 16, zIndex: 10,
        background: "#0f172acc", backdropFilter: "blur(8px)",
        borderRadius: 8, border: "1px solid #1e293b",
        padding: "8px 12px", display: "flex", gap: 16, alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #f1f5f9", background: "#EC4899", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fbbf24" }}>{"\u2605"}</div>
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Source</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#3B82F6" }} />
        <span style={{ fontSize: 10, color: "#94a3b8" }}>4 cells</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#3B82F6" }} />
        <span style={{ fontSize: 10, color: "#94a3b8" }}>2 cells</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid #DC2626" }} />
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Critical</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px dashed #F97316" }} />
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Major</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 16, height: 0, borderTop: "2px solid #64748b" }} />
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Full config</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 16, height: 0, borderTop: "2px dashed #64748b" }} />
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Partial</span>
      </div>
    </div>
  );
}
