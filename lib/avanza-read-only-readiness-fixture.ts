import type { AvanzaBridgeReadinessSummary } from "@/lib/avanza-bridge-readiness-checklist";

export const tradeExecutionReadOnlySummaryFixture = {
  advisory_count: 1,
  blocked_count: 0,
  label: "Ready for read-only observation",
  ready_count: 11,
  severity: "warning",
  shortCopy: "Fixture/default summary only for display-only context.",
  status: "ready_for_read_only_observation",
  unknown_count: 0,
} satisfies AvanzaBridgeReadinessSummary;
