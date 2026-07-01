import {
  runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput,
} from "./first-real-avanza-fill-only-poc-final-live-execute-attempt-explicit-invocation-action";
import {
  firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall,
} from "./first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper";

export const firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerPhrase =
  "FINAL LIVE EXECUTE ATTEMPT EXPLICIT INVOCATION TRIGGER: I explicitly request the final live fill-only execute attempt trigger now, with the approved boundary, stopping before Granska köp and without order placement.";

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerStatus =
  | "final_live_execute_attempt_explicit_invocation_trigger_disabled"
  | "final_live_execute_attempt_explicit_invocation_trigger_blocked"
  | "ready_for_final_live_execute_attempt_explicit_invocation_trigger"
  | "final_live_execute_attempt_explicit_invocation_trigger_plan_created"
  | "final_live_execute_attempt_explicit_invocation_trigger_aborted";

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput =
  Omit<
    FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput,
    | "final_live_execute_attempt_explicit_invocation_action_enabled"
    | "operatorExplicitlyRequestedFinalLiveExecuteAttempt"
  > & {
    final_live_execute_attempt_explicit_invocation_trigger_enabled?:
      | boolean
      | null;
    operatorExplicitlyRequestedFinalLiveExecuteAttemptTrigger?:
      | boolean
      | null;
    exact_trigger_phrase?: string | null;
    final_live_execute_attempt_explicit_invocation_final_gate_snapshot?:
      | "final_live_execute_attempt_explicit_invocation_final_gate_ready"
      | string
      | null;
    final_live_execute_attempt_explicit_invocation_preflight_confirmation_snapshot?:
      | "final_live_execute_attempt_explicit_invocation_preflight_confirmation_ready"
      | string
      | null;
    final_live_execute_attempt_explicit_invocation_preflight_checklist_snapshot?:
      | "final_live_execute_attempt_explicit_invocation_preflight_checklist_ready"
      | string
      | null;
    explicit_invocation_simulation_snapshot?:
      | "first_real_avanza_fill_only_poc_final_live_execute_attempt_explicit_invocation_simulation_added"
      | string
      | null;
    explicit_invocation_action_snapshot?:
      | "first_real_avanza_fill_only_poc_final_live_execute_attempt_explicit_invocation_action_added"
      | string
      | null;
    final_explicit_invocation_preflight_confirmation_fresh?:
      | boolean
      | null;
    final_explicit_invocation_preflight_confirmation_scope_matches?:
      | boolean
      | null;
    ui_route_provider_scanner_package_trigger_requested?: boolean | null;
    review_or_final_or_submit_capability_requested?: boolean | null;
    runner?: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner | null;
  };

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerResult = {
  status: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerStatus;
  ready_for_final_live_execute_attempt_explicit_invocation_trigger: boolean;
  final_live_execute_attempt_explicit_invocation_trigger_plan_created: boolean;
  explicit_invocation_trigger_enabled: boolean;
  ready_status_meaning:
    "ready_for_final_live_execute_attempt_explicit_invocation_trigger_does_not_mean_execution_occurred";
  plan_created_meaning:
    "final_live_execute_attempt_explicit_invocation_trigger_plan_created_does_not_mean_order_placement";
  blocked_reasons: readonly string[];
  action_status: string | null;
  runner_calls: readonly FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall[];
  plan: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan;
  allowed_runner_methods: readonly (keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner)[];
  exact_trigger_phrase_required: typeof firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerPhrase;
  safety_confirmations: {
    disabled_by_default: true;
    explicit_trigger_only: true;
    dependency_injected_runner_only: true;
    no_default_live_runner: true;
    no_browser_or_dom_dependency: true;
    no_avanza_integration_dependency: true;
    no_credentials_or_session_handling: true;
    no_review_click: true;
    no_final_confirm: true;
    no_submit_or_order_placement: true;
    no_sell_stop_loss_or_glidande: true;
    no_external_write_or_scan_dependency: true;
    no_trade_stats_or_pnl_mutation: true;
    stop_before_granska_kop: true;
    not_wired_to_external_trigger_or_scripts: true;
  };
};

