import {
  validateAvanzaAgentRequest,
  type AvanzaAgentProgressEvent,
  type AvanzaAgentRequest,
  type AvanzaAgentResult,
} from "@/lib/avanza-agent-adapter";
import {
  validateMockOrderPageFillPlan,
  type MockOrderPageFillPlan,
} from "@/lib/mock-order-page-agent-contract";
import type { SafeBrowserActionExecutionDiagnostics } from "@/lib/safe-browser-action-diagnostics";
import {
  validateAvanzaDryRunOrderInput,
  type AvanzaDryRunOrderInput,
  type AvanzaDryRunRequestValidationResult,
} from "@/lib/avanza-dry-run-request-contract";
import type {
  AvanzaDryRunRunnerSelfCheckResult,
  AvanzaDryRunRunnerSelfCheckStatus,
} from "@/lib/avanza-dry-run-runner-self-check";
import type {
  AvanzaSessionDetectionResult,
  AvanzaSessionDetectionStatus,
} from "@/lib/avanza-session-detection-contract";
import type {
  AvanzaSearchOnlyExpectedInstrument,
  AvanzaSearchOnlyResult,
  AvanzaSearchOnlyStatus,
  AvanzaSearchOnlyCandidate,
} from "@/lib/avanza-search-only-result-contract";
import type {
  AvanzaInstrumentVerificationResult,
  AvanzaInstrumentVerificationStatus,
} from "@/lib/avanza-instrument-verification-contract";
import type {
  AvanzaInstrumentPageIdentity,
  AvanzaInstrumentPageResult,
  AvanzaInstrumentPageStatus,
} from "@/lib/avanza-instrument-page-contract";
import type {
  AvanzaOrderPageIdentity,
  AvanzaOrderPageOpenAction,
  AvanzaOrderPageOpenResult,
  AvanzaOrderPageOpenStatus,
} from "@/lib/avanza-order-page-open-contract";
import type {
  AvanzaAdvancedFormFillResult,
  AvanzaAdvancedFormFillStatus,
  AvanzaAdvancedFormState,
} from "@/lib/avanza-advanced-form-fill-contract";
import type {
  AvanzaConfirmationModalReadback,
  AvanzaReviewClickResult,
  AvanzaReviewClickStatus,
} from "@/lib/avanza-review-click-contract";
import type {
  AvanzaManualConfirmationWaitObservation,
  AvanzaManualConfirmationWaitResult,
  AvanzaManualConfirmationWaitStatus,
} from "@/lib/avanza-manual-confirmation-wait-contract";
import type {
  AvanzaBrokerConfirmationCaptureResult,
  AvanzaBrokerConfirmationCaptureStatus,
  AvanzaBrokerConfirmationOrderStatus,
  AvanzaBrokerConfirmationReadback,
} from "@/lib/avanza-broker-confirmation-capture-contract";
import type {
  AvanzaBrokerExecutionResultEligibilityOptions,
  AvanzaBrokerExecutionResultEligibilityResult,
  AvanzaBrokerExecutionResultEligibilityStatus,
} from "@/lib/avanza-broker-execution-result-eligibility";
import type {
  AvanzaBrokerExecutionResultPreviewResult,
  AvanzaBrokerExecutionResultPreviewStatus,
} from "@/lib/avanza-broker-execution-result-preview";
import type {
  ExecutionRecordCandidate,
  ExecutionRecordEligibilityOptions,
  ExecutionRecordEligibilityResult,
  ExecutionRecordEligibilityStatus,
} from "@/lib/execution-record-eligibility";
import {
  createAvanzaDryRunBrowserRunnerCapability,
  validateBrowserRunnerCapability,
  type BrowserRunnerCapabilityValidationOptions,
  type BrowserRunnerCapabilityValidationResult,
  type BrowserRunnerExecutionCapability,
} from "@/lib/browser-runner-capability-gate";
import {
  validateAvanzaAgentBridgeEnvelope,
  type AvanzaAgentBridgeCapabilities,
  type AvanzaAgentBridgeEnvelope,
  type AvanzaAgentBridgeHealth,
  type AvanzaAgentBridgeStatus,
} from "@/lib/avanza-agent-bridge";

export const LOCALHOST_BRIDGE_CONTRACT_VERSION =
  "avanza_localhost_bridge_v1" as const;

export const DEFAULT_LOCALHOST_BRIDGE_PORT = 47831;
export const DEFAULT_LOCALHOST_BRIDGE_BASE_URL = "http://127.0.0.1:47831";

export const LOCALHOST_BRIDGE_ENDPOINT_PATHS = {
  health: "/health",
  selfCheck: "/self-check",
  sessionDetection: "/session-detection",
  searchOnly: "/search-only",
  instrumentVerification: "/instrument-verification",
  instrumentPage: "/instrument-page",
  orderPageOpen: "/order-page-open",
  advancedFormFill: "/advanced-form-fill",
  reviewClick: "/review-click",
  manualConfirmationWait: "/manual-confirmation-wait",
  brokerConfirmationCapture: "/broker-confirmation-capture",
  brokerExecutionResultEligibility: "/broker-execution-result-eligibility",
  brokerExecutionResultPreview: "/broker-execution-result-preview",
  executionRecordEligibility: "/execution-record-eligibility",
  dryRun: "/dry-run",
  run: "/run",
  cancel: "/cancel",
  eventsByRequestId: "/events/:requestId",
  websocketEvents: "/events",
} as const;

export type LocalhostBridgeContractVersion =
  typeof LOCALHOST_BRIDGE_CONTRACT_VERSION;

export type LocalhostBridgeTransport = "http" | "websocket" | "local_process";

export type LocalhostBridgeEventStreamMessageType =
  | "progress"
  | "result"
  | "error"
  | "heartbeat";

export type LocalhostBridgeValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export type LocalhostBridgeHealthResponse = {
  version: LocalhostBridgeContractVersion;
  bridgeName: string;
  bridgeStatus: AvanzaAgentBridgeStatus;
  transport: LocalhostBridgeTransport;
  health: AvanzaAgentBridgeHealth;
  capabilities: AvanzaAgentBridgeCapabilities;
  serverTime: string;
  message: string;
};

export type LocalhostBridgeRunnerSelfCheckResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  checkedAt: string;
  selfCheck: AvanzaDryRunRunnerSelfCheckResult;
  capability?: BrowserRunnerExecutionCapability;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeSessionDetectionResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  checkedAt: string;
  sessionDetection: AvanzaSessionDetectionResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeSearchOnlyRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  sessionDetection?: AvanzaSessionDetectionResult;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeSearchOnlyResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  searchOnly: AvanzaSearchOnlyResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeInstrumentVerificationRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  searchOnlyResult?: AvanzaSearchOnlyResult;
  selectedCandidate?: AvanzaSearchOnlyCandidate;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeInstrumentVerificationResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  instrumentVerification: AvanzaInstrumentVerificationResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeInstrumentPageRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument;
  instrumentVerificationResult?: AvanzaInstrumentVerificationResult;
  pageIdentity?: AvanzaInstrumentPageIdentity;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeInstrumentPageResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  instrumentPage: AvanzaInstrumentPageResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeOrderPageOpenRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  instrumentPageResult?: AvanzaInstrumentPageResult;
  orderPageIdentity?: AvanzaOrderPageIdentity;
  attemptedAction?: AvanzaOrderPageOpenAction;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeOrderPageOpenResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  orderPageOpen: AvanzaOrderPageOpenResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeAdvancedFormFillRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  orderPageOpenResult?: AvanzaOrderPageOpenResult;
  formState?: AvanzaAdvancedFormState;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeAdvancedFormFillResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  advancedFormFill: AvanzaAdvancedFormFillResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeReviewClickRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  advancedFormFillResult?: AvanzaAdvancedFormFillResult;
  confirmationReadback?: AvanzaConfirmationModalReadback;
  reviewClickAttempted?: boolean;
  reviewLabel?: string;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeReviewClickResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  reviewClick: AvanzaReviewClickResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeManualConfirmationWaitRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  reviewClickResult?: AvanzaReviewClickResult;
  observation?: AvanzaManualConfirmationWaitObservation;
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeManualConfirmationWaitResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  manualConfirmationWait: AvanzaManualConfirmationWaitResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeBrokerConfirmationCaptureRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  manualConfirmationWaitResult?: AvanzaManualConfirmationWaitResult;
  brokerConfirmationReadback?: AvanzaBrokerConfirmationReadback;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeBrokerConfirmationCaptureResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  brokerConfirmationCapture: AvanzaBrokerConfirmationCaptureResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeBrokerExecutionResultEligibilityRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  captureResult?: AvanzaBrokerConfirmationCaptureResult;
  existingFingerprints?: string[];
  options?: AvanzaBrokerExecutionResultEligibilityOptions;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeBrokerExecutionResultEligibilityResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  eligibility: AvanzaBrokerExecutionResultEligibilityResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeBrokerExecutionResultPreviewRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  captureResult?: AvanzaBrokerConfirmationCaptureResult;
  eligibilityResult?: AvanzaBrokerExecutionResultEligibilityResult;
  existingFingerprints?: string[];
  options?: AvanzaBrokerExecutionResultEligibilityOptions;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeBrokerExecutionResultPreviewResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  brokerExecutionResultPreview: AvanzaBrokerExecutionResultPreviewResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeExecutionRecordEligibilityRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  candidate?: ExecutionRecordCandidate;
  existingSourceFingerprints?: string[];
  existingBrokerReferences?: string[];
  options?: ExecutionRecordEligibilityOptions;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeExecutionRecordEligibilityResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  executionRecordEligibility: ExecutionRecordEligibilityResult;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeDryRunStatus =
  | "not_implemented"
  | "unavailable"
  | "blocked"
  | "accepted_stub"
  | "failed";

export type LocalhostBridgeDryRunRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  createdAt: string;
  dryRunOrderInput: AvanzaDryRunOrderInput;
  capabilityValidationOptions?: BrowserRunnerCapabilityValidationOptions;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeDryRunResponse = {
  version: LocalhostBridgeContractVersion;
  ok: boolean;
  status: LocalhostBridgeDryRunStatus;
  bridgeVersion: LocalhostBridgeContractVersion;
  requestId: string;
  receivedAt: string;
  completedAt: string;
  dryRunRequestValidation: AvanzaDryRunRequestValidationResult;
  capabilityValidation: BrowserRunnerCapabilityValidationResult;
  selfCheck?: AvanzaDryRunRunnerSelfCheckResult;
  diagnostics?: SafeBrowserActionExecutionDiagnostics | null;
  message: string;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeRunRequest = {
  version: LocalhostBridgeContractVersion;
  envelope: AvanzaAgentBridgeEnvelope;
  request: AvanzaAgentRequest;
  dryRun: true;
  enableMockAgentRun?: boolean;
  mockPageBaseUrl?: string;
  mockAgentHeaded?: boolean;
  metadata?: Record<string, unknown>;
};

export type LocalhostBridgeRunResponse = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  accepted: boolean;
  result?: AvanzaAgentResult;
  mockOrderPageUrl?: string;
  mockOrderPageAvailable?: boolean;
  mockOrderPageMessage?: string;
  mockOrderFillPlan?: MockOrderPageFillPlan;
  mockOrderFillPlanValid?: boolean;
  mockOrderFillPlanErrors?: string[];
  mockOrderFillPlanWarnings?: string[];
  mockAgentRunAttempted?: boolean;
  mockAgentRunOk?: boolean;
  mockAgentRunMessage?: string;
  mockAgentRunErrors?: string[];
  mockAgentRunStartedAt?: string;
  mockAgentRunCompletedAt?: string;
  mockAgentRunValidationErrors?: string[];
  mockAgentRunReviewVisible?: boolean;
  mockAgentRunConfirmationLinkAvailable?: boolean;
  mockAgentRunSubmitDisabled?: boolean;
  mockAgentRunOrderModeVerified?: boolean;
  safeActionDiagnostics?: SafeBrowserActionExecutionDiagnostics;
  safeActionDiagnosticsAvailable?: boolean;
  safeActionDiagnosticsMessage?: string;
  message: string;
  errors?: string[];
  warnings?: string[];
};

export type LocalhostBridgeCancelRequest = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  reason?: string;
};

export type LocalhostBridgeCancelResponse = {
  version: LocalhostBridgeContractVersion;
  requestId: string;
  cancelled: boolean;
  message: string;
  errors?: string[];
};

export type LocalhostBridgeEventStreamMessage = {
  version: LocalhostBridgeContractVersion;
  type: LocalhostBridgeEventStreamMessageType;
  requestId?: string;
  progressEvent?: AvanzaAgentProgressEvent;
  result?: AvanzaAgentResult;
  error?: string;
  createdAt: string;
};

export type BuildLocalhostBridgeRunRequestOptions = {
  enableMockAgentRun?: boolean;
  mockPageBaseUrl?: string;
  mockAgentHeaded?: boolean;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeDryRunRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  capabilityValidationOptions?: BrowserRunnerCapabilityValidationOptions | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeSearchOnlyRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  sessionDetection?: AvanzaSessionDetectionResult | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeInstrumentVerificationRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  searchOnlyResult?: AvanzaSearchOnlyResult | null;
  selectedCandidate?: AvanzaSearchOnlyCandidate | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeInstrumentPageRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  instrumentVerificationResult?: AvanzaInstrumentVerificationResult | null;
  pageIdentity?: AvanzaInstrumentPageIdentity | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeOrderPageOpenRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  instrumentPageResult?: AvanzaInstrumentPageResult | null;
  orderPageIdentity?: AvanzaOrderPageIdentity | null;
  attemptedAction?: AvanzaOrderPageOpenAction | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeAdvancedFormFillRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  orderPageOpenResult?: AvanzaOrderPageOpenResult | null;
  formState?: AvanzaAdvancedFormState | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeReviewClickRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  advancedFormFillResult?: AvanzaAdvancedFormFillResult | null;
  confirmationReadback?: AvanzaConfirmationModalReadback | null;
  reviewClickAttempted?: boolean | null;
  reviewLabel?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeManualConfirmationWaitRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  reviewClickResult?: AvanzaReviewClickResult | null;
  observation?: AvanzaManualConfirmationWaitObservation | null;
  timeoutMs?: number | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeBrokerConfirmationCaptureRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  manualConfirmationWaitResult?: AvanzaManualConfirmationWaitResult | null;
  brokerConfirmationReadback?: AvanzaBrokerConfirmationReadback | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeBrokerExecutionResultEligibilityRequestOptions =
  {
    requestId?: string | null;
    createdAt?: string | null;
    captureResult?: AvanzaBrokerConfirmationCaptureResult | null;
    existingFingerprints?: string[] | null;
    options?: AvanzaBrokerExecutionResultEligibilityOptions | null;
    metadata?: Record<string, unknown> | null;
  };

export type BuildLocalhostBridgeBrokerExecutionResultPreviewRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  captureResult?: AvanzaBrokerConfirmationCaptureResult | null;
  eligibilityResult?: AvanzaBrokerExecutionResultEligibilityResult | null;
  existingFingerprints?: string[] | null;
  options?: AvanzaBrokerExecutionResultEligibilityOptions | null;
  metadata?: Record<string, unknown> | null;
};

export type BuildLocalhostBridgeExecutionRecordEligibilityRequestOptions = {
  requestId?: string | null;
  createdAt?: string | null;
  candidate?: ExecutionRecordCandidate | null;
  existingSourceFingerprints?: string[] | null;
  existingBrokerReferences?: string[] | null;
  options?: ExecutionRecordEligibilityOptions | null;
  metadata?: Record<string, unknown> | null;
};

const supportedLocalhostBridgeTransports: readonly LocalhostBridgeTransport[] = [
  "http",
  "websocket",
  "local_process",
];

const supportedEventStreamMessageTypes: readonly LocalhostBridgeEventStreamMessageType[] =
  ["progress", "result", "error", "heartbeat"];

const supportedResultStatuses: readonly AvanzaAgentResult["status"][] = [
  "not_started",
  "in_progress",
  "waiting_for_manual_confirmation",
  "submitted",
  "filled",
  "partially_filled",
  "rejected",
  "cancelled",
  "failed",
  "unknown",
];

const supportedBridgeStatuses: readonly AvanzaAgentBridgeStatus[] = [
  "unavailable",
  "available",
  "connecting",
  "connected",
  "disconnected",
  "error",
];

const supportedRunnerSelfCheckStatuses: readonly AvanzaDryRunRunnerSelfCheckStatus[] =
  [
    "unavailable",
    "available_mock_only",
    "available_dry_run_only",
    "blocked",
    "failed",
  ];

const supportedSessionDetectionStatuses: readonly AvanzaSessionDetectionStatus[] =
  [
    "unavailable",
    "browser_not_connected",
    "avanza_not_visible",
    "login_required",
    "ready_for_search_only",
    "blocked",
    "failed",
  ];

const supportedSearchOnlyStatuses: readonly AvanzaSearchOnlyStatus[] = [
  "unavailable",
  "session_not_ready",
  "search_not_available",
  "no_match",
  "ambiguous",
  "exact_match",
  "blocked",
  "failed",
];

const supportedInstrumentVerificationStatuses: readonly AvanzaInstrumentVerificationStatus[] =
  [
    "unavailable",
    "search_not_ready",
    "missing_candidate",
    "verified",
    "rejected",
    "ambiguous",
    "blocked",
    "failed",
  ];

const supportedInstrumentPageStatuses: readonly AvanzaInstrumentPageStatus[] = [
  "unavailable",
  "verification_not_ready",
  "page_not_open",
  "page_identified",
  "page_mismatch",
  "prohibited_order_controls_detected",
  "blocked",
  "failed",
];

const supportedOrderPageOpenStatuses: readonly AvanzaOrderPageOpenStatus[] = [
  "unavailable",
  "instrument_page_not_ready",
  "action_not_supported",
  "order_page_opened",
  "order_page_mismatch",
  "wrong_action_opened",
  "prohibited_form_interaction_detected",
  "blocked",
  "failed",
];

const supportedAdvancedFormFillStatuses: readonly AvanzaAdvancedFormFillStatus[] =
  [
    "unavailable",
    "order_page_not_ready",
    "unsupported_order_mode",
    "form_filled",
    "field_mismatch",
    "validation_error",
    "prohibited_review_detected",
    "prohibited_final_confirm_detected",
    "blocked",
    "failed",
  ];

const supportedReviewClickStatuses: readonly AvanzaReviewClickStatus[] = [
  "unavailable",
  "form_not_ready",
  "review_click_allowed",
  "confirmation_detected",
  "confirmation_ready",
  "confirmation_mismatch",
  "validation_error",
  "prohibited_final_confirm_detected",
  "blocked",
  "failed",
];

const supportedManualConfirmationWaitStatuses: readonly AvanzaManualConfirmationWaitStatus[] =
  [
    "unavailable",
    "confirmation_not_ready",
    "waiting_for_manual_confirmation",
    "user_cancelled",
    "user_confirmed_unverified",
    "timed_out",
    "blocked",
    "failed",
  ];

const supportedBrokerConfirmationCaptureStatuses: readonly AvanzaBrokerConfirmationCaptureStatus[] =
  [
    "unavailable",
    "manual_confirmation_not_observed",
    "confirmation_page_not_found",
    "confirmation_captured",
    "confirmation_partial",
    "confirmation_mismatch",
    "confirmation_rejected_or_cancelled",
    "blocked",
    "failed",
  ];

const supportedBrokerConfirmationOrderStatuses: readonly AvanzaBrokerConfirmationOrderStatus[] =
  [
    "unknown",
    "placed",
    "accepted",
    "filled",
    "partially_filled",
    "rejected",
    "cancelled",
    "expired",
  ];

