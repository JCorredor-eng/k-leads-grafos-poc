"use client";

import { useLoadGraph } from "@react-sigma/core";
import { useEffect, useRef } from "react";
import { buildGraph } from "@/app/lib/graph/build-graph";
import type { GraphInputData, GraphVisualConfig } from "@/app/lib/graph/types";

interface GraphLoaderProps {
  data: GraphInputData;
  config: GraphVisualConfig;
}

export default function GraphLoader({ data, config }: GraphLoaderProps) {
  const loadGraph = useLoadGraph();
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const graph = buildGraph(data, configRef.current);
    loadGraph(graph);
  }, [data, loadGraph]);

  return null;
}
