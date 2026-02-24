"use client";

import dynamic from "next/dynamic";
import type { GraphInputData, GraphVisualConfig } from "@/app/lib/graph/types";
import type { NetworkGraphData } from "@/app/types/network-graph";

const SigmaGraphInner = dynamic(() => import("./SigmaGraphInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ color: "var(--text-muted)" }}>
      Loading graph...
    </div>
  ),
});

interface SigmaGraphContainerProps {
  data: GraphInputData;
  config: GraphVisualConfig;
  rawData: NetworkGraphData;
  datasetLabel: string;
}

export default function SigmaGraphContainer({
  data,
  config,
  rawData,
  datasetLabel,
}: SigmaGraphContainerProps) {
  return <SigmaGraphInner data={data} config={config} rawData={rawData} datasetLabel={datasetLabel} />;
}
