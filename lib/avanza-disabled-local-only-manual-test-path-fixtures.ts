import {
  buildAvanzaDisabledLocalOnlyManualTestPath,
  type AvanzaDisabledLocalOnlyManualTestPath,
  type AvanzaDisabledLocalOnlyManualTestPathStatus,
  type BuildAvanzaDisabledLocalOnlyManualTestPathInput,
} from "./avanza-disabled-local-only-manual-test-path";

export type AvanzaDisabledLocalOnlyManualTestPathFixtureId =
  | "manual_test_path_disabled"
  | "manual_test_path_hidden"
  | "manual_test_path_blocked"
  | "route_unavailable"
  | "route_disabled"
  | "fetch_intent_unavailable"
  | "internal_guard_missing"
  | "local_only_guard_missing"
  | "manual_test_path_ready_internal_disabled"
  | "manual_test_path_failed"
  | "unknown"
  | "safe_buy_internal_preview_manual_test_path"
  | "safe_sell_internal_preview_manual_test_path"
  | "safe_buy_internal_manual_test_path_disabled"
  | "safe_sell_internal_manual_test_path_disabled"
  | "missing_fetch_intent"
  | "missing_route_state"
  | "disabled_route_state"
  | "missing_internal_guard"
  | "missing_local_only_guard"
  | "blocked_fetch_intent"
  | "failed_input"
  | "unsafe_input";

export type AvanzaDisabledLocalOnlyManualTestPathFixture = {
  expectedStatus: AvanzaDisabledLocalOnlyManualTestPathStatus;
  fixtureId: AvanzaDisabledLocalOnlyManualTestPathFixtureId;
  input: BuildAvanzaDisabledLocalOnlyManualTestPathInput;
  label: string;
  modelResult: AvanzaDisabledLocalOnlyManualTestPath;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

const safeBuyMetadata = {
  accountLabel: "ISK",
  actionShellId: "action-shell-buy",
  apiCallIntentId: "api-call-intent-buy",
  fetchIntentId: "fetch-intent-buy",
  limitPrice: 240.5,
  orderType: "LIMIT",
  packageId: "package-buy",
  quantity: 12,
  side: "BUY",
  sourceRecommendationId: "source-buy",
  symbol: "BUYSAFE",
  ticker: "BUYSAFE",
  warnings: ["fixture only"],
};

const safeSellMetadata = {
  accountLabel: "ISK",
  actionShellId: "action-shell-sell",
  apiCallIntentId: "api-call-intent-sell",
  fetchIntentId: "fetch-intent-sell",
  limitPrice: 180.25,
  orderType: "LIMIT",
  packageId: "package-sell",
  quantity: 8,
  side: "SELL",
  sourceRecommendationId: "source-sell",
  symbol: "SELLSAFE",
  ticker: "SELLSAFE",
  warnings: ["fixture only"],
};

const readyBuyFetchIntent = {
  ...safeBuyMetadata,
  status: "fetch_intent_ready_internal_disabled",
};

const readySellFetchIntent = {
  ...safeSellMetadata,
  status: "fetch_intent_ready_internal_disabled",
};

const blockedFetchIntent = {
  ...safeBuyMetadata,
  blockedReasons: ["fetch intent blocked"],
  status: "fetch_intent_blocked",
};

const readyRouteState = {
  status: "route_available_internal_disabled",
};

const readyInternalRouteState = {
  status: "route_ready_internal_disabled",
};

const disabledRouteState = {
  status: "api_stub_disabled",
};

const allowedInternalGuard = {
  status: "internal_guard_allowed",
};

const allowedLocalOnlyGuard = {
  status: "local_only_guard_allowed",
};

function buildFixture(
  fixtureId: AvanzaDisabledLocalOnlyManualTestPathFixtureId,
  label: string,
  expectedStatus: AvanzaDisabledLocalOnlyManualTestPathStatus,
  input: BuildAvanzaDisabledLocalOnlyManualTestPathInput,
): AvanzaDisabledLocalOnlyManualTestPathFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult: buildAvanzaDisabledLocalOnlyManualTestPath(input),
  };
}

