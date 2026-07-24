import type {
  AvanzaBridgeReadinessSummary,
} from "@/lib/avanza-bridge-readiness-checklist";

export const avanzaTradeReadOnlyReadinessSummaryFixture: AvanzaBridgeReadinessSummary =
  {
    advisory_count: 1,
    blocked_count: 0,
    label: "Ready for read-only observation",
    ready_count: 11,
    severity: "warning",
    shortCopy:
      "Avanza fill-and-stop POC is proven as display-only context. Total-read remains advisory and this is not execution readiness.",
    status: "ready_for_read_only_observation",
    unknown_count: 0,
  };
