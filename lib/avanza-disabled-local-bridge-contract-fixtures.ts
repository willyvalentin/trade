import {
  avanzaFillOnlyAdapterContractFixtures,
} from "./avanza-fill-only-adapter-contract-fixtures";
import {
  buildAvanzaLocalBridgeResponse,
  type AvanzaLocalBridgeMode,
  type AvanzaLocalBridgeResponse,
  type AvanzaLocalBridgeStatus,
  type BuildAvanzaLocalBridgeContractInput,
} from "./avanza-disabled-local-bridge-contract";

export type AvanzaDisabledLocalBridgeContractFixtureId =
  | "bridge_disabled"
  | "request_unavailable"
  | "request_invalid"
  | "bridge_unavailable_display_only"
  | "dry_run_ready_buy"
  | "dry_run_ready_sell"
  | "fill_only_ready_buy"
  | "fill_only_ready_sell"
  | "fill_started_display_only"
  | "fill_completed_waiting_manual_review_display_only"
  | "fill_blocked_unsafe_adapter_response"
  | "fill_failed_display_only"
  | "cancelled_display_only"
  | "unknown_display_only"
  | "request_invalid_side"
  | "request_invalid_quantity"
  | "request_invalid_missing_ticker"
  | "request_invalid_missing_price";

export type AvanzaDisabledLocalBridgeContractFixture = {
  bridgeInput?: BuildAvanzaLocalBridgeContractInput;
  expectedStatus: AvanzaLocalBridgeStatus;
  expectedSurface:
    | "blocked_or_empty"
    | "ready_request_model"
    | "display_only"
    | "waiting_manual_review";
  id: AvanzaDisabledLocalBridgeContractFixtureId;
  label: string;
  mode: AvanzaLocalBridgeMode;
  response: AvanzaLocalBridgeResponse;
};

const fixtureNow = "2026-07-04T14:00:00.000Z";

const dryRunReadyBuyResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "dry_run_ready_buy",
)?.response;
const dryRunReadySellResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "dry_run_ready_sell",
)?.response;
const fillOnlyReadyBuyResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "fill_only_ready_buy",
)?.response;
const fillOnlyReadySellResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "fill_only_ready_sell",
)?.response;
const blockedAdapterResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "fill_only_blocked_unsafe_package",
)?.response;
const invalidSideAdapterResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "package_invalid_side",
)?.response;
const invalidQuantityAdapterResponse =
  avanzaFillOnlyAdapterContractFixtures.find(
    (fixture) => fixture.id === "package_invalid_quantity",
  )?.response;
const missingTickerAdapterResponse =
  avanzaFillOnlyAdapterContractFixtures.find(
    (fixture) => fixture.id === "package_invalid_missing_ticker",
  )?.response;
const missingPriceAdapterResponse = avanzaFillOnlyAdapterContractFixtures.find(
  (fixture) => fixture.id === "package_invalid_missing_price",
)?.response;

export const avanzaDisabledLocalBridgeContractFixtureStatusCoverage: AvanzaLocalBridgeStatus[] =
  [
    "bridge_disabled",
    "request_unavailable",
    "request_invalid",
    "bridge_unavailable",
    "dry_run_ready",
    "fill_only_ready",
    "fill_started",
    "fill_completed_waiting_manual_review",
    "fill_blocked",
    "fill_failed",
    "cancelled",
    "unknown",
  ];

function buildFixture(
  id: AvanzaDisabledLocalBridgeContractFixtureId,
  label: string,
  mode: AvanzaLocalBridgeMode,
  bridgeInput: BuildAvanzaLocalBridgeContractInput,
  expectedSurface: AvanzaDisabledLocalBridgeContractFixture["expectedSurface"],
): AvanzaDisabledLocalBridgeContractFixture {
  const response = buildAvanzaLocalBridgeResponse(bridgeInput);

  return {
    bridgeInput,
    expectedStatus: response.status,
    expectedSurface,
    id,
    label,
    mode,
    response,
  };
}

