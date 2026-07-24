import {
  buildAvanzaExplicitInternalDisabledActionShell,
  type AvanzaExplicitInternalDisabledActionShellModel,
  type AvanzaExplicitInternalDisabledActionShellStatus,
  type BuildAvanzaExplicitInternalDisabledActionShellInput,
} from "./avanza-explicit-internal-disabled-action-shell";
import {
  avanzaGuardedApiRouteCallIntentFixtures,
} from "./avanza-guarded-api-route-call-intent-fixtures";

export type AvanzaExplicitInternalDisabledActionShellFixtureId =
  | "action_shell_hidden"
  | "action_shell_disabled"
  | "action_shell_blocked"
  | "action_shell_ready_internal_disabled"
  | "action_shell_error"
  | "unknown"
  | "disabled_shell_with_disabled_api_call_intent"
  | "blocked_shell_with_blocked_api_call_intent"
  | "ready_internal_disabled_shell_safe_buy_intent"
  | "ready_internal_disabled_shell_safe_sell_intent"
  | "error_shell_with_failed_input"
  | "hidden_shell_by_default"
  | "disabled_mode"
  | "internal_disabled_mode"
  | "missing_api_call_intent"
  | "unsafe_input";

export type AvanzaExplicitInternalDisabledActionShellFixture = {
  expectedStatus: AvanzaExplicitInternalDisabledActionShellStatus;
  fixtureId: AvanzaExplicitInternalDisabledActionShellFixtureId;
  input: BuildAvanzaExplicitInternalDisabledActionShellInput;
  label: string;
  modelResult: AvanzaExplicitInternalDisabledActionShellModel;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function apiCallIntentFixture(
  fixtureId: (typeof avanzaGuardedApiRouteCallIntentFixtures)[number]["fixtureId"],
) {
  const fixture = avanzaGuardedApiRouteCallIntentFixtures.find(
    (item) => item.fixtureId === fixtureId,
  );

  if (!fixture) {
    throw new Error(`Missing guarded API route call intent fixture ${fixtureId}`);
  }

  return fixture.modelResult;
}

function buildFixture(
  fixtureId: AvanzaExplicitInternalDisabledActionShellFixtureId,
  label: string,
  expectedStatus: AvanzaExplicitInternalDisabledActionShellStatus,
  input: BuildAvanzaExplicitInternalDisabledActionShellInput,
): AvanzaExplicitInternalDisabledActionShellFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult: buildAvanzaExplicitInternalDisabledActionShell(input),
  };
}

const disabledApiCallIntent = apiCallIntentFixture("api_call_intent_disabled");
const blockedApiCallIntent = apiCallIntentFixture("api_call_blocked");
const failedApiCallIntent = apiCallIntentFixture("api_call_failed");
const safeBuyApiCallIntent = apiCallIntentFixture(
  "safe_buy_internal_preview_intent",
);
const safeSellApiCallIntent = apiCallIntentFixture(
  "safe_sell_internal_preview_intent",
);

export const avanzaExplicitInternalDisabledActionShellFixtures: AvanzaExplicitInternalDisabledActionShellFixture[] =
  [
    buildFixture(
      "action_shell_hidden",
      "Action shell hidden",
      "action_shell_hidden",
      {
        now: fixtureNow,
      },
    ),
    buildFixture(
      "action_shell_disabled",
      "Action shell disabled",
      "action_shell_disabled",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-disabled",
        mode: "disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "action_shell_blocked",
      "Action shell blocked",
      "action_shell_blocked",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-blocked",
        apiCallIntent: blockedApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "action_shell_ready_internal_disabled",
      "Action shell ready internally disabled",
      "action_shell_ready_internal_disabled",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-ready-internal-disabled",
        apiCallIntent: safeBuyApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "action_shell_error",
      "Action shell error",
      "action_shell_error",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-error",
        apiCallIntent: failedApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture("unknown", "Action shell unknown", "unknown", {
      actionShellEnabled: true,
      actionShellId: "action-shell-unknown",
      apiCallIntent: {
        apiCallIntentId: "guarded-api-intent-unrecognized",
        status: "unrecognized_api_call_intent_status",
      },
      mode: "internal_disabled",
      now: fixtureNow,
    }),
    buildFixture(
      "disabled_shell_with_disabled_api_call_intent",
      "Disabled shell with disabled API call intent",
      "action_shell_disabled",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-disabled-api-intent",
        apiCallIntent: disabledApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "blocked_shell_with_blocked_api_call_intent",
      "Blocked shell with blocked API call intent",
      "action_shell_blocked",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-blocked-api-intent",
        apiCallIntent: blockedApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "ready_internal_disabled_shell_safe_buy_intent",
      "Ready internal disabled shell with safe BUY intent",
      "action_shell_ready_internal_disabled",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-safe-buy",
        apiCallIntent: safeBuyApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "ready_internal_disabled_shell_safe_sell_intent",
      "Ready internal disabled shell with safe SELL intent",
      "action_shell_ready_internal_disabled",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-safe-sell",
        apiCallIntent: safeSellApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "error_shell_with_failed_input",
      "Error shell with failed input",
      "action_shell_error",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-failed-input",
        apiCallIntent: failedApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "hidden_shell_by_default",
      "Hidden shell by default",
      "action_shell_hidden",
      {
        actionShellEnabled: false,
        actionShellId: "action-shell-hidden-default",
        mode: "hidden",
        now: fixtureNow,
      },
    ),
    buildFixture("disabled_mode", "Disabled mode", "action_shell_disabled", {
      actionShellEnabled: true,
      actionShellId: "action-shell-disabled-mode",
      mode: "disabled",
      now: fixtureNow,
    }),
    buildFixture(
      "internal_disabled_mode",
      "Internal disabled mode",
      "action_shell_ready_internal_disabled",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-internal-disabled-mode",
        apiCallIntent: safeSellApiCallIntent,
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture(
      "missing_api_call_intent",
      "Missing API call intent",
      "action_shell_blocked",
      {
        actionShellEnabled: true,
        actionShellId: "action-shell-missing-intent",
        mode: "internal_disabled",
        now: fixtureNow,
      },
    ),
    buildFixture("unsafe_input", "Unsafe input", "action_shell_blocked", {
      actionShellEnabled: true,
      actionShellId: "action-shell-unsafe",
      apiCallIntent: {
        ...safeBuyApiCallIntent,
        accountLabel: "Account id 123456",
        canFetch: true,
        token: "secret-token",
      },
      mode: "internal_disabled",
      now: fixtureNow,
    }),
  ];
