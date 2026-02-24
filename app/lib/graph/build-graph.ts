import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import type {
  GraphInputData,
  GraphVisualConfig,
  GraphNodeInput,
  GraphEdgeInput,
  NodeColorConfig,
  NodeSizeConfig,
  NodeBorderConfig,
  EdgeColorConfig,
  EdgeSizeConfig,
} from "./types";

type MetricRanges = Record<string, { min: number; max: number }>;

export function buildGraph(
  data: GraphInputData,
  config: GraphVisualConfig
): Graph {
  const graphType = data.metadata?.graphType ?? "directed";
  const graph = new Graph({
    type: graphType === "mixed" ? "mixed" : graphType,
    multi: false,
  });

  const groups = data.metadata?.groups ?? {};
  const nodeMetricRanges = computeMetricRanges(data.nodes.map((n) => n.metrics));
  const edgeMetricRanges = computeMetricRanges(data.edges.map((e) => e.metrics));

  // Weight range for edge sizing
  const weights = data.edges.map((e) => e.weight ?? 0);
  const weightRange = {
    min: Math.min(...weights, 0),
    max: Math.max(...weights, 1),
  };

  // Add nodes
  for (const node of data.nodes) {
    const color = resolveNodeColor(node, config.nodeColor, groups);
    const size = resolveNodeSize(node, config.nodeSize, nodeMetricRanges);
    const borderColor = config.nodeBorder
      ? resolveNodeBorderColor(node, config.nodeBorder)
      : undefined;
    const forceLabel =
      config.labels.forceLabelTypes?.includes(node.type ?? "") ?? false;

    graph.addNode(node.id, {
      x: 0,
      y: 0,
      size,
      color,
      label: node.label,
      forceLabel,
      zIndex: node.type === "source" ? 2 : 1,
      ...(borderColor != null && { borderColor }),
      // Passthrough data (prefixed to avoid sigma conflicts)
      _group: node.group,
      _type: node.type,
      _status: node.status,
      _metrics: node.metrics,
      _domainData: node.domainData,
    });
  }

  // Seed positions by group if configured
  if (config.layout.seedByGroup) {
    seedPositionsByGroup(graph, groups);
  } else {
    // Random positions
    graph.forEachNode((nodeKey) => {
      graph.setNodeAttribute(nodeKey, "x", Math.random() * 100 - 50);
      graph.setNodeAttribute(nodeKey, "y", Math.random() * 100 - 50);
    });
  }

  // Add edges
  for (const edge of data.edges) {
    if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;

    const color = resolveEdgeColor(edge, config.edgeColor, graph);
    const size = resolveEdgeSize(edge, config.edgeSize, edgeMetricRanges, weightRange);

    graph.addEdge(edge.source, edge.target, {
      size,
      color,
      label: config.labels.showEdgeLabels ? edge.label : undefined,
      _type: edge.type,
      _weight: edge.weight,
      _metrics: edge.metrics,
      _domainData: edge.domainData,
    });
  }

  // Degree-based sizing: must run after edges are added
  if (config.nodeSize.strategy === "degree") {
    const { min, max, baseByType } = config.nodeSize;
    const degrees = graph.mapNodes((n) => graph.degree(n));
    const maxDeg = Math.max(...degrees, 1);

    graph.forEachNode((nodeKey, attrs) => {
      const deg = graph.degree(nodeKey);
      const nodeType = attrs._type as string | undefined;
      const base = (baseByType && nodeType ? baseByType[nodeType] : undefined) ?? min;
      // Logarithmic scaling: more connections → bigger, but with diminishing returns
      const t = deg > 0 ? Math.log2(deg + 1) / Math.log2(maxDeg + 1) : 0;
      graph.setNodeAttribute(nodeKey, "size", base + t * (max - base));
    });
  }

  // Pre-compute ForceAtlas2 layout synchronously so nodes appear settled on first render
  if (config.layout.type === "forceatlas2" && graph.order > 0) {
    const fa2Config = config.layout.fa2 ?? {};
    forceAtlas2.assign(graph, {
      iterations: 150,
      settings: {
        gravity: fa2Config.gravity ?? 1,
        scalingRatio: fa2Config.scalingRatio ?? 2,
        strongGravityMode: fa2Config.strongGravityMode ?? false,
        barnesHutOptimize: fa2Config.barnesHutOptimize ?? true,
        barnesHutTheta: 0.5,
        slowDown: 5,
      },
    });
  }

  return graph;
}

function resolveNodeColor(
  node: GraphNodeInput,
  config: NodeColorConfig,
  groups: Record<string, { label?: string; color?: string }>
): string {
  switch (config.strategy) {
    case "fixed":
      return config.color;

    case "group": {
      if (!node.group) return config.defaultColor ?? "#94A3B8";
      if (config.palette?.[node.group]) return config.palette[node.group];
      if (groups[node.group]?.color) return groups[node.group].color!;
      return generateGroupColor(node.group);
    }

    case "status": {
      if (!node.status) return config.defaultColor ?? "#94A3B8";
      return config.statusColors[node.status] ?? config.defaultColor ?? "#94A3B8";
    }

    case "metric": {
      const val = node.metrics?.[config.metricKey];
      if (val == null) return config.gradientStart;
      // Simple linear interpolation between two hex colors
      return interpolateColor(config.gradientStart, config.gradientEnd, val);
    }
  }
}

