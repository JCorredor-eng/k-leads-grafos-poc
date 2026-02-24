import { subnetLabel } from "../lib/helpers";

interface SubnetFiltersProps {
  subnetKeys: string[];
  subnetColors: Record<string, string>;
  activeSubnets: Set<string>;
  subnetGroups: Record<string, string[]>;
  showAlarmsOnly: boolean;
  visibleNodeCount: number;
  totalNodeCount: number;
  visibleEdgeCount: number;
  onToggleSubnet: (subnet: string) => void;
  onToggleAlarmsOnly: () => void;
  neighborSubnets: Set<string> | null;
  isFocusedOnNeighbors: boolean;
  onFocusNeighborSubnets: () => void;
  onResetSubnets: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  matchedNodeCount?: number | null;
}

export default function SubnetFilters({
  subnetKeys,
  subnetColors,
  activeSubnets,
  subnetGroups,
  showAlarmsOnly,
  visibleNodeCount,
  totalNodeCount,
  visibleEdgeCount,
  onToggleSubnet,
  onToggleAlarmsOnly,
  neighborSubnets,
  isFocusedOnNeighbors,
  onFocusNeighborSubnets,
  onResetSubnets,
  searchTerm = "",
  onSearchChange,
  matchedNodeCount,
}: SubnetFiltersProps) {
  return (
    <div style={{ position: "absolute", top: 50, left: 16, zIndex: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      {onSearchChange && (
        <div
          style={{
            background: "#0f172acc", backdropFilter: "blur(8px)",
            borderRadius: 8, border: "1px solid " + (searchTerm ? "#3b82f644" : "#1e293b"),
            padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569", marginBottom: 2 }}>
            Search nodes
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Name or ID…"
              style={{
                flex: 1, background: "#1e293b", border: "1px solid #334155",
                borderRadius: 4, padding: "4px 8px", color: "#e2e8f0",
                fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                outline: "none", minWidth: 0,
              }}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                style={{
                  background: "#334155", border: "none", borderRadius: 4,
                  color: "#94a3b8", cursor: "pointer", padding: "2px 6px",
                  fontSize: 12, lineHeight: 1, flexShrink: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && matchedNodeCount != null && (
            <span style={{ fontSize: 9, color: matchedNodeCount > 0 ? "#3b82f6" : "#ef4444" }}>
              {matchedNodeCount > 0 ? `${matchedNodeCount} match${matchedNodeCount === 1 ? "" : "es"}` : "No matches"}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          background: "#0f172acc", backdropFilter: "blur(8px)",
          borderRadius: 8, border: "1px solid #1e293b",
          padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#475569", marginBottom: 2 }}>
          Subnets
        </span>
        {subnetKeys.map((s) => {
          const color = subnetColors[s];
          const count = subnetGroups[s]?.length ?? 0;
          return (
            <button
              key={s}
              onClick={() => onToggleSubnet(s)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: activeSubnets.has(s) ? "#1e293b" : "transparent",
                border: "1px solid " + (activeSubnets.has(s) ? color + "44" : "#1e293b"),
                borderRadius: 4, padding: "3px 8px", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeSubnets.has(s) ? color : color + "33" }} />
              <span style={{ fontSize: 10, color: activeSubnets.has(s) ? "#e2e8f0" : "#475569", fontFamily: "'JetBrains Mono',monospace" }}>
                {subnetLabel(s)}
              </span>
              <span style={{ fontSize: 9, color: "#475569", marginLeft: "auto" }}>{count}</span>
              {neighborSubnets?.has(s) && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", border: "2px solid #3b82f6", marginLeft: 4, flexShrink: 0 }} />
              )}
            </button>
          );
        })}
        {neighborSubnets !== null && (
          <button
            onClick={isFocusedOnNeighbors ? onResetSubnets : onFocusNeighborSubnets}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isFocusedOnNeighbors ? "#1e40af22" : "transparent",
              border: "1px solid " + (isFocusedOnNeighbors ? "#3b82f666" : "#1e293b"),
              borderRadius: 4, padding: "4px 8px", cursor: "pointer",
              transition: "all 0.15s", marginTop: 2,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isFocusedOnNeighbors ? "#3b82f6" : "#334155" }} />
            <span style={{ fontSize: 10, color: isFocusedOnNeighbors ? "#93c5fd" : "#94a3b8" }}>
              {isFocusedOnNeighbors ? "Show all subnets" : "Focus neighbor subnets"}
            </span>
          </button>
        )}
      </div>
      <button
        onClick={onToggleAlarmsOnly}
        style={{
          background: showAlarmsOnly ? "#DC262622" : "#0f172acc",
          backdropFilter: "blur(8px)",
          border: "1px solid " + (showAlarmsOnly ? "#DC262666" : "#1e293b"),
          borderRadius: 8, padding: "6px 10px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: showAlarmsOnly ? "#DC2626" : "#334155" }} />
        <span style={{ fontSize: 10, color: showAlarmsOnly ? "#DC2626" : "#94a3b8" }}>Alarms only</span>
      </button>
      <div style={{ background: "#0f172acc", backdropFilter: "blur(8px)", borderRadius: 8, border: "1px solid #1e293b", padding: "6px 10px" }}>
        <span style={{ fontSize: 9, color: "#475569" }}>
          Showing {visibleNodeCount}/{totalNodeCount} nodes &middot; {visibleEdgeCount} edges
        </span>
      </div>
    </div>
  );
}
