export interface Cell {
  cell_identity: string;
  nr_physical_cell_id: string;
  nr_arfcn_dl?: string;
  nr_arfcn_dl_point_a?: string;
  ssb_arfcn?: string;
  nr_bandwidth_dl?: string;
  nr_frequency_band: string;
  tracking_area_code: string;
  administrative_state?: string;
}

export interface Alarm {
  alarm_id: string;
  severity: string;
  alarm_code: string;
  probable_cause: string;
  alarm_time: string;
}

export interface Hardware {
  unit_type: string;
  hw_name: string;
  serial_number: string;
  date_of_manufacture?: string;
}

export interface Software {
  sw_id: string;
  sw_name: string;
  sw_version: string;
  sw_status: string;
}

export interface GraphNode {
  gnb_id: string;
  ne_name: string | null;
  gnb_id_formatted: string;
  role: "source" | "neighbor";
  node_type?: string;
  ne_type?: string;
  sw_version?: string;
  ip_address: string;
  ip_subnet_48: string;
  connection_state?: string;
  operational_state?: string;
  administrative_state?: string;
  n_cells: number;
  cells: Cell[];
  hardware?: Hardware[];
  software?: Software[];
  n_neighbors?: number;
  tracking_area_codes?: string[];
  physical_cell_ids?: string[];
  xn_created_by?: string | null;
  amf_region_id?: string | null;
  has_active_alarms: boolean;
  alarms: Alarm[];
  /**
   * Radio visual del nodo en píxeles (override).
   * Si se omite o es <= 0, se usa la lógica por defecto basada en `role` y `n_cells`:
   *   - source → 28px
   *   - n_cells >= 4 → 16px
   *   - n_cells >= 2 → 12px
   *   - resto → 9px
   *
   * @example
   * // Nodo extra grande (40px de radio)
   * { gnb_id: "NODE-1", size: 40, ... }
   */
  size?: number;
}

export interface CellRelation {
  source_cell: string;
  target_gnb_id: string;
  target_cell: string;
  is_handover_allowed: string;
  q_offset_cell: string;
  created_by: string;
  rsrp_offset_ssb: string;
  rsrq_offset_ssb: string;
  sinr_offset_ssb: string;
}

export interface Transport {
  remote_ip_address: string;
  ip_subnet_48: string;
  xn_created_by: string;
  amf_region_id: string | null;
}

export interface CellRelationsSummary {
  all_handover_allowed?: boolean;
  q_offset_values?: string[];
  created_by_values?: string[];
  signal_offsets?: {
    rsrp: string[];
    rsrq: string[];
    sinr: string[];
  };
}

export interface GraphEdge {
  source: string;
  target: string;
  has_radio_config: boolean;
  has_transport_config: boolean;
  transport: Transport;
  weight: number;
  /**
   * Grosor de la línea de la arista en píxeles (override).
   * Si se omite, se usa la lógica por defecto: `Math.max(1, weight / 4)`.
   * En hover, el grosor se escala a `thickness * 1.5`.
   *
   * @example
   * // Arista gruesa fija de 6px (9px al hacer hover)
   * { source: "A", target: "B", thickness: 6, weight: 10, ... }
   */
  thickness?: number;
  cell_relations_summary: CellRelationsSummary;
  cell_relations: CellRelation[];
}

export interface AlarmContext {
  window_start: string;
  window_end: string;
  total_alarms: number;
  severity_distribution: Record<string, number>;
  probable_causes: string[];
}

export interface NetworkGraphMetadata {
  total_nodes: number;
  total_edges: number;
  total_cell_relations: number;
  nodes_with_alarms: number;
  subnet_groups: Record<string, string[]>;
  alarm_context: AlarmContext;
}

export interface NetworkGraphData {
  schema_version: string;
  metadata: NetworkGraphMetadata;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
