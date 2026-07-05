import {
  buildAvanzaGuardedFetchIntent,
  type AvanzaGuardedFetchIntent,
  type AvanzaGuardedFetchIntentStatus,
  type BuildAvanzaGuardedFetchIntentInput,
} from "./avanza-guarded-fetch-intent";

export type AvanzaGuardedFetchIntentFixtureId =
  | "fetch_intent_disabled"
  | "fetch_intent_hidden"
  | "fetch_intent_blocked"
  | "route_unavailable"
  | "route_disabled"
  | "internal_guard_missing"
  | "action_shell_unavailable"
  | "fetch_intent_ready_internal_disabled"
  | "fetch_intent_failed"
  | "unknown"
  | "safe_buy_internal_preview_intent"
  | "safe_sell_internal_preview_intent"
  | "safe_buy_internal_fetch_intent_disabled"
  | "safe_sell_internal_fetch_intent_disabled"
  | "missing_action_shell"
  | "missing_route_availability"
  | "disabled_route_availability"
  | "missing_internal_guard"
  | "blocked_action_shell"
  | "failed_input"
  | "unsafe_input";

export type AvanzaGuardedFetchIntentFixture = {
  expectedStatus: AvanzaGuardedFetchIntentStatus;
  fixtureId: AvanzaGuardedFetchIntentFixtureId;
  input: BuildAvanzaGuardedFetchIntentInput;
  label: string;
  modelResult: AvanzaGuardedFetchIntent;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

const safeBuyMetadata = {
  accountLabel: "ISK",
  actionShellId: "action-shell-buy",
  apiCallIntentId: "api-call-intent-buy",
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

const readyBuyActionShell = {
  ...safeBuyMetadata,
  status: "action_shell_ready_internal_disabled",
};

const readySellActionShell = {
  ...safeSellMetadata,
  status: "action_shell_ready_internal_disabled",
};

const blockedActionShell = {
  blockedReasons: ["action shell blocked"],
  status: "action_shell_blocked",
};

const readyBuyApiCallIntent = {
  ...safeBuyMetadata,
  status: "api_call_ready_internal_disabled",
};

const readySellApiCallIntent = {
  ...safeSellMetadata,
  status: "api_call_ready_internal_disabled",
};

const readyRouteAvailability = {
  status: "route_available_internal_disabled",
};

const readyInternalRouteAvailability = {
  status: "route_ready_internal_disabled",
};

const disabledRouteAvailability = {
  status: "api_stub_disabled",
};

const allowedInternalGuard = {
  status: "internal_guard_allowed",
};

function buildFixture(
  fixtureId: AvanzaGuardedFetchIntentFixtureId,
  label: string,
  expectedStatus: AvanzaGuardedFetchIntentStatus,
  input: BuildAvanzaGuardedFetchIntentInput,
): AvanzaGuardedFetchIntentFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult: buildAvanzaGuardedFetchIntent(input),
  };
}

