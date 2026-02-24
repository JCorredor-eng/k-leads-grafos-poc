import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { GraphNode, GraphEdge } from "@/app/types/network-graph";
import { buildSubnetColorMap, getNeighborSubnets, searchNodes } from "@/app/components/shared/lib/helpers";

interface UseGraphFiltersInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  subnetGroups: Record<string, string[]>;
  nodeMap: Record<string, GraphNode>;
  selectedNode: GraphNode | null;
}

export default function useGraphFilters({
  nodes,
  edges,
  subnetGroups,
  nodeMap,
  selectedNode,
}: UseGraphFiltersInput) {
  // Subnet keys & colors
  const subnetKeys = useMemo(() => Object.keys(subnetGroups), [subnetGroups]);
  const subnetColors = useMemo(() => buildSubnetColorMap(subnetKeys), [subnetKeys]);
  const [activeSubnets, setActiveSubnets] = useState<Set<string>>(() => new Set(subnetKeys));

  // Neighbor subnets for selected node
  const neighborSubnets = useMemo(() => {
    if (!selectedNode) return null;
    return getNeighborSubnets(selectedNode.gnb_id, edges, nodeMap);
  }, [selectedNode, edges, nodeMap]);

  // Focus on neighbor subnets
  const [isFocusedOnNeighbors, setIsFocusedOnNeighbors] = useState(false);
  const prevSubnetsRef = useRef<Set<string> | null>(null);

  const focusNeighborSubnets = useCallback(() => {
    if (!neighborSubnets) return;
    if (!isFocusedOnNeighbors) {
      prevSubnetsRef.current = activeSubnets;
    }
    setIsFocusedOnNeighbors(true);
  }, [neighborSubnets, isFocusedOnNeighbors, activeSubnets]);

  const resetSubnets = useCallback(() => {
    if (prevSubnetsRef.current) {
      setActiveSubnets(prevSubnetsRef.current);
      prevSubnetsRef.current = null;
    }
    setIsFocusedOnNeighbors(false);
  }, []);

  // Reset focus when node is deselected
  useEffect(() => {
    if (!selectedNode && isFocusedOnNeighbors) {
      resetSubnets();
    }
  }, [selectedNode, isFocusedOnNeighbors, resetSubnets]);

  // When focused on neighbors, derive active subnets from neighborSubnets
  // instead of syncing via effect
  const effectiveActiveSubnets = useMemo(() => {
    if (isFocusedOnNeighbors && neighborSubnets) {
      return new Set(neighborSubnets);
    }
    return activeSubnets;
  }, [isFocusedOnNeighbors, neighborSubnets, activeSubnets]);

  // Alarms filter
  const [showAlarmsOnly, setShowAlarmsOnly] = useState(false);
  const toggleAlarmsOnly = useCallback(() => setShowAlarmsOnly((p) => !p), []);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const matchedNodeIds = useMemo(
    () => searchNodes(nodes, searchTerm),
    [nodes, searchTerm],
  );

  const preSearchSubnetsRef = useRef<Set<string> | null>(null);
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    const matched = searchNodes(nodes, term);
    if (matched && matched.size > 0) {
      setActiveSubnets((prev) => {
        if (!preSearchSubnetsRef.current) preSearchSubnetsRef.current = prev;
        const matchedSubnets = new Set<string>();
        for (const id of matched) {
          const node = nodeMap[id];
          if (node) matchedSubnets.add(node.ip_subnet_48);
        }
        for (const edge of edges) {
          if (matched.has(edge.source) || matched.has(edge.target)) {
            const src = nodeMap[edge.source];
            const tgt = nodeMap[edge.target];
            if (src) matchedSubnets.add(src.ip_subnet_48);
            if (tgt) matchedSubnets.add(tgt.ip_subnet_48);
          }
        }
        return matchedSubnets;
      });
    } else if (!matched && preSearchSubnetsRef.current) {
      setActiveSubnets(preSearchSubnetsRef.current);
      preSearchSubnetsRef.current = null;
    }
  }, [nodes, edges, nodeMap]);

  // Toggle individual subnet
  const toggleSubnet = useCallback((s: string) => {
    setActiveSubnets((prev) => {
      const next = new Set(prev);
      if (next.has(s)) { if (next.size > 1) next.delete(s); } else next.add(s);
      return next;
    });
  }, []);

  // Visible data (uses effectiveActiveSubnets)
  const { visibleNodes, visibleEdges } = useMemo(() => {
    let filtered = nodes.filter((n) => effectiveActiveSubnets.has(n.ip_subnet_48));
    if (showAlarmsOnly) filtered = filtered.filter((n) => n.has_active_alarms);
    const ids = new Set(filtered.map((n) => n.gnb_id));
    const visEdges = edges.filter((e) => ids.has(e.source) && ids.has(e.target));
    return { visibleNodes: filtered, visibleEdges: visEdges };
  }, [nodes, edges, effectiveActiveSubnets, showAlarmsOnly]);

  return {
    activeSubnets: effectiveActiveSubnets,
    subnetKeys,
    subnetColors,
    toggleSubnet,
    showAlarmsOnly,
    toggleAlarmsOnly,
    neighborSubnets,
    isFocusedOnNeighbors,
    focusNeighborSubnets,
    resetSubnets,
    searchTerm,
    matchedNodeIds,
    handleSearchChange,
    visibleNodes,
    visibleEdges,
  };
}