function resolveNodeSize(
  node: GraphNodeInput,
  config: NodeSizeConfig,
  metricRanges: MetricRanges
): number {
  switch (config.strategy) {
    case "fixed":
      return config.size;

    case "type": {
      if (!node.type) return config.defaultSize ?? 8;
      return config.typeSizes[node.type] ?? config.defaultSize ?? 8;
    }

    case "metric": {
      const val = node.metrics?.[config.metricKey];
      if (val == null) return config.min;
      const range = metricRanges[config.metricKey];
      if (!range || range.max === range.min) return config.min;
      const t = (val - range.min) / (range.max - range.min);
      return config.min + t * (config.max - config.min);
    }

    case "degree":
      // Placeholder — real size is computed after edges are added
      return config.min;
  }
}

function resolveNodeBorderColor(
  node: GraphNodeInput,
  config: NodeBorderConfig,
): string {
  if (!node.status) return config.defaultColor;
  return config.statusColors[node.status] ?? config.defaultColor;
}

function resolveEdgeColor(
  edge: GraphEdgeInput,
  config: EdgeColorConfig,
  graph: Graph
): string {
  switch (config.strategy) {
    case "fixed":
      return config.color;

    case "type": {
      if (!edge.type) return config.defaultColor ?? "#CBD5E1";
      return config.typeColors[edge.type] ?? config.defaultColor ?? "#CBD5E1";
    }

    case "source": {
      if (graph.hasNode(edge.source)) {
        return graph.getNodeAttribute(edge.source, "color") as string;
      }
      return "#CBD5E1";
    }
  }
}

function resolveEdgeSize(
  edge: GraphEdgeInput,
  config: EdgeSizeConfig,
  metricRanges: MetricRanges,
  weightRange: { min: number; max: number }
): number {
  switch (config.strategy) {
    case "fixed":
      return config.size;

    case "weight": {
      const w = edge.weight ?? 0;
      if (weightRange.max === weightRange.min) return config.min;
      const t = (w - weightRange.min) / (weightRange.max - weightRange.min);
      return config.min + t * (config.max - config.min);
    }

    case "metric": {
      const val = edge.metrics?.[config.metricKey];
      if (val == null) return config.min;
      const range = metricRanges[config.metricKey];
      if (!range || range.max === range.min) return config.min;
      const t = (val - range.min) / (range.max - range.min);
      return config.min + t * (config.max - config.min);
    }
  }
}

function computeMetricRanges(
  items: (Record<string, number> | undefined)[]
): MetricRanges {
  const ranges: MetricRanges = {};
  for (const metrics of items) {
    if (!metrics) continue;
    for (const [key, val] of Object.entries(metrics)) {
      if (!ranges[key]) {
        ranges[key] = { min: val, max: val };
      } else {
        ranges[key].min = Math.min(ranges[key].min, val);
        ranges[key].max = Math.max(ranges[key].max, val);
      }
    }
  }
  return ranges;
}

function seedPositionsByGroup(
  graph: Graph,
  groups: Record<string, { label?: string; color?: string }>
) {
  const groupKeys = Object.keys(groups);
  const angleStep = (2 * Math.PI) / Math.max(groupKeys.length, 1);
  const radius = 50;

  const groupCenters: Record<string, { cx: number; cy: number }> = {};
  groupKeys.forEach((key, i) => {
    groupCenters[key] = {
      cx: radius * Math.cos(i * angleStep),
      cy: radius * Math.sin(i * angleStep),
    };
  });

  graph.forEachNode((nodeKey, attrs) => {
    const group = attrs._group as string | undefined;
    const center = group ? groupCenters[group] : undefined;
    const spread = 15;

    if (center) {
      graph.setNodeAttribute(
        nodeKey,
        "x",
        center.cx + (Math.random() - 0.5) * spread
      );
      graph.setNodeAttribute(
        nodeKey,
        "y",
        center.cy + (Math.random() - 0.5) * spread
      );
    } else {
      graph.setNodeAttribute(nodeKey, "x", (Math.random() - 0.5) * 100);
      graph.setNodeAttribute(nodeKey, "y", (Math.random() - 0.5) * 100);
    }

    // Keep source node near center
    if (attrs._type === "source") {
      graph.setNodeAttribute(nodeKey, "x", (Math.random() - 0.5) * 5);
      graph.setNodeAttribute(nodeKey, "y", (Math.random() - 0.5) * 5);
    }
  });
}

function generateGroupColor(groupKey: string): string {
  let hash = 0;
  for (let i = 0; i < groupKey.length; i++) {
    hash = groupKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 55%)`;
}

function interpolateColor(start: string, end: string, t: number): string {
  const s = hexToRgb(start);
  const e = hexToRgb(end);
  if (!s || !e) return start;
  const clampedT = Math.max(0, Math.min(1, t));
  const r = Math.round(s.r + (e.r - s.r) * clampedT);
  const g = Math.round(s.g + (e.g - s.g) * clampedT);
  const b = Math.round(s.b + (e.b - s.b) * clampedT);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
