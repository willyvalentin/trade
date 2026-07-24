import {
  buildAvanzaGuardedApiRouteCallIntent,
  type AvanzaGuardedApiRouteCallIntent,
  type AvanzaGuardedApiRouteCallIntentStatus,
  type BuildAvanzaGuardedApiRouteCallIntentInput,
} from "./avanza-guarded-api-route-call-intent";
import {
  avanzaExplicitInternalVisibleDisabledPrepareShellFixtures,
} from "./avanza-explicit-internal-visible-disabled-prepare-shell-fixtures";
import {
  avanzaTradeUiPrepareIntentFixtures,
} from "./avanza-trade-ui-prepare-intent-fixtures";
import {
  buildAvanzaLocalOnlyApiRouteStubModel,
} from "./avanza-local-only-api-route-stub";

export type AvanzaGuardedApiRouteCallIntentFixtureId =
  | "api_call_intent_disabled"
  | "route_unavailable"
  | "route_disabled"
  | "visible_shell_unavailable"
  | "api_call_ready_internal_disabled"
  | "api_call_blocked"
  | "api_call_failed"
  | "unknown"
  | "safe_buy_internal_preview_intent"
  | "safe_sell_internal_preview_intent"
  | "safe_buy_internal_call_intent_disabled"
  | "safe_sell_internal_call_intent_disabled"
  | "missing_visible_shell"
  | "disabled_route_state"
  | "blocked_visible_shell"
  | "failed_input"
  | "unsafe_input";

export type AvanzaGuardedApiRouteCallIntentFixture = {
  expectedStatus: AvanzaGuardedApiRouteCallIntentStatus;
  fixtureId: AvanzaGuardedApiRouteCallIntentFixtureId;
  input: BuildAvanzaGuardedApiRouteCallIntentInput;
  label: string;
  modelResult: AvanzaGuardedApiRouteCallIntent;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";
const readyBuyRouteState = {
  status: "dry_run_ready_mock",
};
const readySellRouteState = {
  status: "fill_only_ready_mock",
};
const disabledRouteState = buildAvanzaLocalOnlyApiRouteStubModel({
  apiRouteEnabled: false,
  localOnlyEnabled: false,
  mode: "disabled",
});

function visibleShellFixture(
  fixtureId: (typeof avanzaExplicitInternalVisibleDisabledPrepareShellFixtures)[number]["fixtureId"],
) {
  const fixture = avanzaExplicitInternalVisibleDisabledPrepareShellFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing visible shell fixture ${fixtureId}`);
  }

  return fixture.modelResult;
}

function prepareIntentFixture(
  id: (typeof avanzaTradeUiPrepareIntentFixtures)[number]["id"],
) {
  const fixture = avanzaTradeUiPrepareIntentFixtures.find(
    (item) => item.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing prepare intent fixture ${id}`);
  }

  return fixture.result;
}

function buildFixture(
  fixtureId: AvanzaGuardedApiRouteCallIntentFixtureId,
  label: string,
  expectedStatus: AvanzaGuardedApiRouteCallIntentStatus,
  input: BuildAvanzaGuardedApiRouteCallIntentInput,
): AvanzaGuardedApiRouteCallIntentFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult: buildAvanzaGuardedApiRouteCallIntent(input),
  };
}

const safeBuyVisibleShell = visibleShellFixture(
  "safe_buy_visible_disabled_shell",
);
const safeSellVisibleShell = visibleShellFixture(
  "safe_sell_visible_disabled_shell",
);
const blockedVisibleShell = visibleShellFixture("visible_shell_blocked");
const safeBuyPrepareIntent = prepareIntentFixture(
  "prepare_ready_internal_preview_buy",
);
const safeSellPrepareIntent = prepareIntentFixture(
  "prepare_ready_internal_preview_sell",
);

