import type { Settings } from "sigma/settings";
import { createNodeBorderProgram } from "@sigma/node-border";

/** Node program with a 15% border ring (reads `borderColor` from node attributes) */
export const BorderedNodeProgram = createNodeBorderProgram({
  borders: [
    {
      size: { value: 0.15, mode: "relative" },
      color: { attribute: "borderColor", defaultValue: "transparent" },
    },
    {
      size: { fill: true },
      color: { attribute: "color" },
    },
  ],
});

/** Default Sigma container settings — K-Labs light theme */
export const SIGMA_SETTINGS: Partial<Settings> = {
  defaultNodeColor: "#64748b",
  defaultEdgeColor: "#cbd5e1",
  defaultNodeType: "bordered",
  nodeProgramClasses: {
    bordered: BorderedNodeProgram,
  },
  labelSize: 12,
  labelColor: { color: "#334155" },
  labelFont: "inherit",
  hideEdgesOnMove: true,
  enableEdgeEvents: true,
  zoomingRatio: 1.5,
};

/** Color applied to dimmed (non-neighbor) nodes on hover */
export const DIMMED_NODE_COLOR = "#e2e8f0";
