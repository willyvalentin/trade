import type { IntradayScanWindow } from "@/lib/intraday-scan-window";

export type BackgroundDiscoveryObservationGateInput = {
  scheduled: boolean;
  marketOpen: boolean;
  scheduledGateWindow: string;
  scanWindow: IntradayScanWindow;
};

/**
 * Keeps reference-only discovery observation on its own narrow path. The
 * caller must still enforce its provider-plan, runtime, budget and receipt
 * contracts before any provider request can occur.
 */
export function canObserveBackgroundDiscoveryBetweenPublicationWindows(
  input: BackgroundDiscoveryObservationGateInput,
) {
  return (
    input.scheduled &&
    input.marketOpen &&
    input.scheduledGateWindow === "outside_window" &&
    (input.scanWindow === "opening" ||
      input.scanWindow === "morning_momentum" ||
      input.scanWindow === "afternoon")
  );
}
