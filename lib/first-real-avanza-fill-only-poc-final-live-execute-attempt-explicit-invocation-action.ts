import {
  createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt,
  firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall,
} from "./first-real-avanza-fill-only-poc-final-live-execute-attempt-wrapper";

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionStatus =
  | "final_live_execute_attempt_explicit_invocation_disabled"
  | "final_live_execute_attempt_explicit_invocation_blocked"
  | "ready_for_final_live_execute_attempt_explicit_invocation"
  | "final_live_execute_attempt_explicit_invocation_plan_created"
  | "final_live_execute_attempt_explicit_invocation_aborted";

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput =
  Omit<
    FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput,
    | "final_live_execute_attempt_wrapper_enabled"
    | "operatorExplicitlyRequestedFinalLiveExecuteAttempt"
  > & {
    final_live_execute_attempt_explicit_invocation_action_enabled?: boolean | null;
    operatorExplicitlyRequestedFinalLiveExecuteAttempt?: boolean | null;
    final_live_execute_attempt_execution_gate_snapshot?:
      | "final_live_execute_attempt_execution_gate_ready"
      | string
      | null;
    final_live_execute_attempt_checklist_confirmation_snapshot?:
      | "final_live_execute_attempt_checklist_confirmation_ready"
      | string
      | null;
    final_live_execute_attempt_checklist_snapshot?:
      | "final_live_execute_attempt_checklist_ready"
      | string
      | null;
    final_checklist_confirmation_fresh?: boolean | null;
    final_checklist_confirmation_scope_matches?: boolean | null;
    automatic_or_unattended_mode_requested?: boolean | null;
    sell_stop_loss_or_glidande_requested?: boolean | null;
    runner?: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner | null;
  };

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionResult = {
  status: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionStatus;
  ready_for_final_live_execute_attempt_explicit_invocation: boolean;
  final_live_execute_attempt_explicit_invocation_plan_created: boolean;
  explicit_invocation_action_enabled: boolean;
  ready_status_meaning:
    "ready_for_final_live_execute_attempt_explicit_invocation_does_not_mean_execution_occurred";
  plan_created_meaning:
    "final_live_execute_attempt_explicit_invocation_plan_created_does_not_mean_order_placement";
  blocked_reasons: readonly string[];
  wrapper_status: string | null;
  runner_calls: readonly FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall[];
  plan: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan;
  allowed_runner_methods: readonly (keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner)[];
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

function basePlan(): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan {
  return createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt({
    final_live_execute_attempt_wrapper_enabled: true,
    operatorExplicitlyRequestedFinalLiveExecuteAttempt: true,
    final_execute_attempt_gate_snapshot: "final_execute_attempt_gate_ready",
    execute_checklist_confirmation_snapshot:
      "execute_checklist_confirmation_ready",
    final_live_invocation_execute_checklist_snapshot:
      "final_live_invocation_execute_checklist_ready",
    live_invocation_execution_gate_snapshot:
      "live_invocation_execution_gate_ready",
    immediate_pre_invocation_confirmation_snapshot:
      "immediate_pre_invocation_confirmation_ready",
    final_operator_go_snapshot: "final_operator_go",
    final_pre_run_evidence_snapshot: "final_pre_run_evidence_ready",
    live_invocation_run_attempt_gate_snapshot:
      "live_invocation_run_attempt_gate_ready",
    operator_present: true,
    manual_avanza_login_confirmed: true,
    bankid_2fa_manually_handled: true,
    expected_account: "Valentin Labs KF",
    expected_instrument: "GameStop",
    expected_side: "buy",
    expected_order_mode: "Avancerad/Limit",
    expected_amount_sek: 427.26,
    expected_price_usd: 21.98,
    expected_total_sek: 438.05,
    cap_sek: 1000,
    modal_open: false,
    final_confirm_visible: false,
    bekrafta_kop_visible: false,
    bekrafta_salj_visible: false,
    review_click_requested: false,
    granska_kop_click_requested: false,
    submit_or_order_placement_requested: false,
    credential_or_session_handling_requested: false,
    cookie_or_storage_handling_requested: false,
    unsupported_runner_method_requested: false,
    uncertainty_present: false,
  }).plan;
}

function result(
  status: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionStatus,
  blockedReasons: readonly string[],
  wrapperStatus: string | null = null,
  runnerCalls: readonly FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall[] = [],
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionResult {
  return {
    status,
    ready_for_final_live_execute_attempt_explicit_invocation:
      status === "ready_for_final_live_execute_attempt_explicit_invocation",
    final_live_execute_attempt_explicit_invocation_plan_created:
      status === "final_live_execute_attempt_explicit_invocation_plan_created",
    explicit_invocation_action_enabled:
      status !== "final_live_execute_attempt_explicit_invocation_disabled",
    ready_status_meaning:
      "ready_for_final_live_execute_attempt_explicit_invocation_does_not_mean_execution_occurred",
    plan_created_meaning:
      "final_live_execute_attempt_explicit_invocation_plan_created_does_not_mean_order_placement",
    blocked_reasons: blockedReasons,
    wrapper_status: wrapperStatus,
    runner_calls: runnerCalls,
    plan: basePlan(),
    allowed_runner_methods:
      firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods,
    safety_confirmations: safetyConfirmations,
  };
}

function actionBlockers(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput,
): string[] {
  const blockers: string[] = [];

  if (input.operatorExplicitlyRequestedFinalLiveExecuteAttempt !== true) {
    blockers.push("operator_explicit_trigger:not_ready");
  }

  if (input.operator_present !== true) {
    blockers.push("operator_presence:not_confirmed");
  }

  if (
    input.final_live_execute_attempt_execution_gate_snapshot !==
    "final_live_execute_attempt_execution_gate_ready"
  ) {
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

  if (input.final_checklist_confirmation_fresh !== true) {
    blockers.push("final_checklist_confirmation:freshness_missing_or_stale");
  }

  if (input.final_checklist_confirmation_scope_matches !== true) {
    blockers.push("final_checklist_confirmation:scope_mismatch");
  }

  if (input.automatic_or_unattended_mode_requested === true) {
    blockers.push("automatic_or_unattended_mode:requested");
  }

  if (input.sell_stop_loss_or_glidande_requested === true) {
    blockers.push("sell_stop_loss_or_glidande:requested");
  }

  return blockers;
}

function toWrapperInput(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput {
  return {
    ...input,
    final_live_execute_attempt_wrapper_enabled: true,
    operatorExplicitlyRequestedFinalLiveExecuteAttempt:
      input.operatorExplicitlyRequestedFinalLiveExecuteAttempt,
    runner: input.runner,
  };
}

export function buildFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput {
  return {
    final_live_execute_attempt_explicit_invocation_action_enabled: false,
    ...input,
  };
}

export function runFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationAction(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionInput = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptExplicitInvocationActionResult {
  if (
    input.final_live_execute_attempt_explicit_invocation_action_enabled !== true
  ) {
    return result(
      "final_live_execute_attempt_explicit_invocation_disabled",
      ["final_live_execute_attempt_explicit_invocation_action_disabled"],
    );
  }

  const blockers = actionBlockers(input);

  if (blockers.length > 0) {
    return result("final_live_execute_attempt_explicit_invocation_blocked", blockers);
  }

  const wrapperResult =
    createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(toWrapperInput(input));

  if (wrapperResult.status === "ready_for_final_live_execute_attempt") {
    return result(
      "ready_for_final_live_execute_attempt_explicit_invocation",
      [],
      wrapperResult.status,
      wrapperResult.runner_calls,
    );
  }

  if (wrapperResult.status === "final_live_execute_attempt_plan_created") {
    return result(
      "final_live_execute_attempt_explicit_invocation_plan_created",
      [],
      wrapperResult.status,
      wrapperResult.runner_calls,
    );
  }

  return result(
    "final_live_execute_attempt_explicit_invocation_aborted",
    wrapperResult.blocked_reasons,
    wrapperResult.status,
    wrapperResult.runner_calls,
  );
}
