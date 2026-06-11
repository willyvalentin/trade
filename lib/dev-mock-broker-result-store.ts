import {
  validateDevMockBrokerExecutionResult,
  type DevMockBrokerExecutionResult,
} from "@/lib/mock-broker-execution-result";

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

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStoredDevMockBrokerResult(
  value: unknown,
): StoredDevMockBrokerExecutionResult | null {
  const validation = validateDevMockBrokerExecutionResult(
    value as Partial<DevMockBrokerExecutionResult> | null | undefined,
  );

  if (!validation.ok) {
    return null;
  }

  return value as StoredDevMockBrokerExecutionResult;
}

function readDevMockBrokerResultStore(): DevMockBrokerResultStoreReadResult {
  const storage = getStorage();

  if (!storage) {
    return {
      results: [],
      discardedCount: 0,
      storageAvailable: false,
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(
      storage.getItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY) ?? "[]",
    );
    const rawResults = Array.isArray(parsed) ? parsed : [];
    const results = rawResults
      .map(normalizeStoredDevMockBrokerResult)
      .filter(
        (result): result is StoredDevMockBrokerExecutionResult =>
          Boolean(result),
      );

    return {
      results,
      discardedCount: rawResults.length - results.length,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      results: [],
      discardedCount: 0,
      storageAvailable: true,
      error:
        error instanceof Error
          ? error.message
          : "Malformed dev mock broker result store.",
    };
  }
}

function writeDevMockBrokerResults(
  results: readonly StoredDevMockBrokerExecutionResult[],
): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(
      DEV_MOCK_BROKER_RESULT_STORAGE_KEY,
      JSON.stringify(results.slice(-MAX_STORED_DEV_MOCK_BROKER_RESULTS)),
    );
    return true;
  } catch {
    return false;
  }
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
  const currentResults = readDevMockBrokerResults();
  const validResults = results
    .map(normalizeStoredDevMockBrokerResult)
    .filter(
      (result): result is StoredDevMockBrokerExecutionResult =>
        Boolean(result),
    );

  if (validResults.length === 0) {
    return false;
  }

  return writeDevMockBrokerResults([...currentResults, ...validResults]);
}

export function clearDevMockBrokerResults(): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(DEV_MOCK_BROKER_RESULT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
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
