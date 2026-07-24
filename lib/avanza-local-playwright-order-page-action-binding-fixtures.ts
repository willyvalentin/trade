import {
  buildAvanzaLocalPlaywrightOrderPageActionBindingState,
  type AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  type AvanzaLocalPlaywrightOrderPageActionBindingState,
  type AvanzaLocalPlaywrightOrderPageActionBindingStatus,
  type AvanzaLocalPlaywrightOrderPageActionType,
} from "./avanza-local-playwright-order-page-action-binding";

export type AvanzaLocalPlaywrightOrderPageActionBindingFixtureId =
  | "disabled_binding"
  | "ready_mock_page_binding"
  | "ready_local_dev_playwright_like_binding"
  | "click_sok_allowed_modeled"
  | "fill_search_input_allowed_modeled_value_hidden"
  | "wait_for_search_results_allowed_modeled"
  | "select_search_result_allowed_modeled"
  | "instrument_verification_snapshot_read_modeled_redacted"
  | "locate_buy_entry_modeled_not_clicked"
  | "locate_sell_entry_modeled_not_clicked"
  | "fill_quantity_modeled_value_hidden"
  | "fill_limit_price_modeled_value_hidden"
  | "wait_for_order_review_modeled"
  | "order_review_snapshot_read_modeled_redacted"
  | "search_fill_blocked_by_config"
  | "search_result_select_blocked_by_config"
  | "order_field_fill_blocked_by_config"
  | "final_buy_sell_click_forbidden"
  | "order_submission_forbidden"
  | "navigation_forbidden"
  | "cookie_session_forbidden"
  | "bankid_automation_forbidden"
  | "action_failed"
  | "error"
  | "unknown";

export type AvanzaLocalPlaywrightOrderPageActionBindingFixture = {
  fixtureId: AvanzaLocalPlaywrightOrderPageActionBindingFixtureId;
  label: string;
  expectedStatus: AvanzaLocalPlaywrightOrderPageActionBindingStatus;
  actionType: AvanzaLocalPlaywrightOrderPageActionType;
  expectedValueUsed: boolean;
  expectedValueVisible: false;
  expectedSnapshotRedacted: boolean;
  input: AvanzaLocalPlaywrightOrderPageActionBindingConfig;
  state: AvanzaLocalPlaywrightOrderPageActionBindingState;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const baseEnabledConfig: AvanzaLocalPlaywrightOrderPageActionBindingConfig = {
  bindingId: "fixture-avanza-local-playwright-order-page-action-binding",
  mode: "local_dev_mock_page",
  enabled: true,
  localDevOnly: true,
  allowClickByText: true,
  allowFillByLabel: true,
  allowFillSearchInput: true,
  allowWaitForSearchResults: true,
  allowSelectSearchResultByText: true,
  allowReadInstrumentVerificationSnapshot: true,
  allowLocateBuySellEntry: true,
  allowFillOrderField: true,
  allowWaitForOrderReviewState: true,
  allowReadOrderReviewSnapshot: true,
  allowAutomaticNavigation: false,
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
  fixtureId: AvanzaLocalPlaywrightOrderPageActionBindingFixtureId,
  label: string,
  expectedStatus: AvanzaLocalPlaywrightOrderPageActionBindingStatus,
  actionType: AvanzaLocalPlaywrightOrderPageActionType,
  input: AvanzaLocalPlaywrightOrderPageActionBindingConfig,
  options: {
    valueUsed?: boolean;
    snapshotRedacted?: boolean;
  } = {},
): AvanzaLocalPlaywrightOrderPageActionBindingFixture {
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
    state: buildAvanzaLocalPlaywrightOrderPageActionBindingState(config),
  };
}