export const avanzaDisabledLocalOnlyManualTestPathFixtures: AvanzaDisabledLocalOnlyManualTestPathFixture[] =
  [
    buildFixture(
      "manual_test_path_disabled",
      "Manual test path disabled by default",
      "manual_test_path_disabled",
      {
        mode: "disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "manual_test_path_hidden",
      "Manual test path hidden",
      "manual_test_path_hidden",
      {
        manualTestPathEnabled: true,
        mode: "hidden",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "manual_test_path_blocked",
      "Manual test path blocked",
      "manual_test_path_blocked",
      {
        fetchIntent: readyBuyFetchIntent,
        handoffMetadata: {
          ...safeBuyMetadata,
          quantity: 0,
        },
        internalGuard: allowedInternalGuard,
        localOnlyGuard: allowedLocalOnlyGuard,
        manualTestPathEnabled: true,
        mode: "internal_preview",
        now: fixtureNow,
        routeState: readyRouteState,
      },
    ),
    buildFixture("route_unavailable", "Route unavailable", "route_unavailable", {
      fetchIntent: readyBuyFetchIntent,
      manualTestPathEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
    }),
    buildFixture("route_disabled", "Route disabled", "route_disabled", {
      fetchIntent: readyBuyFetchIntent,
      manualTestPathEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
      routeState: disabledRouteState,
    }),
    buildFixture(
      "fetch_intent_unavailable",
      "Fetch intent unavailable",
      "fetch_intent_unavailable",
      {
        manualTestPathEnabled: true,
        mode: "internal_preview",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "internal_guard_missing",
      "Internal guard missing",
      "internal_guard_missing",
      {
        fetchIntent: readyBuyFetchIntent,
        manualTestPathEnabled: true,
        mode: "internal_preview",
        now: fixtureNow,
        routeState: readyRouteState,
      },
    ),
    buildFixture(
      "local_only_guard_missing",
      "Local-only guard missing",
      "local_only_guard_missing",
      {
        fetchIntent: readyBuyFetchIntent,
        internalGuard: allowedInternalGuard,
        manualTestPathEnabled: true,
        mode: "internal_preview",
        now: fixtureNow,
        routeState: readyRouteState,
      },
    ),
    buildFixture(
      "manual_test_path_ready_internal_disabled",
      "Ready internal disabled metadata",
      "manual_test_path_ready_internal_disabled",
      {
        actionShellModel: safeBuyMetadata,
        apiCallIntent: safeBuyMetadata,
        fetchIntent: readyBuyFetchIntent,
        handoffMetadata: safeBuyMetadata,
        internalGuard: allowedInternalGuard,
        localOnlyGuard: allowedLocalOnlyGuard,
        manualTestPathEnabled: true,
        manualTestPathId: "manual-test-path-ready",
        mode: "internal_preview",
        now: fixtureNow,
        routeState: readyRouteState,
      },
    ),
    buildFixture(
      "manual_test_path_failed",
      "Manual test path failed",
      "manual_test_path_failed",
      {
        fetchIntent: {
          status: "fetch_intent_failed",
        },
        manualTestPathEnabled: true,
        mode: "internal_preview",
        now: fixtureNow,
      },
    ),
    buildFixture("unknown", "Unknown route state", "unknown", {
      fetchIntent: readyBuyFetchIntent,
      manualTestPathEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
      routeState: {},
    }),
    buildFixture(
      "safe_buy_internal_preview_manual_test_path",
      "Safe BUY internal preview manual test path",
      "manual_test_path_ready_internal_disabled",
      {
        actionShellModel: safeBuyMetadata,
        apiCallIntent: safeBuyMetadata,
        fetchIntent: readyBuyFetchIntent,
        handoffMetadata: safeBuyMetadata,
        internalGuard: allowedInternalGuard,
        localOnlyGuard: allowedLocalOnlyGuard,
        manualTestPathEnabled: true,
        manualTestPathId: "manual-test-path-preview-buy",
        mode: "internal_preview",
        now: fixtureNow,
        routeState: readyRouteState,
      },
    ),
    buildFixture(
      "safe_sell_internal_preview_manual_test_path",
      "Safe SELL internal preview manual test path",
      "manual_test_path_ready_internal_disabled",
      {
        actionShellModel: safeSellMetadata,
        apiCallIntent: safeSellMetadata,
        fetchIntent: readySellFetchIntent,
        handoffMetadata: safeSellMetadata,
        internalGuard: allowedInternalGuard,
        localOnlyGuard: allowedLocalOnlyGuard,
        manualTestPathEnabled: true,
        manualTestPathId: "manual-test-path-preview-sell",
        mode: "internal_preview",
        now: fixtureNow,
        routeState: readyRouteState,
      },
    ),
    buildFixture(
      "safe_buy_internal_manual_test_path_disabled",
      "Safe BUY internal manual test path disabled",
      "manual_test_path_ready_internal_disabled",
      {
        actionShellModel: safeBuyMetadata,
        apiCallIntent: safeBuyMetadata,
        fetchIntent: readyBuyFetchIntent,
        handoffMetadata: safeBuyMetadata,
        internalGuard: {
          allowManualTestPath: true,
        },
        localOnlyGuard: {
          allowLocalOnlyManualTestPath: true,
        },
        manualTestPathEnabled: true,
        manualTestPathId: "manual-test-path-internal-buy",
        mode: "internal_manual_test_path",
        now: fixtureNow,
        routeState: readyInternalRouteState,
      },
    ),
    buildFixture(
      "safe_sell_internal_manual_test_path_disabled",
      "Safe SELL internal manual test path disabled",
      "manual_test_path_ready_internal_disabled",
      {
        actionShellModel: safeSellMetadata,
        apiCallIntent: safeSellMetadata,
        fetchIntent: readySellFetchIntent,
        handoffMetadata: safeSellMetadata,
        internalGuard: {
          allowManualTestPath: true,
        },
        localOnlyGuard: {
          allowLocalOnlyManualTestPath: true,
        },
        manualTestPathEnabled: true,
        manualTestPathId: "manual-test-path-internal-sell",
        mode: "internal_manual_test_path",
        now: fixtureNow,
        routeState: readyInternalRouteState,
      },
    ),
    buildFixture(
      "missing_fetch_intent",
      "Missing fetch intent",
      "fetch_intent_unavailable",
      {
        manualTestPathEnabled: true,
        mode: "internal_manual_test_path",
        now: fixtureNow,
      },
    ),
    buildFixture("missing_route_state", "Missing route state", "route_unavailable", {
      fetchIntent: readySellFetchIntent,
      manualTestPathEnabled: true,
      mode: "internal_manual_test_path",
      now: fixtureNow,
    }),
    buildFixture("disabled_route_state", "Disabled route state", "route_disabled", {
      fetchIntent: readySellFetchIntent,
      manualTestPathEnabled: true,
      mode: "internal_manual_test_path",
      now: fixtureNow,
      routeState: disabledRouteState,
    }),
    buildFixture(
      "missing_internal_guard",
      "Missing internal guard",
      "internal_guard_missing",
      {
        fetchIntent: readySellFetchIntent,
        manualTestPathEnabled: true,
        mode: "internal_manual_test_path",
        now: fixtureNow,
        routeState: readyInternalRouteState,
      },
    ),
    buildFixture(
      "missing_local_only_guard",
      "Missing local-only guard",
      "local_only_guard_missing",
      {
        fetchIntent: readySellFetchIntent,
        internalGuard: allowedInternalGuard,
        manualTestPathEnabled: true,
        mode: "internal_manual_test_path",
        now: fixtureNow,
        routeState: readyInternalRouteState,
      },
    ),
    buildFixture(
      "blocked_fetch_intent",
      "Blocked fetch intent",
      "manual_test_path_blocked",
      {
        fetchIntent: blockedFetchIntent,
        manualTestPathEnabled: true,
        mode: "internal_manual_test_path",
        now: fixtureNow,
      },
    ),
    buildFixture("failed_input", "Failed input", "manual_test_path_failed", {
      fetchIntent: readyBuyFetchIntent,
      internalGuard: {
        status: "internal_guard_failed",
      },
      manualTestPathEnabled: true,
      mode: "internal_manual_test_path",
      now: fixtureNow,
    }),
    buildFixture("unsafe_input", "Unsafe input", "manual_test_path_blocked", {
      fetchIntent: {
        ...readyBuyFetchIntent,
        canFetch: true,
      },
      internalGuard: allowedInternalGuard,
      localOnlyGuard: allowedLocalOnlyGuard,
      manualTestPathEnabled: true,
      mode: "internal_manual_test_path",
      now: fixtureNow,
      routeState: readyInternalRouteState,
    }),
  ];
