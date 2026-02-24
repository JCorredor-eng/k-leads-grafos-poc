"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import type { GraphInputData, GraphVisualConfig } from "@/app/lib/graph/types";
import type { NetworkGraphData, GraphNode, GraphEdge } from "@/app/types/network-graph";
import type { TooltipPosition } from "@/app/components/shared/lib/types";
import { buildSubnetColorMap, getNeighborSubnets, searchNodes } from "@/app/components/shared/lib/helpers";
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
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [mousePos, setMousePos] = useState<TooltipPosition>({ x: 0, y: 0 });
  const [showAlarmsOnly, setShowAlarmsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Derive subnet info from raw data
  const subnetKeys = useMemo(
    () => Object.keys(rawData.metadata.subnet_groups),
    [rawData.metadata.subnet_groups],
  );
  const subnetColors = useMemo(() => buildSubnetColorMap(subnetKeys), [subnetKeys]);
  const [activeSubnets, setActiveSubnets] = useState<Set<string>>(() => new Set(subnetKeys));

  // Node lookup map
  const nodeMap = useMemo(() => {
    const map: Record<string, GraphNode> = {};
    rawData.nodes.forEach((n) => { map[n.gnb_id] = n; });
    return map;
  }, [rawData.nodes]);

  // Edge lookup map (keyed by "source->target")
  const edgeMap = useMemo(() => {
    const map: Record<string, GraphEdge> = {};
    rawData.edges.forEach((e) => { map[`${e.source}->${e.target}`] = e; });
    return map;
  }, [rawData.edges]);

  // Neighbor subnets for selected node
  const neighborSubnets = useMemo(() => {
    if (!selectedNode) return null;
    return getNeighborSubnets(selectedNode.gnb_id, rawData.edges, nodeMap);
  }, [selectedNode, rawData.edges, nodeMap]);

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
    () => searchNodes(rawData.nodes, searchTerm),
    [rawData.nodes, searchTerm],
  );

  // Auto-activate subnets containing matched nodes (driven by callback, not effect)
  const preSearchSubnetsRef = useRef<Set<string> | null>(null);
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    const matched = searchNodes(rawData.nodes, term);
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
  }, [rawData.nodes, nodeMap]);

  // Visible counts (for SubnetFilters display)
  const { visibleNodeCount, visibleEdgeCount } = useMemo(() => {
    let nodes = rawData.nodes.filter((n) => activeSubnets.has(n.ip_subnet_48));
    if (showAlarmsOnly) nodes = nodes.filter((n) => n.has_active_alarms);
    const ids = new Set(nodes.map((n) => n.gnb_id));
    const edges = rawData.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { visibleNodeCount: nodes.length, visibleEdgeCount: edges.length };
  }, [rawData.nodes, rawData.edges, activeSubnets, showAlarmsOnly]);

  // Interaction callbacks
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
  }), [nodeMap, edgeMap]);

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
        visibleNodeCount={visibleNodeCount}
        totalNodeCount={rawData.nodes.length}
        visibleEdgeCount={visibleEdgeCount}
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
