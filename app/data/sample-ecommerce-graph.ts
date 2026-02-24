import type { NetworkGraphData } from "@/app/types/network-graph";

/**
 * Demo: E-commerce Order-to-Cash Graph (type-safe with your interfaces)
 * - Nodes: Storefront, Auth, Cart, Checkout, Payment, Fraud, OMS, WMS, Shipping, Support
 * - Edges: dependencies / integrations (via transport.xn_created_by)
 * - Cells: use as "components/instances" (required by your type)
 * - Alarms: incidents like payment timeouts, stock mismatch, fraud spike, shipping delays
 */
const demoEcommerceNetworkGraph: NetworkGraphData = {
  schema_version: "1.0",
  metadata: {
    total_nodes: 12,
    total_edges: 14,
    total_cell_relations: 0,
    nodes_with_alarms: 6,
    subnet_groups: {
      "2001:db8:2000:1": ["ECOM-HUB-001"],
      "2001:db8:2000:2": ["ECOM-WEB-001", "ECOM-AUTH-001", "ECOM-CART-001"],
      "2001:db8:2000:3": ["ECOM-CHK-001", "ECOM-PAY-001", "ECOM-FRAUD-001"],
      "2001:db8:2000:4": ["ECOM-OMS-001", "ECOM-INVENTORY-001", "ECOM-WMS-001"],
      "2001:db8:2000:5": ["ECOM-SHIP-001", "ECOM-NOTIF-001", "ECOM-SUPPORT-001"],
    },
    alarm_context: {
      window_start: "2026-02-19 12:00:00",
      window_end: "2026-02-19 18:00:00",
      total_alarms: 8,
      severity_distribution: { Major: 3, Critical: 5 },
      probable_causes: [
        "payment-provider-timeout",
        "inventory-mismatch",
        "fraud-rule-spike",
        "checkout-latency-high",
        "shipping-label-api-error",
      ],
    },
  },

  nodes: [
    // 1) Core hub (source) — usa `size` para override del radio visual (35px en vez del default 28px para source)
    {
      gnb_id: "ECOM-HUB-001",
      ne_name: "E-commerce Platform (Hub)",
      gnb_id_formatted: "/ECOM-HUB-001/",
      role: "source",
      node_type: "platform",
      ne_type: "ecommerce_hub",
      sw_version: "v1.0",
      ip_address: "2001:db8:2000:1::1",
      ip_subnet_48: "2001:db8:2000:1",
      connection_state: "connected",
      operational_state: "enabled",
      administrative_state: "unlocked",
      n_cells: 1,
      size: 35, // override: radio de 35px (default para source sería 28px)
      cells: [
        {
          cell_identity: "HUB",
          nr_physical_cell_id: "0",
          nr_frequency_band: "N/A",
          tracking_area_code: "ECOM",
          administrative_state: "unlocked",
        },
      ],
      n_neighbors: 6,
      has_active_alarms: false,
      alarms: [],
    },

    // 2) Web storefront
    {
      gnb_id: "ECOM-WEB-001",
      ne_name: "Storefront Web",
      gnb_id_formatted: "/ECOM-WEB-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "storefront",
      sw_version: "v3.12.4",
      ip_address: "2001:db8:2000:2::11",
      ip_subnet_48: "2001:db8:2000:2",
      connection_state: "connected",
      operational_state: "enabled",
      administrative_state: "unlocked",
      n_cells: 2,
      cells: [
        {
          cell_identity: "WEB-A",
          nr_physical_cell_id: "10",
          nr_arfcn_dl: "N/A",
          nr_frequency_band: "N/A",
          tracking_area_code: "FRONT",
          administrative_state: "unlocked",
        },
        {
          cell_identity: "WEB-B",
          nr_physical_cell_id: "11",
          nr_arfcn_dl: "N/A",
          nr_frequency_band: "N/A",
          tracking_area_code: "FRONT",
          administrative_state: "unlocked",
        },
      ],
      n_neighbors: 3,
      has_active_alarms: false,
      alarms: [],
    },

    // 3) Auth / Identity
    {
      gnb_id: "ECOM-AUTH-001",
      ne_name: "Identity & Auth",
      gnb_id_formatted: "/ECOM-AUTH-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "auth",
      sw_version: "v2.8.1",
      ip_address: "2001:db8:2000:2::12",
      ip_subnet_48: "2001:db8:2000:2",
      n_cells: 1,
      cells: [
        {
          cell_identity: "AUTH",
          nr_physical_cell_id: "20",
          nr_frequency_band: "N/A",
          tracking_area_code: "SEC",
        },
      ],
      n_neighbors: 2,
      has_active_alarms: true,
      alarms: [
        {
          alarm_id: "AL-AUTH-1",
          severity: "Major",
          alarm_code: "AUTH-RATE-429",
          probable_cause: "login-rate-limit-triggered",
          alarm_time: "2026-02-19 13:12:05",
        },
      ],
    },

    // 4) Cart service
    {
      gnb_id: "ECOM-CART-001",
      ne_name: "Cart Service",
      gnb_id_formatted: "/ECOM-CART-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "cart",
      sw_version: "v4.1.0",
      ip_address: "2001:db8:2000:2::13",
      ip_subnet_48: "2001:db8:2000:2",
      n_cells: 1,
      cells: [
        {
          cell_identity: "CART",
          nr_physical_cell_id: "30",
          nr_frequency_band: "N/A",
          tracking_area_code: "FRONT",
        },
      ],
      n_neighbors: 2,
      has_active_alarms: false,
      alarms: [],
    },

    // 5) Checkout
    {
      gnb_id: "ECOM-CHK-001",
      ne_name: "Checkout API",
      gnb_id_formatted: "/ECOM-CHK-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "checkout",
      sw_version: "v6.0.2",
      ip_address: "2001:db8:2000:3::21",
      ip_subnet_48: "2001:db8:2000:3",
      n_cells: 1,
      cells: [
        {
          cell_identity: "CHK",
          nr_physical_cell_id: "40",
          nr_frequency_band: "N/A",
          tracking_area_code: "ORDER",
        },
      ],
      n_neighbors: 4,
      has_active_alarms: true,
      alarms: [
        {
          alarm_id: "AL-CHK-1",
          severity: "Critical",
          alarm_code: "CHK-LAT-900",
          probable_cause: "checkout-latency-high",
          alarm_time: "2026-02-19 14:06:22",
        },
      ],
    },

    // 6) Payment Orchestrator
    {
      gnb_id: "ECOM-PAY-001",
      ne_name: "Payment Orchestrator",
      gnb_id_formatted: "/ECOM-PAY-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "payments",
      sw_version: "v5.7.0",
      ip_address: "2001:db8:2000:3::22",
      ip_subnet_48: "2001:db8:2000:3",
      n_cells: 1,
      cells: [
        {
          cell_identity: "PAY",
          nr_physical_cell_id: "50",
          nr_frequency_band: "N/A",
          tracking_area_code: "PAY",
        },
      ],
      n_neighbors: 2,
      has_active_alarms: true,
      alarms: [
        {
          alarm_id: "AL-PAY-1",
          severity: "Critical",
          alarm_code: "PAY-PROV-504",
          probable_cause: "payment-provider-timeout",
          alarm_time: "2026-02-19 14:05:11",
        },
      ],
    },

    // 7) Fraud engine
    {
      gnb_id: "ECOM-FRAUD-001",
      ne_name: "Fraud Scoring",
      gnb_id_formatted: "/ECOM-FRAUD-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "fraud",
      sw_version: "v1.9.3",
      ip_address: "2001:db8:2000:3::23",
      ip_subnet_48: "2001:db8:2000:3",
      n_cells: 1,
      cells: [
        {
          cell_identity: "FRAUD",
          nr_physical_cell_id: "60",
          nr_frequency_band: "N/A",
          tracking_area_code: "RISK",
        },
      ],
      n_neighbors: 2,
      has_active_alarms: true,
      alarms: [
        {
          alarm_id: "AL-FRAUD-1",
          severity: "Major",
          alarm_code: "FRAUD-SPIKE-77",
          probable_cause: "fraud-rule-spike",
          alarm_time: "2026-02-19 14:04:50",
        },
      ],
    },

    // 8) OMS (Order Management)
    {
      gnb_id: "ECOM-OMS-001",
      ne_name: "Order Management System",
      gnb_id_formatted: "/ECOM-OMS-001/",
      role: "neighbor",
      node_type: "system",
      ne_type: "oms",
      sw_version: "v2.5.0",
      ip_address: "2001:db8:2000:4::31",
      ip_subnet_48: "2001:db8:2000:4",
      n_cells: 1,
      cells: [
        {
          cell_identity: "OMS",
          nr_physical_cell_id: "70",
          nr_frequency_band: "N/A",
          tracking_area_code: "ORDER",
        },
      ],
      n_neighbors: 3,
      has_active_alarms: false,
      alarms: [],
    },

    // 9) Inventory
    {
      gnb_id: "ECOM-INVENTORY-001",
      ne_name: "Inventory Service",
      gnb_id_formatted: "/ECOM-INVENTORY-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "inventory",
      sw_version: "v3.0.1",
      ip_address: "2001:db8:2000:4::32",
      ip_subnet_48: "2001:db8:2000:4",
      n_cells: 1,
      cells: [
        {
          cell_identity: "INV",
          nr_physical_cell_id: "80",
          nr_frequency_band: "N/A",
          tracking_area_code: "SUPPLY",
        },
      ],
      n_neighbors: 2,
      has_active_alarms: true,
      alarms: [
        {
          alarm_id: "AL-INV-1",
          severity: "Critical",
          alarm_code: "INV-MISMATCH-12",
          probable_cause: "inventory-mismatch",
          alarm_time: "2026-02-19 14:07:41",
        },
      ],
    },

    // 10) WMS (Warehouse)
    {
      gnb_id: "ECOM-WMS-001",
      ne_name: "Warehouse Management",
      gnb_id_formatted: "/ECOM-WMS-001/",
      role: "neighbor",
      node_type: "system",
      ne_type: "wms",
      sw_version: "v7.3.9",
      ip_address: "2001:db8:2000:4::33",
      ip_subnet_48: "2001:db8:2000:4",
      n_cells: 1,
      cells: [
        {
          cell_identity: "WMS",
          nr_physical_cell_id: "90",
          nr_frequency_band: "N/A",
          tracking_area_code: "FULFILL",
        },
      ],
      n_neighbors: 2,
      has_active_alarms: false,
      alarms: [],
    },

    // 11) Shipping / Carrier
    {
      gnb_id: "ECOM-SHIP-001",
      ne_name: "Shipping Label Service",
      gnb_id_formatted: "/ECOM-SHIP-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "shipping",
      sw_version: "v1.4.2",
      ip_address: "2001:db8:2000:5::41",
      ip_subnet_48: "2001:db8:2000:5",
      n_cells: 1,
      cells: [
        {
          cell_identity: "SHIP",
          nr_physical_cell_id: "100",
          nr_frequency_band: "N/A",
          tracking_area_code: "DELIVERY",
        },
      ],
      n_neighbors: 2,
      has_active_alarms: true,
      alarms: [
        {
          alarm_id: "AL-SHIP-1",
          severity: "Major",
          alarm_code: "SHIP-LABEL-503",
          probable_cause: "shipping-label-api-error",
          alarm_time: "2026-02-19 14:09:02",
        },
      ],
    },

    // 12) Notifications / Customer Support (two nodes but we keep within 12: use Support only and treat notifs via edge)
    {
      gnb_id: "ECOM-SUPPORT-001",
      ne_name: "Customer Support Console",
      gnb_id_formatted: "/ECOM-SUPPORT-001/",
      role: "neighbor",
      node_type: "service",
      ne_type: "support",
      sw_version: "v0.9.0",
      ip_address: "2001:db8:2000:5::42",
      ip_subnet_48: "2001:db8:2000:5",
      n_cells: 1,
      cells: [
        {
          cell_identity: "SUPPORT",
          nr_physical_cell_id: "110",
          nr_frequency_band: "N/A",
          tracking_area_code: "CX",
        },
      ],
      n_neighbors: 1,
      has_active_alarms: false,
      alarms: [],
    },
  ],

  edges: [
    // Hub -> Web/Auth/Cart/Checkout/OMS/Support
    {
      source: "ECOM-HUB-001",
      target: "ECOM-WEB-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:2::11", ip_subnet_48: "2001:db8:2000:2", xn_created_by: "routes-traffic", amf_region_id: null },
      weight: 10,
      cell_relations_summary: { created_by_values: ["routes-traffic"] },
      cell_relations: [],
    },
    {
      source: "ECOM-HUB-001",
      target: "ECOM-AUTH-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:2::12", ip_subnet_48: "2001:db8:2000:2", xn_created_by: "delegates-auth", amf_region_id: null },
      weight: 9,
      cell_relations_summary: { created_by_values: ["delegates-auth"] },
      cell_relations: [],
    },
    {
      source: "ECOM-HUB-001",
      target: "ECOM-CART-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:2::13", ip_subnet_48: "2001:db8:2000:2", xn_created_by: "provides-session", amf_region_id: null },
      weight: 8,
      cell_relations_summary: { created_by_values: ["provides-session"] },
      cell_relations: [],
    },
    {
      source: "ECOM-HUB-001",
      target: "ECOM-CHK-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:3::21", ip_subnet_48: "2001:db8:2000:3", xn_created_by: "owns-checkout", amf_region_id: null },
      weight: 10,
      thickness: 5, // override: línea de 5px (default sería Math.max(1, 10/4) = 2.5px)
      cell_relations_summary: { created_by_values: ["owns-checkout"] },
      cell_relations: [],
    },
    {
      source: "ECOM-HUB-001",
      target: "ECOM-OMS-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:4::31", ip_subnet_48: "2001:db8:2000:4", xn_created_by: "creates-orders", amf_region_id: null },
      weight: 9,
      cell_relations_summary: { created_by_values: ["creates-orders"] },
      cell_relations: [],
    },
    {
      source: "ECOM-HUB-001",
      target: "ECOM-SUPPORT-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:5::42", ip_subnet_48: "2001:db8:2000:5", xn_created_by: "exposes-ops", amf_region_id: null },
      weight: 6,
      cell_relations_summary: { created_by_values: ["exposes-ops"] },
      cell_relations: [],
    },

    // Web -> Auth/Cart/Checkout
    {
      source: "ECOM-WEB-001",
      target: "ECOM-AUTH-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:2::12", ip_subnet_48: "2001:db8:2000:2", xn_created_by: "calls", amf_region_id: null },
      weight: 7,
      cell_relations_summary: { created_by_values: ["calls"] },
      cell_relations: [],
    },
    {
      source: "ECOM-WEB-001",
      target: "ECOM-CART-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:2::13", ip_subnet_48: "2001:db8:2000:2", xn_created_by: "calls", amf_region_id: null },
      weight: 7,
      cell_relations_summary: { created_by_values: ["calls"] },
      cell_relations: [],
    },
    {
      source: "ECOM-WEB-001",
      target: "ECOM-CHK-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:3::21", ip_subnet_48: "2001:db8:2000:3", xn_created_by: "calls", amf_region_id: null },
      weight: 8,
      cell_relations_summary: { created_by_values: ["calls"] },
      cell_relations: [],
    },

    // Checkout -> Payment/Fraud/Inventory/OMS
    {
      source: "ECOM-CHK-001",
      target: "ECOM-PAY-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:3::22", ip_subnet_48: "2001:db8:2000:3", xn_created_by: "authorizes", amf_region_id: null },
      weight: 10,
      cell_relations_summary: { created_by_values: ["authorizes"] },
      cell_relations: [],
    },
    {
      source: "ECOM-CHK-001",
      target: "ECOM-FRAUD-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:3::23", ip_subnet_48: "2001:db8:2000:3", xn_created_by: "scores", amf_region_id: null },
      weight: 9,
      cell_relations_summary: { created_by_values: ["scores"] },
      cell_relations: [],
    },
    {
      source: "ECOM-CHK-001",
      target: "ECOM-INVENTORY-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:4::32", ip_subnet_48: "2001:db8:2000:4", xn_created_by: "reserves-stock", amf_region_id: null },
      weight: 9,
      cell_relations_summary: { created_by_values: ["reserves-stock"] },
      cell_relations: [],
    },
    {
      source: "ECOM-CHK-001",
      target: "ECOM-OMS-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:4::31", ip_subnet_48: "2001:db8:2000:4", xn_created_by: "submits-order", amf_region_id: null },
      weight: 10,
      cell_relations_summary: { created_by_values: ["submits-order"] },
      cell_relations: [],
    },

    // OMS -> WMS -> Shipping
    {
      source: "ECOM-OMS-001",
      target: "ECOM-WMS-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:4::33", ip_subnet_48: "2001:db8:2000:4", xn_created_by: "dispatches", amf_region_id: null },
      weight: 8,
      cell_relations_summary: { created_by_values: ["dispatches"] },
      cell_relations: [],
    },
    {
      source: "ECOM-WMS-001",
      target: "ECOM-SHIP-001",
      has_radio_config: false,
      has_transport_config: true,
      transport: { remote_ip_address: "2001:db8:2000:5::41", ip_subnet_48: "2001:db8:2000:5", xn_created_by: "prints-label", amf_region_id: null },
      weight: 8,
      cell_relations_summary: { created_by_values: ["prints-label"] },
      cell_relations: [],
    },
  ],
};

export { demoEcommerceNetworkGraph };