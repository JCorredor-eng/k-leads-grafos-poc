"use client";

import { useState, useMemo } from "react";
import NetworkGraph from "./components/d3/NetworkGraph";
import SigmaGraphContainer from "./components/sigma/SigmaGraphContainer";
import { sampleNetworkGraph } from "./data/sample-network-graph";
import { demoCorporateFinanceGraphTyped } from "./data/sample-financial-graph";
import { demoEcommerceNetworkGraph } from "./data/sample-ecommerce-graph";
import { GnbTopologyAdapter } from "./lib/graph/adapters/gnb-topology.adapter";
import type { NetworkGraphData } from "./types/network-graph";

const DATASETS: { id: string; label: string; data: NetworkGraphData }[] = [
  { id: "network", label: "5G RAN Network", data: sampleNetworkGraph },
  { id: "financial", label: "Corporate Finance", data: demoCorporateFinanceGraphTyped },
  { id: "ecommerce", label: "E-commerce", data: demoEcommerceNetworkGraph },
];

const TABS = [
  { id: "d3", label: "D3" },
  { id: "sigma", label: "Sigma" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("d3");
  const [selectedDataset, setSelectedDataset] = useState<Record<TabId, string>>({
    d3: "network",
    sigma: "network",
  });

  const getDataForTab = (tabId: TabId): NetworkGraphData => {
    const dsId = selectedDataset[tabId];
    return DATASETS.find((d) => d.id === dsId)?.data ?? sampleNetworkGraph;
  };

  const sigmaData = useMemo(() => {
    const adapter = new GnbTopologyAdapter();
    const raw = getDataForTab("sigma");
    return {
      data: adapter.transform(raw),
      config: adapter.defaultConfig(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataset.sigma]);

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--background)" }}>
      {/* Navbar — glassmorphism */}
      <nav
        style={{
          display: "flex", alignItems: "center", flexShrink: 0,
          background: "var(--navbar-bg)",
          backdropFilter: "var(--navbar-blur)",
          WebkitBackdropFilter: "var(--navbar-blur)",
          borderBottom: "1px solid var(--navbar-border)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 24px", fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
              borderBottom: activeTab === tab.id ? "2px solid var(--klabs-accent)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              background: "transparent", border: "none", borderBottomStyle: "solid",
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "var(--font-sora, 'Sora', sans-serif)",
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Dataset selector */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
          <label htmlFor="dataset-select" style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Dataset:
          </label>
          <select
            id="dataset-select"
            value={selectedDataset[activeTab]}
            onChange={(e) =>
              setSelectedDataset((prev) => ({
                ...prev,
                [activeTab]: e.target.value,
              }))
            }
            style={{
              borderRadius: 6, border: "1px solid var(--border-strong)",
              background: "var(--surface)", padding: "6px 12px",
              fontSize: 13, color: "var(--text-primary)", outline: "none",
              fontFamily: "var(--font-sora, 'Sora', sans-serif)",
            }}
          >
            {DATASETS.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.label}
              </option>
            ))}
          </select>
        </div>
      </nav>

      {/* Tab content */}
      <div className="relative min-h-0 flex-1">
        {activeTab === "d3" && (
          <NetworkGraph
            key={selectedDataset.d3}
            data={getDataForTab("d3")}
          />
        )}
        {activeTab === "sigma" && (
          <SigmaGraphContainer
            key={selectedDataset.sigma}
            data={sigmaData.data}
            config={sigmaData.config}
            rawData={getDataForTab("sigma")}
          />
        )}
      </div>
    </div>
  );
}
