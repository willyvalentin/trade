import "server-only";

import {
  discoverMarketWideDiscovery,
  type DiscoverMarketWideDiscoveryInput,
  type MarketWideDiscoveryResult,
} from "@/lib/market-wide-discovery";
import type { MarketWideDiscoveryPreviousAttempt } from "@/lib/market-wide-discovery-policy";
import type { IntradayScanWindow } from "@/lib/intraday-scan-window";

export type MarketWideDiscoveryBackgroundObservationBlocker =
  | "not_scheduled"
  | "market_not_open"
  | "official_publication_window"
  | "scan_window_not_observable";

export type MarketWideDiscoveryBackgroundObservationInput = {
  scheduled: boolean;
  marketOpen: boolean;
  outsideOfficialPublicationWindow: boolean;
  scanWindow: IntradayScanWindow;
  selectedBudget: number;
  ownerUserId: string;
  executionFingerprint: string;
  previousAttempt?: MarketWideDiscoveryPreviousAttempt | null;
  signal?: AbortSignal;
  discover?: (
    input: DiscoverMarketWideDiscoveryInput,
  ) => Promise<MarketWideDiscoveryResult>;
};

export type MarketWideDiscoveryBackgroundObservation =
  | {
      status: "not_eligible";
      blocker: MarketWideDiscoveryBackgroundObservationBlocker;
      discovery: null;
    }
  | {
      status: "observed";
      blocker: null;
      discovery: MarketWideDiscoveryResult;
    };

/**
 * Runs only the bounded market-wide intake between official publication
 * windows. It intentionally has no path to candidate ranking, recommendation
 * construction, publication, or execution.
 */
export async function observeMarketWideDiscoveryBetweenPublicationWindows(
  input: MarketWideDiscoveryBackgroundObservationInput,
): Promise<MarketWideDiscoveryBackgroundObservation> {
  if (!input.scheduled) {
    return { status: "not_eligible", blocker: "not_scheduled", discovery: null };
  }

  if (!input.marketOpen) {
    return { status: "not_eligible", blocker: "market_not_open", discovery: null };
  }

  if (!input.outsideOfficialPublicationWindow) {
    return {
      status: "not_eligible",
      blocker: "official_publication_window",
      discovery: null,
    };
  }

  if (
    input.scanWindow !== "opening" &&
    input.scanWindow !== "morning_momentum" &&
    input.scanWindow !== "afternoon"
  ) {
    return {
      status: "not_eligible",
      blocker: "scan_window_not_observable",
      discovery: null,
    };
  }

  const discover = input.discover ?? discoverMarketWideDiscovery;
  const discovery = await discover({
    scanWindow: input.scanWindow,
    selectedBudget: input.selectedBudget,
    ownerUserId: input.ownerUserId,
    executionFingerprint: input.executionFingerprint,
    previousAttempt: input.previousAttempt ?? null,
    signal: input.signal,
  });

  return { status: "observed", blocker: null, discovery };
}
