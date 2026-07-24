import {
  appendDevMockBrokerResultEntries,
  clearDevMockBrokerResultEntries,
  getBrowserExecutionLocalStorage,
  readDevMockBrokerResultEntries,
} from "@/lib/execution-local-storage-helpers";
import type { DevMockBrokerExecutionResult } from "@/lib/mock-broker-execution-result";

export const DEV_MOCK_BROKER_RESULT_STORAGE_KEY =
  "ture_dev_mock_broker_results_v1";
export const MAX_STORED_DEV_MOCK_BROKER_RESULTS = 500;

export type StoredDevMockBrokerExecutionResult = DevMockBrokerExecutionResult;

export type DevMockBrokerResultStoreReadResult = {
  results: StoredDevMockBrokerExecutionResult[];
  discardedCount: number;
  storageAvailable: boolean;
  error: string | null;
};

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readDevMockBrokerResultStore(): DevMockBrokerResultStoreReadResult {
  return readDevMockBrokerResultEntries(getBrowserExecutionLocalStorage());
}

export function readDevMockBrokerResults(): StoredDevMockBrokerExecutionResult[] {
  return readDevMockBrokerResultStore().results;
}

export function readDevMockBrokerResultStoreResult(): DevMockBrokerResultStoreReadResult {
  return readDevMockBrokerResultStore();
}

export function appendDevMockBrokerResult(
  result: StoredDevMockBrokerExecutionResult,
): boolean {
  return appendDevMockBrokerResults([result]);
}

export function appendDevMockBrokerResults(
  results: readonly StoredDevMockBrokerExecutionResult[],
): boolean {
  return appendDevMockBrokerResultEntries(
    getBrowserExecutionLocalStorage(),
    results,
  );
}

export function clearDevMockBrokerResults(): boolean {
  return clearDevMockBrokerResultEntries(getBrowserExecutionLocalStorage());
}

export function getDevMockBrokerResultsForRequest(requestId: string) {
  const normalizedRequestId = optionalString(requestId);

  if (!normalizedRequestId) {
    return [];
  }

  return readDevMockBrokerResults().filter(
    (result) => result.requestId === normalizedRequestId,
  );
}

export function getDevMockBrokerResultsForIntent(intentId: string) {
  const normalizedIntentId = optionalString(intentId);

  if (!normalizedIntentId) {
    return [];
  }

  return readDevMockBrokerResults().filter(
    (result) => result.intentId === normalizedIntentId,
  );
}

export function getDevMockBrokerResultsForPosition(positionId: string) {
  const normalizedPositionId = optionalString(positionId);

  if (!normalizedPositionId) {
    return [];
  }

  return readDevMockBrokerResults().filter(
    (result) => result.positionId === normalizedPositionId,
  );
}

export function getDevMockBrokerResultsForRecommendation(
  recommendationId: string,
) {
  const normalizedRecommendationId = optionalString(recommendationId);

  if (!normalizedRecommendationId) {
    return [];
  }

  return readDevMockBrokerResults().filter(
    (result) => result.recommendationId === normalizedRecommendationId,
  );
}