export const avanzaDisabledLocalBridgeContractFixtures: AvanzaDisabledLocalBridgeContractFixture[] =
  [
    buildFixture(
      "bridge_disabled",
      "Bridge disabled",
      "disabled",
      {
        bridgeEnabled: false,
        mode: "disabled",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_unavailable",
      "Request unavailable",
      "dry_run",
      {
        bridgeEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid",
      "Request invalid",
      "dry_run",
      {
        adapterResponse: "not an adapter response",
        bridgeEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "bridge_unavailable_display_only",
      "Bridge unavailable display-only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-unavailable",
        mode: "fill_only",
        now: fixtureNow,
        statusOverride: "bridge_unavailable",
      },
      "display_only",
    ),
    buildFixture(
      "dry_run_ready_buy",
      "Safe BUY dry_run",
      "dry_run",
      {
        adapterResponse: dryRunReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-dry-run-buy",
        mode: "dry_run",
        now: fixtureNow,
      },
      "ready_request_model",
    ),
    buildFixture(
      "dry_run_ready_sell",
      "Safe SELL dry_run",
      "dry_run",
      {
        adapterResponse: dryRunReadySellResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-dry-run-sell",
        mode: "dry_run",
        now: fixtureNow,
      },
      "ready_request_model",
    ),
    buildFixture(
      "fill_only_ready_buy",
      "Safe BUY fill_only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-fill-only-buy",
        mode: "fill_only",
        now: fixtureNow,
      },
      "ready_request_model",
    ),
    buildFixture(
      "fill_only_ready_sell",
      "Safe SELL fill_only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadySellResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-fill-only-sell",
        mode: "fill_only",
        now: fixtureNow,
      },
      "ready_request_model",
    ),
    buildFixture(
      "fill_started_display_only",
      "Fill started display-only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-fill-started",
        mode: "fill_only",
        now: fixtureNow,
        statusOverride: "fill_started",
      },
      "display_only",
    ),
    buildFixture(
      "fill_completed_waiting_manual_review_display_only",
      "Fill completed waiting manual review display-only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-waiting-manual-review",
        mode: "fill_only",
        now: fixtureNow,
        statusOverride: "fill_completed_waiting_manual_review",
      },
      "waiting_manual_review",
    ),
    buildFixture(
      "fill_blocked_unsafe_adapter_response",
      "Blocked unsafe adapter response",
      "fill_only",
      {
        adapterResponse: blockedAdapterResponse,
        bridgeEnabled: true,
        mode: "fill_only",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "fill_failed_display_only",
      "Fill failed display-only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-fill-failed",
        mode: "fill_only",
        now: fixtureNow,
        statusOverride: "fill_failed",
      },
      "display_only",
    ),
    buildFixture(
      "cancelled_display_only",
      "Cancelled display-only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-cancelled",
        mode: "fill_only",
        now: fixtureNow,
        statusOverride: "cancelled",
      },
      "display_only",
    ),
    buildFixture(
      "unknown_display_only",
      "Unknown display-only",
      "fill_only",
      {
        adapterResponse: fillOnlyReadyBuyResponse,
        bridgeEnabled: true,
        bridgeRequestId: "fixture-bridge-unknown",
        mode: "fill_only",
        now: fixtureNow,
        statusOverride: "unknown",
      },
      "display_only",
    ),
    buildFixture(
      "request_invalid_side",
      "Invalid side",
      "dry_run",
      {
        adapterResponse: invalidSideAdapterResponse,
        bridgeEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_quantity",
      "Invalid quantity",
      "dry_run",
      {
        adapterResponse: invalidQuantityAdapterResponse,
        bridgeEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_missing_ticker",
      "Missing ticker",
      "dry_run",
      {
        adapterResponse: missingTickerAdapterResponse,
        bridgeEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
    buildFixture(
      "request_invalid_missing_price",
      "Missing or unsafe price",
      "dry_run",
      {
        adapterResponse: missingPriceAdapterResponse,
        bridgeEnabled: true,
        mode: "dry_run",
        now: fixtureNow,
      },
      "blocked_or_empty",
    ),
  ];
