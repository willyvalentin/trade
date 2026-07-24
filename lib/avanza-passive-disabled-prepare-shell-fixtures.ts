import type {
  AvanzaDisabledInternalPrepareButtonShellModel,
  AvanzaDisabledInternalPrepareButtonShellStatus,
} from "./avanza-disabled-internal-prepare-button-shell";
import {
  avanzaDisabledInternalPrepareButtonShellFixtures,
} from "./avanza-disabled-internal-prepare-button-shell-fixtures";

export type AvanzaPassiveDisabledPrepareShellComponentStatus =
  | "shell_component_hidden"
  | "shell_component_disabled"
  | "shell_component_blocked"
  | "shell_component_ready_internal_disabled"
  | "shell_component_error";

export type AvanzaPassiveDisabledPrepareShellFixtureId =
  | "passive_shell_hidden"
  | "passive_shell_disabled"
  | "passive_shell_blocked"
  | "passive_shell_ready_internal_disabled"
  | "passive_shell_error"
  | "passive_shell_safe_buy_internal_disabled"
  | "passive_shell_safe_sell_internal_disabled"
  | "passive_shell_missing_shell_model"
  | "passive_shell_invalid_shell_model";

export type AvanzaPassiveDisabledPrepareShellComponentModel = {
  accountLabel?: string;
  blockedReasons: string[];
  canCallApiRoute: false;
  canCallBridge: false;
  canClickConfirm: false;
  canClickPrepare: false;
  canClickReview: false;
  canControlBrowser: false;
  canFetchLocalhost: false;
  canFillForm: false;
  canHandleCredentials: false;
  canReadBankId: false;
  canReadCookies: false;
  canRenderComponent: boolean;
  canSubmitOrder: false;
  canWriteSupabaseExecution: false;
  componentEnabled: false;
  controlsEnabled: false;
  finalHumanClickRequired: true;
  gateLocked: true;
  label: string;
  limitPrice?: number;
  orderType?: string;
  quantity?: number;
  reason: string;
  side?: "BUY" | "SELL";
  sourceShellStatus?: AvanzaDisabledInternalPrepareButtonShellStatus;
  status: AvanzaPassiveDisabledPrepareShellComponentStatus;
  symbol?: string;
  ticker?: string;
  userMustConfirm: true;
  warnings: string[];
};

export type AvanzaPassiveDisabledPrepareShellFixture = {
  expectedStatus: AvanzaPassiveDisabledPrepareShellComponentStatus;
  fixtureId: AvanzaPassiveDisabledPrepareShellFixtureId;
  label: string;
  modelResult: AvanzaPassiveDisabledPrepareShellComponentModel;
  shellModel?: AvanzaDisabledInternalPrepareButtonShellModel;
};

function isShellModel(
  value: unknown,
): value is AvanzaDisabledInternalPrepareButtonShellModel {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "label" in value &&
    "reason" in value &&
    "canClickPrepare" in value &&
    "canCallApiRoute" in value &&
    "canCallBridge" in value &&
    "canFetchLocalhost" in value &&
    "canSubmitOrder" in value
  );
}

function mapShellStatus(
  status: AvanzaDisabledInternalPrepareButtonShellStatus,
): AvanzaPassiveDisabledPrepareShellComponentStatus {
  if (status === "prepare_shell_hidden") {
    return "shell_component_hidden";
  }

  if (status === "prepare_shell_disabled") {
    return "shell_component_disabled";
  }

  if (status === "prepare_shell_blocked") {
    return "shell_component_blocked";
  }

  if (status === "prepare_shell_ready_internal_disabled") {
    return "shell_component_ready_internal_disabled";
  }

  return "shell_component_error";
}

function passiveSafetyFlags({
  canRenderComponent,
}: {
  canRenderComponent: boolean;
}) {
  return {
    canCallApiRoute: false,
    canCallBridge: false,
    canClickConfirm: false,
    canClickPrepare: false,
    canClickReview: false,
    canControlBrowser: false,
    canFetchLocalhost: false,
    canFillForm: false,
    canHandleCredentials: false,
    canReadBankId: false,
    canReadCookies: false,
    canRenderComponent,
    canSubmitOrder: false,
    canWriteSupabaseExecution: false,
    componentEnabled: false,
    controlsEnabled: false,
    finalHumanClickRequired: true,
    gateLocked: true,
    userMustConfirm: true,
  } as const;
}

