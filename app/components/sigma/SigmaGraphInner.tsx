"use client";

import { useMemo } from "react";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import type { GraphInputData, GraphVisualConfig } from "@/app/lib/graph/types";
import type { NetworkGraphData } from "@/app/types/network-graph";
import type { TooltipPosition } from "@/app/components/shared/lib/types";
import useGraphInteraction from "@/app/components/shared/hooks/useGraphInteraction";
import useGraphLookups from "@/app/components/shared/hooks/useGraphLookups";
import useGraphFilters from "@/app/components/shared/hooks/useGraphFilters";
import { SIGMA_SETTINGS } from "./lib/constants";
import GraphLoader from "./hooks/GraphLoader";
import ForceAtlasLayout from "./hooks/ForceAtlasLayout";
import GraphInteractions from "./hooks/GraphInteractions";
import GraphControls from "./ui/GraphControls";
import GraphHeader from "@/app/components/shared/ui/GraphHeader";
import SubnetFilters from "@/app/components/shared/ui/SubnetFilters";
import GraphLegend from "@/app/components/shared/ui/GraphLegend";
import NodeTooltip from "@/app/components/shared/ui/NodeTooltip";
import EdgeTooltip from "@/app/components/shared/ui/EdgeTooltip";
import DetailPanel from "@/app/components/shared/ui/DetailPanel";

interface SigmaGraphInnerProps {
  data: GraphInputData;
  config: GraphVisualConfig;
  rawData: NetworkGraphData;
}

export default function SigmaGraphInner({
  data,
  config,
  rawData,
}: SigmaGraphInnerProps) {
  const { selectedNode, setSelectedNode, hoveredNode, setHoveredNode, hoveredEdge, setHoveredEdge, mousePos, setMousePos } = useGraphInteraction();
  const { nodeMap, edgeMap } = useGraphLookups(rawData.nodes, rawData.edges);
  const {
    activeSubnets, subnetKeys, subnetColors, toggleSubnet,
    showAlarmsOnly, toggleAlarmsOnly,
    neighborSubnets, isFocusedOnNeighbors, focusNeighborSubnets, resetSubnets,
    searchTerm, matchedNodeIds, handleSearchChange,
    visibleNodes, visibleEdges,
  } = useGraphFilters({
    nodes: rawData.nodes,
    edges: rawData.edges,
    subnetGroups: rawData.metadata.subnet_groups,
    nodeMap,
    selectedNode,
  });

  // Interaction callbacks (convert Sigma string IDs → GraphNode/GraphEdge)
  const callbacks = useMemo(() => ({
    onHoverNode: (nodeId: string | null) => {
      setHoveredNode(nodeId ? nodeMap[nodeId] ?? null : null);
    },
    onHoverEdge: (edgeKey: string | null) => {
      setHoveredEdge(edgeKey ? edgeMap[edgeKey] ?? null : null);
    },
    onClickNode: (nodeId: string) => {
      setSelectedNode((prev) => prev?.gnb_id === nodeId ? null : nodeMap[nodeId] ?? null);
    },
    onMouseMove: (pos: TooltipPosition) => setMousePos(pos),
    onClickStage: () => setSelectedNode(null),
  }), [nodeMap, edgeMap, setHoveredNode, setHoveredEdge, setSelectedNode, setMousePos]);

  return (
    <div
      style={{
        width: "100%", height: "100%", background: "#0a0f1a",
        position: "relative", overflow: "hidden",
        fontFamily: "system-ui,-apple-system,sans-serif",
      }}
    >
      <SigmaContainer
        style={{ height: "100%", width: "100%", background: "#09090b" }}
        settings={{
          ...SIGMA_SETTINGS,
          renderEdgeLabels: config.labels.showEdgeLabels ?? false,
        }}
      >
        <GraphLoader data={data} config={config} />
        {config.layout.type === "forceatlas2" && (
          <ForceAtlasLayout config={config.layout} />
        )}
        <GraphInteractions
          callbacks={callbacks}
          activeSubnets={activeSubnets}
          showAlarmsOnly={showAlarmsOnly}
          nodeMap={nodeMap}
          matchedNodeIds={matchedNodeIds}
        />
        <GraphControls />
      </SigmaContainer>

      <GraphHeader
        alarmContext={rawData.metadata.alarm_context}
        totalNodes={rawData.metadata.total_nodes}
      />

      <SubnetFilters
        subnetKeys={subnetKeys}
        subnetColors={subnetColors}
        activeSubnets={activeSubnets}
        subnetGroups={rawData.metadata.subnet_groups}
        showAlarmsOnly={showAlarmsOnly}
        visibleNodeCount={visibleNodes.length}
        totalNodeCount={rawData.nodes.length}
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
