import type { SimNode } from "./types";

export { buildSubnetColorMap, subnetLabel, formatAlarmWindow } from "@/app/components/shared/lib/helpers";

/**
 * Node radius scales with its degree (number of connections).
 * Base radius determined by role, then scaled up by degree.
 * - source: base 20, scales up to ~36 with many connections
 * - neighbor: base 7, scales up to ~24 with many connections
 */
export function getNodeRadius(node: SimNode): number {
  if (node.size != null && node.size > 0) return node.size;

  const degree = node.degree ?? 0;
  const baseRadius = node.role === "source" ? 20 : 7;
  // Logarithmic scaling: each connection adds diminishing radius
  const degreeBonus = degree > 0 ? Math.log2(degree + 1) * 4 : 0;
  return baseRadius + degreeBonus;
}
