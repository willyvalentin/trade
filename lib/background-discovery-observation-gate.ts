import type { IntradayScanWindow } from "@/lib/intraday-scan-window";

export type BackgroundDiscoveryObservationGateInput = {
  scheduled: boolean;
  marketOpen: boolean;
  scheduledGateWindow: string;
  scanWindow: IntradayScanWindow;
  /**
   * A ready, exact-date Basic Free catalog one-shot is a separate
   * reference-only path. It cannot fall through to normal candidate
   * generation, and is therefore allowed during an official scan window.
   */
  catalogOnlyOneShotReady?: boolean;
};

function isBetweenPublicationWindowsScanWindow(window: IntradayScanWindow) {
  return (
    window === "opening" ||
    window === "morning_momentum" ||
    window === "afternoon"
  );
}

function isCatalogOnlyOneShotScanWindow(window: IntradayScanWindow) {
  return (
    isBetweenPublicationWindowsScanWindow(window) ||
    window === "midday" ||
    window === "power_hour"
  );
}

function isOpenScheduledGateWindow(window: string) {
  return (
    window === "opening" ||
    window === "morning_momentum" ||
    window === "morning" ||
    window === "midday" ||
    window === "afternoon" ||
    window === "power_hour" ||
    window === "outside_window"
  );
}

/**
 * Keeps reference-only discovery observation on its own narrow path. The
 * caller must still enforce its provider-plan, runtime, budget and receipt
 * contracts before any provider request can occur.
 */
export function canObserveBackgroundDiscoveryBetweenPublicationWindows(
  input: BackgroundDiscoveryObservationGateInput,
) {
  if (!input.scheduled || !input.marketOpen) return false;

  if (
    input.catalogOnlyOneShotReady === true &&
    isOpenScheduledGateWindow(input.scheduledGateWindow) &&
    isCatalogOnlyOneShotScanWindow(input.scanWindow)
  ) {
    return true;
  }

  return (
    input.scheduledGateWindow === "outside_window" &&
    isBetweenPublicationWindowsScanWindow(input.scanWindow)
  );
}
