import {
  buildAvanzaLocalBridgeResponse,
} from "./avanza-disabled-local-bridge-contract";
import {
  buildAvanzaFillOnlyAdapterResponse,
} from "./avanza-fill-only-adapter-contract";
import {
  buildAvanzaHandoffPackage,
  type AvanzaHandoffPackageBuilderResult,
} from "./avanza-handoff-package-builder";
import {
  buildAvanzaLocalOnlyApiRouteStubModel,
} from "./avanza-local-only-api-route-stub";
import type {
  AvanzaTradeUiHandoffPreviewModel,
} from "./avanza-trade-ui-handoff-preview-fixtures";
import {
  buildAvanzaTradeUiPrepareIntent,
  type AvanzaTradeUiPrepareIntent,
  type AvanzaTradeUiPrepareIntentStatus,
  type BuildAvanzaTradeUiPrepareIntentInput,
} from "./avanza-trade-ui-prepare-intent";

export type AvanzaTradeUiPrepareIntentFixtureId =
  | "prepare_disabled"
  | "package_unavailable"
  | "package_blocked"
  | "route_disabled"
  | "prepare_ready_internal_preview_buy"
  | "prepare_ready_internal_preview_sell"
  | "prepare_ready_internal_prepare_buy"
  | "prepare_ready_internal_prepare_sell"
  | "prepare_blocked"
  | "prepare_failed"
  | "unknown"
  | "blocked_handoff_package"
  | "disabled_api_route_state"
  | "unsafe_input"
  | "failed_input";

