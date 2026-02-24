import type { GraphNode } from "@/app/types/network-graph";
import { SEVERITY_COLORS } from "../lib/constants";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "#475569", marginBottom: 6,
          paddingBottom: 4, borderBottom: "1px solid #1e293b",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #1e293b08" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span
        style={{
          color: "#e2e8f0", fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit",
          textAlign: "right", maxWidth: 200, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

interface DetailPanelProps {
  node: GraphNode | null;
  subnetColors: Record<string, string>;
  onClose: () => void;
  neighborSubnets?: Set<string> | null;
  onFocusNeighborSubnets?: () => void;
}

export default function DetailPanel({ node, subnetColors, onClose, neighborSubnets, onFocusNeighborSubnets }: DetailPanelProps) {
  if (!node) return null;
  const subColor = subnetColors[node.ip_subnet_48] || "#888";

  return (
    <div
      style={{
        position: "absolute", top: 0, right: 0, width: 340, height: "100%",
        background: "#0f172a", borderLeft: "2px solid #1e293b", overflowY: "auto",
        zIndex: 20, fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
        color: "#cbd5e1", padding: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 14px", background: "#1e293b", borderBottom: "1px solid #334155",
          position: "sticky", top: 0, zIndex: 2,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>
          {node.ne_name || node.gnb_id}
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
        >
          &#x2715;
        </button>
      </div>

      <div style={{ padding: "10px 14px" }}>
        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span
            style={{
              padding: "2px 8px", borderRadius: 4,
              background: subColor + "22", color: subColor,
              border: `1px solid ${subColor}44`, fontSize: 11,
            }}
          >
            {node.ip_subnet_48}
          </span>
          <span
            style={{
              padding: "2px 8px", borderRadius: 4,
              background: node.role === "source" ? "#ec489922" : "#33415522",
              color: node.role === "source" ? "#EC4899" : "#94a3b8",
              border: "1px solid " + (node.role === "source" ? "#ec489944" : "#33415566"),
              fontSize: 11,
            }}
          >
            {node.role}
          </span>
          {node.tracking_area_codes?.map((t) => (
            <span
              key={t}
              style={{
                padding: "2px 8px", borderRadius: 4,
                background: "#1e293b", border: "1px solid #334155", fontSize: 11,
              }}
            >
              TAC {t}
            </span>
          ))}
        </div>

        <Section title="Identity">
          <Row label="gNB ID" value={node.gnb_id} />
          <Row label="Cells" value={String(node.n_cells)} />
          <Row label="PCIs" value={node.physical_cell_ids?.join(", ") || ""} />
          <Row label="IP" value={node.ip_address} mono />
          {node.xn_created_by && (
            <Row label="XN Origin" value={node.xn_created_by.replace("created-by-", "")} />
          )}
        </Section>

        {neighborSubnets && neighborSubnets.size > 0 && (
          <Section title={`Connected Subnets (${neighborSubnets.size})`}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {Array.from(neighborSubnets).map((subnet) => {
                const c = subnetColors[subnet] || "#888";
                return (
                  <span
                    key={subnet}
                    style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 11,
                      background: c + "22", color: c,
                      border: `1px solid ${c}44`,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {subnet}
                  </span>
                );
              })}
            </div>
            {onFocusNeighborSubnets && (
              <button
                onClick={onFocusNeighborSubnets}
                style={{
                  width: "100%", padding: "5px 10px", borderRadius: 4,
                  background: "#1e40af22", border: "1px solid #3b82f644",
                  color: "#93c5fd", fontSize: 11, cursor: "pointer",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                Focus on these subnets
              </button>
            )}
          </Section>
        )}

        {node.role === "source" && (
          <Section title="Source Details">
            <Row label="Type" value={node.node_type || ""} />
            <Row label="SW" value={node.sw_version || ""} />
            <Row label="State" value={`${node.connection_state} / ${node.operational_state}`} />
            <Row label="Admin" value={node.administrative_state || ""} />
          </Section>
        )}

        {node.alarms.length > 0 && (
          <Section title={`Alarms (${node.alarms.length})`}>
            {node.alarms.map((a, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 8px", marginBottom: 4, borderRadius: 4,
                  background: a.severity === "Critical" ? "#dc262618" : "#f9731618",
                  borderLeft: `3px solid ${SEVERITY_COLORS[a.severity] || "#64748b"}`,
                }}
              >
                <div style={{ color: SEVERITY_COLORS[a.severity] || "#64748b", fontWeight: 600, fontSize: 11 }}>
                  {a.severity} &mdash; {a.probable_cause}
                </div>
                <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>
                  {a.alarm_code} &middot; {a.alarm_time}
                </div>
              </div>
            ))}
          </Section>
        )}

        {node.cells.length > 0 && (
          <Section title={`Cells (${node.cells.length})`}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {node.cells.map((c, i) => (
                <div
                  key={i}
                  style={{
                    padding: "5px 7px", borderRadius: 4,
                    background: "#1e293b", border: "1px solid #334155", fontSize: 10,
                  }}
                >
                  <div style={{ color: "#e2e8f0", fontWeight: 600 }}>Cell {c.cell_identity}</div>
                  <div style={{ color: "#64748b" }}>PCI {c.nr_physical_cell_id}</div>
                  <div style={{ color: "#64748b" }}>Band {c.nr_frequency_band}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {node.hardware && node.hardware.length > 0 && (
          <Section title="Hardware">
            {node.hardware.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: "5px 7px", borderRadius: 4,
                  background: "#1e293b", border: "1px solid #334155",
                  fontSize: 10, marginBottom: 4,
                }}
              >
                <div style={{ color: "#e2e8f0", fontWeight: 600 }}>{h.unit_type}: {h.hw_name}</div>
                <div style={{ color: "#64748b" }}>S/N: {h.serial_number}</div>
              </div>
            ))}
          </Section>
        )}

        {node.software && node.software.length > 0 && (
          <Section title="Software">
            {node.software.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "5px 7px", borderRadius: 4,
                  background: "#1e293b", border: "1px solid #334155",
                  fontSize: 10, marginBottom: 4,
                }}
              >
                <div style={{ color: s.sw_status === "ACTIVATED" ? "#10B981" : "#64748b", fontWeight: 600 }}>
                  {s.sw_id}
                </div>
                <div style={{ color: "#94a3b8" }}>{s.sw_name} v{s.sw_version}</div>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
