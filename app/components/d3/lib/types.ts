import type * as d3 from "d3";
import type { Alarm, GraphNode, GraphEdge } from "@/app/types/network-graph";

export type { TooltipPosition } from "@/app/components/shared/lib/types";

export interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  gnb_id: string;
  ne_name: string | null;
  role: "source" | "neighbor";
  n_cells: number;
  has_active_alarms: boolean;
  ip_subnet_48: string;
  alarms: Alarm[];
  /** @see {@link import("@/app/types/network-graph").GraphNode.size} */
  size?: number;
  /** Number of connections (edges) for this node — computed at simulation init */
  degree: number;
}

export interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  weight: number;
  /** @see {@link import("@/app/types/network-graph").GraphEdge.thickness} */
  thickness?: number;
  has_radio_config: boolean;
  has_transport_config: boolean;
  transport: import("@/app/types/network-graph").Transport;
}

export interface SimulationCallbacks {
  onHoverNode: (node: GraphNode | null) => void;
  onHoverEdge: (edge: GraphEdge | null) => void;
  onClickNode: (node: GraphNode | null) => void;
  onMouseMove: (pos: { x: number; y: number }) => void;
  onBackgroundClick: () => void;
}
