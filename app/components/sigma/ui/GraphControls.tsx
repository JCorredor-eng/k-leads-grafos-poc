"use client";

import { useSigma } from "@react-sigma/core";
import { useCallback } from "react";

export default function GraphControls() {
  const sigma = useSigma();

  const zoomIn = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedZoom({ duration: 300 });
  }, [sigma]);

  const zoomOut = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedUnzoom({ duration: 300 });
  }, [sigma]);

  const resetView = useCallback(() => {
    const camera = sigma.getCamera();
    camera.animatedReset({ duration: 300 });
  }, [sigma]);

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1">
      <button
        onClick={zoomIn}
        className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={zoomOut}
        className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700"
        title="Zoom out"
      >
        -
      </button>
      <button
        onClick={resetView}
        className="flex h-8 w-8 items-center justify-center rounded bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 text-xs"
        title="Reset view"
      >
        R
      </button>
    </div>
  );
}
