"use client";

import dynamic from "next/dynamic";
import type { GraphInputData, GraphVisualConfig } from "@/app/lib/graph/types";
import type { NetworkGraphData } from "@/app/types/network-graph";

const SigmaGraphInner = dynamic(() => import("./SigmaGraphInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-zinc-500">
      Loading graph...
    </div>
  ),
});

interface SigmaGraphContainerProps {
  data: GraphInputData;
  config: GraphVisualConfig;
  rawData: NetworkGraphData;
}

export default function SigmaGraphContainer({
  data,
  config,
  rawData,
}: SigmaGraphContainerProps) {
  return <SigmaGraphInner data={data} config={config} rawData={rawData} />;
}
