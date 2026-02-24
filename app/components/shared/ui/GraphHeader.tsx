import type { AlarmContext } from "@/app/types/network-graph";
import { SEVERITY_COLORS } from "../lib/constants";
import { formatAlarmWindow } from "../lib/helpers";

interface GraphHeaderProps {
  alarmContext: AlarmContext;
  totalNodes: number;
  datasetLabel: string;
}

export default function GraphHeader({ alarmContext, totalNodes, datasetLabel }: GraphHeaderProps) {
  const severityEntries = Object.entries(alarmContext.severity_distribution);
  const alarmWindow = formatAlarmWindow(alarmContext.window_start, alarmContext.window_end);

  return (
    <div
      style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--klabs-accent)", boxShadow: "0 0 8px hsl(23 90% 54% / 0.4)" }} />
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
            {datasetLabel} Graph
          </span>
        </div>
        <span style={{ color: "var(--border-strong)", fontSize: 11 }}>|</span>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          {alarmContext.total_alarms} alarms &middot; {totalNodes} gNodeBs &middot; {alarmWindow}
        </span>
        {severityEntries.map(([severity, count]) => (
          <span
            key={severity}
            style={{
              padding: "2px 7px", borderRadius: 3, fontSize: 10, fontWeight: 600,
              background: (SEVERITY_COLORS[severity] || "#64748b") + "18",
              color: SEVERITY_COLORS[severity] || "#64748b",
              border: `1px solid ${(SEVERITY_COLORS[severity] || "#64748b")}33`,
            }}
          >
            {count} {severity}
          </span>
        ))}
      </div>
    </div>
  );
}
