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
            background: "var(--surface-glass)", backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
            borderRadius: 10, border: "1px solid " + (searchTerm ? "hsl(23 90% 54% / 0.3)" : "var(--border)"),
            padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4,
            boxShadow: "var(--panel-shadow)",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 2 }}>
            Search nodes
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Name or ID…"
              style={{
                flex: 1, background: "var(--background)", border: "1px solid var(--border-strong)",
                borderRadius: 6, padding: "4px 8px", color: "var(--text-primary)",
                fontSize: 11, fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
                outline: "none", minWidth: 0,
              }}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                style={{
                  background: "var(--border-strong)", border: "none", borderRadius: 4,
                  color: "var(--text-muted)", cursor: "pointer", padding: "2px 6px",
                  fontSize: 12, lineHeight: 1, flexShrink: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && matchedNodeCount != null && (
            <span style={{ fontSize: 9, color: matchedNodeCount > 0 ? "var(--klabs-accent)" : "#ef4444" }}>
              {matchedNodeCount > 0 ? `${matchedNodeCount} match${matchedNodeCount === 1 ? "" : "es"}` : "No matches"}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          background: "var(--surface-glass)", backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderRadius: 10, border: "1px solid var(--border)",
          padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "var(--panel-shadow)",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 2 }}>
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
                background: activeSubnets.has(s) ? color + "12" : "transparent",
                border: "1px solid " + (activeSubnets.has(s) ? color + "33" : "var(--border)"),
                borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeSubnets.has(s) ? color : color + "44" }} />
              <span style={{ fontSize: 10, color: activeSubnets.has(s) ? "var(--text-primary)" : "var(--text-muted)", fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)" }}>
                {subnetLabel(s)}
              </span>
              <span style={{ fontSize: 9, color: "var(--text-faint)", marginLeft: "auto" }}>{count}</span>
              {neighborSubnets?.has(s) && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", border: "2px solid var(--klabs-accent)", marginLeft: 4, flexShrink: 0 }} />
              )}
            </button>
          );
        })}
        {neighborSubnets !== null && (
          <button
            onClick={isFocusedOnNeighbors ? onResetSubnets : onFocusNeighborSubnets}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isFocusedOnNeighbors ? "hsl(23 90% 54% / 0.08)" : "transparent",
              border: "1px solid " + (isFocusedOnNeighbors ? "hsl(23 90% 54% / 0.25)" : "var(--border)"),
              borderRadius: 6, padding: "4px 8px", cursor: "pointer",
              transition: "all 0.15s", marginTop: 2,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isFocusedOnNeighbors ? "var(--klabs-accent)" : "var(--border-strong)" }} />
            <span style={{ fontSize: 10, color: isFocusedOnNeighbors ? "var(--klabs-accent)" : "var(--text-muted)" }}>
              {isFocusedOnNeighbors ? "Show all subnets" : "Focus neighbor subnets"}
            </span>
          </button>
        )}
      </div>
      <button
        onClick={onToggleAlarmsOnly}
        style={{
          background: showAlarmsOnly ? "#DC262612" : "var(--surface-glass)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          border: "1px solid " + (showAlarmsOnly ? "#DC262633" : "var(--border)"),
          borderRadius: 10, padding: "6px 10px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "var(--panel-shadow)",
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: showAlarmsOnly ? "#DC2626" : "var(--border-strong)" }} />
        <span style={{ fontSize: 10, color: showAlarmsOnly ? "#DC2626" : "var(--text-muted)" }}>Alarms only</span>
      </button>
      <div
        style={{
          background: "var(--surface-glass)", backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderRadius: 10, border: "1px solid var(--border)", padding: "6px 10px",
          boxShadow: "var(--panel-shadow)",
        }}
      >
        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
          Showing {visibleNodeCount}/{totalNodeCount} nodes &middot; {visibleEdgeCount} edges
        </span>
      </div>
    </div>
  );
}
