// ════════════════════════════════════════════
//  CANONICAL GRAPH INPUT — domain-agnostic
// ════════════════════════════════════════════

export interface GraphInputData {
  nodes: GraphNodeInput[];
  edges: GraphEdgeInput[];
  metadata?: GraphMetadata;
}

export interface GraphNodeInput {
  id: string;
  label: string;
  /** Grouping key → color-by-group (subnet, category, department...) */
  group?: string;
  /** Entity type → shape + size-by-type (source/neighbor, bank/merchant...) */
  type?: string;
  /** Status string → color-by-status (Critical, high-risk, out-of-stock...) */
  status?: string;
  /** Numeric metrics → size-by-metric, color gradient */
  metrics?: Record<string, number>;
  /** Opaque domain data → tooltips, detail panels. Core never reads this. */
  domainData?: Record<string, unknown>;
}

export interface GraphEdgeInput {
  source: string;
  target: string;
  label?: string;
  weight?: number;
  type?: string;
  metrics?: Record<string, number>;
  domainData?: Record<string, unknown>;
}

export interface GraphMetadata {
  title?: string;
  description?: string;
  graphType?: "directed" | "undirected" | "mixed";
  totalNodes?: number;
  totalEdges?: number;
  /** Pre-defined groups with optional colors */
  groups?: Record<string, { label?: string; color?: string }>;
  /** Opaque summary for domain-specific UI */
  summary?: Record<string, unknown>;
}

// ════════════════════════════════════════════
//  VISUAL CONFIG — declarative mapping
// ════════════════════════════════════════════

export interface GraphVisualConfig {
  layout: LayoutConfig;
  nodeColor: NodeColorConfig;
  nodeSize: NodeSizeConfig;
  nodeBorder?: NodeBorderConfig;
  edgeColor: EdgeColorConfig;
  edgeSize: EdgeSizeConfig;
  labels: LabelConfig;
}

export interface LayoutConfig {
  type: "forceatlas2" | "circular" | "random";
  seedByGroup?: boolean;
  fa2?: {
    gravity?: number;
    scalingRatio?: number;
    strongGravityMode?: boolean;
    barnesHutOptimize?: boolean;
    duration?: number;
  };
}

export type NodeColorConfig =
  | { strategy: "fixed"; color: string }
  | {
      strategy: "group";
      palette?: Record<string, string>;
      defaultColor?: string;
    }
  | {
      strategy: "status";
      statusColors: Record<string, string>;
      defaultColor?: string;
    }
  | {
      strategy: "metric";
      metricKey: string;
      gradientStart: string;
      gradientEnd: string;
    };

export type NodeSizeConfig =
  | { strategy: "fixed"; size: number }
  | {
      strategy: "type";
      typeSizes: Record<string, number>;
      defaultSize?: number;
    }
  | { strategy: "metric"; metricKey: string; min: number; max: number }
  | { strategy: "degree"; min: number; max: number; baseByType?: Record<string, number> };

export type EdgeColorConfig =
  | { strategy: "fixed"; color: string }
  | {
      strategy: "type";
      typeColors: Record<string, string>;
      defaultColor?: string;
    }
  | { strategy: "source" };

export type EdgeSizeConfig =
  | { strategy: "fixed"; size: number }
  | { strategy: "weight"; min: number; max: number }
  | { strategy: "metric"; metricKey: string; min: number; max: number };

export interface NodeBorderConfig {
  /** Map node status → border color */
  statusColors: Record<string, string>;
  /** Border color when node has no status match */
  defaultColor: string;
  /** Border ratio (0-1). 0.15 = 15% of node radius is border. */
  ratio?: number;
}

export interface LabelConfig {
  showNodeLabels?: boolean;
  showEdgeLabels?: boolean;
  labelThreshold?: number;
  forceLabelTypes?: string[];
}
