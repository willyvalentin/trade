import {
  buildLocalhostBridgeAdvancedFormFillRequest,
  buildLocalhostBridgeDryRunRequest,
  buildLocalhostBridgeInstrumentPageRequest,
  buildLocalhostBridgeInstrumentVerificationRequest,
  buildLocalhostBridgeOrderPageOpenRequest,
  buildLocalhostBridgeReviewClickRequest,
  buildLocalhostBridgeManualConfirmationWaitRequest,
  buildLocalhostBridgeBrokerConfirmationCaptureRequest,
  buildLocalhostBridgeBrokerExecutionResultEligibilityRequest,
  buildLocalhostBridgeBrokerExecutionResultPreviewRequest,
  buildLocalhostBridgeExecutionRecordEligibilityRequest,
  buildLocalhostBridgeSearchOnlyRequest,
  buildLocalhostBridgeRunRequest,
  DEFAULT_LOCALHOST_BRIDGE_BASE_URL,
  LOCALHOST_BRIDGE_ENDPOINT_PATHS,
  LOCALHOST_BRIDGE_CONTRACT_VERSION,
  validateLocalhostBridgeHealthResponse,
  validateLocalhostBridgeRunnerSelfCheckResponse,
  validateLocalhostBridgeSessionDetectionResponse,
  validateLocalhostBridgeSearchOnlyResponse,
  validateLocalhostBridgeInstrumentPageResponse,
  validateLocalhostBridgeInstrumentVerificationResponse,
  validateLocalhostBridgeAdvancedFormFillResponse,
  validateLocalhostBridgeOrderPageOpenResponse,
  validateLocalhostBridgeReviewClickResponse,
  validateLocalhostBridgeManualConfirmationWaitResponse,
  validateLocalhostBridgeBrokerConfirmationCaptureResponse,
  validateLocalhostBridgeBrokerExecutionResultEligibilityResponse,
  validateLocalhostBridgeBrokerExecutionResultPreviewResponse,
  validateLocalhostBridgeExecutionRecordEligibilityResponse,
  validateLocalhostBridgeCancelResponse,
  validateLocalhostBridgeDryRunResponse,
  validateLocalhostBridgeRunResponse,
  type LocalhostBridgeCancelResponse,
  type LocalhostBridgeAdvancedFormFillResponse,
  type LocalhostBridgeDryRunResponse,
  type LocalhostBridgeDryRunStatus,
  type LocalhostBridgeHealthResponse,
  type LocalhostBridgeInstrumentPageResponse,
  type LocalhostBridgeInstrumentVerificationResponse,
  type LocalhostBridgeOrderPageOpenResponse,
  type LocalhostBridgeReviewClickResponse,
  type LocalhostBridgeManualConfirmationWaitResponse,
  type LocalhostBridgeBrokerConfirmationCaptureResponse,
  type LocalhostBridgeBrokerExecutionResultEligibilityResponse,
  type LocalhostBridgeBrokerExecutionResultPreviewResponse,
  type LocalhostBridgeExecutionRecordEligibilityResponse,
  type LocalhostBridgeRunnerSelfCheckResponse,
  type LocalhostBridgeRunResponse,
  type LocalhostBridgeSearchOnlyResponse,
  type LocalhostBridgeSessionDetectionResponse,
} from "@/lib/avanza-localhost-bridge-contract";
import type { AvanzaAgentRequest, AvanzaAgentResult } from "@/lib/avanza-agent-adapter";
import type { AvanzaAgentBridgeEnvelope } from "@/lib/avanza-agent-bridge";
import type { AvanzaDryRunOrderInput } from "@/lib/avanza-dry-run-request-contract";
import {
  summarizeAvanzaSessionDetectionResult,
  type AvanzaSessionDetectionStatus,
} from "@/lib/avanza-session-detection-contract";
import {
  summarizeAvanzaSearchOnlyResult,
  type AvanzaSearchOnlyExpectedInstrument,
  type AvanzaSearchOnlyCandidate,
  type AvanzaSearchOnlyResult,
  type AvanzaSearchOnlyStatus,
} from "@/lib/avanza-search-only-result-contract";
import {
  summarizeAvanzaInstrumentVerificationResult,
  type AvanzaInstrumentVerificationStatus,
} from "@/lib/avanza-instrument-verification-contract";
import {
  summarizeAvanzaInstrumentPageResult,
  type AvanzaInstrumentPageIdentity,
  type AvanzaInstrumentPageResult,
  type AvanzaInstrumentPageStatus,
} from "@/lib/avanza-instrument-page-contract";
import {
  summarizeAvanzaOrderPageOpenResult,
  type AvanzaOrderPageIdentity,
  type AvanzaOrderPageOpenAction,
  type AvanzaOrderPageOpenStatus,
} from "@/lib/avanza-order-page-open-contract";
import {
  summarizeAvanzaAdvancedFormFillResult,
  type AvanzaAdvancedFormFillResult,
  type AvanzaAdvancedFormFillStatus,
  type AvanzaAdvancedFormState,
} from "@/lib/avanza-advanced-form-fill-contract";
import {
  summarizeAvanzaReviewClickResult,
  type AvanzaConfirmationModalReadback,
  type AvanzaReviewClickResult,
  type AvanzaReviewClickStatus,
} from "@/lib/avanza-review-click-contract";
import {
  summarizeAvanzaManualConfirmationWaitResult,
  type AvanzaManualConfirmationWaitObservation,
  type AvanzaManualConfirmationWaitResult,
  type AvanzaManualConfirmationWaitStatus,
} from "@/lib/avanza-manual-confirmation-wait-contract";
import {
  summarizeAvanzaBrokerConfirmationCaptureResult,
  type AvanzaBrokerConfirmationCaptureStatus,
  type AvanzaBrokerConfirmationCaptureResult,
  type AvanzaBrokerConfirmationReadback,
} from "@/lib/avanza-broker-confirmation-capture-contract";
import {
  summarizeAvanzaBrokerExecutionResultEligibility,
  type AvanzaBrokerExecutionResultEligibilityOptions,
  type AvanzaBrokerExecutionResultEligibilityStatus,
  type AvanzaBrokerExecutionResultEligibilityResult,
} from "@/lib/avanza-broker-execution-result-eligibility";
import {
  summarizeAvanzaBrokerExecutionResultPreview,
  type AvanzaBrokerExecutionResultPreviewStatus,
} from "@/lib/avanza-broker-execution-result-preview";
import {
  summarizeExecutionRecordEligibility,
  type ExecutionRecordCandidate,
  type ExecutionRecordEligibilityOptions,
  type ExecutionRecordEligibilityStatus,
} from "@/lib/execution-record-eligibility";
import type { BrowserRunnerCapabilityValidationOptions } from "@/lib/browser-runner-capability-gate";

export type LocalhostBridgeClientHealthCheckResult = {
  ok: boolean;
  reachable: boolean;
  statusCode?: number;
  response?: LocalhostBridgeHealthResponse;
  errors: string[];
  warnings: string[];
  checkedAt: string;
  baseUrl: string;
};

export type LocalhostBridgeClientRunnerSelfCheckResult = {
  ok: boolean;
  reachable: boolean;
  statusCode?: number;
  response?: LocalhostBridgeRunnerSelfCheckResponse;
  errors: string[];
  warnings: string[];
  checkedAt: string;
  baseUrl: string;
};

export type LocalhostBridgeClientSessionDetectionResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaSessionDetectionStatus;
  statusCode?: number;
  response?: LocalhostBridgeSessionDetectionResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientSearchOnlyResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaSearchOnlyStatus;
  statusCode?: number;
  response?: LocalhostBridgeSearchOnlyResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientInstrumentVerificationResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaInstrumentVerificationStatus;
  statusCode?: number;
  response?: LocalhostBridgeInstrumentVerificationResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientInstrumentPageResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaInstrumentPageStatus;
  statusCode?: number;
  response?: LocalhostBridgeInstrumentPageResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientOrderPageOpenResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaOrderPageOpenStatus;
  statusCode?: number;
  response?: LocalhostBridgeOrderPageOpenResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientAdvancedFormFillResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaAdvancedFormFillStatus;
  statusCode?: number;
  response?: LocalhostBridgeAdvancedFormFillResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientReviewClickResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaReviewClickStatus;
  statusCode?: number;
  response?: LocalhostBridgeReviewClickResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientManualConfirmationWaitResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaManualConfirmationWaitStatus;
  statusCode?: number;
  response?: LocalhostBridgeManualConfirmationWaitResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientBrokerConfirmationCaptureResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaBrokerConfirmationCaptureStatus;
  statusCode?: number;
  response?: LocalhostBridgeBrokerConfirmationCaptureResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientBrokerExecutionResultEligibilityResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaBrokerExecutionResultEligibilityStatus;
  statusCode?: number;
  response?: LocalhostBridgeBrokerExecutionResultEligibilityResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientBrokerExecutionResultPreviewResult = {
  ok: boolean;
  reachable: boolean;
  status?: AvanzaBrokerExecutionResultPreviewStatus;
  statusCode?: number;
  response?: LocalhostBridgeBrokerExecutionResultPreviewResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientExecutionRecordEligibilityResult = {
  ok: boolean;
  reachable: boolean;
  status?: ExecutionRecordEligibilityStatus;
  statusCode?: number;
  response?: LocalhostBridgeExecutionRecordEligibilityResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type LocalhostBridgeClientAvanzaDryRunStubResult = {
  ok: boolean;
  reachable: boolean;
  status?: LocalhostBridgeDryRunStatus;
  statusCode?: number;
  response?: LocalhostBridgeDryRunResponse;
  summary: string;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
  elapsedMs: number;
};

export type CheckLocalhostBridgeHealthOptions = {
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeRunnerSelfCheckOptions = {
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeSessionDetectionOptions = {
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeSearchOnlyOptions = {
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  requestId?: string | null;
  createdAt?: string | null;
  sessionDetection?: LocalhostBridgeSessionDetectionResponse["sessionDetection"] | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeInstrumentVerificationOptions = {
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  requestId?: string | null;
  createdAt?: string | null;
  searchOnlyResult?: AvanzaSearchOnlyResult | null;
  selectedCandidate?: AvanzaSearchOnlyCandidate | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeInstrumentPageOptions = {
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  requestId?: string | null;
  createdAt?: string | null;
  instrumentVerificationResult?: LocalhostBridgeInstrumentVerificationResponse["instrumentVerification"] | null;
  pageIdentity?: AvanzaInstrumentPageIdentity | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type LocalhostBridgeClientRunResult = {
  ok: boolean;
  reachable: boolean;
  statusCode?: number;
  response?: LocalhostBridgeRunResponse;
  result?: AvanzaAgentResult;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
};

export type LocalhostBridgeClientCancelResult = {
  ok: boolean;
  reachable: boolean;
  statusCode?: number;
  response?: LocalhostBridgeCancelResponse;
  cancelled?: boolean;
  errors: string[];
  warnings: string[];
  completedAt: string;
  baseUrl: string;
};

export type RunLocalhostBridgeDryRunOptions = {
  envelope: AvanzaAgentBridgeEnvelope;
  request: AvanzaAgentRequest;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  enableMockAgentRun?: boolean | null;
  mockPageBaseUrl?: string | null;
  mockAgentHeaded?: boolean | null;
  metadata?: Record<string, unknown> | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeOrderPageOpenOptions = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  requestId?: string | null;
  createdAt?: string | null;
  instrumentPageResult?: AvanzaInstrumentPageResult | null;
  orderPageIdentity?: AvanzaOrderPageIdentity | null;
  attemptedAction?: AvanzaOrderPageOpenAction | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeAdvancedFormFillOptions = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  requestId?: string | null;
  createdAt?: string | null;
  orderPageOpenResult?: LocalhostBridgeOrderPageOpenResponse["orderPageOpen"] | null;
  formState?: AvanzaAdvancedFormState | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeReviewClickOptions = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  requestId?: string | null;
  createdAt?: string | null;
  advancedFormFillResult?: AvanzaAdvancedFormFillResult | null;
  confirmationReadback?: AvanzaConfirmationModalReadback | null;
  reviewClickAttempted?: boolean | null;
  reviewLabel?: string | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeManualConfirmationWaitOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  reviewClickResult?: AvanzaReviewClickResult | null;
  observation?: AvanzaManualConfirmationWaitObservation | null;
  timeoutMs?: number | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  requestTimeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeBrokerConfirmationCaptureOptions = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  requestId?: string | null;
  createdAt?: string | null;
  manualConfirmationWaitResult?: AvanzaManualConfirmationWaitResult | null;
  brokerConfirmationReadback?: AvanzaBrokerConfirmationReadback | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeBrokerExecutionResultEligibilityOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  captureResult?: AvanzaBrokerConfirmationCaptureResult | null;
  existingFingerprints?: string[] | null;
  options?: AvanzaBrokerExecutionResultEligibilityOptions | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeBrokerExecutionResultPreviewOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  captureResult?: AvanzaBrokerConfirmationCaptureResult | null;
  eligibilityResult?: AvanzaBrokerExecutionResultEligibilityResult | null;
  existingFingerprints?: string[] | null;
  options?: AvanzaBrokerExecutionResultEligibilityOptions | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CheckLocalhostBridgeExecutionRecordEligibilityOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  candidate?: ExecutionRecordCandidate | null;
  existingSourceFingerprints?: string[] | null;
  existingBrokerReferences?: string[] | null;
  options?: ExecutionRecordEligibilityOptions | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type RunLocalhostBridgeAvanzaDryRunStubOptions = {
  dryRunOrderInput: AvanzaDryRunOrderInput;
  requestId?: string | null;
  createdAt?: string | null;
  capabilityValidationOptions?: BrowserRunnerCapabilityValidationOptions | null;
  metadata?: Record<string, unknown> | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

export type CancelLocalhostBridgeRunOptions = {
  requestId: string | null | undefined;
  reason?: string | null;
  baseUrl?: string | null;
  timeoutMs?: number | null;
  fetchFn?: typeof fetch | null;
};

const DEFAULT_LOCALHOST_BRIDGE_HEALTH_TIMEOUT_MS = 2000;
const DEFAULT_LOCALHOST_BRIDGE_RUN_TIMEOUT_MS = 5000;
const DEFAULT_LOCALHOST_BRIDGE_AVANZA_DRY_RUN_TIMEOUT_MS = 3000;
const DEFAULT_LOCALHOST_BRIDGE_CANCEL_TIMEOUT_MS = 3000;

function normalizeBaseUrl(value: string | null | undefined): string {
  const baseUrl =
    typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : DEFAULT_LOCALHOST_BRIDGE_BASE_URL;

  return baseUrl.replace(/\/+$/, "");
}

function normalizeTimeoutMs(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_LOCALHOST_BRIDGE_HEALTH_TIMEOUT_MS;
}

function buildResult(
  input: Omit<LocalhostBridgeClientHealthCheckResult, "checkedAt" | "baseUrl"> & {
    baseUrl: string;
  },
): LocalhostBridgeClientHealthCheckResult {
  return {
    ...input,
    checkedAt: new Date().toISOString(),
  };
}

function buildSelfCheckResult(
  input: Omit<
    LocalhostBridgeClientRunnerSelfCheckResult,
    "checkedAt" | "baseUrl"
  > & {
    baseUrl: string;
  },
): LocalhostBridgeClientRunnerSelfCheckResult {
  return {
    ...input,
    checkedAt: new Date().toISOString(),
  };
}

function buildSessionDetectionResult(
  input: Omit<
    LocalhostBridgeClientSessionDetectionResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientSessionDetectionResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildSearchOnlyResult(
  input: Omit<
    LocalhostBridgeClientSearchOnlyResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientSearchOnlyResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildInstrumentVerificationResult(
  input: Omit<
    LocalhostBridgeClientInstrumentVerificationResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientInstrumentVerificationResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildInstrumentPageResult(
  input: Omit<
    LocalhostBridgeClientInstrumentPageResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientInstrumentPageResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildOrderPageOpenResult(
  input: Omit<
    LocalhostBridgeClientOrderPageOpenResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientOrderPageOpenResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildAdvancedFormFillResult(
  input: Omit<
    LocalhostBridgeClientAdvancedFormFillResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientAdvancedFormFillResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildReviewClickResult(
  input: Omit<
    LocalhostBridgeClientReviewClickResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientReviewClickResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildManualConfirmationWaitResult(
  input: Omit<
    LocalhostBridgeClientManualConfirmationWaitResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientManualConfirmationWaitResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildBrokerConfirmationCaptureResult(
  input: Omit<
    LocalhostBridgeClientBrokerConfirmationCaptureResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientBrokerConfirmationCaptureResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildBrokerExecutionResultEligibilityResult(
  input: Omit<
    LocalhostBridgeClientBrokerExecutionResultEligibilityResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientBrokerExecutionResultEligibilityResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildBrokerExecutionResultPreviewResult(
  input: Omit<
    LocalhostBridgeClientBrokerExecutionResultPreviewResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientBrokerExecutionResultPreviewResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildExecutionRecordEligibilityResult(
  input: Omit<
    LocalhostBridgeClientExecutionRecordEligibilityResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientExecutionRecordEligibilityResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildRunResult(
  input: Omit<LocalhostBridgeClientRunResult, "completedAt" | "baseUrl"> & {
    baseUrl: string;
  },
): LocalhostBridgeClientRunResult {
  return {
    ...input,
    completedAt: new Date().toISOString(),
  };
}

function buildAvanzaDryRunStubResult(
  input: Omit<
    LocalhostBridgeClientAvanzaDryRunStubResult,
    "completedAt" | "baseUrl" | "elapsedMs"
  > & {
    baseUrl: string;
    startedAt: number;
  },
): LocalhostBridgeClientAvanzaDryRunStubResult {
  const completedAt = new Date().toISOString();
  const { startedAt, ...result } = input;

  return {
    ...result,
    completedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
  };
}

function buildCancelResult(
  input: Omit<LocalhostBridgeClientCancelResult, "completedAt" | "baseUrl"> & {
    baseUrl: string;
  },
): LocalhostBridgeClientCancelResult {
  return {
    ...input,
    completedAt: new Date().toISOString(),
  };
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function summarizeLocalhostDryRunBridgeResponse(
  response: LocalhostBridgeDryRunResponse | null | undefined,
) {
  if (!response) {
    return "Dry-run bridge unavailable.";
  }

  if (response.status === "not_implemented") {
    return "Dry-run bridge accepted request but no runner is implemented. No browser actions were executed.";
  }

  if (response.status === "unavailable") {
    return "Dry-run bridge unavailable. No browser actions were executed.";
  }

  if (response.status === "blocked") {
    return "Dry-run bridge blocked unsafe request. No browser actions were executed and no broker submission was performed.";
  }

  if (response.status === "accepted_stub") {
    return "Dry-run bridge accepted a non-executing stub response. No browser actions were executed.";
  }

  return "Dry-run bridge failed safely. No browser actions were executed.";
}

export function summarizeLocalhostSessionDetectionBridgeResponse(
  response: LocalhostBridgeSessionDetectionResponse | null | undefined,
) {
  if (!response) {
    return "Session detection bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaSessionDetectionResult(
    response.sessionDetection,
  )} No browser actions were executed. No Avanza page was touched.`;
}

export function summarizeLocalhostSearchOnlyBridgeResponse(
  response: LocalhostBridgeSearchOnlyResponse | null | undefined,
) {
  if (!response) {
    return "Search-only bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaSearchOnlyResult(
    response.searchOnly,
  )} No browser actions were executed. No Avanza page was touched. No order page was opened.`;
}

export function summarizeLocalhostInstrumentVerificationBridgeResponse(
  response: LocalhostBridgeInstrumentVerificationResponse | null | undefined,
) {
  if (!response) {
    return "Instrument verification bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaInstrumentVerificationResult(
    response.instrumentVerification,
  )} No browser actions were executed. No Avanza page was touched. No order page was opened.`;
}

export function summarizeLocalhostInstrumentPageBridgeResponse(
  response: LocalhostBridgeInstrumentPageResponse | null | undefined,
) {
  if (!response) {
    return "Instrument page bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaInstrumentPageResult(
    response.instrumentPage,
  )} No browser actions were executed. No Avanza page was touched. No order page was opened.`;
}

export function summarizeLocalhostOrderPageOpenBridgeResponse(
  response: LocalhostBridgeOrderPageOpenResponse | null | undefined,
) {
  if (!response) {
    return "Order-page-open bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaOrderPageOpenResult(
    response.orderPageOpen,
  )} No browser actions were executed. No Avanza page was touched. No form fields were filled.`;
}

export function summarizeLocalhostAdvancedFormFillBridgeResponse(
  response: LocalhostBridgeAdvancedFormFillResponse | null | undefined,
) {
  if (!response) {
    return "Advanced form-fill bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaAdvancedFormFillResult(
    response.advancedFormFill,
  )} No browser actions were executed. No Avanza page was touched. No real form fields were filled. No broker submission occurred.`;
}

export function summarizeLocalhostReviewClickBridgeResponse(
  response: LocalhostBridgeReviewClickResponse | null | undefined,
) {
  if (!response) {
    return "Review-click bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaReviewClickResult(
    response.reviewClick,
  )} No browser actions were executed. No Avanza page was touched. No real Granska was clicked. No Bekräfta was clicked. No broker result was created.`;
}

export function summarizeLocalhostManualConfirmationWaitBridgeResponse(
  response: LocalhostBridgeManualConfirmationWaitResponse | null | undefined,
) {
  if (!response) {
    return "Manual confirmation wait bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaManualConfirmationWaitResult(
    response.manualConfirmationWait,
  )} No browser actions were executed. No Avanza page was touched. No Bekräfta was clicked. No broker result was created. No trade mutation occurred.`;
}

export function summarizeLocalhostBrokerConfirmationCaptureBridgeResponse(
  response: LocalhostBridgeBrokerConfirmationCaptureResponse | null | undefined,
) {
  if (!response) {
    return "Broker confirmation capture bridge unavailable. No browser actions were executed.";
  }

  return `${summarizeAvanzaBrokerConfirmationCaptureResult(
    response.brokerConfirmationCapture,
  )} No browser actions were executed. No Avanza page was touched. No Bekräfta was clicked by the agent. No BrokerExecutionResult was created. No execution record was created. No Supabase write occurred. No trade mutation occurred.`;
}

export function summarizeLocalhostBrokerExecutionResultEligibilityBridgeResponse(
  response:
    | LocalhostBridgeBrokerExecutionResultEligibilityResponse
    | null
    | undefined,
) {
  if (!response) {
    return "BrokerExecutionResult eligibility bridge unavailable. No BrokerExecutionResult was created.";
  }

  return `${summarizeAvanzaBrokerExecutionResultEligibility(
    response.eligibility,
  )} Eligibility check only. No execution record was created. No Supabase write occurred. No trade mutation occurred.`;
}

export function summarizeLocalhostBrokerExecutionResultPreviewBridgeResponse(
  response:
    | LocalhostBridgeBrokerExecutionResultPreviewResponse
    | null
    | undefined,
) {
  if (!response) {
    return "BrokerExecutionResult preview bridge unavailable. No real BrokerExecutionResult was created.";
  }

  return `${summarizeAvanzaBrokerExecutionResultPreview(
    response.brokerExecutionResultPreview,
  )} Preview only. No execution record was created. No Supabase write occurred. No trade mutation occurred.`;
}

export function summarizeLocalhostExecutionRecordEligibilityBridgeResponse(
  response:
    | LocalhostBridgeExecutionRecordEligibilityResponse
    | null
    | undefined,
) {
  if (!response) {
    return "Execution record eligibility bridge unavailable. No execution record was created.";
  }

  return `${summarizeExecutionRecordEligibility(
    response.executionRecordEligibility,
  )} Eligibility check only. No BrokerExecutionResult was created. No execution record was created. No Supabase write occurred. No trade mutation occurred.`;
}

export async function checkLocalhostBridgeHealth(
  options: CheckLocalhostBridgeHealthOptions = {},
): Promise<LocalhostBridgeClientHealthCheckResult> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.health}`,
      {
        method: "GET",
        cache: "no-store",
        signal: controller?.signal,
      },
    );
    const parsed = await parseJsonResponse(response);
    const validation = validateLocalhostBridgeHealthResponse(
      parsed as Partial<LocalhostBridgeHealthResponse> | null | undefined,
    );
    const errors = [...validation.errors];

    if (!response.ok) {
      errors.unshift(`Localhost bridge health returned HTTP ${response.status}.`);
    }

    return buildResult({
      ok: response.ok && validation.ok,
      reachable: true,
      statusCode: response.status,
      response: validation.ok
        ? (parsed as LocalhostBridgeHealthResponse)
        : undefined,
      errors,
      warnings: validation.warnings,
      baseUrl,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        timedOut
          ? `Localhost bridge health check timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge health check failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeRunnerSelfCheck(
  options: CheckLocalhostBridgeRunnerSelfCheckOptions = {},
): Promise<LocalhostBridgeClientRunnerSelfCheckResult> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildSelfCheckResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.selfCheck}`,
      {
        method: "GET",
        cache: "no-store",
        signal: controller?.signal,
      },
    );
    const parsed = await parseJsonResponse(response);
    const validation = validateLocalhostBridgeRunnerSelfCheckResponse(
      parsed as
        | Partial<LocalhostBridgeRunnerSelfCheckResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeRunnerSelfCheckResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok) {
      errors.unshift(
        `Localhost bridge runner self-check returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    return buildSelfCheckResult({
      ok: response.ok && validation.ok && responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      response: responseBody,
      errors,
      warnings,
      baseUrl,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildSelfCheckResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        timedOut
          ? `Localhost bridge runner self-check timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge runner self-check failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeSessionDetection(
  options: CheckLocalhostBridgeSessionDetectionOptions = {},
): Promise<LocalhostBridgeClientSessionDetectionResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildSessionDetectionResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary:
        "Session detection bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.sessionDetection}`,
      {
        method: "GET",
        cache: "no-store",
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildSessionDetectionResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        summary: "Session detection bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge session detection returned invalid JSON: ${error.message}`
            : "Localhost bridge session detection returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeSessionDetectionResponse(
      parsed as
        | Partial<LocalhostBridgeSessionDetectionResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeSessionDetectionResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge session detection returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge session detection returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge session detection returned brokerResult unexpectedly.",
      );
    }

    return buildSessionDetectionResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.sessionDetection.status,
      response: responseBody,
      summary: summarizeLocalhostSessionDetectionBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildSessionDetectionResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary: timedOut
        ? "Session detection bridge timed out. No browser actions were executed."
        : "Session detection bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge session detection timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge session detection failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeSearchOnly(
  options: CheckLocalhostBridgeSearchOnlyOptions,
): Promise<LocalhostBridgeClientSearchOnlyResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildSearchOnlyResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary:
        "Search-only bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeSearchOnlyRequest>;

  try {
    body = buildLocalhostBridgeSearchOnlyRequest(options.expectedInstrument, {
      requestId: options.requestId ?? undefined,
      createdAt: options.createdAt ?? undefined,
      sessionDetection: options.sessionDetection ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        local_diagnostics_only: true,
        search_only_stub_check: true,
        no_browser_actions_requested: true,
        no_avanza_session: true,
        no_order_page: true,
        no_buy_sell_click: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_trade_mutation: true,
      },
    });
  } catch (error) {
    return buildSearchOnlyResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: "Search-only bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge search-only request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.searchOnly}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildSearchOnlyResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary: "Search-only bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge search-only returned invalid JSON: ${error.message}`
            : "Localhost bridge search-only returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeSearchOnlyResponse(
      parsed as Partial<LocalhostBridgeSearchOnlyResponse> | null | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeSearchOnlyResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge search-only returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge search-only returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge search-only returned brokerResult unexpectedly.",
      );
    }

    return buildSearchOnlyResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.searchOnly.status ?? "failed",
      response: responseBody,
      summary: summarizeLocalhostSearchOnlyBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildSearchOnlyResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Search-only bridge timed out. No browser actions were executed."
        : "Search-only bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge search-only timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge search-only failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeInstrumentVerification(
  options: CheckLocalhostBridgeInstrumentVerificationOptions,
): Promise<LocalhostBridgeClientInstrumentVerificationResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildInstrumentVerificationResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary:
        "Instrument verification bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeInstrumentVerificationRequest>;

  try {
    body = buildLocalhostBridgeInstrumentVerificationRequest(
      options.expectedInstrument,
      {
        requestId: options.requestId ?? undefined,
        createdAt: options.createdAt ?? undefined,
        searchOnlyResult: options.searchOnlyResult ?? undefined,
        selectedCandidate: options.selectedCandidate ?? undefined,
        metadata: {
          ...(options.metadata ?? {}),
          local_diagnostics_only: true,
          instrument_verification_stub_check: true,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_order_page: true,
          no_buy_sell_click: true,
          no_form_fill: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      },
    );
  } catch (error) {
    return buildInstrumentVerificationResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "Instrument verification bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge instrument verification request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.instrumentVerification}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildInstrumentVerificationResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary:
          "Instrument verification bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge instrument verification returned invalid JSON: ${error.message}`
            : "Localhost bridge instrument verification returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeInstrumentVerificationResponse(
      parsed as
        | Partial<LocalhostBridgeInstrumentVerificationResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeInstrumentVerificationResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge instrument verification returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge instrument verification returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge instrument verification returned brokerResult unexpectedly.",
      );
    }

    return buildInstrumentVerificationResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.instrumentVerification.status ?? "failed",
      response: responseBody,
      summary:
        summarizeLocalhostInstrumentVerificationBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildInstrumentVerificationResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Instrument verification bridge timed out. No browser actions were executed."
        : "Instrument verification bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge instrument verification timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge instrument verification failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeInstrumentPage(
  options: CheckLocalhostBridgeInstrumentPageOptions,
): Promise<LocalhostBridgeClientInstrumentPageResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildInstrumentPageResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary:
        "Instrument page bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeInstrumentPageRequest>;

  try {
    body = buildLocalhostBridgeInstrumentPageRequest(
      options.expectedInstrument,
      {
        requestId: options.requestId ?? undefined,
        createdAt: options.createdAt ?? undefined,
        instrumentVerificationResult:
          options.instrumentVerificationResult ?? undefined,
        pageIdentity: options.pageIdentity ?? undefined,
        metadata: {
          ...(options.metadata ?? {}),
          local_diagnostics_only: true,
          instrument_page_stub_check: true,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_order_page: true,
          no_buy_sell_click: true,
          no_form_fill: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      },
    );
  } catch (error) {
    return buildInstrumentPageResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: "Instrument page bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge instrument page request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.instrumentPage}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildInstrumentPageResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary: "Instrument page bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge instrument page returned invalid JSON: ${error.message}`
            : "Localhost bridge instrument page returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeInstrumentPageResponse(
      parsed as
        | Partial<LocalhostBridgeInstrumentPageResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeInstrumentPageResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge instrument page returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge instrument page returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge instrument page returned brokerResult unexpectedly.",
      );
    }

    return buildInstrumentPageResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.instrumentPage.status ?? "failed",
      response: responseBody,
      summary: summarizeLocalhostInstrumentPageBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildInstrumentPageResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Instrument page bridge timed out. No browser actions were executed."
        : "Instrument page bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge instrument page timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge instrument page failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeOrderPageOpen(
  options: CheckLocalhostBridgeOrderPageOpenOptions,
): Promise<LocalhostBridgeClientOrderPageOpenResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildOrderPageOpenResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary:
        "Order-page-open bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeOrderPageOpenRequest>;

  try {
    body = buildLocalhostBridgeOrderPageOpenRequest(
      options.dryRunOrderInput,
      {
        requestId: options.requestId ?? undefined,
        createdAt: options.createdAt ?? undefined,
        instrumentPageResult: options.instrumentPageResult ?? undefined,
        orderPageIdentity: options.orderPageIdentity ?? undefined,
        attemptedAction: options.attemptedAction ?? undefined,
        metadata: {
          ...(options.metadata ?? {}),
          local_diagnostics_only: true,
          order_page_open_stub_check: true,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_real_order_page_opened: true,
          no_form_fill: true,
          no_review_click: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      },
    );
  } catch (error) {
    return buildOrderPageOpenResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: "Order-page-open bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge order-page-open request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.orderPageOpen}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildOrderPageOpenResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary: "Order-page-open bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge order-page-open returned invalid JSON: ${error.message}`
            : "Localhost bridge order-page-open returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeOrderPageOpenResponse(
      parsed as
        | Partial<LocalhostBridgeOrderPageOpenResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeOrderPageOpenResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge order-page-open returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge order-page-open returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge order-page-open returned brokerResult unexpectedly.",
      );
    }

    return buildOrderPageOpenResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.orderPageOpen.status ?? "failed",
      response: responseBody,
      summary: summarizeLocalhostOrderPageOpenBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildOrderPageOpenResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Order-page-open bridge timed out. No browser actions were executed."
        : "Order-page-open bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge order-page-open timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge order-page-open failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeAdvancedFormFill(
  options: CheckLocalhostBridgeAdvancedFormFillOptions,
): Promise<LocalhostBridgeClientAdvancedFormFillResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildAdvancedFormFillResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary:
        "Advanced form-fill bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeAdvancedFormFillRequest>;

  try {
    body = buildLocalhostBridgeAdvancedFormFillRequest(
      options.dryRunOrderInput,
      {
        requestId: options.requestId ?? undefined,
        createdAt: options.createdAt ?? undefined,
        orderPageOpenResult: options.orderPageOpenResult ?? undefined,
        formState: options.formState ?? undefined,
        metadata: {
          ...(options.metadata ?? {}),
          local_diagnostics_only: true,
          advanced_form_fill_stub_check: true,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_avanza_page_touched: true,
          no_real_form_fields_filled: true,
          no_review_click: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      },
    );
  } catch (error) {
    return buildAdvancedFormFillResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: "Advanced form-fill bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge advanced form-fill request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.advancedFormFill}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildAdvancedFormFillResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary: "Advanced form-fill bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge advanced form-fill returned invalid JSON: ${error.message}`
            : "Localhost bridge advanced form-fill returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeAdvancedFormFillResponse(
      parsed as
        | Partial<LocalhostBridgeAdvancedFormFillResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeAdvancedFormFillResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge advanced form-fill returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge advanced form-fill returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge advanced form-fill returned brokerResult unexpectedly.",
      );
    }

    return buildAdvancedFormFillResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.advancedFormFill.status ?? "failed",
      response: responseBody,
      summary: summarizeLocalhostAdvancedFormFillBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildAdvancedFormFillResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Advanced form-fill bridge timed out. No browser actions were executed."
        : "Advanced form-fill bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge advanced form-fill timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge advanced form-fill failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeReviewClick(
  options: CheckLocalhostBridgeReviewClickOptions,
): Promise<LocalhostBridgeClientReviewClickResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildReviewClickResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      summary:
        "Review-click bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeReviewClickRequest>;

  try {
    body = buildLocalhostBridgeReviewClickRequest(options.dryRunOrderInput, {
      requestId: options.requestId ?? undefined,
      createdAt: options.createdAt ?? undefined,
      advancedFormFillResult: options.advancedFormFillResult ?? undefined,
      confirmationReadback: options.confirmationReadback ?? undefined,
      reviewClickAttempted: options.reviewClickAttempted ?? undefined,
      reviewLabel: options.reviewLabel ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        local_diagnostics_only: true,
        review_click_stub_check: true,
        no_browser_actions_requested: true,
        no_avanza_session: true,
        no_avanza_page_touched: true,
        no_real_granska_clicked: true,
        no_bekrafta_clicked: true,
        no_broker_submission: true,
        no_broker_result_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    });
  } catch (error) {
    return buildReviewClickResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: "Review-click bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge review-click request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.reviewClick}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildReviewClickResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary: "Review-click bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge review-click returned invalid JSON: ${error.message}`
            : "Localhost bridge review-click returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeReviewClickResponse(
      parsed as Partial<LocalhostBridgeReviewClickResponse> | null | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeReviewClickResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge review-click returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge review-click returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge review-click returned brokerResult unexpectedly.",
      );
    }

    return buildReviewClickResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.reviewClick.status ?? "failed",
      response: responseBody,
      summary: summarizeLocalhostReviewClickBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildReviewClickResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Review-click bridge timed out. No browser actions were executed."
        : "Review-click bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge review-click timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge review-click failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeManualConfirmationWait(
  options: CheckLocalhostBridgeManualConfirmationWaitOptions = {},
): Promise<LocalhostBridgeClientManualConfirmationWaitResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.requestTimeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildManualConfirmationWaitResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "Manual confirmation wait bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeManualConfirmationWaitRequest>;

  try {
    body = buildLocalhostBridgeManualConfirmationWaitRequest({
      requestId: options.requestId ?? undefined,
      createdAt: options.createdAt ?? undefined,
      reviewClickResult: options.reviewClickResult ?? undefined,
      observation: options.observation ?? undefined,
      timeoutMs: options.timeoutMs ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        local_diagnostics_only: true,
        manual_confirmation_wait_stub_check: true,
        no_browser_actions_requested: true,
        no_avanza_session: true,
        no_avanza_page_touched: true,
        no_bekrafta_clicked: true,
        no_broker_result_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    });
  } catch (error) {
    return buildManualConfirmationWaitResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "Manual confirmation wait bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge manual confirmation wait request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.manualConfirmationWait}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildManualConfirmationWaitResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary:
          "Manual confirmation wait bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge manual confirmation wait returned invalid JSON: ${error.message}`
            : "Localhost bridge manual confirmation wait returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeManualConfirmationWaitResponse(
      parsed as
        | Partial<LocalhostBridgeManualConfirmationWaitResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeManualConfirmationWaitResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge manual confirmation wait returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge manual confirmation wait returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge manual confirmation wait returned brokerResult unexpectedly.",
      );
    }

    return buildManualConfirmationWaitResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.manualConfirmationWait.status ?? "failed",
      response: responseBody,
      summary:
        summarizeLocalhostManualConfirmationWaitBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildManualConfirmationWaitResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Manual confirmation wait bridge timed out. No browser actions were executed."
        : "Manual confirmation wait bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge manual confirmation wait timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge manual confirmation wait failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeBrokerConfirmationCapture(
  options: CheckLocalhostBridgeBrokerConfirmationCaptureOptions,
): Promise<LocalhostBridgeClientBrokerConfirmationCaptureResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildBrokerConfirmationCaptureResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "Broker confirmation capture bridge unavailable. No browser actions were executed.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<
    typeof buildLocalhostBridgeBrokerConfirmationCaptureRequest
  >;

  try {
    body = buildLocalhostBridgeBrokerConfirmationCaptureRequest(
      options.dryRunOrderInput,
      {
        requestId: options.requestId ?? undefined,
        createdAt: options.createdAt ?? undefined,
        manualConfirmationWaitResult:
          options.manualConfirmationWaitResult ?? undefined,
        brokerConfirmationReadback:
          options.brokerConfirmationReadback ?? undefined,
        metadata: {
          ...(options.metadata ?? {}),
          local_diagnostics_only: true,
          broker_confirmation_capture_stub_check: true,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_avanza_page_touched: true,
          no_bekrafta_clicked: true,
          no_broker_execution_result_created: true,
          no_execution_record_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
          sanitized_evidence_only: true,
        },
      },
    );
  } catch (error) {
    return buildBrokerConfirmationCaptureResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "Broker confirmation capture bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge broker confirmation capture request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.brokerConfirmationCapture}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildBrokerConfirmationCaptureResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary:
          "Broker confirmation capture bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge broker confirmation capture returned invalid JSON: ${error.message}`
            : "Localhost bridge broker confirmation capture returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeBrokerConfirmationCaptureResponse(
      parsed as
        | Partial<LocalhostBridgeBrokerConfirmationCaptureResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeBrokerConfirmationCaptureResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge broker confirmation capture returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge broker confirmation capture returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";
    const executionRecordPresent =
      isRecord(parsed) && typeof parsed.executionRecord !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge broker confirmation capture returned brokerResult unexpectedly.",
      );
    }

    if (executionRecordPresent) {
      errors.push(
        "Localhost bridge broker confirmation capture returned executionRecord unexpectedly.",
      );
    }

    return buildBrokerConfirmationCaptureResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        !executionRecordPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.brokerConfirmationCapture.status ?? "failed",
      response: responseBody,
      summary:
        summarizeLocalhostBrokerConfirmationCaptureBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildBrokerConfirmationCaptureResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Broker confirmation capture bridge timed out. No browser actions were executed."
        : "Broker confirmation capture bridge unavailable. No browser actions were executed.",
      errors: [
        timedOut
          ? `Localhost bridge broker confirmation capture timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge broker confirmation capture failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeBrokerExecutionResultEligibility(
  options: CheckLocalhostBridgeBrokerExecutionResultEligibilityOptions = {},
): Promise<LocalhostBridgeClientBrokerExecutionResultEligibilityResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildBrokerExecutionResultEligibilityResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "BrokerExecutionResult eligibility bridge unavailable. No BrokerExecutionResult was created.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<
    typeof buildLocalhostBridgeBrokerExecutionResultEligibilityRequest
  >;

  try {
    body = buildLocalhostBridgeBrokerExecutionResultEligibilityRequest({
      requestId: options.requestId ?? undefined,
      createdAt: options.createdAt ?? undefined,
      captureResult: options.captureResult ?? undefined,
      existingFingerprints: options.existingFingerprints ?? undefined,
      options: options.options ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        local_diagnostics_only: true,
        broker_execution_result_eligibility_stub_check: true,
        eligibility_check_only: true,
        no_browser_actions_requested: true,
        no_avanza_session: true,
        no_avanza_page_touched: true,
        no_broker_execution_result_created: true,
        no_execution_record_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    });
  } catch (error) {
    return buildBrokerExecutionResultEligibilityResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "BrokerExecutionResult eligibility bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge BrokerExecutionResult eligibility request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.brokerExecutionResultEligibility}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildBrokerExecutionResultEligibilityResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary:
          "BrokerExecutionResult eligibility bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge BrokerExecutionResult eligibility returned invalid JSON: ${error.message}`
            : "Localhost bridge BrokerExecutionResult eligibility returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation =
      validateLocalhostBridgeBrokerExecutionResultEligibilityResponse(
        parsed as
          | Partial<LocalhostBridgeBrokerExecutionResultEligibilityResponse>
          | null
          | undefined,
      );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeBrokerExecutionResultEligibilityResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge BrokerExecutionResult eligibility returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge BrokerExecutionResult eligibility returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";
    const executionRecordPresent =
      isRecord(parsed) && typeof parsed.executionRecord !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge BrokerExecutionResult eligibility returned brokerResult unexpectedly.",
      );
    }

    if (executionRecordPresent) {
      errors.push(
        "Localhost bridge BrokerExecutionResult eligibility returned executionRecord unexpectedly.",
      );
    }

    return buildBrokerExecutionResultEligibilityResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        !executionRecordPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status: responseBody?.eligibility.status ?? "failed",
      response: responseBody,
      summary:
        summarizeLocalhostBrokerExecutionResultEligibilityBridgeResponse(
          responseBody,
        ),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildBrokerExecutionResultEligibilityResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "BrokerExecutionResult eligibility bridge timed out. No BrokerExecutionResult was created."
        : "BrokerExecutionResult eligibility bridge unavailable. No BrokerExecutionResult was created.",
      errors: [
        timedOut
          ? `Localhost bridge BrokerExecutionResult eligibility timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge BrokerExecutionResult eligibility failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeBrokerExecutionResultPreview(
  options: CheckLocalhostBridgeBrokerExecutionResultPreviewOptions = {},
): Promise<LocalhostBridgeClientBrokerExecutionResultPreviewResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildBrokerExecutionResultPreviewResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "BrokerExecutionResult preview bridge unavailable. No real BrokerExecutionResult was created.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<
    typeof buildLocalhostBridgeBrokerExecutionResultPreviewRequest
  >;

  try {
    body = buildLocalhostBridgeBrokerExecutionResultPreviewRequest({
      requestId: options.requestId ?? undefined,
      createdAt: options.createdAt ?? undefined,
      captureResult: options.captureResult ?? undefined,
      eligibilityResult: options.eligibilityResult ?? undefined,
      existingFingerprints: options.existingFingerprints ?? undefined,
      options: options.options ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        local_diagnostics_only: true,
        broker_execution_result_preview_stub_check: true,
        preview_only: true,
        no_browser_actions_requested: true,
        no_avanza_session: true,
        no_avanza_page_touched: true,
        no_real_broker_execution_result_created: true,
        no_execution_record_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    });
  } catch (error) {
    return buildBrokerExecutionResultPreviewResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "BrokerExecutionResult preview bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge BrokerExecutionResult preview request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.brokerExecutionResultPreview}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildBrokerExecutionResultPreviewResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary:
          "BrokerExecutionResult preview bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge BrokerExecutionResult preview returned invalid JSON: ${error.message}`
            : "Localhost bridge BrokerExecutionResult preview returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation =
      validateLocalhostBridgeBrokerExecutionResultPreviewResponse(
        parsed as
          | Partial<LocalhostBridgeBrokerExecutionResultPreviewResponse>
          | null
          | undefined,
      );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeBrokerExecutionResultPreviewResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge BrokerExecutionResult preview returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge BrokerExecutionResult preview returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";
    const executionRecordPresent =
      isRecord(parsed) && typeof parsed.executionRecord !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge BrokerExecutionResult preview returned brokerResult unexpectedly.",
      );
    }

    if (executionRecordPresent) {
      errors.push(
        "Localhost bridge BrokerExecutionResult preview returned executionRecord unexpectedly.",
      );
    }

    return buildBrokerExecutionResultPreviewResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        !executionRecordPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status:
        responseBody?.brokerExecutionResultPreview.status ?? "failed",
      response: responseBody,
      summary: summarizeLocalhostBrokerExecutionResultPreviewBridgeResponse(
        responseBody,
      ),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildBrokerExecutionResultPreviewResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "BrokerExecutionResult preview bridge timed out. No real BrokerExecutionResult was created."
        : "BrokerExecutionResult preview bridge unavailable. No real BrokerExecutionResult was created.",
      errors: [
        timedOut
          ? `Localhost bridge BrokerExecutionResult preview timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge BrokerExecutionResult preview failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function checkLocalhostBridgeExecutionRecordEligibility(
  options: CheckLocalhostBridgeExecutionRecordEligibilityOptions = {},
): Promise<LocalhostBridgeClientExecutionRecordEligibilityResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildExecutionRecordEligibilityResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "Execution record eligibility bridge unavailable. No execution record was created.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<
    typeof buildLocalhostBridgeExecutionRecordEligibilityRequest
  >;

  try {
    body = buildLocalhostBridgeExecutionRecordEligibilityRequest({
      requestId: options.requestId ?? undefined,
      createdAt: options.createdAt ?? undefined,
      candidate: options.candidate ?? undefined,
      existingSourceFingerprints:
        options.existingSourceFingerprints ?? undefined,
      existingBrokerReferences:
        options.existingBrokerReferences ?? undefined,
      options: options.options ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        local_diagnostics_only: true,
        execution_record_eligibility_stub_check: true,
        execution_record_eligibility_check_only: true,
        no_browser_actions_requested: true,
        no_avanza_session: true,
        no_avanza_page_touched: true,
        no_broker_execution_result_created: true,
        no_execution_record_created: true,
        no_supabase_write: true,
        no_trade_mutation: true,
      },
    });
  } catch (error) {
    return buildExecutionRecordEligibilityResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary:
        "Execution record eligibility bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge execution record eligibility request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.executionRecordEligibility}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildExecutionRecordEligibilityResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary:
          "Execution record eligibility bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge execution record eligibility returned invalid JSON: ${error.message}`
            : "Localhost bridge execution record eligibility returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeExecutionRecordEligibilityResponse(
      parsed as
        | Partial<LocalhostBridgeExecutionRecordEligibilityResponse>
        | null
        | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeExecutionRecordEligibilityResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge execution record eligibility returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge execution record eligibility returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.errors.length) {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";
    const brokerExecutionResultPresent =
      isRecord(parsed) &&
      typeof parsed.brokerExecutionResult !== "undefined";
    const executionRecordPresent =
      isRecord(parsed) && typeof parsed.executionRecord !== "undefined";

    if (brokerResultPresent || brokerExecutionResultPresent) {
      errors.push(
        "Localhost bridge execution record eligibility returned broker result data unexpectedly.",
      );
    }

    if (executionRecordPresent) {
      errors.push(
        "Localhost bridge execution record eligibility returned executionRecord unexpectedly.",
      );
    }

    return buildExecutionRecordEligibilityResult({
      ok:
        response.ok &&
        validation.ok &&
        !brokerResultPresent &&
        !brokerExecutionResultPresent &&
        !executionRecordPresent &&
        responseBody?.ok === true,
      reachable: true,
      statusCode: response.status,
      status:
        responseBody?.executionRecordEligibility.status ?? "failed",
      response: responseBody,
      summary: summarizeLocalhostExecutionRecordEligibilityBridgeResponse(
        responseBody,
      ),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildExecutionRecordEligibilityResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Execution record eligibility bridge timed out. No execution record was created."
        : "Execution record eligibility bridge unavailable. No execution record was created.",
      errors: [
        timedOut
          ? `Localhost bridge execution record eligibility timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge execution record eligibility failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function runLocalhostBridgeAvanzaDryRunStub(
  options: RunLocalhostBridgeAvanzaDryRunStubOptions,
): Promise<LocalhostBridgeClientAvanzaDryRunStubResult> {
  const startedAt = Date.now();
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(
    options.timeoutMs ?? DEFAULT_LOCALHOST_BRIDGE_AVANZA_DRY_RUN_TIMEOUT_MS,
  );
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildAvanzaDryRunStubResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: "Dry-run bridge unavailable.",
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeDryRunRequest>;

  try {
    body = buildLocalhostBridgeDryRunRequest(options.dryRunOrderInput, {
      requestId: options.requestId ?? undefined,
      createdAt: options.createdAt ?? undefined,
      capabilityValidationOptions:
        options.capabilityValidationOptions ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        local_diagnostics_only: true,
        no_browser_actions_requested: true,
        no_avanza_session: true,
        no_broker_submission: true,
        no_broker_result_created: true,
      },
    });
  } catch (error) {
    return buildAvanzaDryRunStubResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: "Dry-run bridge request could not be built.",
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge dry-run request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.dryRun}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    let parsed: unknown;

    try {
      parsed = await parseJsonResponse(response);
    } catch (error) {
      return buildAvanzaDryRunStubResult({
        ok: false,
        reachable: true,
        baseUrl,
        startedAt,
        statusCode: response.status,
        status: "failed",
        summary: "Dry-run bridge returned an invalid response.",
        errors: [
          error instanceof Error
            ? `Localhost bridge dry-run returned invalid JSON: ${error.message}`
            : "Localhost bridge dry-run returned invalid JSON.",
        ],
        warnings: [],
      });
    }

    const validation = validateLocalhostBridgeDryRunResponse(
      parsed as Partial<LocalhostBridgeDryRunResponse> | null | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeDryRunResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok && !responseBody) {
      errors.unshift(
        `Localhost bridge dry-run returned HTTP ${response.status}.`,
      );
    } else if (!response.ok) {
      warnings.unshift(
        `Localhost bridge dry-run returned HTTP ${response.status}.`,
      );
    }

    if (responseBody?.status === "blocked" || responseBody?.status === "failed") {
      errors.push(...responseBody.errors);
    }

    if (responseBody?.warnings.length) {
      warnings.push(...responseBody.warnings);
    }

    const brokerResultPresent =
      isRecord(parsed) && typeof parsed.brokerResult !== "undefined";

    if (brokerResultPresent) {
      errors.push(
        "Localhost bridge dry-run returned brokerResult unexpectedly.",
      );
    }

    const normalizedStatus = responseBody?.status ?? "failed";
    const normalizedSafely =
      validation.ok &&
      Boolean(responseBody) &&
      !brokerResultPresent &&
      (normalizedStatus === "not_implemented" ||
        normalizedStatus === "unavailable" ||
        normalizedStatus === "accepted_stub");

    return buildAvanzaDryRunStubResult({
      ok: normalizedSafely,
      reachable: true,
      statusCode: response.status,
      status: normalizedStatus,
      response: responseBody,
      summary: summarizeLocalhostDryRunBridgeResponse(responseBody),
      errors,
      warnings,
      baseUrl,
      startedAt,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildAvanzaDryRunStubResult({
      ok: false,
      reachable: false,
      baseUrl,
      startedAt,
      status: "failed",
      summary: timedOut
        ? "Dry-run bridge timed out. No browser actions were executed."
        : "Dry-run bridge unavailable.",
      errors: [
        timedOut
          ? `Localhost bridge dry-run timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge dry-run failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function runLocalhostBridgeDryRun(
  options: RunLocalhostBridgeDryRunOptions,
): Promise<LocalhostBridgeClientRunResult> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(
    options.timeoutMs ?? DEFAULT_LOCALHOST_BRIDGE_RUN_TIMEOUT_MS,
  );
  const fetchImpl = options.fetchFn ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    return buildRunResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  let body: ReturnType<typeof buildLocalhostBridgeRunRequest>;

  try {
    body = buildLocalhostBridgeRunRequest(options.envelope, options.request, {
      enableMockAgentRun: options.enableMockAgentRun ?? undefined,
      mockPageBaseUrl: options.mockPageBaseUrl ?? undefined,
      mockAgentHeaded: options.mockAgentHeaded ?? undefined,
      metadata: {
        ...(options.metadata ?? {}),
        dry_run: true,
        local_diagnostics_only: true,
        no_avanza_session: true,
        no_browser_automation: options.enableMockAgentRun === true ? false : true,
        mock_agent_run_requested: options.enableMockAgentRun === true,
        no_broker_result_created: true,
      },
    });
  } catch (error) {
    return buildRunResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        error instanceof Error
          ? error.message
          : "Localhost bridge dry-run request could not be built.",
      ],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.run}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      },
    );
    const parsed = await parseJsonResponse(response);
    const validation = validateLocalhostBridgeRunResponse(
      parsed as Partial<LocalhostBridgeRunResponse> | null | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeRunResponse)
      : undefined;
    const errors = [...validation.errors];
    const warnings = [...validation.warnings];

    if (!response.ok) {
      errors.unshift(`Localhost bridge run returned HTTP ${response.status}.`);
    }

    if (responseBody?.accepted === false) {
      errors.push(...(responseBody.errors ?? []));
      warnings.push(...(responseBody.warnings ?? []));
    }

    if (responseBody?.result?.brokerResult) {
      errors.push(
        "Localhost bridge dry-run returned brokerResult unexpectedly.",
      );
    }

    const mockAgentRunFailed =
      options.enableMockAgentRun === true &&
      responseBody?.mockAgentRunOk === false;

    if (mockAgentRunFailed) {
      errors.push(
        ...(responseBody?.mockAgentRunErrors?.length
          ? responseBody.mockAgentRunErrors
          : [
              responseBody?.mockAgentRunMessage ??
                "Localhost mock agent run failed safely.",
            ]),
      );
    }

    return buildRunResult({
      ok:
        response.ok &&
        validation.ok &&
        responseBody?.accepted === true &&
        !mockAgentRunFailed &&
        !responseBody.result?.brokerResult,
      reachable: true,
      statusCode: response.status,
      response: responseBody,
      result: responseBody?.result,
      errors,
      warnings,
      baseUrl,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildRunResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        timedOut
          ? `Localhost bridge dry run timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge dry run failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function cancelLocalhostBridgeRun(
  options: CancelLocalhostBridgeRunOptions,
): Promise<LocalhostBridgeClientCancelResult> {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const timeoutMs = normalizeTimeoutMs(
    options.timeoutMs ?? DEFAULT_LOCALHOST_BRIDGE_CANCEL_TIMEOUT_MS,
  );
  const fetchImpl = options.fetchFn ?? globalThis.fetch;
  const requestId =
    typeof options.requestId === "string" && options.requestId.trim().length > 0
      ? options.requestId.trim()
      : null;

  if (!requestId) {
    return buildCancelResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["Localhost bridge cancel requires a requestId."],
      warnings: [],
    });
  }

  if (typeof fetchImpl !== "function") {
    return buildCancelResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: ["fetch is unavailable in this runtime."],
      warnings: [],
    });
  }

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  try {
    const response = await fetchImpl(
      `${baseUrl}${LOCALHOST_BRIDGE_ENDPOINT_PATHS.cancel}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
          requestId,
          ...(typeof options.reason === "string" && options.reason.trim()
            ? { reason: options.reason.trim() }
            : {}),
        }),
        signal: controller?.signal,
      },
    );
    const parsed = await parseJsonResponse(response);
    const validation = validateLocalhostBridgeCancelResponse(
      parsed as Partial<LocalhostBridgeCancelResponse> | null | undefined,
    );
    const responseBody = validation.ok
      ? (parsed as LocalhostBridgeCancelResponse)
      : undefined;
    const errors = [...validation.errors];

    if (!response.ok) {
      errors.unshift(`Localhost bridge cancel returned HTTP ${response.status}.`);
    }

    if (responseBody?.cancelled === false) {
      errors.push(...(responseBody.errors ?? []));
    }

    return buildCancelResult({
      ok: response.ok && validation.ok && responseBody?.cancelled === true,
      reachable: true,
      statusCode: response.status,
      response: responseBody,
      cancelled: responseBody?.cancelled,
      errors,
      warnings: validation.warnings,
      baseUrl,
    });
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";

    return buildCancelResult({
      ok: false,
      reachable: false,
      baseUrl,
      errors: [
        timedOut
          ? `Localhost bridge cancel timed out after ${timeoutMs}ms.`
          : error instanceof Error
            ? error.message
            : "Localhost bridge cancel failed.",
      ],
      warnings: [],
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
