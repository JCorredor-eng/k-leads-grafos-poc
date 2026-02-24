"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import type { NetworkGraphData, GraphNode, GraphEdge } from "@/app/types/network-graph";
import type { TooltipPosition } from "@/app/components/shared/lib/types";
import { buildSubnetColorMap, getNeighborSubnets, searchNodes } from "@/app/components/shared/lib/helpers";
import useResizeObserver from "./hooks/useResizeObserver";
import useForceSimulation from "./hooks/useForceSimulation";
import GraphHeader from "@/app/components/shared/ui/GraphHeader";
import SubnetFilters from "@/app/components/shared/ui/SubnetFilters";
import GraphLegend from "@/app/components/shared/ui/GraphLegend";
import NodeTooltip from "@/app/components/shared/ui/NodeTooltip";
import EdgeTooltip from "@/app/components/shared/ui/EdgeTooltip";
import DetailPanel from "@/app/components/shared/ui/DetailPanel";

export default function NetworkGraph({ data }: { data: NetworkGraphData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [mousePos, setMousePos] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [showAlarmsOnly, setShowAlarmsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dimensions = useResizeObserver(svgRef);

  // Derive subnet info
  const subnetKeys = useMemo(
    () => Object.keys(data.metadata.subnet_groups),
    [data.metadata.subnet_groups],
  );
  const subnetColors = useMemo(() => buildSubnetColorMap(subnetKeys), [subnetKeys]);
  const [activeSubnets, setActiveSubnets] = useState<Set<string>>(() => new Set(subnetKeys));

  // Node lookup map
  const nodeMap = useMemo(() => {
    const map: Record<string, GraphNode> = {};
    data.nodes.forEach((n) => { map[n.gnb_id] = n; });
    return map;
  }, [data.nodes]);

  // Neighbor subnets for selected node
  const neighborSubnets = useMemo(() => {
    if (!selectedNode) return null;
    return getNeighborSubnets(selectedNode.gnb_id, data.edges, nodeMap);
  }, [selectedNode, data.edges, nodeMap]);

  const [isFocusedOnNeighbors, setIsFocusedOnNeighbors] = useState(false);
  const prevSubnetsRef = useRef<Set<string> | null>(null);

  const focusNeighborSubnets = useCallback(() => {
    if (!neighborSubnets) return;
    if (!isFocusedOnNeighbors) {
      prevSubnetsRef.current = activeSubnets;
    }
    setActiveSubnets(new Set(neighborSubnets));
    setIsFocusedOnNeighbors(true);
  }, [neighborSubnets, isFocusedOnNeighbors, activeSubnets]);

  const resetSubnets = useCallback(() => {
    if (prevSubnetsRef.current) {
      setActiveSubnets(prevSubnetsRef.current);
      prevSubnetsRef.current = null;
    }
    setIsFocusedOnNeighbors(false);
  }, []);

  // Auto-update when switching nodes while in focus mode
  useEffect(() => {
    if (isFocusedOnNeighbors && neighborSubnets) {
      setActiveSubnets(new Set(neighborSubnets));
    }
  }, [neighborSubnets, isFocusedOnNeighbors]);

  // Reset focus when node is deselected
  useEffect(() => {
    if (!selectedNode && isFocusedOnNeighbors) {
      resetSubnets();
    }
  }, [selectedNode, isFocusedOnNeighbors, resetSubnets]);

  // Search matched nodes
  const matchedNodeIds = useMemo(
    () => searchNodes(data.nodes, searchTerm),
    [data.nodes, searchTerm],
  );

  // Auto-activate subnets containing matched nodes (driven by callback, not effect)
  const preSearchSubnetsRef = useRef<Set<string> | null>(null);
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    const matched = searchNodes(data.nodes, term);
    if (matched && matched.size > 0) {
      setActiveSubnets((prev) => {
        if (!preSearchSubnetsRef.current) preSearchSubnetsRef.current = prev;
        const matchedSubnets = new Set<string>();
        for (const id of matched) {
          const node = nodeMap[id];
          if (node) matchedSubnets.add(node.ip_subnet_48);
        }
        return matchedSubnets;
      });
    } else if (!matched && preSearchSubnetsRef.current) {
      setActiveSubnets(preSearchSubnetsRef.current);
      preSearchSubnetsRef.current = null;
    }
  }, [data.nodes, nodeMap]);

  // Filtered data
  const { visibleNodes, visibleEdges } = useMemo(() => {
    let filtered = data.nodes.filter((n) => activeSubnets.has(n.ip_subnet_48));
    if (showAlarmsOnly) filtered = filtered.filter((n) => n.has_active_alarms);
    const ids = new Set(filtered.map((n) => n.gnb_id));
    const edges = data.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { visibleNodes: filtered, visibleEdges: edges };
  }, [data.nodes, data.edges, activeSubnets, showAlarmsOnly]);

  // Stable callbacks for D3 simulation
  const callbacks = useMemo(() => ({
    onHoverNode: (node: GraphNode | null) => setHoveredNode(node),
    onHoverEdge: (edge: GraphEdge | null) => setHoveredEdge(edge),
    onClickNode: (node: GraphNode | null) =>
      setSelectedNode((prev) => prev?.gnb_id === node?.gnb_id ? null : node),
    onMouseMove: (pos: TooltipPosition) => setMousePos(pos),
    onBackgroundClick: () => setSelectedNode(null),
  }), []);

  useForceSimulation({
    svgRef,
    visibleNodes,
    visibleEdges,
    dimensions,
    selectedNodeId: selectedNode?.gnb_id ?? null,
    nodeMap,
    subnetColors,
    callbacks,
    matchedNodeIds,
  });

  const toggleSubnet = useCallback((s: string) => {
    setActiveSubnets((prev) => {
      const next = new Set(prev);
      if (next.has(s)) { if (next.size > 1) next.delete(s); } else next.add(s);
      return next;
    });
  }, []);

  return (
    <div
      style={{
        width: "100%", height: "100%", background: "#0a0f1a",
        position: "relative", overflow: "hidden",
        fontFamily: "system-ui,-apple-system,sans-serif",
      }}
    >
      <GraphHeader alarmContext={data.metadata.alarm_context} totalNodes={data.metadata.total_nodes} />

      <SubnetFilters
        subnetKeys={subnetKeys}
        subnetColors={subnetColors}
        activeSubnets={activeSubnets}
        subnetGroups={data.metadata.subnet_groups}
        showAlarmsOnly={showAlarmsOnly}
        visibleNodeCount={visibleNodes.length}
        totalNodeCount={data.nodes.length}
        visibleEdgeCount={visibleEdges.length}
        onToggleSubnet={toggleSubnet}
        onToggleAlarmsOnly={() => setShowAlarmsOnly((p) => !p)}
        neighborSubnets={neighborSubnets}
        isFocusedOnNeighbors={isFocusedOnNeighbors}
        onFocusNeighborSubnets={focusNeighborSubnets}
        onResetSubnets={resetSubnets}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        matchedNodeCount={matchedNodeIds ? matchedNodeIds.size : null}
      />

      <GraphLegend />

      <svg ref={svgRef} width={dimensions.w} height={dimensions.h} style={{ display: "block" }} />

      {hoveredNode && !selectedNode && (
        <NodeTooltip node={hoveredNode} position={mousePos} subnetColors={subnetColors} />
      )}

      {hoveredEdge && (
        <EdgeTooltip edge={hoveredEdge} position={mousePos} nodeMap={nodeMap} subnetColors={subnetColors} />
      )}

      <DetailPanel
        node={selectedNode}
        subnetColors={subnetColors}
        onClose={() => setSelectedNode(null)}
        neighborSubnets={neighborSubnets}
        onFocusNeighborSubnets={focusNeighborSubnets}
      />
    </div>
  );
}
