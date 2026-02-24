import { useState } from "react";
import type { GraphNode, GraphEdge } from "@/app/types/network-graph";
import type { TooltipPosition } from "@/app/components/shared/lib/types";

export default function useGraphInteraction() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [mousePos, setMousePos] = useState<TooltipPosition>({ x: 0, y: 0 });

  return {
    selectedNode, setSelectedNode,
    hoveredNode, setHoveredNode,
    hoveredEdge, setHoveredEdge,
    mousePos, setMousePos,
  };
}
