"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "@/app/types/network-graph";
import type { SimNode, SimLink, SimulationCallbacks } from "../lib/types";
import { getNodeRadius } from "../lib/helpers";
import { SEVERITY_COLORS } from "../lib/constants";
import { SEARCH_HIGHLIGHT_COLOR } from "@/app/components/shared/lib/constants";

interface UseForceSimulationParams {
  svgRef: React.RefObject<SVGSVGElement | null>;
  visibleNodes: GraphNode[];
  visibleEdges: GraphEdge[];
  dimensions: { w: number; h: number };
  selectedNodeId: string | null;
  nodeMap: Record<string, GraphNode>;
  subnetColors: Record<string, string>;
  callbacks: SimulationCallbacks;
  matchedNodeIds: Set<string> | null;
}

export default function useForceSimulation({
  svgRef,
  visibleNodes,
  visibleEdges,
  dimensions,
  selectedNodeId,
  nodeMap,
  subnetColors,
  callbacks,
  matchedNodeIds,
}: UseForceSimulationParams) {
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = dimensions.w;
    const h = dimensions.h;
    const panelW = selectedNodeId ? 340 : 0;
    const graphW = w - panelW;

    // Glow filter for alarm rings
    const defs = svg.append("defs");
    defs.append("filter").attr("id", "glow")
      .append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");

    const searchGlow = defs.append("filter").attr("id", "search-glow")
      .attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    searchGlow.append("feDropShadow")
      .attr("dx", 0).attr("dy", 0).attr("stdDeviation", 4)
      .attr("flood-color", SEARCH_HIGHLIGHT_COLOR).attr("flood-opacity", 0.8);

    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoom);

    // Compute degree (number of connections) per node
    const degreeMap = new Map<string, number>();
    for (const e of visibleEdges) {
      degreeMap.set(e.source, (degreeMap.get(e.source) ?? 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) ?? 0) + 1);
    }

    // Prepare D3-compatible data copies
    const nodes: SimNode[] = visibleNodes.map((n) => ({
      id: n.gnb_id,
      gnb_id: n.gnb_id,
      ne_name: n.ne_name,
      role: n.role,
      n_cells: n.n_cells,
      has_active_alarms: n.has_active_alarms,
      ip_subnet_48: n.ip_subnet_48,
      alarms: n.alarms,
      size: n.size,
      degree: degreeMap.get(n.gnb_id) ?? 0,
    }));

    const links: SimLink[] = visibleEdges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
      thickness: e.thickness,
      has_radio_config: e.has_radio_config,
      has_transport_config: e.has_transport_config,
      transport: e.transport,
    }));

    const sim = d3.forceSimulation<SimNode>(nodes)
      .force("link", d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(graphW / 2, h / 2))
      .force("collision", d3.forceCollide<SimNode>().radius((d) => getNodeRadius(d) + 4));

    simRef.current = sim;

    // ----- Edges -----
    const linkSel = g.append("g").selectAll<SVGLineElement, SimLink>("line")
      .data(links).join("line")
      .attr("stroke", (d) => (subnetColors[d.transport.ip_subnet_48] || "#94a3b8") + "88")
      .attr("stroke-width", (d) => d.thickness ?? Math.max(1, d.weight / 4))
      .attr("stroke-dasharray", (d) => (d.has_radio_config && d.has_transport_config) ? "none" : "4 3")
      .style("cursor", "pointer")
      .on("mouseenter", function (evt: MouseEvent, d) {
        const src = d.source as SimNode;
        const tgt = d.target as SimNode;
        const original: GraphEdge | undefined = visibleEdges.find(
          (e) => e.source === src.gnb_id && e.target === tgt.gnb_id,
        );
        if (original) callbacks.onHoverEdge(original);
        callbacks.onMouseMove({ x: evt.offsetX, y: evt.offsetY });
        d3.select(this)
          .attr("stroke", subnetColors[d.transport.ip_subnet_48] || "#94a3b8")
          .attr("stroke-width", d.thickness != null ? d.thickness * 1.5 : Math.max(2, d.weight / 3));
      })
      .on("mouseleave", function (_evt: MouseEvent, d) {
        callbacks.onHoverEdge(null);
        d3.select(this)
          .attr("stroke", (subnetColors[d.transport.ip_subnet_48] || "#94a3b8") + "88")
          .attr("stroke-width", d.thickness ?? Math.max(1, d.weight / 4));
      });

    // ----- Nodes -----
    const nodeGroup = g.append("g").selectAll<SVGGElement, SimNode>("g")
      .data(nodes).join("g").style("cursor", "pointer");

    // Alarm ring
    nodeGroup.filter((d) => d.has_active_alarms).append("circle")
      .attr("r", (d) => getNodeRadius(d) + 3)
      .attr("fill", "none")
      .attr("stroke", (d) => SEVERITY_COLORS[d.alarms?.[0]?.severity] || "#DC2626")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", (d) => d.alarms?.[0]?.severity === "Major" ? "3 2" : "none")
      .attr("opacity", 0.7)
      .attr("filter", "url(#glow)");

    // Main circle
    nodeGroup.append("circle")
      .attr("r", (d) => getNodeRadius(d))
      .attr("fill", (d) => {
        const base = subnetColors[d.ip_subnet_48] || "#64748b";
        return d.has_active_alarms ? base : base + "44";
      })
      .attr("stroke", (d) => d.role === "source" ? "#0f172a" : "none")
      .attr("stroke-width", (d) => d.role === "source" ? 2.5 : 0)
      .attr("opacity", 0.9);

    // Node label
    nodeGroup.append("text")
      .text((d) => (d.ne_name || d.gnb_id).replace("MGY-S", "S"))
      .attr("dy", (d) => getNodeRadius(d) + 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", (d) => d.role === "source" ? 11 : 9)
      .attr("font-family", "'Sora', system-ui, sans-serif")
      .attr("font-weight", (d) => d.role === "source" ? 700 : 400);

    // Cell-count badge for nodes with 4+ cells
    nodeGroup.filter((d) => d.n_cells >= 4).append("text")
      .text((d) => String(d.n_cells))
      .attr("dy", 4).attr("text-anchor", "middle")
      .attr("fill", "#0f172a").attr("font-size", 10)
      .attr("font-weight", 700).attr("font-family", "'Sora', system-ui, sans-serif");

    // Star for source node
    nodeGroup.filter((d) => d.role === "source").append("text")
      .text("\u2605")
      .attr("dy", 5).attr("text-anchor", "middle")
      .attr("fill", "#fbbf24").attr("font-size", 16);

    // Search highlight: glow ring on matched, dim non-matched
    if (matchedNodeIds && matchedNodeIds.size > 0) {
      nodeGroup.filter((d) => matchedNodeIds.has(d.id)).append("circle")
        .attr("r", (d) => getNodeRadius(d) + 5)
        .attr("fill", "none")
        .attr("stroke", SEARCH_HIGHLIGHT_COLOR)
        .attr("stroke-width", 2)
        .attr("filter", "url(#search-glow)");

      nodeGroup.filter((d) => !matchedNodeIds.has(d.id))
        .attr("opacity", 0.25);

      linkSel.attr("opacity", (d) => {
        const srcId = typeof d.source === "string" ? d.source : (d.source as SimNode).id;
        const tgtId = typeof d.target === "string" ? d.target : (d.target as SimNode).id;
        return (matchedNodeIds.has(srcId) || matchedNodeIds.has(tgtId)) ? 1 : 0.1;
      });
    }

    // Interactions
    nodeGroup
      .on("mouseenter", function (evt: MouseEvent, d) {
        callbacks.onHoverNode(nodeMap[d.gnb_id] ?? null);
        callbacks.onMouseMove({ x: evt.offsetX, y: evt.offsetY });
        d3.select(this).select<SVGCircleElement>("circle:nth-child(2)")
          .transition().duration(150).attr("r", getNodeRadius(d) + 3);
      })
      .on("mouseleave", function (_evt: MouseEvent, d) {
        callbacks.onHoverNode(null);
        d3.select(this).select<SVGCircleElement>("circle:nth-child(2)")
          .transition().duration(150).attr("r", getNodeRadius(d));
      })
      .on("click", (evt: MouseEvent, d) => {
        evt.stopPropagation();
        callbacks.onClickNode(nodeMap[d.gnb_id] ?? null);
      });

    svg.on("click", () => callbacks.onBackgroundClick());

    // Drag behaviour
    const drag = d3.drag<SVGGElement, SimNode>()
      .on("start", (evt, d) => { if (!evt.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (evt, d) => { d.fx = evt.x; d.fy = evt.y; })
      .on("end", (evt, d) => { if (!evt.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
    nodeGroup.call(drag);

    // Tick
    sim.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);
      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); };
  }, [svgRef, visibleNodes, visibleEdges, dimensions, selectedNodeId, nodeMap, subnetColors, callbacks, matchedNodeIds]);

  return simRef;
}
