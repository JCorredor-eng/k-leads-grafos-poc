import { useMemo } from "react";
import type { GraphNode, GraphEdge } from "@/app/types/network-graph";

export default function useGraphLookups(nodes: GraphNode[], edges: GraphEdge[]) {
  const nodeMap = useMemo(() => {
    const map: Record<string, GraphNode> = {};
    nodes.forEach((n) => { map[n.gnb_id] = n; });
    return map;
  }, [nodes]);

  const edgeMap = useMemo(() => {
    const map: Record<string, GraphEdge> = {};
    edges.forEach((e) => { map[`${e.source}->${e.target}`] = e; });
    return map;
  }, [edges]);

  return { nodeMap, edgeMap };
}
