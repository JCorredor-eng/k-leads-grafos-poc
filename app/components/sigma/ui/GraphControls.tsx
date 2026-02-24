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

  const btnStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, borderRadius: 8,
    background: "var(--surface-glass)", backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    border: "1px solid var(--border)", color: "var(--text-secondary)",
    cursor: "pointer", transition: "all 0.15s", fontSize: 16,
    boxShadow: "var(--panel-shadow)",
  };

  return (
    <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", flexDirection: "column", gap: 4 }}>
      <button onClick={zoomIn} style={btnStyle} title="Zoom in">+</button>
      <button onClick={zoomOut} style={btnStyle} title="Zoom out">-</button>
      <button onClick={resetView} style={{ ...btnStyle, fontSize: 12 }} title="Reset view">R</button>
    </div>
  );
}
