export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptStatus =
  | "disabled"
  | "ready_for_final_live_execute_attempt"
  | "final_live_execute_attempt_plan_created"
  | "final_live_execute_attempt_aborted";

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult = {
  ok: boolean;
  evidence_id?: string | null;
  observed_total_amount_sek?: number | null;
  note?: string | null;
};

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner = {
  verifyVisibleOrderFormState: () => FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult;
  fillAmountField: (
    amountSek: number,
  ) => FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult;
  fillPriceField: (
    priceUsd: number,
  ) => FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult;
  readTotalAmount: () => FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult;
  captureEvidence: (
    label: string,
  ) => FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult;
  stopBeforeReview: () => FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult;
};

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall = {
  method: keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner;
  ok: boolean;
  evidence_id: string | null;
  observed_total_amount_sek: number | null;
  note: string | null;
};

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput = {
  final_live_execute_attempt_wrapper_enabled?: boolean | null;
  operatorExplicitlyRequestedFinalLiveExecuteAttempt?: boolean | null;
  final_execute_attempt_gate_snapshot?: "final_execute_attempt_gate_ready" | string | null;
  execute_checklist_confirmation_snapshot?:
    | "execute_checklist_confirmation_ready"
    | string
    | null;
  final_live_invocation_execute_checklist_snapshot?:
    | "final_live_invocation_execute_checklist_ready"
    | string
    | null;
  live_invocation_execution_gate_snapshot?:
    | "live_invocation_execution_gate_ready"
    | string
    | null;
  immediate_pre_invocation_confirmation_snapshot?:
    | "immediate_pre_invocation_confirmation_ready"
    | string
    | null;
  final_operator_go_snapshot?: "final_operator_go" | string | null;
  final_pre_run_evidence_snapshot?: "final_pre_run_evidence_ready" | string | null;
  live_invocation_run_attempt_gate_snapshot?:
    | "live_invocation_run_attempt_gate_ready"
    | string
    | null;
  operator_present?: boolean | null;
  manual_avanza_login_confirmed?: boolean | null;
  bankid_2fa_manually_handled?: boolean | null;
  expected_account?: string | null;
  expected_instrument?: string | null;
  expected_side?: "buy" | string | null;
  expected_order_mode?: "Avancerad/Limit" | string | null;
  expected_amount_sek?: number | null;
  expected_price_usd?: number | null;
  expected_total_sek?: number | null;
  cap_sek?: number | null;
  modal_open?: boolean | null;
  final_confirm_visible?: boolean | null;
  bekrafta_kop_visible?: boolean | null;
  bekrafta_salj_visible?: boolean | null;
  review_click_requested?: boolean | null;
  granska_kop_click_requested?: boolean | null;
  submit_or_order_placement_requested?: boolean | null;
  credential_or_session_handling_requested?: boolean | null;
  cookie_or_storage_handling_requested?: boolean | null;
  unsupported_runner_method_requested?: boolean | null;
  uncertainty_present?: boolean | null;
  runner?: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner | null;
};

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan = {
  mode: "fill_only_stop_before_review";
  account: "Valentin Labs KF";
  instrument: "GameStop";
  side: "buy";
  order_mode: "Avancerad/Limit";
  amount_sek: 427.26;
  price_usd: 21.98;
  expected_total_sek: 438.05;
  cap_sek: 1000;
  stop_point: "before_granska_kop";
  allowed_runner_methods: readonly (keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner)[];
};

