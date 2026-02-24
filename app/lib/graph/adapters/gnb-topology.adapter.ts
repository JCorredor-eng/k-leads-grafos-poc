import type { GraphDataAdapter } from "./index";
import type { GraphInputData, GraphVisualConfig } from "../types";
import type { NetworkGraphData } from "@/app/types/network-graph";

export class GnbTopologyAdapter implements GraphDataAdapter<NetworkGraphData> {
  transform(raw: NetworkGraphData): GraphInputData {
    const sourceNode = raw.nodes.find((n) => n.role === "source");
    const sourceSubnet = sourceNode?.ip_subnet_48 ?? "";

    return {
      metadata: {
        title: `Topology: ${sourceNode?.ne_name ?? "Unknown"}`,
        graphType: "directed",
        totalNodes: raw.metadata.total_nodes,
        totalEdges: raw.metadata.total_edges,
        groups: this.buildGroups(raw.metadata.subnet_groups),
        summary: { alarmContext: raw.metadata.alarm_context },
      },
      nodes: raw.nodes.map((n) => ({
        id: n.gnb_id,
        label: n.ne_name ?? `GNB-${n.gnb_id}`,
        group: n.ip_subnet_48,
        type: n.role,
        status: this.topSeverity(n),
        metrics: { nCells: n.n_cells, alarmCount: n.alarms?.length ?? 0 },
        domainData: {
          ipAddress: n.ip_address,
          cells: n.cells,
          alarms: n.alarms,
          hardware: n.hardware,
          software: n.software,
          xnCreatedBy: n.xn_created_by,
        },
      })),
      edges: raw.edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: e.weight > 0 ? `${e.weight} rels` : undefined,
        weight: e.weight,
        type:
          e.weight === 0
            ? "transport-only"
            : sourceSubnet !== e.transport?.ip_subnet_48
              ? "cross-subnet"
              : "normal",
        metrics: { cellRelations: e.cell_relations?.length ?? 0 },
        domainData: {
          hasRadioConfig: e.has_radio_config,
          transport: e.transport,
          cellRelationsSummary: e.cell_relations_summary,
        },
      })),
    };
  }

  defaultConfig(): GraphVisualConfig {
    return {
      layout: {
        type: "forceatlas2",
        seedByGroup: true,
        fa2: {
          gravity: 1.5,
          scalingRatio: 3,
          strongGravityMode: true,
          duration: 3000,
        },
      },
      nodeColor: {
        strategy: "group",
        defaultColor: "#64748B",
      },
      nodeSize: {
        strategy: "degree",
        min: 6,
        max: 24,
        baseByType: { source: 14 },
      },
      nodeBorder: {
        statusColors: {
          Critical: "#EF4444",
          Major: "#F97316",
          Minor: "#EAB308",
          None: "transparent",
        },
        defaultColor: "transparent",
        ratio: 0.15,
      },
      edgeColor: {
        strategy: "type",
        typeColors: {
          normal: "#94A3B8",
          "cross-subnet": "#FDE68A",
          "transport-only": "#CBD5E1",
        },
        defaultColor: "#CBD5E1",
      },
      edgeSize: { strategy: "weight", min: 0.5, max: 4 },
      labels: {
        showNodeLabels: true,
        showEdgeLabels: false,
        forceLabelTypes: ["source"],
      },
    };
  }

  private topSeverity(node: NetworkGraphData["nodes"][number]): string {
    if (!node.has_active_alarms || !node.alarms?.length) return "None";
    for (const s of ["Critical", "Major", "Minor"]) {
      if (node.alarms.some((a) => a.severity === s)) return s;
    }
    return "None";
  }

  private buildGroups(subnets: Record<string, string[]>) {
    const colors = [
      "#3B82F6",
      "#8B5CF6",
      "#06B6D4",
      "#F59E0B",
      "#EC4899",
      "#10B981",
    ];
    const result: Record<string, { label: string; color: string }> = {};
    Object.keys(subnets).forEach((s, i) => {
      result[s] = {
        label: s.split(":").pop() ?? s,
        color: colors[i % colors.length],
      };
    });
    return result;
  }
}
