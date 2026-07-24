import type { AvanzaBridgeReadinessSummary } from "@/lib/avanza-bridge-readiness-checklist";

export const tradeExecutionReadOnlySummaryFixture = {
  advisory_count: 0,
  blocked_count: 0,
  label: "Status not connected",
  ready_count: 0,
  severity: "neutral",
  shortCopy:
    "Live Avanza readiness data is not connected. No current system status is available.",
  status: "unknown",
  unknown_count: 12,
} satisfies AvanzaBridgeReadinessSummary;