export type FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptResult = {
  status: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptStatus;
  ready_for_final_live_execute_attempt: boolean;
  final_live_execute_attempt_plan_created: boolean;
  final_live_execute_attempt_wrapper_enabled: boolean;
  ready_status_meaning:
    "ready_for_final_live_execute_attempt_does_not_mean_execution_occurred";
  plan_created_meaning:
    "final_live_execute_attempt_plan_created_does_not_mean_order_placement";
  blocked_reasons: readonly string[];
  runner_calls: readonly FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall[];
  plan: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan;
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
    no_supabase_provider_route_scan_or_audit_writer: true;
    no_trade_stats_or_pnl_mutation: true;
    stop_before_granska_kop: true;
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

export const firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptAllowedRunnerMethods =
  [
    "verifyVisibleOrderFormState",
    "fillAmountField",
    "fillPriceField",
    "readTotalAmount",
    "captureEvidence",
    "stopBeforeReview",
  ] as const satisfies readonly (keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner)[];

export const firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptForbiddenRunnerMethodNames =
  [
    "clickReview",
    "clickGranskaKop",
    "openReviewModal",
    "clickConfirm",
    "clickBekraftaKop",
    "clickBekraftaSalj",
    "submitOrder",
    "placeOrder",
    "confirmOrder",
  ] as const;

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
  no_supabase_provider_route_scan_or_audit_writer: true,
  no_trade_stats_or_pnl_mutation: true,
  stop_before_granska_kop: true,
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
  status: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptStatus,
  blockedReasons: readonly string[],
  runnerCalls: readonly FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall[] = [],
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptResult {
  return {
    status,
    ready_for_final_live_execute_attempt:
      status === "ready_for_final_live_execute_attempt",
    final_live_execute_attempt_plan_created:
      status === "final_live_execute_attempt_plan_created",
    final_live_execute_attempt_wrapper_enabled: status !== "disabled",
    ready_status_meaning:
      "ready_for_final_live_execute_attempt_does_not_mean_execution_occurred",
    plan_created_meaning:
      "final_live_execute_attempt_plan_created_does_not_mean_order_placement",
    blocked_reasons: blockedReasons,
    runner_calls: runnerCalls,
    plan: buildPlan(),
    safety_confirmations: safetyConfirmations,
  };
}

function normalizeRunnerResult(
  method: keyof FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
  runnerResult: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerResult,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunnerCall {
  return {
    method,
    ok: runnerResult.ok,
    evidence_id: runnerResult.evidence_id ?? null,
    observed_total_amount_sek: runnerResult.observed_total_amount_sek ?? null,
    note: runnerResult.note ?? null,
  };
}

function numberInput(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasUnsupportedRunnerMethod(
  runner: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
): boolean {
  return firstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptForbiddenRunnerMethodNames.some(
    (method) => method in runner,
  );
}

function inputBlockers(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput,
): string[] {
  const blockers: string[] = [];

  if (input.operatorExplicitlyRequestedFinalLiveExecuteAttempt !== true) {
    blockers.push("operator_explicit_trigger:not_ready");
  }

  if (input.operator_present !== true) {
    blockers.push("operator_presence:not_confirmed");
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

  if (input.manual_avanza_login_confirmed !== true) {
    blockers.push("manual_avanza_login:not_confirmed");
  }

  if (input.bankid_2fa_manually_handled !== true) {
    blockers.push("bankid_2fa:not_manually_handled");
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

  if (input.unsupported_runner_method_requested === true) {
    blockers.push("unsupported_runner_method:requested");
  }

  if (input.uncertainty_present === true) {
    blockers.push("uncertainty:present");
  }

  if (input.runner && hasUnsupportedRunnerMethod(input.runner)) {
    blockers.push("unsupported_runner_method:present");
  }

  return blockers;
}

function runInjectedRunner(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput,
  runner: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptRunner,
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptResult {
  const verifyCall = normalizeRunnerResult(
    "verifyVisibleOrderFormState",
    runner.verifyVisibleOrderFormState(),
  );

  if (!verifyCall.ok) {
    return result("final_live_execute_attempt_aborted", [
      "runner:visible_state_mismatch",
    ], [verifyCall]);
  }

  const amountCall = normalizeRunnerResult(
    "fillAmountField",
    runner.fillAmountField(input.expected_amount_sek ?? expectedValues.amountSek),
  );

  if (!amountCall.ok) {
    return result("final_live_execute_attempt_aborted", [
      "runner:amount_fill_failed",
    ], [verifyCall, amountCall]);
  }

  const priceCall = normalizeRunnerResult(
    "fillPriceField",
    runner.fillPriceField(input.expected_price_usd ?? expectedValues.priceUsd),
  );

  if (!priceCall.ok) {
    return result("final_live_execute_attempt_aborted", [
      "runner:price_fill_failed",
    ], [verifyCall, amountCall, priceCall]);
  }

  const totalCall = normalizeRunnerResult("readTotalAmount", runner.readTotalAmount());

  if (!totalCall.ok || !numberInput(totalCall.observed_total_amount_sek)) {
    return result("final_live_execute_attempt_aborted", [
      "runner:total_parse_failure",
    ], [verifyCall, amountCall, priceCall, totalCall]);
  }

  if (numberInput(input.cap_sek) && totalCall.observed_total_amount_sek > input.cap_sek) {
    return result("final_live_execute_attempt_aborted", [
      "runner:total_above_cap",
    ], [verifyCall, amountCall, priceCall, totalCall]);
  }

  const evidenceCall = normalizeRunnerResult(
    "captureEvidence",
    runner.captureEvidence("final_live_execute_attempt_stop_before_review"),
  );

  if (!evidenceCall.ok) {
    return result("final_live_execute_attempt_aborted", [
      "runner:evidence_capture_failed",
    ], [verifyCall, amountCall, priceCall, totalCall, evidenceCall]);
  }

  const stopCall = normalizeRunnerResult("stopBeforeReview", runner.stopBeforeReview());
  const runnerCalls = [
    verifyCall,
    amountCall,
    priceCall,
    totalCall,
    evidenceCall,
    stopCall,
  ];

  if (!stopCall.ok) {
    return result("final_live_execute_attempt_aborted", [
      "runner:stop_before_review_failed",
    ], runnerCalls);
  }

  return result("final_live_execute_attempt_plan_created", [], runnerCalls);
}

export function createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt(
  input: FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptInput = {},
): FirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptResult {
  if (input.final_live_execute_attempt_wrapper_enabled !== true) {
    return result("disabled", ["final_live_execute_attempt_wrapper_disabled"]);
  }

  const blockers = inputBlockers(input);

  if (blockers.length > 0) {
    return result("final_live_execute_attempt_aborted", blockers);
  }

  if (!input.runner) {
    return result("ready_for_final_live_execute_attempt", []);
  }

  return runInjectedRunner(input, input.runner);
}

export const createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttemptPlan =
  createFirstRealAvanzaFillOnlyPocFinalLiveExecuteAttempt;
