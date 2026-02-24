import type { AlarmContext } from "@/app/types/network-graph";
import { SEVERITY_COLORS } from "../lib/constants";
import { formatAlarmWindow } from "../lib/helpers";

interface GraphHeaderProps {
  alarmContext: AlarmContext;
  totalNodes: number;
}

export default function GraphHeader({ alarmContext, totalNodes }: GraphHeaderProps) {
  const severityEntries = Object.entries(alarmContext.severity_distribution);
  const alarmWindow = formatAlarmWindow(alarmContext.window_start, alarmContext.window_end);

  return (
    <div
      style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: "linear-gradient(180deg,#0a0f1aee 0%,#0a0f1a00 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626", boxShadow: "0 0 8px #DC262688" }} />
          <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
            5G RAN Network Graph
          </span>
        </div>
        <span style={{ color: "#475569", fontSize: 11 }}>|</span>
        <span style={{ color: "#94a3b8", fontSize: 11 }}>
          {alarmContext.total_alarms} alarms &middot; {totalNodes} gNodeBs &middot; {alarmWindow}
        </span>
        {severityEntries.map(([severity, count]) => (
          <span
            key={severity}
            style={{
              padding: "2px 7px", borderRadius: 3, fontSize: 10, fontWeight: 600,
              background: (SEVERITY_COLORS[severity] || "#64748b") + "22",
              color: SEVERITY_COLORS[severity] || "#64748b",
              border: `1px solid ${(SEVERITY_COLORS[severity] || "#64748b")}44`,
            }}
          >
            {count} {severity}
          </span>
        ))}
      </div>
    </div>
  );
}
