import {
  buildAvanzaLocalPlaywrightPageActionBindingState,
  type AvanzaLocalPlaywrightPageActionBindingConfig,
  type AvanzaLocalPlaywrightPageActionBindingState,
  type AvanzaLocalPlaywrightPageActionBindingStatus,
  type AvanzaLocalPlaywrightPageActionType,
} from "./avanza-local-playwright-page-action-binding";

export type AvanzaLocalPlaywrightPageActionBindingFixtureId =
  | "disabled_binding"
  | "ready_mock_page_binding"
  | "ready_local_dev_playwright_like_binding"
  | "click_by_text_allowed_modeled"
  | "fill_by_label_allowed_modeled_value_hidden"
  | "wait_for_state_allowed_modeled"
  | "read_page_snapshot_allowed_modeled_redacted"
  | "click_blocked_by_config"
  | "fill_blocked_by_config"
  | "snapshot_read_blocked_by_config"
  | "action_failed"
  | "navigation_forbidden"
  | "cookie_session_forbidden"
  | "final_buy_sell_forbidden"
  | "bankid_automation_forbidden"
  | "order_submission_forbidden"
  | "error"
  | "unknown";

export type AvanzaLocalPlaywrightPageActionBindingFixture = {
  fixtureId: AvanzaLocalPlaywrightPageActionBindingFixtureId;
  label: string;
  expectedStatus: AvanzaLocalPlaywrightPageActionBindingStatus;
  actionType: AvanzaLocalPlaywrightPageActionType;
  expectedValueUsed: boolean;
  expectedValueVisible: false;
  expectedSnapshotRedacted: boolean;
  input: AvanzaLocalPlaywrightPageActionBindingConfig;
  state: AvanzaLocalPlaywrightPageActionBindingState;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseEnabledConfig: AvanzaLocalPlaywrightPageActionBindingConfig = {
  bindingId: "fixture-avanza-local-playwright-page-action-binding",
  mode: "local_dev_mock_page",
  enabled: true,
  localDevOnly: true,
  allowClickByText: true,
  allowFillByLabel: true,
  allowWaitForState: true,
  allowReadPageSnapshot: true,
  allowNavigation: false,
  allowCookieRead: false,
  allowSessionExport: false,
  allowOrderSubmit: false,
  allowFinalBuyClick: false,
  allowFinalSellClick: false,
  allowBankIdAutomation: false,
  redactSnapshotText: true,
  now: fixtureNow,
};

function buildFixture(
  fixtureId: AvanzaLocalPlaywrightPageActionBindingFixtureId,
  label: string,
  expectedStatus: AvanzaLocalPlaywrightPageActionBindingStatus,
  actionType: AvanzaLocalPlaywrightPageActionType,
  input: AvanzaLocalPlaywrightPageActionBindingConfig,
  options: {
    valueUsed?: boolean;
    snapshotRedacted?: boolean;
  } = {},
): AvanzaLocalPlaywrightPageActionBindingFixture {
  const config = {
    ...input,
    bindingId: `fixture-${fixtureId}`,
    modeledActionStatus: expectedStatus,
    modeledActionType: actionType,
    modeledValueUsed: options.valueUsed === true,
    modeledSnapshotRedacted: options.snapshotRedacted === true,
  };

  return {
    fixtureId,
    label,
    expectedStatus,
    actionType,
    expectedValueUsed: options.valueUsed === true,
    expectedValueVisible: false,
    expectedSnapshotRedacted:
      options.snapshotRedacted === true || config.redactSnapshotText !== false,
    input: config,
    state: buildAvanzaLocalPlaywrightPageActionBindingState(config),
  };
}

export const avanzaLocalPlaywrightPageActionBindingFixtures:
  AvanzaLocalPlaywrightPageActionBindingFixture[] = [
    buildFixture(
      "disabled_binding",
      "Disabled binding",
      "disabled",
      "click_by_text",
      {
        ...baseEnabledConfig,
        enabled: false,
        mode: "disabled",
        modeledActionStatus: undefined,
      },
    ),
    buildFixture(
      "ready_mock_page_binding",
      "Ready mock page binding",
      "ready",
      "click_by_text",
      baseEnabledConfig,
    ),
    buildFixture(
      "ready_local_dev_playwright_like_binding",
      "Ready local-dev Playwright-like binding",
      "ready",
      "click_by_text",
      { ...baseEnabledConfig, mode: "local_dev_playwright_page" },
    ),
    buildFixture(
      "click_by_text_allowed_modeled",
      "clickByText allowed modeled",
      "action_executed",
      "click_by_text",
      baseEnabledConfig,
    ),
    buildFixture(
      "fill_by_label_allowed_modeled_value_hidden",
      "fillByLabel allowed modeled with value hidden",
      "action_executed",
      "fill_by_label",
      baseEnabledConfig,
      { valueUsed: true },
    ),
    buildFixture(
      "wait_for_state_allowed_modeled",
      "waitForState allowed modeled",
      "action_executed",
      "wait_for_state",
      baseEnabledConfig,
    ),
    buildFixture(
      "read_page_snapshot_allowed_modeled_redacted",
      "readPageSnapshot allowed modeled with redacted safe output",
      "snapshot_read",
      "read_page_snapshot",
      baseEnabledConfig,
      { snapshotRedacted: true },
    ),
    buildFixture(
      "click_blocked_by_config",
      "Click blocked by config",
      "action_blocked",
      "click_by_text",
      { ...baseEnabledConfig, allowClickByText: false },
    ),
    buildFixture(
      "fill_blocked_by_config",
      "Fill blocked by config",
      "action_blocked",
      "fill_by_label",
      { ...baseEnabledConfig, allowFillByLabel: false },
    ),
    buildFixture(
      "snapshot_read_blocked_by_config",
      "Snapshot read blocked by config",
      "action_blocked",
      "read_page_snapshot",
      { ...baseEnabledConfig, allowReadPageSnapshot: false },
    ),
    buildFixture(
      "action_failed",
      "Action failed",
      "action_failed",
      "click_by_text",
      baseEnabledConfig,
    ),
    buildFixture(
      "navigation_forbidden",
      "Navigation forbidden",
      "blocked",
      "click_by_text",
      { ...baseEnabledConfig, allowNavigation: true, modeledActionStatus: undefined },
    ),
    buildFixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "blocked",
      "read_page_snapshot",
      {
        ...baseEnabledConfig,
        allowCookieRead: true,
        allowSessionExport: true,
        modeledActionStatus: undefined,
      },
    ),
    buildFixture(
      "final_buy_sell_forbidden",
      "Final BUY/SELL forbidden",
      "blocked",
      "click_by_text",
      {
        ...baseEnabledConfig,
        allowFinalBuyClick: true,
        allowFinalSellClick: true,
        modeledActionStatus: undefined,
      },
    ),
    buildFixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "blocked",
      "click_by_text",
      {
        ...baseEnabledConfig,
        allowBankIdAutomation: true,
        modeledActionStatus: undefined,
      },
    ),
    buildFixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "blocked",
      "click_by_text",
      {
        ...baseEnabledConfig,
        allowOrderSubmit: true,
        modeledActionStatus: undefined,
      },
    ),
    buildFixture("error", "Binding error", "error", "click_by_text", {
      ...baseEnabledConfig,
      forceError: true,
      modeledActionStatus: undefined,
    }),
    buildFixture("unknown", "Binding unknown", "unknown", "click_by_text", {
      ...baseEnabledConfig,
      statusOverride: "unknown",
      modeledActionStatus: undefined,
    }),
  ];

export const avanzaLocalPlaywrightPageActionBindingDefaultFixture =
  avanzaLocalPlaywrightPageActionBindingFixtures[0];
