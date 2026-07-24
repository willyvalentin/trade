import {
  buildAvanzaExecutionArchitectureReadinessMap,
  type AvanzaExecutionArchitectureReadinessItem,
  type AvanzaExecutionArchitectureReadinessMap,
  type AvanzaExecutionArchitectureNextAction,
  type AvanzaExecutionArchitectureSafetyBoundary,
} from "./avanza-execution-architecture-readiness-map";

export type AvanzaExecutionArchitectureReadinessMapFixtureId =
  | "full_current_architecture_checkpoint"
  | "login_stack_readiness_item"
  | "credential_security_readiness_item"
  | "settings_ui_readiness_item"
  | "instrument_search_readiness_item"
  | "order_ticket_readiness_item"
  | "pre_submit_handoff_readiness_item"
  | "settlement_reconciliation_readiness_item"
  | "local_dev_execution_readiness_item"
  | "trade_ui_integration_waiting_item"
  | "api_route_integration_forbidden_item"
  | "safety_governance_item"
  | "production_not_ready"
  | "next_action_real_local_dev_order_search_page_action_binding"
  | "next_action_local_dev_order_chain_smoke_test_harness"
  | "final_kop_salj_forbidden_boundary"
  | "bankid_forbidden_boundary"
  | "no_credential_exposure_boundary"
  | "no_cookies_session_boundary"
  | "disabled_api_route_boundary";

export type AvanzaExecutionArchitectureReadinessMapFixture = {
  fixtureId: AvanzaExecutionArchitectureReadinessMapFixtureId;
  label: string;
  map: AvanzaExecutionArchitectureReadinessMap;
  item?: AvanzaExecutionArchitectureReadinessItem;
  boundary?: AvanzaExecutionArchitectureSafetyBoundary;
  nextAction?: AvanzaExecutionArchitectureNextAction;
  expectedState: string;
};

const map = buildAvanzaExecutionArchitectureReadinessMap();

function itemById(itemId: string) {
  const item = map.items.find((entry) => entry.itemId === itemId);

  if (!item) throw new Error(`Missing readiness item ${itemId}`);

  return item;
}

function boundaryById(boundaryId: string) {
  const boundary = map.safetyBoundaries.find(
    (entry) => entry.boundaryId === boundaryId,
  );

  if (!boundary) throw new Error(`Missing safety boundary ${boundaryId}`);

  return boundary;
}

function actionById(actionId: string) {
  const action = map.nextActions.find((entry) => entry.actionId === actionId);

  if (!action) throw new Error(`Missing next action ${actionId}`);

  return action;
}

export const avanzaExecutionArchitectureReadinessMapFixtures:
  AvanzaExecutionArchitectureReadinessMapFixture[] = [
    {
      fixtureId: "full_current_architecture_checkpoint",
      label: "Full current architecture checkpoint",
      map,
      expectedState: "architecture_checkpoint_model_only",
    },
    {
      fixtureId: "login_stack_readiness_item",
      label: "Login stack readiness item",
      map,
      item: itemById("login_stack_readiness"),
      expectedState: "ready_for_local_dev_binding",
    },
    {
      fixtureId: "credential_security_readiness_item",
      label: "Credential security readiness item",
      map,
      item: itemById("credential_security_readiness"),
      expectedState: "complete_model_only",
    },
    {
      fixtureId: "settings_ui_readiness_item",
      label: "Settings UI readiness item",
      map,
      item: itemById("settings_ui_readiness"),
      expectedState: "complete_model_only",
    },
    {
      fixtureId: "instrument_search_readiness_item",
      label: "Instrument search readiness item",
      map,
      item: itemById("instrument_search_readiness"),
      expectedState: "waiting_for_local_dev_binding",
    },
    {
      fixtureId: "order_ticket_readiness_item",
      label: "Order ticket readiness item",
      map,
      item: itemById("order_ticket_readiness"),
      expectedState: "ready_for_mock",
    },
    {
      fixtureId: "pre_submit_handoff_readiness_item",
      label: "Pre-submit handoff readiness item",
      map,
      item: itemById("pre_submit_handoff_readiness"),
      expectedState: "ready_for_mock",
    },
    {
      fixtureId: "settlement_reconciliation_readiness_item",
      label: "Settlement reconciliation readiness item",
      map,
      item: itemById("settlement_reconciliation_readiness"),
      expectedState: "ready_for_mock",
    },
    {
      fixtureId: "local_dev_execution_readiness_item",
      label: "Local-dev execution readiness item",
      map,
      item: itemById("local_dev_execution_readiness"),
      expectedState: "waiting_for_local_dev_binding",
    },
    {
      fixtureId: "trade_ui_integration_waiting_item",
      label: "Trade UI integration waiting item",
      map,
      item: itemById("trade_ui_integration_waiting"),
      expectedState: "waiting_for_ui_integration",
    },
    {
      fixtureId: "api_route_integration_forbidden_item",
      label: "API route integration forbidden item",
      map,
      item: itemById("api_route_integration_forbidden"),
      expectedState: "forbidden",
    },
    {
      fixtureId: "safety_governance_item",
      label: "Safety governance item",
      map,
      item: itemById("safety_governance_readiness"),
      expectedState: "complete_model_only",
    },
    {
      fixtureId: "production_not_ready",
      label: "Production not ready",
      map,
      item: itemById("production_not_ready"),
      expectedState: "not_ready",
    },
    {
      fixtureId: "next_action_real_local_dev_order_search_page_action_binding",
      label: "Next action: real local-dev order/search page action binding",
      map,
      nextAction: actionById("next_real_local_dev_order_search_page_action_binding"),
      expectedState: "immediate",
    },
    {
      fixtureId: "next_action_local_dev_order_chain_smoke_test_harness",
      label: "Next action: local-dev order chain smoke test harness",
      map,
      nextAction: actionById("next_local_dev_order_chain_smoke_test_harness"),
      expectedState: "next",
    },
    {
      fixtureId: "final_kop_salj_forbidden_boundary",
      label: "final KÖP/SÄLJ forbidden boundary",
      map,
      boundary: boundaryById("final_kop_salj_forbidden_boundary"),
      expectedState: "enforced",
    },
    {
      fixtureId: "bankid_forbidden_boundary",
      label: "BankID forbidden boundary",
      map,
      boundary: boundaryById("bankid_forbidden_boundary"),
      expectedState: "enforced",
    },
    {
      fixtureId: "no_credential_exposure_boundary",
      label: "credential exposure forbidden boundary",
      map,
      boundary: boundaryById("credential_exposure_forbidden_boundary"),
      expectedState: "enforced",
    },
    {
      fixtureId: "no_cookies_session_boundary",
      label: "cookies/session forbidden boundary",
      map,
      boundary: boundaryById("cookies_session_forbidden_boundary"),
      expectedState: "enforced",
    },
    {
      fixtureId: "disabled_api_route_boundary",
      label: "disabled API route boundary",
      map,
      boundary: boundaryById("disabled_api_route_boundary"),
      expectedState: "enforced",
    },
  ];
