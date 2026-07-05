import {
  avanzaDisabledLocalBridgeContractFixtures,
} from "./avanza-disabled-local-bridge-contract-fixtures";
import type {
  AvanzaLocalBridgeRequest,
} from "./avanza-disabled-local-bridge-contract";
import {
  buildAvanzaLocalOnlyApiRouteStubModel,
  type AvanzaLocalOnlyApiRouteStubMode,
  type AvanzaLocalOnlyApiRouteStubResponse,
  type AvanzaLocalOnlyApiRouteStubScenario,
  type AvanzaLocalOnlyApiRouteStubStatus,
  type BuildAvanzaLocalOnlyApiRouteStubModelInput,
} from "./avanza-local-only-api-route-stub";

export type AvanzaLocalOnlyApiRouteStubFixtureId =
  | "api_stub_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "local_only_not_enabled"
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

export type AvanzaLocalOnlyApiRouteStubFixture = {
  apiStubInput?: BuildAvanzaLocalOnlyApiRouteStubModelInput;
  expectedStatus: AvanzaLocalOnlyApiRouteStubStatus;
  expectedSurface:
    | "blocked_or_empty"
    | "ready_mock_model"
    | "display_only"
    | "waiting_manual_review";
  id: AvanzaLocalOnlyApiRouteStubFixtureId;
  label: string;
  mode: AvanzaLocalOnlyApiRouteStubMode;
  response: AvanzaLocalOnlyApiRouteStubResponse;
  scenario: AvanzaLocalOnlyApiRouteStubScenario;
};

const fixtureNow = "2026-07-05T13:00:00.000Z";

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
  id: AvanzaLocalOnlyApiRouteStubFixtureId,
  label: string,
  mode: AvanzaLocalOnlyApiRouteStubMode,
  scenario: AvanzaLocalOnlyApiRouteStubScenario,
  apiStubInput: BuildAvanzaLocalOnlyApiRouteStubModelInput,
  expectedSurface: AvanzaLocalOnlyApiRouteStubFixture["expectedSurface"],
): AvanzaLocalOnlyApiRouteStubFixture {
  const response = buildAvanzaLocalOnlyApiRouteStubModel(apiStubInput);

  return {
    apiStubInput,
    expectedStatus: response.status,
    expectedSurface,
    id,
    label,
    mode,
    response,
    scenario,
  };
}

export const avanzaLocalOnlyApiRouteStubStatusCoverage: AvanzaLocalOnlyApiRouteStubStatus[] =
  [
    "api_stub_disabled",
    "request_unavailable",
    "request_invalid",
    "local_only_not_enabled",
    "dry_run_ready_mock",
    "fill_only_ready_mock",
    "fill_started_mock",
    "fill_completed_waiting_manual_review_mock",
    "fill_blocked",
    "fill_failed",
    "cancelled",
    "unknown",
  ];

export const avanzaLocalOnlyApiRouteStubFixtures: AvanzaLocalOnlyApiRouteStubFixture[] =
  [
    buildFixture(
      "api_stub_disabled",
      "API stub disabled",
      "disabled",
      "ready",
      {
        apiRouteEnabled: false,
        localOnlyEnabled: false,
        mode: "disabled",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_unavailable",
      "Request unavailable",
      "dry_run",
      "ready",
      {
        apiRouteEnabled: true,
        localOnlyEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid",
      "Request invalid",
      "dry_run",
      "ready",
      {
        apiRouteEnabled: true,
        bridgeRequest: "not a disabled local bridge request",
        localOnlyEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "local_only_not_enabled",
      "Local-only not enabled",
      "fill_only",
      "local_only_not_enabled",
      {
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        localOnlyEnabled: false,
        mode: "fill_only",
        now: fixtureNow,
        scenario: "local_only_not_enabled",
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "dry_run_ready_buy",
      "Safe BUY dry_run",
      "dry_run",
      "ready",
      {
        apiRequestId: "fixture-api-dry-run-buy",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(dryRunReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "ready_mock_model",
    ),
    buildFixture(
      "dry_run_ready_sell",
      "Safe SELL dry_run",
      "dry_run",
      "ready",
      {
        apiRequestId: "fixture-api-dry-run-sell",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(dryRunReadySellRequest),
        localOnlyEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "ready_mock_model",
    ),
    buildFixture(
      "fill_only_ready_buy",
      "Safe BUY fill_only",
      "fill_only",
      "ready",
      {
        apiRequestId: "fixture-api-fill-only-buy",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "ready_mock_model",
    ),
    buildFixture(
      "fill_only_ready_sell",
      "Safe SELL fill_only",
      "fill_only",
      "ready",
      {
        apiRequestId: "fixture-api-fill-only-sell",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadySellRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "ready_mock_model",
    ),
    buildFixture(
      "fill_started_mock_display_only",
      "Fill started mock display-only",
      "fill_only",
      "started",
      {
        apiRequestId: "fixture-api-fill-started",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
        scenario: "started",
      },
      "display_only",
    ),
    buildFixture(
      "fill_completed_waiting_manual_review_mock_display_only",
      "Fill completed waiting manual review mock display-only",
      "fill_only",
      "completed_waiting_manual_review",
      {
        apiRequestId: "fixture-api-waiting-manual-review",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
        scenario: "completed_waiting_manual_review",
      },
      "waiting_manual_review",
    ),
    buildFixture(
      "fill_blocked_unsafe_bridge_request",
      "Blocked unsafe bridge request",
      "fill_only",
      "ready",
      {
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(dryRunReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "fill_failed_display_only",
      "Fill failed display-only",
      "fill_only",
      "failed",
      {
        apiRequestId: "fixture-api-fill-failed",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
        scenario: "failed",
      },
      "display_only",
    ),
    buildFixture(
      "cancelled_display_only",
      "Cancelled display-only",
      "fill_only",
      "cancelled",
      {
        apiRequestId: "fixture-api-cancelled",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
        scenario: "cancelled",
      },
      "display_only",
    ),
    buildFixture(
      "unknown_display_only",
      "Unknown display-only",
      "fill_only",
      "unknown",
      {
        apiRequestId: "fixture-api-unknown",
        apiRouteEnabled: true,
        bridgeRequest: cloneRequest(fillOnlyReadyBuyRequest),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
        scenario: "unknown",
      },
      "display_only",
    ),
    buildFixture(
      "request_invalid_side",
      "Invalid side",
      "fill_only",
      "ready",
      {
        apiRouteEnabled: true,
        bridgeRequest: invalidBridgeRequest({ side: "HOLD" }),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_quantity",
      "Invalid quantity",
      "fill_only",
      "ready",
      {
        apiRouteEnabled: true,
        bridgeRequest: invalidBridgeRequest({ quantity: 0 }),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_missing_ticker",
      "Missing ticker",
      "fill_only",
      "ready",
      {
        apiRouteEnabled: true,
        bridgeRequest: invalidBridgeRequest({ ticker: "" }),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_missing_price",
      "Missing or unsafe price",
      "fill_only",
      "ready",
      {
        apiRouteEnabled: true,
        bridgeRequest: invalidBridgeRequest({ limitPrice: undefined }),
        localOnlyEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
  ];
