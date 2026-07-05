import {
  avanzaFillOnlyAdapterContractFixtures,
} from "./avanza-fill-only-adapter-contract-fixtures";
import {
  buildAvanzaDryRunAdapterResult,
  type AvanzaDryRunAdapterProgressEventType,
  type AvanzaDryRunAdapterResult,
  type AvanzaDryRunAdapterScenario,
  type AvanzaDryRunAdapterStatus,
} from "./avanza-dry-run-adapter-layer";

export type AvanzaDryRunAdapterLayerFixtureId =
  | "dry_run_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "dry_run_ready_buy"
  | "dry_run_started_display_only"
  | "dry_run_success_buy"
  | "dry_run_success_sell"
  | "dry_run_blocked_adapter_response"
  | "dry_run_blocked_scenario"
  | "dry_run_failed_scenario"
  | "dry_run_cancelled_scenario"
  | "dry_run_unknown_scenario"
  | "invalid_request"
  | "missing_request";

export type AvanzaDryRunAdapterLayerFixture = {
  expectedStatus: AvanzaDryRunAdapterStatus;
  expectedSurface:
    | "blocked_or_empty"
    | "ready_model_only"
    | "display_only"
    | "waiting_manual_review";
  id: AvanzaDryRunAdapterLayerFixtureId;
  label: string;
  result: AvanzaDryRunAdapterResult;
  scenario?: AvanzaDryRunAdapterScenario;
};

const fixtureNow = "2026-07-04T13:00:00.000Z";

export const avanzaDryRunAdapterLayerFixtureStatusCoverage: AvanzaDryRunAdapterStatus[] =
  [
    "dry_run_disabled",
    "request_unavailable",
    "request_invalid",
    "dry_run_ready",
    "dry_run_started",
    "dry_run_completed_waiting_manual_review",
    "dry_run_blocked",
    "dry_run_failed",
    "dry_run_cancelled",
    "dry_run_unknown",
  ];

export const avanzaDryRunAdapterLayerFixtureProgressEventCoverage: AvanzaDryRunAdapterProgressEventType[] =
  [
    "request_received",
    "package_validated",
    "broker_context_checked_mock",
    "form_mapping_checked_mock",
    "manual_review_required",
    "dry_run_completed",
    "dry_run_failed",
    "dry_run_cancelled",
  ];

const dryRunReadyBuyResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "dry_run_ready_buy",
)?.response;
const dryRunReadySellResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "dry_run_ready_sell",
)?.response;
const blockedAdapterResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "fill_only_blocked_unsafe_package",
)?.response;

const baseSafety = {
  canCallBridge: false,
  canClickConfirm: false,
  canClickReview: false,
  canControlBrowser: false,
  canFetchLocalhost: false,
  canFillForm: false,
  canHandleCredentials: false,
  canReadBankId: false,
  canReadCookies: false,
  canSubmitOrder: false,
  canWriteSupabaseExecution: false,
  controlsEnabled: false,
  finalHumanClickRequired: true,
  gateLocked: true,
  userMustConfirm: true,
} as const;

function buildFixture(
  id: AvanzaDryRunAdapterLayerFixtureId,
  label: string,
  result: AvanzaDryRunAdapterResult,
  expectedSurface: AvanzaDryRunAdapterLayerFixture["expectedSurface"],
): AvanzaDryRunAdapterLayerFixture {
  return {
    expectedStatus: result.status,
    expectedSurface,
    id,
    label,
    result,
    scenario: result.scenario,
  };
}

function buildStartedDisplayOnlyFixture(): AvanzaDryRunAdapterLayerFixture {
  const adapterRequest = dryRunReadyBuyResponse?.request;
  const safetyFlags = {
    ...baseSafety,
    canStartDryRun: true,
  };
  const result: AvanzaDryRunAdapterResult = {
    ...(adapterRequest ? { adapterRequest } : {}),
    ...safetyFlags,
    blockedReasons: [],
    label: "Avanza dry-run started display-only",
    progressEvents: [
      {
        at: fixtureNow,
        label: "Adapter request received",
        type: "request_received",
      },
      {
        at: fixtureNow,
        label: "Adapter request package validated",
        type: "package_validated",
      },
    ],
    reason:
      "Display-only fixture for a future started dry-run state. It does not fill forms, click review, confirm, submit, call a bridge, control a browser, or write execution records.",
    runId: "fixture-dry-run-started",
    safetyFlags,
    scenario: "success",
    status: "dry_run_started",
    warnings: ["display-only fixture state"],
  };

  return buildFixture(
    "dry_run_started_display_only",
    "Dry-run started display-only",
    result,
    "display_only",
  );
}

export const avanzaDryRunAdapterLayerFixtures: AvanzaDryRunAdapterLayerFixture[] =
  [
    buildFixture(
      "dry_run_disabled",
      "Dry-run disabled",
      buildAvanzaDryRunAdapterResult({
        dryRunEnabled: false,
        now: fixtureNow,
        runId: "fixture-dry-run-disabled",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "request_unavailable",
      "Request unavailable",
      buildAvanzaDryRunAdapterResult({
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-request-unavailable",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid",
      "Request invalid",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: "not an adapter response",
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-request-invalid",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "dry_run_ready_buy",
      "Safe BUY dry-run ready",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: dryRunReadyBuyResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-ready-buy",
      }),
      "ready_model_only",
    ),
    buildStartedDisplayOnlyFixture(),
    buildFixture(
      "dry_run_success_buy",
      "Safe BUY dry-run success",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: dryRunReadyBuyResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-success-buy",
        scenario: "success",
      }),
      "waiting_manual_review",
    ),
    buildFixture(
      "dry_run_success_sell",
      "Safe SELL dry-run success",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: dryRunReadySellResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-success-sell",
        scenario: "success",
      }),
      "waiting_manual_review",
    ),
    buildFixture(
      "dry_run_blocked_adapter_response",
      "Blocked adapter response",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: blockedAdapterResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-blocked-response",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "dry_run_blocked_scenario",
      "Blocked scenario",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: dryRunReadyBuyResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-blocked-scenario",
        scenario: "blocked",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "dry_run_failed_scenario",
      "Failed scenario",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: dryRunReadyBuyResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-failed",
        scenario: "failed",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "dry_run_cancelled_scenario",
      "Cancelled scenario",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: dryRunReadyBuyResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-cancelled",
        scenario: "cancelled",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "dry_run_unknown_scenario",
      "Unknown scenario",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: dryRunReadyBuyResponse,
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-dry-run-unknown",
        scenario: "unknown",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "invalid_request",
      "Invalid request",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: {
          blockedReasons: [],
          label: "Invalid request fixture",
          reason: "Missing safe request model.",
          status: "dry_run_ready",
          warnings: [],
        },
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-invalid-request",
      }),
      "blocked_or_empty",
    ),
    buildFixture(
      "missing_request",
      "Missing request",
      buildAvanzaDryRunAdapterResult({
        adapterResponse: {
          blockedReasons: [],
          label: "Missing request fixture",
          reason: "Ready status without a request remains blocked.",
          status: "dry_run_ready",
          warnings: [],
        },
        dryRunEnabled: true,
        now: fixtureNow,
        runId: "fixture-missing-request",
      }),
      "blocked_or_empty",
    ),
  ];
