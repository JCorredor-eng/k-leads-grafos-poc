import type { GraphNode } from "@/app/types/network-graph";
import type { TooltipPosition } from "../lib/types";
import { SEVERITY_COLORS } from "../lib/constants";

interface NodeTooltipProps {
  node: GraphNode;
  position: TooltipPosition;
  subnetColors: Record<string, string>;
}

export default function NodeTooltip({ node, position, subnetColors }: NodeTooltipProps) {
  return (
    <div
      style={{
        position: "absolute", left: position.x + 14, top: position.y - 10,
        background: "var(--surface-glass)", backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid var(--border-strong)", borderRadius: 8, padding: "8px 12px",
        zIndex: 15, pointerEvents: "none", maxWidth: 240,
        boxShadow: "var(--panel-shadow)",
      }}
    >
      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 12, marginBottom: 3 }}>
        {node.ne_name || node.gnb_id}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 2 }}>
        <span>
          Subnet: <span style={{ color: subnetColors[node.ip_subnet_48] }}>{node.ip_subnet_48}</span>
        </span>
        <span>Cells: {node.n_cells} &middot; TAC: {node.tracking_area_codes?.join(",")}</span>
        {node.has_active_alarms && (
          <span style={{ color: SEVERITY_COLORS[node.alarms?.[0]?.severity] }}>
            {node.alarms?.[0]?.severity}: {node.alarms?.[0]?.probable_cause}
          </span>
        )}
        <span style={{ color: "var(--text-faint)", fontSize: 9, marginTop: 2 }}>Click for details</span>
      </div>
    </div>
  );
}
