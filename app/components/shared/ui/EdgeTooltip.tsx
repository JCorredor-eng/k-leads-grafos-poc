import type { GraphEdge, GraphNode } from "@/app/types/network-graph";
import type { TooltipPosition } from "../lib/types";

interface EdgeTooltipProps {
  edge: GraphEdge;
  position: TooltipPosition;
  nodeMap: Record<string, GraphNode>;
  subnetColors: Record<string, string>;
}

export default function EdgeTooltip({ edge, position, nodeMap, subnetColors }: EdgeTooltipProps) {
  return (
    <div
      style={{
        position: "absolute", left: position.x + 14, top: position.y - 10,
        background: "var(--surface-glass)", backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        border: "1px solid var(--border-strong)", borderRadius: 8, padding: "8px 12px",
        zIndex: 15, pointerEvents: "none",
        boxShadow: "var(--panel-shadow)",
      }}
    >
      <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {nodeMap[edge.source]?.ne_name || edge.source} &rarr; {nodeMap[edge.target]?.ne_name || edge.target}
        </span>
        <span>Cell relations: {edge.weight}</span>
        <span>
          Transport:{" "}
          <span style={{ color: subnetColors[edge.transport.ip_subnet_48] }}>
            {edge.transport.ip_subnet_48}
          </span>
        </span>
        <span>
          Config: {edge.has_radio_config ? "Radio \u2713" : "Radio \u2717"} &middot;{" "}
          {edge.has_transport_config ? "Transport \u2713" : "Transport \u2717"}
        </span>
      </div>
    </div>
  );
}
