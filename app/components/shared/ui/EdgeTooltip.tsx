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
        background: "#1e293bee", backdropFilter: "blur(8px)",
        border: "1px solid #334155", borderRadius: 6, padding: "8px 12px",
        zIndex: 15, pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 10, color: "#94a3b8", display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
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