export const avanzaGuardedFetchIntentFixtures: AvanzaGuardedFetchIntentFixture[] =
  [
    buildFixture(
      "fetch_intent_disabled",
      "Fetch intent disabled by default",
      "fetch_intent_disabled",
      {
        mode: "disabled",
        now: fixtureNow,
      },
    ),
    buildFixture("fetch_intent_hidden", "Fetch intent hidden", "fetch_intent_hidden", {
      fetchIntentEnabled: true,
      mode: "hidden",
      now: fixtureNow,
    }),
    buildFixture("fetch_intent_blocked", "Fetch intent blocked", "fetch_intent_blocked", {
      actionShellModel: readyBuyActionShell,
      apiCallIntent: readyBuyApiCallIntent,
      fetchIntentEnabled: true,
      internalGuard: allowedInternalGuard,
      mode: "internal_preview",
      now: fixtureNow,
      routeAvailability: readyRouteAvailability,
      handoffMetadata: {
        ...safeBuyMetadata,
        quantity: 0,
      },
    }),
    buildFixture("route_unavailable", "Route unavailable", "route_unavailable", {
      actionShellModel: readyBuyActionShell,
      apiCallIntent: readyBuyApiCallIntent,
      fetchIntentEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
    }),
    buildFixture("route_disabled", "Route disabled", "route_disabled", {
      actionShellModel: readyBuyActionShell,
      apiCallIntent: readyBuyApiCallIntent,
      fetchIntentEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
      routeAvailability: disabledRouteAvailability,
    }),
    buildFixture(
      "internal_guard_missing",
      "Internal guard missing",
      "internal_guard_missing",
      {
        actionShellModel: readyBuyActionShell,
        apiCallIntent: readyBuyApiCallIntent,
        fetchIntentEnabled: true,
        mode: "internal_preview",
        now: fixtureNow,
        routeAvailability: readyRouteAvailability,
      },
    ),
    buildFixture(
      "action_shell_unavailable",
      "Action shell unavailable",
      "action_shell_unavailable",
      {
        fetchIntentEnabled: true,
        mode: "internal_preview",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "fetch_intent_ready_internal_disabled",
      "Ready internal disabled metadata",
      "fetch_intent_ready_internal_disabled",
      {
        actionShellModel: readyBuyActionShell,
        apiCallIntent: readyBuyApiCallIntent,
        fetchIntentEnabled: true,
        fetchIntentId: "fetch-intent-ready",
        handoffMetadata: safeBuyMetadata,
        internalGuard: allowedInternalGuard,
        mode: "internal_preview",
        now: fixtureNow,
        routeAvailability: readyRouteAvailability,
      },
    ),
    buildFixture("fetch_intent_failed", "Fetch intent failed", "fetch_intent_failed", {
      actionShellModel: {
        status: "action_shell_error",
      },
      fetchIntentEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
    }),
    buildFixture("unknown", "Unknown route state", "unknown", {
      actionShellModel: readyBuyActionShell,
      apiCallIntent: readyBuyApiCallIntent,
      fetchIntentEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
      routeAvailability: {},
    }),
    buildFixture(
      "safe_buy_internal_preview_intent",
      "Safe BUY internal preview intent",
      "fetch_intent_ready_internal_disabled",
      {
        actionShellModel: readyBuyActionShell,
        apiCallIntent: readyBuyApiCallIntent,
        fetchIntentEnabled: true,
        fetchIntentId: "fetch-intent-preview-buy",
        handoffMetadata: safeBuyMetadata,
        internalGuard: allowedInternalGuard,
        mode: "internal_preview",
        now: fixtureNow,
        routeAvailability: readyRouteAvailability,
      },
    ),
    buildFixture(
      "safe_sell_internal_preview_intent",
      "Safe SELL internal preview intent",
      "fetch_intent_ready_internal_disabled",
      {
        actionShellModel: readySellActionShell,
        apiCallIntent: readySellApiCallIntent,
        fetchIntentEnabled: true,
        fetchIntentId: "fetch-intent-preview-sell",
        handoffMetadata: safeSellMetadata,
        internalGuard: allowedInternalGuard,
        mode: "internal_preview",
        now: fixtureNow,
        routeAvailability: readyRouteAvailability,
      },
    ),
    buildFixture(
      "safe_buy_internal_fetch_intent_disabled",
      "Safe BUY internal fetch intent disabled",
      "fetch_intent_ready_internal_disabled",
      {
        actionShellModel: readyBuyActionShell,
        apiCallIntent: readyBuyApiCallIntent,
        fetchIntentEnabled: true,
        fetchIntentId: "fetch-intent-internal-buy",
        handoffMetadata: safeBuyMetadata,
        internalGuard: {
          allowFetchIntent: true,
        },
        mode: "internal_fetch_intent",
        now: fixtureNow,
        routeAvailability: readyInternalRouteAvailability,
      },
    ),
    buildFixture(
      "safe_sell_internal_fetch_intent_disabled",
      "Safe SELL internal fetch intent disabled",
      "fetch_intent_ready_internal_disabled",
      {
        actionShellModel: readySellActionShell,
        apiCallIntent: readySellApiCallIntent,
        fetchIntentEnabled: true,
        fetchIntentId: "fetch-intent-internal-sell",
        handoffMetadata: safeSellMetadata,
        internalGuard: {
          allowFetchIntent: true,
        },
        mode: "internal_fetch_intent",
        now: fixtureNow,
        routeAvailability: readyInternalRouteAvailability,
      },
    ),
    buildFixture("missing_action_shell", "Missing action shell", "action_shell_unavailable", {
      fetchIntentEnabled: true,
      mode: "internal_fetch_intent",
      now: fixtureNow,
    }),
    buildFixture(
      "missing_route_availability",
      "Missing route availability",
      "route_unavailable",
      {
        actionShellModel: readySellActionShell,
        apiCallIntent: readySellApiCallIntent,
        fetchIntentEnabled: true,
        mode: "internal_fetch_intent",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "disabled_route_availability",
      "Disabled route availability",
      "route_disabled",
      {
        actionShellModel: readySellActionShell,
        apiCallIntent: readySellApiCallIntent,
        fetchIntentEnabled: true,
        mode: "internal_fetch_intent",
        now: fixtureNow,
        routeAvailability: disabledRouteAvailability,
      },
    ),
    buildFixture(
      "missing_internal_guard",
      "Missing internal guard",
      "internal_guard_missing",
      {
        actionShellModel: readySellActionShell,
        apiCallIntent: readySellApiCallIntent,
        fetchIntentEnabled: true,
        mode: "internal_fetch_intent",
        now: fixtureNow,
        routeAvailability: readyInternalRouteAvailability,
      },
    ),
    buildFixture("blocked_action_shell", "Blocked action shell", "fetch_intent_blocked", {
      actionShellModel: blockedActionShell,
      fetchIntentEnabled: true,
      mode: "internal_fetch_intent",
      now: fixtureNow,
    }),
    buildFixture("failed_input", "Failed input", "fetch_intent_failed", {
      actionShellModel: readyBuyActionShell,
      fetchIntentEnabled: true,
      internalGuard: {
        status: "internal_guard_failed",
      },
      mode: "internal_fetch_intent",
      now: fixtureNow,
    }),
    buildFixture("unsafe_input", "Unsafe input", "fetch_intent_blocked", {
      actionShellModel: {
        ...readyBuyActionShell,
        canFetch: true,
      },
      apiCallIntent: readyBuyApiCallIntent,
      fetchIntentEnabled: true,
      internalGuard: allowedInternalGuard,
      mode: "internal_fetch_intent",
      now: fixtureNow,
      routeAvailability: readyInternalRouteAvailability,
    }),
  ];
