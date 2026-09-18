import type { DayTradeScanOrchestrationSummary } from "@/lib/day-trade-scan-orchestration";

export type DayTradeMarketWaitState = {
  is_wait_state: boolean;
  market_is_open: boolean;
  outside_official_publication_window: boolean;
};

const officialPublicationWindows = new Set([
  "morning",
  "midday",
  "power_hour",
]);

export function isOfficialDayTradePublicationWindow(
  window: DayTradeScanOrchestrationSummary["active_window"],
) {
  return officialPublicationWindows.has(window);
}

/**
 * Derives display-only market context from the authoritative market-open flag.
 * It deliberately does not authorize scanning or publication.
 */
export function deriveDayTradeMarketWaitState(
  summary: Pick<
    DayTradeScanOrchestrationSummary,
    "market_is_open" | "active_window"
  >,
): DayTradeMarketWaitState {
  const marketIsOpen = summary.market_is_open === true;

  return {
    is_wait_state: !marketIsOpen,
    market_is_open: marketIsOpen,
    outside_official_publication_window:
      marketIsOpen && !isOfficialDayTradePublicationWindow(summary.active_window),
  };
}
