import {
  avanzaDisabledLocalBridgeContractFixtures,
} from "./avanza-disabled-local-bridge-contract-fixtures";
import {
  buildAvanzaLocalhostBridgeStubModel,
  type AvanzaLocalhostBridgeStubMode,
  type AvanzaLocalhostBridgeStubResponse,
  type AvanzaLocalhostBridgeStubScenario,
  type AvanzaLocalhostBridgeStubStatus,
  type BuildAvanzaLocalhostBridgeStubModelInput,
} from "./avanza-disabled-localhost-bridge-stub";
import type {
  AvanzaLocalBridgeRequest,
} from "./avanza-disabled-local-bridge-contract";

export type AvanzaDisabledLocalhostBridgeStubFixtureId =
  | "stub_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "local_bridge_unavailable_display_only"
  | "dry_run_ready_buy"
  | "dry_run_ready_sell"
  | "fill_only_ready_buy"
  | "fill_only_ready_sell"
  | "fill_started_mock_display_only"
  | "fill_completed_waiting_manual_review_mock_display_only"
  | "fill_blocked_unsafe_bridge_request"
  | "fill_failed_display_only"
  | "cancelled_display_only"
  | "unknown_display_only"
  | "request_invalid_side"
  | "request_invalid_quantity"
  | "request_invalid_missing_ticker"
  | "request_invalid_missing_price";