export const avanzaGuardedApiRouteCallIntentFixtures: AvanzaGuardedApiRouteCallIntentFixture[] =
  [
    buildFixture(
      "api_call_intent_disabled",
      "API call intent disabled",
      "api_call_intent_disabled",
      {
        mode: "disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "visible_shell_unavailable",
      "Visible shell unavailable",
      "visible_shell_unavailable",
      {
        apiCallIntentEnabled: true,
        apiRouteState: readyBuyRouteState,
        mode: "internal_preview",
        now: fixtureNow,
      },
    ),
    buildFixture("route_unavailable", "Route unavailable", "route_unavailable", {
      apiCallIntentEnabled: true,
      mode: "internal_preview",
      now: fixtureNow,
      visibleShellModel: safeBuyVisibleShell,
    }),
    buildFixture("route_disabled", "Route disabled", "route_disabled", {
      apiCallIntentEnabled: true,
      apiRouteState: disabledRouteState,
      mode: "internal_preview",
      now: fixtureNow,
      visibleShellModel: safeBuyVisibleShell,
    }),
    buildFixture(
      "api_call_ready_internal_disabled",
      "Ready internal disabled metadata",
      "api_call_ready_internal_disabled",
      {
        apiCallIntentEnabled: true,
        apiCallIntentId: "guarded-api-intent-ready",
        apiRouteState: readyBuyRouteState,
        handoffMetadata: safeBuyVisibleShell,
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntentModel: safeBuyPrepareIntent,
        visibleShellModel: safeBuyVisibleShell,
      },
    ),
    buildFixture("api_call_blocked", "API call blocked", "api_call_blocked", {
      apiCallIntentEnabled: true,
      apiRouteState: readyBuyRouteState,
      handoffMetadata: {
        ...safeBuyVisibleShell,
        quantity: 0,
      },
      mode: "internal_call_intent",
      now: fixtureNow,
      prepareIntentModel: safeBuyPrepareIntent,
      visibleShellModel: safeBuyVisibleShell,
    }),
    buildFixture("api_call_failed", "API call failed", "api_call_failed", {
      apiCallIntentEnabled: true,
      apiRouteState: {
        status: "prepare_failed",
      },
      mode: "internal_call_intent",
      now: fixtureNow,
      visibleShellModel: safeBuyVisibleShell,
    }),
    buildFixture("unknown", "Unknown route state", "unknown", {
      apiCallIntentEnabled: true,
      apiRouteState: {},
      mode: "internal_call_intent",
      now: fixtureNow,
      visibleShellModel: safeBuyVisibleShell,
    }),
    buildFixture(
      "safe_buy_internal_preview_intent",
      "Safe BUY internal preview intent",
      "api_call_ready_internal_disabled",
      {
        apiCallIntentEnabled: true,
        apiCallIntentId: "guarded-api-intent-preview-buy",
        apiRouteState: readyBuyRouteState,
        handoffMetadata: safeBuyVisibleShell,
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntentModel: safeBuyPrepareIntent,
        visibleShellModel: safeBuyVisibleShell,
      },
    ),
    buildFixture(
      "safe_sell_internal_preview_intent",
      "Safe SELL internal preview intent",
      "api_call_ready_internal_disabled",
      {
        apiCallIntentEnabled: true,
        apiCallIntentId: "guarded-api-intent-preview-sell",
        apiRouteState: readySellRouteState,
        handoffMetadata: safeSellVisibleShell,
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntentModel: safeSellPrepareIntent,
        visibleShellModel: safeSellVisibleShell,
      },
    ),
    buildFixture(
      "safe_buy_internal_call_intent_disabled",
      "Safe BUY internal call intent disabled",
      "api_call_ready_internal_disabled",
      {
        apiCallIntentEnabled: true,
        apiCallIntentId: "guarded-api-intent-call-buy",
        apiRouteState: readyBuyRouteState,
        handoffMetadata: safeBuyVisibleShell,
        mode: "internal_call_intent",
        now: fixtureNow,
        prepareIntentModel: safeBuyPrepareIntent,
        visibleShellModel: safeBuyVisibleShell,
      },
    ),
    buildFixture(
      "safe_sell_internal_call_intent_disabled",
      "Safe SELL internal call intent disabled",
      "api_call_ready_internal_disabled",
      {
        apiCallIntentEnabled: true,
        apiCallIntentId: "guarded-api-intent-call-sell",
        apiRouteState: readySellRouteState,
        handoffMetadata: safeSellVisibleShell,
        mode: "internal_call_intent",
        now: fixtureNow,
        prepareIntentModel: safeSellPrepareIntent,
        visibleShellModel: safeSellVisibleShell,
      },
    ),
    buildFixture(
      "missing_visible_shell",
      "Missing visible shell",
      "visible_shell_unavailable",
      {
        apiCallIntentEnabled: true,
        apiRouteState: readyBuyRouteState,
        mode: "internal_call_intent",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "disabled_route_state",
      "Disabled route state",
      "route_disabled",
      {
        apiCallIntentEnabled: true,
        apiRouteState: disabledRouteState,
        mode: "internal_call_intent",
        now: fixtureNow,
        visibleShellModel: safeSellVisibleShell,
      },
    ),
    buildFixture(
      "blocked_visible_shell",
      "Blocked visible shell",
      "api_call_blocked",
      {
        apiCallIntentEnabled: true,
        apiRouteState: readyBuyRouteState,
        mode: "internal_call_intent",
        now: fixtureNow,
        visibleShellModel: blockedVisibleShell,
      },
    ),
    buildFixture("failed_input", "Failed input", "api_call_failed", {
      apiCallIntentEnabled: true,
      apiRouteState: {
        status: "prepare_failed",
      },
      mode: "internal_call_intent",
      now: fixtureNow,
      visibleShellModel: safeSellVisibleShell,
    }),
    buildFixture("unsafe_input", "Unsafe input", "api_call_blocked", {
      apiCallIntentEnabled: true,
      apiRouteState: readyBuyRouteState,
      handoffMetadata: safeBuyVisibleShell,
      mode: "internal_call_intent",
      now: fixtureNow,
      prepareIntentModel: {
        ...safeBuyPrepareIntent,
        canFetch: true,
      },
      visibleShellModel: safeBuyVisibleShell,
    }),
  ];
