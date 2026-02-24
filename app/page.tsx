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
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* Tab bar */}
      <nav className="flex shrink-0 items-center border-b border-zinc-800 bg-zinc-900">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Dataset selector for active tab */}
        <div className="ml-auto flex items-center gap-2 px-4">
          <label htmlFor="dataset-select" className="text-xs text-zinc-400">
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
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-blue-500"
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
