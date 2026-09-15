import "server-only";

import {
  observeBasicFreeCatalog,
  type BasicFreeDiscoveryResult,
  type DiscoverBasicFreeCatalogObservationInput,
} from "@/lib/basic-free-discovery";
import type { BasicFreeDiscoveryPreviousAttempt } from "@/lib/basic-free-discovery-policy";
import type { IntradayScanWindow } from "@/lib/intraday-scan-window";

export type BasicFreeDiscoveryBackgroundObservationBlocker =
  | "not_scheduled"
  | "market_not_open"
  | "official_publication_window"
  | "scan_window_not_observable";

export type BasicFreeDiscoveryBackgroundObservationInput = {
  scheduled: boolean;
  marketOpen: boolean;
  outsideOfficialPublicationWindow: boolean;
  scanWindow: IntradayScanWindow;
  ownerUserId: string;
  executionFingerprint: string;
  previousAttempt?: BasicFreeDiscoveryPreviousAttempt | null;
  signal?: AbortSignal;
  observe?: (
    input: DiscoverBasicFreeCatalogObservationInput,
  ) => Promise<BasicFreeDiscoveryResult>;
};

export type BasicFreeDiscoveryBackgroundObservation =
  | {
      status: "not_eligible";
      blocker: BasicFreeDiscoveryBackgroundObservationBlocker;
      discovery: null;
    }
  | {
      status: "observed";
      blocker: null;
      discovery: BasicFreeDiscoveryResult;
    };

/**
 * Default-off catalog observation between official publication windows. It has
 * no path to candidate ranking, recommendation construction, publication, or
 * execution.
 */
export async function observeBasicFreeDiscoveryBetweenPublicationWindows(
  input: BasicFreeDiscoveryBackgroundObservationInput,
): Promise<BasicFreeDiscoveryBackgroundObservation> {
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

  const observe = input.observe ?? observeBasicFreeCatalog;
  const discovery = await observe({
    scanWindow: input.scanWindow,
    ownerUserId: input.ownerUserId,
    executionFingerprint: input.executionFingerprint,
    previousAttempt: input.previousAttempt ?? null,
    signal: input.signal,
  });
  return { status: "observed", blocker: null, discovery };
}
