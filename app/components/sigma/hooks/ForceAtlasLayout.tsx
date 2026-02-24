"use client";

import { useSigma } from "@react-sigma/core";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { useEffect, useRef } from "react";
import type { LayoutConfig } from "@/app/lib/graph/types";

interface ForceAtlasLayoutProps {
  config: LayoutConfig;
}

export default function ForceAtlasLayout({ config }: ForceAtlasLayoutProps) {
  const sigma = useSigma();
  const fa2Ref = useRef<FA2Layout | null>(null);

  useEffect(() => {
    const graph = sigma.getGraph();
    if (graph.order === 0) return;

    const fa2 = new FA2Layout(graph, {
      settings: {
        gravity: config.fa2?.gravity ?? 1,
        scalingRatio: config.fa2?.scalingRatio ?? 2,
        strongGravityMode: config.fa2?.strongGravityMode ?? false,
        barnesHutOptimize: config.fa2?.barnesHutOptimize ?? true,
        barnesHutTheta: 0.5,
        slowDown: 5,
      },
    });

    fa2.start();
    fa2Ref.current = fa2;

    const duration = config.fa2?.duration ?? 3000;
    const timer = setTimeout(() => {
      fa2.stop();
    }, duration);

    return () => {
      clearTimeout(timer);
      fa2.kill();
      fa2Ref.current = null;
    };
  }, [sigma, config]);

  return null;
}
