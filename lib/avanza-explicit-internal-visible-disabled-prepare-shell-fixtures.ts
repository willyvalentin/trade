import {
  buildAvanzaExplicitInternalVisibleDisabledPrepareShell,
  type AvanzaExplicitInternalVisibleDisabledPrepareShellModel,
  type AvanzaExplicitInternalVisibleDisabledPrepareShellStatus,
  type BuildAvanzaExplicitInternalVisibleDisabledPrepareShellInput,
} from "./avanza-explicit-internal-visible-disabled-prepare-shell";
import {
  avanzaDisabledInternalPrepareButtonShellFixtures,
} from "./avanza-disabled-internal-prepare-button-shell-fixtures";
import {
  buildAvanzaPassiveDisabledPrepareShellComponentModel,
} from "./avanza-passive-disabled-prepare-shell-fixtures";

export type AvanzaExplicitInternalVisibleDisabledPrepareShellFixtureId =
  | "visible_shell_hidden"
  | "visible_shell_disabled"
  | "visible_shell_blocked"
  | "visible_shell_ready_internal_disabled"
  | "visible_shell_error"
  | "visible_shell_unknown"
  | "safe_buy_visible_disabled_shell"
  | "safe_sell_visible_disabled_shell"
  | "hidden_default_shell"
  | "disabled_mode_shell"
  | "blocked_base_shell"
  | "ready_internal_disabled_base_shell"
  | "failed_error_base_shell"
  | "missing_base_shell"
  | "invalid_base_shell";

export type AvanzaExplicitInternalVisibleDisabledPrepareShellFixture = {
  expectedStatus: AvanzaExplicitInternalVisibleDisabledPrepareShellStatus;
  fixtureId: AvanzaExplicitInternalVisibleDisabledPrepareShellFixtureId;
  input: BuildAvanzaExplicitInternalVisibleDisabledPrepareShellInput;
  label: string;
  modelResult: AvanzaExplicitInternalVisibleDisabledPrepareShellModel;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function shellFixtureById(
  id: (typeof avanzaDisabledInternalPrepareButtonShellFixtures)[number]["id"],
) {
  const fixture = avanzaDisabledInternalPrepareButtonShellFixtures.find(
    (item) => item.id === id,
  );

  if (!fixture) {
    throw new Error(`Missing disabled internal prepare shell fixture ${id}`);
  }

  return fixture.result;
}

function inputWithShell(
  shellId: (typeof avanzaDisabledInternalPrepareButtonShellFixtures)[number]["id"],
  visibleShellId: string,
): BuildAvanzaExplicitInternalVisibleDisabledPrepareShellInput {
  const shellModel = shellFixtureById(shellId);

  return {
    baseShellModel: shellModel,
    mode: "internal_visible_disabled",
    now: fixtureNow,
    passiveComponentModel:
      buildAvanzaPassiveDisabledPrepareShellComponentModel(shellModel),
    visibleShellEnabled: true,
    visibleShellId,
  };
}

function buildFixture(
  fixtureId: AvanzaExplicitInternalVisibleDisabledPrepareShellFixtureId,
  label: string,
  expectedStatus: AvanzaExplicitInternalVisibleDisabledPrepareShellStatus,
  input: BuildAvanzaExplicitInternalVisibleDisabledPrepareShellInput,
): AvanzaExplicitInternalVisibleDisabledPrepareShellFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult: buildAvanzaExplicitInternalVisibleDisabledPrepareShell(input),
  };
}

export const avanzaExplicitInternalVisibleDisabledPrepareShellFixtures: AvanzaExplicitInternalVisibleDisabledPrepareShellFixture[] =
  [
    buildFixture(
      "visible_shell_hidden",
      "Visible shell hidden",
      "visible_shell_hidden",
      {
        now: fixtureNow,
      },
    ),
    buildFixture(
      "visible_shell_disabled",
      "Visible shell disabled",
      "visible_shell_disabled",
      {
        mode: "disabled",
        now: fixtureNow,
        visibleShellEnabled: true,
        visibleShellId: "visible-shell-disabled",
      },
    ),
    buildFixture(
      "visible_shell_blocked",
      "Visible shell blocked",
      "visible_shell_blocked",
      inputWithShell("prepare_shell_blocked_prepare_intent", "visible-blocked"),
    ),
    buildFixture(
      "visible_shell_ready_internal_disabled",
      "Visible shell ready internally but disabled",
      "visible_shell_ready_internal_disabled",
      inputWithShell("prepare_shell_ready_internal_buy", "visible-ready-buy"),
    ),
    buildFixture(
      "visible_shell_error",
      "Visible shell error",
      "visible_shell_error",
      inputWithShell("prepare_shell_error_failed_intent", "visible-error"),
    ),
    buildFixture(
      "visible_shell_unknown",
      "Visible shell unknown",
      "unknown",
      inputWithShell("prepare_shell_unknown_intent", "visible-unknown"),
    ),
    buildFixture(
      "safe_buy_visible_disabled_shell",
      "Safe BUY visible disabled shell",
      "visible_shell_ready_internal_disabled",
      inputWithShell("safe_buy_internal_preview_shell", "visible-safe-buy"),
    ),
    buildFixture(
      "safe_sell_visible_disabled_shell",
      "Safe SELL visible disabled shell",
      "visible_shell_ready_internal_disabled",
      inputWithShell("safe_sell_internal_preview_shell", "visible-safe-sell"),
    ),
    buildFixture(
      "hidden_default_shell",
      "Hidden default shell",
      "visible_shell_hidden",
      {
        mode: "hidden",
        now: fixtureNow,
        visibleShellEnabled: false,
        visibleShellId: "visible-hidden-default",
      },
    ),
    buildFixture(
      "disabled_mode_shell",
      "Disabled mode shell",
      "visible_shell_disabled",
      {
        mode: "disabled",
        now: fixtureNow,
        visibleShellEnabled: true,
        visibleShellId: "visible-disabled-mode",
      },
    ),
    buildFixture(
      "blocked_base_shell",
      "Blocked base shell",
      "visible_shell_blocked",
      inputWithShell("prepare_shell_blocked_prepare_intent", "visible-blocked-base"),
    ),
    buildFixture(
      "ready_internal_disabled_base_shell",
      "Ready internal disabled base shell",
      "visible_shell_ready_internal_disabled",
      inputWithShell("prepare_shell_ready_internal_sell", "visible-ready-sell"),
    ),
    buildFixture(
      "failed_error_base_shell",
      "Failed/error base shell",
      "visible_shell_error",
      inputWithShell("prepare_shell_error_failed_intent", "visible-failed-base"),
    ),
    buildFixture(
      "missing_base_shell",
      "Missing base shell",
      "visible_shell_blocked",
      {
        mode: "internal_visible_disabled",
        now: fixtureNow,
        visibleShellEnabled: true,
        visibleShellId: "visible-missing-base",
      },
    ),
    buildFixture(
      "invalid_base_shell",
      "Invalid base shell",
      "visible_shell_blocked",
      {
        baseShellModel: "invalid base shell",
        mode: "internal_visible_disabled",
        now: fixtureNow,
        visibleShellEnabled: true,
        visibleShellId: "visible-invalid-base",
      },
    ),
  ];
