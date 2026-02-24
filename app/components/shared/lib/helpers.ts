import type { GraphNode, GraphEdge } from "@/app/types/network-graph";
import { SUBNET_PALETTE } from "./constants";

export function buildSubnetColorMap(subnets: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  subnets.forEach((s, i) => {
    map[s] = SUBNET_PALETTE[i % SUBNET_PALETTE.length];
  });
  return map;
}

export function subnetLabel(subnet: string): string {
  const parts = subnet.split(":");
  const last = parts[parts.length - 1];
  return `:${last.length === 1 ? "0" + last : last}`;
}

export function formatAlarmWindow(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const month = s.toLocaleString("en", { month: "short" });
  const day = s.getDate();
  const year = s.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  const startTime = `${pad(s.getUTCHours())}:${pad(s.getUTCMinutes())}`;
  const endTime = `${pad(e.getUTCHours())}:${pad(e.getUTCMinutes())}`;
  return `${month} ${day} ${year} ${startTime}\u2013${endTime} UTC`;
}

export function searchNodes(
  nodes: GraphNode[],
  query: string,
): Set<string> | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const matched = new Set<string>();
  for (const n of nodes) {
    const name = (n.ne_name ?? "").toLowerCase();
    const id = n.gnb_id.toLowerCase();
    if (name.includes(lower) || id.includes(lower)) {
      matched.add(n.gnb_id);
    }
  }
  return matched;
}

export function getNeighborSubnets(
  nodeId: string,
  edges: GraphEdge[],
  nodeMap: Record<string, GraphNode>,
): Set<string> {
  const subnets = new Set<string>();
  const self = nodeMap[nodeId];
  if (self) subnets.add(self.ip_subnet_48);
  for (const edge of edges) {
    let neighborId: string | null = null;
    if (edge.source === nodeId) neighborId = edge.target;
    else if (edge.target === nodeId) neighborId = edge.source;
    if (neighborId) {
      const neighbor = nodeMap[neighborId];
      if (neighbor) subnets.add(neighbor.ip_subnet_48);
    }
  }
  return subnets;
}
