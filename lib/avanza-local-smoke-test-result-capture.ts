export type AvanzaLocalSmokeTestArea =
  | "login"
  | "order_prep"
  | "settlement"
  | "full_operator_run"
  | "unknown";

export type AvanzaLocalSmokeTestResultStatus =
  | "not_started"
  | "ready_to_run"
  | "passed"
  | "passed_with_warnings"
  | "failed"
  | "blocked"
  | "unsafe_stop"
  | "manual_review_required"
  | "unknown";

export type AvanzaLocalSmokeTestChecklistItemStatus =
  | "pending"
  | "passed"
  | "failed"
  | "blocked"
  | "not_applicable"
  | "unknown";

export type AvanzaLocalSmokeTestEvidenceKind =
  | "operator_observation"
  | "safe_runner_report"
  | "screenshot_redacted"
  | "log_redacted"
  | "none";

export type AvanzaLocalSmokeTestForbiddenEvidence =
  | "raw_credentials"
  | "cookies"
  | "session_tokens"
  | "account_numbers"
  | "order_ids"
  | "final_click_proof"
  | "unknown";

export type AvanzaLocalSmokeTestChecklistItem = {
  itemId: string;
  area: AvanzaLocalSmokeTestArea;
  label: string;
  description: string;
  required: boolean;
  status: AvanzaLocalSmokeTestChecklistItemStatus;
  evidenceKind: AvanzaLocalSmokeTestEvidenceKind;
  safeEvidenceNote?: string;
  forbiddenEvidence: AvanzaLocalSmokeTestForbiddenEvidence[];
  blockedReason?: string;
  warning?: string;
};

