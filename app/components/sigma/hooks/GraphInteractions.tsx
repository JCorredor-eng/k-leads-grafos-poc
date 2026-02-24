"use client";

import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect, useRef, useCallback } from "react";
import type { GraphNode } from "@/app/types/network-graph";
import type { TooltipPosition } from "@/app/components/shared/lib/types";
import { DIMMED_NODE_COLOR } from "../lib/constants";
import { SEARCH_HIGHLIGHT_COLOR } from "@/app/components/shared/lib/constants";

export interface InteractionCallbacks {
  onHoverNode: (nodeId: string | null) => void;
  onHoverEdge: (edgeKey: string | null) => void;
  onClickNode: (nodeId: string) => void;
  onMouseMove: (pos: TooltipPosition) => void;
  onClickStage: () => void;
}

interface GraphInteractionsProps {
  callbacks: InteractionCallbacks;
  activeSubnets: Set<string>;
  showAlarmsOnly: boolean;
  nodeMap: Record<string, GraphNode>;
  matchedNodeIds: Set<string> | null;
}

export default function GraphInteractions({
  callbacks,
  activeSubnets,
  showAlarmsOnly,
  nodeMap,
  matchedNodeIds,
}: GraphInteractionsProps) {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();

  // Drag state
  const isDraggingRef = useRef(false);
  const draggedNodeRef = useRef<string | null>(null);

  // Hover state for reducers
  const hoveredNodeRef = useRef<string | null>(null);

  // Keep latest values in refs to avoid stale closures
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const activeSubnetsRef = useRef(activeSubnets);
  activeSubnetsRef.current = activeSubnets;
  const showAlarmsOnlyRef = useRef(showAlarmsOnly);
  showAlarmsOnlyRef.current = showAlarmsOnly;
  const nodeMapRef = useRef(nodeMap);
  nodeMapRef.current = nodeMap;
  const matchedNodeIdsRef = useRef(matchedNodeIds);
  matchedNodeIdsRef.current = matchedNodeIds;

  // ── Reducers ──────────────────────────────────────────────
  const updateReducers = useCallback(() => {
    const graph = sigma.getGraph();
    if (graph.order === 0) return;

    const hovered = hoveredNodeRef.current;
    const subs = activeSubnetsRef.current;
    const alarmsOnly = showAlarmsOnlyRef.current;
    const nm = nodeMapRef.current;
    const matched = matchedNodeIdsRef.current;

    // Pre-compute hidden node set
    const hiddenNodes = new Set<string>();
    graph.forEachNode((nodeId) => {
      const raw = nm[nodeId];
      if (!raw) return;
      if (!subs.has(raw.ip_subnet_48)) {
        hiddenNodes.add(nodeId);
      } else if (alarmsOnly && !raw.has_active_alarms) {
        hiddenNodes.add(nodeId);
      }
    });

    // Neighbors of hovered node
    let neighbors: Set<string> | null = null;
    if (hovered && graph.hasNode(hovered)) {
      neighbors = new Set(graph.neighbors(hovered));
      neighbors.add(hovered);
    }

    sigma.setSetting("nodeReducer", (nodeId, data) => {
      if (hiddenNodes.has(nodeId)) {
        return { ...data, hidden: true };
      }
      if (matched && matched.size > 0) {
        if (matched.has(nodeId)) {
          return { ...data, highlighted: true, borderColor: SEARCH_HIGHLIGHT_COLOR, forceLabel: true, zIndex: 10 };
        }
        return { ...data, color: DIMMED_NODE_COLOR, borderColor: DIMMED_NODE_COLOR, label: "" };
      }
      if (neighbors && !neighbors.has(nodeId)) {
        return { ...data, color: DIMMED_NODE_COLOR, borderColor: DIMMED_NODE_COLOR, label: "" };
      }
      return { ...data };
    });

    sigma.setSetting("edgeReducer", (edge, data) => {
      const [source, target] = graph.extremities(edge);
      if (hiddenNodes.has(source) || hiddenNodes.has(target)) {
        return { ...data, hidden: true };
      }
      if (matched && matched.size > 0 && !matched.has(source) && !matched.has(target)) {
        return { ...data, hidden: true };
      }
      if (hovered && source !== hovered && target !== hovered) {
        return { ...data, hidden: true };
      }
      return { ...data };
    });

    sigma.refresh({ skipIndexation: true });
  }, [sigma]);

  // Re-apply reducers when filters change
  useEffect(() => {
    updateReducers();
  }, [activeSubnets, showAlarmsOnly, matchedNodeIds, updateReducers]);

  // ── Events ────────────────────────────────────────────────
  useEffect(() => {
    registerEvents({
      // ── Drag ──
      downNode: (e) => {
        isDraggingRef.current = true;
        draggedNodeRef.current = e.node;
        sigma.getCamera().disable();
        e.preventSigmaDefault();
      },

      mousemovebody: (coords) => {
        if (isDraggingRef.current && draggedNodeRef.current) {
          const graph = sigma.getGraph();
          const pos = sigma.viewportToGraph(coords);
          graph.setNodeAttribute(draggedNodeRef.current, "x", pos.x);
          graph.setNodeAttribute(draggedNodeRef.current, "y", pos.y);
        }
      },

      mouseup: () => {
        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          draggedNodeRef.current = null;
          sigma.getCamera().enable();
        }
      },

      // ── Node hover ──
      enterNode: (e) => {
        if (isDraggingRef.current) return;
        document.body.style.cursor = "pointer";
        hoveredNodeRef.current = e.node;

        const container = sigma.getContainer();
        const rect = container.getBoundingClientRect();
        const orig = e.event.original;
        const clientX = orig instanceof MouseEvent ? orig.clientX : orig.touches[0].clientX;
        const clientY = orig instanceof MouseEvent ? orig.clientY : orig.touches[0].clientY;

        callbacksRef.current.onHoverNode(e.node);
        callbacksRef.current.onMouseMove({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
        updateReducers();
      },

      leaveNode: () => {
        if (isDraggingRef.current) return;
        document.body.style.cursor = "default";
        hoveredNodeRef.current = null;
        callbacksRef.current.onHoverNode(null);
        updateReducers();
      },

      // ── Edge hover ──
      enterEdge: (e) => {
        if (isDraggingRef.current) return;
        document.body.style.cursor = "pointer";

        const graph = sigma.getGraph();
        const [source, target] = graph.extremities(e.edge);

        const container = sigma.getContainer();
        const rect = container.getBoundingClientRect();
        const orig = e.event.original;
        const clientX = orig instanceof MouseEvent ? orig.clientX : orig.touches[0].clientX;
        const clientY = orig instanceof MouseEvent ? orig.clientY : orig.touches[0].clientY;

        callbacksRef.current.onHoverEdge(`${source}->${target}`);
        callbacksRef.current.onMouseMove({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
      },

      leaveEdge: () => {
        if (isDraggingRef.current) return;
        document.body.style.cursor = "default";
        callbacksRef.current.onHoverEdge(null);
      },

      // ── Click ──
      clickNode: (e) => {
        callbacksRef.current.onClickNode(e.node);
      },

      clickStage: () => {
        callbacksRef.current.onClickStage();
      },
    });
  }, [registerEvents, sigma, updateReducers]);

  return null;
}