const supportedBrokerExecutionResultEligibilityStatuses: readonly AvanzaBrokerExecutionResultEligibilityStatus[] =
  [
    "eligible",
    "not_eligible",
    "partial_only",
    "duplicate_risk",
    "blocked",
    "failed",
  ];

const supportedBrokerExecutionResultPreviewStatuses: readonly AvanzaBrokerExecutionResultPreviewStatus[] =
  [
    "preview_available",
    "not_eligible",
    "partial_only",
    "duplicate_risk",
    "blocked",
    "failed",
  ];

const supportedExecutionRecordEligibilityStatuses: readonly ExecutionRecordEligibilityStatus[] =
  ["eligible", "not_eligible", "duplicate_risk", "blocked", "failed"];

const supportedDryRunStatuses: readonly LocalhostBridgeDryRunStatus[] = [
  "not_implemented",
  "unavailable",
  "blocked",
  "accepted_stub",
  "failed",
];

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  return metadata ? { ...metadata } : undefined;
}

function isValidTimestamp(value: unknown): boolean {
  const timestamp = optionalString(value);

  return Boolean(timestamp && Number.isFinite(Date.parse(timestamp)));
}

function isLocalhostUrlString(value: unknown): boolean {
  const text = optionalString(value);

  if (!text) {
    return false;
  }

  try {
    const url = new URL(text);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function isSupportedTransport(
  value: unknown,
): value is LocalhostBridgeTransport {
  return supportedLocalhostBridgeTransports.includes(
    value as LocalhostBridgeTransport,
  );
}

function isSupportedEventStreamMessageType(
  value: unknown,
): value is LocalhostBridgeEventStreamMessageType {
  return supportedEventStreamMessageTypes.includes(
    value as LocalhostBridgeEventStreamMessageType,
  );
}

function isSupportedResultStatus(
  value: unknown,
): value is AvanzaAgentResult["status"] {
  return supportedResultStatuses.includes(value as AvanzaAgentResult["status"]);
}

function isSupportedBridgeStatus(
  value: unknown,
): value is AvanzaAgentBridgeStatus {
  return supportedBridgeStatuses.includes(value as AvanzaAgentBridgeStatus);
}

function isSupportedRunnerSelfCheckStatus(
  value: unknown,
): value is AvanzaDryRunRunnerSelfCheckStatus {
  return supportedRunnerSelfCheckStatuses.includes(
    value as AvanzaDryRunRunnerSelfCheckStatus,
  );
}

function isSupportedSessionDetectionStatus(
  value: unknown,
): value is AvanzaSessionDetectionStatus {
  return supportedSessionDetectionStatuses.includes(
    value as AvanzaSessionDetectionStatus,
  );
}

function isSupportedSearchOnlyStatus(
  value: unknown,
): value is AvanzaSearchOnlyStatus {
  return supportedSearchOnlyStatuses.includes(value as AvanzaSearchOnlyStatus);
}

function isSupportedInstrumentVerificationStatus(
  value: unknown,
): value is AvanzaInstrumentVerificationStatus {
  return supportedInstrumentVerificationStatuses.includes(
    value as AvanzaInstrumentVerificationStatus,
  );
}

function isSupportedInstrumentPageStatus(
  value: unknown,
): value is AvanzaInstrumentPageStatus {
  return supportedInstrumentPageStatuses.includes(
    value as AvanzaInstrumentPageStatus,
  );
}

function isSupportedOrderPageOpenStatus(
  value: unknown,
): value is AvanzaOrderPageOpenStatus {
  return supportedOrderPageOpenStatuses.includes(
    value as AvanzaOrderPageOpenStatus,
  );
}

function isSupportedAdvancedFormFillStatus(
  value: unknown,
): value is AvanzaAdvancedFormFillStatus {
  return supportedAdvancedFormFillStatuses.includes(
    value as AvanzaAdvancedFormFillStatus,
  );
}

function isSupportedReviewClickStatus(
  value: unknown,
): value is AvanzaReviewClickStatus {
  return supportedReviewClickStatuses.includes(value as AvanzaReviewClickStatus);
}

function isSupportedManualConfirmationWaitStatus(
  value: unknown,
): value is AvanzaManualConfirmationWaitStatus {
  return supportedManualConfirmationWaitStatuses.includes(
    value as AvanzaManualConfirmationWaitStatus,
  );
}

function isSupportedBrokerConfirmationCaptureStatus(
  value: unknown,
): value is AvanzaBrokerConfirmationCaptureStatus {
  return supportedBrokerConfirmationCaptureStatuses.includes(
    value as AvanzaBrokerConfirmationCaptureStatus,
  );
}

function isSupportedBrokerConfirmationOrderStatus(
  value: unknown,
): value is AvanzaBrokerConfirmationOrderStatus {
  return supportedBrokerConfirmationOrderStatuses.includes(
    value as AvanzaBrokerConfirmationOrderStatus,
  );
}

function isSupportedBrokerExecutionResultEligibilityStatus(
  value: unknown,
): value is AvanzaBrokerExecutionResultEligibilityStatus {
  return supportedBrokerExecutionResultEligibilityStatuses.includes(
    value as AvanzaBrokerExecutionResultEligibilityStatus,
  );
}

function isSupportedBrokerExecutionResultPreviewStatus(
  value: unknown,
): value is AvanzaBrokerExecutionResultPreviewStatus {
  return supportedBrokerExecutionResultPreviewStatuses.includes(
    value as AvanzaBrokerExecutionResultPreviewStatus,
  );
}

function isSupportedExecutionRecordEligibilityStatus(
  value: unknown,
): value is ExecutionRecordEligibilityStatus {
  return supportedExecutionRecordEligibilityStatuses.includes(
    value as ExecutionRecordEligibilityStatus,
  );
}

function isSupportedDryRunStatus(
  value: unknown,
): value is LocalhostBridgeDryRunStatus {
  return supportedDryRunStatuses.includes(value as LocalhostBridgeDryRunStatus);
}

function createValidationResult(
  errors: string[],
  warnings: string[] = [],
): LocalhostBridgeValidationResult {
  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function validateVersion(
  value: unknown,
  errors: string[],
  subject: string,
) {
  if (value !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `${subject} version must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }
}

function validateResultShape(
  result: unknown,
  subject: string,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(result)) {
    return createValidationResult([`${subject} is missing.`], warnings);
  }

  if (!optionalString(result.requestId)) {
    errors.push(`${subject} requestId is missing.`);
  }

  if (!isValidTimestamp(result.createdAt)) {
    errors.push(`${subject} createdAt must be a valid timestamp.`);
  }

  if (!isSupportedResultStatus(result.status)) {
    errors.push(`${subject} status is unsupported.`);
  }

  if (!Array.isArray(result.progressEvents)) {
    errors.push(`${subject} progressEvents must be an array.`);
  }

  if (typeof result.brokerResult !== "undefined") {
    warnings.push(
      `${subject} includes brokerResult; localhost bridge v1 should keep brokerResult undefined until the mock broker-result phase.`,
    );
  }

  return createValidationResult(errors, warnings);
}

function validateProgressEventShape(
  event: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];

  if (!isObject(event)) {
    return createValidationResult(["Progress event is missing."]);
  }

  if (!optionalString(event.eventId)) {
    errors.push("Progress event id is missing.");
  }

  if (!optionalString(event.requestId)) {
    errors.push("Progress event requestId is missing.");
  }

  if (!isValidTimestamp(event.createdAt)) {
    errors.push("Progress event createdAt must be a valid timestamp.");
  }

  if (!optionalString(event.type)) {
    errors.push("Progress event type is missing.");
  }

  if (!optionalString(event.message)) {
    errors.push("Progress event message is missing.");
  }

  return createValidationResult(errors);
}

function validateMockOrderPageRunMetadata(
  response: Partial<LocalhostBridgeRunResponse>,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    typeof response.mockOrderPageUrl !== "undefined" &&
    !optionalString(response.mockOrderPageUrl)
  ) {
    errors.push("Localhost bridge run response mockOrderPageUrl must be non-empty when provided.");
  }

  if (
    typeof response.mockOrderPageUrl === "string" &&
    !response.mockOrderPageUrl.startsWith("/mock-broker/order")
  ) {
    errors.push("Localhost bridge run response mockOrderPageUrl must be a relative mock broker order URL.");
  }

  if (
    typeof response.mockOrderPageAvailable !== "undefined" &&
    typeof response.mockOrderPageAvailable !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockOrderPageAvailable must be boolean when provided.");
  }

  if (
    typeof response.mockOrderPageMessage !== "undefined" &&
    !optionalString(response.mockOrderPageMessage)
  ) {
    errors.push("Localhost bridge run response mockOrderPageMessage must be non-empty when provided.");
  }

  if (
    typeof response.mockOrderFillPlanValid !== "undefined" &&
    typeof response.mockOrderFillPlanValid !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockOrderFillPlanValid must be boolean when provided.");
  }

  if (
    typeof response.mockOrderFillPlanErrors !== "undefined" &&
    !Array.isArray(response.mockOrderFillPlanErrors)
  ) {
    errors.push("Localhost bridge run response mockOrderFillPlanErrors must be an array when provided.");
  }

  if (
    typeof response.mockOrderFillPlanWarnings !== "undefined" &&
    !Array.isArray(response.mockOrderFillPlanWarnings)
  ) {
    errors.push("Localhost bridge run response mockOrderFillPlanWarnings must be an array when provided.");
  }

  if (
    typeof response.mockAgentRunAttempted !== "undefined" &&
    typeof response.mockAgentRunAttempted !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockAgentRunAttempted must be boolean when provided.");
  }

  if (
    typeof response.mockAgentRunOk !== "undefined" &&
    typeof response.mockAgentRunOk !== "boolean"
  ) {
    errors.push("Localhost bridge run response mockAgentRunOk must be boolean when provided.");
  }

  if (
    typeof response.mockAgentRunMessage !== "undefined" &&
    !optionalString(response.mockAgentRunMessage)
  ) {
    errors.push("Localhost bridge run response mockAgentRunMessage must be non-empty when provided.");
  }

  if (
    typeof response.mockAgentRunErrors !== "undefined" &&
    !Array.isArray(response.mockAgentRunErrors)
  ) {
    errors.push("Localhost bridge run response mockAgentRunErrors must be an array when provided.");
  }

  if (
    typeof response.mockAgentRunValidationErrors !== "undefined" &&
    !Array.isArray(response.mockAgentRunValidationErrors)
  ) {
    errors.push("Localhost bridge run response mockAgentRunValidationErrors must be an array when provided.");
  }

  for (const [key, value] of [
    ["mockAgentRunReviewVisible", response.mockAgentRunReviewVisible],
    [
      "mockAgentRunConfirmationLinkAvailable",
      response.mockAgentRunConfirmationLinkAvailable,
    ],
    ["mockAgentRunSubmitDisabled", response.mockAgentRunSubmitDisabled],
    ["mockAgentRunOrderModeVerified", response.mockAgentRunOrderModeVerified],
  ] as const) {
    if (typeof value !== "undefined" && typeof value !== "boolean") {
      errors.push(`Localhost bridge run response ${key} must be boolean when provided.`);
    }
  }

  if (
    typeof response.mockAgentRunStartedAt !== "undefined" &&
    !isValidTimestamp(response.mockAgentRunStartedAt)
  ) {
    errors.push("Localhost bridge run response mockAgentRunStartedAt must be a valid timestamp when provided.");
  }

  if (
    typeof response.mockAgentRunCompletedAt !== "undefined" &&
    !isValidTimestamp(response.mockAgentRunCompletedAt)
  ) {
    errors.push("Localhost bridge run response mockAgentRunCompletedAt must be a valid timestamp when provided.");
  }

  if (
    typeof response.safeActionDiagnosticsAvailable !== "undefined" &&
    typeof response.safeActionDiagnosticsAvailable !== "boolean"
  ) {
    errors.push("Localhost bridge run response safeActionDiagnosticsAvailable must be boolean when provided.");
  }

  if (
    typeof response.safeActionDiagnosticsMessage !== "undefined" &&
    !optionalString(response.safeActionDiagnosticsMessage)
  ) {
    errors.push("Localhost bridge run response safeActionDiagnosticsMessage must be non-empty when provided.");
  }

  if (typeof response.safeActionDiagnostics !== "undefined") {
    const diagnostics = response.safeActionDiagnostics;

    if (!isObject(diagnostics)) {
      errors.push("Localhost bridge run response safeActionDiagnostics must be an object when provided.");
    } else {
      if (!optionalString(diagnostics.diagnosticsId)) {
        errors.push("Localhost bridge run response safeActionDiagnostics diagnosticsId is missing.");
      }

      if (!isValidTimestamp(diagnostics.createdAt)) {
        errors.push("Localhost bridge run response safeActionDiagnostics createdAt must be a valid timestamp.");
      }

      if (!isValidTimestamp(diagnostics.completedAt)) {
        errors.push("Localhost bridge run response safeActionDiagnostics completedAt must be a valid timestamp.");
      }

      if (!optionalString(diagnostics.runnerName)) {
        errors.push("Localhost bridge run response safeActionDiagnostics runnerName is missing.");
      }

      if (!Array.isArray(diagnostics.steps)) {
        errors.push("Localhost bridge run response safeActionDiagnostics steps must be an array.");
      }

      for (const [key, value] of [
        ["ok", diagnostics.ok],
        ["blocked", diagnostics.blocked],
        ["finalConfirmBlocked", diagnostics.finalConfirmBlocked],
        [
          "supportsRealBrowserExecution",
          diagnostics.supportsRealBrowserExecution,
        ],
      ] as const) {
        if (typeof value !== "boolean") {
          errors.push(`Localhost bridge run response safeActionDiagnostics ${key} must be boolean.`);
        }
      }

      for (const [key, value] of [
        ["validatedCount", diagnostics.validatedCount],
        ["executedCount", diagnostics.executedCount],
        ["blockedCount", diagnostics.blockedCount],
        ["skippedCount", diagnostics.skippedCount],
        ["failedCount", diagnostics.failedCount],
      ] as const) {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0
        ) {
          errors.push(`Localhost bridge run response safeActionDiagnostics ${key} must be a non-negative number.`);
        }
      }
    }
  }

  if (typeof response.mockOrderFillPlan !== "undefined") {
    const fillPlanValidation = validateMockOrderPageFillPlan(
      response.mockOrderFillPlan,
    );

    if (
      typeof response.mockOrderFillPlanValid === "boolean" &&
      response.mockOrderFillPlanValid !== fillPlanValidation.ok
    ) {
      errors.push("Localhost bridge run response mockOrderFillPlanValid must match fill-plan validation.");
    }

    warnings.push(
      ...fillPlanValidation.warnings.map(
        (warning) => `Mock order fill plan: ${warning}`,
      ),
    );

    if (!fillPlanValidation.ok) {
      warnings.push(
        ...fillPlanValidation.errors.map(
          (error) => `Mock order fill plan: ${error}`,
        ),
      );
    }
  }

  return createValidationResult(errors, warnings);
}

function getEnvelopePayloadRequestId(
  envelope: Partial<AvanzaAgentBridgeEnvelope> | null | undefined,
): string | null {
  return isObject(envelope?.payload)
    ? optionalString(envelope.payload.requestId)
    : null;
}

function hasUnsafeDryRunMetadata(
  metadata: Record<string, unknown> | undefined,
) {
  return (
    metadata?.allowFinalSubmit === true ||
    metadata?.supportsBrokerSubmission === true ||
    metadata?.supportsFinalConfirmClick === true ||
    metadata?.automaticModeCapable === true
  );
}

export function validateLocalhostBridgeHealthResponse(
  response: Partial<LocalhostBridgeHealthResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge health response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge health response");

  if (!optionalString(response.bridgeName)) {
    errors.push("Localhost bridge health response bridgeName is missing.");
  }

  if (!isSupportedBridgeStatus(response.bridgeStatus)) {
    errors.push("Localhost bridge health response bridgeStatus is unsupported.");
  }

  if (!isSupportedTransport(response.transport)) {
    errors.push("Localhost bridge health response transport is unsupported.");
  }

  if (!isObject(response.health)) {
    errors.push("Localhost bridge health response health is missing.");
  }

  if (!isObject(response.capabilities)) {
    errors.push("Localhost bridge health response capabilities are missing.");
  }

  if (!isValidTimestamp(response.serverTime)) {
    errors.push("Localhost bridge health response serverTime must be valid.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge health response message is missing.");
  }

  if (response.capabilities?.supportsRealBrokerAutomation === true) {
    warnings.push(
      "Localhost bridge health response reports real broker automation; this must stay false for the first stub prototype.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateRunnerSelfCheckShape(
  selfCheck: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(selfCheck)) {
    return createValidationResult(
      ["Localhost bridge self-check response selfCheck is missing."],
      warnings,
    );
  }

  if (typeof selfCheck.ok !== "boolean") {
    errors.push("Localhost bridge self-check selfCheck.ok must be boolean.");
  }

  if (!isSupportedRunnerSelfCheckStatus(selfCheck.status)) {
    errors.push("Localhost bridge self-check selfCheck.status is unsupported.");
  }

  if (!isValidTimestamp(selfCheck.checkedAt)) {
    errors.push("Localhost bridge self-check selfCheck.checkedAt must be valid.");
  }

  for (const key of ["runnerId", "runnerName", "version"] as const) {
    if (!optionalString(selfCheck[key])) {
      errors.push(`Localhost bridge self-check selfCheck.${key} is missing.`);
    }
  }

  if (!isObject(selfCheck.capabilityValidation)) {
    errors.push(
      "Localhost bridge self-check selfCheck.capabilityValidation is missing.",
    );
  } else {
    const validation = selfCheck.capabilityValidation;

    if (typeof validation.ok !== "boolean") {
      errors.push(
        "Localhost bridge self-check capabilityValidation.ok must be boolean.",
      );
    }

    if (typeof validation.blocked !== "boolean") {
      errors.push(
        "Localhost bridge self-check capabilityValidation.blocked must be boolean.",
      );
    }

    if (!optionalString(validation.safetyLevel)) {
      errors.push(
        "Localhost bridge self-check capabilityValidation.safetyLevel is missing.",
      );
    }

    for (const key of [
      "canRunMockBrowserActions",
      "canRunAvanzaDryRun",
      "canSubmitBrokerOrder",
    ] as const) {
      if (typeof validation[key] !== "boolean") {
        errors.push(
          `Localhost bridge self-check capabilityValidation.${key} must be boolean.`,
        );
      }
    }

    if (!Array.isArray(validation.errors)) {
      errors.push(
        "Localhost bridge self-check capabilityValidation.errors must be an array.",
      );
    }

    if (!Array.isArray(validation.warnings)) {
      errors.push(
        "Localhost bridge self-check capabilityValidation.warnings must be an array.",
      );
    }
  }

  for (const key of [
    "readinessLabels",
    "blockers",
    "warnings",
    "errors",
  ] as const) {
    if (!Array.isArray(selfCheck[key])) {
      errors.push(`Localhost bridge self-check selfCheck.${key} must be an array.`);
    }
  }

  if (
    selfCheck.status === "available_dry_run_only" &&
    selfCheck.ok !== true
  ) {
    errors.push(
      "Localhost bridge self-check available_dry_run_only status must have selfCheck.ok=true.",
    );
  }

  if (selfCheck.status === "unavailable" && selfCheck.ok === true) {
    errors.push(
      "Localhost bridge self-check unavailable status must have selfCheck.ok=false.",
    );
  }

  if (
    selfCheck.status === "available_dry_run_only" &&
    isObject(selfCheck.capabilityValidation) &&
    selfCheck.capabilityValidation.canRunAvanzaDryRun !== true
  ) {
    errors.push(
      "Localhost bridge self-check dry-run status must report canRunAvanzaDryRun=true.",
    );
  }

  if (
    isObject(selfCheck.capabilityValidation) &&
    selfCheck.capabilityValidation.canSubmitBrokerOrder === true
  ) {
    warnings.push(
      "Localhost bridge self-check reports broker submission capability; this must remain false for dry-run.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateRunnerCapabilityShape(
  capability: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];

  if (!isObject(capability)) {
    return createValidationResult(
      ["Localhost bridge self-check capability must be an object when provided."],
    );
  }

  for (const key of ["runnerId", "runnerName", "targetEnvironment"] as const) {
    if (!optionalString(capability[key])) {
      errors.push(`Localhost bridge self-check capability.${key} is missing.`);
    }
  }

  for (const key of [
    "supportsBrowserExecution",
    "supportsBrokerSubmission",
    "supportsFinalConfirmClick",
    "mockOnly",
    "devOnly",
    "automaticModeCapable",
  ] as const) {
    if (typeof capability[key] !== "boolean") {
      errors.push(`Localhost bridge self-check capability.${key} must be boolean.`);
    }
  }

  return createValidationResult(errors);
}

export function validateLocalhostBridgeRunnerSelfCheckResponse(
  response:
    | Partial<LocalhostBridgeRunnerSelfCheckResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge self-check response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge self-check response");

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge self-check response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push("Localhost bridge self-check response ok must be boolean.");
  }

  if (!isValidTimestamp(response.checkedAt)) {
    errors.push("Localhost bridge self-check response checkedAt must be valid.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge self-check response message is missing.");
  }

  if (!Array.isArray(response.errors)) {
    errors.push("Localhost bridge self-check response errors must be an array.");
  }

  if (!Array.isArray(response.warnings)) {
    errors.push("Localhost bridge self-check response warnings must be an array.");
  }

  const selfCheckValidation = validateRunnerSelfCheckShape(response.selfCheck);

  errors.push(...selfCheckValidation.errors);
  warnings.push(...selfCheckValidation.warnings);

  if (typeof response.capability !== "undefined") {
    const capabilityValidation = validateRunnerCapabilityShape(
      response.capability,
    );

    errors.push(...capabilityValidation.errors);
    warnings.push(...capabilityValidation.warnings);
  }

  return createValidationResult(errors, warnings);
}

function validateSessionDetectionShape(
  sessionDetection: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(sessionDetection)) {
    return createValidationResult(
      ["Localhost bridge session-detection response sessionDetection is missing."],
      warnings,
    );
  }

  if (typeof sessionDetection.ok !== "boolean") {
    errors.push(
      "Localhost bridge session-detection sessionDetection.ok must be boolean.",
    );
  }

  if (!isSupportedSessionDetectionStatus(sessionDetection.status)) {
    errors.push(
      "Localhost bridge session-detection sessionDetection.status is unsupported.",
    );
  }

  if (!isValidTimestamp(sessionDetection.checkedAt)) {
    errors.push(
      "Localhost bridge session-detection sessionDetection.checkedAt must be valid.",
    );
  }

  if (!isObject(sessionDetection.context)) {
    errors.push(
      "Localhost bridge session-detection sessionDetection.context is missing.",
    );
  }

  for (const key of ["blockers", "warnings", "errors", "labels"] as const) {
    if (!Array.isArray(sessionDetection[key])) {
      errors.push(
        `Localhost bridge session-detection sessionDetection.${key} must be an array.`,
      );
    }
  }

  if (
    sessionDetection.status === "ready_for_search_only" &&
    sessionDetection.ok !== true
  ) {
    errors.push(
      "Localhost bridge session-detection ready_for_search_only status must have sessionDetection.ok=true.",
    );
  }

  if (
    sessionDetection.status !== "ready_for_search_only" &&
    sessionDetection.ok === true
  ) {
    warnings.push(
      "Localhost bridge session-detection ok=true should only be used for ready_for_search_only.",
    );
  }

  if (isObject(sessionDetection.metadata)) {
    if (sessionDetection.metadata.noBrowserActions !== true) {
      errors.push(
        "Localhost bridge session-detection metadata must report noBrowserActions=true.",
      );
    }

    if (sessionDetection.metadata.noBrokerSubmission !== true) {
      errors.push(
        "Localhost bridge session-detection metadata must report noBrokerSubmission=true.",
      );
    }

    if (sessionDetection.metadata.noOrderPreparation !== true) {
      errors.push(
        "Localhost bridge session-detection metadata must report noOrderPreparation=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge session-detection sessionDetection.metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeSessionDetectionResponse(
  response:
    | Partial<LocalhostBridgeSessionDetectionResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge session-detection response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge session-detection response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge session-detection response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push("Localhost bridge session-detection response ok must be boolean.");
  }

  if (!isValidTimestamp(response.checkedAt)) {
    errors.push(
      "Localhost bridge session-detection response checkedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge session-detection response message is missing.");
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge session-detection response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge session-detection response warnings must be an array.",
    );
  }

  const sessionDetectionValidation = validateSessionDetectionShape(
    response.sessionDetection,
  );

  errors.push(...sessionDetectionValidation.errors);
  warnings.push(...sessionDetectionValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge session-detection response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge session-detection response metadata must report no_avanza_page_touched=true.",
      );
    }
  }

  return createValidationResult(errors, warnings);
}

function validateSearchOnlyExpectedInstrumentShape(
  expectedInstrument: unknown,
  errors: string[],
  subject: string,
) {
  if (!isObject(expectedInstrument)) {
    errors.push(`${subject} expectedInstrument is missing.`);
    return;
  }

  if (!optionalString(expectedInstrument.ticker)) {
    errors.push(`${subject} expectedInstrument.ticker is required.`);
  }

  for (const key of ["name", "market", "currency", "instrumentType"] as const) {
    if (
      typeof expectedInstrument[key] !== "undefined" &&
      typeof expectedInstrument[key] !== "string"
    ) {
      errors.push(`${subject} expectedInstrument.${key} must be a string.`);
    }
  }
}

function validateSearchOnlyCandidateShape(
  candidate: unknown,
  index: number,
  errors: string[],
) {
  if (!isObject(candidate)) {
    errors.push(`Localhost bridge search-only candidate ${index} is missing.`);
    return;
  }

  for (const key of ["candidateId", "displayName", "ticker"] as const) {
    if (!optionalString(candidate[key])) {
      errors.push(`Localhost bridge search-only candidate ${index}.${key} is missing.`);
    }
  }

  if (
    typeof candidate.matchConfidence !== "number" ||
    !Number.isFinite(candidate.matchConfidence) ||
    candidate.matchConfidence < 0 ||
    candidate.matchConfidence > 1
  ) {
    errors.push(
      `Localhost bridge search-only candidate ${index}.matchConfidence must be a number from 0 to 1.`,
    );
  }

  if (!Array.isArray(candidate.riskFlags)) {
    errors.push(`Localhost bridge search-only candidate ${index}.riskFlags must be an array.`);
  }

  if (!Array.isArray(candidate.warnings)) {
    errors.push(`Localhost bridge search-only candidate ${index}.warnings must be an array.`);
  }
}

function validateSearchOnlyShape(
  searchOnly: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(searchOnly)) {
    return createValidationResult(
      ["Localhost bridge search-only response searchOnly is missing."],
      warnings,
    );
  }

  if (typeof searchOnly.ok !== "boolean") {
    errors.push("Localhost bridge search-only searchOnly.ok must be boolean.");
  }

  if (!isSupportedSearchOnlyStatus(searchOnly.status)) {
    errors.push("Localhost bridge search-only searchOnly.status is unsupported.");
  }

  if (!isValidTimestamp(searchOnly.checkedAt)) {
    errors.push("Localhost bridge search-only searchOnly.checkedAt must be valid.");
  }

  validateSearchOnlyExpectedInstrumentShape(
    searchOnly.expectedInstrument,
    errors,
    "Localhost bridge search-only searchOnly",
  );

  if (!Array.isArray(searchOnly.candidates)) {
    errors.push("Localhost bridge search-only searchOnly.candidates must be an array.");
  } else {
    searchOnly.candidates.forEach((candidate, index) => {
      validateSearchOnlyCandidateShape(candidate, index, errors);
    });
  }

  for (const key of ["blockers", "warnings", "errors", "labels"] as const) {
    if (!Array.isArray(searchOnly[key])) {
      errors.push(
        `Localhost bridge search-only searchOnly.${key} must be an array.`,
      );
    }
  }

  if (searchOnly.status === "exact_match" && searchOnly.ok !== true) {
    errors.push(
      "Localhost bridge search-only exact_match status must have searchOnly.ok=true.",
    );
  }

  if (searchOnly.status !== "exact_match" && searchOnly.ok === true) {
    warnings.push(
      "Localhost bridge search-only ok=true should only be used for exact_match.",
    );
  }

  if (searchOnly.status === "exact_match" && !isObject(searchOnly.selectedCandidate)) {
    errors.push(
      "Localhost bridge search-only exact_match status must include selectedCandidate.",
    );
  }

  if (isObject(searchOnly.metadata)) {
    if (searchOnly.metadata.searchOnly !== true) {
      errors.push(
        "Localhost bridge search-only metadata must report searchOnly=true.",
      );
    }

    if (searchOnly.metadata.noOrderPage !== true) {
      errors.push(
        "Localhost bridge search-only metadata must report noOrderPage=true.",
      );
    }

    if (searchOnly.metadata.noBuySellClick !== true) {
      errors.push(
        "Localhost bridge search-only metadata must report noBuySellClick=true.",
      );
    }

    if (searchOnly.metadata.noBrokerSubmission !== true) {
      errors.push(
        "Localhost bridge search-only metadata must report noBrokerSubmission=true.",
      );
    }

    if (searchOnly.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge search-only metadata must report noTradeMutation=true.",
      );
    }

    if (searchOnly.metadata.noBrokerResult !== true) {
      errors.push(
        "Localhost bridge search-only metadata must report noBrokerResult=true.",
      );
    }
  } else {
    errors.push("Localhost bridge search-only searchOnly.metadata is missing.");
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeSearchOnlyRequest(
  request: Partial<LocalhostBridgeSearchOnlyRequest> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge search-only request is missing."],
      warnings,
    );
  }

  validateVersion(request.version, errors, "Localhost bridge search-only request");

  if (!optionalString(request.requestId)) {
    errors.push("Localhost bridge search-only request requestId is missing.");
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push("Localhost bridge search-only request createdAt must be a valid timestamp.");
  }

  validateSearchOnlyExpectedInstrumentShape(
    request.expectedInstrument,
    errors,
    "Localhost bridge search-only request",
  );

  if (typeof request.sessionDetection !== "undefined") {
    const sessionDetectionValidation = validateSessionDetectionShape(
      request.sessionDetection,
    );

    errors.push(...sessionDetectionValidation.errors);
    warnings.push(...sessionDetectionValidation.warnings);
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge search-only request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeSearchOnlyResponse(
  response:
    | Partial<LocalhostBridgeSearchOnlyResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge search-only response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge search-only response");

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge search-only response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push("Localhost bridge search-only response ok must be boolean.");
  }

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge search-only response requestId is missing.");
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push("Localhost bridge search-only response receivedAt must be valid.");
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push("Localhost bridge search-only response completedAt must be valid.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge search-only response message is missing.");
  }

  if (!Array.isArray(response.errors)) {
    errors.push("Localhost bridge search-only response errors must be an array.");
  }

  if (!Array.isArray(response.warnings)) {
    errors.push("Localhost bridge search-only response warnings must be an array.");
  }

  const searchOnlyValidation = validateSearchOnlyShape(response.searchOnly);

  errors.push(...searchOnlyValidation.errors);
  warnings.push(...searchOnlyValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge search-only response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge search-only response metadata must report no_avanza_page_touched=true.",
      );
    }

    if (response.metadata.no_order_page_opened !== true) {
      errors.push(
        "Localhost bridge search-only response metadata must report no_order_page_opened=true.",
      );
    }

    if (response.metadata.no_broker_result_created !== true) {
      errors.push(
        "Localhost bridge search-only response metadata must report no_broker_result_created=true.",
      );
    }

    if (response.metadata.no_trade_mutation !== true) {
      errors.push(
        "Localhost bridge search-only response metadata must report no_trade_mutation=true.",
      );
    }
  }

  const responseRecord = response as Record<string, unknown>;
  const brokerResultPresent =
    typeof responseRecord.brokerResult !== "undefined";

  if (brokerResultPresent) {
    errors.push("Localhost bridge search-only response must not include brokerResult.");
  }

  return createValidationResult(errors, warnings);
}

function validateInstrumentVerificationFieldChecks(
  fieldChecks: unknown,
  errors: string[],
) {
  if (!Array.isArray(fieldChecks)) {
    errors.push(
      "Localhost bridge instrument verification fieldChecks must be an array.",
    );
    return;
  }

  fieldChecks.forEach((check, index) => {
    if (!isObject(check)) {
      errors.push(
        `Localhost bridge instrument verification fieldChecks.${index} is missing.`,
      );
      return;
    }

    if (!optionalString(check.field)) {
      errors.push(
        `Localhost bridge instrument verification fieldChecks.${index}.field is missing.`,
      );
    }

    if (
      ![
        "match",
        "mismatch",
        "missing_expected",
        "missing_candidate",
        "warning",
      ].includes(String(check.status))
    ) {
      errors.push(
        `Localhost bridge instrument verification fieldChecks.${index}.status is unsupported.`,
      );
    }

    if (typeof check.required !== "boolean") {
      errors.push(
        `Localhost bridge instrument verification fieldChecks.${index}.required must be boolean.`,
      );
    }
  });
}

function validateInstrumentVerificationShape(
  instrumentVerification: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(instrumentVerification)) {
    return createValidationResult(
      [
        "Localhost bridge instrument verification response instrumentVerification is missing.",
      ],
      warnings,
    );
  }

  if (typeof instrumentVerification.ok !== "boolean") {
    errors.push(
      "Localhost bridge instrument verification instrumentVerification.ok must be boolean.",
    );
  }

  if (!isSupportedInstrumentVerificationStatus(instrumentVerification.status)) {
    errors.push(
      "Localhost bridge instrument verification instrumentVerification.status is unsupported.",
    );
  }

  if (!isValidTimestamp(instrumentVerification.checkedAt)) {
    errors.push(
      "Localhost bridge instrument verification instrumentVerification.checkedAt must be valid.",
    );
  }

  validateSearchOnlyExpectedInstrumentShape(
    instrumentVerification.expectedInstrument,
    errors,
    "Localhost bridge instrument verification instrumentVerification",
  );

  if (typeof instrumentVerification.selectedCandidate !== "undefined") {
    validateSearchOnlyCandidateShape(
      instrumentVerification.selectedCandidate,
      0,
      errors,
    );
  }

  validateInstrumentVerificationFieldChecks(
    instrumentVerification.fieldChecks,
    errors,
  );

  for (const key of [
    "riskFlags",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(instrumentVerification[key])) {
      errors.push(
        `Localhost bridge instrument verification instrumentVerification.${key} must be an array.`,
      );
    }
  }

  if (
    instrumentVerification.status === "verified" &&
    instrumentVerification.ok !== true
  ) {
    errors.push(
      "Localhost bridge instrument verification verified status must have instrumentVerification.ok=true.",
    );
  }

  if (
    instrumentVerification.status !== "verified" &&
    instrumentVerification.ok === true
  ) {
    warnings.push(
      "Localhost bridge instrument verification ok=true should only be used for verified.",
    );
  }

  if (isObject(instrumentVerification.metadata)) {
    if (instrumentVerification.metadata.instrumentVerificationOnly !== true) {
      errors.push(
        "Localhost bridge instrument verification metadata must report instrumentVerificationOnly=true.",
      );
    }

    if (instrumentVerification.metadata.noOrderPage !== true) {
      errors.push(
        "Localhost bridge instrument verification metadata must report noOrderPage=true.",
      );
    }

    if (instrumentVerification.metadata.noBuySellClick !== true) {
      errors.push(
        "Localhost bridge instrument verification metadata must report noBuySellClick=true.",
      );
    }

    if (instrumentVerification.metadata.noFormFill !== true) {
      errors.push(
        "Localhost bridge instrument verification metadata must report noFormFill=true.",
      );
    }

    if (instrumentVerification.metadata.noBrokerSubmission !== true) {
      errors.push(
        "Localhost bridge instrument verification metadata must report noBrokerSubmission=true.",
      );
    }

    if (instrumentVerification.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge instrument verification metadata must report noTradeMutation=true.",
      );
    }

    if (instrumentVerification.metadata.noBrokerResult !== true) {
      errors.push(
        "Localhost bridge instrument verification metadata must report noBrokerResult=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge instrument verification instrumentVerification.metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeInstrumentVerificationRequest(
  request:
    | Partial<LocalhostBridgeInstrumentVerificationRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge instrument verification request is missing."],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge instrument verification request",
  );

  if (!optionalString(request.requestId)) {
    errors.push(
      "Localhost bridge instrument verification request requestId is missing.",
    );
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge instrument verification request createdAt must be a valid timestamp.",
    );
  }

  validateSearchOnlyExpectedInstrumentShape(
    request.expectedInstrument,
    errors,
    "Localhost bridge instrument verification request",
  );

  if (typeof request.searchOnlyResult !== "undefined") {
    const searchOnlyValidation = validateSearchOnlyShape(
      request.searchOnlyResult,
    );

    errors.push(...searchOnlyValidation.errors);
    warnings.push(...searchOnlyValidation.warnings);
  }

  if (typeof request.selectedCandidate !== "undefined") {
    validateSearchOnlyCandidateShape(request.selectedCandidate, 0, errors);
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge instrument verification request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeInstrumentVerificationResponse(
  response:
    | Partial<LocalhostBridgeInstrumentVerificationResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge instrument verification response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge instrument verification response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge instrument verification response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push(
      "Localhost bridge instrument verification response ok must be boolean.",
    );
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge instrument verification response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge instrument verification response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge instrument verification response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push(
      "Localhost bridge instrument verification response message is missing.",
    );
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge instrument verification response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge instrument verification response warnings must be an array.",
    );
  }

  const verificationValidation = validateInstrumentVerificationShape(
    response.instrumentVerification,
  );

  errors.push(...verificationValidation.errors);
  warnings.push(...verificationValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge instrument verification response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge instrument verification response metadata must report no_avanza_page_touched=true.",
      );
    }

    if (response.metadata.no_order_page_opened !== true) {
      errors.push(
        "Localhost bridge instrument verification response metadata must report no_order_page_opened=true.",
      );
    }

    if (response.metadata.no_broker_result_created !== true) {
      errors.push(
        "Localhost bridge instrument verification response metadata must report no_broker_result_created=true.",
      );
    }

    if (response.metadata.no_trade_mutation !== true) {
      errors.push(
        "Localhost bridge instrument verification response metadata must report no_trade_mutation=true.",
      );
    }
  }

  const responseRecord = response as Record<string, unknown>;
  const brokerResultPresent =
    typeof responseRecord.brokerResult !== "undefined";

  if (brokerResultPresent) {
    errors.push(
      "Localhost bridge instrument verification response must not include brokerResult.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateInstrumentPageFieldChecks(
  fieldChecks: unknown,
  errors: string[],
) {
  if (!Array.isArray(fieldChecks)) {
    errors.push("Localhost bridge instrument page fieldChecks must be an array.");
    return;
  }

  fieldChecks.forEach((check, index) => {
    if (!isObject(check)) {
      errors.push(`Localhost bridge instrument page fieldChecks.${index} is missing.`);
      return;
    }

    if (!optionalString(check.field)) {
      errors.push(`Localhost bridge instrument page fieldChecks.${index}.field is missing.`);
    }

    if (
      ![
        "match",
        "mismatch",
        "missing_expected",
        "missing_page",
        "warning",
      ].includes(String(check.status))
    ) {
      errors.push(
        `Localhost bridge instrument page fieldChecks.${index}.status is unsupported.`,
      );
    }

    if (typeof check.required !== "boolean") {
      errors.push(
        `Localhost bridge instrument page fieldChecks.${index}.required must be boolean.`,
      );
    }
  });
}

function validateInstrumentPageShape(
  instrumentPage: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(instrumentPage)) {
    return createValidationResult(
      ["Localhost bridge instrument page response instrumentPage is missing."],
      warnings,
    );
  }

  if (typeof instrumentPage.ok !== "boolean") {
    errors.push("Localhost bridge instrument page instrumentPage.ok must be boolean.");
  }

  if (!isSupportedInstrumentPageStatus(instrumentPage.status)) {
    errors.push("Localhost bridge instrument page instrumentPage.status is unsupported.");
  }

  if (!isValidTimestamp(instrumentPage.checkedAt)) {
    errors.push("Localhost bridge instrument page instrumentPage.checkedAt must be valid.");
  }

  validateSearchOnlyExpectedInstrumentShape(
    instrumentPage.expectedInstrument,
    errors,
    "Localhost bridge instrument page instrumentPage",
  );

  validateInstrumentPageFieldChecks(instrumentPage.fieldChecks, errors);

  for (const key of [
    "riskFlags",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(instrumentPage[key])) {
      errors.push(
        `Localhost bridge instrument page instrumentPage.${key} must be an array.`,
      );
    }
  }

  if (instrumentPage.status === "page_identified" && instrumentPage.ok !== true) {
    errors.push(
      "Localhost bridge instrument page page_identified status must have instrumentPage.ok=true.",
    );
  }

  if (instrumentPage.status !== "page_identified" && instrumentPage.ok === true) {
    warnings.push(
      "Localhost bridge instrument page ok=true should only be used for page_identified.",
    );
  }

  if (isObject(instrumentPage.metadata)) {
    if (instrumentPage.metadata.instrumentPageIdentityOnly !== true) {
      errors.push(
        "Localhost bridge instrument page metadata must report instrumentPageIdentityOnly=true.",
      );
    }

    if (instrumentPage.metadata.noOrderPage !== true) {
      errors.push(
        "Localhost bridge instrument page metadata must report noOrderPage=true.",
      );
    }

    if (instrumentPage.metadata.noBuySellClick !== true) {
      errors.push(
        "Localhost bridge instrument page metadata must report noBuySellClick=true.",
      );
    }

    if (instrumentPage.metadata.noFormFill !== true) {
      errors.push(
        "Localhost bridge instrument page metadata must report noFormFill=true.",
      );
    }

    if (instrumentPage.metadata.noBrokerSubmission !== true) {
      errors.push(
        "Localhost bridge instrument page metadata must report noBrokerSubmission=true.",
      );
    }

    if (instrumentPage.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge instrument page metadata must report noTradeMutation=true.",
      );
    }

    if (instrumentPage.metadata.noBrokerResult !== true) {
      errors.push(
        "Localhost bridge instrument page metadata must report noBrokerResult=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge instrument page instrumentPage.metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeInstrumentPageRequest(
  request:
    | Partial<LocalhostBridgeInstrumentPageRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge instrument page request is missing."],
      warnings,
    );
  }

  validateVersion(request.version, errors, "Localhost bridge instrument page request");

  if (!optionalString(request.requestId)) {
    errors.push("Localhost bridge instrument page request requestId is missing.");
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge instrument page request createdAt must be a valid timestamp.",
    );
  }

  validateSearchOnlyExpectedInstrumentShape(
    request.expectedInstrument,
    errors,
    "Localhost bridge instrument page request",
  );

  if (typeof request.instrumentVerificationResult !== "undefined") {
    const verificationValidation = validateInstrumentVerificationShape(
      request.instrumentVerificationResult,
    );

    errors.push(...verificationValidation.errors);
    warnings.push(...verificationValidation.warnings);
  }

  if (
    typeof request.pageIdentity !== "undefined" &&
    !isObject(request.pageIdentity)
  ) {
    errors.push(
      "Localhost bridge instrument page request pageIdentity must be an object when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge instrument page request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeInstrumentPageResponse(
  response:
    | Partial<LocalhostBridgeInstrumentPageResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge instrument page response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge instrument page response");

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge instrument page response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push("Localhost bridge instrument page response ok must be boolean.");
  }

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge instrument page response requestId is missing.");
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push("Localhost bridge instrument page response receivedAt must be valid.");
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push("Localhost bridge instrument page response completedAt must be valid.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge instrument page response message is missing.");
  }

  if (!Array.isArray(response.errors)) {
    errors.push("Localhost bridge instrument page response errors must be an array.");
  }

  if (!Array.isArray(response.warnings)) {
    errors.push("Localhost bridge instrument page response warnings must be an array.");
  }

  const pageValidation = validateInstrumentPageShape(response.instrumentPage);

  errors.push(...pageValidation.errors);
  warnings.push(...pageValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge instrument page response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge instrument page response metadata must report no_avanza_page_touched=true.",
      );
    }

    if (response.metadata.no_order_page_opened !== true) {
      errors.push(
        "Localhost bridge instrument page response metadata must report no_order_page_opened=true.",
      );
    }

    if (response.metadata.no_buy_sell_click !== true) {
      errors.push(
        "Localhost bridge instrument page response metadata must report no_buy_sell_click=true.",
      );
    }

    if (response.metadata.no_form_fill !== true) {
      errors.push(
        "Localhost bridge instrument page response metadata must report no_form_fill=true.",
      );
    }

    if (response.metadata.no_broker_result_created !== true) {
      errors.push(
        "Localhost bridge instrument page response metadata must report no_broker_result_created=true.",
      );
    }

    if (response.metadata.no_trade_mutation !== true) {
      errors.push(
        "Localhost bridge instrument page response metadata must report no_trade_mutation=true.",
      );
    }
  }

  const responseRecord = response as Record<string, unknown>;
  const brokerResultPresent =
    typeof responseRecord.brokerResult !== "undefined";

  if (brokerResultPresent) {
    errors.push(
      "Localhost bridge instrument page response must not include brokerResult.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateOrderPageOpenFieldChecks(
  fieldChecks: unknown,
  errors: string[],
) {
  if (!Array.isArray(fieldChecks)) {
    errors.push("Localhost bridge order page open fieldChecks must be an array.");
    return;
  }

  fieldChecks.forEach((check, index) => {
    if (!isObject(check)) {
      errors.push(
        `Localhost bridge order page open fieldChecks.${index} is missing.`,
      );
      return;
    }

    if (!optionalString(check.field)) {
      errors.push(
        `Localhost bridge order page open fieldChecks.${index}.field is missing.`,
      );
    }

    if (
      ![
        "match",
        "mismatch",
        "missing_expected",
        "missing_page",
        "warning",
      ].includes(String(check.status))
    ) {
      errors.push(
        `Localhost bridge order page open fieldChecks.${index}.status is unsupported.`,
      );
    }

    if (typeof check.required !== "boolean") {
      errors.push(
        `Localhost bridge order page open fieldChecks.${index}.required must be boolean.`,
      );
    }
  });
}

function validateOrderPageOpenShape(
  orderPageOpen: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(orderPageOpen)) {
    return createValidationResult(
      ["Localhost bridge order page open response orderPageOpen is missing."],
      warnings,
    );
  }

  if (typeof orderPageOpen.ok !== "boolean") {
    errors.push(
      "Localhost bridge order page open orderPageOpen.ok must be boolean.",
    );
  }

  if (!isSupportedOrderPageOpenStatus(orderPageOpen.status)) {
    errors.push(
      "Localhost bridge order page open orderPageOpen.status is unsupported.",
    );
  }

  if (!isValidTimestamp(orderPageOpen.checkedAt)) {
    errors.push(
      "Localhost bridge order page open orderPageOpen.checkedAt must be valid.",
    );
  }

  if (
    typeof orderPageOpen.expectedAction !== "undefined" &&
    orderPageOpen.expectedAction !== "buy" &&
    orderPageOpen.expectedAction !== "sell"
  ) {
    errors.push(
      "Localhost bridge order page open expectedAction must be buy or sell when present.",
    );
  }

  if (!isObject(orderPageOpen.expectedInstrument)) {
    errors.push(
      "Localhost bridge order page open expectedInstrument is missing.",
    );
  } else if (!optionalString(orderPageOpen.expectedInstrument.ticker)) {
    errors.push(
      "Localhost bridge order page open expectedInstrument.ticker is required.",
    );
  }

  validateOrderPageOpenFieldChecks(orderPageOpen.fieldChecks, errors);

  for (const key of [
    "riskFlags",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(orderPageOpen[key])) {
      errors.push(
        `Localhost bridge order page open orderPageOpen.${key} must be an array.`,
      );
    }
  }

  if (
    orderPageOpen.status === "order_page_opened" &&
    orderPageOpen.ok !== true
  ) {
    errors.push(
      "Localhost bridge order page open order_page_opened status must have orderPageOpen.ok=true.",
    );
  }

  if (
    orderPageOpen.status !== "order_page_opened" &&
    orderPageOpen.ok === true
  ) {
    warnings.push(
      "Localhost bridge order page open ok=true should only be used for order_page_opened.",
    );
  }

  if (isObject(orderPageOpen.metadata)) {
    if (orderPageOpen.metadata.orderPageOpenOnly !== true) {
      errors.push(
        "Localhost bridge order page open metadata must report orderPageOpenOnly=true.",
      );
    }

    if (orderPageOpen.metadata.noFormFill !== true) {
      errors.push(
        "Localhost bridge order page open metadata must report noFormFill=true.",
      );
    }

    if (orderPageOpen.metadata.noReviewClick !== true) {
      errors.push(
        "Localhost bridge order page open metadata must report noReviewClick=true.",
      );
    }

    if (orderPageOpen.metadata.noFinalConfirmClick !== true) {
      errors.push(
        "Localhost bridge order page open metadata must report noFinalConfirmClick=true.",
      );
    }

    if (orderPageOpen.metadata.noBrokerSubmission !== true) {
      errors.push(
        "Localhost bridge order page open metadata must report noBrokerSubmission=true.",
      );
    }

    if (orderPageOpen.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge order page open metadata must report noTradeMutation=true.",
      );
    }

    if (orderPageOpen.metadata.noBrokerResult !== true) {
      errors.push(
        "Localhost bridge order page open metadata must report noBrokerResult=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge order page open orderPageOpen.metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeOrderPageOpenRequest(
  request:
    | Partial<LocalhostBridgeOrderPageOpenRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge order page open request is missing."],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge order page open request",
  );

  if (!optionalString(request.requestId)) {
    errors.push("Localhost bridge order page open request requestId is missing.");
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge order page open request createdAt must be a valid timestamp.",
    );
  }

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    request.dryRunOrderInput,
  );

  errors.push(...dryRunValidation.errors);
  warnings.push(...dryRunValidation.warnings);

  if (typeof request.instrumentPageResult !== "undefined") {
    const pageValidation = validateInstrumentPageShape(
      request.instrumentPageResult,
    );

    errors.push(...pageValidation.errors);
    warnings.push(...pageValidation.warnings);
  }

  if (
    typeof request.orderPageIdentity !== "undefined" &&
    !isObject(request.orderPageIdentity)
  ) {
    errors.push(
      "Localhost bridge order page open request orderPageIdentity must be an object when provided.",
    );
  }

  if (
    typeof request.attemptedAction !== "undefined" &&
    request.attemptedAction !== "buy" &&
    request.attemptedAction !== "sell"
  ) {
    errors.push(
      "Localhost bridge order page open request attemptedAction must be buy or sell when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge order page open request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeOrderPageOpenResponse(
  response:
    | Partial<LocalhostBridgeOrderPageOpenResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge order page open response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge order page open response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge order page open response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push("Localhost bridge order page open response ok must be boolean.");
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge order page open response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge order page open response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge order page open response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge order page open response message is missing.");
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge order page open response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge order page open response warnings must be an array.",
    );
  }

  const orderPageOpenValidation = validateOrderPageOpenShape(
    response.orderPageOpen,
  );

  errors.push(...orderPageOpenValidation.errors);
  warnings.push(...orderPageOpenValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge order page open response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge order page open response metadata must report no_avanza_page_touched=true.",
      );
    }

    if (response.metadata.no_form_fill !== true) {
      errors.push(
        "Localhost bridge order page open response metadata must report no_form_fill=true.",
      );
    }

    if (response.metadata.no_review_click !== true) {
      errors.push(
        "Localhost bridge order page open response metadata must report no_review_click=true.",
      );
    }

    if (response.metadata.no_final_confirm_click !== true) {
      errors.push(
        "Localhost bridge order page open response metadata must report no_final_confirm_click=true.",
      );
    }

    if (response.metadata.no_broker_result_created !== true) {
      errors.push(
        "Localhost bridge order page open response metadata must report no_broker_result_created=true.",
      );
    }

    if (response.metadata.no_trade_mutation !== true) {
      errors.push(
        "Localhost bridge order page open response metadata must report no_trade_mutation=true.",
      );
    }
  }

  const responseRecord = response as Record<string, unknown>;
  const brokerResultPresent =
    typeof responseRecord.brokerResult !== "undefined";

  if (brokerResultPresent) {
    errors.push(
      "Localhost bridge order page open response must not include brokerResult.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateAdvancedFormFillFieldChecks(
  fieldChecks: unknown,
  errors: string[],
) {
  if (!Array.isArray(fieldChecks)) {
    errors.push(
      "Localhost bridge advanced form fill fieldChecks must be an array.",
    );
    return;
  }

  fieldChecks.forEach((check, index) => {
    if (!isObject(check)) {
      errors.push(
        `Localhost bridge advanced form fill fieldChecks.${index} is missing.`,
      );
      return;
    }

    if (!optionalString(check.field)) {
      errors.push(
        `Localhost bridge advanced form fill fieldChecks.${index}.field is missing.`,
      );
    }

    if (
      ![
        "match",
        "mismatch",
        "missing_expected",
        "missing_actual",
        "invalid_actual",
        "warning",
      ].includes(String(check.status))
    ) {
      errors.push(
        `Localhost bridge advanced form fill fieldChecks.${index}.status is unsupported.`,
      );
    }

    if (typeof check.required !== "boolean") {
      errors.push(
        `Localhost bridge advanced form fill fieldChecks.${index}.required must be boolean.`,
      );
    }
  });
}

function validateAdvancedFormFillShape(
  advancedFormFill: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(advancedFormFill)) {
    return createValidationResult(
      [
        "Localhost bridge advanced form fill response advancedFormFill is missing.",
      ],
      warnings,
    );
  }

  if (typeof advancedFormFill.ok !== "boolean") {
    errors.push(
      "Localhost bridge advanced form fill advancedFormFill.ok must be boolean.",
    );
  }

  if (!isSupportedAdvancedFormFillStatus(advancedFormFill.status)) {
    errors.push(
      "Localhost bridge advanced form fill advancedFormFill.status is unsupported.",
    );
  }

  if (!isValidTimestamp(advancedFormFill.checkedAt)) {
    errors.push(
      "Localhost bridge advanced form fill advancedFormFill.checkedAt must be valid.",
    );
  }

  if (
    advancedFormFill.expectedAction !== "buy" &&
    advancedFormFill.expectedAction !== "sell"
  ) {
    errors.push(
      "Localhost bridge advanced form fill expectedAction must be buy or sell.",
    );
  }

  if (!isObject(advancedFormFill.expectedInstrument)) {
    errors.push(
      "Localhost bridge advanced form fill expectedInstrument is missing.",
    );
  } else if (!optionalString(advancedFormFill.expectedInstrument.ticker)) {
    errors.push(
      "Localhost bridge advanced form fill expectedInstrument.ticker is required.",
    );
  }

  for (const key of ["expectedQuantity", "expectedPrice"] as const) {
    if (
      typeof advancedFormFill[key] !== "number" ||
      !Number.isFinite(advancedFormFill[key]) ||
      advancedFormFill[key] <= 0
    ) {
      errors.push(
        `Localhost bridge advanced form fill ${key} must be a positive finite number.`,
      );
    }
  }

  if (
    typeof advancedFormFill.formState !== "undefined" &&
    !isObject(advancedFormFill.formState)
  ) {
    errors.push(
      "Localhost bridge advanced form fill formState must be an object when provided.",
    );
  }

  validateAdvancedFormFillFieldChecks(advancedFormFill.fieldChecks, errors);

  for (const key of [
    "riskFlags",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(advancedFormFill[key])) {
      errors.push(
        `Localhost bridge advanced form fill advancedFormFill.${key} must be an array.`,
      );
    }
  }

  if (
    advancedFormFill.status === "form_filled" &&
    advancedFormFill.ok !== true
  ) {
    errors.push(
      "Localhost bridge advanced form fill form_filled status must have advancedFormFill.ok=true.",
    );
  }

  if (
    advancedFormFill.status !== "form_filled" &&
    advancedFormFill.ok === true
  ) {
    warnings.push(
      "Localhost bridge advanced form fill ok=true should only be used for form_filled.",
    );
  }

  if (isObject(advancedFormFill.metadata)) {
    if (advancedFormFill.metadata.advancedFormFillOnly !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report advancedFormFillOnly=true.",
      );
    }

    if (advancedFormFill.metadata.noReviewClick !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report noReviewClick=true.",
      );
    }

    if (advancedFormFill.metadata.noFinalConfirmClick !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report noFinalConfirmClick=true.",
      );
    }

    if (advancedFormFill.metadata.noKeyboardSubmit !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report noKeyboardSubmit=true.",
      );
    }

    if (advancedFormFill.metadata.noBrokerSubmission !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report noBrokerSubmission=true.",
      );
    }

    if (advancedFormFill.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report noTradeMutation=true.",
      );
    }

    if (advancedFormFill.metadata.noBrokerResult !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report noBrokerResult=true.",
      );
    }

    if (advancedFormFill.metadata.noSupabaseWrite !== true) {
      errors.push(
        "Localhost bridge advanced form fill metadata must report noSupabaseWrite=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge advanced form fill advancedFormFill.metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeAdvancedFormFillRequest(
  request:
    | Partial<LocalhostBridgeAdvancedFormFillRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge advanced form fill request is missing."],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge advanced form fill request",
  );

  if (!optionalString(request.requestId)) {
    errors.push(
      "Localhost bridge advanced form fill request requestId is missing.",
    );
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge advanced form fill request createdAt must be a valid timestamp.",
    );
  }

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    request.dryRunOrderInput,
  );

  errors.push(...dryRunValidation.errors);
  warnings.push(...dryRunValidation.warnings);

  if (typeof request.orderPageOpenResult !== "undefined") {
    const orderPageValidation = validateOrderPageOpenShape(
      request.orderPageOpenResult,
    );

    errors.push(...orderPageValidation.errors);
    warnings.push(...orderPageValidation.warnings);
  }

  if (
    typeof request.formState !== "undefined" &&
    !isObject(request.formState)
  ) {
    errors.push(
      "Localhost bridge advanced form fill request formState must be an object when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge advanced form fill request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeAdvancedFormFillResponse(
  response:
    | Partial<LocalhostBridgeAdvancedFormFillResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge advanced form fill response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge advanced form fill response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge advanced form fill response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push(
      "Localhost bridge advanced form fill response ok must be boolean.",
    );
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge advanced form fill response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge advanced form fill response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge advanced form fill response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push(
      "Localhost bridge advanced form fill response message is missing.",
    );
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge advanced form fill response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge advanced form fill response warnings must be an array.",
    );
  }

  const formFillValidation = validateAdvancedFormFillShape(
    response.advancedFormFill,
  );

  errors.push(...formFillValidation.errors);
  warnings.push(...formFillValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_avanza_page_touched=true.",
      );
    }

    if (response.metadata.no_real_form_fields_filled !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_real_form_fields_filled=true.",
      );
    }

    if (response.metadata.no_review_click !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_review_click=true.",
      );
    }

    if (response.metadata.no_final_confirm_click !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_final_confirm_click=true.",
      );
    }

    if (response.metadata.no_broker_result_created !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_broker_result_created=true.",
      );
    }

    if (response.metadata.no_supabase_write !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_supabase_write=true.",
      );
    }

    if (response.metadata.no_trade_mutation !== true) {
      errors.push(
        "Localhost bridge advanced form fill response metadata must report no_trade_mutation=true.",
      );
    }
  }

  const responseRecord = response as Record<string, unknown>;
  const brokerResultPresent =
    typeof responseRecord.brokerResult !== "undefined";

  if (brokerResultPresent) {
    errors.push(
      "Localhost bridge advanced form fill response must not include brokerResult.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateReviewClickFieldChecks(
  fieldChecks: unknown,
  errors: string[],
) {
  if (!Array.isArray(fieldChecks)) {
    errors.push("Localhost bridge review click fieldChecks must be an array.");
    return;
  }

  fieldChecks.forEach((check, index) => {
    if (!isObject(check)) {
      errors.push(
        `Localhost bridge review click fieldChecks.${index} is missing.`,
      );
      return;
    }

    if (!optionalString(check.field)) {
      errors.push(
        `Localhost bridge review click fieldChecks.${index}.field is missing.`,
      );
    }

    if (
      ![
        "match",
        "mismatch",
        "missing_expected",
        "missing_modal",
        "warning",
      ].includes(String(check.status))
    ) {
      errors.push(
        `Localhost bridge review click fieldChecks.${index}.status is unsupported.`,
      );
    }

    if (typeof check.required !== "boolean") {
      errors.push(
        `Localhost bridge review click fieldChecks.${index}.required must be boolean.`,
      );
    }
  });
}

function validateReviewClickShape(
  reviewClick: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(reviewClick)) {
    return createValidationResult(
      ["Localhost bridge review click response reviewClick is missing."],
      warnings,
    );
  }

  if (typeof reviewClick.ok !== "boolean") {
    errors.push("Localhost bridge review click reviewClick.ok must be boolean.");
  }

  if (!isSupportedReviewClickStatus(reviewClick.status)) {
    errors.push(
      "Localhost bridge review click reviewClick.status is unsupported.",
    );
  }

  if (!isValidTimestamp(reviewClick.checkedAt)) {
    errors.push(
      "Localhost bridge review click reviewClick.checkedAt must be valid.",
    );
  }

  if (
    reviewClick.expectedAction !== "buy" &&
    reviewClick.expectedAction !== "sell"
  ) {
    errors.push(
      "Localhost bridge review click expectedAction must be buy or sell.",
    );
  }

  if (!isObject(reviewClick.expectedInstrument)) {
    errors.push("Localhost bridge review click expectedInstrument is missing.");
  } else if (!optionalString(reviewClick.expectedInstrument.ticker)) {
    errors.push(
      "Localhost bridge review click expectedInstrument.ticker is required.",
    );
  }

  for (const key of ["expectedQuantity", "expectedPrice"] as const) {
    if (
      typeof reviewClick[key] !== "number" ||
      !Number.isFinite(reviewClick[key]) ||
      reviewClick[key] <= 0
    ) {
      errors.push(
        `Localhost bridge review click ${key} must be a positive finite number.`,
      );
    }
  }

  if (
    typeof reviewClick.confirmationReadback !== "undefined" &&
    !isObject(reviewClick.confirmationReadback)
  ) {
    errors.push(
      "Localhost bridge review click confirmationReadback must be an object when provided.",
    );
  }

  validateReviewClickFieldChecks(reviewClick.fieldChecks, errors);

  for (const key of [
    "riskFlags",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(reviewClick[key])) {
      errors.push(
        `Localhost bridge review click reviewClick.${key} must be an array.`,
      );
    }
  }

  if (
    reviewClick.status === "confirmation_ready" &&
    reviewClick.ok !== true
  ) {
    errors.push(
      "Localhost bridge review click confirmation_ready status must have reviewClick.ok=true.",
    );
  }

  if (
    reviewClick.status !== "confirmation_ready" &&
    reviewClick.ok === true
  ) {
    warnings.push(
      "Localhost bridge review click ok=true should only be used for confirmation_ready.",
    );
  }

  if (isObject(reviewClick.metadata)) {
    if (reviewClick.metadata.reviewClickReadbackOnly !== true) {
      errors.push(
        "Localhost bridge review click metadata must report reviewClickReadbackOnly=true.",
      );
    }

    if (reviewClick.metadata.noFinalConfirmClick !== true) {
      errors.push(
        "Localhost bridge review click metadata must report noFinalConfirmClick=true.",
      );
    }

    if (reviewClick.metadata.noKeyboardSubmit !== true) {
      errors.push(
        "Localhost bridge review click metadata must report noKeyboardSubmit=true.",
      );
    }

    if (reviewClick.metadata.noBrokerSubmission !== true) {
      errors.push(
        "Localhost bridge review click metadata must report noBrokerSubmission=true.",
      );
    }

    if (reviewClick.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge review click metadata must report noTradeMutation=true.",
      );
    }

    if (reviewClick.metadata.noBrokerResult !== true) {
      errors.push(
        "Localhost bridge review click metadata must report noBrokerResult=true.",
      );
    }

    if (reviewClick.metadata.noSupabaseWrite !== true) {
      errors.push(
        "Localhost bridge review click metadata must report noSupabaseWrite=true.",
      );
    }
  } else {
    errors.push("Localhost bridge review click reviewClick.metadata is missing.");
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeReviewClickRequest(
  request: Partial<LocalhostBridgeReviewClickRequest> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge review click request is missing."],
      warnings,
    );
  }

  validateVersion(request.version, errors, "Localhost bridge review click request");

  if (!optionalString(request.requestId)) {
    errors.push("Localhost bridge review click request requestId is missing.");
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge review click request createdAt must be a valid timestamp.",
    );
  }

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    request.dryRunOrderInput,
  );

  errors.push(...dryRunValidation.errors);
  warnings.push(...dryRunValidation.warnings);

  if (typeof request.advancedFormFillResult !== "undefined") {
    const formFillValidation = validateAdvancedFormFillShape(
      request.advancedFormFillResult,
    );

    errors.push(...formFillValidation.errors);
    warnings.push(...formFillValidation.warnings);
  }

  if (
    typeof request.confirmationReadback !== "undefined" &&
    !isObject(request.confirmationReadback)
  ) {
    errors.push(
      "Localhost bridge review click request confirmationReadback must be an object when provided.",
    );
  }

  if (
    typeof request.reviewClickAttempted !== "undefined" &&
    typeof request.reviewClickAttempted !== "boolean"
  ) {
    errors.push(
      "Localhost bridge review click request reviewClickAttempted must be boolean when provided.",
    );
  }

  if (
    typeof request.reviewLabel !== "undefined" &&
    !optionalString(request.reviewLabel)
  ) {
    errors.push(
      "Localhost bridge review click request reviewLabel must be a non-empty string when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge review click request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeReviewClickResponse(
  response: Partial<LocalhostBridgeReviewClickResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge review click response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge review click response");

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge review click response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push("Localhost bridge review click response ok must be boolean.");
  }

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge review click response requestId is missing.");
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge review click response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge review click response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge review click response message is missing.");
  }

  if (!Array.isArray(response.errors)) {
    errors.push("Localhost bridge review click response errors must be an array.");
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge review click response warnings must be an array.",
    );
  }

  const reviewClickValidation = validateReviewClickShape(response.reviewClick);

  errors.push(...reviewClickValidation.errors);
  warnings.push(...reviewClickValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge review click response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge review click response metadata must report no_avanza_page_touched=true.",
      );
    }

    if (response.metadata.no_real_granska_clicked !== true) {
      errors.push(
        "Localhost bridge review click response metadata must report no_real_granska_clicked=true.",
      );
    }

    if (response.metadata.no_bekrafta_clicked !== true) {
      errors.push(
        "Localhost bridge review click response metadata must report no_bekrafta_clicked=true.",
      );
    }

    if (response.metadata.no_broker_result_created !== true) {
      errors.push(
        "Localhost bridge review click response metadata must report no_broker_result_created=true.",
      );
    }

    if (response.metadata.no_supabase_write !== true) {
      errors.push(
        "Localhost bridge review click response metadata must report no_supabase_write=true.",
      );
    }

    if (response.metadata.no_trade_mutation !== true) {
      errors.push(
        "Localhost bridge review click response metadata must report no_trade_mutation=true.",
      );
    }
  }

  const responseRecord = response as Record<string, unknown>;
  const brokerResultPresent =
    typeof responseRecord.brokerResult !== "undefined";

  if (brokerResultPresent) {
    errors.push(
      "Localhost bridge review click response must not include brokerResult.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateManualConfirmationWaitShape(
  manualConfirmationWait: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(manualConfirmationWait)) {
    return createValidationResult(
      [
        "Localhost bridge manual confirmation wait response manualConfirmationWait is missing.",
      ],
      warnings,
    );
  }

  if (typeof manualConfirmationWait.ok !== "boolean") {
    errors.push(
      "Localhost bridge manual confirmation wait manualConfirmationWait.ok must be boolean.",
    );
  }

  if (!isSupportedManualConfirmationWaitStatus(manualConfirmationWait.status)) {
    errors.push(
      "Localhost bridge manual confirmation wait manualConfirmationWait.status is unsupported.",
    );
  }

  if (!isValidTimestamp(manualConfirmationWait.checkedAt)) {
    errors.push(
      "Localhost bridge manual confirmation wait manualConfirmationWait.checkedAt must be valid.",
    );
  }

  if (!isSupportedReviewClickStatus(manualConfirmationWait.reviewClickStatus)) {
    errors.push(
      "Localhost bridge manual confirmation wait reviewClickStatus is unsupported.",
    );
  }

  if (typeof manualConfirmationWait.waitingForManualConfirmation !== "boolean") {
    errors.push(
      "Localhost bridge manual confirmation wait waitingForManualConfirmation must be boolean.",
    );
  }

  if (
    typeof manualConfirmationWait.observation !== "undefined" &&
    !isObject(manualConfirmationWait.observation)
  ) {
    errors.push(
      "Localhost bridge manual confirmation wait observation must be an object when provided.",
    );
  }

  for (const key of [
    "riskFlags",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(manualConfirmationWait[key])) {
      errors.push(
        `Localhost bridge manual confirmation wait manualConfirmationWait.${key} must be an array.`,
      );
    }
  }

  if (
    manualConfirmationWait.status === "waiting_for_manual_confirmation" &&
    manualConfirmationWait.ok !== true
  ) {
    errors.push(
      "Localhost bridge manual confirmation wait waiting_for_manual_confirmation status must have ok=true.",
    );
  }

  if (
    manualConfirmationWait.status !== "waiting_for_manual_confirmation" &&
    manualConfirmationWait.ok === true
  ) {
    warnings.push(
      "Localhost bridge manual confirmation wait ok=true should only be used for waiting_for_manual_confirmation.",
    );
  }

  if (isObject(manualConfirmationWait.metadata)) {
    if (manualConfirmationWait.metadata.manualConfirmationWaitOnly !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait metadata must report manualConfirmationWaitOnly=true.",
      );
    }

    if (manualConfirmationWait.metadata.noFinalConfirmClick !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait metadata must report noFinalConfirmClick=true.",
      );
    }

    if (manualConfirmationWait.metadata.noKeyboardSubmit !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait metadata must report noKeyboardSubmit=true.",
      );
    }

    if (manualConfirmationWait.metadata.noBrokerResult !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait metadata must report noBrokerResult=true.",
      );
    }

    if (manualConfirmationWait.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait metadata must report noTradeMutation=true.",
      );
    }

    if (manualConfirmationWait.metadata.noSupabaseWrite !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait metadata must report noSupabaseWrite=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge manual confirmation wait manualConfirmationWait.metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeManualConfirmationWaitRequest(
  request:
    | Partial<LocalhostBridgeManualConfirmationWaitRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge manual confirmation wait request is missing."],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge manual confirmation wait request",
  );

  if (!optionalString(request.requestId)) {
    errors.push(
      "Localhost bridge manual confirmation wait request requestId is missing.",
    );
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge manual confirmation wait request createdAt must be a valid timestamp.",
    );
  }

  if (typeof request.reviewClickResult !== "undefined") {
    const reviewClickValidation = validateReviewClickShape(
      request.reviewClickResult,
    );

    errors.push(...reviewClickValidation.errors);
    warnings.push(...reviewClickValidation.warnings);
  }

  if (
    typeof request.observation !== "undefined" &&
    !isObject(request.observation)
  ) {
    errors.push(
      "Localhost bridge manual confirmation wait request observation must be an object when provided.",
    );
  }

  if (
    typeof request.timeoutMs !== "undefined" &&
    (typeof request.timeoutMs !== "number" ||
      !Number.isFinite(request.timeoutMs) ||
      request.timeoutMs <= 0)
  ) {
    errors.push(
      "Localhost bridge manual confirmation wait request timeoutMs must be a positive finite number when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge manual confirmation wait request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeManualConfirmationWaitResponse(
  response:
    | Partial<LocalhostBridgeManualConfirmationWaitResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge manual confirmation wait response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge manual confirmation wait response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge manual confirmation wait response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push(
      "Localhost bridge manual confirmation wait response ok must be boolean.",
    );
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge manual confirmation wait response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge manual confirmation wait response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge manual confirmation wait response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push(
      "Localhost bridge manual confirmation wait response message is missing.",
    );
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge manual confirmation wait response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge manual confirmation wait response warnings must be an array.",
    );
  }

  const waitValidation = validateManualConfirmationWaitShape(
    response.manualConfirmationWait,
  );

  errors.push(...waitValidation.errors);
  warnings.push(...waitValidation.warnings);

  if (isObject(response.metadata)) {
    if (response.metadata.no_browser_actions_executed !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait response metadata must report no_browser_actions_executed=true.",
      );
    }

    if (response.metadata.no_avanza_page_touched !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait response metadata must report no_avanza_page_touched=true.",
      );
    }

    if (response.metadata.no_bekrafta_clicked !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait response metadata must report no_bekrafta_clicked=true.",
      );
    }

    if (response.metadata.no_broker_result_created !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait response metadata must report no_broker_result_created=true.",
      );
    }

    if (response.metadata.no_supabase_write !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait response metadata must report no_supabase_write=true.",
      );
    }

    if (response.metadata.no_trade_mutation !== true) {
      errors.push(
        "Localhost bridge manual confirmation wait response metadata must report no_trade_mutation=true.",
      );
    }
  }

  const responseRecord = response as Record<string, unknown>;
  const brokerResultPresent =
    typeof responseRecord.brokerResult !== "undefined";

  if (brokerResultPresent) {
    errors.push(
      "Localhost bridge manual confirmation wait response must not include brokerResult.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateBrokerConfirmationCaptureShape(
  brokerConfirmationCapture: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(brokerConfirmationCapture)) {
    return createValidationResult(
      [
        "Localhost bridge broker confirmation capture response brokerConfirmationCapture is missing.",
      ],
      warnings,
    );
  }

  if (typeof brokerConfirmationCapture.ok !== "boolean") {
    errors.push(
      "Localhost bridge broker confirmation capture brokerConfirmationCapture.ok must be boolean.",
    );
  }

  if (
    !isSupportedBrokerConfirmationCaptureStatus(
      brokerConfirmationCapture.status,
    )
  ) {
    errors.push(
      "Localhost bridge broker confirmation capture brokerConfirmationCapture.status is unsupported.",
    );
  }

  if (!isValidTimestamp(brokerConfirmationCapture.checkedAt)) {
    errors.push(
      "Localhost bridge broker confirmation capture brokerConfirmationCapture.checkedAt must be valid.",
    );
  }

  if (
    brokerConfirmationCapture.expectedAction !== "buy" &&
    brokerConfirmationCapture.expectedAction !== "sell"
  ) {
    errors.push(
      "Localhost bridge broker confirmation capture expectedAction must be buy or sell.",
    );
  }

  if (!isObject(brokerConfirmationCapture.expectedInstrument)) {
    errors.push(
      "Localhost bridge broker confirmation capture expectedInstrument is missing.",
    );
  } else if (!optionalString(brokerConfirmationCapture.expectedInstrument.ticker)) {
    errors.push(
      "Localhost bridge broker confirmation capture expectedInstrument.ticker is required.",
    );
  }

  for (const key of ["expectedQuantity", "expectedPrice"] as const) {
    if (
      typeof brokerConfirmationCapture[key] !== "number" ||
      !Number.isFinite(brokerConfirmationCapture[key]) ||
      brokerConfirmationCapture[key] <= 0
    ) {
      errors.push(
        `Localhost bridge broker confirmation capture ${key} must be a positive finite number.`,
      );
    }
  }

  if (!isSupportedBrokerConfirmationOrderStatus(brokerConfirmationCapture.orderStatus)) {
    errors.push(
      "Localhost bridge broker confirmation capture orderStatus is unsupported.",
    );
  }

  if (
    brokerConfirmationCapture.status === "confirmation_captured" &&
    brokerConfirmationCapture.ok !== true
  ) {
    errors.push(
      "Localhost bridge broker confirmation capture confirmation_captured status must have ok=true.",
    );
  }

  if (
    brokerConfirmationCapture.status !== "confirmation_captured" &&
    brokerConfirmationCapture.ok === true
  ) {
    warnings.push(
      "Localhost bridge broker confirmation capture ok=true should only be used for confirmation_captured.",
    );
  }

  for (const key of [
    "fieldChecks",
    "riskFlags",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(brokerConfirmationCapture[key])) {
      errors.push(
        `Localhost bridge broker confirmation capture brokerConfirmationCapture.${key} must be an array.`,
      );
    }
  }

  if (isObject(brokerConfirmationCapture.metadata)) {
    if (brokerConfirmationCapture.metadata.brokerConfirmationCaptureOnly !== true) {
      errors.push(
        "Localhost bridge broker confirmation capture metadata must report brokerConfirmationCaptureOnly=true.",
      );
    }

    if (brokerConfirmationCapture.metadata.noBekraftaByAgent !== true) {
      errors.push(
        "Localhost bridge broker confirmation capture metadata must report noBekraftaByAgent=true.",
      );
    }

    if (brokerConfirmationCapture.metadata.noBrokerExecutionResult !== true) {
      errors.push(
        "Localhost bridge broker confirmation capture metadata must report noBrokerExecutionResult=true.",
      );
    }

    if (brokerConfirmationCapture.metadata.noExecutionRecord !== true) {
      errors.push(
        "Localhost bridge broker confirmation capture metadata must report noExecutionRecord=true.",
      );
    }

    if (brokerConfirmationCapture.metadata.noSupabaseWrite !== true) {
      errors.push(
        "Localhost bridge broker confirmation capture metadata must report noSupabaseWrite=true.",
      );
    }

    if (brokerConfirmationCapture.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge broker confirmation capture metadata must report noTradeMutation=true.",
      );
    }

    if (brokerConfirmationCapture.metadata.sanitizedEvidenceOnly !== true) {
      errors.push(
        "Localhost bridge broker confirmation capture metadata must report sanitizedEvidenceOnly=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge broker confirmation capture brokerConfirmationCapture.metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeBrokerConfirmationCaptureRequest(
  request:
    | Partial<LocalhostBridgeBrokerConfirmationCaptureRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge broker confirmation capture request is missing."],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge broker confirmation capture request",
  );

  if (!optionalString(request.requestId)) {
    errors.push(
      "Localhost bridge broker confirmation capture request requestId is missing.",
    );
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge broker confirmation capture request createdAt must be a valid timestamp.",
    );
  }

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    request.dryRunOrderInput,
  );
  errors.push(...dryRunValidation.errors);
  warnings.push(...dryRunValidation.warnings);

  if (typeof request.manualConfirmationWaitResult !== "undefined") {
    const waitValidation = validateManualConfirmationWaitShape(
      request.manualConfirmationWaitResult,
    );

    errors.push(...waitValidation.errors);
    warnings.push(...waitValidation.warnings);
  }

  if (
    typeof request.brokerConfirmationReadback !== "undefined" &&
    !isObject(request.brokerConfirmationReadback)
  ) {
    errors.push(
      "Localhost bridge broker confirmation capture request brokerConfirmationReadback must be an object when provided.",
    );
  }

  if (
    isObject(request.dryRunOrderInput?.metadata) &&
    hasUnsafeDryRunMetadata(request.dryRunOrderInput.metadata)
  ) {
    errors.push(
      "Localhost bridge broker confirmation capture request dryRunOrderInput metadata contains unsafe submit or broker automation flags.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge broker confirmation capture request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeBrokerConfirmationCaptureResponse(
  response:
    | Partial<LocalhostBridgeBrokerConfirmationCaptureResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge broker confirmation capture response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge broker confirmation capture response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge broker confirmation capture response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push(
      "Localhost bridge broker confirmation capture response ok must be boolean.",
    );
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge broker confirmation capture response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge broker confirmation capture response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge broker confirmation capture response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push(
      "Localhost bridge broker confirmation capture response message is missing.",
    );
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge broker confirmation capture response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge broker confirmation capture response warnings must be an array.",
    );
  }

  const captureValidation = validateBrokerConfirmationCaptureShape(
    response.brokerConfirmationCapture,
  );

  errors.push(...captureValidation.errors);
  warnings.push(...captureValidation.warnings);

  if (isObject(response.metadata)) {
    for (const [key, message] of [
      [
        "no_browser_actions_executed",
        "metadata must report no_browser_actions_executed=true.",
      ],
      [
        "no_avanza_page_touched",
        "metadata must report no_avanza_page_touched=true.",
      ],
      [
        "no_browser_control",
        "metadata must report no_browser_control=true.",
      ],
      [
        "no_avanza_urls",
        "metadata must report no_avanza_urls=true.",
      ],
      [
        "no_avanza_selectors",
        "metadata must report no_avanza_selectors=true.",
      ],
      [
        "no_bekrafta_clicked",
        "metadata must report no_bekrafta_clicked=true.",
      ],
      [
        "no_final_confirm_click",
        "metadata must report no_final_confirm_click=true.",
      ],
      [
        "no_broker_execution_result_created",
        "metadata must report no_broker_execution_result_created=true.",
      ],
      [
        "no_execution_record_created",
        "metadata must report no_execution_record_created=true.",
      ],
      [
        "no_supabase_write",
        "metadata must report no_supabase_write=true.",
      ],
      [
        "no_trade_mutation",
        "metadata must report no_trade_mutation=true.",
      ],
    ] as const) {
      if (response.metadata[key] !== true) {
        errors.push(
          `Localhost bridge broker confirmation capture response ${message}`,
        );
      }
    }
  }

  const responseRecord = response as Record<string, unknown>;

  if (typeof responseRecord.brokerResult !== "undefined") {
    errors.push(
      "Localhost bridge broker confirmation capture response must not include brokerResult.",
    );
  }

  if (typeof responseRecord.executionRecord !== "undefined") {
    errors.push(
      "Localhost bridge broker confirmation capture response must not include executionRecord.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateBrokerExecutionResultEligibilityShape(
  eligibility: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(eligibility)) {
    return createValidationResult(
      ["Localhost bridge broker execution result eligibility is missing."],
      warnings,
    );
  }

  if (typeof eligibility.ok !== "boolean") {
    errors.push(
      "Localhost bridge broker execution result eligibility ok must be boolean.",
    );
  }

  if (!isSupportedBrokerExecutionResultEligibilityStatus(eligibility.status)) {
    errors.push(
      "Localhost bridge broker execution result eligibility status is unsupported.",
    );
  }

  if (!isValidTimestamp(eligibility.checkedAt)) {
    errors.push(
      "Localhost bridge broker execution result eligibility checkedAt must be valid.",
    );
  }

  if (typeof eligibility.eligible !== "boolean") {
    errors.push(
      "Localhost bridge broker execution result eligibility eligible must be boolean.",
    );
  }

  if (eligibility.status === "eligible" && eligibility.ok !== true) {
    errors.push(
      "Localhost bridge broker execution result eligibility eligible status must have ok=true.",
    );
  }

  if (eligibility.status !== "eligible" && eligibility.ok === true) {
    warnings.push(
      "Localhost bridge broker execution result eligibility ok=true should only be used for eligible.",
    );
  }

  for (const key of [
    "reasons",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(eligibility[key])) {
      errors.push(
        `Localhost bridge broker execution result eligibility ${key} must be an array.`,
      );
    }
  }

  if (!optionalString(eligibility.evidenceFingerprint)) {
    errors.push(
      "Localhost bridge broker execution result eligibility evidenceFingerprint is missing.",
    );
  }

  if (isObject(eligibility.metadata)) {
    if (eligibility.metadata.eligibilityCheckOnly !== true) {
      errors.push(
        "Localhost bridge broker execution result eligibility metadata must report eligibilityCheckOnly=true.",
      );
    }

    if (eligibility.metadata.noBrokerExecutionResultCreated !== true) {
      errors.push(
        "Localhost bridge broker execution result eligibility metadata must report noBrokerExecutionResultCreated=true.",
      );
    }

    if (eligibility.metadata.noExecutionRecordCreated !== true) {
      errors.push(
        "Localhost bridge broker execution result eligibility metadata must report noExecutionRecordCreated=true.",
      );
    }

    if (eligibility.metadata.noSupabaseWrite !== true) {
      errors.push(
        "Localhost bridge broker execution result eligibility metadata must report noSupabaseWrite=true.",
      );
    }

    if (eligibility.metadata.noTradeMutation !== true) {
      errors.push(
        "Localhost bridge broker execution result eligibility metadata must report noTradeMutation=true.",
      );
    }
  } else {
    errors.push(
      "Localhost bridge broker execution result eligibility metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateBrokerExecutionResultPreviewShape(
  previewResult: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(previewResult)) {
    return createValidationResult(
      ["Localhost bridge broker execution result preview is missing."],
      warnings,
    );
  }

  if (typeof previewResult.ok !== "boolean") {
    errors.push(
      "Localhost bridge broker execution result preview ok must be boolean.",
    );
  }

  if (!isSupportedBrokerExecutionResultPreviewStatus(previewResult.status)) {
    errors.push(
      "Localhost bridge broker execution result preview status is unsupported.",
    );
  }

  if (!isValidTimestamp(previewResult.checkedAt)) {
    errors.push(
      "Localhost bridge broker execution result preview checkedAt must be valid.",
    );
  }

  if (previewResult.status === "preview_available" && previewResult.ok !== true) {
    errors.push(
      "Localhost bridge broker execution result preview_available status must have ok=true.",
    );
  }

  if (previewResult.status !== "preview_available" && previewResult.ok === true) {
    warnings.push(
      "Localhost bridge broker execution result preview ok=true should only be used for preview_available.",
    );
  }

  const eligibilityValidation = validateBrokerExecutionResultEligibilityShape(
    previewResult.eligibility,
  );
  errors.push(...eligibilityValidation.errors);
  warnings.push(...eligibilityValidation.warnings);

  for (const key of [
    "fields",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(previewResult[key])) {
      errors.push(
        `Localhost bridge broker execution result preview ${key} must be an array.`,
      );
    }
  }

  if (previewResult.status === "preview_available") {
    if (!isObject(previewResult.preview)) {
      errors.push(
        "Localhost bridge broker execution result preview_available response must include preview.",
      );
    } else {
      const preview = previewResult.preview;

      if (preview.broker !== "avanza") {
        errors.push(
          "Localhost bridge broker execution result preview broker must be avanza.",
        );
      }

      if (preview.action !== "buy" && preview.action !== "sell") {
        errors.push(
          "Localhost bridge broker execution result preview action must be buy or sell.",
        );
      }

      if (!optionalString(preview.ticker)) {
        errors.push(
          "Localhost bridge broker execution result preview ticker is missing.",
        );
      }

      if (typeof preview.quantity !== "number" || preview.quantity <= 0) {
        errors.push(
          "Localhost bridge broker execution result preview quantity must be positive.",
        );
      }

      if (typeof preview.price !== "number" || preview.price <= 0) {
        errors.push(
          "Localhost bridge broker execution result preview price must be positive.",
        );
      }

      if (!optionalString(preview.sourceCaptureFingerprint)) {
        errors.push(
          "Localhost bridge broker execution result preview sourceCaptureFingerprint is missing.",
        );
      }

      if (isObject(preview.metadata)) {
        for (const [key, message] of [
          ["previewOnly", "preview metadata must report previewOnly=true."],
          [
            "notBrokerExecutionResult",
            "preview metadata must report notBrokerExecutionResult=true.",
          ],
          [
            "noExecutionRecord",
            "preview metadata must report noExecutionRecord=true.",
          ],
          [
            "noSupabaseWrite",
            "preview metadata must report noSupabaseWrite=true.",
          ],
          [
            "noTradeMutation",
            "preview metadata must report noTradeMutation=true.",
          ],
        ] as const) {
          if (preview.metadata[key] !== true) {
            errors.push(`Localhost bridge broker execution result ${message}`);
          }
        }
      } else {
        errors.push(
          "Localhost bridge broker execution result preview metadata is missing.",
        );
      }
    }
  }

  if (previewResult.status !== "preview_available" && isObject(previewResult.preview)) {
    errors.push(
      "Localhost bridge broker execution result preview must be absent unless status is preview_available.",
    );
  }

  if (isObject(previewResult.metadata)) {
    for (const [key, message] of [
      ["previewOnly", "metadata must report previewOnly=true."],
      [
        "notBrokerExecutionResult",
        "metadata must report notBrokerExecutionResult=true.",
      ],
      ["noExecutionRecord", "metadata must report noExecutionRecord=true."],
      ["noSupabaseWrite", "metadata must report noSupabaseWrite=true."],
      ["noTradeMutation", "metadata must report noTradeMutation=true."],
    ] as const) {
      if (previewResult.metadata[key] !== true) {
        errors.push(
          `Localhost bridge broker execution result preview ${message}`,
        );
      }
    }
  } else {
    errors.push(
      "Localhost bridge broker execution result preview metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateExecutionRecordCandidateShape(
  candidate: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(candidate)) {
    return createValidationResult(
      ["Localhost bridge execution record eligibility candidate must be an object."],
      warnings,
    );
  }

  for (const key of [
    "broker",
    "action",
    "ticker",
    "timestamp",
    "brokerOrderId",
    "sourceEvidenceFingerprint",
    "sourceRequestId",
    "sourceCaptureId",
    "sourceBrokerResultFingerprint",
    "status",
  ] as const) {
    if (
      typeof candidate[key] !== "undefined" &&
      !optionalString(candidate[key])
    ) {
      errors.push(
        `Localhost bridge execution record eligibility candidate ${key} must be a non-empty string when provided.`,
      );
    }
  }

  for (const key of ["quantity", "price", "fees", "totalAmount"] as const) {
    if (
      typeof candidate[key] !== "undefined" &&
      candidate[key] !== null &&
      typeof candidate[key] !== "number"
    ) {
      errors.push(
        `Localhost bridge execution record eligibility candidate ${key} must be a number when provided.`,
      );
    }
  }

  if (typeof candidate.warnings !== "undefined" && !Array.isArray(candidate.warnings)) {
    errors.push(
      "Localhost bridge execution record eligibility candidate warnings must be an array when provided.",
    );
  }

  if (
    typeof candidate.metadata !== "undefined" &&
    candidate.metadata !== null &&
    !isObject(candidate.metadata)
  ) {
    errors.push(
      "Localhost bridge execution record eligibility candidate metadata must be an object when provided.",
    );
  }

  return createValidationResult(errors, warnings);
}

function validateExecutionRecordEligibilityShape(
  eligibility: unknown,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(eligibility)) {
    return createValidationResult(
      ["Localhost bridge execution record eligibility result is missing."],
      warnings,
    );
  }

  if (typeof eligibility.ok !== "boolean") {
    errors.push(
      "Localhost bridge execution record eligibility ok must be boolean.",
    );
  }

  if (!isSupportedExecutionRecordEligibilityStatus(eligibility.status)) {
    errors.push(
      "Localhost bridge execution record eligibility status is unsupported.",
    );
  }

  if (!isValidTimestamp(eligibility.checkedAt)) {
    errors.push(
      "Localhost bridge execution record eligibility checkedAt must be valid.",
    );
  }

  if (typeof eligibility.eligible !== "boolean") {
    errors.push(
      "Localhost bridge execution record eligibility eligible must be boolean.",
    );
  }

  if (eligibility.status === "eligible" && eligibility.ok !== true) {
    errors.push(
      "Localhost bridge execution record eligibility eligible status must have ok=true.",
    );
  }

  if (eligibility.status !== "eligible" && eligibility.ok === true) {
    warnings.push(
      "Localhost bridge execution record eligibility ok=true should only be used for eligible.",
    );
  }

  for (const key of [
    "reasons",
    "blockers",
    "warnings",
    "errors",
    "labels",
  ] as const) {
    if (!Array.isArray(eligibility[key])) {
      errors.push(
        `Localhost bridge execution record eligibility ${key} must be an array.`,
      );
    }
  }

  if (
    eligibility.status === "eligible" &&
    !optionalString(eligibility.recordFingerprint)
  ) {
    errors.push(
      "Localhost bridge execution record eligibility eligible result must include recordFingerprint.",
    );
  }

  if (isObject(eligibility.metadata)) {
    for (const [key, message] of [
      ["eligibilityOnly", "metadata must report eligibilityOnly=true."],
      [
        "noExecutionRecordCreated",
        "metadata must report noExecutionRecordCreated=true.",
      ],
      ["noSupabaseWrite", "metadata must report noSupabaseWrite=true."],
      ["noTradeMutation", "metadata must report noTradeMutation=true."],
    ] as const) {
      if (eligibility.metadata[key] !== true) {
        errors.push(
          `Localhost bridge execution record eligibility ${message}`,
        );
      }
    }
  } else {
    errors.push(
      "Localhost bridge execution record eligibility metadata is missing.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeBrokerExecutionResultEligibilityRequest(
  request:
    | Partial<LocalhostBridgeBrokerExecutionResultEligibilityRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      [
        "Localhost bridge broker execution result eligibility request is missing.",
      ],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge broker execution result eligibility request",
  );

  if (!optionalString(request.requestId)) {
    errors.push(
      "Localhost bridge broker execution result eligibility request requestId is missing.",
    );
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge broker execution result eligibility request createdAt must be a valid timestamp.",
    );
  }

  if (typeof request.captureResult !== "undefined") {
    const captureValidation = validateBrokerConfirmationCaptureShape(
      request.captureResult,
    );

    errors.push(...captureValidation.errors);
    warnings.push(...captureValidation.warnings);
  }

  if (
    typeof request.existingFingerprints !== "undefined" &&
    (!Array.isArray(request.existingFingerprints) ||
      request.existingFingerprints.some(
        (fingerprint) => !optionalString(fingerprint),
      ))
  ) {
    errors.push(
      "Localhost bridge broker execution result eligibility request existingFingerprints must be an array of strings when provided.",
    );
  }

  if (
    typeof request.options !== "undefined" &&
    request.options !== null &&
    !isObject(request.options)
  ) {
    errors.push(
      "Localhost bridge broker execution result eligibility request options must be an object when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge broker execution result eligibility request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeBrokerExecutionResultEligibilityResponse(
  response:
    | Partial<LocalhostBridgeBrokerExecutionResultEligibilityResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      [
        "Localhost bridge broker execution result eligibility response is missing.",
      ],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge broker execution result eligibility response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge broker execution result eligibility response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push(
      "Localhost bridge broker execution result eligibility response ok must be boolean.",
    );
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge broker execution result eligibility response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge broker execution result eligibility response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge broker execution result eligibility response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push(
      "Localhost bridge broker execution result eligibility response message is missing.",
    );
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge broker execution result eligibility response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge broker execution result eligibility response warnings must be an array.",
    );
  }

  const eligibilityValidation = validateBrokerExecutionResultEligibilityShape(
    response.eligibility,
  );

  errors.push(...eligibilityValidation.errors);
  warnings.push(...eligibilityValidation.warnings);

  if (response.ok === true && response.eligibility?.status !== "eligible") {
    warnings.push(
      "Localhost bridge broker execution result eligibility response ok=true should only be used for eligible eligibility.",
    );
  }

  if (isObject(response.metadata)) {
    for (const [key, message] of [
      [
        "eligibility_check_only",
        "metadata must report eligibility_check_only=true.",
      ],
      [
        "no_broker_execution_result_created",
        "metadata must report no_broker_execution_result_created=true.",
      ],
      [
        "no_execution_record_created",
        "metadata must report no_execution_record_created=true.",
      ],
      [
        "no_supabase_write",
        "metadata must report no_supabase_write=true.",
      ],
      [
        "no_trade_mutation",
        "metadata must report no_trade_mutation=true.",
      ],
      [
        "no_browser_control",
        "metadata must report no_browser_control=true.",
      ],
      [
        "no_avanza_page_touched",
        "metadata must report no_avanza_page_touched=true.",
      ],
    ] as const) {
      if (response.metadata[key] !== true) {
        errors.push(
          `Localhost bridge broker execution result eligibility response ${message}`,
        );
      }
    }
  } else {
    errors.push(
      "Localhost bridge broker execution result eligibility response metadata is missing.",
    );
  }

  const responseRecord = response as Record<string, unknown>;

  if (typeof responseRecord.brokerResult !== "undefined") {
    errors.push(
      "Localhost bridge broker execution result eligibility response must not include brokerResult.",
    );
  }

  if (typeof responseRecord.executionRecord !== "undefined") {
    errors.push(
      "Localhost bridge broker execution result eligibility response must not include executionRecord.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeBrokerExecutionResultPreviewRequest(
  request:
    | Partial<LocalhostBridgeBrokerExecutionResultPreviewRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge broker execution result preview request is missing."],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge broker execution result preview request",
  );

  if (!optionalString(request.requestId)) {
    errors.push(
      "Localhost bridge broker execution result preview request requestId is missing.",
    );
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge broker execution result preview request createdAt must be a valid timestamp.",
    );
  }

  if (typeof request.captureResult !== "undefined") {
    const captureValidation = validateBrokerConfirmationCaptureShape(
      request.captureResult,
    );

    errors.push(...captureValidation.errors);
    warnings.push(...captureValidation.warnings);
  }

  if (typeof request.eligibilityResult !== "undefined") {
    const eligibilityValidation = validateBrokerExecutionResultEligibilityShape(
      request.eligibilityResult,
    );

    errors.push(...eligibilityValidation.errors);
    warnings.push(...eligibilityValidation.warnings);
  }

  if (
    typeof request.existingFingerprints !== "undefined" &&
    (!Array.isArray(request.existingFingerprints) ||
      request.existingFingerprints.some(
        (fingerprint) => !optionalString(fingerprint),
      ))
  ) {
    errors.push(
      "Localhost bridge broker execution result preview request existingFingerprints must be an array of strings when provided.",
    );
  }

  if (
    typeof request.options !== "undefined" &&
    request.options !== null &&
    !isObject(request.options)
  ) {
    errors.push(
      "Localhost bridge broker execution result preview request options must be an object when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge broker execution result preview request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeBrokerExecutionResultPreviewResponse(
  response:
    | Partial<LocalhostBridgeBrokerExecutionResultPreviewResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge broker execution result preview response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge broker execution result preview response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge broker execution result preview response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push(
      "Localhost bridge broker execution result preview response ok must be boolean.",
    );
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge broker execution result preview response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge broker execution result preview response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge broker execution result preview response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push(
      "Localhost bridge broker execution result preview response message is missing.",
    );
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge broker execution result preview response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge broker execution result preview response warnings must be an array.",
    );
  }

  const previewValidation = validateBrokerExecutionResultPreviewShape(
    response.brokerExecutionResultPreview,
  );

  errors.push(...previewValidation.errors);
  warnings.push(...previewValidation.warnings);

  if (
    response.ok === true &&
    response.brokerExecutionResultPreview?.status !== "preview_available"
  ) {
    warnings.push(
      "Localhost bridge broker execution result preview response ok=true should only be used for preview_available.",
    );
  }

  if (isObject(response.metadata)) {
    for (const [key, message] of [
      ["preview_only", "metadata must report preview_only=true."],
      [
        "no_real_broker_execution_result_created",
        "metadata must report no_real_broker_execution_result_created=true.",
      ],
      [
        "no_execution_record_created",
        "metadata must report no_execution_record_created=true.",
      ],
      [
        "no_supabase_write",
        "metadata must report no_supabase_write=true.",
      ],
      [
        "no_trade_mutation",
        "metadata must report no_trade_mutation=true.",
      ],
      [
        "no_browser_control",
        "metadata must report no_browser_control=true.",
      ],
      [
        "no_avanza_page_touched",
        "metadata must report no_avanza_page_touched=true.",
      ],
    ] as const) {
      if (response.metadata[key] !== true) {
        errors.push(
          `Localhost bridge broker execution result preview response ${message}`,
        );
      }
    }
  } else {
    errors.push(
      "Localhost bridge broker execution result preview response metadata is missing.",
    );
  }

  const responseRecord = response as Record<string, unknown>;

  if (typeof responseRecord.brokerResult !== "undefined") {
    errors.push(
      "Localhost bridge broker execution result preview response must not include brokerResult.",
    );
  }

  if (typeof responseRecord.executionRecord !== "undefined") {
    errors.push(
      "Localhost bridge broker execution result preview response must not include executionRecord.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeExecutionRecordEligibilityRequest(
  request:
    | Partial<LocalhostBridgeExecutionRecordEligibilityRequest>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge execution record eligibility request is missing."],
      warnings,
    );
  }

  validateVersion(
    request.version,
    errors,
    "Localhost bridge execution record eligibility request",
  );

  if (!optionalString(request.requestId)) {
    errors.push(
      "Localhost bridge execution record eligibility request requestId is missing.",
    );
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push(
      "Localhost bridge execution record eligibility request createdAt must be a valid timestamp.",
    );
  }

  if (typeof request.candidate !== "undefined") {
    const candidateValidation = validateExecutionRecordCandidateShape(
      request.candidate,
    );

    errors.push(...candidateValidation.errors);
    warnings.push(...candidateValidation.warnings);
  }

  for (const key of [
    "existingSourceFingerprints",
    "existingBrokerReferences",
  ] as const) {
    if (
      typeof request[key] !== "undefined" &&
      (!Array.isArray(request[key]) ||
        request[key]?.some((value) => !optionalString(value)))
    ) {
      errors.push(
        `Localhost bridge execution record eligibility request ${key} must be an array of strings when provided.`,
      );
    }
  }

  if (
    typeof request.options !== "undefined" &&
    request.options !== null &&
    !isObject(request.options)
  ) {
    errors.push(
      "Localhost bridge execution record eligibility request options must be an object when provided.",
    );
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push(
      "Localhost bridge execution record eligibility request metadata contains unsafe submit or broker automation flags.",
    );
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeExecutionRecordEligibilityResponse(
  response:
    | Partial<LocalhostBridgeExecutionRecordEligibilityResponse>
    | null
    | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge execution record eligibility response is missing."],
      warnings,
    );
  }

  validateVersion(
    response.version,
    errors,
    "Localhost bridge execution record eligibility response",
  );

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge execution record eligibility response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push(
      "Localhost bridge execution record eligibility response ok must be boolean.",
    );
  }

  if (!optionalString(response.requestId)) {
    errors.push(
      "Localhost bridge execution record eligibility response requestId is missing.",
    );
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push(
      "Localhost bridge execution record eligibility response receivedAt must be valid.",
    );
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push(
      "Localhost bridge execution record eligibility response completedAt must be valid.",
    );
  }

  if (!optionalString(response.message)) {
    errors.push(
      "Localhost bridge execution record eligibility response message is missing.",
    );
  }

  if (!Array.isArray(response.errors)) {
    errors.push(
      "Localhost bridge execution record eligibility response errors must be an array.",
    );
  }

  if (!Array.isArray(response.warnings)) {
    errors.push(
      "Localhost bridge execution record eligibility response warnings must be an array.",
    );
  }

  const eligibilityValidation = validateExecutionRecordEligibilityShape(
    response.executionRecordEligibility,
  );

  errors.push(...eligibilityValidation.errors);
  warnings.push(...eligibilityValidation.warnings);

  if (
    response.ok === true &&
    response.executionRecordEligibility?.status !== "eligible"
  ) {
    warnings.push(
      "Localhost bridge execution record eligibility response ok=true should only be used for eligible eligibility.",
    );
  }

  if (isObject(response.metadata)) {
    for (const [key, message] of [
      [
        "execution_record_eligibility_check_only",
        "metadata must report execution_record_eligibility_check_only=true.",
      ],
      [
        "no_broker_execution_result_created",
        "metadata must report no_broker_execution_result_created=true.",
      ],
      [
        "no_execution_record_created",
        "metadata must report no_execution_record_created=true.",
      ],
      [
        "no_supabase_write",
        "metadata must report no_supabase_write=true.",
      ],
      [
        "no_trade_mutation",
        "metadata must report no_trade_mutation=true.",
      ],
      [
        "no_browser_control",
        "metadata must report no_browser_control=true.",
      ],
      [
        "no_avanza_page_touched",
        "metadata must report no_avanza_page_touched=true.",
      ],
    ] as const) {
      if (response.metadata[key] !== true) {
        errors.push(
          `Localhost bridge execution record eligibility response ${message}`,
        );
      }
    }
  } else {
    errors.push(
      "Localhost bridge execution record eligibility response metadata is missing.",
    );
  }

  const responseRecord = response as Record<string, unknown>;

  for (const key of ["brokerResult", "brokerExecutionResult", "executionRecord"] as const) {
    if (typeof responseRecord[key] !== "undefined") {
      errors.push(
        `Localhost bridge execution record eligibility response must not include ${key}.`,
      );
    }
  }

  return createValidationResult(errors, warnings);
}

function validateDryRunCapabilityOptions(
  options: unknown,
  errors: string[],
) {
  if (typeof options === "undefined") {
    return;
  }

  if (!isObject(options)) {
    errors.push("Localhost bridge dry-run request capabilityValidationOptions must be an object when provided.");
    return;
  }

  for (const key of [
    "allowAvanzaDryRun",
    "allowBrokerSubmission",
    "allowAutomaticMode",
  ] as const) {
    if (typeof options[key] !== "undefined" && typeof options[key] !== "boolean") {
      errors.push(`Localhost bridge dry-run request capabilityValidationOptions.${key} must be boolean when provided.`);
    }
  }

  if (options.allowBrokerSubmission === true) {
    errors.push("Localhost bridge dry-run request must not allow broker submission.");
  }

  if (options.allowAutomaticMode === true) {
    errors.push("Localhost bridge dry-run request must not allow automatic mode.");
  }
}

export function validateLocalhostBridgeDryRunRequest(
  request: Partial<LocalhostBridgeDryRunRequest> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge dry-run request is missing."],
      warnings,
    );
  }

  validateVersion(request.version, errors, "Localhost bridge dry-run request");

  if (!optionalString(request.requestId)) {
    errors.push("Localhost bridge dry-run request requestId is missing.");
  }

  if (!isValidTimestamp(request.createdAt)) {
    errors.push("Localhost bridge dry-run request createdAt must be a valid timestamp.");
  }

  validateDryRunCapabilityOptions(
    request.capabilityValidationOptions,
    errors,
  );

  const dryRunValidation = validateAvanzaDryRunOrderInput(
    request.dryRunOrderInput,
  );

  if (!dryRunValidation.ok) {
    errors.push(
      ...dryRunValidation.errors.map(
        (error) => `Avanza dry-run request: ${error}`,
      ),
    );
  }

  warnings.push(
    ...dryRunValidation.warnings.map(
      (warning) => `Avanza dry-run request: ${warning}`,
    ),
  );

  if (
    isObject(request.dryRunOrderInput?.metadata) &&
    hasUnsafeDryRunMetadata(request.dryRunOrderInput.metadata)
  ) {
    errors.push("Localhost bridge dry-run request metadata contains unsafe submit or broker automation flags.");
  }

  if (isObject(request.metadata) && hasUnsafeDryRunMetadata(request.metadata)) {
    errors.push("Localhost bridge dry-run request metadata contains unsafe submit or broker automation flags.");
  }

  return createValidationResult(errors, warnings);
}

function validateCapabilityValidationShape(
  validation: unknown,
  errors: string[],
  subject: string,
) {
  if (!isObject(validation)) {
    errors.push(`${subject} capabilityValidation is missing.`);
    return;
  }

  for (const key of [
    "ok",
    "blocked",
    "canRunMockBrowserActions",
    "canRunAvanzaDryRun",
    "canSubmitBrokerOrder",
  ] as const) {
    if (typeof validation[key] !== "boolean") {
      errors.push(`${subject} capabilityValidation.${key} must be boolean.`);
    }
  }

  if (!optionalString(validation.safetyLevel)) {
    errors.push(`${subject} capabilityValidation.safetyLevel is missing.`);
  }

  if (!Array.isArray(validation.errors)) {
    errors.push(`${subject} capabilityValidation.errors must be an array.`);
  }

  if (!Array.isArray(validation.warnings)) {
    errors.push(`${subject} capabilityValidation.warnings must be an array.`);
  }

  if (validation.canSubmitBrokerOrder === true) {
    errors.push(`${subject} capabilityValidation must not allow broker submission.`);
  }
}

export function validateLocalhostBridgeDryRunResponse(
  response: Partial<LocalhostBridgeDryRunResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge dry-run response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge dry-run response");

  if (response.bridgeVersion !== LOCALHOST_BRIDGE_CONTRACT_VERSION) {
    errors.push(
      `Localhost bridge dry-run response bridgeVersion must be ${LOCALHOST_BRIDGE_CONTRACT_VERSION}.`,
    );
  }

  if (typeof response.ok !== "boolean") {
    errors.push("Localhost bridge dry-run response ok must be boolean.");
  }

  if (!isSupportedDryRunStatus(response.status)) {
    errors.push("Localhost bridge dry-run response status is unsupported.");
  }

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge dry-run response requestId is missing.");
  }

  if (!isValidTimestamp(response.receivedAt)) {
    errors.push("Localhost bridge dry-run response receivedAt must be valid.");
  }

  if (!isValidTimestamp(response.completedAt)) {
    errors.push("Localhost bridge dry-run response completedAt must be valid.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge dry-run response message is missing.");
  }

  if (!Array.isArray(response.errors)) {
    errors.push("Localhost bridge dry-run response errors must be an array.");
  }

  if (!Array.isArray(response.warnings)) {
    errors.push("Localhost bridge dry-run response warnings must be an array.");
  }

  if (!isObject(response.dryRunRequestValidation)) {
    errors.push("Localhost bridge dry-run response dryRunRequestValidation is missing.");
  } else {
    if (typeof response.dryRunRequestValidation.ok !== "boolean") {
      errors.push("Localhost bridge dry-run response dryRunRequestValidation.ok must be boolean.");
    }

    if (!Array.isArray(response.dryRunRequestValidation.errors)) {
      errors.push("Localhost bridge dry-run response dryRunRequestValidation.errors must be an array.");
    }

    if (!Array.isArray(response.dryRunRequestValidation.warnings)) {
      errors.push("Localhost bridge dry-run response dryRunRequestValidation.warnings must be an array.");
    }
  }

  validateCapabilityValidationShape(
    response.capabilityValidation,
    errors,
    "Localhost bridge dry-run response",
  );

  if (response.selfCheck) {
    const selfCheckValidation = validateRunnerSelfCheckShape(response.selfCheck);

    errors.push(...selfCheckValidation.errors);
    warnings.push(...selfCheckValidation.warnings);
  }

  if (
    typeof response.diagnostics !== "undefined" &&
    response.diagnostics !== null
  ) {
    errors.push("Localhost bridge dry-run response diagnostics must be absent or null until a runner exists.");
  }

  if (response.ok === true && response.status !== "accepted_stub") {
    warnings.push("Localhost bridge dry-run response ok=true should only be used for accepted_stub.");
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeRunRequest(
  request: Partial<LocalhostBridgeRunRequest> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(
      ["Localhost bridge run request is missing."],
      warnings,
    );
  }

  validateVersion(request.version, errors, "Localhost bridge run request");

  if (request.dryRun !== true) {
    errors.push("Localhost bridge run request dryRun must be true.");
  }

  if (
    typeof request.enableMockAgentRun !== "undefined" &&
    typeof request.enableMockAgentRun !== "boolean"
  ) {
    errors.push("Localhost bridge run request enableMockAgentRun must be boolean when provided.");
  }

  if (
    typeof request.mockAgentHeaded !== "undefined" &&
    typeof request.mockAgentHeaded !== "boolean"
  ) {
    errors.push("Localhost bridge run request mockAgentHeaded must be boolean when provided.");
  }

  if (
    typeof request.mockPageBaseUrl !== "undefined" &&
    !isLocalhostUrlString(request.mockPageBaseUrl)
  ) {
    errors.push("Localhost bridge run request mockPageBaseUrl must be a localhost HTTP(S) URL when provided.");
  }

  if (isObject(request.metadata)) {
    if (
      typeof request.metadata.enableMockAgentRun !== "undefined" &&
      typeof request.metadata.enableMockAgentRun !== "boolean"
    ) {
      errors.push("Localhost bridge run request metadata.enableMockAgentRun must be boolean when provided.");
    }

    if (
      typeof request.metadata.mockAgentHeaded !== "undefined" &&
      typeof request.metadata.mockAgentHeaded !== "boolean"
    ) {
      errors.push("Localhost bridge run request metadata.mockAgentHeaded must be boolean when provided.");
    }

    if (
      typeof request.metadata.mockPageBaseUrl !== "undefined" &&
      !isLocalhostUrlString(request.metadata.mockPageBaseUrl)
    ) {
      errors.push("Localhost bridge run request metadata.mockPageBaseUrl must be a localhost HTTP(S) URL when provided.");
    }
  }

  const envelopeValidation = validateAvanzaAgentBridgeEnvelope(request.envelope);

  if (!envelopeValidation.ok) {
    errors.push(
      ...envelopeValidation.errors.map((error) => `Envelope: ${error}`),
    );
  }

  warnings.push(
    ...envelopeValidation.warnings.map((warning) => `Envelope: ${warning}`),
  );

  if (request.envelope?.type !== "request") {
    errors.push("Localhost bridge run request envelope type must be request.");
  }

  const requestValidation = validateAvanzaAgentRequest(request.request);

  if (!requestValidation.ok) {
    errors.push(
      ...requestValidation.errors.map(
        (error) => `Avanza agent request: ${error}`,
      ),
    );
  }

  warnings.push(
    ...requestValidation.warnings.map(
      (warning) => `Avanza agent request: ${warning}`,
    ),
  );

  const requestId = optionalString(request.request?.requestId);
  const envelopeRequestId = optionalString(request.envelope?.requestId);
  const payloadRequestId = getEnvelopePayloadRequestId(request.envelope);

  if (envelopeRequestId && requestId && envelopeRequestId !== requestId) {
    errors.push("Localhost bridge run request envelope requestId must match request requestId.");
  }

  if (payloadRequestId && requestId && payloadRequestId !== requestId) {
    errors.push("Localhost bridge run request envelope payload requestId must match request requestId.");
  }

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeRunResponse(
  response: Partial<LocalhostBridgeRunResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(
      ["Localhost bridge run response is missing."],
      warnings,
    );
  }

  validateVersion(response.version, errors, "Localhost bridge run response");

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge run response requestId is missing.");
  }

  if (typeof response.accepted !== "boolean") {
    errors.push("Localhost bridge run response accepted must be boolean.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge run response message is missing.");
  }

  if (response.result) {
    const resultValidation = validateResultShape(
      response.result,
      "Localhost bridge run response result",
    );

    errors.push(...resultValidation.errors);
    warnings.push(...resultValidation.warnings);

    if (
      optionalString(response.requestId) &&
      optionalString(response.result.requestId) &&
      response.requestId !== response.result.requestId
    ) {
      errors.push("Localhost bridge run response result requestId must match response requestId.");
    }
  }

  if (response.errors && !Array.isArray(response.errors)) {
    errors.push("Localhost bridge run response errors must be an array.");
  }

  if (response.warnings && !Array.isArray(response.warnings)) {
    errors.push("Localhost bridge run response warnings must be an array.");
  }

  const mockOrderMetadataValidation =
    validateMockOrderPageRunMetadata(response);

  errors.push(...mockOrderMetadataValidation.errors);
  warnings.push(...mockOrderMetadataValidation.warnings);

  return createValidationResult(errors, warnings);
}

export function validateLocalhostBridgeCancelRequest(
  request: Partial<LocalhostBridgeCancelRequest> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];

  if (!isObject(request)) {
    return createValidationResult(["Localhost bridge cancel request is missing."]);
  }

  validateVersion(request.version, errors, "Localhost bridge cancel request");

  if (!optionalString(request.requestId)) {
    errors.push("Localhost bridge cancel request requestId is missing.");
  }

  if (
    typeof request.reason !== "undefined" &&
    request.reason !== null &&
    !optionalString(request.reason)
  ) {
    errors.push("Localhost bridge cancel request reason must be non-empty when provided.");
  }

  return createValidationResult(errors);
}

export function validateLocalhostBridgeCancelResponse(
  response: Partial<LocalhostBridgeCancelResponse> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];

  if (!isObject(response)) {
    return createValidationResult(["Localhost bridge cancel response is missing."]);
  }

  validateVersion(response.version, errors, "Localhost bridge cancel response");

  if (!optionalString(response.requestId)) {
    errors.push("Localhost bridge cancel response requestId is missing.");
  }

  if (typeof response.cancelled !== "boolean") {
    errors.push("Localhost bridge cancel response cancelled must be boolean.");
  }

  if (!optionalString(response.message)) {
    errors.push("Localhost bridge cancel response message is missing.");
  }

  if (response.errors && !Array.isArray(response.errors)) {
    errors.push("Localhost bridge cancel response errors must be an array.");
  }

  return createValidationResult(errors);
}

export function validateLocalhostBridgeEventStreamMessage(
  message: Partial<LocalhostBridgeEventStreamMessage> | null | undefined,
): LocalhostBridgeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isObject(message)) {
    return createValidationResult(
      ["Localhost bridge event stream message is missing."],
      warnings,
    );
  }

  validateVersion(message.version, errors, "Localhost bridge event stream message");

  if (!isSupportedEventStreamMessageType(message.type)) {
    errors.push("Localhost bridge event stream message type is unsupported.");
  }

  if (!isValidTimestamp(message.createdAt)) {
    errors.push("Localhost bridge event stream message createdAt must be valid.");
  }

  if (message.type !== "heartbeat" && !optionalString(message.requestId)) {
    errors.push("Localhost bridge event stream message requestId is missing.");
  }

  if (message.type === "progress") {
    const progressValidation = validateProgressEventShape(message.progressEvent);

    errors.push(...progressValidation.errors);
  }

  if (message.type === "result") {
    const resultValidation = validateResultShape(
      message.result,
      "Localhost bridge event stream result",
    );

    errors.push(...resultValidation.errors);
    warnings.push(...resultValidation.warnings);
  }

  if (message.type === "error" && !optionalString(message.error)) {
    errors.push("Localhost bridge event stream error message is missing.");
  }

  if (
    message.type === "progress" &&
    optionalString(message.requestId) &&
    optionalString(message.progressEvent?.requestId) &&
    message.requestId !== message.progressEvent?.requestId
  ) {
    errors.push("Localhost bridge event stream progress requestId must match message requestId.");
  }

  if (
    message.type === "result" &&
    optionalString(message.requestId) &&
    optionalString(message.result?.requestId) &&
    message.requestId !== message.result?.requestId
  ) {
    errors.push("Localhost bridge event stream result requestId must match message requestId.");
  }

  return createValidationResult(errors, warnings);
}

export function buildLocalhostBridgeRunRequest(
  envelope: AvanzaAgentBridgeEnvelope,
  request: AvanzaAgentRequest,
  options: BuildLocalhostBridgeRunRequestOptions = {},
): LocalhostBridgeRunRequest {
  if (envelope.type !== "request") {
    throw new Error("Localhost bridge run request requires a request envelope.");
  }

  const envelopeRequestId = optionalString(envelope.requestId);
  const payloadRequestId = getEnvelopePayloadRequestId(envelope);
  const requestId = optionalString(request.requestId);

  if (!requestId) {
    throw new Error("Localhost bridge run request requires request.requestId.");
  }

  if (envelopeRequestId && envelopeRequestId !== requestId) {
    throw new Error("Localhost bridge run request envelope requestId must match request requestId.");
  }

  if (payloadRequestId && payloadRequestId !== requestId) {
    throw new Error("Localhost bridge run request envelope payload requestId must match request requestId.");
  }

  const metadata = normalizeMetadata(options.metadata);

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    envelope,
    request,
    dryRun: true,
    ...(typeof options.enableMockAgentRun === "boolean"
      ? { enableMockAgentRun: options.enableMockAgentRun }
      : {}),
    ...(options.mockPageBaseUrl
      ? { mockPageBaseUrl: options.mockPageBaseUrl }
      : {}),
    ...(typeof options.mockAgentHeaded === "boolean"
      ? { mockAgentHeaded: options.mockAgentHeaded }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeDryRunRequest(
  dryRunOrderInput: AvanzaDryRunOrderInput,
  options: BuildLocalhostBridgeDryRunRequestOptions = {},
): LocalhostBridgeDryRunRequest {
  const requestValidation = validateAvanzaDryRunOrderInput(dryRunOrderInput);

  if (!requestValidation.ok) {
    throw new Error(
      `Localhost bridge dry-run request requires a valid Avanza dry-run order input: ${requestValidation.errors.join(" ")}`,
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_dry_run_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata(options.metadata);
  const capabilityValidationOptions =
    options.capabilityValidationOptions ?? undefined;

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    dryRunOrderInput: requestValidation.normalized ?? dryRunOrderInput,
    ...(capabilityValidationOptions
      ? { capabilityValidationOptions }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeSearchOnlyRequest(
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument,
  options: BuildLocalhostBridgeSearchOnlyRequestOptions = {},
): LocalhostBridgeSearchOnlyRequest {
  if (!optionalString(expectedInstrument.ticker)) {
    throw new Error(
      "Localhost bridge search-only request requires expectedInstrument.ticker.",
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_search_only_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata(options.metadata);

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    expectedInstrument: {
      ticker: expectedInstrument.ticker.trim(),
      ...(optionalString(expectedInstrument.name)
        ? { name: optionalString(expectedInstrument.name) as string }
        : {}),
      ...(optionalString(expectedInstrument.market)
        ? { market: optionalString(expectedInstrument.market) as string }
        : {}),
      ...(optionalString(expectedInstrument.currency)
        ? { currency: optionalString(expectedInstrument.currency) as string }
        : {}),
      ...(optionalString(expectedInstrument.instrumentType)
        ? {
            instrumentType: optionalString(
              expectedInstrument.instrumentType,
            ) as string,
          }
        : {}),
    },
    ...(options.sessionDetection ? { sessionDetection: options.sessionDetection } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeInstrumentVerificationRequest(
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument,
  options: BuildLocalhostBridgeInstrumentVerificationRequestOptions = {},
): LocalhostBridgeInstrumentVerificationRequest {
  if (!optionalString(expectedInstrument.ticker)) {
    throw new Error(
      "Localhost bridge instrument verification request requires expectedInstrument.ticker.",
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_instrument_verification_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata(options.metadata);

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    expectedInstrument: {
      ticker: expectedInstrument.ticker.trim(),
      ...(optionalString(expectedInstrument.name)
        ? { name: optionalString(expectedInstrument.name) as string }
        : {}),
      ...(optionalString(expectedInstrument.market)
        ? { market: optionalString(expectedInstrument.market) as string }
        : {}),
      ...(optionalString(expectedInstrument.currency)
        ? { currency: optionalString(expectedInstrument.currency) as string }
        : {}),
      ...(optionalString(expectedInstrument.instrumentType)
        ? {
            instrumentType: optionalString(
              expectedInstrument.instrumentType,
            ) as string,
          }
        : {}),
    },
    ...(options.searchOnlyResult
      ? { searchOnlyResult: options.searchOnlyResult }
      : {}),
    ...(options.selectedCandidate
      ? { selectedCandidate: options.selectedCandidate }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeInstrumentPageRequest(
  expectedInstrument: AvanzaSearchOnlyExpectedInstrument,
  options: BuildLocalhostBridgeInstrumentPageRequestOptions = {},
): LocalhostBridgeInstrumentPageRequest {
  if (!optionalString(expectedInstrument.ticker)) {
    throw new Error(
      "Localhost bridge instrument page request requires expectedInstrument.ticker.",
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_instrument_page_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata(options.metadata);

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    expectedInstrument: {
      ticker: expectedInstrument.ticker.trim(),
      ...(optionalString(expectedInstrument.name)
        ? { name: optionalString(expectedInstrument.name) as string }
        : {}),
      ...(optionalString(expectedInstrument.market)
        ? { market: optionalString(expectedInstrument.market) as string }
        : {}),
      ...(optionalString(expectedInstrument.currency)
        ? { currency: optionalString(expectedInstrument.currency) as string }
        : {}),
      ...(optionalString(expectedInstrument.instrumentType)
        ? {
            instrumentType: optionalString(
              expectedInstrument.instrumentType,
            ) as string,
          }
        : {}),
    },
    ...(options.instrumentVerificationResult
      ? { instrumentVerificationResult: options.instrumentVerificationResult }
      : {}),
    ...(options.pageIdentity ? { pageIdentity: options.pageIdentity } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeOrderPageOpenRequest(
  dryRunOrderInput: AvanzaDryRunOrderInput,
  options: BuildLocalhostBridgeOrderPageOpenRequestOptions = {},
): LocalhostBridgeOrderPageOpenRequest {
  const dryRunValidation = validateAvanzaDryRunOrderInput(dryRunOrderInput);

  if (!dryRunValidation.ok) {
    throw new Error(
      dryRunValidation.errors[0] ??
        "Localhost bridge order page open request requires a valid dryRunOrderInput.",
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_order_page_open_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata(options.metadata);

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    dryRunOrderInput,
    ...(options.instrumentPageResult
      ? { instrumentPageResult: options.instrumentPageResult }
      : {}),
    ...(options.orderPageIdentity
      ? { orderPageIdentity: options.orderPageIdentity }
      : {}),
    ...(options.attemptedAction
      ? { attemptedAction: options.attemptedAction }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeAdvancedFormFillRequest(
  dryRunOrderInput: AvanzaDryRunOrderInput,
  options: BuildLocalhostBridgeAdvancedFormFillRequestOptions = {},
): LocalhostBridgeAdvancedFormFillRequest {
  const dryRunValidation = validateAvanzaDryRunOrderInput(dryRunOrderInput);

  if (!dryRunValidation.ok) {
    throw new Error(
      dryRunValidation.errors[0] ??
        "Localhost bridge advanced form fill request requires a valid dryRunOrderInput.",
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_advanced_form_fill_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata({
    ...(options.metadata ?? {}),
    advanced_form_fill_stub_only: true,
    no_browser_actions_requested: true,
    no_avanza_page_touched: true,
    no_real_form_fields_filled: true,
    no_review_click: true,
    no_final_confirm_click: true,
    no_broker_submission: true,
    no_broker_result_created: true,
    no_supabase_write: true,
    no_trade_mutation: true,
  });

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    dryRunOrderInput: dryRunValidation.normalized ?? dryRunOrderInput,
    ...(options.orderPageOpenResult
      ? { orderPageOpenResult: options.orderPageOpenResult }
      : {}),
    ...(options.formState ? { formState: options.formState } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeReviewClickRequest(
  dryRunOrderInput: AvanzaDryRunOrderInput,
  options: BuildLocalhostBridgeReviewClickRequestOptions = {},
): LocalhostBridgeReviewClickRequest {
  const dryRunValidation = validateAvanzaDryRunOrderInput(dryRunOrderInput);

  if (!dryRunValidation.ok) {
    throw new Error(
      dryRunValidation.errors[0] ??
        "Localhost bridge review click request requires a valid dryRunOrderInput.",
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_review_click_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata({
    ...(options.metadata ?? {}),
    review_click_stub_only: true,
    no_browser_actions_requested: true,
    no_avanza_page_touched: true,
    no_real_granska_clicked: true,
    no_bekrafta_clicked: true,
    no_broker_submission: true,
    no_broker_result_created: true,
    no_supabase_write: true,
    no_trade_mutation: true,
  });

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    dryRunOrderInput: dryRunValidation.normalized ?? dryRunOrderInput,
    ...(options.advancedFormFillResult
      ? { advancedFormFillResult: options.advancedFormFillResult }
      : {}),
    ...(options.confirmationReadback
      ? { confirmationReadback: options.confirmationReadback }
      : {}),
    ...(typeof options.reviewClickAttempted === "boolean"
      ? { reviewClickAttempted: options.reviewClickAttempted }
      : {}),
    ...(optionalString(options.reviewLabel)
      ? { reviewLabel: optionalString(options.reviewLabel) as string }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeManualConfirmationWaitRequest(
  options: BuildLocalhostBridgeManualConfirmationWaitRequestOptions = {},
): LocalhostBridgeManualConfirmationWaitRequest {
  const requestId =
    optionalString(options.requestId) ??
    `avanza_manual_confirmation_wait_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata({
    ...(options.metadata ?? {}),
    manual_confirmation_wait_stub_only: true,
    no_browser_actions_requested: true,
    no_avanza_page_touched: true,
    no_bekrafta_clicked: true,
    no_broker_result_created: true,
    no_supabase_write: true,
    no_trade_mutation: true,
  });

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    ...(options.reviewClickResult
      ? { reviewClickResult: options.reviewClickResult }
      : {}),
    ...(options.observation ? { observation: options.observation } : {}),
    ...(typeof options.timeoutMs === "number"
      ? { timeoutMs: options.timeoutMs }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeBrokerConfirmationCaptureRequest(
  dryRunOrderInput: AvanzaDryRunOrderInput,
  options: BuildLocalhostBridgeBrokerConfirmationCaptureRequestOptions = {},
): LocalhostBridgeBrokerConfirmationCaptureRequest {
  const dryRunValidation = validateAvanzaDryRunOrderInput(dryRunOrderInput);

  if (!dryRunValidation.ok) {
    throw new Error(
      dryRunValidation.errors[0] ??
        "Localhost bridge broker confirmation capture request requires a valid dryRunOrderInput.",
    );
  }

  const requestId =
    optionalString(options.requestId) ??
    `avanza_broker_confirmation_capture_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata({
    ...(options.metadata ?? {}),
    broker_confirmation_capture_stub_only: true,
    no_browser_actions_requested: true,
    no_avanza_page_touched: true,
    no_avanza_urls: true,
    no_avanza_selectors: true,
    no_bekrafta_clicked: true,
    no_broker_execution_result_created: true,
    no_execution_record_created: true,
    no_supabase_write: true,
    no_trade_mutation: true,
    sanitized_evidence_only: true,
  });

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    dryRunOrderInput: dryRunValidation.normalized ?? dryRunOrderInput,
    ...(options.manualConfirmationWaitResult
      ? { manualConfirmationWaitResult: options.manualConfirmationWaitResult }
      : {}),
    ...(options.brokerConfirmationReadback
      ? { brokerConfirmationReadback: options.brokerConfirmationReadback }
      : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeBrokerExecutionResultEligibilityRequest(
  options: BuildLocalhostBridgeBrokerExecutionResultEligibilityRequestOptions = {},
): LocalhostBridgeBrokerExecutionResultEligibilityRequest {
  const requestId =
    optionalString(options.requestId) ??
    `avanza_broker_execution_result_eligibility_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata({
    ...(options.metadata ?? {}),
    broker_execution_result_eligibility_stub_only: true,
    eligibility_check_only: true,
    no_browser_actions_requested: true,
    no_avanza_page_touched: true,
    no_avanza_urls: true,
    no_avanza_selectors: true,
    no_bekrafta_clicked: true,
    no_broker_execution_result_created: true,
    no_execution_record_created: true,
    no_supabase_write: true,
    no_trade_mutation: true,
  });

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    ...(options.captureResult ? { captureResult: options.captureResult } : {}),
    ...(options.existingFingerprints
      ? { existingFingerprints: options.existingFingerprints }
      : {}),
    ...(options.options ? { options: options.options } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeBrokerExecutionResultPreviewRequest(
  options: BuildLocalhostBridgeBrokerExecutionResultPreviewRequestOptions = {},
): LocalhostBridgeBrokerExecutionResultPreviewRequest {
  const requestId =
    optionalString(options.requestId) ??
    `avanza_broker_execution_result_preview_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata({
    ...(options.metadata ?? {}),
    broker_execution_result_preview_stub_only: true,
    preview_only: true,
    no_browser_actions_requested: true,
    no_avanza_page_touched: true,
    no_avanza_urls: true,
    no_avanza_selectors: true,
    no_bekrafta_clicked: true,
    no_real_broker_execution_result_created: true,
    no_execution_record_created: true,
    no_supabase_write: true,
    no_trade_mutation: true,
  });

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    ...(options.captureResult ? { captureResult: options.captureResult } : {}),
    ...(options.eligibilityResult
      ? { eligibilityResult: options.eligibilityResult }
      : {}),
    ...(options.existingFingerprints
      ? { existingFingerprints: options.existingFingerprints }
      : {}),
    ...(options.options ? { options: options.options } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function buildLocalhostBridgeExecutionRecordEligibilityRequest(
  options: BuildLocalhostBridgeExecutionRecordEligibilityRequestOptions = {},
): LocalhostBridgeExecutionRecordEligibilityRequest {
  const requestId =
    optionalString(options.requestId) ??
    `execution_record_eligibility_bridge_request_${Date.now()}`;
  const metadata = normalizeMetadata({
    ...(options.metadata ?? {}),
    execution_record_eligibility_stub_only: true,
    execution_record_eligibility_check_only: true,
    no_browser_actions_requested: true,
    no_avanza_page_touched: true,
    no_avanza_urls: true,
    no_avanza_selectors: true,
    no_bekrafta_clicked: true,
    no_broker_execution_result_created: true,
    no_execution_record_created: true,
    no_supabase_write: true,
    no_trade_mutation: true,
  });

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId,
    createdAt: optionalString(options.createdAt) ?? new Date().toISOString(),
    ...(options.candidate ? { candidate: options.candidate } : {}),
    ...(options.existingSourceFingerprints
      ? { existingSourceFingerprints: options.existingSourceFingerprints }
      : {}),
    ...(options.existingBrokerReferences
      ? { existingBrokerReferences: options.existingBrokerReferences }
      : {}),
    ...(options.options ? { options: options.options } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

export function createLocalhostBridgeDryRunStubResponse(
  request: LocalhostBridgeDryRunRequest,
): LocalhostBridgeDryRunResponse {
  const receivedAt = new Date().toISOString();
  const requestValidation = validateLocalhostBridgeDryRunRequest(request);
  const dryRunRequestValidation = validateAvanzaDryRunOrderInput(
    request.dryRunOrderInput,
  );
  const capability = createAvanzaDryRunBrowserRunnerCapability({
    createdAt: receivedAt,
    metadata: {
      source: "localhost_bridge_dry_run_stub",
      noBrowserExecution: true,
      noBrokerSubmission: true,
    },
  });
  const capabilityValidation = validateBrowserRunnerCapability(capability, {
    allowAvanzaDryRun:
      request.capabilityValidationOptions?.allowAvanzaDryRun === true,
    allowBrokerSubmission: false,
    allowAutomaticMode: false,
  });
  const errors = [
    ...requestValidation.errors,
    ...(capabilityValidation.canSubmitBrokerOrder
      ? ["Localhost bridge dry-run capability must not submit broker orders."]
      : []),
  ];
  const warnings = [
    ...requestValidation.warnings,
    ...capabilityValidation.warnings,
    "Avanza dry-run runner is not implemented.",
    "No browser actions were executed.",
    "No broker submission was performed.",
  ];
  const status: LocalhostBridgeDryRunStatus =
    errors.length > 0 || capabilityValidation.blocked
      ? "blocked"
      : "not_implemented";

  return {
    version: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    ok: false,
    status,
    bridgeVersion: LOCALHOST_BRIDGE_CONTRACT_VERSION,
    requestId: request.requestId,
    receivedAt,
    completedAt: new Date().toISOString(),
    dryRunRequestValidation,
    capabilityValidation,
    diagnostics: null,
    message:
      status === "blocked"
        ? "Localhost bridge dry-run request was blocked by validation. No browser action occurred."
        : "Localhost bridge dry-run request validated, but the Avanza dry-run runner is not implemented. No browser action occurred.",
    errors:
      status === "blocked"
        ? [
            ...errors,
            ...capabilityValidation.errors.map(
              (error) => `Capability: ${error}`,
            ),
          ]
        : errors,
    warnings,
    metadata: {
      ...(request.metadata ?? {}),
      localhost_bridge_stub: true,
      dry_run_endpoint_stub: true,
      no_browser_actions_executed: true,
      no_avanza_session: true,
      no_broker_submission: true,
      no_broker_result_created: true,
    },
  };
}