export type AvanzaLocalSmokeTestResultSafetyFlags = {
  resultCaptureOnly: true;
  canRunSmokeTest: false;
  canStoreRawCredentials: false;
  canStoreCookies: false;
  canStoreSessionTokens: false;
  canStoreAccountNumbers: false;
  canStoreOrderIds: false;
  canStoreScreenshotsUnredacted: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canWireTradeUi: false;
  canWireApiRoute: false;
  canWriteSupabase: false;
  canClaimProductionReady: false;
  requiresManualReview: true;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLocalSmokeTestResultCapture = {
  resultId: string;
  createdAt: string;
  area: AvanzaLocalSmokeTestArea;
  status: AvanzaLocalSmokeTestResultStatus;
  label: string;
  summary: string;
  checklist: AvanzaLocalSmokeTestChecklistItem[];
  safeObservations: string[];
  warnings: string[];
  blockedReasons: string[];
  nextRecommendedAction: string;
  safetyFlags: AvanzaLocalSmokeTestResultSafetyFlags;
};

export type AvanzaLocalSmokeTestChecklistInput = {
  area?: AvanzaLocalSmokeTestArea;
  itemStatuses?: Partial<
    Record<string, AvanzaLocalSmokeTestChecklistItemStatus>
  >;
  evidenceNotes?: Partial<Record<string, string>>;
  warnings?: Partial<Record<string, string>>;
  blockedReasons?: Partial<Record<string, string>>;
  forbiddenEvidence?: Partial<
    Record<string, readonly AvanzaLocalSmokeTestForbiddenEvidence[]>
  >;
};

export type AvanzaLocalSmokeTestResultCaptureInput =
  AvanzaLocalSmokeTestChecklistInput & {
    resultId?: string;
    now?: string;
    status?: AvanzaLocalSmokeTestResultStatus;
    label?: string;
    summary?: string;
    safeObservations?: readonly string[];
    warningsList?: readonly string[];
    blockedReasonsList?: readonly string[];
    nextRecommendedAction?: string;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

export const avanzaLocalSmokeTestResultSafetyFlags:
  AvanzaLocalSmokeTestResultSafetyFlags = {
    resultCaptureOnly: true,
    canRunSmokeTest: false,
    canStoreRawCredentials: false,
    canStoreCookies: false,
    canStoreSessionTokens: false,
    canStoreAccountNumbers: false,
    canStoreOrderIds: false,
    canStoreScreenshotsUnredacted: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canWireTradeUi: false,
    canWireApiRoute: false,
    canWriteSupabase: false,
    canClaimProductionReady: false,
    requiresManualReview: true,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };

function item(
  area: AvanzaLocalSmokeTestArea,
  itemId: string,
  label: string,
  description: string,
  evidenceKind: AvanzaLocalSmokeTestEvidenceKind,
): AvanzaLocalSmokeTestChecklistItem {
  return {
    itemId,
    area,
    label,
    description,
    required: true,
    status: "pending",
    evidenceKind,
    forbiddenEvidence: [],
  };
}

const loginItems = [
  item(
    "login",
    "login_local_environment_confirmed",
    "Local environment confirmed",
    "Operator confirms this is a local terminal-only smoke context.",
    "operator_observation",
  ),
  item(
    "login",
    "login_ci_blocked",
    "CI blocked",
    "CI execution remains blocked for login smoke result capture.",
    "safe_runner_report",
  ),
  item(
    "login",
    "login_env_opt_in_confirmed",
    "Env opt-in confirmed",
    "The explicit login smoke env opt-in is confirmed before any separate run.",
    "operator_observation",
  ),
  item(
    "login",
    "login_manual_confirmation_confirmed",
    "Manual confirmation confirmed",
    "The local-only manual confirmation is present before any separate run.",
    "operator_observation",
  ),
  item(
    "login",
    "login_secure_credential_provider_ready",
    "Secure credential provider ready",
    "Credential readiness is observed without exposing values.",
    "operator_observation",
  ),
  item(
    "login",
    "login_username_password_path_used",
    "Username/password path used",
    "Login route follows username/password path when permitted.",
    "operator_observation",
  ),
  item(
    "login",
    "login_bankid_avoided",
    "BankID avoided",
    "BankID automation and bypass remain forbidden.",
    "operator_observation",
  ),
  item(
    "login",
    "login_expected_state_reached",
    "Login reached expected state",
    "Safe runner or operator observation records expected login state.",
    "safe_runner_report",
  ),
  item(
    "login",
    "login_no_credentials_logged",
    "No credentials logged",
    "Result capture stores no credential values.",
    "log_redacted",
  ),
  item(
    "login",
    "login_no_cookies_session_exported",
    "No cookies/session exported",
    "Result capture stores no cookies or session tokens.",
    "operator_observation",
  ),
] as const;

const orderPrepItems = [
  item(
    "order_prep",
    "order_local_environment_confirmed",
    "Local environment confirmed",
    "Operator confirms this is a local terminal-only order-prep context.",
    "operator_observation",
  ),
  item(
    "order_prep",
    "order_execution_package_safe",
    "Execution package safe fixture or redacted test package",
    "Only fixture or redacted package details are used for result capture.",
    "operator_observation",
  ),
  item(
    "order_prep",
    "order_search_opened",
    "Search opened",
    "Safe runner status or observation records the search entry point.",
    "safe_runner_report",
  ),
  item(
    "order_prep",
    "order_instrument_selected",
    "Instrument selected",
    "Safe runner status records instrument selection.",
    "safe_runner_report",
  ),
  item(
    "order_prep",
    "order_instrument_verified",
    "Instrument verified",
    "Safe runner status records instrument verification.",
    "safe_runner_report",
  ),
  item(
    "order_prep",
    "order_buy_sell_entry_located",
    "BUY/SELL entry located",
    "Operator confirms the side entry is located without final action.",
    "operator_observation",
  ),
  item(
    "order_prep",
    "order_fields_prepared",
    "Order fields prepared",
    "Safe runner status records field preparation without revealing values.",
    "safe_runner_report",
  ),
  item(
    "order_prep",
    "order_review_ready_reached",
    "Review-ready reached",
    "Result capture stops at review-ready state.",
    "safe_runner_report",
  ),
  item(
    "order_prep",
    "order_final_buy_sell_not_clicked",
    "Final KOP/SALJ not clicked",
    "The final broker action remains human-only and outside agent control.",
    "operator_observation",
  ),
  item(
    "order_prep",
    "order_not_submitted",
    "Order not submitted",
    "No order submission is performed or captured.",
    "operator_observation",
  ),
  item(
    "order_prep",
    "order_no_account_order_ids_logged",
    "No account/order ids logged",
    "Result capture stores no account numbers or broker order references.",
    "log_redacted",
  ),
] as const;

const settlementItems = [
  item(
    "settlement",
    "settlement_note_path_understood",
    "Avrakningsnota path understood",
    "Operator records that settlement note location is understood.",
    "operator_observation",
  ),
  item(
    "settlement",
    "settlement_no_document_read_yet",
    "No document read yet",
    "No settlement document is read in this capture layer.",
    "operator_observation",
  ),
  item(
    "settlement",
    "settlement_no_ocr",
    "No OCR",
    "No OCR is performed in this capture layer.",
    "operator_observation",
  ),
  item(
    "settlement",
    "settlement_no_extraction",
    "No extraction",
    "No settlement extraction is performed in this capture layer.",
    "operator_observation",
  ),
  item(
    "settlement",
    "settlement_no_reconciliation_write",
    "No reconciliation write",
    "No reconciliation or Supabase execution write is performed.",
    "operator_observation",
  ),
] as const;

const checklistTemplates = [
  ...loginItems,
  ...orderPrepItems,
  ...settlementItems,
] as const;

function cloneItem(
  template: AvanzaLocalSmokeTestChecklistItem,
  input: AvanzaLocalSmokeTestChecklistInput,
): AvanzaLocalSmokeTestChecklistItem {
  const forbiddenEvidence = [
    ...(input.forbiddenEvidence?.[template.itemId] ?? []),
  ];

  return {
    ...template,
    status: input.itemStatuses?.[template.itemId] ?? template.status,
    safeEvidenceNote: input.evidenceNotes?.[template.itemId],
    forbiddenEvidence,
    blockedReason: input.blockedReasons?.[template.itemId],
    warning: input.warnings?.[template.itemId],
  };
}

function matchesArea(
  itemArea: AvanzaLocalSmokeTestArea,
  requestedArea: AvanzaLocalSmokeTestArea,
) {
  if (requestedArea === "full_operator_run") return true;
  if (requestedArea === "unknown") return itemArea === "login";

  return itemArea === requestedArea;
}

export function buildAvanzaLocalSmokeTestChecklist(
  input: AvanzaLocalSmokeTestChecklistInput = {},
): AvanzaLocalSmokeTestChecklistItem[] {
  const area = input.area ?? "full_operator_run";

  return checklistTemplates
    .filter((template) => matchesArea(template.area, area))
    .map((template) => cloneItem(template, input));
}

function hasForbiddenEvidence(items: readonly AvanzaLocalSmokeTestChecklistItem[]) {
  return items.some((item) => item.forbiddenEvidence.length > 0);
}

function inferStatus(
  checklist: readonly AvanzaLocalSmokeTestChecklistItem[],
): AvanzaLocalSmokeTestResultStatus {
  if (hasForbiddenEvidence(checklist)) return "unsafe_stop";
  if (checklist.some((item) => item.status === "failed")) return "failed";
  if (checklist.some((item) => item.status === "blocked")) return "blocked";
  if (checklist.some((item) => item.warning)) return "passed_with_warnings";
  if (checklist.every((item) => item.status === "passed")) return "passed";
  if (checklist.some((item) => item.status === "pending")) return "ready_to_run";

  return "manual_review_required";
}

function safeTextArray(values: unknown): string[] {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        if (typeof value !== "string") return [];
        const text = value.trim();

        return text ? [text] : [];
      })
    : [];
}