export type AvanzaTradeUiPrepareIntentFixture = {
  expectedStatus: AvanzaTradeUiPrepareIntentStatus;
  id: AvanzaTradeUiPrepareIntentFixtureId;
  input: BuildAvanzaTradeUiPrepareIntentInput;
  label: string;
  result: AvanzaTradeUiPrepareIntent;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function buildHandoffPackage(
  side: "BUY" | "SELL",
  mode: "read_only" | "fill_only",
): AvanzaHandoffPackageBuilderResult {
  const isBuy = side === "BUY";

  return buildAvanzaHandoffPackage({
    accountLabel: "ISK fixture",
    handoffEnabled: true,
    mode,
    now: fixtureNow,
    recommendationCandidate: {
      confidence: isBuy ? 0.72 : 0.66,
      limitPrice: isBuy ? 240.5 : 155.25,
      quantity: isBuy ? 12 : 5,
      side,
      sourceRecommendationId: isBuy
        ? `prepare-buy-${mode}`
        : `prepare-sell-${mode}`,
      stopLoss: isBuy ? 230 : 170,
      target: isBuy ? 260 : 145,
      ticker: isBuy ? "GME" : "TSLA",
      timeInForce: "DAY",
    },
  });
}

function buildReadyApiRouteState(
  handoffPackage: AvanzaHandoffPackageBuilderResult,
) {
  const adapterResponse = buildAvanzaFillOnlyAdapterResponse({
    adapterEnabled: true,
    broker: "avanza",
    handoffPackage: handoffPackage.package,
    mode: "fill_only",
    now: fixtureNow,
    requestId: `prepare-adapter-${handoffPackage.package?.side.toLowerCase()}`,
  });
  const bridgeResponse = buildAvanzaLocalBridgeResponse({
    adapterResponse,
    bridgeEnabled: true,
    bridgeRequestId: `prepare-bridge-${handoffPackage.package?.side.toLowerCase()}`,
    mode: "fill_only",
    now: fixtureNow,
  });

  return {
    adapterResponse,
    apiRouteState: buildAvanzaLocalOnlyApiRouteStubModel({
      apiRouteEnabled: true,
      bridgeRequest: bridgeResponse.request,
      localOnlyEnabled: true,
      mode: "fill_only",
      now: fixtureNow,
    }),
  };
}

function buildPreviewModel(
  handoffPackage: AvanzaHandoffPackageBuilderResult,
): AvanzaTradeUiHandoffPreviewModel {
  return {
    blockedReasons: handoffPackage.blockedReasons,
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canPoll: false,
    canPrepareFill: false,
    canProceedToHandoff: false,
    controlsEnabled: false,
    gateLocked: true,
    label: "Prepare intent preview fixture",
    package: handoffPackage.package,
    reason:
      "Static Trade UI handoff preview fixture for prepare intent metadata only.",
    status: "package_ready_read_only",
    warnings: handoffPackage.warnings,
  };
}

function buildFixture(
  id: AvanzaTradeUiPrepareIntentFixtureId,
  label: string,
  expectedStatus: AvanzaTradeUiPrepareIntentStatus,
  input: BuildAvanzaTradeUiPrepareIntentInput,
): AvanzaTradeUiPrepareIntentFixture {
  return {
    expectedStatus,
    id,
    input,
    label,
    result: buildAvanzaTradeUiPrepareIntent(input),
  };
}

const readyBuyPreviewPackage = buildHandoffPackage("BUY", "read_only");
const readySellPreviewPackage = buildHandoffPackage("SELL", "read_only");
const readyBuyPreparePackage = buildHandoffPackage("BUY", "fill_only");
const readySellPreparePackage = buildHandoffPackage("SELL", "fill_only");
const readyBuyPreview = buildPreviewModel(readyBuyPreviewPackage);
const readySellPreview = buildPreviewModel(readySellPreviewPackage);
const readyBuyApi = buildReadyApiRouteState(readyBuyPreparePackage);
const readySellApi = buildReadyApiRouteState(readySellPreparePackage);
const blockedPackage = buildAvanzaHandoffPackage({
  handoffEnabled: true,
  now: fixtureNow,
  recommendationCandidate: {
    limitPrice: 240.5,
    quantity: 0,
    side: "BUY",
    stopLoss: 230,
    target: 260,
    ticker: "GME",
  },
});
const disabledApiRouteState = buildAvanzaLocalOnlyApiRouteStubModel();

export const avanzaTradeUiPrepareIntentFixtures: AvanzaTradeUiPrepareIntentFixture[] =
  [
    buildFixture("prepare_disabled", "Prepare disabled", "prepare_disabled", {
      mode: "disabled",
      prepareEnabled: false,
    }),
    buildFixture(
      "package_unavailable",
      "Package unavailable",
      "package_unavailable",
      {
        mode: "internal_preview",
        prepareEnabled: true,
      },
    ),
    buildFixture("package_blocked", "Package blocked", "package_blocked", {
      handoffPackageResult: blockedPackage,
      mode: "internal_preview",
      prepareEnabled: true,
    }),
    buildFixture("route_disabled", "Route disabled", "route_disabled", {
      apiRouteState: disabledApiRouteState,
      handoffPackageResult: readyBuyPreparePackage,
      mode: "internal_prepare",
      prepareEnabled: true,
    }),
    buildFixture(
      "prepare_ready_internal_preview_buy",
      "Safe BUY internal_preview",
      "prepare_ready_internal",
      {
        handoffPreviewResult: readyBuyPreview,
        mode: "internal_preview",
        now: fixtureNow,
        prepareEnabled: true,
        prepareIntentId: "prepare-intent-preview-buy",
      },
    ),
    buildFixture(
      "prepare_ready_internal_preview_sell",
      "Safe SELL internal_preview",
      "prepare_ready_internal",
      {
        handoffPreviewResult: readySellPreview,
        mode: "internal_preview",
        now: fixtureNow,
        prepareEnabled: true,
        prepareIntentId: "prepare-intent-preview-sell",
      },
    ),
    buildFixture(
      "prepare_ready_internal_prepare_buy",
      "Safe BUY internal_prepare",
      "prepare_ready_internal",
      {
        adapterResponse: readyBuyApi.adapterResponse,
        apiRouteState: readyBuyApi.apiRouteState,
        handoffPackageResult: readyBuyPreparePackage,
        mode: "internal_prepare",
        now: fixtureNow,
        prepareEnabled: true,
        prepareIntentId: "prepare-intent-internal-buy",
      },
    ),
    buildFixture(
      "prepare_ready_internal_prepare_sell",
      "Safe SELL internal_prepare",
      "prepare_ready_internal",
      {
        adapterResponse: readySellApi.adapterResponse,
        apiRouteState: readySellApi.apiRouteState,
        handoffPackageResult: readySellPreparePackage,
        mode: "internal_prepare",
        now: fixtureNow,
        prepareEnabled: true,
        prepareIntentId: "prepare-intent-internal-sell",
      },
    ),
    buildFixture("prepare_blocked", "Prepare blocked", "prepare_blocked", {
      adapterResponse: { status: "adapter_disabled" },
      apiRouteState: readyBuyApi.apiRouteState,
      handoffPackageResult: readyBuyPreparePackage,
      mode: "internal_prepare",
      prepareEnabled: true,
    }),
    buildFixture("prepare_failed", "Prepare failed", "prepare_failed", {
      adapterResponse: { status: "fill_failed" },
      handoffPackageResult: readyBuyPreparePackage,
      mode: "internal_prepare",
      prepareEnabled: true,
    }),
    buildFixture("unknown", "Unknown input", "unknown", {
      handoffPackageResult: { unexpected: true },
      mode: "internal_preview",
      prepareEnabled: true,
    }),
    buildFixture(
      "blocked_handoff_package",
      "Blocked handoff package",
      "package_blocked",
      {
        handoffPackageResult: blockedPackage,
        mode: "internal_preview",
        prepareEnabled: true,
      },
    ),
    buildFixture(
      "disabled_api_route_state",
      "Disabled API route state",
      "route_disabled",
      {
        apiRouteState: disabledApiRouteState,
        handoffPackageResult: readySellPreparePackage,
        mode: "internal_prepare",
        prepareEnabled: true,
      },
    ),
    buildFixture("unsafe_input", "Unsafe input", "package_blocked", {
      handoffPackageResult: "unsafe input",
      mode: "internal_preview",
      prepareEnabled: true,
    }),
    buildFixture("failed_input", "Failed input", "prepare_failed", {
      adapterResponse: { status: "fill_failed" },
      handoffPackageResult: readySellPreparePackage,
      mode: "internal_prepare",
      prepareEnabled: true,
    }),
  ];