const expectedValues = {
  account: "Valentin Labs KF",
  instrument: "GameStop",
  side: "buy",
  orderMode: "Avancerad/Limit",
  amountSek: 427.26,
  priceUsd: 21.98,
  totalSek: 438.05,
  capSek: 1000,
} as const;

const safetyConfirmations = {
  disabled_by_default: true,
  explicit_trigger_only: true,
  dependency_injected_runner_only: true,
  no_default_live_runner: true,
  no_browser_or_dom_dependency: true,
  no_avanza_integration_dependency: true,
  no_credentials_or_session_handling: true,
  no_review_click: true,
  no_final_confirm: true,
  no_submit_or_order_placement: true,
  no_sell_stop_loss_or_glidande: true,
  no_external_write_or_scan_dependency: true,
  no_trade_stats_or_pnl_mutation: true,
  stop_before_granska_kop: true,
  not_wired_to_external_trigger_or_scripts: true,
} as const;

function buildPlan(): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan {
  return {
    mode: "fill_only_stop_before_review",
    account: expectedValues.account,
    instrument: expectedValues.instrument,
    side: expectedValues.side,
    order_mode: expectedValues.orderMode,
    amount_sek: expectedValues.amountSek,
    price_usd: expectedValues.priceUsd,
    expected_total_sek: expectedValues.totalSek,
    cap_sek: expectedValues.capSek,
    stop_point: "before_granska_kop",
    allowed_runner_methods:
      firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
  };
}