export type AvanzaDisabledLocalhostBridgeStubFixture = {
  expectedStatus: AvanzaLocalhostBridgeStubStatus;
  expectedSurface:
    | "blocked_or_empty"
    | "ready_stub_model"
    | "display_only"
    | "waiting_manual_review";
  id: AvanzaDisabledLocalhostBridgeStubFixtureId;
  label: string;
  mode: AvanzaLocalhostBridgeStubMode;
  response: AvanzaLocalhostBridgeStubResponse;
  scenario: AvanzaLocalhostBridgeStubScenario;
  stubInput?: BuildAvanzaLocalhostBridgeStubModelInput;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

const bridgeFixtureById = (id: string) =>
  avanzaDisabledLocalBridgeContractFixtures.find((fixture) => fixture.id === id);

const dryRunReadyBuyRequest = bridgeFixtureById("dry_run_ready_buy")?.response
  .request;
const dryRunReadySellRequest = bridgeFixtureById("dry_run_ready_sell")?.response
  .request;
const fillOnlyReadyBuyRequest = bridgeFixtureById("fill_only_ready_buy")
  ?.response.request;
const fillOnlyReadySellRequest = bridgeFixtureById("fill_only_ready_sell")
  ?.response.request;

function cloneRequest(
  request: AvanzaLocalBridgeRequest | undefined,
): AvanzaLocalBridgeRequest {
  if (!request) {
    throw new Error("Missing disabled local bridge request fixture");
  }

  return { ...request };
}

function invalidBridgeRequest(
  patch: Partial<Record<keyof AvanzaLocalBridgeRequest, unknown>>,
) {
  return {
    ...cloneRequest(fillOnlyReadyBuyRequest),
    ...patch,
  };
}

function buildFixture(
  id: AvanzaDisabledLocalhostBridgeStubFixtureId,
  label: string,
  mode: AvanzaLocalhostBridgeStubMode,
  scenario: AvanzaLocalhostBridgeStubScenario,
  stubInput: BuildAvanzaLocalhostBridgeStubModelInput,
  expectedSurface: AvanzaDisabledLocalhostBridgeStubFixture["expectedSurface"],
): AvanzaDisabledLocalhostBridgeStubFixture {
  const response = buildAvanzaLocalhostBridgeStubModel(stubInput);

  return {
    expectedStatus: response.status,
    expectedSurface,
    id,
    label,
    mode,
    response,
    scenario,
    stubInput,
  };
}

export const avanzaDisabledLocalhostBridgeStubStatusCoverage: AvanzaLocalhostBridgeStubStatus[] =
  [
    "stub_disabled",
    "request_unavailable",
    "request_invalid",
    "local_bridge_unavailable",
    "dry_run_ready",
    "fill_only_ready",
    "fill_started_mock",
    "fill_completed_waiting_manual_review_mock",
    "fill_blocked",
    "fill_failed",
    "cancelled",
    "unknown",
  ];

export const avanzaDisabledLocalhostBridgeStubFixtures: AvanzaDisabledLocalhostBridgeStubFixture[] =
  [
    buildFixture(
      "stub_disabled",
      "Stub disabled",
      "disabled",
      "ready",
      {
        mode: "disabled",
        now: fixtureNow,
        stubEnabled: false,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_unavailable",
      "Request unavailable",
      "dry_run",
      "ready",
      {
        mode: "dry_run",
        now: fixtureNow,
        stubEnabled: true,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid",
      "Request invalid",
      "dry_run",
      "ready",
      {
        bridgeRequest: "not a disabled local bridge request",
        mode: "dry_run",
        now: fixtureNow,
        stubEnabled: true,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "local_bridge_unavailable_display_only",
      "Local bridge unavailable display-only",
      "fill_only",
      "unavailable",
      {
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        scenario: "unavailable",
        stubEnabled: true,
        stubRequestId: "fixture-stub-local-bridge-unavailable",
      },
      "display_only",
    ),
    buildFixture(
      "dry_run_ready_buy",
      "Safe BUY dry_run",
      "dry_run",
      "ready",
      {
        bridgeRequest: cloneRequest(dryRunReadyBuyRequest),
        mode: "dry_run",
        now: fixtureNow,
        stubEnabled: true,
        stubRequestId: "fixture-stub-dry-run-buy",
      },
      "ready_stub_model",
    ),
    buildFixture(
      "dry_run_ready_sell",
      "Safe SELL dry_run",
      "dry_run",
      "ready",
      {
        bridgeRequest: cloneRequest(dryRunReadySellRequest),
        mode: "dry_run",
        now: fixtureNow,
        stubEnabled: true,
        stubRequestId: "fixture-stub-dry-run-sell",
      },
      "ready_stub_model",
    ),
    buildFixture(
      "fill_only_ready_buy",
      "Safe BUY fill_only",
      "fill_only",
      "ready",
      {
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        stubEnabled: true,
        stubRequestId: "fixture-stub-fill-only-buy",
      },
      "ready_stub_model",
    ),
    buildFixture(
      "fill_only_ready_sell",
      "Safe SELL fill_only",
      "fill_only",
      "ready",
      {
        bridgeRequest: cloneRequest(fillOnlyReadySellRequest),
        mode: "fill_only",
        now: fixtureNow,
        stubEnabled: true,
        stubRequestId: "fixture-stub-fill-only-sell",
      },
      "ready_stub_model",
    ),
    buildFixture(
      "fill_started_mock_display_only",
      "Fill started mock display-only",
      "fill_only",
      "started",
      {
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        scenario: "started",
        stubEnabled: true,
        stubRequestId: "fixture-stub-fill-started",
      },
      "display_only",
    ),
    buildFixture(
      "fill_completed_waiting_manual_review_mock_display_only",
      "Fill completed waiting manual review mock display-only",
      "fill_only",
      "completed_waiting_manual_review",
      {
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        scenario: "completed_waiting_manual_review",
        stubEnabled: true,
        stubRequestId: "fixture-stub-waiting-manual-review",
      },
      "waiting_manual_review",
    ),
    buildFixture(
      "fill_blocked_unsafe_bridge_request",
      "Blocked unsafe bridge request",
      "fill_only",
      "ready",
      {
        bridgeRequest: cloneRequest(dryRunReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        stubEnabled: true,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "fill_failed_display_only",
      "Fill failed display-only",
      "fill_only",
      "failed",
      {
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        scenario: "failed",
        stubEnabled: true,
        stubRequestId: "fixture-stub-fill-failed",
      },
      "display_only",
    ),
    buildFixture(
      "cancelled_display_only",
      "Cancelled display-only",
      "fill_only",
      "cancelled",
      {
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        scenario: "cancelled",
        stubEnabled: true,
        stubRequestId: "fixture-stub-cancelled",
      },
      "display_only",
    ),
    buildFixture(
      "unknown_display_only",
      "Unknown display-only",
      "fill_only",
      "unknown",
      {
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        mode: "fill_only",
        now: fixtureNow,
        scenario: "unknown",
        stubEnabled: true,
        stubRequestId: "fixture-stub-unknown",
      },
      "display_only",
    ),
    buildFixture(
      "request_invalid_side",
      "Invalid side",
      "fill_only",
      "ready",
      {
        bridgeRequest: invalidBridgeRequest({ side: "HOLD" }),
        mode: "fill_only",
        now: fixtureNow,
        stubEnabled: true,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_quantity",
      "Invalid quantity",
      "fill_only",
      "ready",
      {
        bridgeRequest: invalidBridgeRequest({ quantity: 0 }),
        mode: "fill_only",
        now: fixtureNow,
        stubEnabled: true,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_missing_ticker",
      "Missing ticker",
      "fill_only",
      "ready",
      {
        bridgeRequest: invalidBridgeRequest({ ticker: "" }),
        mode: "fill_only",
        now: fixtureNow,
        stubEnabled: true,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_missing_price",
      "Missing or unsafe price",
      "fill_only",
      "ready",
      {
        bridgeRequest: invalidBridgeRequest({ limitPrice: undefined }),
        mode: "fill_only",
        now: fixtureNow,
        stubEnabled: true,
      },
      "blocked_or_empty",
    ),
  ];