export const avanzaLocalPlaywrightOrderPageActionBindingFixtures:
  AvanzaLocalPlaywrightOrderPageActionBindingFixture[] = [
    buildFixture(
      "disabled_binding",
      "Disabled order/search binding",
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
      "click_sok_allowed_modeled",
      "Click Sök allowed modeled",
      "action_executed",
      "click_by_text",
      baseEnabledConfig,
    ),
    buildFixture(
      "fill_search_input_allowed_modeled_value_hidden",
      "Fill search input allowed modeled with value hidden",
      "action_executed",
      "fill_search_input",
      baseEnabledConfig,
      { valueUsed: true },
    ),
    buildFixture(
      "wait_for_search_results_allowed_modeled",
      "Wait for search results allowed modeled",
      "action_executed",
      "wait_for_search_results",
      baseEnabledConfig,
    ),
    buildFixture(
      "select_search_result_allowed_modeled",
      "Select search result allowed modeled",
      "action_executed",
      "select_search_result_by_text",
      baseEnabledConfig,
    ),
    buildFixture(
      "instrument_verification_snapshot_read_modeled_redacted",
      "Instrument verification snapshot read modeled with redacted safe output",
      "snapshot_read",
      "read_instrument_verification_snapshot",
      baseEnabledConfig,
      { snapshotRedacted: true },
    ),
    buildFixture(
      "locate_buy_entry_modeled_not_clicked",
      "Locate BUY entry modeled but not clicked",
      "action_executed",
      "locate_buy_sell_entry",
      baseEnabledConfig,
    ),
    buildFixture(
      "locate_sell_entry_modeled_not_clicked",
      "Locate SELL entry modeled but not clicked",
      "action_executed",
      "locate_buy_sell_entry",
      baseEnabledConfig,
    ),
    buildFixture(
      "fill_quantity_modeled_value_hidden",
      "Fill quantity modeled with value hidden",
      "action_executed",
      "fill_order_field",
      baseEnabledConfig,
      { valueUsed: true },
    ),
    buildFixture(
      "fill_limit_price_modeled_value_hidden",
      "Fill limit price modeled with value hidden",
      "action_executed",
      "fill_order_field",
      baseEnabledConfig,
      { valueUsed: true },
    ),
    buildFixture(
      "wait_for_order_review_modeled",
      "Wait for order review modeled",
      "action_executed",
      "wait_for_order_review_state",
      baseEnabledConfig,
    ),
    buildFixture(
      "order_review_snapshot_read_modeled_redacted",
      "Order review snapshot read modeled with redacted safe output",
      "order_review_snapshot_read",
      "read_order_review_snapshot",
      baseEnabledConfig,
      { snapshotRedacted: true },
    ),
    buildFixture(
      "search_fill_blocked_by_config",
      "Search fill blocked by config",
      "action_blocked",
      "fill_search_input",
      { ...baseEnabledConfig, allowFillSearchInput: false },
    ),
    buildFixture(
      "search_result_select_blocked_by_config",
      "Search result select blocked by config",
      "action_blocked",
      "select_search_result_by_text",
      { ...baseEnabledConfig, allowSelectSearchResultByText: false },
    ),
    buildFixture(
      "order_field_fill_blocked_by_config",
      "Order field fill blocked by config",
      "action_blocked",
      "fill_order_field",
      { ...baseEnabledConfig, allowFillOrderField: false },
    ),
    buildFixture(
      "final_buy_sell_click_forbidden",
      "Final BUY/SELL click forbidden",
      "blocked",
      "locate_buy_sell_entry",
      {
        ...baseEnabledConfig,
        allowFinalBuyClick: true,
        allowFinalSellClick: true,
        modeledActionStatus: undefined,
      },
    ),
    buildFixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "blocked",
      "wait_for_order_review_state",
      {
        ...baseEnabledConfig,
        allowOrderSubmit: true,
        modeledActionStatus: undefined,
      },
    ),
    buildFixture(
      "navigation_forbidden",
      "Navigation forbidden",
      "blocked",
      "click_by_text",
      {
        ...baseEnabledConfig,
        allowAutomaticNavigation: true,
        modeledActionStatus: undefined,
      },
    ),
    buildFixture(
      "cookie_session_forbidden",
      "Cookie/session forbidden",
      "blocked",
      "read_order_review_snapshot",
      {
        ...baseEnabledConfig,
        allowCookieRead: true,
        allowSessionExport: true,
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
      "action_failed",
      "Action failed",
      "action_failed",
      "fill_order_field",
      baseEnabledConfig,
      { valueUsed: false },
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

export const avanzaLocalPlaywrightOrderPageActionBindingDefaultFixture =
  avanzaLocalPlaywrightOrderPageActionBindingFixtures[0];
