import {
  buildAvanzaDisabledInternalPrepareButtonShell,
  type AvanzaDisabledInternalPrepareButtonShellModel,
  type AvanzaDisabledInternalPrepareButtonShellStatus,
  type BuildAvanzaDisabledInternalPrepareButtonShellInput,
} from "./avanza-disabled-internal-prepare-button-shell";
import {
  buildAvanzaTradeUiPrepareIntent,
} from "./avanza-trade-ui-prepare-intent";

export type AvanzaDisabledInternalPrepareButtonShellFixtureId =
  | "prepare_shell_hidden_default"
  | "prepare_shell_hidden_mode"
  | "prepare_shell_disabled_missing_intent"
  | "prepare_shell_disabled_prepare_intent"
  | "prepare_shell_blocked_prepare_intent"
  | "prepare_shell_ready_internal_buy"
  | "prepare_shell_ready_internal_sell"
  | "prepare_shell_error_failed_intent"
  | "prepare_shell_unknown_intent"
  | "safe_buy_internal_preview_shell"
  | "safe_sell_internal_preview_shell"
  | "invalid_prepare_intent";

export type AvanzaDisabledInternalPrepareButtonShellFixture = {
  expectedStatus: AvanzaDisabledInternalPrepareButtonShellStatus;
  id: AvanzaDisabledInternalPrepareButtonShellFixtureId;
  input: BuildAvanzaDisabledInternalPrepareButtonShellInput;
  label: string;
  result: AvanzaDisabledInternalPrepareButtonShellModel;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function readyPrepareIntent({
  packageId,
  prepareIntentId,
  quantity,
  side,
  sourceRecommendationId,
  ticker,
}: {
  packageId: string;
  prepareIntentId: string;
  quantity: number;
  side: "BUY" | "SELL";
  sourceRecommendationId: string;
  ticker: string;
}) {
  return {
    accountLabel: "ISK fixture",
    limitPrice: side === "BUY" ? 240.5 : 155.25,
    mode: "internal_preview",
    orderType: "LIMIT",
    packageId,
    prepareIntentId,
    quantity,
    side,
    sourceRecommendationId,
    status: "prepare_ready_internal",
    symbol: ticker,
    ticker,
    warnings: ["fixture-only internal preview"],
  };
}

function buildFixture(
  id: AvanzaDisabledInternalPrepareButtonShellFixtureId,
  label: string,
  expectedStatus: AvanzaDisabledInternalPrepareButtonShellStatus,
  input: BuildAvanzaDisabledInternalPrepareButtonShellInput,
): AvanzaDisabledInternalPrepareButtonShellFixture {
  return {
    expectedStatus,
    id,
    input,
    label,
    result: buildAvanzaDisabledInternalPrepareButtonShell(input),
  };
}

export const avanzaDisabledInternalPrepareButtonShellFixtures: AvanzaDisabledInternalPrepareButtonShellFixture[] =
  [
    buildFixture(
      "prepare_shell_hidden_default",
      "Default hidden shell",
      "prepare_shell_hidden",
      {
        now: fixtureNow,
      },
    ),
    buildFixture(
      "prepare_shell_hidden_mode",
      "Explicit hidden mode",
      "prepare_shell_hidden",
      {
        mode: "hidden",
        now: fixtureNow,
        shellEnabled: true,
        shellId: "prepare-shell-hidden-mode",
      },
    ),
    buildFixture(
      "prepare_shell_disabled_missing_intent",
      "Missing prepare intent",
      "prepare_shell_disabled",
      {
        mode: "internal_preview",
        now: fixtureNow,
        shellEnabled: true,
        shellId: "prepare-shell-missing-intent",
      },
    ),
    buildFixture(
      "prepare_shell_disabled_prepare_intent",
      "Disabled prepare intent",
      "prepare_shell_disabled",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: buildAvanzaTradeUiPrepareIntent(),
        shellEnabled: true,
        shellId: "prepare-shell-disabled-intent",
      },
    ),
    buildFixture(
      "prepare_shell_blocked_prepare_intent",
      "Blocked prepare intent",
      "prepare_shell_blocked",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: {
          blockedReasons: ["fixture prepare intent blocked"],
          status: "prepare_blocked",
          warnings: ["fixture blocked before any action"],
        },
        shellEnabled: true,
        shellId: "prepare-shell-blocked-intent",
      },
    ),
    buildFixture(
      "prepare_shell_ready_internal_buy",
      "Ready internal BUY shell",
      "prepare_shell_ready_internal_disabled",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: readyPrepareIntent({
          packageId: "prepare-shell-buy-package",
          prepareIntentId: "prepare-shell-buy-intent",
          quantity: 12,
          side: "BUY",
          sourceRecommendationId: "prepare-shell-buy-source",
          ticker: "GME",
        }),
        shellEnabled: true,
        shellId: "prepare-shell-buy",
      },
    ),
    buildFixture(
      "prepare_shell_ready_internal_sell",
      "Ready internal SELL shell",
      "prepare_shell_ready_internal_disabled",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: readyPrepareIntent({
          packageId: "prepare-shell-sell-package",
          prepareIntentId: "prepare-shell-sell-intent",
          quantity: 5,
          side: "SELL",
          sourceRecommendationId: "prepare-shell-sell-source",
          ticker: "TSLA",
        }),
        shellEnabled: true,
        shellId: "prepare-shell-sell",
      },
    ),
    buildFixture(
      "prepare_shell_error_failed_intent",
      "Failed prepare intent",
      "prepare_shell_error",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: {
          blockedReasons: ["fixture prepare intent failed"],
          status: "prepare_failed",
        },
        shellEnabled: true,
        shellId: "prepare-shell-failed-intent",
      },
    ),
    buildFixture(
      "prepare_shell_unknown_intent",
      "Unknown prepare intent",
      "unknown",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: {
          blockedReasons: ["fixture prepare intent unknown"],
          status: "mystery_status",
        },
        shellEnabled: true,
        shellId: "prepare-shell-unknown-intent",
      },
    ),
    buildFixture(
      "safe_buy_internal_preview_shell",
      "Safe BUY internal preview shell",
      "prepare_shell_ready_internal_disabled",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: readyPrepareIntent({
          packageId: "safe-buy-preview-package",
          prepareIntentId: "safe-buy-preview-intent",
          quantity: 8,
          side: "BUY",
          sourceRecommendationId: "safe-buy-preview-source",
          ticker: "NVDA",
        }),
        shellEnabled: true,
        shellId: "safe-buy-internal-preview-shell",
      },
    ),
    buildFixture(
      "safe_sell_internal_preview_shell",
      "Safe SELL internal preview shell",
      "prepare_shell_ready_internal_disabled",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: readyPrepareIntent({
          packageId: "safe-sell-preview-package",
          prepareIntentId: "safe-sell-preview-intent",
          quantity: 3,
          side: "SELL",
          sourceRecommendationId: "safe-sell-preview-source",
          ticker: "MSFT",
        }),
        shellEnabled: true,
        shellId: "safe-sell-internal-preview-shell",
      },
    ),
    buildFixture(
      "invalid_prepare_intent",
      "Invalid prepare intent",
      "prepare_shell_disabled",
      {
        mode: "internal_preview",
        now: fixtureNow,
        prepareIntent: "invalid prepare intent",
        shellEnabled: true,
        shellId: "prepare-shell-invalid-intent",
      },
    ),
  ];