function defaultLabel(area: AvanzaLocalSmokeTestArea) {
  if (area === "login") return "Login smoke result capture";
  if (area === "order_prep") return "Order-prep smoke result capture";
  if (area === "settlement") return "Settlement checklist result capture";
  if (area === "full_operator_run") return "Full operator run result capture";

  return "Unknown smoke result capture";
}

function defaultSummary(status: AvanzaLocalSmokeTestResultStatus) {
  if (status === "passed") {
    return "Safe local smoke result is captured without sensitive data.";
  }
  if (status === "passed_with_warnings") {
    return "Safe local smoke result is captured with warnings for manual review.";
  }
  if (status === "failed") return "Safe local smoke result records failure.";
  if (status === "blocked") return "Safe local smoke result records a blocker.";
  if (status === "unsafe_stop") {
    return "Unsafe evidence or action risk was detected; stop immediately.";
  }
  if (status === "manual_review_required") {
    return "Manual review is required before any further local-dev step.";
  }

  return "Local smoke result capture is ready but no smoke test runs here.";
}

function defaultNextAction(status: AvanzaLocalSmokeTestResultStatus) {
  if (status === "unsafe_stop") {
    return "Stop, remove unsafe evidence, and review safety boundaries.";
  }
  if (status === "blocked" || status === "failed") {
    return "Review blocked reasons and rerun only after a separate local gate.";
  }
  if (status === "passed" || status === "passed_with_warnings") {
    return "Keep result as safe evidence; do not claim production readiness.";
  }

  return "Complete the checklist with safe observations only.";
}

export function buildAvanzaLocalSmokeTestResultCapture(
  input: AvanzaLocalSmokeTestResultCaptureInput = {},
): AvanzaLocalSmokeTestResultCapture {
  const area = input.area ?? "full_operator_run";
  const checklist = buildAvanzaLocalSmokeTestChecklist(input);
  const status = input.status ?? inferStatus(checklist);
  const checklistBlockedReasons = checklist.flatMap((item) => [
    ...(item.blockedReason ? [item.blockedReason] : []),
    ...item.forbiddenEvidence.map(
      (evidence) => `Forbidden evidence detected: ${evidence}`,
    ),
  ]);
  const warnings = [
    ...safeTextArray(input.warningsList),
    ...checklist.flatMap((item) => (item.warning ? [item.warning] : [])),
  ];
  const blockedReasons = [
    ...safeTextArray(input.blockedReasonsList),
    ...checklistBlockedReasons,
  ];

  return {
    resultId: input.resultId ?? `avanza-local-smoke-result-${area}`,
    createdAt: input.now ?? defaultCreatedAt,
    area,
    status,
    label: input.label ?? defaultLabel(area),
    summary: input.summary ?? defaultSummary(status),
    checklist,
    safeObservations: safeTextArray(input.safeObservations),
    warnings,
    blockedReasons,
    nextRecommendedAction:
      input.nextRecommendedAction ?? defaultNextAction(status),
    safetyFlags: avanzaLocalSmokeTestResultSafetyFlags,
  };
}