function result(
  status: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerStatus,
  blockedReasons: readonly string[],
  actionStatus: string | null = null,
  runnerCalls: readonly FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall[] = [],
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerResult {
  return {
    status,
    ready_for_final_live_execute_attempt_explicit_invocation_trigger:
      status === "ready_for_final_live_execute_attempt_explicit_invocation_trigger",
    final_live_execute_attempt_explicit_invocation_trigger_plan_created:
      status === "final_live_execute_attempt_explicit_invocation_trigger_plan_created",
    explicit_invocation_trigger_enabled:
      status !== "final_live_execute_attempt_explicit_invocation_trigger_disabled",
    ready_status_meaning:
      "ready_for_final_live_execute_attempt_explicit_invocation_trigger_does_not_mean_execution_occurred",
    plan_created_meaning:
      "final_live_execute_attempt_explicit_invocation_trigger_plan_created_does_not_mean_order_placement",
    blocked_reasons: blockedReasons,
    action_status: actionStatus,
    runner_calls: runnerCalls,
    plan: buildPlan(),
    allowed_runner_methods:
      firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
    exact_trigger_phrase_required:
      firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerPhrase,
    safety_confirmations: safetyConfirmations,
  };
}

function numberInput(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function triggerBlockers(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput,
): string[] {
  const blockers: string[] = [];

  if (input.operatorExplicitlyRequestedFinalLiveExecuteAttemptTrigger !== true) {
    blockers.push("operator_explicit_trigger:not_ready");
  }

  if (
    input.exact_trigger_phrase !==
    firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerPhrase
  ) {
    blockers.push("exact_trigger_phrase:missing_or_mismatched");
  }

  if (input.operator_present !== true) {
    blockers.push("operator_presence:not_confirmed");
  }

  if (
    input.final_live_execute_attempt_explicit_invocation_final_gate_snapshot !==
    "final_live_execute_attempt_explicit_invocation_final_gate_ready"
  ) {
    blockers.push("final_live_execute_attempt_explicit_invocation_final_gate:not_ready");
  }

  if (
    input
      .final_live_execute_attempt_explicit_invocation_preflight_confirmation_snapshot !==
    "final_live_execute_attempt_explicit_invocation_preflight_confirmation_ready"
  ) {
    blockers.push(
      "final_live_execute_attempt_explicit_invocation_preflight_confirmation:not_ready",
    );
  }

  if (
    input
      .final_live_execute_attempt_explicit_invocation_preflight_checklist_snapshot !==
    "final_live_execute_attempt_explicit_invocation_preflight_checklist_ready"
  ) {
    blockers.push(
      "final_live_execute_attempt_explicit_invocation_preflight_checklist:not_ready",
    );
  }

  if (
    input.explicit_invocation_simulation_snapshot !==
    "first_real_avanza_fill_only_poc_final_live_execute_attempt_explicit_invocation_simulation_added"
  ) {
    blockers.push("explicit_invocation_simulation:not_ready");
  }

  if (
    input.explicit_invocation_action_snapshot !==
    "first_real_avanza_fill_only_poc_final_live_execute_attempt_explicit_invocation_action_added"
  ) {
    blockers.push("explicit_invocation_action:not_ready");
  }

  if (input.final_explicit_invocation_preflight_confirmation_fresh !== true) {
    blockers.push(
      "final_explicit_invocation_preflight_confirmation:freshness_missing_or_stale",
    );
  }

  if (
    input.final_explicit_invocation_preflight_confirmation_scope_matches !== true
  ) {
    blockers.push(
      "final_explicit_invocation_preflight_confirmation:scope_mismatch",
    );
  }

  if (input.final_live_execute_attempt_execution_gate_snapshot !==
    "final_live_execute_attempt_execution_gate_ready") {
    blockers.push("final_live_execute_attempt_execution_gate:not_ready");
  }

  if (
    input.final_live_execute_attempt_checklist_confirmation_snapshot !==
    "final_live_execute_attempt_checklist_confirmation_ready"
  ) {
    blockers.push("final_live_execute_attempt_checklist_confirmation:not_ready");
  }

  if (
    input.final_live_execute_attempt_checklist_snapshot !==
    "final_live_execute_attempt_checklist_ready"
  ) {
    blockers.push("final_live_execute_attempt_checklist:not_ready");
  }

  if (input.final_execute_attempt_gate_snapshot !== "final_execute_attempt_gate_ready") {
    blockers.push("final_execute_attempt_gate:not_ready");
  }

  if (
    input.execute_checklist_confirmation_snapshot !==
    "execute_checklist_confirmation_ready"
  ) {
    blockers.push("execute_checklist_confirmation:not_ready");
  }

  if (
    input.final_live_invocation_execute_checklist_snapshot !==
    "final_live_invocation_execute_checklist_ready"
  ) {
    blockers.push("final_live_invocation_execute_checklist:not_ready");
  }

  if (
    input.live_invocation_execution_gate_snapshot !==
    "live_invocation_execution_gate_ready"
  ) {
    blockers.push("live_invocation_execution_gate:not_ready");
  }

  if (
    input.immediate_pre_invocation_confirmation_snapshot !==
    "immediate_pre_invocation_confirmation_ready"
  ) {
    blockers.push("immediate_pre_invocation_confirmation:not_ready");
  }

  if (input.final_operator_go_snapshot !== "final_operator_go") {
    blockers.push("final_operator_go:not_ready");
  }

  if (input.final_pre_run_evidence_snapshot !== "final_pre_run_evidence_ready") {
    blockers.push("final_pre_run_evidence:not_ready");
  }

  if (
    input.live_invocation_run_attempt_gate_snapshot !==
    "live_invocation_run_attempt_gate_ready"
  ) {
    blockers.push("live_invocation_run_attempt_gate:not_ready");
  }

  if (input.expected_account !== expectedValues.account) {
    blockers.push("account:mismatch");
  }

  if (input.expected_instrument !== expectedValues.instrument) {
    blockers.push("instrument:mismatch");
  }

  if (input.expected_side !== expectedValues.side) {
    blockers.push("side:not_buy_only");
  }

  if (input.expected_order_mode !== expectedValues.orderMode) {
    blockers.push("order_mode:not_avancerad_limit");
  }

  if (input.expected_amount_sek !== expectedValues.amountSek) {
    blockers.push("amount:mismatch");
  }

  if (input.expected_price_usd !== expectedValues.priceUsd) {
    blockers.push("price:mismatch");
  }

  if (!numberInput(input.cap_sek) || input.cap_sek > expectedValues.capSek) {
    blockers.push("cap:invalid_or_above_1000");
  }

  if (!numberInput(input.expected_total_sek)) {
    blockers.push("total:parse_failure");
  } else if (numberInput(input.cap_sek) && input.expected_total_sek > input.cap_sek) {
    blockers.push("total:above_cap");
  }

  if (input.modal_open !== false) {
    blockers.push("modal_state:open_or_unknown");
  }

  if (input.final_confirm_visible !== false) {
    blockers.push("final_confirm:visible_or_unknown");
  }

  if (input.bekrafta_kop_visible !== false) {
    blockers.push("bekrafta_kop:visible_or_unknown");
  }

  if (input.bekrafta_salj_visible !== false) {
    blockers.push("bekrafta_salj:visible_or_unknown");
  }

  if (input.review_click_requested === true) {
    blockers.push("review_click:requested");
  }

  if (input.granska_kop_click_requested === true) {
    blockers.push("granska_kop_click:requested");
  }

  if (input.submit_or_order_placement_requested === true) {
    blockers.push("submit_or_order_placement:requested");
  }

  if (input.credential_or_session_handling_requested === true) {
    blockers.push("credential_or_session_handling:requested");
  }

  if (input.cookie_or_storage_handling_requested === true) {
    blockers.push("cookie_or_storage_handling:requested");
  }

  if (input.sell_stop_loss_or_glidande_requested === true) {
    blockers.push("sell_stop_loss_or_glidande:requested");
  }

  if (input.automatic_or_unattended_mode_requested === true) {
    blockers.push("automatic_or_unattended_mode:requested");
  }

  if (input.ui_route_provider_scanner_package_trigger_requested === true) {
    blockers.push("ui_route_provider_scanner_package_trigger:requested");
  }

  if (input.review_or_final_or_submit_capability_requested === true) {
    blockers.push("review_or_final_or_submit_capability:requested");
  }

  if (input.unsupported_runner_method_requested === true) {
    blockers.push("unsupported_runner_method:requested");
  }

  if (input.uncertainty_present === true) {
    blockers.push("uncertainty:present");
  }

  return blockers;
}

function toActionInput(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput {
  return {
    ...input,
    final_live_execute_attempt_explicit_invocation_action_enabled: true,
    operatorExplicitlyRequestedFinalLiveExecuteAttempt:
      input.operatorExplicitlyRequestedFinalLiveExecuteAttemptTrigger,
    final_checklist_confirmation_fresh:
      input.final_explicit_invocation_preflight_confirmation_fresh,
    final_checklist_confirmation_scope_matches:
      input.final_explicit_invocation_preflight_confirmation_scope_matches,
    runner: input.runner,
  };
}

export function buildFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput {
  return {
    final_live_execute_attempt_explicit_invocation_trigger_enabled: false,
    ...input,
  };
}

export function runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTrigger(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerInput = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationTriggerResult {
  if (
    input.final_live_execute_attempt_explicit_invocation_trigger_enabled !== true
  ) {
    return result(
      "final_live_execute_attempt_explicit_invocation_trigger_disabled",
      ["final_live_execute_attempt_explicit_invocation_trigger_disabled"],
    );
  }

  const blockers = triggerBlockers(input);

  if (blockers.length > 0) {
    return result(
      "final_live_execute_attempt_explicit_invocation_trigger_blocked",
      blockers,
    );
  }

  if (!input.runner) {
    return result(
      "ready_for_final_live_execute_attempt_explicit_invocation_trigger",
      [],
    );
  }

  const actionResult =
    runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
      toActionInput(input),
    );

  if (
    actionResult.status ===
    "final_live_execute_attempt_explicit_invocation_plan_created"
  ) {
    return result(
      "final_live_execute_attempt_explicit_invocation_trigger_plan_created",
      [],
      actionResult.status,
      actionResult.runner_calls,
    );
  }

  if (actionResult.status === "ready_for_final_live_execute_attempt_explicit_invocation") {
    return result(
      "ready_for_final_live_execute_attempt_explicit_invocation_trigger",
      [],
      actionResult.status,
      actionResult.runner_calls,
    );
  }

  return result(
    "final_live_execute_attempt_explicit_invocation_trigger_aborted",
    actionResult.blocked_reasons,
    actionResult.status,
    actionResult.runner_calls,
  );
}