export function buildAvanzaPassiveDisabledPrepareShellComponentModel(
  shellModel: unknown,
): AvanzaPassiveDisabledPrepareShellComponentModel {
  if (!isShellModel(shellModel)) {
    return {
      ...passiveSafetyFlags({ canRenderComponent: false }),
      blockedReasons: ["shell model unavailable or invalid"],
      label: "Passive disabled prepare shell unavailable",
      reason:
        "No explicit safe disabled internal prepare shell model was provided, so the passive component remains hidden and cannot prepare, call an API route, call a bridge, fetch localhost, control a browser, fill, review, confirm, submit, or place an order.",
      status: shellModel === undefined
        ? "shell_component_hidden"
        : "shell_component_error",
      warnings: [],
    };
  }

  const status = mapShellStatus(shellModel.status);

  return {
    ...(shellModel.accountLabel
      ? { accountLabel: shellModel.accountLabel }
      : {}),
    ...(shellModel.limitPrice ? { limitPrice: shellModel.limitPrice } : {}),
    ...(shellModel.orderType ? { orderType: shellModel.orderType } : {}),
    ...(shellModel.quantity ? { quantity: shellModel.quantity } : {}),
    ...(shellModel.side ? { side: shellModel.side } : {}),
    ...(shellModel.symbol ? { symbol: shellModel.symbol } : {}),
    ...(shellModel.ticker ? { ticker: shellModel.ticker } : {}),
    ...passiveSafetyFlags({ canRenderComponent: shellModel.canRenderShell }),
    blockedReasons: shellModel.blockedReasons,
    label: shellModel.label,
    reason: shellModel.reason,
    sourceShellStatus: shellModel.status,
    status,
    warnings: shellModel.warnings,
  };
}

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

function buildFixture(
  fixtureId: AvanzaPassiveDisabledPrepareShellFixtureId,
  label: string,
  expectedStatus: AvanzaPassiveDisabledPrepareShellComponentStatus,
  shellModel?: unknown,
): AvanzaPassiveDisabledPrepareShellFixture {
  const modelResult =
    buildAvanzaPassiveDisabledPrepareShellComponentModel(shellModel);

  return {
    expectedStatus,
    fixtureId,
    label,
    modelResult,
    ...(isShellModel(shellModel) ? { shellModel } : {}),
  };
}

export const avanzaPassiveDisabledPrepareShellFixtures: AvanzaPassiveDisabledPrepareShellFixture[] =
  [
    buildFixture(
      "passive_shell_hidden",
      "Hidden passive prepare shell",
      "shell_component_hidden",
      shellFixtureById("prepare_shell_hidden_default"),
    ),
    buildFixture(
      "passive_shell_disabled",
      "Disabled passive prepare shell",
      "shell_component_disabled",
      shellFixtureById("prepare_shell_disabled_prepare_intent"),
    ),
    buildFixture(
      "passive_shell_blocked",
      "Blocked passive prepare shell",
      "shell_component_blocked",
      shellFixtureById("prepare_shell_blocked_prepare_intent"),
    ),
    buildFixture(
      "passive_shell_ready_internal_disabled",
      "Ready internal passive prepare shell remains disabled",
      "shell_component_ready_internal_disabled",
      shellFixtureById("prepare_shell_ready_internal_buy"),
    ),
    buildFixture(
      "passive_shell_error",
      "Errored passive prepare shell",
      "shell_component_error",
      shellFixtureById("prepare_shell_error_failed_intent"),
    ),
    buildFixture(
      "passive_shell_safe_buy_internal_disabled",
      "Safe BUY passive internal disabled shell",
      "shell_component_ready_internal_disabled",
      shellFixtureById("safe_buy_internal_preview_shell"),
    ),
    buildFixture(
      "passive_shell_safe_sell_internal_disabled",
      "Safe SELL passive internal disabled shell",
      "shell_component_ready_internal_disabled",
      shellFixtureById("safe_sell_internal_preview_shell"),
    ),
    buildFixture(
      "passive_shell_missing_shell_model",
      "Missing passive shell model",
      "shell_component_hidden",
    ),
    buildFixture(
      "passive_shell_invalid_shell_model",
      "Invalid passive shell model",
      "shell_component_error",
      "invalid passive shell model",
    ),
  ];
