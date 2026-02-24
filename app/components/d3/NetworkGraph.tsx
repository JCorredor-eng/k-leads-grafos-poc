"use client";

import { useRef, useMemo } from "react";
import type { NetworkGraphData, GraphNode, GraphEdge } from "@/app/types/network-graph";
import type { TooltipPosition } from "@/app/components/shared/lib/types";
import useGraphInteraction from "@/app/components/shared/hooks/useGraphInteraction";
import useGraphLookups from "@/app/components/shared/hooks/useGraphLookups";
import useGraphFilters from "@/app/components/shared/hooks/useGraphFilters";
import useResizeObserver from "./hooks/useResizeObserver";
import useForceSimulation from "./hooks/useForceSimulation";
import GraphHeader from "@/app/components/shared/ui/GraphHeader";
import SubnetFilters from "@/app/components/shared/ui/SubnetFilters";
import GraphLegend from "@/app/components/shared/ui/GraphLegend";
import NodeTooltip from "@/app/components/shared/ui/NodeTooltip";
import EdgeTooltip from "@/app/components/shared/ui/EdgeTooltip";
import DetailPanel from "@/app/components/shared/ui/DetailPanel";

export default function NetworkGraph({ data, datasetLabel }: { data: NetworkGraphData; datasetLabel: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useResizeObserver(svgRef);

  const { selectedNode, setSelectedNode, hoveredNode, setHoveredNode, hoveredEdge, setHoveredEdge, mousePos, setMousePos } = useGraphInteraction();
  const { nodeMap } = useGraphLookups(data.nodes, data.edges);
  const {
    activeSubnets, subnetKeys, subnetColors, toggleSubnet,
    showAlarmsOnly, toggleAlarmsOnly,
    neighborSubnets, isFocusedOnNeighbors, focusNeighborSubnets, resetSubnets,
    searchTerm, matchedNodeIds, handleSearchChange,
    visibleNodes, visibleEdges,
  } = useGraphFilters({
    nodes: data.nodes,
    edges: data.edges,
    subnetGroups: data.metadata.subnet_groups,
    nodeMap,
    selectedNode,
  });

  // Stable callbacks for D3 simulation
  const callbacks = useMemo(() => ({
    onHoverNode: (node: GraphNode | null) => setHoveredNode(node),
    onHoverEdge: (edge: GraphEdge | null) => setHoveredEdge(edge),
    onClickNode: (node: GraphNode | null) =>
      setSelectedNode((prev) => prev?.gnb_id === node?.gnb_id ? null : node),
    onMouseMove: (pos: TooltipPosition) => setMousePos(pos),
    onBackgroundClick: () => setSelectedNode(null),
  }), [setHoveredNode, setHoveredEdge, setSelectedNode, setMousePos]);

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

  return (
    <div
      style={{
        width: "100%", height: "100%", background: "var(--canvas-bg)",
        position: "relative", overflow: "hidden",
        fontFamily: "var(--font-sora, 'Sora', sans-serif)",
      }}
    >
      <GraphHeader alarmContext={data.metadata.alarm_context} totalNodes={data.metadata.total_nodes} datasetLabel={datasetLabel} />

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
        onToggleAlarmsOnly={toggleAlarmsOnly}
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
